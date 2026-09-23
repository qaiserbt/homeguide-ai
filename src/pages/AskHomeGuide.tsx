import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mic, Send } from "lucide-react";
import { useTourContext } from "../hooks/useTourContext";
import { AvatarGuide } from "../components/avatar/AvatarGuide";
import { ChatMessage } from "../components/tour/ChatMessage";
import { SuggestedQuestions } from "../components/tour/SuggestedQuestions";
import { answerPropertyQuestion } from "../services/ai";
import * as speechService from "../services/speech";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";
import type { AvatarState } from "../types/avatar";

interface Message {
  role: "user" | "assistant";
  text: string;
}

const SUGGESTED_QUESTIONS = [
  "Does this home have a finished basement?",
  "How many bedrooms are there?",
  "Is there a backyard with a pool?",
  "What are the nearby schools?",
  "What are the monthly property taxes?",
  "Does the basement have a separate entrance?",
];

export function AskHomeGuide() {
  const { property } = useTourContext();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [avatarState, setAvatarState] = useState<AvatarState>("welcome");
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const { supported: micSupported, listening, start, stop } = useSpeechRecognition((text) => {
    setInput(text);
  });

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    return () => speechService.stop();
  }, []);

  function ask(question: string) {
    const trimmed = question.trim();
    if (!trimmed) return;

    setMessages((prev) => [...prev, { role: "user", text: trimmed }]);
    setInput("");
    setAvatarState("thinking");

    window.setTimeout(() => {
      const answer = answerPropertyQuestion(property, trimmed);
      setMessages((prev) => [...prev, { role: "assistant", text: answer }]);
      setAvatarState("speaking");
      window.setTimeout(() => setAvatarState("explaining"), 1200);
    }, 550);
  }

  function toggleAudio(index: number, text: string) {
    if (playingIndex === index) {
      speechService.stop();
      setPlayingIndex(null);
      return;
    }
    speechService.speak(text, () => setPlayingIndex(null));
    setPlayingIndex(index);
  }

  return (
    <div className="flex h-[calc(100dvh-5rem)] flex-col lg:mx-auto lg:max-w-2xl">
      <header className="flex items-center gap-3 border-b border-navy/10 bg-white px-4 pt-[calc(0.75rem+env(safe-area-inset-top))] pb-3 sm:px-6">
        <Link
          to={`/tour/${property.slug}`}
          aria-label="Back to home"
          className="flex h-9 w-9 items-center justify-center rounded-full text-navy hover:bg-navy/5"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-serif text-lg text-navy">Ask HomeGuide</h1>
      </header>

      <div ref={listRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-5 sm:px-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <AvatarGuide state={avatarState} size="lg" position="inline" isSpeaking={avatarState === "speaking"} />
          <div>
            <p className="font-serif text-lg text-navy">Ask me anything about this property!</p>
            <p className="mx-auto mt-1 max-w-xs text-sm text-text-secondary">
              I can answer questions about features, measurements, neighbourhood and more.
            </p>
          </div>
        </div>

        {messages.length === 0 && (
          <SuggestedQuestions questions={SUGGESTED_QUESTIONS} onSelect={ask} />
        )}

        {messages.map((message, index) => (
          <ChatMessage
            key={index}
            role={message.role}
            text={message.text}
            isPlaying={playingIndex === index}
            onToggleAudio={message.role === "assistant" ? () => toggleAudio(index, message.text) : undefined}
          />
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          ask(input);
        }}
        className="flex items-center gap-2 border-t border-navy/10 bg-white px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:px-6"
      >
        {micSupported && (
          <button
            type="button"
            onClick={listening ? stop : start}
            aria-label={listening ? "Stop listening" : "Ask by voice"}
            aria-pressed={listening}
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors ${
              listening ? "bg-gold text-navy" : "bg-offwhite text-navy hover:bg-navy/10"
            }`}
          >
            <Mic className="h-4 w-4" />
          </button>
        )}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question…"
          aria-label="Ask a question about this property"
          className="min-w-0 flex-1 rounded-full bg-offwhite px-4 py-2.5 text-sm text-text-dark outline-none ring-gold/50 placeholder:text-text-secondary focus:ring-2"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          aria-label="Send question"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy text-white transition-transform hover:bg-navy-light active:scale-95 disabled:opacity-30"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
