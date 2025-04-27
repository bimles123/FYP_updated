const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const User = require('./models/User');
const Hotel = require('./models/Hotel');
const Message = require('./models/Message');

const app = express();
const bcryptSalt = bcrypt.genSaltSync(12);
const jwtSecret = 'fasd213gfuad34yhgy5i3u';

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    credentials: true,
    origin: 'http://localhost:5173',
}));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Multer setup for uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, unique + '-' + file.originalname);
    },
});
const upload = multer({ storage });

// Upload route
app.post('/api/upload', upload.array('media', 10), (req, res) => {
    const files = req.files.map(file => ({
        type: file.mimetype.startsWith('video') ? 'video' : 'image',
        url: `http://localhost:4000/uploads/${file.filename}`
    }));
    res.json(files);
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log('Connected to MongoDB'))
    .catch((error) => console.error('MongoDB connection error:', error));

/* ========== HOTEL ROUTES ========== */

app.get('/api/hotels', async (req, res) => {
    try {
        const hotels = await Hotel.find().populate('user', 'name');
        res.json(hotels);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch hotels' });
    }
});

app.post('/api/hotels', async (req, res) => {
    const { name, location, pricePerNight, rating, image, user, description, media } = req.body;
    try {
        const hotel = await Hotel.create({ name, location, pricePerNight, rating, image, user, description, media });
        res.json(hotel);
    } catch (error) {
        res.status(500).json({ error: 'Failed to add hotel' });
    }
});

app.get('/api/hotels/:id', async (req, res) => {
    try {
        const hotel = await Hotel.findById(req.params.id).populate('user', 'name');
        if (!hotel) return res.status(404).json({ error: 'Hotel not found' });
        res.json(hotel);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch hotel details' });
    }
});

app.put('/api/hotels/:id', async (req, res) => {
    const { id } = req.params;
    const { name, location, pricePerNight, rating, image, description, media } = req.body;
    try {
        const updatedHotel = await Hotel.findByIdAndUpdate(
            id,
            { name, location, pricePerNight, rating, image, description, media },
            { new: true }
        ).populate('user', 'name');
        res.json(updatedHotel);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update hotel' });
    }
});

app.delete('/api/hotels/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await Hotel.findByIdAndDelete(id);
        res.json({ message: 'Hotel deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete hotel' });
    }
});

/* ========== AUTH ROUTES ========== */

app.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const userDoc = await User.create({
            name,
            email,
            password: bcrypt.hashSync(password, bcryptSalt),
        });
        res.json(userDoc);
    } catch (e) {
        res.status(422).json(e);
    }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const userDoc = await User.findOne({ email });
    if (userDoc) {
        const passOk = bcrypt.compareSync(password, userDoc.password);
        if (passOk) {
            jwt.sign({ email: userDoc.email, id: userDoc._id, name: userDoc.name }, jwtSecret, {}, (err, token) => {
                if (err) throw err;
                res.cookie('token', token, { httpOnly: true }).json({
                    token,
                    id: userDoc._id,
                    name: userDoc.name,
                    email: userDoc.email,
                });
            });
        } else {
            res.status(422).json({ error: 'Invalid password' });
        }
    } else {
        res.status(404).json({ error: 'User not found' });
    }
});

app.get('/profile', (req, res) => {
    const { token } = req.cookies;
    if (token) {
        jwt.verify(token, jwtSecret, {}, (err, userData) => {
            if (err) return res.status(403).json('Invalid token');
            res.json(userData);
        });
    } else {
        res.status(401).json('Not authenticated');
    }
});

/* ========== CHAT ROUTES ========== */

// Get all users
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find({}, '_id name email');
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Send a message
app.post('/api/messages', async (req, res) => {
    const { senderId, receiverId, message } = req.body;
    try {
        const newMessage = await Message.create({ sender: senderId, receiver: receiverId, message });
        res.json(newMessage);
    } catch (err) {
        res.status(500).json({ error: 'Failed to send message' });
    }
});

// Get messages between two users
app.get('/api/messages/:user1/:user2', async (req, res) => {
    const { user1, user2 } = req.params;
    try {
        const messages = await Message.find({
            $or: [
                { sender: user1, receiver: user2 },
                { sender: user2, receiver: user1 }
            ]
        }).sort({ timestamp: 1 });
        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

// Delete chat between two users
app.delete('/api/messages/:user1/:user2', async (req, res) => {
    const { user1, user2 } = req.params;
    try {
        await Message.deleteMany({
            $or: [
                { sender: user1, receiver: user2 },
                { sender: user2, receiver: user1 }
            ]
        });
        res.json({ message: 'Chat deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete chat' });
    }
});

// Get users the current user has chatted with
app.get('/api/chatted-users/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const messages = await Message.find({
            $or: [
                { sender: userId },
                { receiver: userId }
            ]
        });

        const userIds = new Set();
        messages.forEach(msg => {
            if (msg.sender.toString() !== userId) userIds.add(msg.sender.toString());
            if (msg.receiver.toString() !== userId) userIds.add(msg.receiver.toString());
        });

        const users = await User.find({ _id: { $in: Array.from(userIds) } }, '_id name email');
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch chatted users' });
    }
});

/* ========== SERVER ========== */

const PORT = 4000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use.`);
        process.exit(1);
    } else {
        console.error('Server error:', err);
    }
});
