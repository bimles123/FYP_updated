import { Link } from "react-router-dom";
import React, { useEffect, useState } from "react";
import "../css/HomePage.css";
import axios from "axios";
import HotelModal from "./HotelModal";

const HomePage = ({ searchValue }) => {
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

  const handleNextHotel = () => {
    if (!selectedHotel) return;
    const currentIndex = visibleHotels.findIndex(hotel => hotel._id === selectedHotel._id);
    const nextIndex = (currentIndex + 1) % visibleHotels.length;
    setSelectedHotel(visibleHotels[nextIndex]);
  };

  // ✅ Filter out soft-deleted hotels
  const visibleHotels = hotels.filter(h => !h.isDeleted);

  // 🔍 Filter based on location search
  const filteredHotels = visibleHotels.filter(hotel =>
    hotel.location.toLowerCase().includes(searchValue.toLowerCase())
  );

  return (
    <div className="homepage">
      <div className="hotel-list">
        {(searchValue ? filteredHotels : visibleHotels).map((hotel) => (
          <div
            key={hotel._id}
            className="hotel-card"
            onClick={() => setSelectedHotel(hotel)}
          >
            <img src={hotel.image} alt={hotel.name} className="hotel-image" />
            <div className="hotel-info">
              <h2>{hotel.name}</h2>
              <p>{hotel.location}</p>
              <p>Price: ${hotel.pricePerNight} per night</p>
              <p>Status: {hotel.stars} ⭐</p>
            </div>
          </div>
        ))}
      </div>

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
