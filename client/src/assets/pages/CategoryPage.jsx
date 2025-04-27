import React, { useState, useEffect } from "react";
import axios from "axios";
import "../css/CategoryPage.css";
import HotelModal from "./HotelModal";

const CategoryPage = () => {
  const [hotels, setHotels] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [rating, setRating] = useState("");
  const [selectedHotel, setSelectedHotel] = useState(null);

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const response = await axios.get("/api/hotels");
        setHotels(response.data);
      } catch (error) {
        console.error("Error fetching hotels:", error);
      }
    };
    fetchHotels();
  }, []);

  const handleSearch = () => {
    return hotels.filter((hotel) => {
      const matchesName = hotel.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLocation = hotel.location.toLowerCase().includes(location.toLowerCase());
      const matchesPrice =
        priceRange === "1"
          ? hotel.pricePerNight < 100
          : priceRange === "2"
          ? hotel.pricePerNight >= 100 && hotel.pricePerNight <= 200
          : priceRange === "3"
          ? hotel.pricePerNight > 200 && hotel.pricePerNight <= 300
          : priceRange === "4"
          ? hotel.pricePerNight > 300
          : true;
      const matchesRating = rating ? hotel.stars === parseInt(rating) : true;

      return matchesName && matchesLocation && matchesPrice && matchesRating;
    });
  };

  const filteredHotels = handleSearch();

  const nextHotel = () => {
    if (!selectedHotel || filteredHotels.length === 0) return;
    const currentIndex = filteredHotels.findIndex(h => h._id === selectedHotel._id);
    const nextIndex = (currentIndex + 1) % filteredHotels.length;
    setSelectedHotel(filteredHotels[nextIndex]);
  };

  return (
    <div className="category-page">
      <div className="category-container">
        <h2 className="category-title">Search for Hotels</h2>

        <div className="search-bar">
          <input
            type="text"
            placeholder="Search by hotel name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <input
            type="text"
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <select value={priceRange} onChange={(e) => setPriceRange(e.target.value)}>
            <option value="">Select Price Range</option>
            <option value="1">Under रु100</option>
            <option value="2">रु100 - रु200</option>
            <option value="3">रु200 - रु300</option>
            <option value="4">Above रु300</option>
          </select>
          <select value={rating} onChange={(e) => setRating(e.target.value)}>
            <option value="">Select Rating</option>
            <option value="1">1 Star</option>
            <option value="2">2 Stars</option>
            <option value="3">3 Stars</option>
            <option value="4">4 Stars</option>
            <option value="5">5 Stars</option>
          </select>
        </div>

        <div className="hotel-list">
          {filteredHotels.length > 0 ? (
            filteredHotels.map((hotel) => (
              <div
                key={hotel._id}
                className="hotel-card"
                onClick={() => setSelectedHotel(hotel)}
              >
                <img src={hotel.image} alt={hotel.name} className="hotel-image" />
                <div className="hotel-info">
                  <h2>{hotel.name}</h2>
                  <p>{hotel.location}</p>
                  <p>Price: रु{hotel.pricePerNight} per night</p>
                  <p>Rating: {hotel.stars} ⭐</p>
                </div>
              </div>
            ))
          ) : (
            <p className="no-hotels">No hotels found.</p>
          )}
        </div>
      </div>

      {selectedHotel && (
        <HotelModal
          hotel={selectedHotel}
          onClose={() => setSelectedHotel(null)}
          onNext={nextHotel}
        />
      )}
    </div>
  );
};

export default CategoryPage;
