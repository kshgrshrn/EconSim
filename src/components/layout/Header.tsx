import { Activity, MessageSquare, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

interface HeaderProps {
  onChatToggle: () => void;
  isChatOpen: boolean;
}

export function Header({ onChatToggle, isChatOpen }: HeaderProps) {
  const [isDark, setIsDark] = useState(() => {
    // Check localStorage or system preference
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const html = document.documentElement;
    if (isDark) {
      html.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      html.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  return (
    <header className="h-14 border-b border-border bg-card px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Activity className="h-5 w-5 text-primary" />
        <h1 className="font-semibold text-lg tracking-tight">EconSim</h1>
        <span className="text-xs text-muted-foreground font-medium px-2 py-0.5 bg-muted/50 border border-border">
          Policy Simulator
        </span>
        <span className="text-xs text-muted-foreground/70 font-light ml-2 border-l border-border/50 pl-3">
          Made by financiallyinept for FINHACK2025
        </span>
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsDark(!isDark)}
          className="h-9 w-9"
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        <Button
          variant={isChatOpen ? "secondary" : "outline"}
          size="sm"
          onClick={onChatToggle}
          className="gap-2"
        >
          <MessageSquare className="h-4 w-4" />
          AI Chat
        </Button>
      </div>
    </header>
  );
}
