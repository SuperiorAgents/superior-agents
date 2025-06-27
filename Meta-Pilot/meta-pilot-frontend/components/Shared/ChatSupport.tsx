"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
    ArrowUp,
    ChevronUp,
    FileText,
    MessageSquare,
    Minimize2,
    Paperclip,
    Send,
    X,
    Bot,
    Sparkles,
    ChevronRight
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';

interface ChatMessage {
    id: string;
    sender: 'user' | 'bot';
    content: string;
    timestamp: Date;
    status?: 'sending' | 'sent' | 'delivered' | 'read' | 'error';
    attachments?: { type: string; url: string; name: string }[];
}

interface SuggestedQuestion {
    id: string;
    question: string;
}

// Animated button variants
const pulseVariants: Variants = {
    pulse: {
        scale: [1, 1.05, 1],
        boxShadow: [
            '0 0 0 0 rgba(99, 102, 241, 0.4)',
            '0 0 0 10px rgba(99, 102, 241, 0)',
        ],
        transition: {
            duration: 2,
            repeat: Infinity,
            repeatType: 'loop',
        },
    },
};

const floatVariants: Variants = {
    float: {
        y: [0, -10, 0],
        transition: {
            duration: 4,
            repeat: Infinity,
            repeatType: 'reverse',
        },
    },
};

const spinVariants = {
    spin: {
        rotate: [0, 360],
        transition: {
            duration: 20,
            repeat: Infinity,
            ease: "linear",
        },
    },
};

// Chat panel animation variants
const chatPanelVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 20 },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
            type: "spring",
            stiffness: 300,
            damping: 20,
            duration: 0.5
        }
    },
    exit: {
        opacity: 0,
        scale: 0.8,
        y: 20,
        transition: { duration: 0.3 }
    }
};

const messageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring",
            stiffness: 500,
            damping: 30,
            duration: 0.5
        }
    }
};

// Shimmer effect for button
const shimmerVariants = {
    initial: {
        backgroundPosition: '-500px 0',
    },
    animate: {
        backgroundPosition: ['2000px 0', '-500px 0'],
        transition: {
            repeat: Infinity,
            duration: 10,
            ease: "linear",
        },
    },
};

const ChatSupport: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: '1',
            sender: 'bot',
            content: "👋 Hi there! I'm MetaPilot's AI support assistant. How can I help you today with your Web3 automation needs?",
            timestamp: new Date(Date.now() - 1000 * 60 * 2), // 2 minutes ago
            status: 'read'
        }
    ]);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();

    // Animation states
    const [hasNewMessage, setHasNewMessage] = useState<boolean>(true);
    const [showAttentionAnimation, setShowAttentionAnimation] = useState<boolean>(true);

    useEffect(() => {
        // Start periodic attention-grabbing animations if chat isn't open
        if (!isOpen && !isMinimized) {
            const interval = setInterval(() => {
                setShowAttentionAnimation(true);
                setTimeout(() => setShowAttentionAnimation(false), 3000);
            }, 15000); // Trigger animation every 15 seconds

            return () => clearInterval(interval);
        }
    }, [isOpen, isMinimized]);

    // Every few minutes, add a "new message" indicator to draw attention
    useEffect(() => {
        if (!isOpen && !isMinimized) {
            const interval = setInterval(() => {
                setHasNewMessage(true);
            }, 180000); // Every 3 minutes

            return () => clearInterval(interval);
        }
    }, [isOpen, isMinimized]);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isTyping]);

    const handleSendMessage = () => {
        if (!message.trim()) return;

        // Add user message
        const userMessage: ChatMessage = {
            id: `user-${Date.now()}`,
            sender: 'user',
            content: message,
            timestamp: new Date(),
            status: 'sending'
        };

        setMessages(prev => [...prev, userMessage]);
        setMessage('');

        // Simulate "typing" indicator
        setIsTyping(true);

        // Simulate response after delay
        setTimeout(() => {
            setIsTyping(false);

            let responseContent = '';

            // Generate appropriate responses based on keywords
            const lowerMessage = message.toLowerCase();
            if (lowerMessage.includes('task') && (lowerMessage.includes('create') || lowerMessage.includes('new') || lowerMessage.includes('setup'))) {
                responseContent = "To create a new task, click the 'New Task' button on your dashboard. You'll be guided through selecting a task type (like DAO voting or token swaps), configuring specific parameters, and setting automation rules. Would you like me to walk you through a specific task type?";
            }
            else if (lowerMessage.includes('blockchain') || lowerMessage.includes('chain') || lowerMessage.includes('network')) {
                responseContent = "MetaPilot currently supports Ethereum, Polygon, Arbitrum, Optimism, and Base. We're actively working on adding support for Solana, Avalanche, and more Layer 2 networks. Is there a specific blockchain you're interested in using?";
            }
            else if (lowerMessage.includes('wallet') || lowerMessage.includes('connect') || lowerMessage.includes('delegation')) {
                responseContent = "MetaPilot connects to your wallet using secure ERC-7715 session keys with limited permissions. Your private keys are never exposed. You can set spending limits, approval thresholds, and revoke access any time. Would you like me to explain more about how our security measures work?";
            }
            else if (lowerMessage.includes('plan') || lowerMessage.includes('pricing') || lowerMessage.includes('subscription') || lowerMessage.includes('pro')) {
                responseContent = "The Free plan includes up to 5 active tasks with basic automation. The Pro plan ($29/month) unlocks unlimited tasks, priority execution, advanced analytics, custom API access, and premium support. Would you like to see a detailed comparison or learn about our annual discount?";
            }
            else {
                responseContent = "Thanks for your question. I'd be happy to help with that. Can you provide a bit more detail so I can give you the most accurate information about MetaPilot's automation capabilities?";
            }

            // Add bot response
            const botMessage: ChatMessage = {
                id: `bot-${Date.now()}`,
                sender: 'bot',
                content: responseContent,
                timestamp: new Date(),
                status: 'sent'
            };

            setMessages(prev => [...prev, botMessage]);

            // Update status of user message
            setMessages(prev =>
                prev.map(msg =>
                    msg.id === userMessage.id ? { ...msg, status: 'read' } : msg
                )
            );
        }, 1500);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleSuggestedQuestion = (question: string) => {
        setMessage(question);
        // Optional: can auto-send or let user edit first
        // handleSendMessage();
    };

    const toggleChat = () => {
        if (isMinimized) {
            setIsMinimized(false);
        } else {
            setIsOpen(!isOpen);
        }

        // Reset attention grabbers when opening chat
        setHasNewMessage(false);
        setShowAttentionAnimation(false);
    };

    const handleMinimize = () => {
        setIsMinimized(true);
    };

    const suggestedQuestions: SuggestedQuestion[] = [
        { id: 'q1', question: "How do I create my first automated task?" },
        { id: 'q2', question: "What blockchains do you support?" },
        { id: 'q3', question: "How does wallet delegation work?" },
        { id: 'q4', question: "What's the difference between Free and Pro plans?" }
    ];

    return (
        <>
            {/* Floating chat button */}
            {!isOpen && !isMinimized && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{
                        opacity: 1,
                        scale: 1,
                    }}
                    transition={{ duration: 0.5 }}
                    className="fixed bottom-6 right-6 z-50"
                >
                    <motion.div
                        variants={pulseVariants}
                        animate={showAttentionAnimation ? "pulse" : ""}
                    >
                        <motion.div
                            variants={floatVariants}
                            animate="float"
                            className="relative"
                        >
                            <motion.div
                                className="absolute -top-2 -right-2 z-10"
                                initial={{ scale: 0 }}
                                animate={{
                                    scale: hasNewMessage ? [0, 1.2, 1] : 0,
                                    rotate: hasNewMessage ? [0, 10, -10, 0] : 0
                                }}
                                transition={{ duration: 0.5 }}
                            >
                                <Badge className="bg-red-500 text-white">
                                    New
                                </Badge>
                            </motion.div>

                            <Button
                                onClick={toggleChat}
                                size="lg"
                                className="h-14 w-14 rounded-full shadow-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white relative overflow-hidden"
                            >
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                                    variants={shimmerVariants}
                                    initial="initial"
                                    animate="animate"
                                />

                                <motion.div
                                    animate={{ rotate: showAttentionAnimation ? [0, 15, -15, 0] : 0 }}
                                    transition={{ repeat: showAttentionAnimation ? 2 : 0, duration: 0.3 }}
                                >
                                    <MessageSquare className="h-6 w-6" />
                                </motion.div>
                            </Button>
                        </motion.div>
                    </motion.div>

                    {/* Animated Sparkles around the button */}
                    {showAttentionAnimation && (
                        <>
                            <motion.div
                                className="absolute top-0 right-0 text-yellow-300"
                                initial={{ opacity: 0, scale: 0, x: 10, y: -10 }}
                                animate={{ opacity: [0, 1, 0], scale: [0, 1, 0], x: [10, 15, 20], y: [-10, -15, -20] }}
                                transition={{ duration: 2 }}
                            >
                                <Sparkles className="h-5 w-5" />
                            </motion.div>
                            <motion.div
                                className="absolute bottom-1 left-0 text-blue-300"
                                initial={{ opacity: 0, scale: 0, x: -10, y: 5 }}
                                animate={{ opacity: [0, 1, 0], scale: [0, 1, 0], x: [-10, -15, -20], y: [5, 10, 15] }}
                                transition={{ duration: 2, delay: 0.3 }}
                            >
                                <Sparkles className="h-4 w-4" />
                            </motion.div>
                            <motion.div
                                className="absolute top-1/2 right-full text-indigo-300 mr-2"
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
                                transition={{ duration: 1.5, delay: 0.6 }}
                            >
                                <Sparkles className="h-6 w-6" />
                            </motion.div>
                        </>
                    )}

                    {/* New message teaser */}
                    {hasNewMessage && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="absolute right-full mr-3 bottom-0 whitespace-nowrap"
                        >
                            <div className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-full shadow-lg py-2 px-4 text-sm font-medium flex items-center gap-2">
                                <span>Need help with MetaPilot?</span>
                                <motion.div
                                    animate={{ x: [0, 5, 0] }}
                                    transition={{ repeat: Infinity, duration: 1.5 }}
                                >
                                    <ChevronRight className="h-4 w-4 text-blue-600" />
                                </motion.div>
                            </div>
                            <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 rotate-45 h-4 w-4 bg-white dark:bg-slate-800"></div>
                        </motion.div>
                    )}
                </motion.div>
            )}

            {/* Minimized chat indicator */}
            {isMinimized && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{
                        opacity: 1,
                        y: 0,
                        transition: {
                            type: "spring",
                            stiffness: 500,
                            damping: 30
                        }
                    }}
                    exit={{ opacity: 0, y: 20 }}
                    className="fixed bottom-6 right-6 z-50"
                >
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsMinimized(false)}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-full shadow-lg cursor-pointer flex items-center gap-2"
                    >
                        <MessageSquare className="h-5 w-5" />
                        <span>Chat with MetaPilot</span>
                        <motion.div
                            animate={{ y: [0, -3, 0] }}
                            transition={{ repeat: Infinity, duration: 1.2 }}
                        >
                            <ChevronUp className="h-4 w-4" />
                        </motion.div>
                    </motion.div>
                </motion.div>
            )}

            {/* Chat panel */}
            <AnimatePresence>
                {isOpen && !isMinimized && (
                    <motion.div
                        key="chat-panel"
                        variants={chatPanelVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="fixed bottom-6 right-6 z-50 w-full sm:w-96 h-[600px] max-h-[80vh] shadow-xl rounded-2xl overflow-hidden"
                    >
                        <Card className="flex flex-col h-full dark:bg-slate-900 border-indigo-100 dark:border-indigo-900/30 shadow-lg">
                            {/* Chat header */}
                            <CardHeader className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <motion.div
                                            whileHover={{ scale: 1.1, rotate: 5 }}
                                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                        >
                                            <Avatar className="h-10 w-10 border-2 border-white/20">
                                                <AvatarImage src="/images/ai-assistant.png" />
                                                <AvatarFallback className="bg-blue-700 text-white">
                                                    <Bot className="h-5 w-5" />
                                                </AvatarFallback>
                                            </Avatar>
                                        </motion.div>
                                        <div>
                                            <CardTitle className="text-base font-medium">MetaPilot Support</CardTitle>
                                            <div className="flex items-center gap-2 mt-1">
                                                <motion.div
                                                    animate={{ opacity: [0.5, 1, 0.5] }}
                                                    transition={{ repeat: Infinity, duration: 2 }}
                                                >
                                                    <Badge className="bg-green-500 h-2 w-2 rounded-full p-0" />
                                                </motion.div>
                                                <span className="text-xs text-white/80">Online • Typically replies instantly</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-white/90 hover:text-white hover:bg-white/10"
                                                        onClick={handleMinimize}
                                                    >
                                                        <Minimize2 className="h-5 w-5" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Minimize</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>

                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-white/90 hover:text-white hover:bg-white/10"
                                                        onClick={toggleChat}
                                                    >
                                                        <X className="h-5 w-5" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Close</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                </div>
                            </CardHeader>

                            {/* Chat messages area */}
                            <CardContent className="flex-grow overflow-y-auto p-4 space-y-4">
                                {messages.map((msg) => (
                                    <motion.div
                                        key={msg.id}
                                        variants={messageVariants}
                                        initial="hidden"
                                        animate="visible"
                                        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-[85%] ${msg.sender === 'user'
                                                ? 'bg-blue-600 text-white rounded-tl-lg rounded-tr-sm rounded-bl-lg rounded-br-lg'
                                                : 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-sm rounded-tr-lg rounded-bl-lg rounded-br-lg'
                                                } p-3 shadow-sm`}
                                        >
                                            {msg.content}
                                            {msg.attachments && msg.attachments.length > 0 && (
                                                <div className="mt-2 space-y-2">
                                                    {msg.attachments.map((attachment, idx) => (
                                                        <div
                                                            key={idx}
                                                            className="flex items-center gap-2 p-2 bg-white/10 dark:bg-black/10 rounded-md text-sm"
                                                        >
                                                            <FileText className="h-4 w-4" />
                                                            <span className="truncate">{attachment.name}</span>
                                                            <Button variant="ghost" size="icon" className="h-6 w-6 ml-auto">
                                                                <ArrowUp className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            <div className={`flex items-center gap-1 mt-1 text-xs ${msg.sender === 'user' ? 'text-white/70 justify-end' : 'text-slate-500 dark:text-slate-400'
                                                }`}>
                                                {new Intl.DateTimeFormat('en-US', {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                    hour12: true
                                                }).format(msg.timestamp)}
                                                {msg.sender === 'user' && (
                                                    <span className="ml-1">
                                                        {msg.status === 'sending' && '⋯'}
                                                        {msg.status === 'sent' && '✓'}
                                                        {msg.status === 'delivered' && '✓✓'}
                                                        {msg.status === 'read' && '✓✓'}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}

                                {/* Typing indicator */}
                                {isTyping && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex justify-start"
                                    >
                                        <div className="bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-4 py-2 rounded-tl-sm rounded-tr-lg rounded-bl-lg rounded-br-lg shadow-sm">
                                            <div className="flex gap-1">
                                                <motion.span
                                                    animate={{ y: [0, -5, 0] }}
                                                    transition={{ repeat: Infinity, duration: 0.8, delay: 0 }}
                                                >•</motion.span>
                                                <motion.span
                                                    animate={{ y: [0, -5, 0] }}
                                                    transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }}
                                                >•</motion.span>
                                                <motion.span
                                                    animate={{ y: [0, -5, 0] }}
                                                    transition={{ repeat: Infinity, duration: 0.8, delay: 0.4 }}
                                                >•</motion.span>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Anchor for auto-scrolling */}
                                <div ref={messagesEndRef} />
                            </CardContent>

                            {/* Suggested questions (only show if there are few messages) */}
                            {messages.length < 3 && (
                                <div className="px-4 pb-2">
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                                        Suggested questions:
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {suggestedQuestions.map((q, index) => (
                                            <motion.div
                                                key={q.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.1 + 0.5 }}
                                            >
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-xs px-2 py-1 h-auto whitespace-normal text-left justify-start dark:bg-slate-800/60"
                                                    onClick={() => handleSuggestedQuestion(q.question)}
                                                >
                                                    {q.question}
                                                </Button>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Chat input area */}
                            <CardFooter className="p-4 border-t border-slate-200 dark:border-slate-800">
                                <div className="flex flex-col w-full gap-2">
                                    <div className="relative">
                                        <Textarea
                                            placeholder="Type your message..."
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            onKeyDown={handleKeyDown}
                                            className="pr-24 resize-none min-h-[60px] max-h-24 dark:bg-slate-800/60"
                                        />
                                        <div className="absolute bottom-2 right-2 flex items-center gap-1">
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                                        >
                                                            <Paperclip className="h-4 w-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Attach file</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>

                                            <motion.div
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                            >
                                                <Button
                                                    size="sm"
                                                    className={`gap-1 w-9 h-9 rounded-full ${message.trim().length === 0
                                                        ? 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                                                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white'
                                                        }`}
                                                    disabled={message.trim().length === 0}
                                                    onClick={handleSendMessage}
                                                >
                                                    <Send className="h-4 w-4" />
                                                </Button>
                                            </motion.div>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center mt-1">
                                        <div className="text-xs text-slate-500 dark:text-slate-400">
                                            Powered by MetaPilot AI
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 px-2 text-xs text-slate-500 dark:text-slate-400"
                                                onClick={() => {
                                                    toast({
                                                        title: "Live agent requested",
                                                        description: "We'll connect you with a human agent shortly.",
                                                    });
                                                }}
                                            >
                                                Request live agent
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardFooter>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default ChatSupport;