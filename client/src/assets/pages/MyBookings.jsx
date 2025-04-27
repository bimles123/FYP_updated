import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function MyBookings() {
  const [myBookings, setMyBookings] = useState([]);
  const [receivedBookings, setReceivedBookings] = useState([]);
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`/api/my-bookings/${currentUser.id}`);
        setMyBookings(res.data.myBookings);
        setReceivedBookings(res.data.bookingsForMyHotels);
      } catch (err) {
        console.error("Error loading booking data", err);
      }
    };
    if (currentUser?.id) fetchData();
  }, [currentUser]);

  const handleAccept = async (bookingId) => {
    try {
      await axios.put(`/api/bookings/${bookingId}/accept`);
      setReceivedBookings(prev =>
        prev.map(b => b._id === bookingId ? { ...b, status: 'accepted' } : b)
      );
    } catch (err) {
      alert("Failed to accept booking");
    }
  };

  const handleCancel = async (bookingId) => {
    try {
      await axios.put(`/api/bookings/${bookingId}/cancel`);
      setReceivedBookings(prev =>
        prev.map(b => b._id === bookingId ? { ...b, status: 'rejected' } : b)
      );
    } catch (err) {
      alert("Failed to cancel booking");
    }
  };

  const handleClear = async (bookingId) => {
    try {
      await axios.delete(`/api/bookings/${bookingId}/clear`);
      setMyBookings(prev => prev.filter(b => b._id !== bookingId));
    } catch (err) {
      console.error("Failed to clear booking", err);
      alert("Failed to clear this notification");
    }
  };

  const handleChat = (user) => {
    localStorage.setItem("chatReceiverId", user._id);
    localStorage.setItem("chatReceiverName", user.name);
    localStorage.setItem("chatReceiverEmail", user.email);
    navigate("/chat");
  };

  return (
    <div className="max-w-5xl mx-auto mt-20 p-4">
      <h1 className="text-3xl font-bold text-center mb-8">📘 My Bookings</h1>

      {/* Hotels I Booked */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-4 text-blue-700">📌 Hotels I Booked</h2>
        {myBookings.length === 0 ? (
          <p className="text-gray-500">No bookings found.</p>
        ) : (
          myBookings.map((b, i) => (
            <div key={i} className="border border-gray-200 bg-white rounded-lg shadow p-4 mb-4">
              <div className="text-lg font-semibold text-gray-800">{b.hotel.name}</div>
              <div className="text-sm text-gray-500">{b.hotel.location}</div>
              <div className="text-sm mt-1">
                📅 Check-in: {new Date(b.checkIn).toDateString()}
              </div>
              <div className="text-sm">
                📅 Check-out: {new Date(b.checkOut).toDateString()}
              </div>
              <div className="text-sm mt-1 font-medium text-green-600 capitalize">Status: {b.status}</div>
              <button
                onClick={() => handleClear(b._id)}
                className="mt-3 bg-gray-200 hover:bg-gray-300 text-sm text-gray-700 px-3 py-1 rounded"
              >
                🗑️ Clear
              </button>
            </div>
          ))
        )}
      </div>

      {/* Bookings Received on My Listings */}
      <div>
        <h2 className="text-2xl font-semibold mb-4 text-purple-700">📥 Bookings Received on My Listings</h2>
        {receivedBookings.filter(b => b.status === 'pending').length === 0 ? (
          <p className="text-gray-500">No pending requests on your listings.</p>
        ) : (
          receivedBookings
            .filter(b => b.status === 'pending')
            .map((b, i) => (
              <div key={i} className="border border-gray-200 bg-white rounded-lg shadow p-4 mb-4">
                <div className="text-lg font-semibold text-gray-800">{b.hotel.name}</div>
                <div className="text-sm text-gray-500 mt-1">
                  👤 Booked by: {b.user.name} ({b.user.email})
                </div>
                <div className="text-sm mt-1">
                  📅 Check-in: {new Date(b.checkIn).toDateString()}
                </div>
                <div className="text-sm">
                  📅 Check-out: {new Date(b.checkOut).toDateString()}
                </div>
                <div className="text-sm mt-1 font-medium text-blue-700 capitalize">Status: {b.status}</div>

                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => handleAccept(b._id)}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm"
                  >
                    ✅ Accept
                  </button>

                  <button
                    onClick={() => handleCancel(b._id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm"
                  >
                    ❌ Reject
                  </button>

                  <button
                    onClick={() => handleChat(b.user)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm"
                  >
                    💬 Chat
                  </button>
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
}
