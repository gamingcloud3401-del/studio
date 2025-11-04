
'use client';

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { darpanAssistant } from "@/ai/flows/darpan-flow";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Loader2, Send } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";

type Message = {
    sender: 'user' | 'ai';
    text: string;
};

export function DarpanAssistantChat() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage: Message = { sender: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const result = await darpanAssistant({ question: input });
            const aiMessage: Message = { sender: 'ai', text: result.answer };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error("AI Assistant Error:", error);
            toast({
                variant: "destructive",
                title: "Uh oh! Something went wrong.",
                description: "Darpan 2.0 is having a little trouble. Please try again in a moment.",
            });
            // Remove the user's message if the AI fails
            setMessages(prev => prev.slice(0, prev.length -1));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full">
            <DialogHeader className="p-4 border-b">
                <DialogTitle className="flex items-center gap-2 font-headline">
                    <Bot />
                    Darpan 2.0 AI Assistant
                </DialogTitle>
                <DialogDescription>
                    Have questions? Ask me for help with ordering, products, or anything else!
                </DialogDescription>
            </DialogHeader>
            <ScrollArea className="flex-1 p-4">
                 <div className="space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`rounded-lg px-4 py-2 max-w-sm ${msg.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="rounded-lg px-4 py-2 bg-muted flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Thinking...</span>
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>
            <form onSubmit={handleSend} className="flex gap-2 p-4 border-t">
                <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about our products..."
                    disabled={isLoading}
                />
                <Button type="submit" disabled={isLoading} size="icon">
                    <Send className="h-4 w-4" />
                </Button>
            </form>
        </div>
    );
}


export function DarpanAssistant() {

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button className="fixed bottom-6 right-6 h-14 w-auto px-5 rounded-full shadow-lg animate-bounce">
                    <Bot className="mr-2 h-6 w-6"/>
                    Chat with our AI
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md p-0 gap-0 h-[70vh] flex flex-col">
                <DarpanAssistantChat />
            </DialogContent>
        </Dialog>
    );
}
