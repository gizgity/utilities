// Template Analysis Module - Uses Gemini to extract formatting rules from File B
import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from '@google/genai';
import { TemplateRules, DEFAULT_TEMPLATE_RULES } from './types';

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

// Schema for template analysis response
const templateAnalysisSchema = {
    type: "OBJECT",
    properties: {
        questionLayouts: {
            type: "OBJECT",
            description: "Formatting rules for different question layout types",
            properties: {
                inline: {
                    type: "OBJECT",
                    properties: {
                        fontName: { type: "STRING" },
                        fontSize: { type: "NUMBER" },
                        spacingBefore: { type: "NUMBER" },
                        spacingAfter: { type: "NUMBER" },
                        alignment: { type: "STRING", enum: ["left", "center", "right", "justified"] },
                        tabStops: { type: "ARRAY", items: { type: "NUMBER" } }
                    }
                },

                two_line: {
                    type: "OBJECT",
                    properties: {
                        fontName: { type: "STRING" },
                        fontSize: { type: "NUMBER" },
                        spacingBefore: { type: "NUMBER" },
                        spacingAfter: { type: "NUMBER" },
                        alignment: { type: "STRING", enum: ["left", "center", "right", "justified"] },
                        tabStops: { type: "ARRAY", items: { type: "NUMBER" } }
                    }
                },
                four_line: {
                    type: "OBJECT",
                    properties: {
                        fontName: { type: "STRING" },
                        fontSize: { type: "NUMBER" },
                        spacingBefore: { type: "NUMBER" },
                        spacingAfter: { type: "NUMBER" },
                        alignment: { type: "STRING", enum: ["left", "center", "right", "justified"] }
                    }
                }
            }
        },
        headingFormats: {
            type: "OBJECT",
            properties: {
                fontName: { type: "STRING" },
                fontSize: { type: "NUMBER" },
                alignment: { type: "STRING", enum: ["left", "center", "right", "justified"] },
                spacingAfter: { type: "NUMBER" }
            }
        },
        paragraphFormats: {
            type: "OBJECT",
            properties: {
                fontName: { type: "STRING" },
                fontSize: { type: "NUMBER" },
                spacingAfter: { type: "NUMBER" }
            }
        }
    },
    required: ["questionLayouts", "headingFormats", "paragraphFormats"]
};

/**
 * Analyzes File B (template document) to extract formatting rules.
 * Uses Gemini AI to understand the formatting patterns and returns structured rules.
 */
export async function analyzeTemplate(htmlContentB: string): Promise<TemplateRules> {
    try {
        const result = await genAI.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [
                {
                    role: 'user',
                    parts: [
                        {
                            text: `You are a document formatting analyzer. Analyze this reference document and extract EXACT formatting rules.

DOCUMENT (HTML format):
${htmlContentB}

TASK: Extract formatting rules for each type of content found. For questions with answer options (A, B, C, D), identify the layout type:

1. **inline**: All answers on one line (A. ... B. ... C. ... D. ...)
2. **two_line**: Answers split - A and B on first line, C and D on second line
3. **four_line**: Each answer on its own separate line

For EACH layout type you find, extract:
- fontName: The font family used (e.g., "Times New Roman", "Arial")
- fontSize: Font size in points (e.g., 12)
- spacingBefore: Space before paragraph in twips (1 point = 20 twips, so 12pt spacing = 240 twips)
- spacingAfter: Space after paragraph in twips
- alignment: "left", "center", "right", or "justified"
- tabStops: Array of tab stop positions in twips for answer spacing (1 inch = 1440 twips)

Also extract formatting for:
- headingFormats: How section headings are formatted
- paragraphFormats: How regular text paragraphs are formatted

Return a complete JSON object with rules for ALL layout types, using sensible defaults if a layout type is not found in the document.`
                        }
                    ]
                }
            ],
            config: {
                responseMimeType: 'application/json',
                responseSchema: templateAnalysisSchema,
                safetySettings: [
                    {
                        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
                    },
                ],
                temperature: 0.1
            }
        });

        const parsed = JSON.parse(result.text || '{}');

        // Merge with defaults to ensure all fields exist
        return {
            questionLayouts: {
                inline: { ...DEFAULT_TEMPLATE_RULES.questionLayouts.inline, ...parsed.questionLayouts?.inline },
                two_line: { ...DEFAULT_TEMPLATE_RULES.questionLayouts.two_line, ...parsed.questionLayouts?.two_line },
                four_line: { ...DEFAULT_TEMPLATE_RULES.questionLayouts.four_line, ...parsed.questionLayouts?.four_line }
            },
            headingFormats: { ...DEFAULT_TEMPLATE_RULES.headingFormats, ...parsed.headingFormats },
            paragraphFormats: { ...DEFAULT_TEMPLATE_RULES.paragraphFormats, ...parsed.paragraphFormats }
        };
    } catch (error) {
        console.error('Error analyzing template:', error);
        // Return defaults if analysis fails
        return DEFAULT_TEMPLATE_RULES;
    }
}
