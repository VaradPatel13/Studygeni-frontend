import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUser } from '@/types/models';

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: [true, 'Username is required'],
            unique: true,
            trim: true,
            minlength: [3, 'Username must be at least 3 characters'],
            maxlength: [30, 'Username cannot exceed 30 characters']
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [6, 'Password must be at least 6 characters'],
            select: false
        },
        profileImage: {
            type: String,
            default: null
        },
        mobileNumber: {
            type: String,
            required: [true, 'Mobile number is required'],
            unique: true,
            match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit mobile number']
        },
        subscriptionPlan: {
            type: String,
            enum: ['free', 'starter', 'professional', 'enterprise'],
            default: 'free'
        }
    },
    {
        timestamps: true
    }
);

userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.matchPassword = async function (candidatePassword: string) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Check if model already exists to prevent errors during hot reload
const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema);

export default User;
