// DocSidebar.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Button,
} from '@/components/ui/button';
import {
    ChevronDown,
    CornerDownRight,
    Search,
    MessageSquare,
    LifeBuoy,
    Github,
    Twitter,
    X,
} from 'lucide-react';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';

// Animation variants
const sidebarVariants = {
    open: {
        x: 0,
        transition: {
            type: "spring",
            stiffness: 300,
            damping: 30
        }
    },
    closed: {
        x: "-100%",
        transition: {
            type: "spring",
            stiffness: 300,
            damping: 30
        }
    }
};

// Types for docs structure
interface DocLink {
    title: string;
    href: string;
    badge?: {
        text: string;
        variant: 'new' | 'updated' | 'beta' | 'deprecated';
    };
}

interface DocCategory {
    title: string;
    icon: React.ElementType;
    links: DocLink[];
    expanded?: boolean;
}

// Props for the sidebar
interface DocSidebarProps {
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
    currentPath: string;
}

// Badge colors and icons
const badgeIcons = {
    new: <span className="h-1.5 w-1.5 rounded-full bg-green-500 mr-1"></span>,
    updated: <span className="h-1.5 w-1.5 rounded-full bg-blue-500 mr-1"></span>,
    beta: <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mr-1"></span>,
    deprecated: <span className="h-1.5 w-1.5 rounded-full bg-red-500 mr-1"></span>,
}

const badgeVariants = {
    new: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-900/30",
    updated: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-900/30",
    beta: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-900/30",
    deprecated: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-900/30",
}

// Import icons for the sidebar
import {
    Home,
    FileText,
    Settings,
    Code,
    Book
} from 'lucide-react';
import { Input } from '../ui/input';
import MetaPilotLogo from '../Shared/MetaPilotLogo';

// Component for the Shield icon
const Shield = (props: React.ComponentProps<"svg">) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
);

// Component for the BookOpen icon
const BookOpen = (props: React.ComponentProps<"svg">) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
);

// Documentation structure
const docsStructure: DocCategory[] = [
    {
        title: "Getting Started",
        icon: Home,
        expanded: true,
        links: [
            { title: "Introduction", href: "/docs/introduction" },
            { title: "Quick Start Guide", href: "/docs/quick-start" },
            { title: "Installation", href: "/docs/installation" },
            {
                title: "Key Concepts",
                href: "/docs/key-concepts",
                badge: { text: "Updated", variant: "updated" }
            },
        ]
    },
    {
        title: "Core Features",
        icon: FileText,
        expanded: true,
        links: [
            { title: "DAO Voting Automation", href: "/docs/dao-voting" },
            {
                title: "Yield Optimization",
                href: "/docs/yield-optimization",
                badge: { text: "New", variant: "new" }
            },
            { title: "Token Swaps", href: "/docs/token-swaps" },
            { title: "Reward Claiming", href: "/docs/reward-claiming" },
            { title: "NFT Purchasing", href: "/docs/nft-purchasing" },
        ]
    },
    {
        title: "Configuration",
        icon: Settings,
        links: [
            { title: "Wallet Connection", href: "/docs/wallet-connection" },
            { title: "Task Settings", href: "/docs/task-settings" },
            { title: "Notification Setup", href: "/docs/notification-setup" },
            { title: "Gas Optimization", href: "/docs/gas-optimization" },
        ]
    },
    {
        title: "Security",
        icon: Shield,
        links: [
            { title: "Session Keys", href: "/docs/session-keys" },
            { title: "Permission Scopes", href: "/docs/permission-scopes" },
            { title: "Wallet Delegation", href: "/docs/wallet-delegation" },
            {
                title: "Security Best Practices",
                href: "/docs/security-best-practices",
                badge: { text: "Important", variant: "updated" }
            },
        ]
    },
    {
        title: "API Reference",
        icon: Code,
        links: [
            { title: "API Overview", href: "/docs/api-overview" },
            { title: "Authentication", href: "/docs/api-authentication" },
            { title: "Tasks API", href: "/docs/api-tasks" },
            { title: "Webhooks", href: "/docs/api-webhooks" },
            {
                title: "GraphQL API",
                href: "/docs/api-graphql",
                badge: { text: "Beta", variant: "beta" }
            },
        ]
    },
    {
        title: "Tutorials",
        icon: BookOpen,
        links: [
            { title: "Creating Your First Task", href: "/docs/tutorial-first-task" },
            { title: "Advanced DAO Voting", href: "/docs/tutorial-dao-voting" },
            { title: "Optimizing Yield Strategies", href: "/docs/tutorial-yield-strategies" },
            { title: "Building with the API", href: "/docs/tutorial-api" },
        ]
    }
];

const DocSidebar: React.FC<DocSidebarProps> = ({ sidebarOpen, setSidebarOpen, currentPath }) => {
    const [expandedCategories, setExpandedCategories] = useState<{ [key: string]: boolean }>({
        "Getting Started": true,
        "Core Features": true
    });
    const [searchQuery, setSearchQuery] = useState('');

    // Toggle category expansion
    const toggleCategory = (category: string) => {
        setExpandedCategories(prev => ({
            ...prev,
            [category]: !prev[category]
        }));
    };

    // Get badge component based on variant
    const getBadge = (badge?: DocLink['badge']) => {
        if (!badge) return null;

        return (
            <span
                className={`ml-2 inline-flex items-center text-[10px] py-0.5 px-1.5 rounded-full ${badgeVariants[badge.variant]}`}
            >
                {badgeIcons[badge.variant]}
                {badge.text}
            </span>
        );
    };

    return (
        <>
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <motion.aside
                className="fixed h-fit top-0 bottom-0 left-0 w-72 z-50 lg:z-0 bg-white dark:bg-slate-900/90 border-r border-slate-200 dark:border-slate-800 overflow-y-auto lg:sticky"
                variants={sidebarVariants}
                initial={window.innerWidth >= 1024 ? "open" : "closed"}
                animate={window.innerWidth >= 1024 ? "open" : (sidebarOpen ? "open" : "closed")}
                transition={{ duration: 0.3 }}
            >
                <div className="sticky top-0 z-10 bg-white dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 p-4">
                    <div className="flex items-center justify-between">
                        <Link href="/" className="flex items-center gap-2">
                            <MetaPilotLogo />
                        </Link>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="lg:hidden"
                            onClick={() => setSidebarOpen(false)}
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </div>

                    <div className="relative mt-4">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search documentation..."
                            className="pl-9"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <nav className="p-4 pb-24">
                    <div className="space-y-4">
                        {docsStructure.map((category, index) => {
                            const isExpanded = expandedCategories[category.title] ?? false;
                            const Icon = category.icon;

                            return (
                                <div key={index} className="space-y-1">
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start text-slate-600 dark:text-slate-400 font-medium hover:text-slate-900 dark:hover:text-white"
                                        onClick={() => toggleCategory(category.title)}
                                    >
                                        <Icon className="h-5 w-5 mr-2" />
                                        <span>{category.title}</span>
                                        <ChevronDown className={`ml-auto h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                    </Button>

                                    {isExpanded && (
                                        <div className="ml-8 space-y-1 mt-1">
                                            {category.links.map((link, linkIndex) => {
                                                const isActive = link.href === currentPath;

                                                return (
                                                    <Link
                                                        key={linkIndex}
                                                        href={link.href}
                                                        className={`group flex items-center text-sm py-2 px-3 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800/50 ${isActive
                                                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                                                            : 'text-slate-600 dark:text-slate-400'
                                                            }`}
                                                    >
                                                        <CornerDownRight className={`h-3.5 w-3.5 mr-2 ${isActive
                                                            ? 'text-blue-600 dark:text-blue-400'
                                                            : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                                                            }`} />
                                                        <span className="flex-grow">{link.title}</span>
                                                        {getBadge(link.badge)}
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <Separator className="my-6" />

                    <div className="space-y-1">
                        <Link
                            href="/docs/feedback"
                            className="flex items-center text-sm py-2 px-3 rounded-md text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50"
                        >
                            <MessageSquare className="h-5 w-5 mr-2" />
                            <span>Send Feedback</span>
                        </Link>
                        <Link
                            href="/docs/support"
                            className="flex items-center text-sm py-2 px-3 rounded-md text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50"
                        >
                            <LifeBuoy className="h-5 w-5 mr-2" />
                            <span>Contact Support</span>
                        </Link>
                    </div>

                    <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-3">
                            <a
                                href="https://github.com/metapilot"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                            >
                                <Github className="h-5 w-5" />
                            </a>
                            <a
                                href="https://twitter.com/metapilot"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                            >
                                <Twitter className="h-5 w-5" />
                            </a>
                            <div className="ml-auto text-xs text-slate-500 dark:text-slate-400">
                                v1.3.4
                            </div>
                        </div>
                    </div>
                </nav>
            </motion.aside>
        </>
    );
};

export default DocSidebar;