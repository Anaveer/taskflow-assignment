import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_BASE_URL = 'https://taskflow-assignment-nn0m.onrender.com/api';

function App() {
  const [columns, setColumns] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [board, setBoard] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All Priorities');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [formError, setFormError] = useState('');
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    column_id: ''
  });

  const fetchData = async () => {
    try {
      const boardRes = await axios.get(`${API_BASE_URL}/board-data`);
      setColumns(boardRes.data.columns);
      setBoard(boardRes.data.boards[0]);

      const tasksRes = await axios.get(`${API_BASE_URL}/tasks`);
      setTasks(tasksRes.data.tasks);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const openModal = (task = null, defaultColumnId = null) => {
    setFormError('');
    if (task) {
      setEditingTaskId(task.id);
      setTaskForm({
        title: task.title,
        description: task.description || '',
        priority: task.priority,
        column_id: task.column_id
      });
    } else {
      setEditingTaskId(null);
      setTaskForm({
        title: '',
        description: '',
        priority: 'Medium',
        column_id: defaultColumnId || (columns.length > 0 ? columns[0].id : '')
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!taskForm.title.trim()) {
      setFormError('Task title is required.');
      return;
    }

    try {
      if (editingTaskId) {
        await axios.put(`${API_BASE_URL}/tasks/${editingTaskId}`, taskForm);
      } else {
        await axios.post(`${API_BASE_URL}/tasks`, taskForm);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      setFormError(error.response?.data?.error || 'Failed to save task.');
    }
  };

  const handleDelete = async () => {
    if (!editingTaskId) return;
    try {
      await axios.delete(`${API_BASE_URL}/tasks/${editingTaskId}`);
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      setFormError('Failed to delete task.');
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = priorityFilter === 'All Priorities' || task.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="logo">
          <span className="logo-icon">T</span> 
          <span className="sidebar-text">TaskFlow</span>
        </div>
        <nav className="nav-menu">
          <div className="nav-item active">
            <span className="sidebar-text">Board</span>
          </div>
        </nav>
      </aside>

      <main className="main-content">
        <header className="top-header">
          <div className="header-titles">
            <h1 className="gradient-text">{board ? board.name : 'Main Project Board'}</h1>
            <p>Stay organized and get things done smoothly.</p>
          </div>
          
          <div className="header-actions">
            <div className="search-box">
              <input 
                type="text" 
                placeholder="Search tasks..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="filter-box">
              <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
                <option value="All Priorities">All Priorities</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            <button className="primary-btn btn-3d" onClick={() => openModal()}>+ New Task</button>
          </div>
        </header>

        <div className="board-canvas">
          {columns.map(column => {
            const columnTasks = filteredTasks.filter(task => task.column_id === column.id);
            const borderColors = { 'To Do': '#3b82f6', 'In Progress': '#8b5cf6', 'Done': '#22c55e' };
            const topColor = borderColors[column.name] || '#cbd5e1';

            return (
              <div key={column.id} className="column-wrapper" style={{ borderTopColor: topColor }}>
                <div className="column-header">
                  <div className="column-title-group">
                    <h2>{column.name}</h2>
                    <span className="task-count">{columnTasks.length}</span>
                  </div>
                </div>
                
                <div className="task-list">
                  {columnTasks.map(task => (
                    <div key={task.id} className="task-card card-3d" onClick={() => openModal(task)}>
                      <h3>{task.title}</h3>
                      {task.description && <p className="task-desc">{task.description}</p>}
                      <div className="task-footer">
                        <span className={`priority-badge ${task.priority.toLowerCase()}`}>
                          {task.priority}
                        </span>
                        <span className="task-date">{formatDate(task.created_at)}</span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <button className="add-task-btn" onClick={() => openModal(null, column.id)}>+ Add Task</button>
              </div>
            );
          })}
        </div>
      </main>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingTaskId ? 'Edit Task' : 'Create New Task'}</h2>
            
            {formError && <div className="error-message">{formError}</div>}
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Title *</label>
                <input 
                  type="text" 
                  placeholder="Task title..." 
                  value={taskForm.title} 
                  onChange={(e) => setTaskForm({...taskForm, title: e.target.value})}
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label>Description (Optional)</label>
                <textarea 
                  placeholder="Add some details..." 
                  value={taskForm.description} 
                  onChange={(e) => setTaskForm({...taskForm, description: e.target.value})}
                  rows="3"
                ></textarea>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Status (Column)</label>
                  <select 
                    value={taskForm.column_id} 
                    onChange={(e) => setTaskForm({...taskForm, column_id: e.target.value})}
                  >
                    {columns.map(col => (
                      <option key={col.id} value={col.id}>{col.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Priority</label>
                  <select 
                    value={taskForm.priority} 
                    onChange={(e) => setTaskForm({...taskForm, priority: e.target.value})}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div className="modal-actions">
                {editingTaskId && (
                  <button type="button" className="btn-delete" onClick={handleDelete}>
                    Delete Task
                  </button>
                )}
                <div className="right-actions">
                  <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>Cancel</button>
                  <button type="submit" className="btn-save">Save Task</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;