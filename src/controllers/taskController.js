function publicTask(task) {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status,
    created_at: task.created_at,
    updated_at: task.updated_at,
  };
}

function createTask(database) {
  return function create(req, res) {
    const now = new Date().toISOString();
    const description = typeof req.body.description === "string"
      ? req.body.description
      : null;
    const status = req.body.status || "pending";

    const result = database.prepare(`
      INSERT INTO tasks (user_id, title, description, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(req.userId, req.body.title.trim(), description, status, now, now);

    const task = database.prepare(`
      SELECT id, title, description, status, created_at, updated_at
      FROM tasks
      WHERE id = ? AND user_id = ?
    `).get(result.lastInsertRowid, req.userId);

    return res.status(201).json({
      message: "Task created successfully",
      task: publicTask(task),
    });
  };
}

function getTasks(database) {
  return function getAll(req, res) {
    const tasks = database.prepare(`
      SELECT id, title, description, status, created_at, updated_at
      FROM tasks
      WHERE user_id = ?
      ORDER BY id DESC
    `).all(req.userId);

    return res.status(200).json({
      count: tasks.length,
      tasks: tasks.map(publicTask),
    });
  };
}

function getTask(database) {
  return function getOne(req, res) {
    const task = database.prepare(`
      SELECT id, title, description, status, created_at, updated_at
      FROM tasks
      WHERE id = ? AND user_id = ?
    `).get(req.params.id, req.userId);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    return res.status(200).json({ task: publicTask(task) });
  };
}

function updateTask(database) {
  return function update(req, res) {
    const existing = database.prepare(`
      SELECT id FROM tasks WHERE id = ? AND user_id = ?
    `).get(req.params.id, req.userId);

    if (!existing) {
      return res.status(404).json({ message: "Task not found" });
    }

    const fields = [];
    const values = [];
    if (Object.prototype.hasOwnProperty.call(req.body, "title")) {
      fields.push("title = ?");
      values.push(req.body.title.trim());
    }
    if (Object.prototype.hasOwnProperty.call(req.body, "description")) {
      fields.push("description = ?");
      values.push(typeof req.body.description === "string" ? req.body.description : null);
    }
    if (Object.prototype.hasOwnProperty.call(req.body, "status")) {
      fields.push("status = ?");
      values.push(req.body.status);
    }

    fields.push("updated_at = ?");
    values.push(new Date().toISOString());
    values.push(req.params.id, req.userId);

    database.prepare(`
      UPDATE tasks
      SET ${fields.join(", ")}
      WHERE id = ? AND user_id = ?
    `).run(...values);

    const task = database.prepare(`
      SELECT id, title, description, status, created_at, updated_at
      FROM tasks
      WHERE id = ? AND user_id = ?
    `).get(req.params.id, req.userId);

    return res.status(200).json({
      message: "Task updated successfully",
      task: publicTask(task),
    });
  };
}

function deleteTask(database) {
  return function remove(req, res) {
    const result = database.prepare(`
      DELETE FROM tasks WHERE id = ? AND user_id = ?
    `).run(req.params.id, req.userId);

    if (result.changes === 0) {
      return res.status(404).json({ message: "Task not found" });
    }

    return res.status(200).json({ message: "Task deleted successfully" });
  };
}

module.exports = { createTask, getTasks, getTask, updateTask, deleteTask };
