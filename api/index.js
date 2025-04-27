// Required modules
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const path = require('path');
const Report = require('./models/Report');
require('dotenv').config();



// Models
const User = require('./models/User');
const Hotel = require('./models/Hotel');
const Message = require('./models/Message');
const Booking = require('./models/Booking');

const app = express();
const bcryptSalt = bcrypt.genSaltSync(12);
const jwtSecret = 'fasd213gfuad34yhgy5i3u';

// Middleware setup
app.use(express.json());
app.use(cookieParser());
app.use(cors({ credentials: true, origin: 'http://localhost:5173' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Multer config for file uploads
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
  try {
    const files = req.files.map(file => ({
      type: file.mimetype.startsWith('video') ? 'video' : 'image',
      url: `http://localhost:4000/uploads/${file.filename}`
    }));
    res.json(files);
  } catch (error) {
    console.error("Error uploading media:", error);
    res.status(500).json({ error: 'Error uploading media', details: error.message });
  }
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error));

/* ========== HOTEL ROUTES ========== */

// Get all hotels
app.get('/api/hotels', async (req, res) => {
  try {
    const hotels = await Hotel.find().populate('user', 'name');
    res.json(hotels);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch hotels' });
  }
});

// Create a hotel
app.post('/api/hotels', async (req, res) => {
  const { name, location, pricePerNight, stars, image, user, description, media } = req.body;
  try {
    const hotel = await Hotel.create({
      name,
      location,
      pricePerNight,
      stars,
      image,
      user,
      description,
      media
    });
    res.json(hotel);
  } catch (error) {
    console.error("Error creating hotel:", error);
    res.status(500).json({ error: 'Failed to add hotel', details: error.message });
  }
});

// Get a single hotel by ID
app.get('/api/hotels/:id', async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id).populate('user', 'name');
    if (!hotel) return res.status(404).json({ error: 'Hotel not found' });
    res.json(hotel);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch hotel details' });
  }
});

// Update hotel details
app.put('/api/hotels/:id', async (req, res) => {
  const { id } = req.params;
  const { name, location, pricePerNight, stars, image, description, media } = req.body;
  try {
    const updatedHotel = await Hotel.findByIdAndUpdate(
      id,
      { name, location, pricePerNight, stars, image, description, media },
      { new: true }
    ).populate('user', 'name');
    res.json(updatedHotel);
  } catch (err) {
    console.error("Error updating hotel:", err);
    res.status(500).json({ error: 'Failed to update hotel', details: err.message });
  }
});

// Delete a hotel
app.delete('/api/hotels/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await Hotel.findByIdAndDelete(id);
    res.json({ message: 'Hotel deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete hotel' });
  }
});

// Add media to a hotel (with logging and validation)
app.post('/api/hotels/:id/media', async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    console.log("Incoming media upload:", req.body.media);

    if (!Array.isArray(req.body.media)) {
      return res.status(400).json({ error: "Media must be an array" });
    }

    hotel.media.push(...req.body.media);
    await hotel.save();
    res.json(hotel);
  } catch (err) {
    console.error("Failed to add media:", err);
    res.status(500).json({ error: 'Failed to add media', details: err.message });
  }
});

// Delete media from hotel by index
app.delete('/api/hotels/:hotelId/media/:index', async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.hotelId);
    hotel.media.splice(req.params.index, 1);
    await hotel.save();
    res.json(hotel);
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete media' });
  }
});

//Report to admin

app.post('/api/report-hotel', async (req, res) => {
  const { hotelId, reporterId, reason, details } = req.body;

  try {
    const report = await Report.create({
      hotel: hotelId,
      reporter: reporterId,
      reason,
      details
    });

    res.json({ success: true, message: 'Report submitted to admin.', report });
  } catch (err) {
    console.error("Error reporting hotel:", err);
    res.status(500).json({ error: 'Failed to send report' });
  }
});



//fetch admin message

app.get('/api/messages-to-admin/:adminId', async (req, res) => {
  try {
    const messages = await Message.find({ receiver: req.params.adminId })
      .populate('sender', 'name email')
      .sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    console.error("Error fetching admin messages:", err);
    res.status(500).json({ error: 'Failed to load messages' });
  }
});

// Get all hotel reports (admin use)
app.get('/api/admin/reports', async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('reporter', 'name email')
      .populate('hotel', 'name')
      .sort({ createdAt: -1 });

    res.json(reports);
  } catch (err) {
    console.error("Failed to load reports", err);
    res.status(500).json({ error: 'Could not fetch reports' });
  }
});

// Delete a report (admin use)
app.delete('/api/admin/reports/:id', async (req, res) => {
  try {
    await Report.findByIdAndDelete(req.params.id);
    res.json({ message: 'Report cleared successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete report' });
  }
});



// ========== AUTH ROUTES ==========

// Register user
app.post('/register', async (req, res) => {
  const { name, email, password, adminCode } = req.body;

  let role = 'user';
  if (adminCode && adminCode === process.env.ADMIN_SECRET) {
    role = 'admin';
  }

  try {
    const userDoc = await User.create({
      name,
      email,
      password: bcrypt.hashSync(password, bcryptSalt),
      role,
    });
    res.json(userDoc);
  } catch (e) {
    res.status(422).json(e);
  }
});


// Login user
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const userDoc = await User.findOne({ email });

  if (userDoc) {
    const passOk = bcrypt.compareSync(password, userDoc.password);
    if (passOk) {
      jwt.sign(
        {
          email: userDoc.email,
          id: userDoc._id,
          name: userDoc.name,
          role: userDoc.role,
        },
        jwtSecret,
        {},
        (err, token) => {
          if (err) throw err;
          res.cookie('token', token, { httpOnly: true }).json({
            token,
            id: userDoc._id,
            name: userDoc.name,
            email: userDoc.email,
            role: userDoc.role,
          });
        }
      );
    } else {
      res.status(422).json({ error: 'Invalid password' });
    }
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});


// Get profile from cookie token
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

// ========== CHAT ROUTES ==========

// Get all users
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({}, '_id name email');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Send message
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

// Delete messages between two users
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

// Get users chatted with
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

// ========== BOOKINGS ROUTES ==========

// Book a hotel
app.post('/api/bookings', async (req, res) => {
  const { hotelId, userId, checkIn, checkOut } = req.body;
  try {
    const existingBooking = await Booking.findOne({
      hotel: hotelId,
      user: userId,
      $or: [
        { checkIn: { $lte: checkOut }, checkOut: { $gte: checkIn } }
      ]
    });

    if (existingBooking) {
      return res.status(400).json({ error: 'You already have a booking that overlaps with this range.' });
    }

    const hotel = await Hotel.findById(hotelId);
    if (!hotel) return res.status(404).json({ error: 'Hotel not found' });

    const newBooking = await Booking.create({ hotel: hotelId, user: userId, checkIn, checkOut });
    res.json(newBooking);
  } catch (err) {
    res.status(500).json({ error: 'Booking failed.' });
  }
});

// Get bookings for a user (made and received)
app.get('/api/my-bookings/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const myBookings = await Booking.find({ user: userId }).populate('hotel');
    const listedHotels = await Hotel.find({ user: userId }).select('_id');
    const hotelIds = listedHotels.map(h => h._id);
    const bookingsForMyHotels = await Booking.find({ hotel: { $in: hotelIds } }).populate('hotel').populate('user');
    res.json({ myBookings, bookingsForMyHotels });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load booking data' });
  }
});

// Accept booking
app.put('/api/bookings/:id/accept', async (req, res) => {
  try {
    const updated = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: 'accepted' },
      { new: true }
    ).populate('user').populate('hotel');

    await Message.create({
      sender: updated.hotel.user,
      receiver: updated.user._id,
      message: `✅ Your booking for "${updated.hotel.name}" from ${new Date(updated.checkIn).toDateString()} to ${new Date(updated.checkOut).toDateString()} has been accepted.`
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to accept booking' });
  }
});

// Cancel booking
app.put('/api/bookings/:id/cancel', async (req, res) => {
  try {
    const updated = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected' },
      { new: true }
    ).populate('user').populate('hotel');

    await Message.create({
      sender: updated.hotel.user,
      receiver: updated.user._id,
      message: `❌ Your booking for "${updated.hotel.name}" from ${new Date(updated.checkIn).toDateString()} to ${new Date(updated.checkOut).toDateString()} has been rejected.`
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
});

// Clear a booking
app.delete('/api/bookings/:id/clear', async (req, res) => {
  try {
    await Booking.findByIdAndDelete(req.params.id);
    res.json({ message: 'Booking cleared successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to clear booking' });
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
