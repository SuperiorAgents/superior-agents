"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Home,
    Vote,
    Wallet,
    BarChart3,
    Clock,
    Layers,
    Settings,
    HelpCircle,
    LogOut,
    Plus,
    ArrowRight,
    ChevronDown,
    DollarSign,
    Gem,
    Shuffle,
    BellRing,
    ArrowLeftRight,
    Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import MetaPilotLogo from "@/components/Shared/MetaPilotLogo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTheme } from "next-themes";
import CreateTaskModal from "./Tasks/CreateTaskModal";

interface NavItem {
    name: string;
    href: string;
    icon: React.ReactNode;
    onClick?: () => void;
    badge?: {
        text: string;
        variant: "default" | "destructive" | "secondary" | "outline";
    };
    subItems?: {
        name: string;
        href: string;
        icon?: React.ReactNode;
    }[];
    isNew?: boolean;
}

interface DashboardSidebarProps {
    isCollapsed: boolean;
    isMobile: boolean;
    onToggle: () => void;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
    isCollapsed,
    isMobile,
    onToggle,
}) => {
    const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
    const [createTaskModalOpen, setCreateTaskModalOpen] = useState(false);
    const pathname = usePathname();
    const { theme } = useTheme();

    // Navigation groups
    const mainNavItems: NavItem[] = [
        {
            name: "Dashboard",
            href: "/dashboard",
            icon: <Home className="h-5 w-5" />,
        },
        {
            name: "Your Tasks",
            href: "#",
            icon: <Layers className="h-5 w-5" />,
            badge: {
                text: "3",
                variant: "secondary",
            },
            subItems: [
                {
                    name: "Active Tasks",
                    href: "/dashboard/tasks/active",
                    icon: <Clock className="h-4 w-4" />,
                },
                {
                    name: "Completed",
                    href: "/dashboard/tasks/completed",
                },
                {
                    name: "Schedule",
                    href: "/dashboard/tasks/schedule",
                },
            ],
        },
        {
            name: "Create Task",
            href: "#",
            icon: <Plus className="h-5 w-5" />,
            isNew: true,
            onClick: () => setCreateTaskModalOpen(true),
        },
    ];

    const automationNavItems: NavItem[] = [
        {
            name: "DAO Voting",
            href: "/dashboard/automation/dao-voting",
            icon: <Vote className="h-5 w-5" />,
        },
        {
            name: "Yield Farming",
            href: "/dashboard/automation/yield",
            icon: <DollarSign className="h-5 w-5" />,
        },
        {
            name: "NFT Purchases",
            href: "/dashboard/automation/nft",
            icon: <Gem className="h-5 w-5" />,
        },
        {
            name: "Token Swaps",
            href: "/dashboard/automation/swaps",
            icon: <ArrowLeftRight className="h-5 w-5" />,
        },
        {
            name: "Claim Rewards",
            href: "/dashboard/automation/rewards",
            icon: <BellRing className="h-5 w-5" />,
        },
        {
            name: "Gas Optimizer",
            href: "/dashboard/automation/gas-optimizer",
            icon: <Zap className="h-5 w-5" />,
        },
        {
            name: "Arbitrage",
            href: "/dashboard/automation/arbitrage",
            icon: <Shuffle className="h-5 w-5" />,
        },
    ];

    const miscNavItems: NavItem[] = [
        {
            name: "Analytics",
            href: "/dashboard/analytics",
            icon: <BarChart3 className="h-5 w-5" />,
        },
        {
            name: "Wallet",
            href: "/dashboard/wallet",
            icon: <Wallet className="h-5 w-5" />,
        },
        {
            name: "Settings",
            href: "/dashboard/settings",
            icon: <Settings className="h-5 w-5" />,
        },
        {
            name: "Help",
            href: "/dashboard/help",
            icon: <HelpCircle className="h-5 w-5" />,
        },
    ];

    // Function to toggle subgroup expansion
    const toggleGroup = (groupName: string) => {
        setExpandedGroup(expandedGroup === groupName ? null : groupName);
    };

    // Check if a nav item is active
    const isActiveLink = (href: string) => {
        if (href === "/dashboard" && pathname === "/dashboard") {
            return true;
        }
        return pathname.startsWith(href) && href !== "/dashboard";
    };

    // Render a navigation item
    const renderNavItem = (item: NavItem, index: number, groupName: string) => {
        const active = isActiveLink(item.href);
        const hasSubItems = item.subItems && item.subItems.length > 0;
        const isExpanded = expandedGroup === groupName + "-" + item.name;

        return (
            <div key={item.name + index} className="w-full">
                {hasSubItems ? (
                    <div className="w-full">
                        <Button
                            variant="ghost"
                            className={cn(
                                "relative w-full justify-start gap-x-3 rounded-lg p-2",
                                active
                                    ? "bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60",
                                isCollapsed && "justify-center px-0",
                                hasSubItems && isExpanded && "bg-slate-100 dark:bg-slate-800/50"
                            )}
                            onClick={() => toggleGroup(groupName + "-" + item.name)}
                        >
                            <span className="flex min-w-0 items-center justify-center">
                                {item.icon}
                            </span>
                            {!isCollapsed && (
                                <>
                                    <span className="text-sm font-medium">{item.name}</span>
                                    {item.badge && (
                                        <Badge
                                            variant={item.badge.variant}
                                            className="ml-auto text-xs"
                                        >
                                            {item.badge.text}
                                        </Badge>
                                    )}
                                    {item.isNew && (
                                        <Badge
                                            variant="secondary"
                                            className="ml-auto text-xs px-1 py-0 h-5"
                                        >
                                            New
                                        </Badge>
                                    )}
                                    <ChevronDown
                                        className={cn(
                                            "h-4 w-4 ml-auto transition-transform",
                                            isExpanded ? "transform rotate-180" : ""
                                        )}
                                    />
                                </>
                            )}
                        </Button>
                        {hasSubItems && !isCollapsed && (
                            <AnimatePresence initial={false}>
                                {isExpanded && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="pl-10 pr-2 py-1 space-y-1">
                                            {item.subItems?.map((subItem, i) => {
                                                const subActive = pathname === subItem.href;
                                                return (
                                                    <Link
                                                        key={i}
                                                        href={subItem.href}
                                                        className={cn(
                                                            "flex items-center gap-x-2 rounded-md px-3 py-2 text-sm",
                                                            subActive
                                                                ? "bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                                                                : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                                                        )}
                                                    >
                                                        {subItem.icon && <span>{subItem.icon}</span>}
                                                        <span className="truncate">{subItem.name}</span>
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        )}
                    </div>
                ) : (
                    <TooltipProvider delayDuration={isCollapsed ? 100 : 0}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Link
                                    href={item.href}
                                    onClick={(e) => {
                                        if (item.onClick) {
                                            e.preventDefault();
                                            item.onClick();
                                        }
                                    }}
                                    className={cn(
                                        "flex h-10 w-full items-center gap-x-3 rounded-lg px-3 text-sm font-medium",
                                        active
                                            ? "bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60",
                                        isCollapsed && "justify-center px-0"
                                    )}
                                >
                                    <span className="flex min-w-0 items-center justify-center">
                                        {item.icon}
                                    </span>
                                    {!isCollapsed && (
                                        <>
                                            <span className="truncate">{item.name}</span>
                                            {item.badge && (
                                                <Badge
                                                    variant={item.badge.variant}
                                                    className="ml-auto text-xs"
                                                >
                                                    {item.badge.text}
                                                </Badge>
                                            )}
                                            {item.isNew && (
                                                <Badge
                                                    variant="secondary"
                                                    className="ml-auto text-xs px-1 py-0 h-5"
                                                >
                                                    New
                                                </Badge>
                                            )}
                                        </>
                                    )}
                                </Link>
                            </TooltipTrigger>
                            {isCollapsed && (
                                <TooltipContent side="right" className="bg-[#040d36]/90 font-semibold dark:text-[#040d36] dark:bg-white backdrop-blur-md border-b border-slate-800/50 shadow-sm">
                                    <div className="flex flex-col ">
                                        <span>{item.name}</span>
                                        {item.badge && (
                                            <span className="text-xs opacity-80 mt-0.5">
                                                {item.badge.text} items
                                            </span>
                                        )}
                                    </div>
                                </TooltipContent>
                            )}
                        </Tooltip>
                    </TooltipProvider>
                )}
            </div>
        );
    };

    // Render a navigation group
    const renderNavGroup = (
        title: string,
        items: NavItem[],
        groupName: string
    ) => (
        <div className="space-y-1">
            {!isCollapsed && (
                <h3 className="px-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    {title}
                </h3>
            )}
            {items.map((item, i) => renderNavItem(item, i, groupName))}
        </div>
    );

    // Determine background color based on theme
    const sidebarBackground = theme === 'dark'
        ? "bg-[#040d36] border-r border-slate-800/50"
        : "bg-white border-r border-slate-200/50";

    return (
        <div
            className={cn(
                "h-full flex flex-col overflow-hidden transition-all duration-300",
                sidebarBackground,
                isCollapsed && !isMobile ? "items-center" : "items-stretch"
            )}
        >
            {/* Sidebar Header with Logo */}
            <div
                className={cn(
                    "flex shrink-0 items-center border-b border-slate-200 dark:border-slate-800 h-16 px-4",
                    isCollapsed && !isMobile ? "justify-center" : "justify-between"
                )}
            >
                {!isCollapsed || isMobile ? (
                    <div className="flex items-center">
                        <MetaPilotLogo className="w-32" />
                    </div>
                ) : (
                    <div className="flex items-center justify-center py-2">
                        <MetaPilotLogo iconOnly className="w-8 h-8" />
                    </div>
                )}
                {isMobile && (
                    <Button variant="ghost" size="icon" onClick={onToggle}>
                        <ArrowRight className="h-5 w-5" />
                    </Button>
                )}
            </div>

            {/* Navigation Items */}
            <div
                className={cn(
                    "flex-1 flex flex-col overflow-y-auto px-3 py-4 space-y-6",
                    isCollapsed && !isMobile ? "items-center px-2" : ""
                )}
            >
                {/* Main Menu */}
                {renderNavGroup("Main Menu", mainNavItems, "main")}

                {/* Automation Menu */}
                {renderNavGroup("Automation", automationNavItems, "automation")}

                {/* Miscellaneous */}
                {renderNavGroup("Utilities", miscNavItems, "misc")}
            </div>

            {/* Sidebar Footer */}
            <div
                className={cn(
                    "mt-auto border-t border-slate-200 dark:border-slate-800 p-3",
                    isCollapsed && !isMobile ? "flex justify-center" : ""
                )}
            >
                <Button
                    variant="ghost"
                    className={cn(
                        "w-full justify-start gap-x-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-700 dark:hover:text-red-300",
                        isCollapsed && !isMobile ? "justify-center p-2" : ""
                    )}
                >
                    <LogOut className="h-5 w-5" />
                    {!isCollapsed && <span className="text-sm font-medium">Log Out</span>}
                </Button>
            </div>

            {/* Create Task Modal */}
            <CreateTaskModal
                open={createTaskModalOpen}
                onOpenChange={setCreateTaskModalOpen}
                onTaskCreated={(newTask) => {
                    // Handle new task if needed
                    setCreateTaskModalOpen(false);
                }}
            />
        </div>
    );
};

export default DashboardSidebar;