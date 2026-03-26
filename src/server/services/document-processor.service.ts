import Document from '@/models/Document';
import { extractTextFromPdf, chunkText } from '../utils/pdfParser';
import { extractTextFromOffice } from '../utils/officeParser';
import connectDB from '@/lib/server/db';

export async function processDocument(documentId: string) {
    let document;

    try {
        await connectDB();
        document = await Document.findById(documentId);

        if (!document) {
            throw new Error(`Document with ID ${documentId} not found`);
        }

        console.log(`Processing document: ${document.title} (${documentId})`);

        if (document.fileType.startsWith('image/')) {
            document.status = 'completed';
            await document.save();
            return { success: true, documentId, status: 'completed' };
        }

        let extractedText = '';
        const isPdf = document.fileType === 'application/pdf' || document.filepath.toLowerCase().endsWith('.pdf');
        const isOffice = [
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation'
        ].includes(document.fileType) || document.filepath.toLowerCase().match(/\.(doc|docx|ppt|pptx)$/);

        if (isPdf) {
            extractedText = await extractTextFromPdf(document.filepath);
        } else if (isOffice) {
            extractedText = await extractTextFromOffice(document.filepath);
        } else {
            throw new Error(`Unsupported file type: ${document.fileType}`);
        }

        if (!extractedText || extractedText.trim().length === 0) {
            throw new Error('No text could be extracted from the document');
        }

        const textChunks = chunkText(extractedText, 50, 50);
        const formattedChunks = textChunks.map((content, index) => ({
            content,
            pageNumber: 1,
            chunkIndex: index
        }));

        document.extractedText = extractedText;
        document.chunks = formattedChunks;
        document.status = 'completed';

        await document.save();
        return { success: true, documentId, status: 'completed' };

    } catch (error: any) {
        console.error(`Error processing document ${documentId}:`, error.message);
        if (document) {
            document.status = 'failed';
            await document.save();
        }
        return { success: false, documentId, error: error.message, status: 'failed' };
    }
}

export async function dispatchDocumentProcessing(documentId: string) {
    // Basic async processing for now.
    // In serverless, this might need a queue or waitUntil
    processDocument(documentId)
        .then(() => console.log(`Background success for ${documentId}`))
        .catch(err => console.error(`Background failure for ${documentId}:`, err));
}
