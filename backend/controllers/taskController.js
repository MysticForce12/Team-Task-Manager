import Task from '../models/Task.js';
import Project from '../models/Project.js';

export const createTask = async (req, res) => {
  try {
    const { title, description, dueDate, assignedTo, project } = req.body;
    const task = new Task({
      title,
      description,
      dueDate,
      status: 'To Do',
      assignedTo,
      project
    });
    
    const createdTask = await task.save();
    res.status(201).json(createdTask);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getTasks = async (req, res) => {
  try {
    let query = {};
    if (req.query.projectId) query.project = req.query.projectId;
    
    if (req.user.role === 'admin') {
      const adminProjects = await Project.find({ createdBy: req.user._id }).select('_id');
      const projectIds = adminProjects.map(p => p._id);
      
      if (req.query.projectId) {
        query.project = projectIds.includes(req.query.projectId) ? req.query.projectId : null;
      } else {
        query.project = { $in: projectIds };
      }
    } else {
      query.assignedTo = req.user._id;
    }

    const tasks = await Task.find(query).populate('assignedTo', 'name email').populate('project', 'name');
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const task = await Task.findById(req.params.id);

    if (task) {
      task.status = status;
      const updatedTask = await task.save();
      res.json(updatedTask);
    } else {
      res.status(404).json({ message: 'Task not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (task) {
      await task.deleteOne();
      res.json({ message: 'Task removed' });
    } else {
      res.status(404).json({ message: 'Task not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
