"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Bell, Check, ChevronRight, XCircle, Clock, AlertCircle, Zap, Wallet, CheckCircle } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

// Notification types
type NotificationType = "success" | "warning" | "info" | "error" | "pending";

interface Notification {
    id: string;
    title: string;
    message: string;
    time: Date;
    type: NotificationType;
    read: boolean;
    action?: {
        text: string;
        href: string;
    };
}

// Mock notifications data
const mockNotifications: Notification[] = [
    {
        id: "1",
        title: "Voting Success",
        message: "Your vote on Nouns DAO proposal #145 was successfully submitted.",
        time: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
        type: "success",
        read: false,
        action: {
            text: "View Transaction",
            href: "/dashboard/transactions/0x123",
        },
    },
    {
        id: "2",
        title: "Low Gas Alert",
        message: "Gas prices are currently low (15 gwei). Good time for pending transactions.",
        time: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
        type: "info",
        read: false,
    },
    {
        id: "3",
        title: "Token Swap Pending",
        message: "Your ETH to USDC swap is waiting for confirmation.",
        time: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
        type: "pending",
        read: false,
        action: {
            text: "Check Status",
            href: "/dashboard/transactions/pending",
        },
    },
    {
        id: "4",
        title: "Yield Opportunity",
        message: "New USDC yield opportunity detected at 8.5% APY on Compound.",
        time: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
        type: "info",
        read: true,
        action: {
            text: "Create Task",
            href: "/dashboard/tasks/create",
        },
    },
    {
        id: "5",
        title: "Transaction Error",
        message: "NFT purchase transaction failed: insufficient funds.",
        time: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        type: "error",
        read: true,
    },
    {
        id: "6",
        title: "Reward Claimed",
        message: "Successfully claimed 25 UNI tokens from staking rewards.",
        time: new Date(Date.now() - 1000 * 60 * 60 * 36), // 1.5 days ago
        type: "success",
        read: true,
        action: {
            text: "View Transaction",
            href: "/dashboard/transactions/0x456",
        },
    },
];

const NotificationsDropdown: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
    const [isOpen, setIsOpen] = useState(false);

    const unreadCount = notifications.filter(n => !n.read).length;

    // Mark notification as read
    const markAsRead = (id: string) => {
        setNotifications(
            notifications.map(notification =>
                notification.id === id
                    ? { ...notification, read: true }
                    : notification
            )
        );
    };

    // Mark all notifications as read
    const markAllAsRead = () => {
        setNotifications(
            notifications.map(notification => ({
                ...notification,
                read: true,
            }))
        );
    };

    // Delete a notification
    const deleteNotification = (id: string) => {
        setNotifications(notifications.filter(notification => notification.id !== id));
    };

    // Get icon for notification type
    const getNotificationIcon = (type: NotificationType) => {
        switch (type) {
            case "success":
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            case "warning":
                return <AlertCircle className="h-5 w-5 text-amber-500" />;
            case "error":
                return <XCircle className="h-5 w-5 text-red-500" />;
            case "info":
                return <Zap className="h-5 w-5 text-blue-500" />;
            case "pending":
                return <Clock className="h-5 w-5 text-indigo-500" />;
            default:
                return <Bell className="h-5 w-5 text-slate-500" />;
        }
    };

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-0 right-0 flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className="w-80 md:w-96 max-h-[85vh] overflow-hidden p-0 shadow-lg"
                forceMount
            >
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
                        <h3 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center">
                            Notifications
                            {unreadCount > 0 && (
                                <Badge className="ml-2 bg-blue-500 hover:bg-blue-600" variant="default">
                                    {unreadCount} new
                                </Badge>
                            )}
                        </h3>
                        {unreadCount > 0 && (
                            <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs text-blue-600 dark:text-blue-400">
                                Mark all as read
                            </Button>
                        )}
                    </div>

                    {/* Notification list */}
                    <div className="overflow-y-auto max-h-[60vh]">
                        {notifications.length === 0 ? (
                            <div className="py-8 text-center">
                                <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                                    <Bell className="h-6 w-6 text-slate-500 dark:text-slate-400" />
                                </div>
                                <p className="text-slate-600 dark:text-slate-400">No notifications yet</p>
                            </div>
                        ) : (
                            <div>
                                {notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={cn(
                                            "relative p-4 border-b border-slate-200 dark:border-slate-800 last:border-0 transition-colors",
                                            !notification.read ? "bg-blue-50 dark:bg-blue-900/10" : "",
                                            "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                        )}
                                    >
                                        <div className="flex gap-3">
                                            <div className="flex-shrink-0 mt-0.5">
                                                {getNotificationIcon(notification.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between">
                                                    <p className={cn(
                                                        "text-sm font-medium",
                                                        !notification.read
                                                            ? "text-slate-900 dark:text-slate-100"
                                                            : "text-slate-700 dark:text-slate-300"
                                                    )}>
                                                        {notification.title}
                                                    </p>
                                                    <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap ml-2">
                                                        {formatDistanceToNow(notification.time, { addSuffix: true })}
                                                    </span>
                                                </div>

                                                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                                                    {notification.message}
                                                </p>

                                                {notification.action && (
                                                    <div className="mt-2">
                                                        <Button
                                                            variant="link"
                                                            size="sm"
                                                            className="h-auto p-0 text-xs font-medium text-blue-600 dark:text-blue-400 flex items-center"
                                                            onClick={() => markAsRead(notification.id)}
                                                        >
                                                            {notification.action.text}
                                                            <ChevronRight className="ml-1 h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="ml-2 flex-shrink-0 flex flex-col gap-2">
                                                {!notification.read && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                                        onClick={() => markAsRead(notification.id)}
                                                    >
                                                        <Check className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                                                    onClick={() => deleteNotification(notification.id)}
                                                >
                                                    <XCircle className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-center">
                        <Button variant="ghost" size="sm" className="text-sm text-slate-700 dark:text-slate-300 w-full justify-center dark:hover:bg-slate-900/80">
                            View all notifications
                        </Button>
                    </div>
                </motion.div>
            </DropdownMenuContent>
        </DropdownMenu>
    )
};

export default NotificationsDropdown;