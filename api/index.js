const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const User = require('./models/User'); 
const Hotel = require('./models/Hotel'); // Import Hotel model

const app = express();

const bcryptSalt = bcrypt.genSaltSync(12);
const jwtSecret = 'fasd213gfuad34yhgy5i3u';

app.use(express.json());
app.use(cors({
    credentials: true,
    origin: 'http://localhost:5173',
}));

// MongoDB connection
mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log('Connected to MongoDB'))
    .catch((error) => console.error('MongoDB connection error:', error));

// Hotel Routes
app.get('/api/hotels', async (req, res) => {
    try {
        const hotels = await Hotel.find(); // Fetch all hotels
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

// User Authentication Routes
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
            jwt.sign({ email: userDoc.email, id: userDoc._id }, jwtSecret, {}, (err, token) => {
                if (err) throw err;
                res.cookie('token', token).json('pass ok');
            });
        } else {
            res.status(422).json('pass not ok');
        }
    } else {
        res.json('not found');
    }
});

// Handle "address already in use" error
const PORT = 4000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use.`);
        process.exit(1); // Exit the process to avoid conflicts
    } else {
        console.error('Server error:', err);
    }
});
