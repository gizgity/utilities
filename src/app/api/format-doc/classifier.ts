// Content Classifier Module - Uses Gemini to classify content in File A
import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from '@google/genai';
import { ContentItem, LayoutType, AnswerOption } from './types';

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

// Schema for content classification response
const classificationSchema = {
    type: "OBJECT",
    properties: {
        items: {
            type: "ARRAY",
            description: "Array of classified content items",
            items: {
                type: "OBJECT",
                properties: {
                    type: {
                        type: "STRING",
                        enum: ["heading", "question", "answer_block", "paragraph"],
                        description: "Type of content"
                    },
                    layoutType: {
                        type: "STRING",
                        enum: ["inline", "two_line", "four_line"],
                        description: "Layout type for questions/answers"
                    },
                    content: {
                        type: "STRING",
                        description: "The text content"
                    },
                    questionNumber: {
                        type: "INTEGER",
                        description: "Question number if applicable"
                    },
                    headingLevel: {
                        type: "INTEGER",
                        description: "Heading level 1-6 if applicable"
                    },
                    answers: {
                        type: "ARRAY",
                        description: "Answer options if this is an answer_block",
                        items: {
                            type: "OBJECT",
                            properties: {
                                option: { type: "STRING" },
                                text: { type: "STRING" }
                            },
                            required: ["option", "text"]
                        }
                    }
                },
                required: ["type", "content"]
            }
        }
    },
    required: ["items"]
};

/**
 * Splits text into manageable chunks for processing.
 */
function splitIntoChunks(text: string, maxParagraphsPerChunk: number = 50): string[] {
    const paragraphs = text.split('\n').filter(p => p.trim().length > 0);
    const chunks: string[] = [];

    for (let i = 0; i < paragraphs.length; i += maxParagraphsPerChunk) {
        const chunk = paragraphs.slice(i, i + maxParagraphsPerChunk).join('\n');
        chunks.push(chunk);
    }

    return chunks;
}

/**
 * Classifies a single chunk of content using Gemini.
 */
async function classifyChunk(chunkText: string): Promise<ContentItem[]> {
    const result = await genAI.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
            {
                role: 'user',
                parts: [
                    {
                        text: `You are a document content classifier. Classify each piece of content in this document chunk.

CONTENT TO CLASSIFY:
${chunkText}

CLASSIFICATION RULES:

1. **heading**: Section headers, titles (e.g., "PART I: READING", "Section A")

2. **question**: A question line with a number (e.g., "Question 32. What should teens learn?")
   - Extract the question number
   - The question text goes in "content"

3. **answer_block**: A group of answer options (A, B, C, D)
   - CRITICAL: Detect the layout by looking at how answers are arranged in the original text:
     * **inline**: A. ... B. ... C. ... D. ... (all on one line)
     * **two_line**: A. ... B. ... on first line, then C. ... D. ... on second line
     * **four_line**: Each answer A, B, C, D on its own separate line
   - Extract each answer option and text into the "answers" array

4. **paragraph**: Regular text content that doesn't fit other categories

IMPORTANT:
- Preserve the EXACT layout as it appears in the source
- For answer_block, always include the layoutType
- Extract ALL content, don't skip anything

Return a JSON object with an "items" array containing all classified content.`
                    }
                ]
            }
        ],
        config: {
            responseMimeType: 'application/json',
            responseSchema: classificationSchema,
            safetySettings: [
                {
                    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
                },
            ],
            temperature: 0.1
        }
    });

    const parsed = JSON.parse(result.text || '{"items":[]}');

    // Transform to ContentItem format
    return parsed.items.map((item: any) => ({
        type: item.type,
        layoutType: item.layoutType as LayoutType | undefined,
        content: item.content,
        metadata: {
            questionNumber: item.questionNumber,
            headingLevel: item.headingLevel
        },
        answers: item.answers as AnswerOption[] | undefined
    }));
}

/**
 * Classifies all content in File A.
 * Processes in parallel chunks for speed.
 */
export async function classifyContent(textContentA: string): Promise<ContentItem[]> {
    const chunks = splitIntoChunks(textContentA);
    console.log(`Classifying content in ${chunks.length} chunks...`);

    // Process all chunks in parallel
    const chunkResults = await Promise.all(
        chunks.map((chunk, index) => {
            console.log(`Processing chunk ${index + 1}/${chunks.length}...`);
            return classifyChunk(chunk);
        })
    );

    // Flatten all results
    const allItems = chunkResults.flat();
    console.log(`Total items classified: ${allItems.length}`);

    return allItems;
}
