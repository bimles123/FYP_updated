import React from "react";
import { Link } from "react-router-dom";
import "../css/HotelModal.css";

const HotelModal = ({ hotel, onClose, onNext }) => {
  if (!hotel) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-btn" onClick={onClose}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <div className="modal-body">
          <div className="image-container">
            <img src={hotel.image} alt={hotel.name} className="modal-image" />
            <div className="rating-badge">
              <span>★</span> {hotel.rating}
            </div>
          </div>

          <div className="modal-details">
            <div className="details-header">
              <h2 className="modal-title">{hotel.name}</h2>
              <p className="price-tag">रु{hotel.pricePerNight}<span>/night</span></p>
            </div>

            <div className="location-container">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              <p className="modal-location">{hotel.location}</p>
            </div>

            <div className="divider"></div>

            <p className="modal-description">
              {hotel.description || "No description available."}
            </p>

            {hotel.user?.name && (
              <div className="listed-by">
                <p className="modal-listedby">
                  <strong>Listed by</strong>
                </p>
                <Link to={`/user/${hotel.user._id}`} className="listedby-link">
                  <div className="user-info">
                    <div className="user-avatar">
                      {hotel.user.name.charAt(0).toUpperCase()}
                    </div>
                    <span>{hotel.user.name}</span>
                  </div>
                </Link>
              </div>
            )}

            <div className="modal-buttons">
              <Link to={`/hotel/${hotel._id}`} className="details-link">
                View Full Details
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"></path>
                </svg>
              </Link>

              <Link to={`/forum/${hotel._id}`} className="details-link forum-link">
                Forum
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"></path>
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <button className="next-btn" onClick={onNext}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M12 5l7 7-7 7"></path>
        </svg>
      </button>
    </div>
  );
};

export default HotelModal;
