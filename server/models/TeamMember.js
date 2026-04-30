const mongoose = require('mongoose');

const teamMemberSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    rollNumber: {
        type: String,
        required: true,
        unique: true
    },
    year: {
        type: String,
        required: true
    },
    degree: {
        type: String,
        required: true
    },
    aboutProject: {
        type: String,
        required: true
    },
    hobbies: {
        type: String, // comma separated
        required: true
    },
    certificate: {
        type: String,
        required: true
    },
    internship: {
        type: String,
        required: true
    },
    aboutYourAim: {
        type: String,
        required: true
    },
    photo: {
        type: String, // Store the filename or path for the uploaded file
        required: false
    }
}, { timestamps: true });

module.exports = mongoose.model('TeamMember', teamMemberSchema);
