import { Activity, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  onChatToggle: () => void;
  isChatOpen: boolean;
}

export function Header({ onChatToggle, isChatOpen }: HeaderProps) {
  return (
    <header className="h-14 border-b border-border bg-card px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Activity className="h-5 w-5 text-primary" />
        <h1 className="font-semibold text-lg tracking-tight">EconSim</h1>
        <span className="text-xs text-muted-foreground font-medium px-2 py-0.5 bg-muted/50 border border-border">
          Policy Simulator
        </span>
      </div>
      
      <div className="flex items-center gap-2">
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
