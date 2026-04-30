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
        const filetypes = /jpeg|jpg|png|webp|pdf/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only images and PDFs are allowed'));
    }
});

// POST route to add a team member
router.post('/', upload.single('photo'), async (req, res) => {
    try {
        const { 
            name, rollNumber, year, degree, aboutProject, 
            hobbies, certificate, internship, aboutYourAim 
        } = req.body;
        
        // Basic validation
        if (!name || !rollNumber || !year || !degree || !aboutProject || !hobbies || !certificate || !internship || !aboutYourAim) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const newMember = new TeamMember({
            name,
            rollNumber,
            year,
            degree,
            aboutProject,
            hobbies,
            certificate,
            internship,
            aboutYourAim,
            photo: req.file ? req.file.filename : null
        });

        await newMember.save();
        res.status(201).json({ message: 'Team member added successfully', member: newMember });
    } catch (error) {
        console.error('Error adding team member:', error);
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern || {})[0] || 'Field';
            console.error(`Duplicate key error: ${field} already exists`);
            return res.status(400).json({ 
                message: `${field === 'rollNumber' ? 'Roll Number' : field} already exists` 
            });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// GET route to fetch all team members
router.get('/', async (req, res) => {
    try {
        const members = await TeamMember.find().sort({ createdAt: -1 });
        res.json(members);
    } catch (error) {
        console.error('Error fetching members:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// GET route to fetch a single team member by ID
router.get('/:id', async (req, res) => {
    try {
        const member = await TeamMember.findById(req.params.id);
        if (!member) {
            return res.status(404).json({ message: 'Member not found' });
        }
        res.json(member);
    } catch (error) {
        console.error('Error fetching member details:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
