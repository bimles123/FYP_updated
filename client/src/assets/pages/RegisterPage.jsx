import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    async function registerUser(ev) {
        ev.preventDefault();
        try {
            await axios.post('/register', {
                name,
                email,
                password,
            });
            alert('Registration successful.');
        } catch (e) {
            alert('Registration failed.');
        }
    }

    return (
        <div className="mt-10 pt-16">
            <h1 className="font-bold text-4xl text-center text-gray-800">Register</h1>
            <form className="flex flex-col max-w-md gap-6 mt-5 mx-auto border border-gray-300 rounded-lg shadow-lg p-8 bg-white" onSubmit={registerUser}>
                <input 
                    type="text" 
                    placeholder="Full Name" 
                    value={name} 
                    onChange={ev => setName(ev.target.value)} 
                    className="p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input 
                    type="email" 
                    placeholder="Email Address" 
                    value={email} 
                    onChange={ev => setEmail(ev.target.value)} 
                    className="p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input 
                    type="password" 
                    placeholder="Password" 
                    value={password} 
                    onChange={ev => setPassword(ev.target.value)} 
                    className="p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button className="log bg-blue-500 text-white font-semibold py-2 rounded hover:bg-blue-600 transition duration-200">Register</button>
                <div className="text-xs text-center mt-4">
                    Already a member? <Link to={'/login'} className="text-blue-500 hover:underline">Sign in</Link>
                </div>
            </form>
        </div>
    );
}
