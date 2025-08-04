const { generateToken } = require('../utils/jwt');
const User = require('../Model/authModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

const signup = async (req, res, next) => {
  try {
    const { username, email, password, role } = req.body;
    if(!username || !email || !password || !role) {
      const error = new Error('All fields are required');
      error.status = 400;
      return next(error);
    }
    const userExists = await User.findOne({ email });
    if (userExists) {
      const error = new Error('Email already exists');
      error.status = 400;
      return next(error);
    }
    const newUser = new User({ username, email, password, role });
    await newUser.save();
    const token = generateToken(newUser._id);

    res.status(201).json({   
      message: 'Signup successful',
      token,
      user: { ...newUser.toObject(), _id: newUser._id }
    });
  }catch(error){
    error.message = 'Signup failed: ' + (error.message || 'Unknown error');
    error.status = error.status || 500;
    next(error);
  }
}

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
   
    if(!email || !password) {
      const error = new Error('All fields are required');
      error.status = 400;
      return next(error);
    }
    
    const user = await User.findOne({ email });
    if(!user) {
      const error = new Error('Invalid credentials');
      error.status = 401;
      return next(error);
    }
    
    const isPasswordValid = await user.comparePassword(password);
    if(!isPasswordValid) {
      const error = new Error('Invalid credentials');
      error.status = 401;
      return next(error);
    }
    
    const token = generateToken(user._id);
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 3600000
    });

    const userObj = user.toObject();
    delete userObj.password;
    res.status(200).json({ message: 'Login successful', token, user: userObj });
  }catch(error){
    error.message = 'Login failed: ' + (error.message || 'Unknown error');
    error.status = error.status || 500;
    next(error);
  }
};

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'Token is valid',
      user: { ...user.toObject(), _id: user._id }
    });
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = { signup, login, verifyToken }; 
