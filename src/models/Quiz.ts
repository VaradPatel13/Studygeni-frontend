import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User ID is required'],
            index: true
        },
        documentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Document',
            required: [true, 'Document ID is required'],
            index: true
        },
        title: {
            type: String,
            required: [true, 'Quiz title is required'],
            trim: true
        },
        questions: [
            {
                question: {
                    type: String,
                    required: true
                },
                options: {
                    type: [String],
                    required: true,
                    validate: {
                        validator: (arr: string[]) => arr.length >= 4,
                        message: 'At least 4 options are required'
                    }
                },
                correctAnswer: {
                    type: String,
                    required: true
                },
                explanation: {
                    type: String,
                    default: ''
                },
                difficulty: {
                    type: String,
                    enum: ['easy', 'medium', 'hard'],
                    default: 'medium'
                }
            }
        ],
        userAnswers: [
            {
                questionIndex: {
                    type: Number,
                    required: true
                },
                selectedAnswer: {
                    type: String,
                    required: true
                },
                isCorrect: {
                    type: Boolean,
                    required: true
                },
                answeredAt: {
                    type: Date,
                    default: Date.now
                }
            }
        ],
        score: {
            type: Number,
            default: 0,
            min: 0
        },
        totalQuestions: {
            type: Number,
            required: true,
            min: 1
        },
        completedAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

quizSchema.index({ userId: 1, documentId: 1 });

const Quiz = mongoose.models.Quiz || mongoose.model('Quiz', quizSchema);

export default Quiz;
