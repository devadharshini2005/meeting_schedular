// routes/notes.js
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

// Note Schema
const noteSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    userEmail: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const Note = mongoose.model('Note', noteSchema);

// Create a new note
router.post('/create', async (req, res) => {
    const { title, content } = req.body;
    const userEmail = req.headers['user-email'];

    if (!title || !content) return res.status(400).send('Title and content are required');

    try {
        const newNote = new Note({ title, content, userEmail });
        await newNote.save();
        res.status(201).json({ message: 'Note created successfully', note: newNote });
    } catch (error) {
        res.status(500).send(`Error creating note: ${error.message}`);
    }
});

// Get all notes for a user
router.get('/', async (req, res) => {
    const userEmail = req.headers['user-email'];

    try {
        const notes = await Note.find({ userEmail });
        res.status(200).json(notes);
    } catch (error) {
        res.status(500).send(`Error retrieving notes: ${error.message}`);
    }
});

// Delete a note by ID
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    const userEmail = req.headers['user-email'];

    try {
        const result = await Note.findOneAndDelete({ _id: id, userEmail });
        if (result) {
            res.status(200).json({ message: 'Note deleted successfully' });
        } else {
            res.status(404).json({ error: 'Note not found or not authorized' });
        }
    } catch (error) {
        res.status(500).send(`Error deleting note: ${error.message}`);
    }
});

module.exports = router;
