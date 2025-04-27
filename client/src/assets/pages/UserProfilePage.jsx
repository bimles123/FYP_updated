import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";

const UserProfilePage = () => {
  const { userId } = useParams();
  const [userData, setUserData] = useState(null);
  const [userHotels, setUserHotels] = useState([]);
  const [editingHotelId, setEditingHotelId] = useState(null);
  const [editedHotel, setEditedHotel] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showUpdateError, setShowUpdateError] = useState(false);
  const [showDeleteError, setShowDeleteError] = useState(false);
  const [hotelToDelete, setHotelToDelete] = useState(null);

  const currentUser = JSON.parse(localStorage.getItem("user"));
  const isOwnProfile = currentUser?.id === userId;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("/api/users");
        const user = res.data.find((u) => u._id === userId);
        setUserData(user);
      } catch (err) {
        console.error("Failed to fetch user profile:", err);
      }
    };

    const fetchHotelsByUser = async () => {
      try {
        const res = await axios.get("/api/hotels");
        const filtered = res.data.filter(hotel => hotel.user?._id === userId && !hotel.isDeleted);
        setUserHotels(filtered);
      } catch (err) {
        console.error("Failed to fetch user hotels:", err);
      }
    };

    fetchUser();
    fetchHotelsByUser();
  }, [userId]);

  const handleChatNow = () => {
    localStorage.setItem("chatReceiverId", userData._id);
    localStorage.setItem("chatReceiverName", userData.name);
    navigate("/chat");
  };

  const startEdit = (hotel) => {
    setEditingHotelId(hotel._id);
    setEditedHotel({ ...hotel });
  };

  const saveChanges = async (hotelId) => {
    try {
      const res = await axios.put(`/api/hotels/${hotelId}`, editedHotel);
      const updated = userHotels.map(h => h._id === hotelId ? { ...res.data, user: h.user } : h);
      setUserHotels(updated);
      setEditingHotelId(null);
    } catch (err) {
      console.error("Failed to update hotel:", err);
      setShowUpdateError(true);
    }
  };

  const confirmDelete = (hotelId) => {
    setHotelToDelete(hotelId);
    setShowDeleteConfirm(true);
  };

  const deleteHotel = async () => {
    try {
      await axios.delete(`/api/hotels/${hotelToDelete}`, {
        data: { userId: currentUser.id }
      });
      setUserHotels(userHotels.filter(h => h._id !== hotelToDelete));
    } catch (err) {
      console.error("Failed to delete hotel:", err);
      setShowDeleteError(true);
    } finally {
      setShowDeleteConfirm(false);
      setHotelToDelete(null);
    }
  };

  if (!userData) {
    return <div className="text-center mt-20 text-gray-600">Loading profile...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto mt-24 p-6 border shadow rounded bg-white">
      <h1 className="text-2xl font-bold mb-4">User Profile</h1>
      <p><strong>Name:</strong> {userData.name}</p>
      <p><strong>Email:</strong> {userData.email}</p>

      {isOwnProfile ? (
        <div className="mt-4 text-green-600 italic">This is your own profile.</div>
      ) : (
        <button
          onClick={handleChatNow}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Chat Now
        </button>
      )}

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Listed Hotels</h2>
        {userHotels.length === 0 ? (
          <p className="text-gray-500">No hotels listed.</p>
        ) : (
          userHotels.map((hotel) => (
            <div key={hotel._id} className="border p-4 mb-4 rounded bg-gray-50">
              {editingHotelId === hotel._id ? (
                <>
                  <input type="text" className="w-full mb-2 p-2 border rounded" value={editedHotel.name} onChange={(e) => setEditedHotel({ ...editedHotel, name: e.target.value })} />
                  <input type="text" className="w-full mb-2 p-2 border rounded" value={editedHotel.location} onChange={(e) => setEditedHotel({ ...editedHotel, location: e.target.value })} />
                  <input type="number" className="w-full mb-2 p-2 border rounded" value={editedHotel.pricePerNight} onChange={(e) => setEditedHotel({ ...editedHotel, pricePerNight: e.target.value })} />
                  <input type="number" className="w-full mb-2 p-2 border rounded" value={editedHotel.stars} onChange={(e) => setEditedHotel({ ...editedHotel, stars: e.target.value })} min={1} max={5} step={1} />
                  <input type="text" className="w-full mb-2 p-2 border rounded" value={editedHotel.image} onChange={(e) => setEditedHotel({ ...editedHotel, image: e.target.value })} />
                  <textarea className="w-full p-2 mb-2 border rounded" value={editedHotel.description || ""} onChange={(e) => setEditedHotel({ ...editedHotel, description: e.target.value })} />
                  <div className="flex gap-2">
                    <button onClick={() => saveChanges(hotel._id)} className="bg-green-600 text-white px-3 py-1 rounded">Save</button>
                    <button onClick={() => setEditingHotelId(null)} className="bg-gray-300 px-3 py-1 rounded">Cancel</button>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-semibold">{hotel.name}</h3>
                  <p><strong>Location:</strong> {hotel.location}</p>
                  <p><strong>Price:</strong> रु{hotel.pricePerNight}</p>
                  <p><strong>Status:</strong> {hotel.stars} Star</p>
                  <p><strong>Description:</strong> {hotel.description || "No description."}</p>
                  <Link to={`/hotel/${hotel._id}`} className="text-blue-500 flex items-center gap-1 mt-2 hover:underline">
                    View Hotel
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                  {currentUser?.id === hotel.user?._id && (
                    <div className="flex gap-4 mt-2">
                      <button onClick={() => startEdit(hotel)} className="text-blue-600 text-sm hover:underline">Edit</button>
                      <button onClick={() => confirmDelete(hotel._id)} className="text-red-600 text-sm hover:underline">Delete</button>
                    </div>
                  )}
                </>
              )}
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-md w-full text-center">
            <h2 className="text-xl font-semibold text-red-600 mb-3">Delete Hotel</h2>
            <p className="text-gray-700 mb-6">Are you sure you want to delete this hotel?</p>
            <div className="flex justify-center gap-4">
              <button onClick={deleteHotel} className="bg-red-600 text-white px-5 py-2 rounded hover:bg-red-700">Yes, Delete</button>
              <button onClick={() => setShowDeleteConfirm(false)} className="bg-gray-300 px-5 py-2 rounded">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Update Error Modal */}
      {showUpdateError && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-md w-full text-center">
            <h2 className="text-xl font-semibold text-red-600 mb-3">Update Failed</h2>
            <p className="text-gray-700 mb-6">Could not update the hotel. Please try again.</p>
            <button onClick={() => setShowUpdateError(false)} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded">Got it</button>
          </div>
        </div>
      )}

      {/* Delete Error Modal */}
      {showDeleteError && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-md w-full text-center">
            <h2 className="text-xl font-semibold text-red-600 mb-3">Delete Failed</h2>
            <p className="text-gray-700 mb-6">Could not delete the hotel. Please try again.</p>
            <button onClick={() => setShowDeleteError(false)} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded">Got it</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfilePage;
