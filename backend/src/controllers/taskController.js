const db = require('../db/database');

// 1. Get all boards with their columns
exports.getBoardData = (req, res) => {
    db.all("SELECT * FROM boards", [], (err, boards) => {
        if (err) return res.status(500).json({ error: err.message });
        
        db.all("SELECT * FROM columns ORDER BY position ASC", [], (err, columns) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ boards, columns });
        });
    });
};

// 2. Get Tasks (Includes Custom Query: Filter by priority, newest first)
exports.getTasks = (req, res) => {
    const { priority } = req.query;
    
    if (priority) {
        // Custom Query 1 requirement: Tasks with a given priority, ordered by newest first
        const sql = `SELECT * FROM tasks WHERE priority = ? ORDER BY created_at DESC`;
        db.all(sql, [priority], (err, tasks) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ tasks });
        });
    } else {
        db.all("SELECT * FROM tasks", [], (err, tasks) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ tasks });
        });
    }
};

// 3. Get Task Counts Per Column (Custom Query 2 requirement)
exports.getTaskCounts = (req, res) => {
    const sql = `SELECT column_id, COUNT(*) as task_count FROM tasks GROUP BY column_id`;
    db.all(sql, [], (err, counts) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ counts });
    });
};

// 4. Create a Task (Includes Validation requirement)
exports.createTask = (req, res) => {
    const { column_id, title, description, priority } = req.body;

    // STRICT VALIDATION: Backend MUST reject tasks with an empty title
    if (!title || title.trim() === '') {
        return res.status(400).json({ error: 'Title cannot be empty.' });
    }

    const sql = `INSERT INTO tasks (column_id, title, description, priority) VALUES (?, ?, ?, ?)`;
    const params = [column_id, title.trim(), description || '', priority || 'Medium'];

    db.run(sql, params, function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id: this.lastID, column_id, title, description, priority });
    });
};

// 5. Update/Move a Task
exports.updateTask = (req, res) => {
    const { id } = req.params;
    const { column_id, title, description, priority } = req.body;

    if (title !== undefined && title.trim() === '') {
        return res.status(400).json({ error: 'Title cannot be empty.' });
    }

    const sql = `UPDATE tasks SET column_id = COALESCE(?, column_id), title = COALESCE(?, title), 
                 description = COALESCE(?, description), priority = COALESCE(?, priority) WHERE id = ?`;
    
    db.run(sql, [column_id, title, description, priority, id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Task updated successfully', changes: this.changes });
    });
};

// 6. Delete a Task
exports.deleteTask = (req, res) => {
    const { id } = req.params;
    db.run(`DELETE FROM tasks WHERE id = ?`, id, function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Task deleted successfully', changes: this.changes });
    });
};