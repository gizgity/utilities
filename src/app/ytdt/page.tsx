'use client';

import { useState } from 'react';
import { Loader } from '@/components/ui/Loader';
import { Button, Alert, Input } from '@/components/ui';
import { PixelHeader } from '@/components/PixelDecor';

export default function YtdlPage() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<any | null>(null);

  const handleGetVideo = async () => {
    setIsLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch('/api/ytdl', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to get video links.');
      }

      setResponse(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <PixelHeader className="mb-8 justify-center">YouTube Downloader</PixelHeader>
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="space-y-2">
          <label htmlFor="url-input" className="font-bold">
            YouTube URL
          </label>
          <Input
            id="url-input"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter a YouTube video URL..."
            className="w-full"
          />
        </div>

        <Button
          onClick={handleGetVideo}
          disabled={isLoading || !url.trim()}
          className="w-full"
        >
          {isLoading ? <Loader variant="bar" /> : 'Get Video'}
        </Button>

        {error && (
          <Alert variant="solid" status="error">
            <Alert.Title>Error</Alert.Title>
            <Alert.Description>{error}</Alert.Description>
          </Alert>
        )}

        {response && (
          <div className="space-y-4 p-4 border rounded-md">
            <h2 className="text-xl font-bold">[ Video Links ]</h2>
            <div>
              <p><span className="font-semibold">Quality:</span> {response.quality}</p>
              <p><span className="font-semibold">Type:</span> {response.type}</p>
            </div>
            <ul className="space-y-2">
              {response.data.map((link: string, index: number) => (
                <li key={index}>
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline break-all"
                  >
                    {`Link ${index + 1}`}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
