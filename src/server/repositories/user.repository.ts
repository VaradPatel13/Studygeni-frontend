import User from '@/models/User';
import connectDB from '@/lib/server/db';

export class UserRepository {
  async findByEmail(email: string) {
    await connectDB();
    return User.findOne({ email }).select('+password');
  }

  async findById(id: string) {
    await connectDB();
    return User.findById(id).select('-password');
  }

  async exists(query: any) {
    await connectDB();
    return User.findOne(query);
  }

  async create(userData: any) {
    await connectDB();
    const newUser = await User.create(userData);
    return newUser.toObject();
  }

  async update(id: string, updateFields: any) {
    await connectDB();
    return User.findByIdAndUpdate(id, updateFields, { returnDocument: 'after', runValidators: true });
  }
}
