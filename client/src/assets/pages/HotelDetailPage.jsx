import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import "../css/HotelDetailPage.css";

const HotelDetailPage = () => {
  const { id } = useParams();
  const [hotel, setHotel] = useState(null);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [isOwner, setIsOwner] = useState(false);
  const [uploadFiles, setUploadFiles] = useState([]);
  const [coverImageFile, setCoverImageFile] = useState(null);
  const user = JSON.parse(localStorage.getItem("user"));
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDetails, setReportDetails] = useState("");
  const [showOwnerNotice, setShowOwnerNotice] = useState(false);
  const [showCoverImageErrorModal, setShowCoverImageErrorModal] = useState(false);
  const [showMediaErrorModal, setShowMediaErrorModal] = useState(false);
  const [mediaErrorMessage, setMediaErrorMessage] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState(null); // index of media to delete
  const [showBookingErrorModal, setShowBookingErrorModal] = useState(false);
  const [bookingErrorMessage, setBookingErrorMessage] = useState("");


  
  const fetchHotel = async () => {
    try {
      const res = await axios.get(`/api/hotels/${id}`);
      setHotel(res.data);
      if (user && res.data.user?._id === user.id) {
        setIsOwner(true);
      }
    } catch (err) {
      console.error("Error fetching hotel detail:", err);
    }
  };

  useEffect(() => {
    fetchHotel();
  }, [id]);

  const nextMedia = () => {
    if (!hotel?.media?.length) return;
    setCurrentMediaIndex((prev) => (prev + 1) % hotel.media.length);
  };

  const handleBooking = async () => {
    if (!user) {
      setBookingErrorMessage("Please login to book.");
      setShowBookingErrorModal(true);
      return;
    }
    if (!checkIn || !checkOut) {
      setBookingErrorMessage("Select both check-in and check-out dates.");
      setShowBookingErrorModal(true);
      return;
    }
    if (new Date(checkOut) <= new Date(checkIn)) {
      setBookingErrorMessage("Check-out must be after check-in.");
      setShowBookingErrorModal(true);
      return;
    }
  
    try {
      await axios.post("/api/bookings", {
        userId: user.id,
        hotelId: hotel._id,
        checkIn,
        checkOut,
      });
      setSuccessMessage(`✅ Booking successful from ${checkIn} to ${checkOut}`);
      setShowSuccessModal(true);
    } catch (err) {
      const msg = err.response?.data?.error || "Booking failed.";
      setBookingErrorMessage("❌ " + msg);
      setShowBookingErrorModal(true);
    }
  };
  

  const handleFileChange = (e) => {
    setUploadFiles(Array.from(e.target.files));
  };

  const handleUploadMedia = async () => {
    if (!uploadFiles.length) {
      setMediaErrorMessage("Please select one or more media files before uploading.");
      setShowMediaErrorModal(true);
      return;
    }
  
    const formData = new FormData();
    uploadFiles.forEach((file) => formData.append("media", file));
    try {
      const uploadRes = await axios.post("/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const mediaToAdd = uploadRes.data;
      await axios.post(`/api/hotels/${hotel._id}/media`, { media: mediaToAdd });
      setSuccessMessage("✅ Media uploaded successfully!");
      setShowSuccessModal(true);

      setUploadFiles([]);
      fetchHotel();
    } catch (err) {
      console.error("Failed to upload media:", err);
      alert("Error uploading media.");
    }
  };
  
  

  const confirmDeleteMedia = async () => {
    try {
      await axios.delete(`/api/hotels/${hotel._id}/media/${deleteIndex}`);
      setShowDeleteModal(false);
      fetchHotel();
    } catch (err) {
      console.error("Failed to delete media:", err);
      alert("Error deleting media.");
    }
  };
  

  const handleUpdateCoverImage = async () => {
    if (!coverImageFile) {
      setShowCoverImageErrorModal(true);
      return;
    }
  
    try {
      const formData = new FormData();
      formData.append("media", coverImageFile);
  
      const uploadRes = await axios.post("/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
  
      const uploaded = uploadRes.data;
      const newImageUrl = uploaded[0].url;
  
      await axios.put(`/api/hotels/${hotel._id}/cover`, { image: newImageUrl });
      setSuccessMessage("✅ Cover image updated!");
      setShowSuccessModal(true);

      fetchHotel();
      setCoverImageFile(null);
    } catch (err) {
      console.error("Cover image update failed:", err);
      alert("❌ Failed to update cover image.");
    }
  };
  

  if (!hotel) return <div className="text-center mt-10">Loading...</div>;
  const currentMedia = hotel.media && hotel.media[currentMediaIndex];

  return (
    <div className="hotel-detail-page">
      <img src={hotel.image} alt={hotel.name} className="cover-image" />

      <div className="hotel-detail-container">
        <div className="info-top">
          <h1 className="hotel-name">{hotel.name}</h1>

          <div className="flex gap-2 items-center">
            <input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="border p-2 rounded"
            />
            <span>to</span>
            <input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="border p-2 rounded"
            />
            <button
              onClick={() => {
                if (isOwner) {
                  setShowOwnerNotice(true);
                  setTimeout(() => setShowOwnerNotice(false), 3000); // auto-hide after 3s
                } else {
                  handleBooking();
                }
              }}
              className="book-now-btn"
            >
              Book Now
            </button>

          </div>

        </div>

        <p className="hotel-meta">📍 {hotel.location} &nbsp;|&nbsp; 💲 ${hotel.pricePerNight}/night &nbsp;|&nbsp; ⭐ {hotel.stars} stars</p>

        {hotel.description && <p className="hotel-description">{hotel.description}</p>}

        {hotel.user?.name && (
          <p className="hotel-user">
            <strong>Listed by:</strong>{" "}
            <Link to={`/user/${hotel.user._id}`} className="listed-by-link">
              {hotel.user.name}
            </Link>
          </p>
        )}

        {!isOwner && user && (
          <div className="mt-6">
            <button
              onClick={() => setShowReportModal(true)}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded text-sm"
            >
              🚩 Report this Hotel
            </button>
          </div>
        )}

        {currentMedia && (
          <div className="media-gallery">
            <h3 className="media-title">Photos & Videos</h3>
            <div className="media-slider-wide">
              {currentMedia.type === "video" ? (
                <video src={currentMedia.url} controls className="media-item-wide" />
              ) : (
                <img src={currentMedia.url} alt="media" className="media-item-wide" />
              )}
              {hotel.media.length > 1 && (
                <button className="next-media-btn" onClick={nextMedia}>Next ➜</button>
              )}
            </div>
          </div>
        )}

        {isOwner && (
          <>
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Update Cover Image</h3>
              <input type="file" accept="image/*" onChange={(e) => setCoverImageFile(e.target.files[0])} />
              <button
                onClick={handleUpdateCoverImage}
                className="mt-2 bg-indigo-600 text-white px-4 py-1 rounded hover:bg-indigo-700"
              >
                Update Cover
              </button>
            </div>

            <div className="mt-6">
              <h3 className="font-semibold mb-2">Add New Media</h3>
              <input type="file" multiple onChange={handleFileChange} className="mb-2" />
              <button onClick={handleUploadMedia} className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700">Upload</button>
            </div>

            <div className="mt-6">
              <h3 className="font-semibold mb-2">Delete Media</h3>
              <div className="grid grid-cols-3 gap-4">
                {hotel.media.map((m, i) => (
                  <div key={i} className="relative group border rounded overflow-hidden">
                    {m.type === "video" ? (
                      <video src={m.url} className="w-full h-32 object-cover" controls />
                    ) : (
                      <img src={m.url} className="w-full h-32 object-cover" alt="media" />
                    )}
                    <button
                    onClick={() => {
                      setDeleteIndex(i);
                      setShowDeleteModal(true);
                    }}
                    className="absolute top-1 right-1 bg-red-600 text-white px-2 py-1 text-xs rounded opacity-80 hover:opacity-100"
                  >
                    ✕
                  </button>

                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
            <h2 className="text-lg font-bold mb-4 text-red-600">Report This Hotel</h2>

            <label className="block mb-2 font-medium">Reason for reporting:</label>
            <select
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="border p-2 rounded w-full mb-4"
            >
              <option value="">-- Select a reason --</option>
              <option value="Fake listing">Fake or non-existent hotel</option>
              <option value="Policy violation">Violates site policies</option>
              <option value="Misleading info">Misleading or false information</option>
              <option value="Suspicious activity">Suspicious or scam activity</option>
            </select>

            <label className="block mb-2 font-medium">Additional Details (optional):</label>
            <textarea
              value={reportDetails}
              onChange={(e) => setReportDetails(e.target.value)}
              placeholder="Tell us what you found wrong..."
              className="w-full border p-2 rounded mb-4"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2 text-sm bg-gray-300 hover:bg-gray-400 rounded"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!reportReason) return alert("Please select a reason.");
                  try {
                    await axios.post("/api/report-hotel", {
                      hotelId: hotel._id,
                      reporterId: user.id,
                      reason: reportReason,
                      details: reportDetails,
                    });
                    alert("✅ Report submitted to admin.");
                    setReportReason("");
                    setReportDetails("");
                    setShowReportModal(false);
                  } catch (err) {
                    alert("Failed to submit report.");
                  }
                }}
                className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
      {showOwnerNotice && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full text-center animate-fade-in">
              <h2 className="text-xl font-semibold text-red-600 mb-3">Action Not Allowed</h2>
              <p className="text-gray-700 mb-6">You cannot book your own listing.</p>
              <button
                onClick={() => setShowOwnerNotice(false)} // ✅ fixed line
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded"
              >
                Got it
              </button>
            </div>
          </div>
        )}


      {showCoverImageErrorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full text-center animate-fade-in">
            <h2 className="text-xl font-semibold text-red-600 mb-3">No Image Selected</h2>
            <p className="text-gray-700 mb-6">Please select an image before updating the cover.</p>
            <button
              onClick={() => setShowCoverImageErrorModal(false)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded"
            >
              Got it
            </button>
          </div>
        </div>
      )}


      {showMediaErrorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full text-center animate-fade-in">
            <h2 className="text-xl font-semibold text-red-600 mb-3">Upload Error</h2>
            <p className="text-gray-700 mb-6">{mediaErrorMessage}</p>
            <button
              onClick={() => setShowMediaErrorModal(false)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full text-center animate-fade-in">
            <h2 className="text-xl font-semibold text-green-600 mb-3">Success</h2>
            <p className="text-gray-700 mb-6">{successMessage}</p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full text-center animate-fade-in">
            <h2 className="text-xl font-semibold text-red-600 mb-3">Delete Media</h2>
            <p className="text-gray-700 mb-6">Are you sure you want to delete this media item?</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteMedia}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      
      {showBookingErrorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full text-center animate-fade-in">
            <h2 className="text-xl font-semibold text-red-600 mb-3">Booking Error</h2>
            <p className="text-gray-700 mb-6">{bookingErrorMessage}</p>
            <button
              onClick={() => setShowBookingErrorModal(false)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded"
            >
              Got it
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default HotelDetailPage;
