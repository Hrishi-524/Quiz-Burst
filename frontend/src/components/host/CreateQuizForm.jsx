import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CreateQuizForm = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [questions, setQuestions] = useState([
        { question: '', options: ['', '', '', ''], correctAnswer: 0, timeLimit: 30, points: 1000 }
    ]);
    const [quizCreated, setQuizCreated] = useState(null); 
    const [gameCreated, setGameCreated] = useState(null); 
    const navigate = useNavigate();

    const handleAddQuestion = () => {
        setQuestions([...questions, { question: '', options: ['', '', '', ''], correctAnswer: 0, timeLimit: 30, points: 1000 }]);
    };

    const handleChangeQuestion = (index, field, value) => {
        const newQuestions = [...questions];
        if (field === 'question') newQuestions[index].question = value;
        else if (field.startsWith('option')) {
        const optionIndex = parseInt(field.slice(-1));
        newQuestions[index].options[optionIndex] = value;
        } else if (field === 'correctAnswer') newQuestions[index].correctAnswer = parseInt(value);
        else if (field === 'timeLimit') newQuestions[index].timeLimit = parseInt(value);
        else if (field === 'points') newQuestions[index].points = parseInt(value);

        setQuestions(newQuestions);
    };

    // Create quiz
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
        const response = await axios.post('http://localhost:5000/api/quiz/create', {
            title,
            description,
            questions
        });
        const createdQuiz = response.data.quiz;
        setQuizCreated(createdQuiz);
        alert(`Quiz created: ${createdQuiz.id}`);
        } catch (err) {
        console.error(err);
        alert('Failed to create quiz');
        }
    };

    // Create game from the created quiz
    const handleHostGame = async () => {
        if (!quizCreated) return;
        try {
        const response = await axios.post('http://localhost:5000/api/game/create', {
            quizId: quizCreated.id,
            host: 'John Host' // replace with dynamic host name input if needed
        });
        const createdGame = response.data.game;
        setGameCreated(createdGame);
        alert(`Game created! Code: ${createdGame.gameCode}`);
        navigate(`/host-game-live/${createdGame.gameCode}`);
        } catch (err) {
        console.error(err);
        alert('Failed to create game');
        }
    };

    return (
        <div>
        <form onSubmit={handleSubmit} className="quiz-form">
            <div className="form-group">
            <input
                type="text"
                placeholder="Quiz Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />
            </div>
            <div className="form-group">
            <textarea
                placeholder="Quiz Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
            />
            </div>

            {questions.map((q, idx) => (
            <div className="question-card card" key={idx}>
                <h3>Question {idx + 1}</h3>
                <input
                type="text"
                placeholder="Enter question text"
                value={q.question}
                onChange={(e) => handleChangeQuestion(idx, 'question', e.target.value)}
                />
                {q.options.map((opt, i) => (
                <input
                    key={i}
                    type="text"
                    placeholder={`Option ${i + 1}`}
                    value={opt}
                    onChange={(e) => handleChangeQuestion(idx, `option${i}`, e.target.value)}
                />
                ))}
                <div className="question-meta" style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label>Correct Answer (0-3)</label>
                    <input
                    type="number"
                    min="0"
                    max="3"
                    value={q.correctAnswer}
                    onChange={(e) => handleChangeQuestion(idx, 'correctAnswer', e.target.value)}
                    style={{ padding: '5px', width: '100px' }}
                    />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label>Time Limit (seconds)</label>
                    <input
                    type="number"
                    min="5"
                    max="120"
                    value={q.timeLimit}
                    onChange={(e) => handleChangeQuestion(idx, 'timeLimit', e.target.value)}
                    style={{ padding: '5px', width: '120px' }}
                    />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label>Points</label>
                    <input
                    type="number"
                    min="100"
                    max="5000"
                    value={q.points}
                    onChange={(e) => handleChangeQuestion(idx, 'points', e.target.value)}
                    style={{ padding: '5px', width: '100px' }}
                    />
                </div>
                </div>
            </div>
            ))}

            <div className="form-buttons" style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
            <button type="button" className="btn-secondary" onClick={handleAddQuestion}>Add Question</button>
            <button type="submit" className="btn-primary">Create Quiz</button>
            </div>
        </form>

        {/* Host Game button */}
        {quizCreated && !gameCreated && (
            <div style={{ marginTop: '20px' }}>
            <h3>Quiz Created! Host a Game:</h3>
            <button onClick={handleHostGame} className="btn-primary">
                Create Game
            </button>
            </div>
        )}

        {gameCreated && (
            <div style={{ marginTop: '20px' }}>
            <h3>Game Created!</h3>
            <p>Game Code: <strong>{gameCreated.gameCode}</strong></p>
            </div>
        )}
        </div>
    );
};

export default CreateQuizForm;
