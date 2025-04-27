import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Importing useNavigate
import '../css/AddHotelPage.css';

const AddHotelPage = () => {
    const [name, setName] = useState('');
    const [location, setLocation] = useState('');
    const [pricePerNight, setPricePerNight] = useState('');
    const [rating, setRating] = useState('');
    const [image, setImage] = useState('');
    const navigate = useNavigate(); // Using useNavigate hook

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/hotels', { name, location, pricePerNight, rating, image });
            alert('Hotel added successfully!');
            // Clear form fields after successful submission
            setName('');
            setLocation('');
            setPricePerNight('');
            setRating('');
            setImage('');
            navigate('/home'); // Redirect to HomePage after successful submission
        } catch (error) {
            console.error('Error adding hotel:', error);
            alert('Failed to add hotel');
        }
    };

    return (
        <div className="add-hotel-page">
            <div className="add-hotel-container">
                <h2 className="add-hotel-title">Add a New Hotel</h2>
                <form onSubmit={handleSubmit} className="add-hotel-form">
                    <div className="form-group">
                        <label htmlFor="name">Hotel Name</label>
                        <input 
                            type="text" 
                            id="name"
                            placeholder="Enter hotel name" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            required 
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="location">Location</label>
                        <input 
                            type="text" 
                            id="location"
                            placeholder="Enter hotel location" 
                            value={location} 
                            onChange={(e) => setLocation(e.target.value)} 
                            required 
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="pricePerNight">Price Per Night</label>
                        <input 
                            type="number" 
                            id="pricePerNight"
                            placeholder="Enter price per night" 
                            value={pricePerNight} 
                            onChange={(e) => setPricePerNight(e.target.value)} 
                            required 
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="rating">Rating</label>
                        <input 
                            type="number" 
                            id="rating"
                            placeholder="Enter rating (1-5)" 
                            value={rating} 
                            onChange={(e) => setRating(e.target.value)} 
                            required 
                            min="1" 
                            max="5" 
                            step="0.1"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="image">Image URL</label>
                        <input 
                            type="text" 
                            id="image"
                            placeholder="Enter image URL" 
                            value={image} 
                            onChange={(e) => setImage(e.target.value)} 
                            required 
                        />
                    </div>
                    <button type="submit" className="submit-button">Add Hotel</button>
                </form>
            </div>
        </div>
    );
};

export default AddHotelPage;
