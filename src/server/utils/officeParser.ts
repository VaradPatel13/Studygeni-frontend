import axios from 'axios';
import fs from 'fs';
import path from 'path';
import os from 'os';
// @ts-ignore
import { getTextExtractor } from 'office-text-extractor';

export async function extractTextFromOffice(fileUrl: string) {
    const extractor = getTextExtractor();
    const tempDir = os.tmpdir();
    const urlFilename = fileUrl.split('/').pop()?.split('?')[0] || 'document.tmp';
    const tempFilePath = path.join(tempDir, `temp_${Date.now()}_${urlFilename}`);

    try {
        const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
        await fs.promises.writeFile(tempFilePath, Buffer.from(response.data));

        const text = await extractor.extractText({ input: tempFilePath, type: 'file' });
        return text;
    } catch (error: any) {
        throw new Error(`Failed to extract text from Office document: ${error.message}`);
    } finally {
        try {
            if (fs.existsSync(tempFilePath)) {
                await fs.promises.unlink(tempFilePath);
            }
        } catch (err) {}
    }
}
