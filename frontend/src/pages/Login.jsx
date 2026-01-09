// src/pages/auth/Login.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { loginUser } from "../api/user";
import { Link } from "react-router-dom";

const Login = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: "",
        password: ""
    });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            setLoading(true);
            const res = await loginUser({
                username: formData.username,
                password: formData.password
            });

            localStorage.setItem("token", res.token); // store jwt
            navigate("/quizbank"); 
        } catch (err) {
            setError(err.response?.data?.error || "Login failed. Try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4">
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md bg-slate-800/60 backdrop-blur-xl rounded-2xl p-8 shadow-2xl"
        >
            <h1 className="text-3xl font-bold text-white text-center mb-2">
            Welcome Back
            </h1>
            <p className="text-slate-400 text-center mb-6">
            Sign in to continue hosting with QuizBurst 🚀
            </p>

            {error && (
            <div className="bg-red-500/20 text-red-400 text-sm p-3 rounded-lg mb-4">
                {error}
            </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="text-slate-300 text-sm block mb-1">Username</label>
                <input
                type="text"
                name="username"
                required
                value={formData.username}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 outline-none"
                placeholder="Enter your username"
                />
            </div>

            <div>
                <label className="text-slate-300 text-sm block mb-1">
                Password
                </label>
                <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 outline-none"
                placeholder="Enter password"
                />
            </div>

            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
                type="submit"
                className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-white font-semibold rounded-lg transition-all disabled:opacity-50"
            >
                {loading ? "Signing in..." : "Sign In"}
            </motion.button>
            </form>

            <p className="text-slate-400 text-center mt-6 text-sm">
            Don’t have an account?{" "}
            <Link
                to="/signup"
                className="text-cyan-400 hover:text-cyan-300 font-semibold"
            >
                Sign up
            </Link>
            </p>
        </motion.div>
        </div>
    );
};

export default Login;
