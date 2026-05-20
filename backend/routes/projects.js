const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { getDb } = require('../db/database');
const { authenticate } = require('../middleware/auth');

// Helper: get user's role in a project
function getUserRole(db, projectId, userId) {
  const member = db
    .prepare('SELECT role FROM project_members WHERE project_id = ? AND user_id = ?')
    .get(projectId, userId);
  return member ? member.role : null;
}

// GET /api/projects - list all projects current user is member of
router.get('/', authenticate, (req, res) => {
  const db = getDb();
  const projects = db
    .prepare(`
      SELECT p.*, pm.role, u.name as creator_name,
        (SELECT COUNT(*) FROM project_members WHERE project_id = p.id) as member_count,
        (SELECT COUNT(*) FROM tasks WHERE project_id = p.id) as task_count
      FROM projects p
      JOIN project_members pm ON pm.project_id = p.id AND pm.user_id = ?
      JOIN users u ON u.id = p.creator_id
      ORDER BY p.created_at DESC
    `)
    .all(req.user.id);

  res.json({ projects });
});

// POST /api/projects - create a project
router.post(
  '/',
  authenticate,
  [
    body('name').trim().notEmpty().withMessage('Project name is required'),
    body('description').optional().trim(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, description } = req.body;
    const db = getDb();

    const result = db
      .prepare('INSERT INTO projects (name, description, creator_id) VALUES (?, ?, ?)')
      .run(name, description || null, req.user.id);

    // Creator becomes Admin
    db.prepare('INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, ?)').run(
      result.lastInsertRowid,
      req.user.id,
      'Admin'
    );

    const project = db
      .prepare('SELECT * FROM projects WHERE id = ?')
      .get(result.lastInsertRowid);

    res.status(201).json({ project: { ...project, role: 'Admin' } });
  }
);

// GET /api/projects/:id - single project details
router.get('/:id', authenticate, (req, res) => {
  const db = getDb();
  const { id } = req.params;

  const role = getUserRole(db, id, req.user.id);
  if (!role) return res.status(403).json({ error: 'Access denied' });

  const project = db
    .prepare(`
      SELECT p.*, u.name as creator_name
      FROM projects p JOIN users u ON u.id = p.creator_id
      WHERE p.id = ?
    `)
    .get(id);

  if (!project) return res.status(404).json({ error: 'Project not found' });

  const members = db
    .prepare(`
      SELECT u.id, u.name, u.email, pm.role, pm.joined_at
      FROM project_members pm
      JOIN users u ON u.id = pm.user_id
      WHERE pm.project_id = ?
      ORDER BY pm.role DESC, u.name
    `)
    .all(id);

  res.json({ project: { ...project, role }, members });
});

// PUT /api/projects/:id - update project (Admin only)
router.put(
  '/:id',
  authenticate,
  [body('name').optional().trim().notEmpty()],
  (req, res) => {
    const db = getDb();
    const { id } = req.params;
    const role = getUserRole(db, id, req.user.id);

    if (role !== 'Admin') return res.status(403).json({ error: 'Admin only' });

    const { name, description } = req.body;
    db.prepare('UPDATE projects SET name = COALESCE(?, name), description = COALESCE(?, description) WHERE id = ?').run(
      name || null,
      description !== undefined ? description : null,
      id
    );

    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
    res.json({ project });
  }
);

// DELETE /api/projects/:id (Admin only)
router.delete('/:id', authenticate, (req, res) => {
  const db = getDb();
  const { id } = req.params;
  const role = getUserRole(db, id, req.user.id);

  if (role !== 'Admin') return res.status(403).json({ error: 'Admin only' });

  db.prepare('DELETE FROM projects WHERE id = ?').run(id);
  res.json({ message: 'Project deleted' });
});

// POST /api/projects/:id/members - add member (Admin only)
router.post('/:id/members', authenticate, (req, res) => {
  const db = getDb();
  const { id } = req.params;
  const role = getUserRole(db, id, req.user.id);

  if (role !== 'Admin') return res.status(403).json({ error: 'Admin only' });

  const { email, memberRole } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  const user = db.prepare('SELECT id, name, email FROM users WHERE email = ?').get(email);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const existing = db
    .prepare('SELECT id FROM project_members WHERE project_id = ? AND user_id = ?')
    .get(id, user.id);
  if (existing) return res.status(409).json({ error: 'User already a member' });

  db.prepare('INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, ?)').run(
    id,
    user.id,
    memberRole === 'Admin' ? 'Admin' : 'Member'
  );

  res.status(201).json({ message: 'Member added', user: { ...user, role: memberRole || 'Member' } });
});

// DELETE /api/projects/:id/members/:userId - remove member (Admin only)
router.delete('/:id/members/:userId', authenticate, (req, res) => {
  const db = getDb();
  const { id, userId } = req.params;
  const role = getUserRole(db, id, req.user.id);

  if (role !== 'Admin') return res.status(403).json({ error: 'Admin only' });
  if (parseInt(userId) === req.user.id) return res.status(400).json({ error: 'Cannot remove yourself' });

  db.prepare('DELETE FROM project_members WHERE project_id = ? AND user_id = ?').run(id, userId);
  res.json({ message: 'Member removed' });
});

module.exports = router;
