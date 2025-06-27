// HelpSupportPage.tsx
"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
    AlertCircle,
    ArrowRight,
    Book,
    Code,
    FileText,
    HelpCircle,
    Info,
    Laptop,
    LifeBuoy,
    Link,
    Mail,
    MessageSquare,
    Search,
    Shield,
    ThumbsUp,
    Users,
    Wallet,
    Zap
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.3 },
    },
};

// FAQ data
const faqItems = [
    {
        question: "How does MetaPilot's AI automation work?",
        answer: "MetaPilot uses artificial intelligence to automate Web3 tasks like DAO voting, token swaps, yield optimization, and more. It works by connecting to your wallet via a secure session key that has limited permissions based on what you allow. The AI monitors on-chain and off-chain events, then executes actions according to your predefined rules."
    },
    {
        question: "Is it safe to connect my wallet to MetaPilot?",
        answer: "Yes. MetaPilot uses ERC-7715 session keys with limited scopes, meaning we only get the specific permissions you explicitly grant. Your private keys are never exposed or stored. You can set spending limits, require confirmations for high-value transactions, and revoke access at any time. All actions are transparent and logged in your dashboard."
    },
    {
        question: "What blockchains does MetaPilot support?",
        answer: "MetaPilot currently supports Ethereum, Polygon, Arbitrum, Optimism, and Base. We're actively working on adding support for Solana, Avalanche, and more Layer 2 networks. You can vote for which chains to prioritize in our community forum."
    },
    {
        question: "How do I create my first automated task?",
        answer: "Click the 'New Task' button on your dashboard. You'll be guided through a step-by-step process to select a task type (like DAO voting or token swaps), configure the specific parameters, and set your automation rules. Our natural language interface makes it easy to define complex conditions without coding knowledge."
    },
    {
        question: "What's the difference between Free and Pro plans?",
        answer: "The Free plan allows up to 5 active tasks with basic automation and standard execution speeds. The Pro plan unlocks unlimited tasks, priority execution, advanced analytics, custom API access, and premium support. Pro users also get early access to new features and higher transaction limits."
    },
    {
        question: "Can I customize the rules for DAO voting?",
        answer: "Absolutely! You can create specific voting rules using natural language. For example, 'Vote YES if the proposal mentions rewards and has community support' or 'Vote NO if the proposal increases treasury spending by more than 10%.' Our AI will analyze proposal text and follow your instructions."
    }
];

// Knowledge base articles
const knowledgeBaseArticles = [
    {
        id: "kb-1",
        title: "Getting Started with MetaPilot",
        category: "Basics",
        description: "Learn the fundamentals of setting up your account and creating your first automated task.",
        icon: <Laptop className="h-5 w-5" />,
        readTime: "5 min read",
        updated: "2 days ago"
    },
    {
        id: "kb-2",
        title: "Wallet Connection Security Guide",
        category: "Security",
        description: "Understand how session keys work and best practices for safely connecting your wallet.",
        icon: <Shield className="h-5 w-5" />,
        readTime: "7 min read",
        updated: "1 week ago"
    },
    {
        id: "kb-3",
        title: "Advanced DAO Voting Strategies",
        category: "Advanced",
        description: "Create sophisticated voting rules using natural language and conditional logic.",
        icon: <Users className="h-5 w-5" />,
        readTime: "10 min read",
        updated: "3 days ago"
    },
    {
        id: "kb-4",
        title: "Yield Optimization Configuration",
        category: "DeFi",
        description: "Maximize your stablecoin returns with automated yield strategies across protocols.",
        icon: <Zap className="h-5 w-5" />,
        readTime: "8 min read",
        updated: "5 days ago"
    },
    {
        id: "kb-5",
        title: "Gas Optimization Techniques",
        category: "Optimization",
        description: "Save on transaction fees with smart scheduling and bundling strategies.",
        icon: <Zap className="h-5 w-5" />,
        readTime: "6 min read",
        updated: "2 weeks ago"
    },
    {
        id: "kb-6",
        title: "API Integration Guide",
        category: "Developers",
        description: "Connect your applications to MetaPilot using our developer APIs and webhooks.",
        icon: <Code className="h-5 w-5" />,
        readTime: "15 min read",
        updated: "4 days ago"
    }
];

const HelpSupportPage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [ticketSubject, setTicketSubject] = useState('');
    const [ticketDescription, setTicketDescription] = useState('');
    const { toast } = useToast();

    const submitSupportTicket = () => {
        if (!ticketSubject || !ticketDescription) {
            toast({
                title: "Error",
                description: "Please fill out all fields before submitting.",
                variant: "destructive",
            });
            return;
        }

        toast({
            title: "Support ticket submitted",
            description: "We've received your ticket and will respond within 24 hours.",
            variant: "default",
        });

        // Reset form
        setTicketSubject('');
        setTicketDescription('');
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
        >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                        Help & Support
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
                        Find answers, troubleshooting guides, and contact support
                    </p>
                </div>
            </div>

            {/* Search bar */}
            <motion.div variants={itemVariants}>
                <div className="relative">
                    <div className="rounded-xl overflow-hidden dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg">
                        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 h-32 w-full flex items-center justify-center p-6">
                            <div className="w-full max-w-xl">
                                <h2 className="text-white text-xl font-semibold mb-4 text-center">
                                    How can we help you today?
                                </h2>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                                    <Input
                                        placeholder="Search for help articles, tutorials, FAQs..."
                                        className="pl-10 h-11 bg-white dark:bg-slate-800 border-0"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800/30">
                                    <CardContent className="p-4 flex items-start gap-3">
                                        <div className="bg-blue-100 dark:bg-blue-800/50 h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0">
                                            <Book className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-slate-900 dark:text-white mb-1">Knowledge Base</h3>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                                Browse our documentation and tutorials
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-indigo-50 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-800/30">
                                    <CardContent className="p-4 flex items-start gap-3">
                                        <div className="bg-indigo-100 dark:bg-indigo-800/50 h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0">
                                            <HelpCircle className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-slate-900 dark:text-white mb-1">FAQ</h3>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                                Find answers to common questions
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-800/30">
                                    <CardContent className="p-4 flex items-start gap-3">
                                        <div className="bg-purple-100 dark:bg-purple-800/50 h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0">
                                            <MessageSquare className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-slate-900 dark:text-white mb-1">Contact Support</h3>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                                Get help from our support team
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Main support tabs */}
            <motion.div variants={itemVariants}>
                <Tabs defaultValue="faq" className="w-full">
                    <TabsList className="w-full justify-start h-full flex flex-wrap gap-3  dark:bg-slate-900/90 bg-slate-50 border-indigo-100 dark:border-indigo-900/30 shadow-lg rounded-lg">
                        <TabsTrigger value="faq">Frequently Asked Questions</TabsTrigger>
                        <TabsTrigger value="knowledge">Knowledge Base</TabsTrigger>
                        <TabsTrigger value="contact">Contact Support</TabsTrigger>
                    </TabsList>

                    {/* FAQ Tab */}
                    <TabsContent value="faq" className="mt-6">
                        <Card className="dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <HelpCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    Frequently Asked Questions
                                </CardTitle>
                                <CardDescription>
                                    Find answers to the most common questions about MetaPilot
                                </CardDescription>
                            </CardHeader>

                            <CardContent>
                                <Accordion type="single" collapsible className="w-full">
                                    {faqItems.map((item, index) => (
                                        <AccordionItem key={index} value={`item-${index}`}>
                                            <AccordionTrigger className="text-left font-medium text-slate-900 dark:text-white">
                                                {item.question}
                                            </AccordionTrigger>
                                            <AccordionContent className="text-slate-600 dark:text-slate-400">
                                                {item.answer}
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>

                                <div className="mt-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 flex items-start gap-3">
                                    <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <h3 className="font-medium text-slate-900 dark:text-white mb-1">
                                            Didn't find what you're looking for?
                                        </h3>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">
                                            Check our comprehensive knowledge base or contact our support team for personalized assistance.
                                        </p>
                                        <div className="flex flex-wrap gap-3 mt-3">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="gap-2 dark:bg-slate-800/50"
                                                onClick={() => {
                                                    const element = document.querySelector('[data-value="knowledge"]');
                                                    if (element instanceof HTMLElement) {
                                                        element.click();
                                                    }
                                                }}
                                            >
                                                <Book className="h-4 w-4" />
                                                Browse Knowledge Base
                                            </Button>
                                            <Button
                                                size="sm"
                                                className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                                                onClick={() => {
                                                    const element = document.querySelector('[data-value="contact"]');
                                                    if (element instanceof HTMLElement) {
                                                        element.click();
                                                    }
                                                }}
                                            >
                                                <MessageSquare className="h-4 w-4" />
                                                Contact Support
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Knowledge Base Tab */}
                    <TabsContent value="knowledge" className="mt-6">
                        <Card className="dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Book className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    Knowledge Base
                                </CardTitle>
                                <CardDescription>
                                    Browse our documentation, guides, and tutorials
                                </CardDescription>
                            </CardHeader>

                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {knowledgeBaseArticles.map((article) => (
                                        <Card
                                            key={article.id}
                                            className="hover:shadow-md transition-shadow dark:border-slate-800 dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg"
                                        >
                                            <CardContent className="p-4">
                                                <div className="flex items-start gap-3">
                                                    <div className="bg-slate-100 dark:bg-slate-800 h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0">
                                                        {article.icon}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <Badge variant="secondary" className="text-xs">
                                                                {article.category}
                                                            </Badge>
                                                        </div>
                                                        <h3 className="font-medium text-slate-900 dark:text-white">
                                                            {article.title}
                                                        </h3>
                                                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                                            {article.description}
                                                        </p>
                                                        <div className="flex items-center gap-4 mt-3">
                                                            <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                                                <FileText className="h-3 w-3" />
                                                                {article.readTime}
                                                            </span>
                                                            <span className="text-xs text-slate-500 dark:text-slate-400">
                                                                Updated {article.updated}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>

                                <div className="mt-6 flex justify-center">
                                    <Button
                                        className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                                    >
                                        View All Articles
                                        <ArrowRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Contact Support Tab */}
                    <TabsContent value="contact" className="mt-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-2">
                                <Card className="dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                            Submit a Support Ticket
                                        </CardTitle>
                                        <CardDescription>
                                            Tell us about your issue and we'll get back to you within 24 hours
                                        </CardDescription>
                                    </CardHeader>

                                    <CardContent>
                                        <form className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="ticket-subject">Subject</Label>
                                                <Input
                                                    id="ticket-subject"
                                                    placeholder="Briefly describe your issue"
                                                    value={ticketSubject}
                                                    onChange={(e) => setTicketSubject(e.target.value)}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="ticket-description">Description</Label>
                                                <Textarea
                                                    id="ticket-description"
                                                    placeholder="Please provide details about your issue, including any error messages, wallet address, or transactions..."
                                                    className="min-h-[150px]"
                                                    value={ticketDescription}
                                                    onChange={(e) => setTicketDescription(e.target.value)}
                                                />
                                            </div>

                                            <div className="pt-4">
                                                <Button
                                                    type="button"
                                                    className="w-full md:w-auto gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                                                    onClick={submitSupportTicket}
                                                >
                                                    <LifeBuoy className="h-4 w-4" />
                                                    Submit Support Ticket
                                                </Button>
                                            </div>
                                        </form>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="space-y-6">
                                <Card className="dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg">
                                    <CardHeader>
                                        <CardTitle className="text-lg">Support Options</CardTitle>
                                    </CardHeader>

                                    <CardContent className="space-y-4">
                                        <div className="flex items-start gap-3">
                                            <div className="bg-blue-100 dark:bg-blue-900/30 h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0">
                                                <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-slate-900 dark:text-white">Live Chat</h3>
                                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                                    Available on weekdays from 9 AM to 5 PM EST.
                                                </p>
                                                <Button
                                                    variant="link"
                                                    className="h-8 p-0 text-blue-600 dark:text-blue-400"
                                                >
                                                    Start a chat
                                                </Button>
                                            </div>
                                        </div>

                                        <Separator />

                                        <div className="flex items-start gap-3">
                                            <div className="bg-indigo-100 dark:bg-indigo-900/30 h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0">
                                                <Link className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-slate-900 dark:text-white">Community Discord</h3>
                                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                                    Join our Discord for community support and discussions.
                                                </p>
                                                <Button
                                                    variant="link"
                                                    className="h-8 p-0 text-blue-600 dark:text-blue-400"
                                                    asChild
                                                >
                                                    <a href="https://discord.gg/metapilot" target="_blank" rel="noopener noreferrer">
                                                        Join Discord
                                                    </a>
                                                </Button>
                                            </div>
                                        </div>

                                        <Separator />

                                        <div className="flex items-start gap-3">
                                            <div className="bg-purple-100 dark:bg-purple-900/30 h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0">
                                                <Mail className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-slate-900 dark:text-white">Email Support</h3>
                                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                                    Email us directly for complex issues.
                                                </p>
                                                <Button
                                                    variant="link"
                                                    className="h-8 p-0 text-blue-600 dark:text-blue-400"
                                                    asChild
                                                >
                                                    <a href="mailto:support@metapilot.xyz">
                                                        support@metapilot.xyz
                                                    </a>
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg">
                                    <CardContent className="p-4">
                                        <div className="flex items-start gap-3">
                                            <div className="flex-shrink-0">
                                                <Avatar className="h-10 w-10">
                                                    <AvatarImage src="/images/support-agent.jpg" />
                                                    <AvatarFallback className="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                                                        MS
                                                    </AvatarFallback>
                                                </Avatar>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-medium text-slate-900 dark:text-white">
                                                        Morgan from MetaPilot
                                                    </h3>
                                                    <Badge className="bg-green-500 h-2 w-2 rounded-full p-0" />
                                                </div>
                                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                                    Our average response time is under 4 hours. For urgent issues, try the live chat option.
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </motion.div>

            {/* User feedback */}
            <motion.div variants={itemVariants}>
                <Card className="dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg">
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row items-center gap-6">
                            <div className="flex-shrink-0 text-blue-600 dark:text-blue-400">
                                <ThumbsUp className="h-16 w-16" />
                            </div>
                            <div className="text-center md:text-left">
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                                    Was this page helpful?
                                </h3>
                                <p className="text-slate-600 dark:text-slate-400 mt-1 mb-4">
                                    Help us improve our support resources by sharing your feedback.
                                </p>
                                <div className="flex gap-3 justify-center md:justify-start">
                                    <Button variant="outline" className="dark:bg-slate-800/50">
                                        Yes, it was helpful
                                    </Button>
                                    <Button variant="outline" className="dark:bg-slate-800/50">
                                        No, I need more help
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </motion.div>
    );
};

export default HelpSupportPage;