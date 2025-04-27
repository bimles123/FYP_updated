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
    if (!user) return alert("Please login to book.");
    if (!checkIn || !checkOut) return alert("Select both check-in and check-out dates.");
    if (new Date(checkOut) <= new Date(checkIn)) return alert("Check-out must be after check-in.");

    try {
      await axios.post("/api/bookings", {
        userId: user.id,
        hotelId: hotel._id,
        checkIn,
        checkOut,
      });
      alert(`✅ Booking successful from ${checkIn} to ${checkOut}`);
    } catch (err) {
      const msg = err.response?.data?.error || "Booking failed.";
      alert("❌ " + msg);
    }
  };

  const handleBlockRange = async () => {
    if (!checkIn || !checkOut) return alert("Select a range to block.");
    try {
      await axios.post(`/api/bookings/block-range`, {
        hotelId: hotel._id,
        checkIn,
        checkOut,
      });
      alert(`❌ Bookings blocked from ${checkIn} to ${checkOut}`);
    } catch (err) {
      alert("Failed to block the date range.");
    }
  };

  const handleFileChange = (e) => {
    setUploadFiles(Array.from(e.target.files));
  };

  const handleUploadMedia = async () => {
    if (!uploadFiles.length) return;
    const formData = new FormData();
    uploadFiles.forEach((file) => formData.append("media", file));
    try {
      const uploadRes = await axios.post("/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const mediaToAdd = uploadRes.data;
      await axios.post(`/api/hotels/${hotel._id}/media`, { media: mediaToAdd });
      alert("Media added!");
      setUploadFiles([]);
      fetchHotel();
    } catch (err) {
      console.error("Failed to upload media:", err);
      alert("Error uploading media.");
    }
  };

  const handleDeleteMedia = async (index) => {
    if (!window.confirm("Delete this media item?")) return;
    try {
      await axios.delete(`/api/hotels/${hotel._id}/media/${index}`);
      fetchHotel();
    } catch (err) {
      console.error("Failed to delete media:", err);
      alert("Error deleting media.");
    }
  };

  const handleUpdateCoverImage = async () => {
    if (!coverImageFile) return alert("Please select an image.");

    try {
      const formData = new FormData();
      formData.append("media", coverImageFile);

      const uploadRes = await axios.post("/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const uploaded = uploadRes.data;
      const newImageUrl = uploaded[0].url;

      await axios.put(`/api/hotels/${hotel._id}/cover`, { image: newImageUrl });
      alert("✅ Cover image updated!");
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
            <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="border p-2 rounded" />
            <span>to</span>
            <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="border p-2 rounded" />
            {!isOwner ? (
              <button onClick={handleBooking} className="book-now-btn">Book Now</button>
            ) : (
              <button onClick={handleBlockRange} className="book-now-btn bg-red-500 hover:bg-red-600">Block Range</button>
            )}
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
                      onClick={() => handleDeleteMedia(i)}
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
    </div>
  );
};

export default HotelDetailPage;
