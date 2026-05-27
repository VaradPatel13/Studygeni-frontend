import Document from '@/models/Document';
import connectDB from '@/lib/server/db';

export class DocumentRepository {
  async findAllByUser(userId: string) {
    await connectDB();
    return Document.find({ userId })
      .sort({ uploadDate: -1 })
      .select('-chunks -extractedText');
  }

  async findById(id: string, userId: string) {
    await connectDB();
    return Document.findOne({ _id: id, userId });
  }

  async create(data: any) {
    await connectDB();
    return Document.create(data);
  }

  async update(id: string, userId: string, data: any) {
    await connectDB();
    return Document.findOneAndUpdate({ _id: id, userId }, data, { returnDocument: 'after' });
  }

  async delete(id: string, userId: string) {
    await connectDB();
    return Document.deleteOne({ _id: id, userId });
  }
}
