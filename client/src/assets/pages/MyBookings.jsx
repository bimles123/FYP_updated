import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function MyBookings() {
  const [myBookings, setMyBookings] = useState([]);
  const [receivedBookings, setReceivedBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showEsewaModal, setShowEsewaModal] = useState(false);
  const [signature, setSignature] = useState('');
  const [transactionUUID, setTransactionUUID] = useState('');
  const [justPaidBookingId, setJustPaidBookingId] = useState(null);
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser?.id) {
      axios.get(`/api/my-bookings/${currentUser.id}`)
        .then(res => {
          setMyBookings(res.data.myBookings);
          setReceivedBookings(res.data.bookingsForMyHotels);
        })
        .catch(err => console.error("Error loading booking data", err));
    }
  }, [currentUser]);

  const handleAccept = async (bookingId) => {
    try {
      await axios.put(`/api/bookings/${bookingId}/accept`);
      setReceivedBookings(prev =>
        prev.map(b => b._id === bookingId ? { ...b, status: 'accepted' } : b)
      );
    } catch {
      alert("Failed to accept booking");
    }
  };

  const handleCancel = async (bookingId) => {
    try {
      await axios.put(`/api/bookings/${bookingId}/cancel`);
      setReceivedBookings(prev =>
        prev.map(b => b._id === bookingId ? { ...b, status: 'rejected' } : b)
      );
    } catch {
      alert("Failed to cancel booking");
    }
  };

  const handleClear = async (bookingId) => {
    try {
      await axios.delete(`/api/bookings/${bookingId}/clear`);
      setMyBookings(prev => prev.filter(b => b._id !== bookingId));
    } catch {
      alert("Failed to clear this notification");
    }
  };

  const handleChat = (user) => {
    localStorage.setItem("chatReceiverId", user._id);
    localStorage.setItem("chatReceiverName", user.name);
    localStorage.setItem("chatReceiverEmail", user.email);
    navigate("/chat");
  };

  const calculateNights = (checkIn, checkOut) => {
    const diff = new Date(checkOut) - new Date(checkIn);
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const openEsewaModal = async (booking) => {
    const nights = calculateNights(booking.checkIn, booking.checkOut);
    const price = booking.hotel?.pricePerNight || 0;
    const total_amount = parseFloat(price * nights).toFixed(2);
    const transaction_uuid = `TXN-${Date.now()}`;
    setTransactionUUID(transaction_uuid);

    try {
      const res = await axios.post('/api/generate-esewa-signature', {
        total_amount,
        transaction_uuid,
        product_code: "EPAYTEST",
      });
      setSignature(res.data.signature);
      setSelectedBooking(booking);
      setShowEsewaModal(true);
      setJustPaidBookingId(null);
    } catch (err) {
      console.error("Error getting signature", err);
      alert("Failed to prepare payment.");
    }
  };

  const closeEsewaModal = () => {
    setShowEsewaModal(false);
    setSelectedBooking(null);
    setSignature('');
    setTransactionUUID('');
  };

  const markPaidLocally = (bookingId) => {
    setMyBookings(prev =>
      prev.map(b => b._id === bookingId ? { ...b, paid: true } : b)
    );
  };

  const requestRefund = (booking) => {
    const hotelOwner = booking.hotel?.user;
    if (!hotelOwner) return alert("Hotel owner not found.");
    const message = `Hello, I would like to request a refund for booking: ${booking._id}`;
    axios.post("/api/messages", {
      senderId: currentUser.id,
      receiverId: hotelOwner._id,
      message,
    }).then(() => {
      alert("Refund request sent.");
    }).catch(() => {
      alert("Failed to send refund request.");
    });
  };

  const hasPaid = (bookingId) => {
    const data = JSON.parse(localStorage.getItem(`paid_${bookingId}`));
    return data?.status === 'PAID';
  };

  useEffect(() => {
    const handleFocus = async () => {
      if (justPaidBookingId) {
        localStorage.setItem(`paid_${justPaidBookingId}`, JSON.stringify({ status: 'PAID' }));
        markPaidLocally(justPaidBookingId);

        try {
          const res = await axios.get(`/api/my-bookings/${currentUser.id}`);
          setMyBookings(res.data.myBookings);
          setReceivedBookings(res.data.bookingsForMyHotels);

          const paidBooking = res.data.myBookings.find(b => b._id === justPaidBookingId);
          if (paidBooking && paidBooking.hotel?.user?._id) {
            await axios.post("/api/messages", {
              senderId: paidBooking.hotel.user._id,
              receiverId: currentUser.id,
              message: `💰 Payment received for your booking at "${paidBooking.hotel.name}". Thank you!`
            });
            console.log("✅ Payment message sent.");
          } else {
            console.warn("⚠️ Booking not found or hotel.user missing");
          }
        } catch (err) {
          console.error("❌ Error sending payment confirmation:", err);
        }

        setJustPaidBookingId(null);
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [justPaidBookingId, currentUser]);

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
            const price = b.hotel?.pricePerNight || 0;
            const total = (price * nights).toFixed(2);
            const paid = hasPaid(b._id);

            return (
              <div key={i} className="border p-4 rounded mb-4 shadow bg-white">
                <div className="text-lg font-bold">{b.hotel?.name || "Hotel deleted"}</div>
                <div className="text-sm text-gray-500">{b.hotel?.location || "Unknown"}</div>
                <div className="text-sm">📅 {new Date(b.checkIn).toDateString()} to {new Date(b.checkOut).toDateString()}</div>
                <div className="text-sm text-green-600 font-semibold">Status: {b.status}</div>

                {b.status === 'accepted' && (
                  paid ? (
                    <button disabled className="mt-2 bg-gray-300 text-white px-4 py-2 rounded">✅ Paid</button>
                  ) : (
                    <button onClick={() => openEsewaModal(b)} className="mt-2 bg-green-500 text-white px-4 py-2 rounded">💸 Pay Now</button>
                  )
                )}

                <button onClick={() => handleClear(b._id)} className="mt-2 ml-3 bg-gray-300 text-sm px-3 py-1 rounded">🗑️ Clear</button>
              </div>
            );
          })
        )}
      </div>

      {/* Bookings Received */}
      <div>
        <h2 className="text-2xl font-semibold mb-4 text-purple-700">📥 Bookings Received on My Listings</h2>
        {receivedBookings.filter(b => b.status === 'pending').length === 0 ? (
          <p className="text-gray-500">No pending requests.</p>
        ) : (
          receivedBookings.filter(b => b.status === 'pending').map((b, i) => (
            <div key={i} className="border p-4 rounded mb-4 shadow bg-white">
              <div className="text-lg font-semibold">{b.hotel?.name || "Hotel deleted"}</div>
              <div className="text-sm text-gray-500">👤 {b.user?.name || "Unknown"} ({b.user?.email})</div>
              <div className="text-sm">📅 {new Date(b.checkIn).toDateString()} to {new Date(b.checkOut).toDateString()}</div>
              <div className="flex gap-2 mt-3">
                <button onClick={() => handleAccept(b._id)} className="bg-green-500 text-white px-4 py-1 rounded">✅ Accept</button>
                <button onClick={() => handleCancel(b._id)} className="bg-red-500 text-white px-4 py-1 rounded">❌ Reject</button>
                <button onClick={() => handleChat(b.user)} className="bg-blue-500 text-white px-4 py-1 rounded">💬 Chat</button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* eSewa Modal */}
      {showEsewaModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded p-6 w-full max-w-md relative">
            <button onClick={closeEsewaModal} className="absolute top-2 right-3 text-red-600">✖</button>
            <h2 className="text-lg font-semibold mb-4 text-green-600">Confirm Payment</h2>

            <form
              action="https://rc-epay.esewa.com.np/api/epay/main/v2/form"
              method="POST"
              target="_blank"
              onSubmit={() => setJustPaidBookingId(selectedBooking._id)}
            >
              <input type="hidden" name="amount" value={((selectedBooking.hotel?.pricePerNight || 0) * calculateNights(selectedBooking.checkIn, selectedBooking.checkOut)).toFixed(2)} />
              <input type="hidden" name="tax_amount" value="0" />
              <input type="hidden" name="total_amount" value={((selectedBooking.hotel?.pricePerNight || 0) * calculateNights(selectedBooking.checkIn, selectedBooking.checkOut)).toFixed(2)} />
              <input type="hidden" name="transaction_uuid" value={transactionUUID} />
              <input type="hidden" name="product_code" value="EPAYTEST" />
              <input type="hidden" name="product_service_charge" value="0" />
              <input type="hidden" name="product_delivery_charge" value="0" />
              <input type="hidden" name="success_url" value="https://developer.esewa.com.np/success" />
              <input type="hidden" name="failure_url" value="https://developer.esewa.com.np/failure" />
              <input type="hidden" name="signed_field_names" value="total_amount,transaction_uuid,product_code" />
              <input type="hidden" name="signature" value={signature} />

              <p className="text-sm mb-3">
                Paying रु {selectedBooking.hotel?.pricePerNight || 0} x {calculateNights(selectedBooking.checkIn, selectedBooking.checkOut)} nights
              </p>
              <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded text-sm w-full">
                Proceed to eSewa
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
