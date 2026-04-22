const mongoose = require('mongoose');

const teamMemberSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    registerNumber: {
        type: String,
        required: true,
        unique: true
    },
    className: {
        type: String,
        required: true
    },
    teamName: {
        type: String,
        required: true
    },
    studentEmail: {
        type: String,
        required: false
    },
    personalEmail: {
        type: String,
        required: false
    },
    phoneNumber: {
        type: String,
        required: false
    },
    fatherName: {
        type: String,
        required: false
    },
    photo: {
        type: String, // Store the filename or path
        required: false
    }
}, { timestamps: true });

module.exports = mongoose.model('TeamMember', teamMemberSchema);
