import Project from '../models/Project.js';

export const createProject = async (req, res) => {
  try {
    const { name, description, members } = req.body;
    const project = new Project({
      name,
      description,
      members,
      createdBy: req.user._id
    });
    
    const createdProject = await project.save();
    res.status(201).json(createdProject);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getProjects = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'admin') {
      query = { createdBy: req.user._id };
    } else {
      query = { members: req.user._id };
    }
    const projects = await Project.find(query).populate('members', 'name email').populate('createdBy', 'name');
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateProject = async (req, res) => {
  try {
    const { name, description, members } = req.body;
    const project = await Project.findById(req.params.id);
    
    if (project) {
      project.name = name || project.name;
      project.description = description || project.description;
      if (members !== undefined) {
        project.members = members;
      }
      
      const updatedProject = await project.save();
      res.json(updatedProject);
    } else {
      res.status(404).json({ message: 'Project not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
