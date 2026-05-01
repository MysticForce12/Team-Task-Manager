import User from '../models/User.js';
import zod from 'zod';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const registerSchema = zod.object({
  name: zod.string().min(2, { message: "Name must be at least 2 characters" }),
  email: zod.string().email({ message: "Invalid email address" }),
  password: zod.string().min(6, { message: "Password must be at least 6 characters" }),
  role: zod.enum(['admin', 'member']).optional()
});

const loginSchema = zod.object({
  email: zod.string().email({ message: "Invalid email address" }),
  password: zod.string().min(1, { message: "Password is required" })
});


const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};


export const registerUser = async (req, res) => {
  try {
    const parsedData = registerSchema.safeParse(req.body);
    if (!parsedData.success) {
      const errorMsg = parsedData.error.issues[0]?.message || "Invalid input data";
      return res.status(400).json({ message: errorMsg });
    }

    const { name, email, password, role } = parsedData.data;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'member', 
    });

    if(user){
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.role),
      });
    }else{
      res.status(400).json({ message: 'Invalid data' });
    }
  }catch(error){
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


export const loginUser = async (req, res) => {
  try {
    const parsedData = loginSchema.safeParse(req.body);
    if (!parsedData.success) {
      const errorMsg = parsedData.error.issues[0]?.message || "Invalid input data";
      return res.status(400).json({ message: errorMsg });
    }
    
    const { email, password } = parsedData.data;

    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.role),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


export const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};