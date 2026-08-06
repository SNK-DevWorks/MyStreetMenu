import { useState, useCallback } from 'react';

export type VoiceSearchStatus = 'idle' | 'listening' | 'unsupported';

export interface UseVoiceSearchReturn {
  status: VoiceSearchStatus;
  startListening: (onResult: (transcript: string) => void) => void;
}

export function useVoiceSearch(): UseVoiceSearchReturn {
  const isSupported =
    typeof window !== 'undefined' &&
    ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);

  const [status, setStatus] = useState<VoiceSearchStatus>(
    isSupported ? 'idle' : 'unsupported'
  );

  const startListening = useCallback(
    (onResult: (transcript: string) => void) => {
      if (!isSupported) return;

      const SpeechRecognitionAPI =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      const recognition = new SpeechRecognitionAPI();
      recognition.lang = 'en-US';

      recognition.onstart = () => setStatus('listening');

      recognition.onresult = (event: any) => {
        const transcript: string = event.results[0][0].transcript;
        if (transcript) onResult(transcript);
        setStatus('idle');
      };

      recognition.onerror = () => setStatus('idle');
      recognition.onend = () => setStatus('idle');

      recognition.start();
    },
    [isSupported]
  );

  return { status, startListening };
}
