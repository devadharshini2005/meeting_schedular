require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const socketIo = require('socket.io');
const { google } = require('googleapis');
const OAuth2 = google.auth.OAuth2;

const app = express();
const PORT = process.env.PORT || 5000;

// Environment Variable Checks
if (!process.env.MONGO_URI || !process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
    console.error("Missing required environment variables.");
    process.exit(1);
}

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('MongoDB connected successfully'))
    .catch((err) => console.error('MongoDB connection error:', err));

// User Schema and Model
const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: (v) => /^\S+@\S+\.\S+$/.test(v),
            message: (props) => `${props.value} is not a valid email!`,
        },
    },
    password: { type: String, required: true },
    mobile: {
        type: String,
        required: true,
        validate: {
            validator: (v) => /^\d{10}$/.test(v),
            message: (props) => `${props.value} is not a valid mobile number!`,
        },
    },
    notes: [{ type: String }],
});

const User = mongoose.model('User', userSchema);

// Nodemailer Setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.ADMIN_EMAIL,
        pass: process.env.ADMIN_PASSWORD,
    },
});

// Google OAuth2 Setup
const oauth2Client = new OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

// Function to generate Google Auth URL
const generateAuthUrl = () =>
    oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/calendar'],
    });

// Root Route
app.get('/', (req, res) => res.send('Welcome to the Email Storage API!'));

// Signup Route
app.post('/signup', async (req, res) => {
    const { username, email, password, mobile } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).send('Email already exists');

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email, password: hashedPassword, mobile });
        await newUser.save();
        res.status(201).send('User registered successfully!');
    } catch (error) {
        res.status(400).send(`Error signing up: ${error.message}`);
    }
});

// Login Route
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    console.log('Received login attempt with email:', email);  // Check if this is being logged
    try {
        const user = await User.findOne({ email });
        if (!user) {
            console.log('No user found');
            return res.status(401).send('Invalid credentials');
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            console.log('Invalid password');
            return res.status(401).send('Invalid credentials');
        }

        console.log(`Login successful for email: ${email}`);
        res.status(200).send('Login successful');
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).send(`Error logging in: ${error.message}`);
    }
});



// Get Users Route
app.get('/users', async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).send(`Error retrieving users: ${error.message}`);
    }
});

// Email Notification Route
app.post('/send-email', (req, res) => {
    const { email, message } = req.body;
    const mailOptions = {
        from: process.env.ADMIN_EMAIL,
        to: email,
        subject: 'New Notification',
        text: message,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) return res.status(500).send('Error sending email');
        res.status(200).send('Email sent successfully');
    });
});

// const { check, validationResult } = require('express-validator'); // Optional validation package
// const logger = require('winston'); // Optional logging package

app.use(express.json());

// Save Note Route
// Save Note Route
app.post('/save-note', async (req, res) => {
    const { note } = req.body;
    const email = req.headers['user-email'];  // Make sure this matches with your frontend request header

    console.log("Headers received:", req.headers); // Log headers to check if email is being sent

    if (!note || !email) {
        console.error('Missing note or email');
        return res.status(400).send('Note and email are required');
    }

    try {
        const user = await User.findOne({ email });

        if (!user) {
            console.error(`User with email ${email} not found`);
            return res.status(404).send('User not found');
        }

        // Add note to user's notes array and save
        user.notes.push(note);
        await user.save();

        console.log(`Note saved for user: ${email}`);
        res.status(200).send('Note saved successfully');
    } catch (err) {
        console.error('Error saving note:', err);
        res.status(500).send('Internal server error');
    }
});

// Get Notes Route
app.get('/get-notes', async (req, res) => {
    const email = req.query.email;
    console.log(`Fetching notes for email: ${email}`);
    
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).send('User not found');
        res.status(200).json({ notes: user.notes });
    } catch (err) {
        console.error('Error fetching notes:', err);
        res.status(500).json({ message: 'Error fetching notes' });
    }
});


// Delete Note Route
app.delete('/delete-note', async (req, res) => {
    const { note, email } = req.body;

    if (!note || !email) {
      console.error('Note or email missing for deletion');
      return res.status(400).send('Note or email missing');
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
          console.error(`User with email ${email} not found`);
          return res.status(404).send('User not found');
        }

        user.notes = user.notes.filter((n) => n !== note);
        await user.save();

        console.log(`Note deleted for user: ${email}`);
        res.status(200).json({ message: 'Note deleted successfully' });
    } catch (err) {
        console.error('Error deleting note:', err);
        res.status(500).json({ message: 'Error deleting note' });
    }
});

// Meeting Schema and Model
const meetingSchema = new mongoose.Schema({
    teamMembers: [
        {
            name: { type: String, required: true },
            timeZone: { type: String, required: true },
            selectedTime: { type: String, required: true },
            selectedDate: { type: String, required: true },
        },
    ],
    commonTime: { type: String, required: true },
    userEmail: { type: String, required: true },
}, { timestamps: true });

const Meeting = mongoose.model('Meeting', meetingSchema);

// Save Meeting Route
app.post('/save-meeting', async (req, res) => {
    const { teamMembers, commonTime } = req.body;
    const userEmail = req.headers['user-email'];

    if (!teamMembers || !commonTime) return res.status(400).send('Missing required fields.');

    try {
        const newMeeting = new Meeting({ teamMembers, commonTime, userEmail });
        await newMeeting.save();
        res.status(201).send('Meeting saved successfully!');
    } catch (error) {
        res.status(500).send(`Error saving meeting: ${error.message}`);
    }
});

// Get Meetings Route
app.get('/get-meetings', async (req, res) => {
    const userEmail = req.headers['user-email'];

    try {
        const meetings = await Meeting.find({ userEmail });
        res.status(200).json({ meetings });
    } catch (error) {
        res.status(500).send(`Error fetching meetings: ${error.message}`);
    }
});

// Delete Meeting Route
app.delete('/delete-meeting/:id', async (req, res) => {
    const meetingId = req.params.id;  // Extract the meeting ID from the URL params
    console.log('Meeting ID:', meetingId);  // Log the meeting ID for debugging

    const userEmail = req.headers['user-email'];  // Access the user email from the request headers
    console.log('User email:', userEmail); // Log the user email for debugging

    try {
        if (!userEmail) {
            return res.status(400).json({ success: false, error: "User email not provided" });
        }

        // Find and delete the meeting
        const result = await Meeting.findOneAndDelete({ _id: meetingId, userEmail: userEmail });

        if (result) {
            return res.json({ success: true, message: "Meeting deleted successfully" });
        } else {
            return res.status(400).json({ success: false, error: "Meeting not found or not yours" });
        }
    } catch (error) {
        console.error('Error deleting meeting:', error);
        return res.status(500).json({ success: false, error: 'Error deleting meeting' });
    }
});

// Google Calendar API for Meet Link
const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

async function createGoogleMeet(eventDetails) {
    const event = {
        summary: 'Scheduled Meeting',
        start: { dateTime: eventDetails.startTime, timeZone: eventDetails.timeZone },
        end: { dateTime: eventDetails.endTime, timeZone: eventDetails.timeZone },
        attendees: eventDetails.attendees.map(email => ({ email })),
        conferenceData: { createRequest: { requestId: `meet-${Date.now()}`, conferenceSolutionKey: { type: 'hangoutsMeet' } } },
    };

    try {
        const createdEvent = await calendar.events.insert({
            calendarId: 'primary',
            resource: event,
            conferenceDataVersion: 1,
        });
        return createdEvent.data.hangoutLink;
    } catch (error) {
        throw new Error(`Error creating Google Meet link: ${error.message}`);
    }
}

// Create Google Meet Link Route
app.post('/create-google-meet/:id', async (req, res) => {
    const { id } = req.params;
    const userEmail = req.headers['user-email'];

    try {
        const meeting = await Meeting.findOne({ _id: id, userEmail });
        if (!meeting) return res.status(404).send('Meeting not found');

        const googleMeetLink = await createGoogleMeet({
            startTime: meeting.commonTime,
            endTime: new Date(new Date(meeting.commonTime).getTime() + 60 * 60 * 1000),
            timeZone: 'UTC',
            attendees: meeting.teamMembers.map(member => member.email),
        });
        res.status(200).json({ googleMeetLink });
    } catch (error) {
        res.status(500).send(`Error creating Google Meet: ${error.message}`);
    }
});

// Real-time collaboration with Socket.io
const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const io = socketIo(server);
io.on('connection', (socket) => {
    console.log('A user connected');
    socket.on('disconnect', () => console.log('A user disconnected'));
});
