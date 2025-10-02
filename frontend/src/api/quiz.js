import axios from 'axios';

const createQuiz = async (quizData) => {
    console.log('checkpoint before axios');
    console.log('full backend url:', axios.defaults.baseURL);
    let newQuiz = await axios.post('/quiz', quizData);
    return newQuiz.data;
}

const getAllQuizzes = async (userId) => {
    let quizzes = await axios.get(`/quiz/all/${userId}`);
    return quizzes.data;
}


const updateQuiz = async (quizId, quizData) => {
    let updatedQuiz = await axios.put(`/quiz/${quizId}`, quizData);
    return updatedQuiz.data;
}

const deleteQuiz = async (quizId) => {
    await axios.delete(`/quiz/${quizId}`);
}

export { getAllQuizzes, createQuiz, updateQuiz, deleteQuiz };
