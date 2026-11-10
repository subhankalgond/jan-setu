'use client';

import React, { useState, useEffect, useRef } from 'react';
import { GovIcon } from './ui/GovIcon';
import { SupportedLanguage } from '../lib/translations';

interface VoiceRecorderProps {
  onTranscript: (text: string) => void;
  language: SupportedLanguage;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onTranscript, language }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  const langCodes: Record<SupportedLanguage, string> = {
    en: 'en-IN',
    kn: 'kn-IN',
    hi: 'hi-IN',
    ur: 'ur-IN'
  };

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = langCodes[language] || 'en-IN';

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          onTranscript(transcript);
        }
      };

      recognition.onerror = () => {
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    } catch {
      setIsSupported(false);
    }
  }, [language, onTranscript]);

  const toggleRecording = () => {
    if (!recognitionRef.current) return;

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.lang = langCodes[language] || 'en-IN';
        recognitionRef.current.start();
      } catch {
        setIsRecording(false);
      }
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={toggleRecording}
      className={`px-3 py-2 rounded border transition-all flex items-center gap-2 select-none ${
        isRecording
          ? 'bg-[#FEF2F2] border-[#DC2626] text-[#DC2626] ring-1 ring-[#DC2626]'
          : 'bg-[#FDFBF7] border-[#D5CEBF] text-[#0F1E36] hover:bg-[#F3EFE6] hover:border-[#B8B09F]'
      }`}
      title={isRecording ? 'Listening... click to stop' : 'Click to speak in your language'}
      aria-label={isRecording ? 'Stop voice recording' : 'Start voice recording'}
    >
      {isRecording ? (
        <>
          <div className="flex items-center gap-0.5 h-4">
            <span className="w-1 bg-[#DC2626] rounded-full animate-wave-1" />
            <span className="w-1 bg-[#DC2626] rounded-full animate-wave-2" />
            <span className="w-1 bg-[#DC2626] rounded-full animate-wave-3" />
            <span className="w-1 bg-[#DC2626] rounded-full animate-wave-4" />
          </div>
          <span className="text-[10px] font-mono font-bold tracking-wider uppercase">
            Listening...
          </span>
        </>
      ) : (
        <>
          <GovIcon name="microphone" className="w-4 h-4 text-[#0D9488]" />
          <span className="text-[10px] font-mono text-[#64748B] hidden sm:inline uppercase tracking-wider font-semibold">
            Voice
          </span>
        </>
      )}
    </button>
  );
};
