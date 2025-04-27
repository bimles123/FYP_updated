import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import "../css/HotelDetailPage.css";

const HotelDetailPage = () => {
  const { id } = useParams();
  const [hotel, setHotel] = useState(null);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

  useEffect(() => {
    const fetchHotel = async () => {
      try {
        const res = await axios.get(`/api/hotels/${id}`);
        setHotel(res.data);
      } catch (err) {
        console.error("Error fetching hotel detail:", err);
      }
    };
    fetchHotel();
  }, [id]);

  const nextMedia = () => {
    if (!hotel?.media?.length) return;
    setCurrentMediaIndex((prev) => (prev + 1) % hotel.media.length);
  };

  if (!hotel) return <div className="text-center mt-10">Loading...</div>;

  const currentMedia = hotel.media && hotel.media[currentMediaIndex];

  return (
    <div className="hotel-detail-page">
      <img src={hotel.image} alt={hotel.name} className="cover-image" />

      <div className="hotel-detail-container">
        <div className="info-top">
          <h1 className="hotel-name">{hotel.name}</h1>
          <button className="book-now-btn">Book Now</button>
        </div>

        <p className="hotel-meta">
          📍 {hotel.location} &nbsp;|&nbsp; 💲 ${hotel.pricePerNight}/night &nbsp;|&nbsp; ⭐ {hotel.rating} stars
        </p>

        {hotel.description && (
          <p className="hotel-description">{hotel.description}</p>
        )}

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
      </div>
    </div>
  );
};

export default HotelDetailPage;
