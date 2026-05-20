const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { getDb } = require('../db/database');
const { authenticate } = require('../middleware/auth');

function getUserRole(db, projectId, userId) {
  const member = db
    .prepare('SELECT role FROM project_members WHERE project_id = ? AND user_id = ?')
    .get(projectId, userId);
  return member ? member.role : null;
}

// GET /api/tasks?projectId=x - list tasks in a project
router.get('/', authenticate, (req, res) => {
  const db = getDb();
  const { projectId } = req.query;

  if (!projectId) return res.status(400).json({ error: 'projectId is required' });

  const role = getUserRole(db, projectId, req.user.id);
  if (!role) return res.status(403).json({ error: 'Access denied' });

  let query = `
    SELECT t.*, 
      u1.name as created_by_name,
      u2.name as assigned_to_name,
      u2.email as assigned_to_email
    FROM tasks t
    JOIN users u1 ON u1.id = t.created_by
    LEFT JOIN users u2 ON u2.id = t.assigned_to
    WHERE t.project_id = ?
  `;

  const params = [projectId];

  // Members only see tasks assigned to them OR created by them
  if (role === 'Member') {
    query += ' AND (t.assigned_to = ? OR t.created_by = ?)';
    params.push(req.user.id, req.user.id);
  }

  query += ' ORDER BY t.created_at DESC';

  const tasks = db.prepare(query).all(...params);
  res.json({ tasks });
});

// POST /api/tasks - create task (Admin only for project)
router.post(
  '/',
  authenticate,
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('projectId').notEmpty().withMessage('Project ID is required'),
    body('priority').optional().isIn(['Low', 'Medium', 'High', 'Critical']),
    body('status').optional().isIn(['To Do', 'In Progress', 'Done']),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const db = getDb();
    const { title, description, due_date, priority, projectId, assigned_to } = req.body;

    const role = getUserRole(db, projectId, req.user.id);
    if (!role) return res.status(403).json({ error: 'Access denied' });
    if (role !== 'Admin') return res.status(403).json({ error: 'Only admins can create tasks' });

    // Validate assigned_to is a project member
    if (assigned_to) {
      const assigneeRole = getUserRole(db, projectId, assigned_to);
      if (!assigneeRole) return res.status(400).json({ error: 'Assigned user is not a project member' });
    }

    const result = db
      .prepare(`
        INSERT INTO tasks (title, description, due_date, priority, project_id, created_by, assigned_to)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `)
      .run(
        title,
        description || null,
        due_date || null,
        priority || 'Medium',
        projectId,
        req.user.id,
        assigned_to || null
      );

    const task = db
      .prepare(`
        SELECT t.*, u1.name as created_by_name, u2.name as assigned_to_name
        FROM tasks t
        JOIN users u1 ON u1.id = t.created_by
        LEFT JOIN users u2 ON u2.id = t.assigned_to
        WHERE t.id = ?
      `)
      .get(result.lastInsertRowid);

    res.status(201).json({ task });
  }
);

// GET /api/tasks/:id
router.get('/:id', authenticate, (req, res) => {
  const db = getDb();
  const task = db
    .prepare(`
      SELECT t.*, u1.name as created_by_name, u2.name as assigned_to_name
      FROM tasks t
      JOIN users u1 ON u1.id = t.created_by
      LEFT JOIN users u2 ON u2.id = t.assigned_to
      WHERE t.id = ?
    `)
    .get(req.params.id);

  if (!task) return res.status(404).json({ error: 'Task not found' });

  const role = getUserRole(db, task.project_id, req.user.id);
  if (!role) return res.status(403).json({ error: 'Access denied' });

  res.json({ task });
});

// PUT /api/tasks/:id - update task
router.put(
  '/:id',
  authenticate,
  [
    body('status').optional().isIn(['To Do', 'In Progress', 'Done']),
    body('priority').optional().isIn(['Low', 'Medium', 'High', 'Critical']),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const db = getDb();
    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const role = getUserRole(db, task.project_id, req.user.id);
    if (!role) return res.status(403).json({ error: 'Access denied' });

    const { title, description, due_date, priority, status, assigned_to } = req.body;

    // Members can only update status of their own tasks
    if (role === 'Member') {
      if (task.assigned_to !== req.user.id && task.created_by !== req.user.id) {
        return res.status(403).json({ error: 'You can only update your own tasks' });
      }
      if (title || description || due_date || priority || assigned_to !== undefined) {
        return res.status(403).json({ error: 'Members can only update task status' });
      }
    }

    db.prepare(`
      UPDATE tasks SET
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        due_date = COALESCE(?, due_date),
        priority = COALESCE(?, priority),
        status = COALESCE(?, status),
        assigned_to = CASE WHEN ? IS NOT NULL THEN ? ELSE assigned_to END,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      title || null,
      description || null,
      due_date || null,
      priority || null,
      status || null,
      assigned_to !== undefined ? assigned_to : null,
      assigned_to !== undefined ? assigned_to : null,
      req.params.id
    );

    const updated = db
      .prepare(`
        SELECT t.*, u1.name as created_by_name, u2.name as assigned_to_name
        FROM tasks t
        JOIN users u1 ON u1.id = t.created_by
        LEFT JOIN users u2 ON u2.id = t.assigned_to
        WHERE t.id = ?
      `)
      .get(req.params.id);

    res.json({ task: updated });
  }
);

// DELETE /api/tasks/:id (Admin only)
router.delete('/:id', authenticate, (req, res) => {
  const db = getDb();
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });

  const role = getUserRole(db, task.project_id, req.user.id);
  if (role !== 'Admin') return res.status(403).json({ error: 'Admin only' });

  db.prepare('DELETE FROM tasks WHERE id = ?').run(req.params.id);
  res.json({ message: 'Task deleted' });
});

module.exports = router;
