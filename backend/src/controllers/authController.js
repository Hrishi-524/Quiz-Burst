import 'dotenv/config'
import User from "../models/User.js";
import jwt from 'jsonwebtoken';
import bcrypt, { hash } from 'bcrypt';

export const signupUser = async (req, res) => {
    const {username, email, password} = req.body;
    console.log("Received signup data:", req.body);

    const existingUser = await User.findOne({ username });
    if (existingUser) {
        return res.status(400).json({ error: "Username already taken" });
    }

    const saltRounds = 10;
    const hash = await bcrypt.hash(password, saltRounds);

    const newUser = new User({
        username : username,
        email : email,
        password : hash,
        isHost : true,
    })

    await newUser.save();

    const token = jwt.sign({
        id : newUser._id,
        username : newUser.username,
    }, process.env.JWT_SECRET, {
        expiresIn : '7h',
    });  

    console.log(`POST/SIGN UP USER: ${newUser._id}, ${newUser.username}`)

    res.status(201).json({ token });
}
 
export const loginUser = async (req, res) => {
    const {username, password} = req.body;
    console.log("Received login data:", req.body);

    if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
    }
    const user = await User.findOne({ username })

    if (!user) {
        return next(new ExpressError("Invalid Username Or Password", 401));
    }


    const isVerified = await bcrypt.compare(password, user.password);

    if(isVerified) {
        const token = jwt.sign({
            id : user._id,
            username : user.username,
        }, process.env.JWT_SECRET, {
            expiresIn : '7h',
        });

        res.status(200).json({ token });
    } else {
        res.status(401).json({ error: "Invalid username or password" });
    }
}

export const fetchUserDetails = async (req, res) => {
    const { id } = req.params
    const userDetails = await User.findById(id);
    console.log(`GET/FETCH USER DETAILS: ${id}`)
    res.status(201).json({
        userDetails,
    })
}