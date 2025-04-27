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
  const user = JSON.parse(localStorage.getItem("user"));

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
    </div>
  );
};

export default HotelDetailPage;
