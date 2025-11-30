import { NextResponse } from 'next/server';
import ytdl from '@distube/ytdl-core';

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

    // Validate if the URL is a valid YouTube URL
    if (!ytdl.validateURL(url)) {
      return NextResponse.json({ error: 'Invalid YouTube URL provided' }, { status: 400 });
    }

    // Get video info
    const info = await ytdl.getInfo(url);

    // Check if it's a playlist (ytdl-core doesn't support playlists)
    if (info.videoDetails.isLiveContent) {
      return NextResponse.json({ error: 'Live streams are not supported.' }, { status: 400 });
    }

    const formats = info.formats;

    if (!formats || formats.length === 0) {
      return NextResponse.json({ error: 'No video formats available for this URL' }, { status: 404 });
    }

    // Filter formats that have both video and audio
    const videoFormats = formats.filter(format =>
      format.hasVideo && format.hasAudio && format.container
    );

    for (const preferredFormat of preferredFormats) {
      const { quality, type } = preferredFormat;
      const qualityHeight = parseInt(quality.replace('p', ''));

      const matchingFormats = videoFormats.filter(format => {
        const height = format.height;
        const container = format.container;
        return height === qualityHeight && container === type;
      });

      if (matchingFormats.length > 0) {
        const urls = matchingFormats.map(format => format.url).filter(Boolean);
        if (urls.length > 0) {
          return NextResponse.json({
            quality,
            type,
            data: urls,
            title: info.videoDetails.title,
            duration: info.videoDetails.lengthSeconds,
          });
        }
      }
    }

    // If no exact match, return the best available format
    const bestFormat = videoFormats.sort((a, b) => (b.height || 0) - (a.height || 0))[0];

    if (bestFormat) {
      return NextResponse.json({
        quality: `${bestFormat.height}p`,
        type: bestFormat.container,
        data: [bestFormat.url],
        title: info.videoDetails.title,
        duration: info.videoDetails.lengthSeconds,
      });
    }

    return NextResponse.json({ error: 'No suitable video format found' }, { status: 404 });

  } catch (error: any) {
    console.error('Error processing request:', error);

    // Check for common ytdl-core errors
    if (error.message && error.message.includes('Video unavailable')) {
      return NextResponse.json({ error: 'Video is unavailable or private.' }, { status: 404 });
    }

    if (error.message && error.message.includes('429')) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    return NextResponse.json({
      error: 'An unexpected error occurred while processing the URL',
      details: error.message
    }, { status: 500 });
  }
}
