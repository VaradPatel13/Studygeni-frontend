import { DocumentRepository } from '../repositories/document.repository';
import cloudinary from '@/lib/server/cloudinary';

const documentRepository = new DocumentRepository();

export class DocumentService {
  async getDocuments(userId: string) {
    const documents = await documentRepository.findAllByUser(userId);
    return documents;
  }

  async getDocumentById(id: string, userId: string) {
    const document = await documentRepository.findById(id, userId);
    if (!document) throw new Error('Document not found');
    
    // Add logic for viewer URL if needed
    const docObj = document.toObject();
    const isOffice = ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'].includes(docObj.fileType);
    
    if (isOffice) {
      docObj.url = `https://docs.google.com/viewer?url=${encodeURIComponent(docObj.filepath)}&embedded=true`;
    } else {
      docObj.url = docObj.filepath;
    }
    
    return docObj;
  }

  async updateDocument(id: string, userId: string, data: any) {
    const document = await documentRepository.update(id, userId, data);
    if (!document) throw new Error('Document not found');
    return document;
  }

  async deleteDocument(id: string, userId: string) {
    const document = await documentRepository.findById(id, userId);
    if (!document) throw new Error('Document not found');

    const publicIdWithFolder = document.filepath.split('/').slice(-2).join('/').split('.')[0];
    const resourceType = this.getResourceType(document.fileType);

    await cloudinary.uploader.destroy(publicIdWithFolder, {
      resource_type: resourceType === 'raw' ? 'raw' : 'image' // Cloudinary handles pdf as image or raw
    });

    await documentRepository.delete(id, userId);
    return true;
  }

  private getResourceType(mimetype: string): string {
    if (mimetype.startsWith('video/')) return 'video';
    if (mimetype.startsWith('image/') || mimetype === 'application/pdf') return 'auto';
    return 'raw';
  }
}
