import React, { useState, useRef, useEffect } from "react";
import { postData } from "../../services/api";
import { AIResponseRenderer } from "../../components/AIResponseRenderer";
import { useToastStore } from "../../store/useToastStore";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import { Bot, Send, Sparkles } from "lucide-react";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
}

export const AIChat: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { addToast } = useToastStore();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: input,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            const response = await postData({
                path: "/ai/business-chat",
                data: { message: input },
            });

            if (response.success) {
                const aiMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    role: "assistant",
                    content: response.data.response,
                    timestamp: new Date(),
                };
                setMessages((prev) => [...prev, aiMessage]);
            } else {
                addToast("Failed to get AI response", "error");
            }
        } catch (error: any) {
            console.error("AI Chat error:", error);
            addToast(error?.response?.data?.message || "Failed to send message", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-2">
            {/* Header Card */}
            {/* <Card className="border-accent/20"></Card> */}

            {/* Messages Container */}
            <Card className="max-h-[75vh] flex flex-col overflow-scroll">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-accent to-sky-600 rounded-xl flex items-center justify-center shadow-lg">
                        <Bot className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-slate-900">Assistant IA</h1>
                        <p className="text-sm text-slate-600">Posez vos questions sur vos projets, factures et analyses commerciales</p>
                    </div>
                    <div className="flex items-center gap-2 text-accent">
                        <Sparkles className="w-5 h-5" />
                        <span className="text-sm font-medium">Propulsé par l'IA</span>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto space-y-4 p-2">
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center px-4">
                            <div className="w-24 h-24 bg-gradient-to-br from-accent/10 to-sky-100 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                                <Bot className="w-12 h-12 text-accent" />
                            </div>
                            <h3 className="text-xl font-semibold text-slate-900 mb-3">Bienvenue dans l'Assistant IA</h3>
                            <p className="text-slate-600 max-w-lg mb-8">
                                Posez des questions sur vos projets, factures, et analyses commerciales. L'IA vous aidera à obtenir des insights
                                rapidement.
                            </p>
                        </div>
                    ) : (
                        <>
                            {messages.map((message) => (
                                <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                                    <div
                                        className={`max-w-[85%] min-w-0 rounded-xl px-5 py-3 shadow-sm ${
                                            message.role === "user" ? "bg-accent text-white" : "bg-slate-50 border border-slate-200"
                                        }`}
                                    >
                                        {message.role === "user" ? (
                                            <p className="text-sm whitespace-pre-wrap leading-relaxed break-words overflow-wrap-anywhere">
                                                {message.content}
                                            </p>
                                        ) : (
                                            <div className="max-w-full overflow-x-auto">
                                                <AIResponseRenderer response={message.content} />
                                            </div>
                                        )}
                                        <p className={`text-xs mt-2 ${message.role === "user" ? "text-sky-100" : "text-slate-400"}`}>
                                            {message.timestamp.toLocaleTimeString("fr-FR", {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="max-w-[85%] bg-slate-50 border border-slate-200 rounded-xl px-5 py-3 shadow-sm">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-accent rounded-full animate-bounce"></div>
                                            <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                                            <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </>
                    )}
                </div>
            </Card>

            {/* Input Area Card */}
            <Card>
                <div className="flex items-center gap-3 justify-center">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder="Posez votre question..."
                        rows={1}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent resize-none text-sm text-slate-900 placeholder:text-slate-400 bg-white transition-all"
                        disabled={isLoading}
                        style={{ minHeight: "48px", maxHeight: "120px" }}
                        onInput={(e) => {
                            const target = e.target as HTMLTextAreaElement;
                            target.style.height = "auto";
                            target.style.height = Math.min(target.scrollHeight, 120) + "px";
                        }}
                    />

                    <Button
                        onClick={handleSendMessage}
                        disabled={!input.trim() || isLoading}
                        loading={isLoading}
                        variant="primary"
                        size="lg"
                        className="gap-2"
                    >
                        {!isLoading && <Send className="w-5 h-5" />}
                        <span>Envoyer</span>
                    </Button>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                    Appuyez sur <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded text-xs">Entrée</kbd> pour envoyer,{" "}
                    <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded text-xs">Shift+Entrée</kbd> pour une nouvelle ligne
                </p>
            </Card>
        </div>
    );
};
