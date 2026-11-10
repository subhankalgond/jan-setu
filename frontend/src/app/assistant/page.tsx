'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { api } from '../../lib/api';
import { useLanguage } from '../../context/LanguageContext';
import { GovIcon } from '../../components/ui/GovIcon';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { VoiceRecorder } from '../../components/VoiceRecorder';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  intent?: string;
  recommended_schemes?: any[];
}

export default function AssistantPage() {
  const { language, setLanguage } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionToken, setSessionToken] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let token = localStorage.getItem('jansetu_chat_session');
    if (!token) {
      token = 'session_' + Math.random().toString(36).substring(2, 12);
      localStorage.setItem('jansetu_chat_session', token);
    }
    setSessionToken(token);

    const greetings: Record<string, string> = {
      en: "Hello! I am your Jan Setu assistant. Tell me what kind of government support you're looking for. You can write or speak in your preferred language.",
      kn: "ನಮಸ್ಕಾರ! ನಾನು ಜನ ಸೇತು AI, ಕರ್ನಾಟಕ ಮತ್ತು ಕೇಂದ್ರ ಸರ್ಕಾರದ ಯೋಜನೆಗಳಿಗೆ ನಿಮ್ಮ ನಾಗರಿಕ ಸಹಾಯಕ. ನಿಮ್ಮ ಅಗತ್ಯತೆ, ಶಿಕ್ಷಣ ಅಥವಾ ಕುಟುಂಬದ ಕಸುಬಿನ ಬಗ್ಗೆ ಸರಳ ಭಾಷೆಯಲ್ಲಿ ತಿಳಿಸಿ.",
      hi: "नमस्कार! मैं जन सेतु AI हूँ। कर्नाटक और केंद्र सरकार की योजनाओं के लिए आपका नागरिक सहायक। अपनी आवश्यकता या सवाल के बारे में बताएं।",
      ur: "نمستے! میں جن سیتو AI ہوں، کرناٹک اور مرکزی حکومت کی اسکیموں کے لیے آپ کا معاون۔ اپنی ضرورت یا سوال عام زبان میں بتائیں۔"
    };

    setMessages([
      {
        id: 'init-msg',
        sender: 'assistant',
        text: greetings[language] || greetings.en
      }
    ]);
  }, [language]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const res = await api.sendChatMessage({
        message: text,
        session_token: sessionToken,
        language
      });

      const asstMsg: ChatMessage = {
        id: 'res-' + Date.now(),
        sender: 'assistant',
        text: res.response_text,
        intent: res.intent,
        recommended_schemes: res.matched_schemes || res.recommended_schemes
      };

      setMessages(prev => [...prev, asstMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: 'err-' + Date.now(),
        sender: 'assistant',
        text: "We encountered a temporary connection issue reaching the scheme repository. Please verify your query or explore schemes directly via the Schemes directory."
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    { label: 'Engineering scholarships', query: 'I am a 3rd year engineering student in Karnataka. What fee scholarships can I apply for?' },
    { label: 'Gruha Lakshmi (ಗೃಹ ಲಕ್ಷ್ಮಿ)', query: 'ನಾನು ಮಹಿಳೆಯರಿಗೆ ನೀಡುವ ಗೃಹ ಲಕ್ಷ್ಮಿ ಯೋಜನೆಗೆ ಹೇಗೆ ಅರ್ಜಿ ಸಲ್ಲಿಸಬೇಕು?' },
    { label: 'Unemployed graduate (Yuva Nidhi)', query: 'I graduated in 2024 and am looking for a job. Can I receive the Yuva Nidhi monthly allowance?' },
    { label: 'Farmer assistance (Raitha Siri)', query: 'I am cultivating millets on 2 acres of land in Karnataka. Is there direct DBT assistance?' }
  ];

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-120px)] space-y-4">
      {/* Header */}
      <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#111111] text-white flex items-center justify-center flex-shrink-0">
            <GovIcon name="chat" className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-[#111111]">Jan Setu AI Assistant</h1>
              <span className="flex items-center gap-1.5 text-xs text-[#555555]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#15803D]" />
                Online
              </span>
            </div>
            <p className="text-xs text-[#555555]">
              Natural language scheme assistance in Kannada, Hindi, English, and Urdu
            </p>
          </div>
        </div>

        {/* Language switcher */}
        <div className="flex items-center gap-1 bg-[#F7F7F6] p-1 rounded-lg border border-[#E5E5E5] text-xs">
          {(['en', 'kn', 'hi', 'ur'] as const).map(lang => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                language === lang ? 'bg-[#111111] text-white' : 'text-[#555555] hover:text-[#111111]'
              }`}
            >
              {lang === 'kn' ? 'ಕನ್ನಡ' : lang === 'hi' ? 'हिंदी' : lang === 'ur' ? 'اردو' : 'English'}
            </button>
          ))}
        </div>
      </div>

      {/* Messages Canvas */}
      <div className="flex-1 bg-[#FFFFFF] border border-[#E5E5E5] rounded-2xl p-4 sm:p-6 overflow-y-auto space-y-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-start gap-2.5 max-w-[85%]">
              {m.sender === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-[#262626] text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                  <GovIcon name="bot" className="w-4 h-4 text-white" />
                </div>
              )}

              <div
                className={`rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-[#111111] text-white rounded-tr-sm'
                    : 'bg-[#F7F7F6] text-[#111111] border border-[#E5E5E5] rounded-tl-sm'
                }`}
              >
                <div className="whitespace-pre-line leading-relaxed">{m.text}</div>

                {/* Recommended Schemes Cards in Assistant Response */}
                {m.recommended_schemes && m.recommended_schemes.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-[#E5E5E5] space-y-2.5">
                    <p className="text-[11px] font-bold text-[#111111] uppercase tracking-wider">
                      Verified Scheme Recommendations:
                    </p>
                    <div className="space-y-2">
                      {m.recommended_schemes.map((scheme: any) => (
                        <div
                          key={scheme.id}
                          className="bg-white p-3 rounded-xl border border-[#E5E5E5] text-xs space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-sm text-[#111111]">{scheme.title}</span>
                            <span className="font-mono text-xs text-[#858585]">{scheme.code}</span>
                          </div>
                          <p className="text-xs text-[#555555] leading-relaxed">{scheme.benefits || scheme.benefits_summary}</p>
                          <div className="flex items-center gap-2 pt-1">
                            <Link href={`/eligibility?scheme=${scheme.id}`}>
                              <Button variant="secondary" size="sm">
                                Check Eligibility
                              </Button>
                            </Link>
                            <Link href={`/schemes/${scheme.id}`}>
                              <Button variant="outline" size="sm">
                                View Details
                              </Button>
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start gap-2.5 text-xs">
            <div className="w-8 h-8 rounded-full bg-[#262626] text-white flex items-center justify-center flex-shrink-0 mt-0.5">
              <GovIcon name="bot" className="w-4 h-4 text-white" />
            </div>
            <div className="bg-[#F7F7F6] border border-[#E5E5E5] rounded-2xl p-3 text-[#555555] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#111111] animate-ping" />
              <span>Checking verified government rules and scheme repository...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion Chips */}
      <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-xl px-4 py-2.5 flex items-center gap-2 overflow-x-auto text-xs">
        <span className="text-[#858585] font-semibold text-[11px] whitespace-nowrap flex-shrink-0">
          Suggestions:
        </span>
        {quickPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(p.query)}
            className="px-3 py-1 rounded-lg bg-[#F7F7F6] border border-[#E5E5E5] text-[#111111] hover:border-[#111111] whitespace-nowrap text-xs font-medium transition-colors"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-2xl p-3 sm:p-4 flex-shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          {/* Voice Input */}
          <VoiceRecorder
            language={language}
            onTranscript={(transcribed) => {
              setInputText(transcribed);
            }}
          />

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your message in your preferred language..."
            className="flex-1 bg-[#F7F7F6] border border-[#E5E5E5] focus:border-[#111111] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[#111111] placeholder-[#858585] focus:outline-none transition-colors"
          />

          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={!inputText.trim() || isLoading}
          >
            <GovIcon name="send" className="w-4 h-4 mr-1 text-white" />
            <span>Send</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
