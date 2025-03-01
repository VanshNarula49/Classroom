// /controllers/CourseController.js
const Course = require('../models/Course');

const createCourse = async (req, res) => {
  const { name, code, description } = req.body;
  
  try {
    const course = await Course.create({ name, code, description, createdby: req.user.userid });
    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ error: 'Error creating course' });
  }
};

const getCourses = async (req, res) => {
  try {
    const courses = await Course.findAll();
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching courses' });
  }
};

module.exports = {
  createCourse,
  getCourses,
};
