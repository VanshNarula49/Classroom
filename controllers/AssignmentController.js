// /controllers/AssignmentController.js
const Assignment = require('../models/Assignment');

const createAssignment = async (req, res) => {
  const { title, description, duedate, courseid } = req.body;
  
  try {
    const assignment = await Assignment.create({ title, description, duedate, courseid, createdby: req.user.userid });
    res.status(201).json(assignment);
  } catch (error) {
    res.status(500).json({ error: 'Error creating assignment' });
  }
};

const getAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.findAll();
    res.status(200).json(assignments);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching assignments' });
  }
};

const submitAssignment = async (req, res) => {
  // Logic for submitting an assignment
};

module.exports = {
  createAssignment,
  getAssignments,
  submitAssignment,
};
