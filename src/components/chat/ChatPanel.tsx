import { useState, useRef, useEffect } from 'react';
import { Send, X, Bot, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { generateQuickQuestions } from '@/lib/quick-questions';
import type { ChatMessage, SimulationResult } from '@/types/simulation';

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  simulationResult?: SimulationResult | null;
}

type Message = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/policy-chat`;

// Parse markdown bold syntax (**text**) and render as JSX
function renderMarkdownContent(content: string) {
  const parts = content.split(/(\*\*[^*]+\*\*)/g);
  
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      const text = part.slice(2, -2);
      return <strong key={index}>{text}</strong>;
    }
    return part;
  });
}

async function streamChat({
  messages,
  simulationData,
  onDelta,
  onDone,
  onError,
}: {
  messages: Message[];
  simulationData?: SimulationResult | null;
  onDelta: (deltaText: string) => void;
  onDone: () => void;
  onError: (error: string) => void;
}) {
  // Prepare system message with simulation context
  const systemMessage = simulationData 
    ? {
        role: "system" as const,
        content: `You are an AI policy advisor helping users understand economic simulations. You have access to the current simulation results.

CURRENT SIMULATION DATA:
${JSON.stringify(simulationData, null, 2)}

When answering questions:
1. Reference specific values from the simulation data
2. Explain the economic mechanisms behind the results
3. Be clear and educational in your explanations
4. Connect results to economic theory (supply/demand, elasticity, etc.)
5. Answer follow-up questions about the simulation scenario`,
      }
    : null;

  const messagesToSend = systemMessage 
    ? [systemMessage as Message, ...messages]
    : messages;

  const resp = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ messages: messagesToSend }),
  });

  if (!resp.ok) {
    const errorData = await resp.json().catch(() => ({ error: "Request failed" }));
    onError(errorData.error || `Error: ${resp.status}`);
    return;
  }

  if (!resp.body) {
    onError("No response body");
    return;
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let textBuffer = "";
  let streamDone = false;

  while (!streamDone) {
    const { done, value } = await reader.read();
    if (done) break;
    textBuffer += decoder.decode(value, { stream: true });

    let newlineIndex: number;
    while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
      let line = textBuffer.slice(0, newlineIndex);
      textBuffer = textBuffer.slice(newlineIndex + 1);

      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (line.startsWith(":") || line.trim() === "") continue;
      if (!line.startsWith("data: ")) continue;

      const jsonStr = line.slice(6).trim();
      if (jsonStr === "[DONE]") {
        streamDone = true;
        break;
      }

      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (content) onDelta(content);
      } catch {
        textBuffer = line + "\n" + textBuffer;
        break;
      }
    }
  }

  // Final flush
  if (textBuffer.trim()) {
    for (let raw of textBuffer.split("\n")) {
      if (!raw) continue;
      if (raw.endsWith("\r")) raw = raw.slice(0, -1);
      if (raw.startsWith(":") || raw.trim() === "") continue;
      if (!raw.startsWith("data: ")) continue;
      const jsonStr = raw.slice(6).trim();
      if (jsonStr === "[DONE]") continue;
      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (content) onDelta(content);
      } catch { /* ignore partial leftovers */ }
    }
  }

  onDone();
}

export function ChatPanel({ isOpen, onClose, simulationResult }: ChatPanelProps) {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: simulationResult 
        ? 'Hello! I can see you have a simulation running. Ask me about the results, policy effects, or economic implications of your current scenario.'
        : 'Hello! I\'m your AI policy advisor. Run a simulation first, then ask me about tax effects, trade implications, subsidy impacts, or price controls and I\'ll provide economic analysis.',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [quickQuestions, setQuickQuestions] = useState(() => 
    simulationResult ? generateQuickQuestions(simulationResult) : []
  );
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Regenerate questions when simulation changes
    if (simulationResult) {
      setQuickQuestions(generateQuickQuestions(simulationResult));
    }
  }, [simulationResult?.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Build conversation history for API
    const apiMessages: Message[] = messages
      .filter(m => m.id !== '1') // Exclude initial greeting
      .map(m => ({ role: m.role, content: m.content }));
    apiMessages.push({ role: 'user', content: userMessage.content });

    let assistantContent = "";

    const upsertAssistant = (nextChunk: string) => {
      assistantContent += nextChunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant" && last.id !== "1") {
          return prev.map((m, i) =>
            i === prev.length - 1 ? { ...m, content: assistantContent } : m
          );
        }
        return [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant" as const,
            content: assistantContent,
            timestamp: new Date(),
          },
        ];
      });
    };

    try {
      await streamChat({
        messages: apiMessages,
        simulationData: simulationResult,
        onDelta: upsertAssistant,
        onDone: () => setIsLoading(false),
        onError: (error) => {
          toast({
            title: "Error",
            description: error,
            variant: "destructive",
          });
          setIsLoading(false);
        },
      });
    } catch (error) {
      console.error("Chat error:", error);
      toast({
        title: "Connection Error",
        description: "Failed to connect to the AI service. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <aside className="w-96 border-l border-border bg-card flex flex-col">
      <div className="h-14 px-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="h-4 w-4 text-primary" />
          <span className="font-semibold text-sm">AI Policy Advisor</span>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`flex-shrink-0 h-7 w-7 flex items-center justify-center ${
                message.role === 'assistant' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
              }`}>
                {message.role === 'assistant' ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
              </div>
              <div className={`flex-1 ${message.role === 'user' ? 'text-right' : ''}`}>
                <div className={`inline-block p-3 text-sm whitespace-pre-wrap ${
                  message.role === 'assistant' 
                    ? 'bg-muted/50 text-foreground' 
                    : 'bg-primary text-primary-foreground'
                }`}>
                  {renderMarkdownContent(message.content)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
            <div className="flex gap-3">
              <div className="flex-shrink-0 h-7 w-7 flex items-center justify-center bg-primary text-primary-foreground">
                <Bot className="h-4 w-4" />
              </div>
              <div className="bg-muted/50 p-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-border space-y-3">
        {simulationResult && input.trim() === '' && quickQuestions.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground font-medium">Quick questions:</p>
            <div className="grid grid-cols-2 gap-2">
              {quickQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => setInput(question.prompt)}
                  className="text-xs bg-muted hover:bg-muted/80 text-muted-foreground px-2 py-1.5 rounded transition-colors text-left line-clamp-2"
                  title={question.prompt}
                >
                  {question.label}
                </button>
              ))}
            </div>
          </div>
        )}
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask about policies..."
            className="flex-1 h-9 text-sm"
            disabled={isLoading}
          />
          <Button type="submit" size="icon" className="h-9 w-9" disabled={isLoading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </aside>
  );
}
