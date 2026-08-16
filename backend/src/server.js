const express = require('express');
const cors = require('cors');
const taskRoutes = require('./routes/taskRoutes');
const db = require('./db/database'); // Database import kar liya

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); 
app.use(express.json()); 

// 🚀 AUTO-INITIALIZE DATABASE FOR RENDER
// Jaise hi server start hoga, ye check karega aur tables banayega
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS boards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL
    )`);
    
    db.run(`CREATE TABLE IF NOT EXISTS columns (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        board_id INTEGER,
        name TEXT NOT NULL,
        position INTEGER
    )`);
    
    db.run(`CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        column_id INTEGER,
        title TEXT NOT NULL,
        description TEXT,
        priority TEXT DEFAULT 'Medium',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Agar board empty hai, toh default columns insert kar do
    db.get(`SELECT COUNT(*) as count FROM boards`, (err, row) => {
        if (row && row.count === 0) {
            console.log("No data found. Seeding initial board and columns...");
            db.run(`INSERT INTO boards (name) VALUES ('Main Project Board')`);
            db.run(`INSERT INTO columns (board_id, name, position) VALUES (1, 'To Do', 1)`);
            db.run(`INSERT INTO columns (board_id, name, position) VALUES (1, 'In Progress', 2)`);
            db.run(`INSERT INTO columns (board_id, name, position) VALUES (1, 'Done', 3)`);
        }
    });
});

// Routes
app.use('/api', taskRoutes);

app.get('/', (req, res) => {
    res.send('TaskFlow API is running!');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});