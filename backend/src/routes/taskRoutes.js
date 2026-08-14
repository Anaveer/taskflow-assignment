const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');

router.get('/board-data', taskController.getBoardData);
router.get('/tasks', taskController.getTasks);
router.get('/tasks/counts', taskController.getTaskCounts); 
router.post('/tasks', taskController.createTask);
router.put('/tasks/:id', taskController.updateTask);
router.delete('/tasks/:id', taskController.deleteTask);

module.exports = router;