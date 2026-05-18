"use client"

import React, { useState, useEffect, useRef } from "react"
import { useChat } from "@ai-sdk/react"
import { UIMessage, DefaultChatTransport } from "ai"
import { Sparkles, Send, BookOpen, History, Plus, Trash2, Loader2, MessageSquare, ArrowLeft } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { 
  getConversations, 
  createConversation, 
  deleteConversation, 
  getConversationMessages 
} from "@/server/actions/chat"
import { toast } from "sonner"

export function ChatInterface({ workspaceId }: { workspaceId: string }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [conversations, setConversations] = useState<any[]>([])
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const [initialMessages, setInitialMessages] = useState<UIMessage[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [isCreatingConv, setIsCreatingConv] = useState(false)

  // 1. Select conversation and load messages
  const handleSelectConversation = async (id: string) => {
    setActiveConversationId(id)
    setShowHistory(false)
    setIsLoadingHistory(true)
    try {
      const dbMessages = await getConversationMessages(id)
      
      // Map to UIMessage with proper parts parsing
      const uiMsgs: UIMessage[] = dbMessages.map((m) => ({
        id: m.id,
        role: m.role as "user" | "assistant" | "system",
        content: m.content,
        parts: [{ type: "text", text: m.content }],
      }))
      
      setInitialMessages(uiMsgs)
    } catch (error) {
      console.error("Failed to load messages:", error)
      toast.error("Không thể tải lịch sử tin nhắn.")
    } finally {
      setIsLoadingHistory(false)
    }
  }

  // 2. Create new conversation
  const handleNewConversation = async () => {
    if (isCreatingConv) return
    setIsCreatingConv(true)
    try {
      const newConv = await createConversation(workspaceId, `Trò chuyện #${conversations.length + 1}`)
      setConversations((prev) => [newConv, ...prev])
      setActiveConversationId(newConv.id)
      setInitialMessages([])
      setShowHistory(false)
      toast.success("Bắt đầu cuộc trò chuyện mới!")
    } catch (error) {
      console.error("Failed to create conversation:", error)
      toast.error("Không thể tạo cuộc trò chuyện mới.")
    } finally {
      setIsCreatingConv(false)
    }
  }

  // 3. Fetch conversations on mount
  useEffect(() => {
    async function loadConversations() {
      try {
        const list = await getConversations(workspaceId)
        setConversations(list)
        if (list.length > 0) {
          // Select most recent conversation
          handleSelectConversation(list[0].id)
        } else {
          // If no conversations, auto-create one
          await handleNewConversation()
        }
      } catch (error) {
        console.error("Failed to load conversations:", error)
      }
    }
    loadConversations()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId])

  // 4. Delete conversation
  const handleDeleteConversation = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (!confirm("Bạn có chắc chắn muốn xóa cuộc hội thoại này?")) return
    try {
      await deleteConversation(id)
      setConversations((prev) => prev.filter((c) => c.id !== id))
      toast.success("Đã xóa cuộc hội thoại.")
      
      if (activeConversationId === id) {
        const remaining = conversations.filter((c) => c.id !== id)
        if (remaining.length > 0) {
          handleSelectConversation(remaining[0].id)
        } else {
          setActiveConversationId(null)
          setInitialMessages([])
          await handleNewConversation()
        }
      }
    } catch (error) {
      console.error("Failed to delete conversation:", error)
      toast.error("Không thể xóa cuộc hội thoại.")
    }
  }

  return (
    <div className="flex flex-col h-full bg-surface dark:bg-surface border-l border-border/5 relative overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border/5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {showHistory ? (
            <button 
              onClick={() => setShowHistory(false)}
              className="p-1 rounded-lg hover:bg-surface-container-high text-on-surface-variant transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          ) : (
            <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center text-secondary violet-glow animate-pulse">
              <Sparkles className="w-4 h-4" />
            </div>
          )}
          <div>
            <h3 className="font-serif text-sm font-medium text-on-surface">
              {showHistory ? "Lịch sử hội thoại" : "Soul Assistant"}
            </h3>
            <p className="font-sans text-[10px] text-on-surface-variant uppercase tracking-widest">
              {showHistory ? "Chọn cuộc trò chuyện" : "Deep Space Context"}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={() => setShowHistory(!showHistory)}
            title="Lịch sử chat"
            className={cn(
              "p-2 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-all duration-300",
              showHistory && "bg-surface-container-high text-primary"
            )}
          >
            <History className="w-4 h-4" />
          </button>
          <button
            onClick={handleNewConversation}
            disabled={isCreatingConv}
            title="Hội thoại mới"
            className="p-2 rounded-xl text-on-surface-variant hover:text-secondary hover:bg-secondary/5 transition-all duration-300 disabled:opacity-50"
          >
            {isCreatingConv ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 relative overflow-hidden">
        {/* Drawer style Conversations List */}
        <div className={cn(
          "absolute inset-0 bg-surface z-20 flex flex-col transition-all duration-500 transform",
          showHistory ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 pointer-events-none"
        )}>
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-2">
              {conversations.length === 0 ? (
                <div className="p-8 text-center text-on-surface-variant font-sans text-xs italic">
                  Không có cuộc hội thoại nào
                </div>
              ) : (
                conversations.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv.id)}
                    className={cn(
                      "w-full flex items-center justify-between p-4 rounded-2xl cursor-pointer border border-transparent transition-all duration-300 hover:scale-[1.01]",
                      activeConversationId === conv.id 
                        ? "bg-surface-container-high border-border/10 shadow-sm" 
                        : "bg-surface-container-low/40 hover:bg-surface-container-low"
                    )}
                  >
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <MessageSquare className="w-4 h-4 text-secondary/60 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-sans text-sm font-medium text-on-surface truncate">
                          {conv.title}
                        </p>
                        <p className="font-sans text-[10px] text-on-surface-variant/40">
                          {new Date(conv.updatedAt).toLocaleDateString()} {new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleDeleteConversation(e, conv.id)}
                      className="p-1.5 rounded-lg text-on-surface-variant/40 hover:text-destructive hover:bg-destructive/5 transition-all opacity-0 group-hover:opacity-100 md:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
          <div className="p-4 border-t border-border/5">
            <button
              onClick={handleNewConversation}
              className="w-full h-11 flex items-center justify-center space-x-2 rounded-xl bg-secondary text-secondary-foreground shadow-lg shadow-secondary/10 hover:scale-[1.02] transition-all font-sans text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo cuộc hội thoại mới</span>
            </button>
          </div>
        </div>

        {/* Chat Box */}
        {isLoadingHistory ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3 bg-surface z-10">
            <Loader2 className="w-6 h-6 text-secondary animate-spin" />
            <p className="text-xs text-on-surface-variant font-sans uppercase tracking-widest">Đang tải lịch sử hội thoại...</p>
          </div>
        ) : activeConversationId ? (
          <ChatBox 
            key={activeConversationId}
            workspaceId={workspaceId} 
            conversationId={activeConversationId} 
            initialMessages={initialMessages}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 space-y-4">
            <BookOpen className="w-12 h-12 text-on-surface-variant/15" />
            <p className="font-serif italic text-on-surface-variant text-sm max-w-[200px]">
              Vui lòng tạo cuộc hội thoại mới để nhận sự trợ giúp từ Soul Assistant.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

interface ChatBoxProps {
  workspaceId: string
  conversationId: string
  initialMessages: UIMessage[]
}

function ChatBox({ workspaceId, conversationId, initialMessages }: ChatBoxProps) {
  const [input, setInput] = useState("")
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const { messages, sendMessage, status } = useChat<UIMessage>({
    messages: initialMessages,
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

  // Auto scroll to bottom on new messages
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages, isLoading])

  return (
    <div className="flex flex-col h-full bg-surface dark:bg-surface">
      {/* Messages area */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-6">
        <div className="space-y-8 pb-12">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full pt-20 text-center space-y-4">
              <BookOpen className="w-12 h-12 text-on-surface-variant/10 animate-pulse" />
              <p className="font-serif italic text-on-surface-variant text-sm max-w-[200px]">
                &quot;Hãy hỏi tôi về bất cứ điều gì trong thế giới bạn đang viết.&quot;
              </p>
            </div>
          )}
          
          {messages.map((m) => (
            <div key={m.id} className={cn(
              "flex flex-col",
              m.role === 'user' ? "items-end" : "items-start animate-in fade-in slide-in-from-bottom-2 duration-300"
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
                  : "bg-surface-container-lowest dark:bg-surface-container-low text-on-surface font-serif italic ai-generated shadow-sm border border-border/5"
              )}>
                {m.parts.map((part, i) => {
                  if (part.type === 'text') {
                    return <div key={i} className="whitespace-pre-wrap">{part.text}</div>
                  }
                  return null
                })}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex flex-col items-start translate-y-2">
              <div className="flex items-center space-x-1 bg-surface-container-low px-3 py-2.5 rounded-full shadow-sm">
                <div className="w-1.5 h-1.5 bg-secondary rounded-full animate-bounce [animation-delay:-0.3s]" />
                <div className="w-1.5 h-1.5 bg-secondary rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="w-1.5 h-1.5 bg-secondary rounded-full animate-bounce" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input area */}
      <div className="p-4 bg-surface-container-low/50 border-t border-border/5 backdrop-blur-md">
        <form onSubmit={handleSubmit} className="relative group">
          <textarea
            value={input}
            onChange={handleInputChange}
            placeholder="Kể cho tôi nghe về..."
            rows={1}
            className="w-full bg-surface-container-lowest dark:bg-surface-container rounded-2xl p-4 pr-12 text-sm font-sans border border-border/10 focus:ring-1 focus:ring-secondary transition-all resize-none overflow-hidden outline-none"
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
