"use client";

import React from "react";
import { motion } from "framer-motion";
import {
    Bell,
    MegaphoneIcon,
    ChevronRight,
    ExternalLink,
    Sparkles,
    Shield,
    Zap,
    AlertCircle,
    Rocket,
    BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

// Announcement types and priorities
type AnnouncementType =
    | "feature"
    | "security"
    | "performance"
    | "alert"
    | "update"
    | "promotion";

type AnnouncementPriority = "low" | "medium" | "high";

// Announcement interface
interface Announcement {
    id: string;
    title: string;
    content: string;
    type: AnnouncementType;
    priority: AnnouncementPriority;
    date: Date;
    link?: {
        url: string;
        text: string;
        external?: boolean;
    };
    read?: boolean;
}

interface LatestAnnouncementsProps {
    announcements?: Announcement[];
    limit?: number;
    className?: string;
    showReadStatus?: boolean;
    onViewAll?: () => void;
    onMarkAsRead?: (id: string) => void;
}

// Mock announcement data
const mockAnnouncements: Announcement[] = [
    {
        id: "announcement-1",
        title: "New Feature: Gas Price Optimization",
        content: "MetaPilot now automatically schedules your transactions at optimal gas prices, saving you up to 35% on fees.",
        type: "feature",
        priority: "high",
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
        link: {
            url: "/features/gas-optimization",
            text: "Learn More",
        },
        read: false,
    },
    {
        id: "announcement-2",
        title: "Security Update: Session Key Improvements",
        content: "We've enhanced our session key security to provide better protection for your delegated tasks.",
        type: "security",
        priority: "high",
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
        link: {
            url: "/security/session-keys",
            text: "Security Details",
        },
        read: true,
    },
    {
        id: "announcement-3",
        title: "Performance Enhancement: Faster DAO Monitoring",
        content: "We've optimized our DAO monitoring system to detect proposals 3x faster than before.",
        type: "performance",
        priority: "medium",
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 7 days ago
        read: false,
    },
    {
        id: "announcement-4",
        title: "MetaPilot Pro Now Available",
        content: "Upgrade to MetaPilot Pro for unlimited tasks, priority execution, and advanced analytics.",
        type: "promotion",
        priority: "medium",
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10), // 10 days ago
        link: {
            url: "/pricing",
            text: "Upgrade Now",
        },
        read: true,
    },
    {
        id: "announcement-5",
        title: "Supported Network Alert: Arbitrum Added",
        content: "MetaPilot now supports tasks on Arbitrum, including voting, swaps, and yield optimization.",
        type: "alert",
        priority: "medium",
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14), // 14 days ago
        link: {
            url: "/networks/arbitrum",
            text: "Set Up Arbitrum Tasks",
        },
        read: true,
    },
];

// Get icon for announcement type
const getAnnouncementIcon = (type: AnnouncementType) => {
    switch (type) {
        case "feature":
            return <Sparkles className="h-5 w-5 text-indigo-500" />;
        case "security":
            return <Shield className="h-5 w-5 text-green-500" />;
        case "performance":
            return <Zap className="h-5 w-5 text-amber-500" />;
        case "alert":
            return <AlertCircle className="h-5 w-5 text-red-500" />;
        case "update":
            return <Rocket className="h-5 w-5 text-blue-500" />;
        case "promotion":
            return <BarChart3 className="h-5 w-5 text-purple-500" />;
        default:
            return <MegaphoneIcon className="h-5 w-5 text-slate-500" />;
    }
};

// Get colors for announcement type
const getAnnouncementColors = (type: AnnouncementType, priority: AnnouncementPriority) => {
    // Add priority-based intensity
    const intensityClass =
        priority === "high" ? "ring-2" :
            priority === "medium" ? "ring-1" : "";

    switch (type) {
        case "feature":
            return {
                bg: "bg-indigo-100 dark:bg-indigo-900/30",
                color: "text-indigo-600 dark:text-indigo-400",
                ring: priority === "high" ? "ring-2 ring-indigo-200 dark:ring-indigo-800/50" :
                    priority === "medium" ? "ring-1 ring-indigo-200 dark:ring-indigo-800/50" : "",
                badge: "bg-indigo-500 text-white",
            };
        case "security":
            return {
                bg: "bg-green-100 dark:bg-green-900/30",
                color: "text-green-600 dark:text-green-400",
                ring: priority === "high" ? "ring-2 ring-green-200 dark:ring-green-800/50" :
                    priority === "medium" ? "ring-1 ring-green-200 dark:ring-green-800/50" : "",
                badge: "bg-green-500 text-white",
            };
        case "performance":
            return {
                bg: "bg-amber-100 dark:bg-amber-900/30",
                color: "text-amber-600 dark:text-amber-400",
                ring: priority === "high" ? "ring-2 ring-amber-200 dark:ring-amber-800/50" :
                    priority === "medium" ? "ring-1 ring-amber-200 dark:ring-amber-800/50" : "",
                badge: "bg-amber-500 text-white",
            };
        case "alert":
            return {
                bg: "bg-red-100 dark:bg-red-900/30",
                color: "text-red-600 dark:text-red-400",
                ring: priority === "high" ? "ring-2 ring-red-200 dark:ring-red-800/50" :
                    priority === "medium" ? "ring-1 ring-red-200 dark:ring-red-800/50" : "",
                badge: "bg-red-500 text-white",
            };
        case "update":
            return {
                bg: "bg-blue-100 dark:bg-blue-900/30",
                color: "text-blue-600 dark:text-blue-400",
                ring: priority === "high" ? "ring-2 ring-blue-200 dark:ring-blue-800/50" :
                    priority === "medium" ? "ring-1 ring-blue-200 dark:ring-blue-800/50" : "",
                badge: "bg-blue-500 text-white",
            };
        case "promotion":
            return {
                bg: "bg-purple-100 dark:bg-purple-900/30",
                color: "text-purple-600 dark:text-purple-400",
                ring: priority === "high" ? "ring-2 ring-purple-200 dark:ring-purple-800/50" :
                    priority === "medium" ? "ring-1 ring-purple-200 dark:ring-purple-800/50" : "",
                badge: "bg-purple-500 text-white",
            };
        default:
            return {
                bg: "bg-slate-100 dark:bg-slate-800",
                color: "text-slate-600 dark:text-slate-400",
                ring: "",
                badge: "bg-slate-500 text-white",
            };
    }
};

// Get type badge text
const getAnnouncementTypeBadge = (type: AnnouncementType) => {
    switch (type) {
        case "feature":
            return "New Feature";
        case "security":
            return "Security";
        case "performance":
            return "Performance";
        case "alert":
            return "Alert";
        case "update":
            return "Update";
        case "promotion":
            return "Promotion";
        default:
            return "Announcement";
    }
};

const LatestAnnouncements: React.FC<LatestAnnouncementsProps> = ({
    announcements = mockAnnouncements,
    limit = 3,
    className,
    showReadStatus = true,
    onViewAll,
    onMarkAsRead,
}) => {
    // Limit announcements to display
    const displayedAnnouncements = announcements.slice(0, limit);

    // Sort by date
    const sortedAnnouncements = [...displayedAnnouncements].sort(
        (a, b) => b.date.getTime() - a.date.getTime()
    );

    return (
        <Card className={className}>
            <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <MegaphoneIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        Announcements
                    </CardTitle>
                    {showReadStatus && (
                        <Badge className="bg-blue-500 hover:bg-blue-600">
                            {announcements.filter(a => !a.read).length} New
                        </Badge>
                    )}
                </div>
                <CardDescription>
                    Latest updates and news from MetaPilot
                </CardDescription>
            </CardHeader>

            <CardContent>
                {sortedAnnouncements.length === 0 ? (
                    <div className="py-8 text-center">
                        <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                            <Bell className="h-6 w-6 text-slate-500 dark:text-slate-400" />
                        </div>
                        <p className="text-slate-600 dark:text-slate-400">No announcements yet</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {sortedAnnouncements.map((announcement, index) => {
                            const colors = getAnnouncementColors(announcement.type, announcement.priority);

                            return (
                                <motion.div
                                    key={announcement.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.1 }}
                                    className={cn(
                                        "rounded-lg p-4 relative",
                                        colors.bg,
                                        colors.ring,
                                        !announcement.read && showReadStatus && "border-l-4 border-blue-500 dark:border-blue-400"
                                    )}
                                >
                                    <div className="flex gap-3">
                                        <div className={cn(
                                            "h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0",
                                            colors.bg
                                        )}>
                                            <div className={colors.color}>
                                                {getAnnouncementIcon(announcement.type)}
                                            </div>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h3 className="font-medium text-slate-900 dark:text-slate-100">
                                                        {announcement.title}
                                                    </h3>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Badge variant="secondary" className={cn("text-[10px] h-4 px-1", colors.badge)}>
                                                            {getAnnouncementTypeBadge(announcement.type)}
                                                        </Badge>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                                            {formatDistanceToNow(announcement.date)} ago
                                                        </p>
                                                    </div>
                                                </div>
                                                {showReadStatus && !announcement.read && onMarkAsRead && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-6 px-2 py-1 text-xs text-blue-600 dark:text-blue-400"
                                                        onClick={() => onMarkAsRead(announcement.id)}
                                                    >
                                                        Mark as read
                                                    </Button>
                                                )}
                                            </div>

                                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                                                {announcement.content}
                                            </p>

                                            {announcement.link && (
                                                <div className="mt-2">
                                                    <Button
                                                        variant="link"
                                                        className="p-0 h-auto text-sm font-medium text-blue-600 dark:text-blue-400 flex items-center"
                                                        asChild
                                                    >
                                                        <Link href={announcement.link.url}>
                                                            {announcement.link.text}
                                                            {announcement.link.external ? (
                                                                <ExternalLink className="ml-1 h-3 w-3" />
                                                            ) : (
                                                                <ChevronRight className="ml-1 h-3 w-3" />
                                                            )}
                                                        </Link>
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </CardContent>

            {onViewAll && (
                <CardFooter className="pt-0">
                    <Button
                        variant="ghost"
                        className="w-full justify-center text-blue-600 dark:text-blue-400"
                        onClick={onViewAll}
                    >
                        <span>View All Announcements</span>
                        <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                </CardFooter>
            )}
        </Card>
    );
};

export default LatestAnnouncements;