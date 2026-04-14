const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static(__dirname)); // serve static files (HTML, CSS, JS)

// In-memory storage (students array)
let students = [];
let nextId = 1;

// Helper: check duplicate email
function isEmailUnique(email, excludeId = null) {
    return !students.some(s => s.email === email && (excludeId === null || s.id !== excludeId));
}

// API Routes

// GET all students
app.get('/api/students', (req, res) => {
    res.json(students);
});

// POST register new student
app.post('/api/students', (req, res) => {
    const { fullname, email, dob, course } = req.body;
    
    // validation
    if (!fullname || !email || !dob || !course) {
        return res.status(400).json({ message: 'All fields are required' });
    }
    // email format simple check
    const emailRegex = /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
    }
    // check duplicate email
    if (!isEmailUnique(email)) {
        return res.status(409).json({ message: 'A student with this email already exists' });
    }
    // optional: dob not future
    if (dob && new Date(dob) > new Date()) {
        return res.status(400).json({ message: 'Date of birth cannot be in the future' });
    }
    
    const newStudent = {
        id: nextId++,
        fullname: fullname.trim(),
        email: email.trim(),
        dob,
        course,
        registeredAt: new Date().toISOString()
    };
    students.push(newStudent);
    res.status(201).json({ message: 'Student registered', student: newStudent });
});

// DELETE student by id
app.delete('/api/students/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = students.findIndex(s => s.id === id);
    if (index === -1) {
        return res.status(404).json({ message: 'Student not found' });
    }
    students.splice(index, 1);
    res.json({ message: 'Student removed successfully' });
});

// fallback: serve index.html for any unmatched routes (SPA friendly)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// start server
app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
    console.log(`📋 Student registration backend active (in-memory storage)`);
});