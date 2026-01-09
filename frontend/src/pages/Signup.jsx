// src/pages/Signup.jsx
import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { signupUser } from "../api/user";
import { Link } from "react-router-dom";

const Signup = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: ""
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

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        try {
            setLoading(true);

            console.log("Submitting signup form with data:", formData);

            const res = await signupUser({
                username: formData.username,
                email: formData.email,
                password: formData.password
            });

            console.log("Signup successful:", res);
            
            localStorage.setItem("token", res.token); // store jwt
            navigate("/quizbank"); // redirect host to quizbank
        } catch (err) {
            setError(err.response?.data?.error || "Signup failed. Try again.");
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
            You need to signin to join QuizBurst hosts
            </h1>
            <p className="text-slate-400 text-center mb-6">
            Join QuizBurst as a host and start making quizzes
            </p>

            {error && (
            <div className="bg-red-500/20 text-red-400 text-sm p-3 rounded-lg mb-4">
                {error}
            </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="text-slate-300 text-sm block mb-1">
                Username
                </label>
                <input
                type="text"
                name="username"
                required
                value={formData.username}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 outline-none"
                placeholder="Enter username"
                />
            </div>

            <div>
                <label className="text-slate-300 text-sm block mb-1">Email</label>
                <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 outline-none"
                placeholder="you@example.com"
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

            <div>
                <label className="text-slate-300 text-sm block mb-1">
                Confirm Password
                </label>
                <input
                type="password"
                name="confirmPassword"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 outline-none"
                placeholder="Confirm password"
                />
            </div>

            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
                type="submit"
                className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-white font-semibold rounded-lg transition-all disabled:opacity-50"
            >
                {loading ? "Signing up..." : "Sign Up"}
            </motion.button>
            </form>

            <p className="text-slate-400 text-center mt-6 text-sm">
            Already have an account?{" "}
            <Link
                to="/login"
                className="text-cyan-400 hover:text-cyan-300 font-semibold"
            >
                Sign in
            </Link>
            </p>

        </motion.div>
        </div>
    );
};

export default Signup;
