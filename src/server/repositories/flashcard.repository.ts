import Flashcard from '@/models/Flashcard';
import connectDB from '@/lib/server/db';

export class FlashcardRepository {
  async findAllByUser(userId: string) {
    await connectDB();
    return Flashcard.find({ userId }).populate('documentId', 'title filename').sort({ createdAt: -1 });
  }

  async findByDocument(documentId: string, userId: string) {
    await connectDB();
    return Flashcard.findOne({ documentId, userId }).populate('documentId', 'title filename');
  }

  async findById(id: string, userId: string) {
    await connectDB();
    return Flashcard.findOne({ _id: id, userId });
  }

  async create(data: any) {
    await connectDB();
    return Flashcard.create(data);
  }

  async delete(id: string, userId: string) {
    await connectDB();
    return Flashcard.findOneAndDelete({ _id: id, userId });
  }
}
