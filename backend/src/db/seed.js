// backend/src/db/seed.js
const fs = require('fs');
const path = require('path');
const db = require('./database');

const schemaPath = path.resolve(__dirname, 'schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');

db.serialize(() => {
    db.exec(schema, (err) => {
        if (err) {
            console.error('Error executing schema:', err.message);
            return;
        }
        console.log('Tables created successfully.');

        db.get("SELECT COUNT(*) AS count FROM boards", (err, row) => {
            if (row.count === 0) {
                console.log('Seeding initial data...');
                
                db.run(`INSERT INTO boards (name) VALUES ('Main Project Board')`, function(err) {
                    const boardId = this.lastID;

                    const cols = ['To Do', 'In Progress', 'Done'];
                    cols.forEach((colName, index) => {
                        db.run(`INSERT INTO columns (board_id, name, position) VALUES (?, ?, ?)`, 
                        [boardId, colName, index + 1], function(err) {
                            const colId = this.lastID;

                            if (colName === 'To Do') {
                                db.run(`INSERT INTO tasks (column_id, title, description, priority) 
                                        VALUES (?, 'Setup Backend', 'Initialize Node.js and SQLite', 'High')`, [colId]);
                            }
                        });
                    });
                });
                console.log('Seed data inserted.');
            } else {
                console.log('Database already has data. Skipping seed.');
            }
        });
    });
});