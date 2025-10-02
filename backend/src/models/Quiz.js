import { Schema, SchemaType, model } from 'mongoose';

const questionSchema = new Schema({
    id : {
        type: Number,
        required: true
    },
    question: {
        type: String,
        required: true
    },
    options: [{
        type: String,
        required: true
    }],
    correctAnswer: {
        type: Number,
        required: true,
        min: 0,
        max: 3
    },
    timeLimit: {
        type: Number,
        default: 30
    },
    points: {
        type: Number,
        default: 1000
    },
    type: {
        type: String,
        enum: ['single-choice', 'multiple-choice'],
        default: 'single-choice'
    }
});

const quizSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    category: {
        type: String,
        trim: true,
        default: 'General'
    },
    difficulty: {
        type: String,
        enum: ['Easy', 'Medium', 'Hard'],
        default: 'Medium'
    },
    questions: [questionSchema],
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: 'anonymous',
    },
    isPublic: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

export default model('Quiz', quizSchema);