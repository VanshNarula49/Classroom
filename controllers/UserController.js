// /controllers/UserController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');  // Import User model to interact with DB
const checkAbilityForResource = require('../middlewares/abilityMiddleware.js');
const validator = require('validator');  // Import validator

// Register a New User
// Register a New User
const register = async (req, res, next) => {
  const { name, email, password } = req.body;

  try {
    // Validate input
    if (!name || !email || !password) {
      throw { status: 400, message: 'All fields (name, email, password) are required' };
    }

    if (!validator.isEmail(email)) {
      throw { status: 400, message: 'Invalid email format' };
    }

    if (password.length < 6) {
      throw { status: 400, message: 'Password must be at least 6 characters long' };
    }

    // Hash the password before saving it to the database
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if the email already exists (this is handled by raw SQL in User model)
    const newUser = await User.createUser(name, email, hashedPassword);

    // Return success response in standardized format
    res.status(201).json({
      status: 'success',
      code: 201,
      message: 'User created successfully',
      details: 'User has been successfully registered.',
      data: { name: newUser.name, email: newUser.email },
    });

  } catch (error) {
    next(error);  // Pass error to the error handling middleware
  }
};




// Login the user
const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    // Validate input
    if (!email || !password) {
      throw { status: 400, message: 'Email and password are required' };
    }

    if (!validator.isEmail(email)) {
      throw { status: 400, message: 'Invalid email format' };
    }

    // Find the user by email using the model
    const user = await User.findUserByEmail(email);
    
    if (!user) {
      throw { status: 400, message: 'Invalid credentials' , origin:"Database",details:"No account found with that email"};
    }

    // Compare the password with the stored hashed password
    const match = await bcrypt.compare(password, user.password);
    
    if (!match) {
      throw { status: 400, message: 'Invalid credentials' , origin:"Database",details:"Password mismatch"};

    }

    // Generate JWT token
    const token = jwt.sign({ 
      userId: user.userid, 
      name: user.name,
      email: user.email,
    }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRATION,
    });

    // Send success response in standardized format
    res.status(200).json({
      status: 'success',
      code: 200,
      message: 'Login successful',
      details: 'User has been successfully logged in.',
      data: { token },
    });

  } catch (error) {
    next(error);  // Pass error to the error handling middleware
  }
};


// const { getCourseById } = require('../models/Course'); 
// const { generateCourseResource } = require('../utils/resourceGenerators');


// const coursegen = async () => {
//   const rawCourse = await getCourseById('8');
//   if (!rawCourse) {
//     throw { status: 404, message: 'Course not found',origin : "Database" };
//   }
//   // Generate a minimal, enriched Course resource for CASL
//   const course = generateCourseResource(rawCourse);
  
//   return course;
// };
// Get Profile
const profile = async (req,res,next)=>{
  try{
    const userData = await User.findUserByEmail(req.user.email);
    
    if (!userData) {
      throw { status: 400, message: 'Invalid credentials' , origin:"Database",details:"No account found with that email"};
    }
    const {password, ...user } = userData;
    res.status(200).json({
      status: 'success',
      code: 200,
      message: 'Profile Found',
      details: 'User Profile has been successfully found and Details returned.',
      data: { user },
    });

  }
  catch(error){
    next(error);
  }
};


module.exports = {
  register,
  login,
  profile,
};
