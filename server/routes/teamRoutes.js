const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const TeamMember = require('../models/TeamMember');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 20 * 1024 * 1024 }, // 20MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|webp/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only images (jpeg, jpg, png, webp) are allowed'));
    }
});

// POST route to add a team member
router.post('/add', upload.single('photo'), async (req, res) => {
    try {
        const { name, age, registerNumber, className, teamName, studentEmail, personalEmail, phoneNumber, fatherName } = req.body;
        
        // Basic validation
        if (!name || !age || !registerNumber || !className || !teamName) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const newMember = new TeamMember({
            name,
            age,
            registerNumber,
            className,
            teamName,
            studentEmail,
            personalEmail,
            phoneNumber,
            fatherName,
            photo: req.file ? req.file.filename : null
        });

        await newMember.save();
        res.status(201).json({ message: 'Team member added successfully', member: newMember });
    } catch (error) {
        console.error('Error adding team member:', error);
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Register number already exists' });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// GET route to fetch all team members (optional, but useful)
router.get('/all', async (req, res) => {
    try {
        const members = await TeamMember.find().sort({ createdAt: -1 });
        res.json(members);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
