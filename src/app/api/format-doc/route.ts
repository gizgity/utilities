// Format-Doc API Endpoint
// Orchestrates template analysis, content classification, and deterministic formatting
import { NextRequest, NextResponse } from 'next/server';
import mammoth from 'mammoth';
import { analyzeTemplate } from './analyzer';
import { classifyContent } from './classifier';
import { applyFormatting, generateDocument } from './formatter';

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

        console.log('Starting document formatting...');

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

        console.log('Files extracted. Starting parallel analysis...');

        // Phase 1: Analyze template (File B) and classify content (File A) in parallel
        const [templateRules, contentItems] = await Promise.all([
            analyzeTemplate(htmlContentB),
            classifyContent(textContentA)
        ]);

        console.log('Analysis complete. Template rules extracted, content classified.');
        console.log(`Found ${contentItems.length} content items to format.`);

        // Phase 2: Apply deterministic formatting
        console.log('Applying deterministic formatting...');
        const paragraphs = applyFormatting(contentItems, templateRules);

        // Phase 3: Generate document
        console.log('Generating document...');
        const buffer = await generateDocument(paragraphs);

        // Generate filename from File A's name
        const originalName = fileA.name.replace('.docx', '');
        const formattedFileName = `${originalName}_formatted.docx`;

        console.log(`Document generated: ${formattedFileName}`);

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
