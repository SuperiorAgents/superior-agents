"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Menu,
    ChevronRight,
    ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/Shared/ThemeToggle";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useTheme } from "next-themes";
import DashboardSidebar from "@/components/Dashbaord/DashboardSidebar";
import NotificationsDropdown from "@/components/Dashbaord/NotificationsDropdown";
import UserProfileDropdown from "@/components/Dashbaord/UserProfileDropdown";


interface DashboardLayoutProps {
    children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    const [navScrolled, setNavScrolled] = useState(false);
    const { theme } = useTheme();

    // Handle window resize to detect mobile view
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 1024;
            setIsMobile(mobile);
            if (mobile) setSidebarOpen(false);
            else setSidebarOpen(true);
        };

        // Initial check
        handleResize();

        // Listen for window resize
        window.addEventListener("resize", handleResize);

        // Cleanup
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Handle scroll for navbar shadow
    useEffect(() => {
        const handleScroll = () => {
            setNavScrolled(window.scrollY > 10);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Layout animations
    const sidebarVariants = {
        open: {
            width: isMobile ? "280px" : "280px",
            transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] }
        },
        closed: {
            width: isMobile ? "0" : "80px",
            transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] }
        }
    };

    const contentVariants = {
        open: {
            marginLeft: isMobile ? "0" : "280px",
            transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] }
        },
        closed: {
            marginLeft: isMobile ? "0" : "80px",
            transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] }
        }
    };

    const navbarVariants = {
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.3 }
        },
        hidden: {
            opacity: 0,
            y: -20,
            transition: { duration: 0.3 }
        }
    };

    // Generate a dynamic background based on theme
    const gradientBackground = theme === 'dark'
        ? "bg-gradient-to-br from-[#050e2d]/60 to-[#071236]/70"
        : "bg-gradient-to-br from-slate-50 to-slate-100";

    return (
        <div className="flex h-screen overflow-hidden">
            {/* Sidebar backdrop for mobile */}
            <AnimatePresence>
                {isMobile && sidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-black/50 z-40"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <motion.div
                variants={sidebarVariants}
                initial={false}
                animate={sidebarOpen ? "open" : "closed"}
                className={cn(
                    "fixed top-0 left-0 h-full z-50 overflow-hidden",
                    isMobile ? (sidebarOpen ? "w-[280px]" : "w-0") : "w-auto",
                    theme === 'dark' ? "bg-[#040d36] border-r border-slate-800/50" : "bg-white border-r border-slate-200/50"
                )}
            >
                <DashboardSidebar
                    isCollapsed={!sidebarOpen}
                    isMobile={isMobile}
                    onToggle={() => setSidebarOpen(!sidebarOpen)}
                />
            </motion.div>

            {/* Main Content */}
            <motion.div
                variants={contentVariants}
                initial={false}
                animate={sidebarOpen ? "open" : "closed"}
                className={cn(
                    "flex-1 flex flex-col h-screen w-full",
                    isMobile ? "ml-0" : (sidebarOpen ? "ml-[280px]" : "ml-0"),
                    gradientBackground
                )}
            >
                {/* Top Navigation */}
                <motion.header
                    initial="visible"
                    animate="visible"
                    variants={navbarVariants}
                    className={cn(
                        "sticky top-0 z-30 w-full transition-all duration-300 h-16",
                        navScrolled ?
                            (theme === 'dark' ?
                                "bg-[#040d36]/90 backdrop-blur-md border-b border-slate-800/50 shadow-sm" :
                                "bg-white/90 backdrop-blur-md border-b border-slate-200/50 shadow-sm"
                            ) :
                            (theme === 'dark' ? "bg-[#040d36]" : "bg-white")
                    )}
                >
                    <div className="h-full px-4 flex items-center justify-between">
                        {/* Left Side */}
                        <div className="flex items-center gap-2">
                            {/* Mobile menu toggle */}
                            {isMobile && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setSidebarOpen(!sidebarOpen)}
                                    className="flex lg:hidden"
                                >
                                    <Menu className="h-5 w-5" />
                                </Button>
                            )}

                            {/* Desktop sidebar toggle */}
                            {!isMobile && (
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                                className="hidden lg:flex"
                                            >
                                                {sidebarOpen ? (
                                                    <ChevronLeft className="h-5 w-5" />
                                                ) : (
                                                    <ChevronRight className="h-5 w-5" />
                                                )}
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>{sidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            )}
                        </div>

                        {/* Right side - actions */}
                        <div className="flex items-center gap-2">
                            {/* Theme toggle */}
                            <ThemeToggle />

                            {/* Notifications */}
                            <NotificationsDropdown />

                            {/* User profile */}
                            <UserProfileDropdown />
                        </div>
                    </div>
                </motion.header>

                {/* Page Content */}
                <div className="flex-1 overflow-auto">
                    <div className="container mx-auto py-6 px-4 md:px-6">
                        {children}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default DashboardLayout;