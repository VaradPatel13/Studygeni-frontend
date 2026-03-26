import axios from 'axios';
// @ts-ignore
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import 'pdfjs-dist/legacy/build/pdf.worker.mjs';

export async function extractTextFromPdf(pdfUrl: string) {
    try {
        console.log(`[PDF Extract] Downloading from: ${pdfUrl}`);
        const response = await axios.get(pdfUrl, {
            responseType: 'arraybuffer',
            timeout: 30000
        });

        const pdfData = new Uint8Array(response.data);
        const loadingTask = pdfjsLib.getDocument({
            data: pdfData,
            useSystemFonts: true,
        });

        const pdfDocument = await loadingTask.promise;
        const numPages = pdfDocument.numPages;
        
        let fullText = '';
        for (let pageNum = 1; pageNum <= numPages; pageNum++) {
            const page = await pdfDocument.getPage(pageNum);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map((item: any) => item.str).join(' ');
            fullText += pageText + '\n\n';
        }

        await pdfDocument.destroy();
        return fullText.trim();
    } catch (error: any) {
        throw new Error(`Failed to extract text from PDF: ${error.message}`);
    }
}

function cleanText(text: string) {
    return text
        .replace(/\r\n/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .replace(/[ \t]+/g, ' ')
        .trim();
}

function splitIntoWords(paragraph: string) {
    return paragraph.split(/\s+/).filter(word => word.length > 0);
}

function createOverlap(previousChunk: string, overlapSize: number) {
    const words = splitIntoWords(previousChunk);
    if (words.length <= overlapSize) return previousChunk;
    return words.slice(-overlapSize).join(' ');
}

export function chunkText(text: string, chunkSize = 50, overlap = 50) {
    if (overlap >= chunkSize) overlap = Math.max(0, chunkSize - 1);

    const cleanedText = cleanText(text);
    const paragraphs = cleanedText.split(/\n\n+/).filter(p => p.trim().length > 0);
    const chunks: string[] = [];
    let currentChunk = '';
    let currentWordCount = 0;

    for (const paragraph of paragraphs) {
        const paragraphWords = splitIntoWords(paragraph);
        const paragraphWordCount = paragraphWords.length;

        if (paragraphWordCount > chunkSize) {
            if (currentChunk.trim().length > 0) {
                chunks.push(currentChunk.trim());
                if (overlap > 0) {
                    const overlapText = createOverlap(chunks[chunks.length - 1], overlap);
                    currentChunk = overlapText;
                    currentWordCount = splitIntoWords(overlapText).length;
                } else {
                    currentChunk = '';
                    currentWordCount = 0;
                }
            }

            const step = Math.max(1, chunkSize - overlap);
            for (let j = 0; j < paragraphWords.length; j += step) {
                chunks.push(paragraphWords.slice(j, j + chunkSize).join(' '));
            }

            currentChunk = '';
            currentWordCount = 0;
            continue;
        }

        if (currentWordCount + paragraphWordCount > chunkSize) {
            if (currentChunk.trim().length > 0) {
                chunks.push(currentChunk.trim());
                if (overlap > 0) {
                    const overlapText = createOverlap(chunks[chunks.length - 1], overlap);
                    currentChunk = overlapText + '\n\n' + paragraph;
                    currentWordCount = splitIntoWords(overlapText).length + paragraphWordCount;
                } else {
                    currentChunk = paragraph;
                    currentWordCount = paragraphWordCount;
                }
            } else {
                currentChunk = paragraph;
                currentWordCount = paragraphWordCount;
            }
        } else {
            currentChunk = currentChunk.length > 0 ? currentChunk + '\n\n' + paragraph : paragraph;
            currentWordCount += paragraphWordCount;
        }
    }

    if (currentChunk.trim().length > 0) chunks.push(currentChunk.trim());
    return chunks;
}
