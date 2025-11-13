'use client';

import { useState } from 'react';
import { Textarea, Button, Alert } from '@/components/ui';
// Assuming a Select component exists in the UI library
// If not, a native select will be used with appropriate styling.
// import { Select } from '@/components/ui';

export default function TTSPage() {
  const [text, setText] = useState('');
  const [voice, setVoice] = useState('Kore');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    setAudioUrl(null);

    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, voice }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate audio.');
      }

      const audioBlob = await response.blob();
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8 text-center">[ Text-to-Speech ]</h1>
      <div className="space-y-6 max-w-xl mx-auto">
        <div className="space-y-2">
          <label htmlFor="text-input" className="font-bold">
            Text Input
          </label>
          <Textarea
            id="text-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter text to convert to speech..."
            maxLength={1000}
            className="w-full h-40"
          />
          <p className="text-sm text-muted-foreground text-right">
            {text.length} / 1000
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="voice-select" className="font-bold">
            Voice Selection
          </label>
          {/*
            This is a placeholder for a styled select component.
            If a Select component is available in retroui.dev, it will be used.
            Otherwise, a native select will be styled to match the theme.
          */}
          <select
            id="voice-select"
            value={voice}
            onChange={(e) => setVoice(e.target.value)}
            className="w-full p-2 border border-border bg-background"
          >
            <option value="Kore">Kore</option>
            <option value="Puck">Puck</option>
            <option value="Zephyr">Zephyr</option>
          </select>
        </div>

        <Button
          onClick={handleGenerate}
          disabled={isLoading || !text.trim()}
          className="w-full"
        >
          {isLoading ? 'Generating...' : 'Generate'}
        </Button>

        {error && (
          <Alert variant="solid" status="error">
            <Alert.Title>Error</Alert.Title>
            <Alert.Description>{error}</Alert.Description>
          </Alert>
        )}

        {audioUrl && (
          <div className="space-y-2">
            <h2 className="text-xl font-bold">[ Generated Audio ]</h2>
            <audio controls src={audioUrl} className="w-full" />
          </div>
        )}
      </div>
    </div>
  );
}
