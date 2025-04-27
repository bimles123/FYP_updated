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
    }, [isAuthenticated]); // Listen to `isAuthenticated`
    

    const handleLogout = async () => {
        console.log("Logout Clicked"); // Check if this prints on every click
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
            </Route>
        </Routes>
    );
}

export default App;
