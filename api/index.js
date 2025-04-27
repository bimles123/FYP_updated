const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const User = require('./models/User'); 
const Hotel = require('./models/Hotel'); 

const app = express();

const bcryptSalt = bcrypt.genSaltSync(12);
const jwtSecret = 'fasd213gfuad34yhgy5i3u';

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    credentials: true,
    origin: 'http://localhost:5173',
}));

mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log('Connected to MongoDB'))
    .catch((error) => console.error('MongoDB connection error:', error));

// Hotel Routes
app.get('/api/hotels', async (req, res) => {
    try {
        const hotels = await Hotel.find();
        res.json(hotels);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch hotels' });
    }
});

app.post('/api/hotels', async (req, res) => {
    const { name, location, pricePerNight, rating, image } = req.body;
    try {
        const hotel = await Hotel.create({ name, location, pricePerNight, rating, image });
        res.json(hotel);
    } catch (error) {
        res.status(500).json({ error: 'Failed to add hotel' });
    }
});

// Registration
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

// Login
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

// Get Profile
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

// Server
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
