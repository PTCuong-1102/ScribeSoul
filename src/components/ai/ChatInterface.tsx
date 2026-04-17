import React, { useState } from "react"
import { useChat } from "@ai-sdk/react"
import { UIMessage, DefaultChatTransport } from "ai"
import { Sparkles, Send, BookOpen } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

export function ChatInterface({ workspaceId, conversationId }: { workspaceId: string, conversationId?: string }) {
  const [input, setInput] = useState("")
  const { messages, sendMessage, status } = useChat<UIMessage>({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: { workspaceId, conversationId },
    }),
  })

  const isLoading = status !== "ready" && status !== "error"

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    
    sendMessage({ text: input })
    setInput("")
  }

  return (
    <div className="flex flex-col h-full bg-surface dark:bg-surface border-l border-border/5">
      {/* Header */}
      <div className="p-4 border-b border-border/5 flex items-center space-x-3">
        <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center text-secondary violet-glow">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <h3 className="font-serif text-sm font-medium text-on-surface">Soul Assistant</h3>
          <p className="font-sans text-[10px] text-on-surface-variant uppercase tracking-widest">Deep Space Context</p>
        </div>
      </div>

      {/* Messages area */}
      <ScrollArea className="flex-1 p-6">
        <div className="space-y-8">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full pt-20 text-center space-y-4">
              <BookOpen className="w-12 h-12 text-on-surface-variant/10" />
              <p className="font-serif italic text-on-surface-variant text-sm max-w-[200px]">
                &quot;Hãy hỏi tôi về bất cứ điều gì trong thế giới bạn đang viết.&quot;
              </p>
            </div>
          )}
          
          {messages.map((m) => (
            <div key={m.id} className={cn(
              "flex flex-col",
              m.role === 'user' ? "items-end" : "items-start"
            )}>
              <div className="flex items-center space-x-2 mb-2">
                <span className="font-sans text-[10px] uppercase tracking-widest text-on-surface-variant/40">
                  {m.role === 'user' ? 'Tác giả' : 'Trợ lý'}
                </span>
              </div>
              
              <div className={cn(
                "max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed",
                m.role === 'user' 
                  ? "bg-surface-container-low text-on-surface font-sans" 
                  : "bg-surface-container-lowest dark:bg-surface-container-low text-on-surface font-serif italic ai-generated shadow-sm"
              )}>
                {m.parts.map((part, i) => {
                  if (part.type === 'text') {
                    return <div key={i}>{part.text}</div>
                  }
                  return null
                })}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex flex-col items-start translate-y-2">
              <div className="flex items-center space-x-1">
                <div className="w-1.5 h-1.5 bg-secondary rounded-full animate-bounce [animation-delay:-0.3s]" />
                <div className="w-1.5 h-1.5 bg-secondary rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="w-1.5 h-1.5 bg-secondary rounded-full animate-bounce" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input area */}
      <div className="p-4 bg-surface-container-low/50">
        <form onSubmit={handleSubmit} className="relative group">
          <textarea
            value={input}
            onChange={handleInputChange}
            placeholder="Kể cho tôi nghe về..."
            rows={1}
            className="w-full bg-surface-container-lowest dark:bg-surface-container rounded-2xl p-4 pr-12 text-sm font-sans border border-border/10 focus:ring-1 focus:ring-secondary transition-all resize-none overflow-hidden"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e as unknown as React.FormEvent);
              }
            }}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl bg-secondary text-secondary-foreground flex items-center justify-center shadow-lg shadow-secondary/20 hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <p className="mt-3 text-[10px] text-center text-on-surface-variant/40 font-sans uppercase tracking-tighter">
          Shift + Enter để xuống dòng • Cmd + J để thu phóng
        </p>
      </div>
    </div>
  )
}
