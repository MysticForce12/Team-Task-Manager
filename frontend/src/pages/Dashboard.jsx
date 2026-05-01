import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:5000/api';

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  const [editingProjectId, setEditingProjectId] = useState(null);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [newProjectMembers, setNewProjectMembers] = useState([]);

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskProject, setNewTaskProject] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [newTaskAssignedTo, setNewTaskAssignedTo] = useState('');

  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }
    fetchData();
  }, [token, navigate]);

  const fetchData = async () => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    try {
      const projRes = await axios.get(`${API_URL}/projects`, config);
      setProjects(projRes.data);
      const taskRes = await axios.get(`${API_URL}/tasks`, config);
      setTasks(taskRes.data);

      if (user?.role === 'admin') {
        const userRes = await axios.get(`${API_URL}/users`, config);
        setUsers(userRes.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
    window.location.reload();
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      if (editingProjectId) {
        await axios.put(`${API_URL}/projects/${editingProjectId}`, {
          name: newProjectName,
          description: newProjectDesc,
          members: newProjectMembers
        }, config);
        setEditingProjectId(null);
      } else {
        await axios.post(`${API_URL}/projects`, {
          name: newProjectName,
          description: newProjectDesc,
          members: newProjectMembers
        }, config);
      }
      setNewProjectName('');
      setNewProjectDesc('');
      setNewProjectMembers([]);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving project');
    }
  };

  const handleEditProjectClick = (p) => {
    setEditingProjectId(p._id);
    setNewProjectName(p.name);
    setNewProjectDesc(p.description);
    setNewProjectMembers(p.members ? p.members.map(m => m._id) : []);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingProjectId(null);
    setNewProjectName('');
    setNewProjectDesc('');
    setNewProjectMembers([]);
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.post(`${API_URL}/tasks`, {
        title: newTaskTitle,
        description: newTaskDesc,
        project: newTaskProject,
        dueDate: newTaskDueDate,
        assignedTo: newTaskAssignedTo || undefined
      }, config);
      setNewTaskTitle('');
      setNewTaskDesc('');
      setNewTaskProject('');
      setNewTaskDueDate('');
      setNewTaskAssignedTo('');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating task');
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put(`${API_URL}/tasks/${taskId}/status`, { status: newStatus }, config);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`${API_URL}/tasks/${taskId}`, config);
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Error deleting task');
    }
  };

  const getStatusClass = (status) => {
    if (status === 'To Do') return 'status-todo';
    if (status === 'In Progress') return 'status-progress';
    if (status === 'Done') return 'status-done';
    return '';
  };

  const totalTasks = tasks.length;
  const todoTasks = tasks.filter(t => t.status === 'To Do').length;
  const progressTasks = tasks.filter(t => t.status === 'In Progress').length;
  const doneTasks = tasks.filter(t => t.status === 'Done').length;
  const overdueTasks = tasks.filter(t => new Date(t.dueDate) < new Date() && t.status !== 'Done');

  const activeTasks = tasks.filter(t => t.status !== 'Done');
  const completedTasks = tasks.filter(t => t.status === 'Done');

  return (
    <div>
      <div className="navbar">
        <h2>Team Task Manager</h2>
        <div>
          <span style={{ marginRight: '1rem', fontWeight: 'bold' }}>{user?.name} ({user?.role})</span>
          <button className="btn btn-secondary" onClick={handleLogout}>Logout</button>
        </div>
      </div>
      <div className="container">

        {user?.role === 'admin' && (
          <>
          
            <div className="dashboard-grid" style={{ marginBottom: '2rem' }}>
              <div className="card" style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
                <div>
                  <h3 style={{ margin: 0 }}>{totalTasks}</h3>
                  <p style={{ color: 'var(--text-muted)' }}>Total Tasks</p>
                </div>
                <div>
                  <h3 style={{ margin: 0, color: '#991b1b' }}>{todoTasks}</h3>
                  <p style={{ color: 'var(--text-muted)' }}>To Do</p>
                </div>
                <div>
                  <h3 style={{ margin: 0, color: '#92400e' }}>{progressTasks}</h3>
                  <p style={{ color: 'var(--text-muted)' }}>In Progress</p>
                </div>
                <div>
                  <h3 style={{ margin: 0, color: '#065f46' }}>{doneTasks}</h3>
                  <p style={{ color: 'var(--text-muted)' }}>Done</p>
                </div>
                <div>
                  <h3 style={{ margin: 0, color: 'var(--error-color, #ef4444)' }}>{overdueTasks.length}</h3>
                  <p style={{ color: 'var(--text-muted)' }}>Overdue</p>
                </div>
              </div>
            </div>

            <div className="dashboard-grid" style={{ marginBottom: '2rem' }}>
              <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                <h3>{editingProjectId ? 'Edit Project' : 'Create Project'}</h3>
                <form onSubmit={handleCreateProject} style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <div className="form-group">
                    <input type="text" className="form-control" placeholder="Project Name" value={newProjectName} onChange={e => setNewProjectName(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <input type="text" className="form-control" placeholder="Description" value={newProjectDesc} onChange={e => setNewProjectDesc(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label style={{ marginBottom: '0.5rem', display: 'block' }}>Assign Members</label>
                    <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid #d1d5db', borderRadius: '0.375rem', padding: '0.5rem', background: '#fff' }}>
                      {users.filter(u => u.role === 'member' || !u.role).map(u => (
                        <label key={u._id} style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            style={{ marginRight: '0.5rem' }}
                            checked={newProjectMembers.includes(u._id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNewProjectMembers([...newProjectMembers, u._id]);
                              } else {
                                setNewProjectMembers(newProjectMembers.filter(id => id !== u._id));
                              }
                            }}
                          />
                          <span style={{ fontSize: '0.875rem' }}>{u.name || u.uname || 'User'} <span style={{ color: '#6b7280' }}>({u.email})</span></span>
                        </label>
                      ))}
                      {users.filter(u => u.role === 'member' || !u.role).length === 0 && <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>No members found.</span>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                    <button type="submit" className="btn" style={{ flex: 1 }}>{editingProjectId ? 'Update Project' : 'Add Project'}</button>
                    {editingProjectId && (
                      <button type="button" className="btn btn-secondary" onClick={handleCancelEdit} style={{ flex: 1 }}>Cancel</button>
                    )}
                  </div>
                </form>
              </div>

              <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                <h3>Create Task</h3>
                <form onSubmit={handleCreateTask} style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <div className="form-group">
                    <input type="text" className="form-control" placeholder="Task Title" value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <textarea className="form-control" placeholder="Description" value={newTaskDesc} onChange={e => setNewTaskDesc(e.target.value)} required rows="5" style={{ resize: 'vertical' }} />
                  </div>
                  <div className="form-group" style={{ display: 'flex', gap: '1rem' }}>
                    <select className="form-control" value={newTaskProject} onChange={e => setNewTaskProject(e.target.value)} required>
                      <option value="">Select Project</option>
                      {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                    </select>
                    <select className="form-control" value={newTaskAssignedTo} onChange={e => setNewTaskAssignedTo(e.target.value)}>
                      <option value="">Assign To Member (Optional)</option>
                      {users.filter(u => u.role === 'member' || !u.role).map(u => <option key={u._id} value={u._id}>{u.name || u.uname || 'User'}</option>)}
                    </select>
                    <input type="date" className="form-control" value={newTaskDueDate} onChange={e => setNewTaskDueDate(e.target.value)} required />
                  </div>
                  <button type="submit" className="btn" style={{ width: '100%', marginTop: 'auto' }}>Add Task</button>
                </form>
              </div>
            </div>
          </>
        )}

        <div className="dashboard-grid">
          <div className="card">
            <h3>Projects</h3>
            {projects.length === 0 ? <p>No projects found.</p> : (
              <ul className="project-list">
                {projects.map(p => (
                  <li key={p._id} className="project-item">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 style={{ margin: 0 }}>{p.name}</h4>
                      {user?.role === 'admin' && (
                        <button onClick={() => handleEditProjectClick(p)} title="Edit Project" style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', fontSize: '1.1rem' }}>✎</button>
                      )}
                    </div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>{p.description}</p>
                    {user?.role === 'admin' && p.members && p.members.length > 0 && (
                      <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--primary-color)' }}>
                        <strong>Team:</strong> {p.members.map(m => m.name || m.uname || 'User').join(', ')}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="card">
            <h3>Tasks</h3>
            {tasks.length === 0 ? <p>No tasks found.</p> : (
              <>
                <ul className="task-list">
                  {activeTasks.map(t => (
                    <li key={t._id} className="task-item">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h4 style={{ margin: 0 }}>{t.title}</h4>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <select
                            className={`status-badge ${getStatusClass(t.status)}`}
                            value={t.status}
                            onChange={(e) => updateTaskStatus(t._id, e.target.value)}
                            style={{ border: 'none', cursor: 'pointer', padding: '0.25rem 0.5rem' }}
                          >
                            <option value="To Do">To Do</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Done">Done</option>
                          </select>
                          {user?.role === 'admin' && (
                            <button onClick={() => handleDeleteTask(t._id)} title="Delete Task" style={{ background: 'none', border: 'none', color: 'var(--error-color, #ef4444)', cursor: 'pointer', fontSize: '1.1rem' }}>🗑️</button>
                          )}
                        </div>
                      </div>
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: '0.5rem 0' }}>{t.description}</p>
                      <small style={{ color: new Date(t.dueDate) < new Date() && t.status !== 'Done' ? 'var(--error-color, #ef4444)' : 'inherit', fontWeight: new Date(t.dueDate) < new Date() && t.status !== 'Done' ? 'bold' : 'normal' }}>
                        Due: {new Date(t.dueDate).toLocaleDateString()}
                        {new Date(t.dueDate) < new Date() && t.status !== 'Done' && ' (Overdue!)'}
                        {t.project && <span style={{ marginLeft: '1rem', color: 'var(--primary-color)' }}>• {t.project.name}</span>}
                        {user?.role === 'admin' && t.assignedTo && <span style={{ marginLeft: '1rem', color: '#6b7280' }}>• Assigned: {t.assignedTo.name || t.assignedTo.uname || 'User'}</span>}
                      </small>
                    </li>
                  ))}
                </ul>

                {completedTasks.length > 0 && (
                  <div style={{ marginTop: '2rem' }}>
                    <h4 style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem', color: '#065f46' }}>Completed</h4>
                    <ul className="task-list" style={{ marginTop: '1rem' }}>
                      {completedTasks.map(t => (
                        <li key={t._id} className="task-item" style={{ opacity: 0.7 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h4 style={{ margin: 0, textDecoration: 'line-through' }}>{t.title}</h4>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                              <select
                                className={`status-badge ${getStatusClass(t.status)}`}
                                value={t.status}
                                onChange={(e) => updateTaskStatus(t._id, e.target.value)}
                                style={{ border: 'none', cursor: 'pointer', padding: '0.25rem 0.5rem' }}
                              >
                                <option value="To Do">To Do</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Done">Done</option>
                              </select>
                              {user?.role === 'admin' && (
                                <button onClick={() => handleDeleteTask(t._id)} title="Delete Task" style={{ background: 'none', border: 'none', color: 'var(--error-color, #ef4444)', cursor: 'pointer', fontSize: '1.1rem' }}>🗑️</button>
                              )}
                            </div>
                          </div>
                          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: '0.5rem 0' }}>{t.description}</p>
                          <small>
                            Completed on: {new Date(t.updatedAt || t.dueDate).toLocaleDateString()}
                            {t.project && <span style={{ marginLeft: '1rem', color: 'var(--primary-color)' }}>• {t.project.name}</span>}
                            {user?.role === 'admin' && t.assignedTo && <span style={{ marginLeft: '1rem', color: '#6b7280' }}>• Assigned: {t.assignedTo.name || t.assignedTo.uname || 'User'}</span>}
                          </small>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
