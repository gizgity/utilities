import { NextResponse } from 'next/server';
import { YtDlp } from 'ytdlp-nodejs';

const ytdlp = new YtDlp();

// Define the preferred format search order
const preferredFormats = [
  { quality: '720p', type: 'mp4' },
  { quality: '480p', type: 'mp4' },
  { quality: '360p', type: 'mp4' },
  { quality: '720p', type: 'webm' },
  { quality: '480p', type: 'webm' },
  { quality: '360p', type: 'webm' },
];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const url = body.url;

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Invalid URL provided' }, { status: 400 });
    }

    const metadata = await ytdlp.getInfoAsync(url);

    if (metadata._type === 'playlist') {
      return NextResponse.json({ error: 'Playlists are not supported. Please provide a URL to a single video.' }, { status: 400 });
    }

    if (!metadata.formats) {
        return NextResponse.json({ error: 'No video formats available for this URL' }, { status: 404 });
    }

    for (const preferredFormat of preferredFormats) {
      const { quality, type } = preferredFormat;

      const matchingFormats = metadata.formats.filter(format => {
        const height = format.height;
        const ext = format.ext;
        return height && height.toString() === quality.replace('p', '') && ext === type;
      });

      if (matchingFormats.length > 0) {
        const urls = matchingFormats.map(format => format.url).filter(Boolean); // Filter out any null/undefined URLs
        if (urls.length > 0) {
            return NextResponse.json({
              quality,
              type,
              data: urls,
            });
        }
      }
    }

    return NextResponse.json({ error: 'No suitable video format found' }, { status: 404 });

  } catch (error: any) {
    console.error('Error processing request:', error);
    // Check for common yt-dlp errors
    if (error.message && error.message.includes('Unsupported URL')) {
        return NextResponse.json({ error: 'The provided URL is not supported.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'An unexpected error occurred while processing the URL' }, { status: 500 });
  }
}
