import ChatHistory from '@/models/ChatHistory';
import connectDB from '@/lib/server/db';

export class ChatRepository {
  async findByDocument(documentId: string, userId: string) {
    await connectDB();
    return ChatHistory.findOne({ documentId, userId }).populate('documentId', 'title filename');
  }

  async create(data: any) {
    await connectDB();
    return ChatHistory.create(data);
  }

  async saveMessage(documentId: string, userId: string, userMsg: any, aiMsg: any) {
    await connectDB();
    let chatHistory = await ChatHistory.findOne({ documentId, userId });
    if (!chatHistory) {
      chatHistory = await ChatHistory.create({ userId, documentId, messages: [] });
    }
    chatHistory.messages.push(userMsg, aiMsg);
    await chatHistory.save();
    return chatHistory;
  }
}
