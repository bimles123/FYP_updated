import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function MyBookings() {
  const [myBookings, setMyBookings] = useState([]);
  const [receivedBookings, setReceivedBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showEsewaModal, setShowEsewaModal] = useState(false);
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

  const openEsewaModal = (booking) => {
    setSelectedBooking(booking);
    setShowEsewaModal(true);
  };

  const closeEsewaModal = () => {
    setSelectedBooking(null);
    setShowEsewaModal(false);
  };

  const calculateNights = (checkIn, checkOut) => {
    const diff = new Date(checkOut) - new Date(checkIn);
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
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
          myBookings.map((b, i) => {
            const nights = calculateNights(b.checkIn, b.checkOut);
            const total = (b.hotel.pricePerNight * nights).toFixed(2);

            return (
              <div key={i} className="border border-gray-200 bg-white rounded-lg shadow p-4 mb-4">
                <div className="text-lg font-semibold text-gray-800">
                  {b.hotel ? b.hotel.name : "❌ Hotel deleted - details unavailable"}
                </div>
                <div className="text-sm text-gray-500">{b.hotel?.location || "Location unknown"}</div>
                <div className="text-sm mt-1">📅 Check-in: {new Date(b.checkIn).toDateString()}</div>
                <div className="text-sm">📅 Check-out: {new Date(b.checkOut).toDateString()}</div>
                <div className="text-sm mt-1 font-medium text-green-600 capitalize">Status: {b.status}</div>

                {b.status === 'accepted' && (
                  <button
                    onClick={() => openEsewaModal(b)}
                    className="mt-3 bg-green-500 hover:bg-green-600 text-white text-sm px-4 py-2 rounded"
                  >
                    💸 Pay Now
                  </button>
                )}

                <button
                  onClick={() => handleClear(b._id)}
                  className="mt-3 ml-3 bg-gray-200 hover:bg-gray-300 text-sm text-gray-700 px-3 py-1 rounded"
                >
                  🗑️ Clear
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Bookings Received */}
      <div>
        <h2 className="text-2xl font-semibold mb-4 text-purple-700">📥 Bookings Received on My Listings</h2>
        {receivedBookings.filter(b => b.status === 'pending').length === 0 ? (
          <p className="text-gray-500">No pending requests on your listings.</p>
        ) : (
          receivedBookings
            .filter(b => b.status === 'pending')
            .map((b, i) => (
              <div key={i} className="border border-gray-200 bg-white rounded-lg shadow p-4 mb-4">
                <div className="text-lg font-semibold text-gray-800">{b.hotel?.name || "❌ Hotel deleted"}</div>
                <div className="text-sm text-gray-500 mt-1">
                  👤 Booked by: {b.user?.name || "Unknown"} ({b.user?.email || "Unknown"})
                </div>
                <div className="text-sm mt-1">📅 Check-in: {new Date(b.checkIn).toDateString()}</div>
                <div className="text-sm">📅 Check-out: {new Date(b.checkOut).toDateString()}</div>
                <div className="text-sm mt-1 font-medium text-blue-700 capitalize">Status: {b.status}</div>

                <div className="flex gap-3 mt-4">
                  <button onClick={() => handleAccept(b._id)} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm">✅ Accept</button>
                  <button onClick={() => handleCancel(b._id)} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm">❌ Reject</button>
                  <button onClick={() => handleChat(b.user)} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm">💬 Chat</button>
                </div>
              </div>
            ))
        )}
      </div>

      {/* eSewa Modal - DEMO VERSION */}
      {showEsewaModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-md max-w-lg w-full relative">
            <button onClick={closeEsewaModal} className="absolute top-2 right-3 text-red-600 text-xl">✖</button>
            <h2 className="text-xl font-semibold mb-4 text-green-700">eSewa Payment (Demo)</h2>

            <form
              action="https://rc-epay.esewa.com.np/api/epay/main/v2/form"
              method="POST"
              target="_blank"
            >
              <input type="hidden" name="amount" value={selectedBooking.hotel.pricePerNight} />
              <input type="hidden" name="tax_amount" value="0" />
              <input type="hidden" name="total_amount" value={(selectedBooking.hotel.pricePerNight * calculateNights(selectedBooking.checkIn, selectedBooking.checkOut)).toFixed(2)} />
              <input type="hidden" name="transaction_uuid" value={selectedBooking._id} />
              <input type="hidden" name="product_code" value="EPAYTEST" />
              <input type="hidden" name="product_service_charge" value="0" />
              <input type="hidden" name="product_delivery_charge" value="0" />
              <input type="hidden" name="success_url" value="https://developer.esewa.com.np/success" />
              <input type="hidden" name="failure_url" value="https://developer.esewa.com.np/failure" />

              <div className="text-sm mb-4">
                <p><strong>Hotel:</strong> {selectedBooking.hotel.name}</p>
                <p><strong>Amount:</strong> रु {selectedBooking.hotel.pricePerNight.toFixed(2)} × {calculateNights(selectedBooking.checkIn, selectedBooking.checkOut)} nights</p>
                <p><strong>Total:</strong> रु {(selectedBooking.hotel.pricePerNight * calculateNights(selectedBooking.checkIn, selectedBooking.checkOut)).toFixed(2)}</p>
              </div>

              <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded text-sm">
                Proceed to eSewa
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
