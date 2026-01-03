// src/components/Navbar.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";

const Navbar = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        setIsLoggedIn(!!token);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        setIsLoggedIn(false);
        navigate("/"); // back to home after logout
    };

    return (
        <nav className="bg-slate-900/90 backdrop-blur-md text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
            {/* Brand Logo */}
            <Link to="/" className="text-2xl font-bold text-cyan-400">
                QuizBurst
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex space-x-6 items-center">
                {isLoggedIn ? (
                    <>
                        <Link
                            to="/quizbank"
                            className="hover:text-cyan-300 transition"
                        >
                            QuizBank
                        </Link>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleLogout}
                            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-white rounded-lg"
                        >
                            Logout as Host
                        </motion.button>
                    </>
                ) : (
                    <>
                        <Link
                            to="/auth/signup"
                            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-white rounded-lg"
                        >
                            Become a Host
                        </Link>
                    </>
                )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
                <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="text-gray-200 hover:text-white focus:outline-none"
                >
                ☰
                </button>
            </div>
            </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
            <div className="md:hidden px-4 pb-4 space-y-3 bg-slate-800">
            {isLoggedIn ? (
                <>
                <Link
                    to="/quizbank"
                    onClick={() => setMenuOpen(false)}
                    className="block hover:text-cyan-300"
                >
                    QuizBank
                </Link>
                <button
                    onClick={() => {
                    handleLogout();
                    setMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 bg-cyan-500 hover:bg-cyan-400 rounded-lg"
                >
                    Logout
                </button>
                </>
            ) : (
                <>
                <Link
                    to="/auth/login"
                    onClick={() => setMenuOpen(false)}
                    className="block hover:text-cyan-300"
                >
                    Login
                </Link>
                <Link
                    to="/auth/signup"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2 bg-cyan-500 hover:bg-cyan-400 rounded-lg"
                >
                    Signup
                </Link>
                </>
            )}
            </div>
        )}
        </nav>
    );
};

export default Navbar;
