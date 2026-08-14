// backend/tests/api.test.js
const request = require('supertest');
const db = require('../src/db/database');

const baseURL = 'http://localhost:5000';

describe('TaskFlow API Tests', () => {
    
    // Test 1: Creating a task with no title fails (Validation Check)
    it('1. Should fail when creating a task with an empty title', async () => {
        const res = await request(baseURL)
            .post('/api/tasks')
            .send({
                column_id: 1,
                title: '   ', // Empty title
                description: 'Test description',
                priority: 'High'
            });
            
        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe('Title cannot be empty.');
    });

    // Test 2: Moving a task updates its status/column correctly
    it('2. Should successfully move a task to another column', async () => {
        const createRes = await request(baseURL)
            .post('/api/tasks')
            .send({ column_id: 1, title: 'Move Test Task', priority: 'Low' });
        
        const taskId = createRes.body.id;

        // B. Update its column_id to 2 (Moving it)
        const updateRes = await request(baseURL)
            .put(`/api/tasks/${taskId}`)
            .send({ column_id: 2 });
        
        expect(updateRes.statusCode).toBe(200);
        expect(updateRes.body.message).toBe('Task updated successfully');
    });

    it('3. Should directly query the database to get task counts per column', (done) => {
        const sql = `SELECT column_id, COUNT(*) as task_count FROM tasks GROUP BY column_id`;
        
        db.all(sql, [], (err, rows) => {
            expect(err).toBeNull();
            expect(Array.isArray(rows)).toBe(true);
            // Verify that the query actually returned column_id and task_count properties
            if (rows.length > 0) {
                expect(rows[0]).toHaveProperty('column_id');
                expect(rows[0]).toHaveProperty('task_count');
            }
            done();
        });
    });
});