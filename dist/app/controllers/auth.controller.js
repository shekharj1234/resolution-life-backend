"use strict";
//auth.controller
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUser = exports.registerUser = void 0;
const express_validator_1 = require("express-validator");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = require("mongoose");
dotenv_1.default.config();
const registerUser = async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { name, email, password } = req.body;
        // Check if the user already exists
        const existingUser = await User_1.User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }
        // Hash the password
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        // Create a new user with timestamps
        const newUser = await User_1.User.create({
            name,
            email,
            password: hashedPassword,
        });
        // Generate an authorization token
        const token = jsonwebtoken_1.default.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
            expiresIn: "30m",
        });
        res.status(201).json({
            message: "User registered successfully",
            token,
            createdAt: newUser.createdAt,
            updatedAt: newUser.updatedAt,
        });
    }
    catch (error) {
        if (error instanceof mongoose_1.Error.ValidationError) {
            // Handle Mongoose validation errors
            const validationErrors = Object.values(error.errors).map((err) => err.message);
            return res.status(400).json({ errors: validationErrors });
        }
        console.error("Error during registration:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.registerUser = registerUser;
// export const getAllUsers = async (req: Request, res: Response) => {
//   try {
//     // Fetch all users from the database
//     const users = await User.find();
//     // Return the array of users
//     res.status(200).json(users);
//   } catch (error) {
//     console.error("Error while fetching users:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };
//Login user
const loginUser = async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { email, password } = req.body;
        // Check if the user exists
        const existingUser = await User_1.User.findOne({ email });
        if (!existingUser) {
            return res.status(404).json({ message: "User not found" });
        }
        // Compare the provided password with the stored hashed password
        const passwordMatch = await bcrypt_1.default.compare(password, existingUser.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: "Invalid password" });
        }
        // Generate an authorization token
        const token = jsonwebtoken_1.default.sign({ userId: existingUser._id }, process.env.JWT_SECRET, {
            expiresIn: "30m",
        });
        res.status(200).json({
            message: "Token generate successfully",
            token,
            user: {
                name: existingUser.name,
                email: existingUser.email,
                createdAt: existingUser.createdAt,
                updatedAt: existingUser.updatedAt,
            },
        });
    }
    catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.loginUser = loginUser;
// // Forgot Password
// export const forgotPassword = async (req: Request, res: Response) => {
//   try {
//     const { email } = req.body;
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }
//     // Generate a reset token
//     const resetToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, {
//       expiresIn: "30m",
//     });
//     user.token = resetToken;
//     await user.save();
//     // Create a transporter
//     const transporter = nodemailer.createTransport({
//       service: "gmail",
//       auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS,
//       },
//     });
//     const mailOptions = {
//       from: process.env.EMAIL,
//       to: user.email,
//       subject: "Password Reset Link",
//       text: `You requested a password reset. Please use the following link to reset your password: ${process.env.CLIENT_URL}/reset-password?token=${resetToken}`,
//       // text: `You requested a password reset. Please use the following link to reset your password: ${process.env.CLIENT_URL}/reset-password/${resetToken}`,
//     };
//     transporter.sendMail(mailOptions, (error, info) => {
//       if (error) {
//         console.error("Error sending email:", error);
//         return res.status(500).json({ message: "Error sending email" });
//       }
//       res.status(200).json({ message: "Reset link sent successfully" });
//     });
//   } catch (error) {
//     console.error("Error during forgot password:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };
// // Reset Password function
// export const resetPassword = async (req: Request, res: Response) => {
//   try {
//     const { token, newPassword } = req.body;
//     const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
//     console.log("decodedd valuesssssssssss", decoded, req.body);
//     const user = await User.findById(decoded.userId);
//     if (!user || user.token !== token) {
//       return res.status(400).json({ message: "Invalid or expired token" });
//     }
//     // Hash the new password
//     const hashedPassword = await bcrypt.hash(newPassword, 10);
//     user.password = hashedPassword;
//     user.token = undefined;
//     await user.save();
//     res.status(200).json({ message: "Password reset successfully" });
//   } catch (error) {
//     console.error("Error during reset password:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };
// // update user
// export const updateUser = async (req: Request, res: Response) => {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() });
//     }
//     const userId = req.params.id;
//     const { name, technology } = req.body;
//     // Find the user by ID
//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }
//     // Update the user's fields
//     if (name) user.name = name;
//     if (technology) user.technology = technology;
//     // Save the updated user
//     await user.save();
//     res.status(200).json({ message: "User updated successfully", user });
//   } catch (error) {
//     console.error("Error updating user:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };
