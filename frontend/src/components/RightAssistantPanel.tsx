'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { api } from '../lib/api';
import { useLanguage } from '../context/LanguageContext';
import { GovIcon } from './ui/GovIcon';
import { SupportedLanguage } from '../lib/translations';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  matchedSchemes?: any[];
  followUps?: string[];
}

export const RightAssistantPanel: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionToken, setSessionToken] = useState<string | undefined>();
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const languages: { code: SupportedLanguage; label: string }[] = [
    { code: 'en', label: 'English' },
    { code: 'kn', label: 'Kannada' },
    { code: 'hi', label: 'Hindi' },
    { code: 'ur', label: 'Urdu' }
  ];

  const currentLang = languages.find(l => l.code === language) || languages[0];

  const suggestedQuestions = [
    'I am a student looking for scholarships',
    'I need financial assistance',
    'I am a farmer looking for government benefits',
    'Check my eligibility for a scheme',
    'Help me with required documents'
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    if (!textToSend) setInputText('');
    setIsLoading(true);

    try {
      const res = await api.sendChatMessage({
        message: text,
        session_token: sessionToken,
        language
      });

      if (res.session_token) {
        setSessionToken(res.session_token);
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: res.response_text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        matchedSchemes: res.matched_schemes || [],
        followUps: res.follow_up_questions || []
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (err: any) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: 'Sorry, I encountered a temporary connection issue. Please verify your query or try again in a moment.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="w-full xl:w-[454px] bg-[#FFFFFF] rounded-2xl border border-[#E5E5E5] flex flex-col h-[680px] lg:h-[calc(100vh-104px)] sticky top-4 shadow-xs">
      {/* Panel Header */}
      <div className="p-4 border-b border-[#E5E5E5] flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#111111] text-white flex items-center justify-center flex-shrink-0">
            <GovIcon name="chat" className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-[#111111] leading-tight">
              Jan Setu Assistant
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#15803D]" />
              <span className="text-[11px] text-[#555555]">Online</span>
            </div>
          </div>
        </div>

        {/* Language selector in assistant */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setLangDropdownOpen(!langDropdownOpen)}
            className="flex items-center gap-1.5 bg-[#F7F7F6] border border-[#E5E5E5] hover:border-[#D4D4D4] rounded-lg px-2.5 py-1 text-xs font-medium text-[#111111] transition-colors"
          >
            <span>{currentLang.label}</span>
            <GovIcon name="chevron-down" className="w-3.5 h-3.5 text-[#858585]" />
          </button>

          {langDropdownOpen && (
            <div className="absolute right-0 top-full mt-1 w-28 bg-[#FFFFFF] border border-[#E5E5E5] rounded-lg shadow-lg py-1 z-50 text-xs">
              {languages.map((l) => (
                <button
                  key={l.code}
                  onClick={() => {
                    setLanguage(l.code);
                    setLangDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 hover:bg-[#F7F7F6] ${
                    language === l.code ? 'font-bold text-[#111111] bg-[#F7F7F6]' : 'text-[#555555]'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Panel Body: Chat & Suggestions */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {/* Default Welcome Message from Reference Screenshot */}
        <div className="flex items-start gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#262626] text-white flex items-center justify-center flex-shrink-0 mt-0.5">
            <GovIcon name="bot" className="w-4 h-4 text-white" />
          </div>
          <div className="bg-[#F7F7F6] border border-[#E5E5E5] rounded-2xl rounded-tl-sm p-3.5 text-xs text-[#111111] leading-relaxed max-w-[85%]">
            Hello! I'm your Jan Setu assistant. Tell me what kind of government support you're looking for. You can write or speak in your preferred language.
          </div>
        </div>

        {/* "You can ask me about:" section (shown before or alongside chat) */}
        {messages.length === 0 && (
          <div className="space-y-2 pt-2">
            <p className="font-semibold text-xs text-[#111111]">
              You can ask me about:
            </p>
            <div className="space-y-1.5">
              {suggestedQuestions.map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(q)}
                  className="w-full text-left bg-[#FFFFFF] border border-[#E5E5E5] hover:border-[#111111] hover:bg-[#F7F7F6] text-[#111111] text-xs font-medium px-3.5 py-2.5 rounded-xl flex items-center justify-between transition-colors group"
                >
                  <span className="truncate pr-2">{q}</span>
                  <GovIcon name="chevron-right" className="w-3.5 h-3.5 text-[#858585] group-hover:text-[#111111] flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Dynamic Conversation Messages */}
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.sender === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-[#262626] text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                <GovIcon name="bot" className="w-4 h-4 text-white" />
              </div>
            )}

            <div
              className={`rounded-2xl p-3 text-xs leading-relaxed max-w-[85%] ${
                m.sender === 'user'
                  ? 'bg-[#111111] text-white rounded-tr-sm'
                  : 'bg-[#F7F7F6] text-[#111111] border border-[#E5E5E5] rounded-tl-sm'
              }`}
            >
              <p className="whitespace-pre-wrap">{m.text}</p>

              {/* Matched Schemes Links if any */}
              {m.matchedSchemes && m.matchedSchemes.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-[#E5E5E5] space-y-2">
                  <span className="font-bold text-[10px] text-[#555555] uppercase tracking-wider block">
                    Verified Scheme Matches:
                  </span>
                  {m.matchedSchemes.map((s: any) => (
                    <div key={s.id} className="p-2 bg-[#FFFFFF] border border-[#E5E5E5] rounded-lg space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#111111] text-[11px] truncate max-w-[190px]">{s.title}</span>
                        <span className="text-[10px] font-mono text-[#858585]">{s.code}</span>
                      </div>
                      <div className="flex gap-2 pt-1 text-[11px]">
                        <Link href={`/schemes/${s.id}`} className="text-[#111111] font-semibold hover:underline">
                          View Rules &rarr;
                        </Link>
                        <Link href={`/eligibility?scheme=${s.id}`} className="text-[#15803D] font-semibold hover:underline">
                          Check Eligibility &rarr;
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Follow-up question chips */}
              {m.followUps && m.followUps.length > 0 && (
                <div className="mt-2.5 pt-2 border-t border-[#E5E5E5] space-y-1">
                  {m.followUps.slice(0, 2).map((fu, fIdx) => (
                    <button
                      key={fIdx}
                      type="button"
                      onClick={() => handleSendMessage(fu)}
                      className="block text-left text-[11px] text-[#111111] bg-white border border-[#E5E5E5] rounded-md px-2 py-1 hover:border-[#111111] transition-colors"
                    >
                      {fu} &rarr;
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#262626] text-white flex items-center justify-center flex-shrink-0 mt-0.5">
              <GovIcon name="bot" className="w-4 h-4 text-white" />
            </div>
            <div className="bg-[#F7F7F6] border border-[#E5E5E5] rounded-2xl p-3 text-xs text-[#555555] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#858585] animate-ping" />
              <span>Jan Setu AI is thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Panel Bottom: Message Composer */}
      <div className="p-3 border-t border-[#E5E5E5] bg-[#FFFFFF] rounded-b-2xl">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <div className="flex-1 flex items-center gap-2 bg-[#F7F7F6] border border-[#E5E5E5] focus-within:border-[#111111] rounded-xl px-3 py-2 transition-colors">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              disabled={isLoading}
              className="flex-1 bg-transparent text-xs sm:text-sm text-[#111111] placeholder-[#858585] focus:outline-none"
            />

            {/* Paperclip Action */}
            <Link
              href="/documents"
              title="Upload / Manage Documents"
              className="text-[#555555] hover:text-[#111111] transition-colors p-0.5"
            >
              <GovIcon name="paperclip" className="w-4 h-4" />
            </Link>
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            aria-label="Send Message"
            className="w-9 h-9 rounded-xl bg-[#111111] hover:bg-[#262626] disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center flex-shrink-0 transition-colors"
          >
            <GovIcon name="send" className="w-4 h-4 text-white" />
          </button>
        </form>
      </div>
    </div>
  );
};

