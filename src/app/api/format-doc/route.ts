import { NextRequest, NextResponse } from 'next/server';
import mammoth from 'mammoth';
import { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel } from 'docx';
import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from '@google/genai';

// Initialize Gemini AI
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

// Define the schema for formatting instructions
const formattingSchema = {
    type: "OBJECT",
    properties: {
        paragraphs: {
            type: "ARRAY",
            description: "Array of formatting instructions for each paragraph in File A",
            items: {
                type: "OBJECT",
                properties: {
                    textRuns: {
                        type: "ARRAY",
                        description: "Array of text runs with individual formatting within this paragraph",
                        items: {
                            type: "OBJECT",
                            properties: {
                                text: {
                                    type: "STRING",
                                    description: "The text content for this run"
                                },
                                isBold: {
                                    type: "BOOLEAN",
                                    description: "Whether this text run should be bold"
                                },
                                isItalic: {
                                    type: "BOOLEAN",
                                    description: "Whether this text run should be italic"
                                },
                                isUnderline: {
                                    type: "BOOLEAN",
                                    description: "Whether this text run should be underlined"
                                }
                            },
                            required: ["text", "isBold", "isItalic", "isUnderline"]
                        }
                    },
                    isHeading: {
                        type: "BOOLEAN",
                        description: "Whether this paragraph should be formatted as a heading"
                    },
                    headingLevel: {
                        type: "INTEGER",
                        description: "Heading level (1-6) if isHeading is true, otherwise null"
                    },
                    alignment: {
                        type: "STRING",
                        description: "Text alignment: 'left', 'center', 'right', or 'justified'"
                    },
                    spacingAfter: {
                        type: "INTEGER",
                        description: "Space after paragraph in twips (1/20th of a point)"
                    },
                    spacingBefore: {
                        type: "INTEGER",
                        description: "Space before paragraph in twips"
                    }
                },
                required: ["textRuns", "isHeading", "alignment"]
            }
        }
    },
    required: ["paragraphs"]
};

// Helper function to split text into chunks (approximately 2 pages worth of content)
function splitIntoChunks(text: string, maxParagraphsPerChunk: number = 50): string[] {
    const paragraphs = text.split('\n').filter(p => p.trim().length > 0);
    const chunks: string[] = [];

    for (let i = 0; i < paragraphs.length; i += maxParagraphsPerChunk) {
        const chunk = paragraphs.slice(i, i + maxParagraphsPerChunk).join('\n');
        chunks.push(chunk);
    }

    return chunks;
}

// Helper function to process a single chunk with Gemini
async function processChunk(chunkText: string, htmlContentB: string): Promise<any> {
    const result = await genAI.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
            {
                role: 'user',
                parts: [
                    {
                        text: `You are a document formatting expert. Analyze the HTML structure of File B (the reference document with good formatting) and apply similar formatting patterns to the content of this chunk from File A.

FILE B (Reference - HTML format):
${htmlContentB}

FILE A CHUNK (Content to format - Plain text):
${chunkText}

Your task:
1. Analyze File B's formatting patterns very carefully:
   - Pay special attention to INLINE formatting (e.g., if only "Question 32:" is bold but the rest of the sentence is not, capture that)
   - NOTE: The output document will use a SINGLE font size throughout - do not specify font sizes
   - Identify heading styles, text formatting, alignment, spacing

2. For each paragraph in this chunk:
   - Break it into text runs if different parts have different formatting
   - For example, "Question 32. What should teens learn about money?" should have:
     * First run: "Question 32:" (bold if that's the pattern in File B)
     * Second run: " What should teens learn about money?" (normal text)
   
3. CRITICAL - ANSWER LAYOUT PRESERVATION:
   **You MUST preserve the EXACT original layout pattern from File A for answer options.**
   
   File A has THREE different layout patterns for answer options:
   
   Layout 1 (all inline): "A. answer\tB. answer\tC. answer\tD. answer"
   Layout 2 (A-B / C-D): "A. answer\tB. answer\nC. answer\tD. answer"  
   Layout 3 (all separate): "A. answer\nB. answer\nC. answer\nD. answer"
   
   Your job:
   - DETECT which layout pattern each question uses in File A
   - PRESERVE that exact pattern (same number of lines, same options per line)
   - ONLY adjust the TAB spacing to be consistent throughout
   
   For tab spacing:
   - Layout 1 questions should all use the SAME number of tabs between options
   - Layout 2 questions should all use the SAME number of tabs between A-B and C-D
   - Layout 3 has no tabs (each option on separate line)
   - Use enough tabs so that option letters align vertically across questions
   
   DO NOT change a Layout 2 to Layout 1, or Layout 3 to Layout 1, etc.
   ONLY standardize the tab spacing within each layout type.

4. Return detailed formatting instructions with text runs for each paragraph

CRITICAL: Only apply bold/italic/underline to the EXACT portions of text that have it in File B. Don't make entire paragraphs bold if only a label/prefix is bold in the reference.

Return a JSON object with formatting instructions for each paragraph in this chunk.`
                    }
                ]
            }
        ],
        config: {
            responseMimeType: 'application/json',
            responseSchema: formattingSchema,
            safetySettings: [
                {
                    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
                },
            ],
            temperature: 0.1
        }
    });

    return JSON.parse(result.text);
}

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const fileA = formData.get('fileA') as File;
        const fileB = formData.get('fileB') as File;

        if (!fileA || !fileB) {
            return NextResponse.json(
                { error: 'Both files are required' },
                { status: 400 }
            );
        }

        // Validate file types
        if (!fileA.name.endsWith('.docx') || !fileB.name.endsWith('.docx')) {
            return NextResponse.json(
                { error: 'Both files must be .docx format' },
                { status: 400 }
            );
        }

        // Extract content from both files
        const fileABuffer = Buffer.from(await fileA.arrayBuffer());
        const fileBBuffer = Buffer.from(await fileB.arrayBuffer());

        // Get text from File A and HTML from File B for better analysis
        const [fileAResult, fileBResult] = await Promise.all([
            mammoth.extractRawText({ buffer: fileABuffer }),
            mammoth.convertToHtml({ buffer: fileBBuffer })
        ]);

        const textContentA = fileAResult.value;
        const htmlContentB = fileBResult.value;

        // Split File A into chunks (approximately 2 pages each)
        const chunks = splitIntoChunks(textContentA);

        console.log(`Processing ${chunks.length} chunks...`);

        // Process all chunks in parallel for optimal performance
        console.log(`Processing ${chunks.length} chunks in parallel...`);
        const chunkResults = await Promise.all(
            chunks.map((chunk, index) => {
                console.log(`Starting chunk ${index + 1} / ${chunks.length}...`);
                return processChunk(chunk, htmlContentB);
            })
        );

        // Flatten all formatting instructions from all chunks
        const allFormattingInstructions: any[] = chunkResults.flatMap(result => result.paragraphs);

        console.log(`Total paragraphs formatted: ${allFormattingInstructions.length}`);

        // Create formatted document based on AI instructions
        const docParagraphs = allFormattingInstructions.map((instruction: any) => {
            // Map alignment string to AlignmentType enum
            const alignmentMap: Record<string, typeof AlignmentType[keyof typeof AlignmentType]> = {
                'left': AlignmentType.LEFT,
                'center': AlignmentType.CENTER,
                'right': AlignmentType.RIGHT,
                'justified': AlignmentType.JUSTIFIED
            };

            // Map heading level to HeadingLevel enum
            const headingLevelMap: Record<number, typeof HeadingLevel[keyof typeof HeadingLevel]> = {
                1: HeadingLevel.HEADING_1,
                2: HeadingLevel.HEADING_2,
                3: HeadingLevel.HEADING_3,
                4: HeadingLevel.HEADING_4,
                5: HeadingLevel.HEADING_5,
                6: HeadingLevel.HEADING_6
            };

            // Create text runs from the instruction's textRuns array
            // Using consistent font size (24 half-points = 12pt) and font (Times New Roman) throughout
            const textRuns = instruction.textRuns.map((run: any) => new TextRun({
                text: run.text,
                bold: run.isBold,
                italics: run.isItalic,
                underline: run.isUnderline ? {} : undefined,
                size: 24, // 12pt font size
                font: 'Times New Roman'
            }));

            return new Paragraph({
                children: textRuns,
                heading: instruction.isHeading && instruction.headingLevel
                    ? headingLevelMap[instruction.headingLevel]
                    : undefined,
                spacing: {
                    after: instruction.spacingAfter || 200,
                    before: instruction.spacingBefore || 0
                },
                alignment: alignmentMap[instruction.alignment] || AlignmentType.LEFT
            });
        });

        // Create the new document
        const doc = new Document({
            sections: [
                {
                    properties: {},
                    children: docParagraphs,
                },
            ],
        });

        // Generate the document buffer
        const buffer = await Packer.toBuffer(doc);

        // Generate filename from File A's name
        const originalName = fileA.name.replace('.docx', '');
        const formattedFileName = `${originalName}_formatted.docx`;

        // Return the formatted document
        return new NextResponse(new Uint8Array(buffer), {
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'Content-Disposition': `attachment; filename="${formattedFileName}"`,
            },
        });
    } catch (error: any) {
        console.error('Error formatting document:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to format document' },
            { status: 500 }
        );
    }
}

