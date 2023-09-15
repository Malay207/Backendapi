const express = require("express");
require("dotenv").config();
const router = express.Router();
const User = require("./model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const valid = require("./index2");
const { body, validationResult } = require("express-validator");
//create user using Username,email,password
router.post("/createuser", [
    body("username", "Enter a valid username").isLength({ min: 3 }),
    body("email", "Enter a valid email").isEmail(),
    body("password", "Password must be atleast 5 characters").isLength({ min: 5 }),
], async (req, res) => {
    try {
        let success = false;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success, errors: errors.array() });
        }
        //check whether the user with this email exists already
        let existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) {
            return res.status(400).json({ success, error: "Sorry a user with this email already exists" });
        }
        //hash the password
        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(req.body.password, salt);
        //check email is valid or not
        const validEmail = await valid(req.body.email);
        if (!validEmail) {
            return res.status(400).json({ success, error: "Sorry this email is not valid" });
        }
        else {

            //create a new user
            const user = await User.create({
                username: req.body.username,
                email: req.body.email,
                password: secPass,
            });
            const data = {
                user: {
                    id: user._id,
                }
            }
            const authToken = jwt.sign(data, process.env.WEBTOKEN);
            success = true;
            res.json({ success, authToken, user });
        }
        //create a web token
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});
//Login of User
router.post("/login", [
    body("username", "Enter a valid username").isLength({ min: 3 }),
    body("password", "Password cannot be blank").exists(),
], async (req, res) => {
    try {
        const error = validationResult(req);
        if (!error.isEmpty()) {
            return res.status(400).json({ error: error.array() })
        }
        const { username, password } = req.body;
        let success = false;
        //find the user using username
        const existingUser = await User.findOne({ username });
        if (!existingUser) {
            success = false;
            return res.status(400).json({ success, error: "Please try to login with correct credentials" });
        }
        //compare the password
        const passwordCompare = await bcrypt.compare(password, existingUser.password);
        console.log(passwordCompare);
        if (!passwordCompare) {
            success = false;
            return res.status(400).json({ success, error: "Please try to login with correct credentials" });
        }
        //create a web token
        const data = {
            user: {
                id: existingUser._id,
            }
        };
        const authToken = jwt.sign(data, process.env.WEBTOKEN);
        success = true;
        res.json({ success, authToken, existingUser });
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send("Internal Server Error");
    }
});
//forgot user password
router.post("/forgotpassword", [
    body("email", "Enter a valid email").isEmail(),
    body("password", "Password must be atleast 5 characters").isLength({ min: 5 }),
], async (req, res) => {
    try {
        let success = false;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success, errors: errors.array() });
        }
        const { password, email } = req.body;
        //check whether the user with this email exists already
        let existingUser = await User.findOne({ email });
        if (!existingUser) {
            return res.status(400).json({ success, error: "Sorry a user with this email does not exists" });
        }
        //hash the password
        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(password, salt);
        //update the password
        const user = await User.findOneAndUpdate(
            { email: req.body.email },
            { password: secPass },
            { new: true }
        )
        success = true;
        res.json({ success, user });
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send("Internal Server Error");
    }
});
module.exports = router;

