// controllers/course.controller.js
const { getCoursesByUserId } = require('../models/Course');

const getCourses = async (req, res, next) => {
  try {
    console.log(req.user.userId);
    
    const courses = await getCoursesByUserId(req.user.userId);
    res.json({
      status: 'success',
      code: 200,
      message: 'Courses fetched successfully.',
      data: { courses }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCourses };
