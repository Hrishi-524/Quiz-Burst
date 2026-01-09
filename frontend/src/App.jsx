import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import CreateQuiz from './pages/CreateQuiz.jsx';
import JoinGame from './pages/JoinGame.jsx';
import HostGame from './pages/HostGame.jsx';
import PlayGame from './pages/PlayGame.jsx';
import HostGameLive from './pages/HostGameLive.jsx';
import QuizBank from './pages/QuizBank.jsx';
import Signup from './pages/Signup.jsx';
import Login from './pages/Login.jsx';
import Lobby from './pages/Lobby.jsx';

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/quiz/new" element={<CreateQuiz />} />
                <Route path="/host-game" element={<HostGame />} />
                <Route path="/host/game/:gameCode" element={<HostGameLive />} />
                <Route path="/join-game" element={<JoinGame />} />
                <Route path="/play/game/:gameCode" element={<PlayGame />} />
                <Route path="/quizbank" element={<QuizBank />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/login" element={<Login />} />
                <Route path="/quiz/live/:id" element={<HostGameLive />} />
                <Route path="/quiz/lobby/:gameCode" element={<Lobby />} /> 
            </Routes>
        </Router>
    );
};

export default App;