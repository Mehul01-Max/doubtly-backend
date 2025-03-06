const bcrypt = require("bcryptjs");
const { Router } = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const {UserDB} = require('../models/UserDB');
const { userMiddleware } = require("../middleware/userMiddleware");
const authRouter = Router();
const isValidEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
}
const isStrongPassword = (password) => {
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return strongPasswordRegex.test(password);
};
authRouter.post('/check', userMiddleware, (req, res) => {
    res.json({ message: "Token validated" });
});
authRouter.post('/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, Email and Password are required"
            })
        }
        const isPresentEmail = await UserDB.findOne({email});
        if (isPresentEmail) {
            return res.status(400).json({
                message: "Email already exists"
            })
        }
        if (!isValidEmail(email)) {
            return res.status(400).json({
                message: "not a valid email"
            })
        }
        if (!isStrongPassword(password)) {
            return res.status(400).json({
              message: "Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character."
            });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new UserDB({name, email, password: hashedPassword, points: 0});
        await newUser.save();
        res.json({
            message : "user created"
        })
    }   
    catch(e) {
        console.log(e);
        res.json({
            message: "Internal Server Error"
        })
    }
})
authRouter.post('/signin', async (req, res) => {
    try {
        const {email, password} = req.body;
        if (!password || !email) {
            return res.status(400).json({
                message: "email and password is required"
            })
        }
        const user = await UserDB.findOne({email});
        if (!user) {
            return res.status(400).json({
                message: "these email is not registered with us"
            })
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                message: "invalid password"
            })
        }
        const token = jwt.sign({userId: user._id}, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.json({ token, message: "Login Successful"});
    }
    catch(e) {
        console.log(e);
        res.json({
            message: "Internal server error"
        })
    }
})

module.exports = {authRouter};