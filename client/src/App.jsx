import './App.css';
import { Route, Routes, useNavigate, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import IndexPage from './assets/pages/IndexPage.jsx';
import LoginPage from './assets/pages/LoginPage.jsx';
import HomePage from './assets/pages/HomePage.jsx';
import RegisterPage from './assets/pages/RegisterPage.jsx';
import AddHotelPage from './assets/pages/AddHotelPage.jsx';
import CategoryPage from './assets/pages/CategoryPage.jsx';
import Layout from './Layout.jsx';
import ChatPage from './assets/pages/ChatPage.jsx';
import UserProfilePage from './assets/pages/UserProfilePage.jsx'; // ✅ Import new page
import HotelDetailPage from './assets/pages/HotelDetailPage.jsx';

import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:4000';

function App() {
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        return localStorage.getItem('token') ? true : false;
    });

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setIsAuthenticated(true);
        } else {
            setIsAuthenticated(false);
        }
    }, [isAuthenticated]);

    const handleLogout = async () => {
        console.log("Logout Clicked");
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        navigate('/login', { replace: true });
    };

    return (
        <Routes>
            <Route path="/" element={<Layout />}> 
                <Route index element={<Navigate to={isAuthenticated ? "/home" : "/login"} replace />} />
                <Route path="/login" element={<LoginPage setIsAuthenticated={setIsAuthenticated} />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/add-hotel" element={isAuthenticated ? <AddHotelPage /> : <Navigate to="/login" />} />
                <Route path="/home" element={isAuthenticated ? <HomePage /> : <Navigate to="/login" />} />
                <Route path="/category" element={isAuthenticated ? <CategoryPage /> : <Navigate to="/login" />} />
                <Route path="/index" element={<IndexPage />} />
                <Route path="/chat" element={<ChatPage />} />
                <Route path="/user/:userId" element={isAuthenticated ? <UserProfilePage /> : <Navigate to="/login" />} /> {/* ✅ New */}
                <Route path="/hotel/:id" element={<HotelDetailPage />} />

            </Route>
        </Routes>
    );
}

export default App;
