const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');
const { authenticate } = require('../middleware/auth');

// GET /api/dashboard?projectId=x
router.get('/', authenticate, (req, res) => {
  const db = getDb();
  const { projectId } = req.query;

  if (!projectId) {
    // Global dashboard: all tasks across user's projects
    const memberProjects = db
      .prepare('SELECT project_id FROM project_members WHERE user_id = ?')
      .all(req.user.id)
      .map(r => r.project_id);

    if (!memberProjects.length) {
      return res.json({
        total: 0, byStatus: {}, byUser: [], overdue: 0, recentTasks: []
      });
    }

    const placeholders = memberProjects.map(() => '?').join(',');

    const total = db
      .prepare(`SELECT COUNT(*) as count FROM tasks WHERE project_id IN (${placeholders})`)
      .get(...memberProjects).count;

    const byStatus = db
      .prepare(`SELECT status, COUNT(*) as count FROM tasks WHERE project_id IN (${placeholders}) GROUP BY status`)
      .all(...memberProjects);

    const byUser = db
      .prepare(`
        SELECT u.name, u.id, COUNT(t.id) as task_count
        FROM tasks t
        JOIN users u ON u.id = t.assigned_to
        WHERE t.project_id IN (${placeholders})
        GROUP BY t.assigned_to
        ORDER BY task_count DESC
      `)
      .all(...memberProjects);

    const today = new Date().toISOString().split('T')[0];
    const overdue = db
      .prepare(`
        SELECT COUNT(*) as count FROM tasks
        WHERE project_id IN (${placeholders})
        AND due_date < ? AND status != 'Done'
      `)
      .get(...memberProjects, today).count;

    const recentTasks = db
      .prepare(`
        SELECT t.*, u.name as assigned_to_name, p.name as project_name
        FROM tasks t
        LEFT JOIN users u ON u.id = t.assigned_to
        JOIN projects p ON p.id = t.project_id
        WHERE t.project_id IN (${placeholders})
        ORDER BY t.updated_at DESC LIMIT 10
      `)
      .all(...memberProjects);

    return res.json({
      total,
      byStatus: Object.fromEntries(byStatus.map(s => [s.status, s.count])),
      byUser,
      overdue,
      recentTasks
    });
  }

  // Project-specific dashboard
  const role = db
    .prepare('SELECT role FROM project_members WHERE project_id = ? AND user_id = ?')
    .get(projectId, req.user.id);

  if (!role) return res.status(403).json({ error: 'Access denied' });

  const total = db
    .prepare('SELECT COUNT(*) as count FROM tasks WHERE project_id = ?')
    .get(projectId).count;

  const byStatus = db
    .prepare('SELECT status, COUNT(*) as count FROM tasks WHERE project_id = ? GROUP BY status')
    .all(projectId);

  const byPriority = db
    .prepare('SELECT priority, COUNT(*) as count FROM tasks WHERE project_id = ? GROUP BY priority')
    .all(projectId);

  const byUser = db
    .prepare(`
      SELECT u.name, u.id, COUNT(t.id) as task_count
      FROM tasks t
      JOIN users u ON u.id = t.assigned_to
      WHERE t.project_id = ?
      GROUP BY t.assigned_to
      ORDER BY task_count DESC
    `)
    .all(projectId);

  const today = new Date().toISOString().split('T')[0];
  const overdue = db
    .prepare(`SELECT COUNT(*) as count FROM tasks WHERE project_id = ? AND due_date < ? AND status != 'Done'`)
    .get(projectId, today).count;

  res.json({
    total,
    byStatus: Object.fromEntries(byStatus.map(s => [s.status, s.count])),
    byPriority: Object.fromEntries(byPriority.map(s => [s.priority, s.count])),
    byUser,
    overdue,
  });
});

module.exports = router;
