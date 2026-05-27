import Quiz from '@/models/Quiz';
import connectDB from '@/lib/server/db';

export class QuizRepository {
  async findAllByUser(userId: string) {
    await connectDB();
    return Quiz.find({ userId }).sort({ createdAt: -1 });
  }

  async findByDocument(documentId: string, userId: string) {
    await connectDB();
    return Quiz.find({ documentId, userId }).sort({ createdAt: -1 });
  }

  async findById(id: string, userId: string) {
    await connectDB();
    return Quiz.findOne({ _id: id, userId });
  }

  async create(data: any) {
    await connectDB();
    return Quiz.create(data);
  }

  async update(id: string, userId: string, data: any) {
    await connectDB();
    return Quiz.findOneAndUpdate({ _id: id, userId }, data, { returnDocument: 'after' });
  }

  async delete(id: string, userId: string) {
    await connectDB();
    return Quiz.findOneAndDelete({ _id: id, userId });
  }
}
