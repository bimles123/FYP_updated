import { Link } from "react-router-dom";
import React, { useEffect, useState } from "react";
import "../css/HomePage.css"; // Ensure to create a CSS file for styling
import axios from "axios";
import HotelModal from "./HotelModal"; // Import the hotel overlay

const HomePage = () => {
  const [hotels, setHotels] = useState([]);
  const [selectedHotel, setSelectedHotel] = useState(null);

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const response = await axios.get("http://localhost:4000/api/hotels");
        setHotels(response.data);
      } catch (error) {
        console.error("Error fetching hotels:", error);
      }
    };
    fetchHotels();
  }, []);

  // Function to move to the next hotel in the list
  const handleNextHotel = () => {
    if (!selectedHotel) return;
    const currentIndex = hotels.findIndex(hotel => hotel._id === selectedHotel._id);
    const nextIndex = (currentIndex + 1) % hotels.length; // Loop back to the first hotel
    setSelectedHotel(hotels[nextIndex]);
  };

  return (
    <div className="homepage">
      <div className="hotel-list">
        {hotels.map((hotel) => (
          <div
            key={hotel._id}
            className="hotel-card"
            onClick={() => setSelectedHotel(hotel)} // Open modal on click
          >
            <img src={hotel.image} alt={hotel.name} className="hotel-image" />
            <div className="hotel-info">
              <h2>{hotel.name}</h2>
              <p>{hotel.location}</p>
              <p>Price: ${hotel.pricePerNight} per night</p>
              <p>Rating: {hotel.rating} ⭐</p>
            </div>
          </div>
        ))}
      </div>

      {/* Show hotel overlay modal when a hotel is selected */}
      {selectedHotel && (
        <HotelModal
          hotel={selectedHotel}
          onClose={() => setSelectedHotel(null)}
          onNext={handleNextHotel}
        />
      )}
    </div>
  );
};

export default HomePage;
