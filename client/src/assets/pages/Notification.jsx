import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Notification() {
  const [messages, setMessages] = useState([]);
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (currentUser?.id) {
      axios.get(`/api/messages/${currentUser.id}`)
        .then(res => {
          const sorted = (res.data || []).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
          const limited = sorted.slice(0, 30);
          setMessages(limited);
        })
        .catch(err => console.error("Failed to load notifications", err));
    }
  }, [currentUser]);

  const handleClick = (msg) => {
    localStorage.setItem("chatReceiverId", msg.sender._id);
    localStorage.setItem("chatReceiverName", msg.sender.name);
    localStorage.setItem("chatReceiverEmail", msg.sender.email);
    navigate("/chat");
  };

  return (
    <div className="max-w-2xl mx-auto p-6 mt-20">
      <h1 className="text-2xl font-bold mb-6">🔔 Notifications</h1>
      {messages.length === 0 ? (
        <p className="text-gray-500">You have no notifications.</p>
      ) : (
        <div className="space-y-4 max-h-[80vh] overflow-y-auto">
          {messages.map((msg) => (
            <div
              key={msg._id}
              onClick={() => handleClick(msg)}
              className="p-4 bg-white border border-gray-200 rounded-lg shadow cursor-pointer hover:bg-blue-50 transition"
            >
              <div className="font-semibold text-gray-800">{msg.sender.name}</div>
              <div className="text-sm text-gray-600 mt-1">{msg.message}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
