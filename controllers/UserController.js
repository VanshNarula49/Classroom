// /controllers/UserController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');  // Import User model to interact with DB
const checkAbilityForResource = require('../middlewares/abilityMiddleware.js');


// Register a new user
const register = async (req, res, next) => {
  const { name, email, password } = req.body;

  try {
    // Hash the password before saving it to the database
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if the email already exists (this is handled by raw SQL in User model)
    const newUser = await User.createUser(name, email, hashedPassword);

    // Return success response
    res.status(201).json({
      message: 'User created successfully',
      user: { name: newUser.name, email: newUser.email },
    });

  } catch (error) {
    // Pass error to the error handler middleware
    next(error);  // `next(error)` passes control to the error handling middleware
  }
};

// Login the user
const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    // Find the user by email using the model
    const user = await User.findUserByEmail(email);
    
    if (!user) {
      // If user is not found, throw a custom error
      throw { status: 400, message: 'Invalid credentials' };  // Custom error passed to next()
    }

    // Compare the password with the stored hashed password
    const match = await bcrypt.compare(password, user.password);
    
    if (!match) {
      throw { status: 400, message: 'Invalid credentials' };  // Custom error passed to next()
    }

    // Generate JWT token
    const token = jwt.sign({  userId: user.userid, 
      name: user.name,
      email: user.email,
      role: user.role,}, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRATION,
    });

    // Send the token in the response
    res.json({ token });

  } catch (error) {
    next(error);  // Pass error to the error handling middleware
  }
};
const { getCourseById } = require('../models/Course'); 
const { generateCourseResource } = require('../utils/resourceGenerators');
// /controllers/UserController.js (profile route example for Course check)
const coursegen = async () => {
  try {
    const rawCourse = await getCourseById('1');
    if (!rawCourse) {
      return res.status(404).json({ message: 'Course not found' });
    }
    // Generate a minimal, enriched Course resource for CASL
    const course = generateCourseResource(rawCourse);
    console.log(course)
   return course
  } catch (error){throw error}
}
  


const profile = [
  checkAbilityForResource('delete','Course',coursegen),
  (req, res) => {
    res.json({ profile: req.user });
  }
];

module.exports = {
  register,
  login,
  profile,
};
