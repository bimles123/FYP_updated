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
const AuditLog = require('./models/AuditLog');
const Payment = require("./models/Payment");





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
  
  const Review = require('./models/Review'); // 
  // Get all reviews for a hotel
app.get('/api/hotels/:id/reviews', async (req, res) => {
  try {
    const reviews = await Review.find({ hotel: req.params.id }).populate('user', 'name');
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load reviews' });
  }
});

// Record a payment (called after booking is marked as "paid")
app.post("/api/payments", async (req, res) => {
  try {
    const { userId, hotelId, amount } = req.body;
    const payment = await Payment.create({
      user: userId,
      hotel: hotelId,
      amount,
    });
    res.json(payment);
  } catch (err) {
    console.error("Payment creation failed:", err);
    res.status(500).json({ error: "Failed to record payment" });
  }
});

// Admin: Get all payments overview
app.get("/api/admin/payments", async (req, res) => {
  try {
    const payments = await Payment.find().populate("user hotel");
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch payments" });
  }
});

//asd

app.put("/api/admin/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Update the user status
    const user = await User.findByIdAndUpdate(id, { status }, { new: true });
    if (!user) return res.status(404).json({ error: "User not found" });

    // Soft-delete or restore all their hotels
    if (status === "banned") {
      await Hotel.updateMany({ user: id }, { isDeleted: true });
    } else if (status === "active") {
      await Hotel.updateMany({ user: id }, { isDeleted: false });
    }

    res.json(user);
  } catch (err) {
    console.error("Failed to update user status:", err);
    res.status(500).json({ error: "Server error" });
  }
});

//status

app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find({}, "-password"); // ✅ make sure 'status' is not excluded
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});


// Post a new review
app.post('/api/hotels/:id/reviews', async (req, res) => {
  const { comment, stars, userId } = req.body;  // <-- ✅ use 'stars'
  try {
    const existing = await Review.findOne({ hotel: req.params.id, user: userId });
    if (existing) return res.status(400).json({ error: "You've already reviewed this hotel." });

    const newReview = await Review.create({
      hotel: req.params.id,
      user: userId,
      stars,
      comment,
    });
    res.json(newReview);
  } catch (err) {
    console.error("❌ Error posting review:", err);
    res.status(500).json({ error: 'Failed to post review' });
  }
});

// DELETE a review
app.delete('/api/hotels/:hotelId/reviews/:reviewId', async (req, res) => {
  const { reviewId } = req.params;
  const userId = req.body.userId;

  try {
    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    if (review.user.toString() !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this review' });
    }

    await review.deleteOne();

    res.json({ success: true });
  } catch (err) {
    console.error('Delete review error:', err);
    res.status(500).json({ error: 'Failed to delete review' });
  }
});





//recent
  async function logAction({ action, user, targetType, targetId, details = {} }) {
    try {
      await AuditLog.create({ action, user, targetType, targetId, details });
    } catch (err) {
      console.error('Audit log failed:', err);
    }
  }
  
const esewaRoute = require('./esewaRoute');
app.use('/api', esewaRoute);

/* ========== HOTEL ROUTES ========== */

// Get all hotels
app.get('/api/hotels', async (req, res) => {
  try {
    // Only find hotels not soft-deleted, and populate user status
    const hotels = await Hotel.find({ isDeleted: false })
      .populate('user', 'name status');

    // Only return hotels where the user is not banned (or user info missing)
    const visibleHotels = hotels.filter(hotel => 
      !hotel.user || hotel.user.status !== "banned"
    );

    res.json(visibleHotels);
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


// Update cover image
app.put("/api/hotels/:id/cover", async (req, res) => {
  const { image } = req.body;
  try {
    const hotel = await Hotel.findByIdAndUpdate(
      req.params.id,
      { image },
      { new: true }
    );
    res.json(hotel);
  } catch (err) {
    console.error("Error updating cover image:", err);
    res.status(500).json({ error: "Failed to update cover image" });
  }
});


// Delete a hotel
app.delete('/api/hotels/:id', async (req, res) => {
  const hotelId = req.params.id;
  const userId = req.body.userId; // <- must be passed from frontend

  try {
    const futureBooking = await Booking.findOne({
      hotel: hotelId,
      checkOut: { $gte: new Date() },
      status: { $in: ['pending', 'accepted'] },
    });

    if (futureBooking) {
      return res.status(403).json({ error: 'Cannot delete hotel with active/future bookings.' });
    }

    await Hotel.findByIdAndUpdate(hotelId, { isDeleted: true });

    await logAction({
      action: 'soft-delete-hotel',
      user: userId,
      targetType: 'Hotel',
      targetId: hotelId,
      details: { reason: 'Deleted by user, no active bookings' }
    });

    res.json({ message: 'Hotel marked as deleted (soft deleted).' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete hotel' });
  }
});

//admin restore hotel

app.put('/api/admin/restore-hotel/:id', async (req, res) => {
  try {
    const updated = await Hotel.findByIdAndUpdate(
      req.params.id,
      { isDeleted: false },
      { new: true }
    ).populate('user'); // <-- important

    await logAction({
      action: "restore-hotel",
      user: req.body.adminId,
      targetType: "Hotel",
      targetId: updated._id,
      details: { name: updated.name }
    });

    // ✅ Send message to hotel owner
    await Message.create({
      sender: req.body.adminId,
      receiver: updated.user._id,
      message: `✅ Your hotel "${updated.name}" has been restored by admin.`
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to restore hotel" });
  }
});



//admin delete hotel

app.delete('/api/admin/permanent-delete-hotel/:id', async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id).populate('user');
    if (!hotel) return res.status(404).json({ error: "Hotel not found" });

    await hotel.deleteOne();

    await logAction({
      action: "permanent-delete-hotel",
      user: req.body.adminId,
      targetType: "Hotel",
      targetId: hotel._id,
      details: { name: hotel.name }
    });

    // ✅ Send message to hotel owner
    await Message.create({
      sender: req.body.adminId,
      receiver: hotel.user._id,
      message: `❌ Your hotel "${hotel.name}" has been permanently deleted by admin.`
    });

    res.json({ message: "Hotel permanently deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to permanently delete hotel" });
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

  if (!userDoc) {
    return res.status(404).json({ 
      
      error: 'User not found' });
  }

  // ✅ Check if user is banned
  if (userDoc.status === "banned") {
    return res.status(403).json({ error: '🚫 Your account has been banned.' });
  }

  const passOk = bcrypt.compareSync(password, userDoc.password);

  if (!passOk) {
    return res.status(422).json({ error: 'Invalid password' });
  }

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
        status: userDoc.status, // ✅ include status in response
      });
    }
  );
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
    // Fetch messages between the two users
    const messages = await Message.find({
      $or: [
        { sender: user1, receiver: user2 },
        { sender: user2, receiver: user1 }
      ]
    }).sort({ timestamp: 1 });
    
    // Mark messages received by user1 (current user) as read
    await Message.updateMany(
      { sender: user2, receiver: user1, isRead: false },
      { $set: { isRead: true } }
    );
    
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

//unread message

app.get('/api/unread-messages/:userId', async (req, res) => {
  try {
    const messages = await Message.find({
      receiver: req.params.userId,
      isRead: false
    })
    .populate('sender', 'name email')
    .sort({ timestamp: -1 })
    .limit(10); // latest 10

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch unread messages' });
  }
});

// Get all messages received by a user (for notifications)
app.get('/api/messages/:userId', async (req, res) => {
  try {
    const messages = await Message.find({
      receiver: req.params.userId
    })
    .populate('sender', 'name email')
    .sort({ timestamp: -1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch received messages' });
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

    // --- Send notification/message to hotel owner ---
    await Message.create({
      sender: userId,                // Booking user
      receiver: hotel.user,          // Hotel owner
      message: `🛎️ New booking request for your hotel "${hotel.name}" from ${new Date(checkIn).toDateString()} to ${new Date(checkOut).toDateString()}. Please review and accept or reject the request.`
    });
    // --------------------------------------------------

    res.json(newBooking);
  } catch (err) {
    res.status(500).json({ error: 'Booking failed.' });
  }
});


// Get bookings for a user (made and received)
app.get('/api/my-bookings/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const myBookings = await Booking.find({ user: userId }).populate({
      path: 'hotel',
      populate: { path: 'user', select: 'name email status' }
    })
    .populate({ path: 'user', select: 'name email status' });
    
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

    const payNowLink = `http://localhost:5173/payment/${updated._id}`;

    await Message.create({
      sender: updated.hotel.user,
      receiver: updated.user._id,
      message: `✅ Your booking for "${updated.hotel.name}" from ${new Date(updated.checkIn).toDateString()} to ${new Date(updated.checkOut).toDateString()} has been accepted.\n\n💳 Please proceed to payment via bookings`
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

//hotel status

app.put('/api/hotels/:id/status', async (req, res) => {
  const { isActive, userId } = req.body;
  const { id } = req.params;

  try {
    await Hotel.findByIdAndUpdate(id, { isActive });
    await logAction({
      action: isActive ? 'activated-hotel' : 'deactivated-hotel',
      user: userId,
      targetType: 'Hotel',
      targetId: id,
    });
    res.json({ message: `Hotel ${isActive ? 'activated' : 'deactivated'} successfully.` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update status' });
  }
});

//log for admin
app.get('/api/admin/logs', async (req, res) => {
  try {
    const logs = await AuditLog.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});


/* ========== SERVER ========== */
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
