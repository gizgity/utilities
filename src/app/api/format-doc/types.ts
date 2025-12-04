// Shared type definitions for the format-doc API

export type LayoutType = "inline" | "two_line" | "four_line";

export type LayoutStyle = {
    fontName: string;
    fontSize: number;
    spacingBefore: number;
    spacingAfter: number;
    alignment: "left" | "center" | "right" | "justified";
    tabStops?: number[]; // Tab positions in twips
    includesQuestionNumber?: boolean;
};

export type TemplateRules = {
    questionLayouts: {
        [key in LayoutType]: LayoutStyle;
    };
    headingFormats: {
        fontName: string;
        fontSize: number;
        alignment: "left" | "center" | "right" | "justified";
        spacingAfter: number;
    };
    paragraphFormats: {
        fontName: string;
        fontSize: number;
        spacingAfter: number;
    };
};

export type AnswerOption = {
    option: string; // "A", "B", "C", "D"
    text: string;
};

export type ContentItem = {
    type: "heading" | "question" | "answer_block" | "paragraph";
    layoutType?: LayoutType;
    content: string;
    metadata?: {
        questionNumber?: number;
        headingLevel?: number;
    };
    answers?: AnswerOption[];
};

// Default template rules to use as fallback
export const DEFAULT_TEMPLATE_RULES: TemplateRules = {
    questionLayouts: {
        inline: {
            fontName: "Times New Roman",
            fontSize: 12,
            spacingBefore: 100,
            spacingAfter: 200,
            alignment: "left",
            tabStops: [2880, 5760, 8640]
        },

        two_line: {
            fontName: "Times New Roman",
            fontSize: 12,
            spacingBefore: 50,
            spacingAfter: 100,
            alignment: "left",
            tabStops: [4320]
        },
        four_line: {
            fontName: "Times New Roman",
            fontSize: 12,
            spacingBefore: 50,
            spacingAfter: 100,
            alignment: "left"
        }
    },
    headingFormats: {
        fontName: "Times New Roman",
        fontSize: 14,
        alignment: "center",
        spacingAfter: 300
    },
    paragraphFormats: {
        fontName: "Times New Roman",
        fontSize: 12,
        spacingAfter: 200
    }
};
