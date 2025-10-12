import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const HostGameCreate = () => {
    const [quizzes, setQuizzes] = useState([]);
    const [selectedQuiz, setSelectedQuiz] = useState('');
    const [hostName, setHostName] = useState('');
    const navigate = useNavigate();

    // Fetch quizzes from backend
    useEffect(() => {
        const fetchQuizzes = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/quiz/all');
            setQuizzes(res.data.quizzes);
        } catch (err) {
            console.error('Failed to fetch quizzes', err);
        }
        };
        fetchQuizzes();
    }, []);

    const handleCreateGame = async () => {
        if (!hostName || !selectedQuiz) return alert('Enter name and select a quiz');
        try {
        const res = await axios.post('http://localhost:5000/api/game/create', {
            quizId: selectedQuiz,
            host: hostName
        });
        console.log('Game created:', res.data);
        navigate(`/host-game-live/${res.data.game.gameCode}`);
        } catch (err) {
        console.error(err);
        alert('Failed to create game');
        }
    };

    return (
        <div style={{ padding: '30px', maxWidth: '500px', margin: '50px auto' }}>
        <h1>Create a Game</h1>

        <div style={{ marginTop: '20px' }}>
            <label>Host Name:</label>
            <input
            type="text"
            value={hostName}
            onChange={(e) => setHostName(e.target.value)}
            placeholder="Enter your name"
            style={{ width: '100%', padding: '10px', marginTop: '5px' }}
            />
        </div>

        <div style={{ marginTop: '20px' }}>
            <label>Select Quiz:</label>
            <select
            value={selectedQuiz}
            onChange={(e) => setSelectedQuiz(e.target.value)}
            style={{ width: '100%', padding: '10px', marginTop: '5px' }}
            >
            <option value="">-- Select a Quiz --</option>
            {quizzes.map((q) => (
                <option key={q._id} value={q._id}>
                {q.title} ({q.questionCount} questions)
                </option>
            ))}
            </select>
        </div>

        <button
            onClick={handleCreateGame}
            style={{ marginTop: '30px', width: '100%', padding: '12px', fontSize: '16px' }}
        >
            Create Game
        </button>
        </div>
    );
};

export default HostGameCreate;
