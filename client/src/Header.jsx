import React, { useState, useEffect } from "react";

import { Link, useLocation } from "react-router-dom";
import './assets/css/Header.css';

export default function Header() {

    const location = useLocation();
    const isAuthPage = location.pathname === "/login" || location.pathname === "/register";
    
    const [dropdown, setDropdown] = useState(null);
    const [tripDates, setTripDates] = useState({ checkIn: "", checkOut: "" });
    const [people, setPeople] = useState({
        adults: 1,
        children: 0,
        infants: 0,
        pets: 0,
    });

    const toggleDropdown = (menu) => {
        setDropdown((prev) => (prev === menu ? null : menu));
    };

    const closeDropdown = () => {
        setDropdown(null);
    };

    const handleDateChange = (field, value) => {
        setTripDates((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const updatePeopleCount = (type, action) => {
        setPeople((prev) => ({
            ...prev,
            [type]: action === "increment" ? prev[type] + 1 : Math.max(0, prev[type] - 1),
        }));
    };

    const handleDropdownClick = (e) => {
        e.stopPropagation();
    };

    const categories = [
        "Reachers", "Nav"
    ];


    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen((prev) => !prev);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isSidebarOpen && !event.target.closest(".sidebar")) {
                setIsSidebarOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isSidebarOpen]);

    
    

    return (
        <>
            <header className="flex flex-col bg-white shadow-md fixed left-0 right-0 z-50">
                {/* Top Navigation Bar */}
                
                <div className="flex justify-between items-center p-4">
                    <Link to="/home" className="flex items-center gap-2">

                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 -rotate-45">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 0 1-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 0 0 6.16-12.12A14.98 14.98 0 0 0 9.631 8.41m5.96 5.96a14.926 14.926 0 0 1-5.841 2.58m-.119-8.54a6 6 0 0 0-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 0 0-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 0 1-2.448-2.448 14.9 14.9 0 0 1 .06-.312m-2.24 2.39a4.493 4.493 0 0 0-1.757 4.306 4.493 4.493 0 0 0 4.306-1.758M16.5 9a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
                        </svg>
                        <span className="font-bold text-xl text-gray-800">ReachNp</span>
                    </Link>
                    <nav className="relative flex items-center font-semibold border border-gray-300 gap-4 p-2 rounded-full bg-gray-100">
                        <div className="px-3 py-1 rounded-full hover:bg-gray-200 transition duration-200 cursor-pointer">
                            Where in Nepal?
                        </div>
                        <div className="border-l border-gray-300 h-6"></div>
                        <div 
                            className="relative px-3 py-1 rounded-full hover:bg-gray-200 transition duration-200 cursor-pointer"
                            onClick={() => toggleDropdown("plan")}
                        >
                            Plan Your Trip
                            {dropdown === "plan" && (
                                <div 
                                    className="absolute top-10 left-0 w-60 bg-white shadow-lg rounded-lg p-4 z-50"
                                    onClick={handleDropdownClick}
                                >
                                    <div className="mb-2">
                                        <label className="text-sm text-gray-600">Check-in:</label>
                                        <input
                                            type="date"
                                            value={tripDates.checkIn}
                                            onChange={(e) => handleDateChange("checkIn", e.target.value)}
                                            className="w-full border p-2 rounded mt-1"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-600">Check-out:</label>
                                        <input
                                            type="date"
                                            value={tripDates.checkOut}
                                            onChange={(e) => handleDateChange("checkOut", e.target.value)}
                                            className="w-full border p-2 rounded mt-1"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="border-l border-gray-300 h-6"></div>
                        <div 
                            className="relative px-3 py-1 rounded-full hover:bg-gray-200 transition duration-200 cursor-pointer"
                            onClick={() => toggleDropdown("who")}
                        >
                            Who's coming?
                            {dropdown === "who" && (
                                <div 
                                    className="absolute top-10 left-0 w-60 bg-white shadow-lg rounded-lg p-4 z-50"
                                    onClick={handleDropdownClick}
                                >
                                    {["adults", "children", "infants", "pets"].map((type) => (
                                        <div key={type} className="flex justify-between items-center mb-2">
                                            <span className="capitalize">{type}</span>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => updatePeopleCount(type, "decrement")}
                                                    className="px-2 py-1 border rounded"
                                                >
                                                    -
                                                </button>
                                                <span>{people[type]}</span>
                                                <button
                                                    onClick={() => updatePeopleCount(type, "increment")}
                                                    className="px-2 py-1 border rounded"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </nav>
                    <button //This is the menu button for side bar
                        className="flex items-center gap-2 border border-gray-300 p-2 rounded-full hover:bg-gray-200 transition duration-200"
                        onClick={toggleSidebar}
                    >
                    <svg xmlns="user-svgrepo-com.svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d=" M3.75 6.75h 16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                    </svg>
                    <div className="border border-gray-500 rounded-full p-1">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
        <path fillRule="evenodd" d="M12 2a6 6 0 1 1 0 12 6 6 0 0 1 0-12Zm0 13.5c-4.24 0-7.5 1.82-7.5 4.5v1.5h15v-1.5c0-2.68-3.26-4.5-7.5-4.5Z" clipRule="evenodd"/>
    </svg>
</div>

                    </button>
                </div>
                {/* Horizontal Category Bar */}
                {!isAuthPage && (
                    <div className="border-t border-gray-300 bg-white px-4 py-2 flex justify-between items-center">
                        <div className="flex gap-4 overflow-x-auto">
                            {categories.map((category, index) => (
                                <div key={index} className="px-2 py-1 rounded-full hover:bg-gray-200 cursor-pointer">
                                    {category}
                                </div>
                            ))}
                            <Link to="/add-hotel" className="px-2 py-1 rounded-full hover:bg-gray-200 cursor-pointer">
                                Add Hotel
                            </Link>
                        </div>
                        <Link to="/category">
                            <button className="flex items-center gap-1 border border-gray-300 px-4 py-2 rounded-full hover:bg-gray-200">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 10.5H4.5a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2H6m12-9h1.5a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H18m-9-6.75h6m-6 3h6M8.25 6v2.25m7.5-2.25v2.25m-7.5 0h7.5M12 3.75v1.5m-6.364.386L6.75 7.5m10.614-1.864L17.25 7.5" />
                                </svg>
                                 Filters
                            </button>
                        </Link>
                    </div>
                    
                )}
                <div className={`fixed top-0 right-0 h-full w-64 bg-white shadow-lg transform ${isSidebarOpen ? "translate-x-0" : "translate-x-full"} transition-transform duration-300 ease-in-out`}>
                <button 
                    className="absolute top-4 right-4 text-gray-600 hover:text-black"
                    onMouseDown={toggleSidebar} // ✅ Use onMouseDown here
                >
                    ✖
                </button>
                <div className="p-6">
                    <button 
                    onMouseDown={() => {
                        localStorage.removeItem('token');
                        window.location.href = '/login'; // Redirects instantly
                    }} 
                    onClick={(e) => e.stopPropagation()} // This stops sidebar from closing first
                    className="px-4 py-2 text-gray-600 hover:text-black hover:bg-black-600 transition"
                >
                    Logout
                </button>
            </div>
        </div>

                
            </header>

            {/* Spacer to avoid content being hidden behind the fixed header */}
            <div className="h-32"></div>
        </>
    );
}
