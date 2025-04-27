import React from "react";
import "../css/HotelModal.css"; // Ensure styling is handled here

const HotelModal = ({ hotel, onClose, onNext }) => {
  if (!hotel) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content animate-slide">
        {/* Close Button */}
        <button className="close-btn" onClick={onClose}>×</button>

        {/* Hotel Image */}
        <img src={hotel.image} alt={hotel.name} className="modal-image" />

        {/* Hotel Details */}
        <div className="modal-details">
          <h2 className="modal-title">{hotel.name}</h2>
          <p className="modal-location"><strong>Location:</strong> {hotel.location}</p>
          <p className="modal-price"><strong>Price:</strong> ${hotel.pricePerNight} per night</p>
          <p className="modal-rating"><strong>Rating:</strong> {hotel.rating} Stars</p>
          <p className="modal-description">{hotel.description || "No description available."}</p>

          {/* Book Now Button */}
          <button className="book-now-btn">Book Now</button>
        </div>
      </div>

      {/* Next Button (Arrow) - Attached to Overlay */}
      <button className="next-btn" onClick={onNext}>➜</button>
    </div>
  );
};

export default HotelModal;
