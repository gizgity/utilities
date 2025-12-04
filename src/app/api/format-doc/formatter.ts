// Deterministic Formatter Module - Pure TypeScript formatting using docx library
import { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel, TabStopType } from 'docx';
import { ContentItem, TemplateRules, LayoutType, LayoutStyle, AnswerOption } from './types';

// Type for tab stop configuration
type TabStopConfig = {
    type: typeof TabStopType.LEFT;
    position: number;
};

// Map alignment strings to docx AlignmentType
const alignmentMap: Record<string, typeof AlignmentType[keyof typeof AlignmentType]> = {
    'left': AlignmentType.LEFT,
    'center': AlignmentType.CENTER,
    'right': AlignmentType.RIGHT,
    'justified': AlignmentType.JUSTIFIED
};

// Map heading levels
const headingLevelMap: Record<number, typeof HeadingLevel[keyof typeof HeadingLevel]> = {
    1: HeadingLevel.HEADING_1,
    2: HeadingLevel.HEADING_2,
    3: HeadingLevel.HEADING_3,
    4: HeadingLevel.HEADING_4,
    5: HeadingLevel.HEADING_5,
    6: HeadingLevel.HEADING_6
};

/**
 * Creates tab stops configuration for docx paragraph.
 */
function createTabStops(positions: number[] | undefined): TabStopConfig[] | undefined {
    if (!positions || positions.length === 0) return undefined;
    return positions.map(pos => ({
        type: TabStopType.LEFT,
        position: pos
    }));
}

/**
 * Formats a single answer line (for four_line layout).
 */
function formatSingleAnswerLine(answer: AnswerOption, style: LayoutStyle): Paragraph {
    return new Paragraph({
        children: [
            new TextRun({
                text: `${answer.option}. ${answer.text}`,
                font: style.fontName,
                size: style.fontSize * 2 // docx uses half-points
            })
        ],
        spacing: {
            before: style.spacingBefore,
            after: style.spacingAfter
        },
        alignment: alignmentMap[style.alignment] || AlignmentType.LEFT
    });
}

/**
 * Formats a two-answer line (for two_line layout: A-B or C-D).
 */
function formatTwoAnswerLine(answer1: AnswerOption, answer2: AnswerOption, style: LayoutStyle): Paragraph {
    return new Paragraph({
        children: [
            new TextRun({
                text: `${answer1.option}. ${answer1.text}`,
                font: style.fontName,
                size: style.fontSize * 2
            }),
            new TextRun({
                text: '\t',
                font: style.fontName,
                size: style.fontSize * 2
            }),
            new TextRun({
                text: `${answer2.option}. ${answer2.text}`,
                font: style.fontName,
                size: style.fontSize * 2
            })
        ],
        tabStops: createTabStops(style.tabStops),
        spacing: {
            before: style.spacingBefore,
            after: style.spacingAfter
        },
        alignment: alignmentMap[style.alignment] || AlignmentType.LEFT
    });
}

/**
 * Formats inline answers (all on one line).
 */
function formatInlineAnswers(answers: AnswerOption[], style: LayoutStyle): Paragraph {
    const children: TextRun[] = [];

    answers.forEach((answer, idx) => {
        children.push(new TextRun({
            text: `${answer.option}. ${answer.text}`,
            font: style.fontName,
            size: style.fontSize * 2
        }));

        if (idx < answers.length - 1) {
            children.push(new TextRun({
                text: '\t',
                font: style.fontName,
                size: style.fontSize * 2
            }));
        }
    });

    return new Paragraph({
        children,
        tabStops: createTabStops(style.tabStops),
        spacing: {
            before: style.spacingBefore,
            after: style.spacingAfter
        },
        alignment: alignmentMap[style.alignment] || AlignmentType.LEFT
    });
}



/**
 * Formats an answer block based on its layout type.
 */
function formatAnswerBlock(
    answers: AnswerOption[],
    layoutType: LayoutType,
    rules: TemplateRules,
    questionNumber?: number
): Paragraph[] {
    const style = rules.questionLayouts[layoutType];

    switch (layoutType) {
        case "inline":
            return [formatInlineAnswers(answers, style)];

        case "two_line":
            if (answers.length >= 4) {
                return [
                    formatTwoAnswerLine(answers[0], answers[1], style),
                    formatTwoAnswerLine(answers[2], answers[3], style)
                ];
            }
            // Fallback for less than 4 answers
            return answers.map(a => formatSingleAnswerLine(a, style));

        case "four_line":
            return answers.map(a => formatSingleAnswerLine(a, style));

        default:
            // Default to four_line if unknown layout
            return answers.map(a => formatSingleAnswerLine(a, rules.questionLayouts.four_line));
    }
}

/**
 * Formats a question paragraph.
 */
function formatQuestion(content: string, rules: TemplateRules): Paragraph {
    const style = rules.paragraphFormats;

    return new Paragraph({
        children: [
            new TextRun({
                text: content,
                font: style.fontName,
                size: style.fontSize * 2,
                bold: true // Question text is typically bold
            })
        ],
        spacing: {
            before: 100,
            after: style.spacingAfter
        },
        alignment: AlignmentType.LEFT
    });
}

/**
 * Formats a heading paragraph.
 */
function formatHeading(content: string, rules: TemplateRules, level?: number): Paragraph {
    const style = rules.headingFormats;

    return new Paragraph({
        children: [
            new TextRun({
                text: content,
                font: style.fontName,
                size: style.fontSize * 2,
                bold: true
            })
        ],
        heading: level ? headingLevelMap[level] : undefined,
        spacing: {
            before: 100,
            after: style.spacingAfter
        },
        alignment: alignmentMap[style.alignment] || AlignmentType.CENTER
    });
}

/**
 * Formats a regular paragraph.
 */
function formatParagraph(content: string, rules: TemplateRules): Paragraph {
    const style = rules.paragraphFormats;

    return new Paragraph({
        children: [
            new TextRun({
                text: content,
                font: style.fontName,
                size: style.fontSize * 2
            })
        ],
        spacing: {
            after: style.spacingAfter
        },
        alignment: AlignmentType.LEFT
    });
}

/**
 * Applies formatting to all content items and generates docx paragraphs.
 */
export function applyFormatting(items: ContentItem[], rules: TemplateRules): Paragraph[] {
    const paragraphs: Paragraph[] = [];

    for (const item of items) {
        switch (item.type) {
            case "heading":
                paragraphs.push(formatHeading(
                    item.content,
                    rules,
                    item.metadata?.headingLevel
                ));
                break;

            case "question":
                paragraphs.push(formatQuestion(item.content, rules));
                break;

            case "answer_block":
                if (item.answers && item.answers.length > 0) {
                    const answerParagraphs = formatAnswerBlock(
                        item.answers,
                        item.layoutType || "four_line",
                        rules,
                        item.metadata?.questionNumber
                    );
                    paragraphs.push(...answerParagraphs);
                }
                break;

            case "paragraph":
                paragraphs.push(formatParagraph(item.content, rules));
                break;
        }
    }

    return paragraphs;
}

/**
 * Generates a complete docx document from formatted paragraphs.
 */
export async function generateDocument(paragraphs: Paragraph[]): Promise<Buffer> {
    const doc = new Document({
        sections: [
            {
                properties: {},
                children: paragraphs
            }
        ]
    });

    return await Packer.toBuffer(doc);
}
