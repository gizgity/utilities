'use client';

import { useState } from 'react';
import { Loader } from '@/components/ui/Loader';
import { Textarea, Button, Alert, Select, Input } from '@/components/ui';
import { PixelHeader } from '@/components/PixelDecor';

export default function TTSPage() {
  const [text, setText] = useState('');
  const [stylePrompt, setStylePrompt] = useState('Read aloud in a warm, welcoming tone');
  const [voice, setVoice] = useState('Kore');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const voicesList = [
    'Achernar',
    'Achird',
    'Algenib',
    'Algieba',
    'Alnilam',
    'Aoede',
    'Autonoe',
    'Callirrhoe',
    'Charon',
    'Despina',
    'Enceladus',
    'Erinome',
    'Fenrir',
    'Gacrux',
    'Iapetus',
    'Kore',
    'Laomedeia',
    'Leda',
    'Orus',
    'Puck',
    'Pulcherrima',
    'Rasalgethi',
    'Sadachbia',
    'Sadaltager',
    'Schedar',
    'Sulafat',
    'Umbriel',
    'Vindemiatrix',
    'Zephyr',
    'Zubenelgenubi',
  ];

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
        body: JSON.stringify({ text, voice, stylePrompt }),
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
    <div className="container mx-auto p-8 max-w-4xl">
      <PixelHeader className="mb-8 justify-center">Text-to-Speech</PixelHeader>
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="space-y-2">
          <label htmlFor="style-prompt-input" className="font-bold">
            Style Instructions
          </label>
          <Textarea
            id="style-prompt-input"
            value={stylePrompt}
            onChange={(e) => setStylePrompt(e.target.value)}
            placeholder="e.g., Read aloud in a warm, welcoming tone"
            className="w-full h-14"
          />
        </div>

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
          <Select
            value={voice}
            onValueChange={setVoice}
          >
            <Select.Trigger>
              <Select.Value placeholder="Voice Selection" />
            </Select.Trigger>
            <Select.Content>
              <Select.Group>
                {voicesList.map((v) => (
                  <Select.Item key={v} value={v}>
                    {v}
                  </Select.Item>
                ))}
              </Select.Group>
            </Select.Content>
          </Select>
        </div>

        <Button
          onClick={handleGenerate}
          disabled={isLoading || !text.trim()}
          className="w-full"
        >
          {isLoading ? <Loader variant="blocks" /> : 'Generate'}
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

        <div className="mt-8 p-6 border-4 border-foreground bg-muted">
          <h3 className="text-lg mb-2">[ HOW IT WORKS ]</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm opacity-70">
            <li>Enter style instructions to customize the voice tone and delivery</li>
            <li>Type or paste your text (up to 1000 characters)</li>
            <li>Select a voice from the dropdown menu</li>
            <li>Click "Generate" to create your audio file</li>
            <li>Listen to the generated audio using the player</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
