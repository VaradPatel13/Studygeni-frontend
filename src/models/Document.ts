import mongoose from 'mongoose';
import { IDocument } from '@/types/models';

const documentSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User ID is required'],
            index: true
        },
        title: {
            type: String,
            required: [true, 'Document title is required'],
            trim: true
        },
        filename: {
            type: String,
            required: [true, 'Filename is required']
        },
        filepath: {
            type: String,
            required: [true, 'File path is required']
        },
        filesize: {
            type: Number,
            required: [true, 'File size is required'],
            min: 0
        },
        fileType: {
            type: String,
            required: [true, 'File type is required']
        },
        extractedText: {
            type: String,
            default: ''
        },
        chunks: [
            {
                content: {
                    type: String,
                    required: true
                },
                pageNumber: {
                    type: Number,
                    required: true,
                    min: 1
                },
                chunkIndex: {
                    type: Number,
                    required: true,
                    min: 0
                }
            }
        ],
        uploadDate: {
            type: Date,
            default: Date.now,
            index: -1
        },
        lastAccessed: {
            type: Date,
            default: Date.now
        },
        status: {
            type: String,
            enum: ['processing', 'completed', 'failed'],
            default: 'processing'
        }
    },
    {
        timestamps: true
    }
);

documentSchema.index({ userId: 1, uploadDate: -1 });

const Document = mongoose.models.Document || mongoose.model<IDocument>('Document', documentSchema);

export default Document;
