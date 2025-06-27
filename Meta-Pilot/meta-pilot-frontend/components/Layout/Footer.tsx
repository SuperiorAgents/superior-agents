"use client"

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    Github,
    Twitter,
    Mail,
    ChevronRight,
    ArrowUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import MetaPilotLogo from '../Shared/MetaPilotLogo';
import { useTheme } from 'next-themes';

// Footer link component
interface FooterLinkProps {
    href: string;
    label: string;
    isExternal?: boolean;
}

const FooterLink: React.FC<FooterLinkProps> = ({
    href,
    label,
    isExternal = false,
}) => {
    const content = (
        <motion.p
            className="text-sm text-slate-700 dark:text-gray-400 hover:text-blue-700 dark:hover:text-blue-400 transition-colors flex items-center gap-1.5"
            whileHover={{ x: 2 }}
            whileTap={{ scale: 0.98 }}
        >
            <ChevronRight size={14} className="text-blue-600/70 dark:text-blue-500/70" />
            <span>{label}</span>
        </motion.p>
    );

    if (isExternal) {
        return (
            <a href={href} target="_blank" rel="noreferrer" aria-label={label} className="block py-1">
                {content}
            </a>
        );
    }

    return (
        <Link href={href} aria-label={label} className="block py-1">
            {content}
        </Link>
    );
};

// Social media icon component
interface SocialIconProps {
    href: string;
    icon: React.ReactNode;
    label: string;
}

const SocialIcon: React.FC<SocialIconProps> = ({ href, icon, label }) => {
    return (
        <motion.a
            href={href}
            target="_blank"
            rel="noreferrer"
            aria-label={label}
            className="h-9 w-9 flex items-center justify-center rounded-full text-slate-700 dark:text-gray-300 bg-white/90 dark:bg-[#060f38]/80 backdrop-blur-sm border border-slate-200 dark:border-gray-700 shadow-sm hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-500/50 dark:hover:border-blue-500/50"
            whileHover={{
                scale: 1.05,
                boxShadow: "0 0 15px rgba(59, 130, 246, 0.3)",
                borderColor: "rgba(59, 130, 246, 0.5)"
            }}
            whileTap={{ scale: 0.95 }}
        >
            {icon}
        </motion.a>
    );
};

// Main Footer component
const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';

    // Scroll to top function
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    return (
        <footer className="relative overflow-hidden">
            {/* Background with geometric elements matching the hero section */}
            <div className="absolute inset-0 -z-10 overflow-hidden">
                {/* Gradient overlay - different for light and dark */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-50/90 to-slate-100 dark:from-[#040d36] dark:via-[#040d36]/30 dark:to-[#040d36]"></div>

                {/* Hex and circular patterns */}
                <div className="absolute bottom-0 left-0 right-0 h-[300px] opacity-30 dark:opacity-15">
                    <svg
                        width="100%"
                        height="100%"
                        viewBox="0 0 1440 300"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        preserveAspectRatio="none"
                    >
                        <path
                            d="M0,100 C240,180 480,120 720,140 C960,160 1200,80 1440,120 L1440,300 L0,300 Z"
                            fill={isDark ? "url(#footer-grad-dark)" : "url(#footer-grad-light)"}
                            opacity="0.5"
                        />
                        <defs>
                            <linearGradient id="footer-grad-dark" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#3B82F6" />
                                <stop offset="40%" stopColor="#DB2777" />
                                <stop offset="60%" stopColor="#F97316" />
                                <stop offset="100%" stopColor="#4F46E5" />
                            </linearGradient>
                            <linearGradient id="footer-grad-light" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#2563EB" />
                                <stop offset="40%" stopColor="#BE185D" />
                                <stop offset="60%" stopColor="#EA580C" />
                                <stop offset="100%" stopColor="#4338CA" />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>

                {/* Animated pulse rings matching hero background */}
                <div className="absolute bottom-[20%] right-[10%] opacity-30 dark:opacity-20">
                    <svg width="300" height="300" viewBox="0 0 300 300">
                        <circle cx="150" cy="150" r="50" fill="none" stroke="#3B82F6" strokeWidth="0.5" className="animate-pulse" style={{ animationDuration: "4s" }} />
                        <circle cx="150" cy="150" r="80" fill="none" stroke="#DB2777" strokeWidth="0.3" className="animate-pulse" style={{ animationDuration: "6s", animationDelay: "1s" }} />
                        <circle cx="150" cy="150" r="110" fill="none" stroke="#F97316" strokeWidth="0.2" className="animate-pulse" style={{ animationDuration: "8s", animationDelay: "2s" }} />
                    </svg>
                </div>

                {/* Data connection lines */}
                <div className="absolute bottom-[30%] left-[15%] opacity-30 dark:opacity-20">
                    <svg width="400" height="400" viewBox="0 0 400 400">
                        <path
                            d="M100,200 C150,220 250,180 300,200"
                            fill="none"
                            stroke="#3B82F6"
                            strokeWidth="1"
                            strokeDasharray="1,10"
                        />
                        <path
                            d="M300,150 C250,170 150,130 100,150"
                            fill="none"
                            stroke="#F97316"
                            strokeWidth="1"
                            strokeDasharray="1,10"
                        />
                        <circle cx="100" cy="200" r="3" fill="#3B82F6" />
                        <circle cx="300" cy="200" r="3" fill="#3B82F6" />
                        <circle cx="300" cy="150" r="3" fill="#DB2777" />
                        <circle cx="100" cy="150" r="3" fill="#F97316" />
                        <circle cx="200" cy="180" r="4" fill="#4F46E5" />
                    </svg>
                </div>
            </div>

            {/* Main footer content */}
            <div className="relative border-t border-slate-200 dark:border-gray-800 pt-12 pb-8">
                <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col space-y-10 md:space-y-0 md:flex-row md:justify-between">
                        {/* Brand column */}
                        <div className="flex-shrink-0 max-w-xs">
                            <MetaPilotLogo className="text-slate-900 dark:text-white" />

                            <p className="mt-4 text-sm text-slate-700 dark:text-gray-400">
                                Automate your DAO voting, reward claiming, and token purchases with AI-powered Web3 automation, saving time and never missing opportunities.
                            </p>

                            <div className="mt-6 flex space-x-3">
                                <SocialIcon
                                    href="https://github.com/metapilot"
                                    icon={<Github size={18} />}
                                    label="GitHub"
                                />
                                <SocialIcon
                                    href="https://twitter.com/metapilot"
                                    icon={<Twitter size={18} />}
                                    label="Twitter"
                                />
                                <SocialIcon
                                    href="mailto:hello@metapilot.ai"
                                    icon={<Mail size={18} />}
                                    label="Email"
                                />
                            </div>

                            {/* Newsletter subscription */}
                            <div className="mt-8">
                                <div className="relative bg-white dark:bg-[#060f38] rounded-lg p-px overflow-hidden shadow-md border border-slate-200 dark:border-gray-800">
                                    <motion.div
                                        className="absolute inset-0 rounded-lg opacity-50"
                                        style={{
                                            background: "linear-gradient(90deg, #3B82F6 0%, #DB2777 50%, #F97316 100%)"
                                        }}
                                        animate={{
                                            x: ['-100%', '100%']
                                        }}
                                        transition={{
                                            duration: 8,
                                            repeat: Infinity,
                                            ease: "linear"
                                        }}
                                    />
                                    <div className="relative flex items-center bg-white dark:bg-[#060f38] rounded-lg p-1">
                                        <input
                                            type="email"
                                            placeholder="Your email"
                                            className="flex-1 h-9 px-3 text-sm bg-transparent border-none focus:outline-none focus:ring-0 text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-500"
                                        />
                                        <Button
                                            size="sm"
                                            className="bg-gradient-to-r from-blue-500 via-pink-600 to-orange-700 text-xs text-white hover:shadow-lg hover:shadow-blue-500/20"
                                        >
                                            Subscribe
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* All links in 3 columns */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-12 lg:gap-16">
                            {/* Product links */}
                            <div>
                                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Product</h3>
                                <div className="flex flex-col space-y-0.5">
                                    <FooterLink href="/features" label="Features" />
                                    <FooterLink href="/pricing" label="Pricing" />
                                    <FooterLink href="/dashboard" label="Dashboard" />
                                    <FooterLink href="/tasks" label="Task Types" />
                                    <FooterLink href="/roadmap" label="Roadmap" />
                                </div>
                            </div>

                            {/* Resources links */}
                            <div>
                                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Resources</h3>
                                <div className="flex flex-col space-y-0.5">
                                    <FooterLink href="/docs" label="Documentation" />
                                    <FooterLink href="/api" label="API Reference" />
                                    <FooterLink href="/blog" label="Blog" />
                                    <FooterLink href="/tutorials" label="Tutorials" />
                                    <FooterLink href="/community" label="Community" />
                                </div>
                            </div>

                            {/* Company links */}
                            <div>
                                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Company</h3>
                                <div className="flex flex-col space-y-0.5">
                                    <FooterLink href="/about" label="About Us" />
                                    <FooterLink href="/careers" label="Careers" />
                                    <FooterLink href="/contact" label="Contact" />
                                    <FooterLink href="/privacy" label="Privacy Policy" />
                                    <FooterLink href="/terms" label="Terms of Service" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom bar */}
                    <div className="mt-10 pt-6 border-t border-slate-200 dark:border-gray-800 flex flex-col sm:flex-row justify-between items-center">
                        <p className="text-sm text-slate-500 dark:text-gray-500 mb-4 sm:mb-0">
                            &copy; {currentYear} MetaPilot. All rights reserved.
                        </p>

                        <motion.button
                            onClick={scrollToTop}
                            className="flex items-center justify-center h-9 w-9 rounded-full bg-white dark:bg-[#060f38] border border-slate-200 dark:border-gray-700 text-slate-600 dark:text-gray-400 shadow-sm hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-500/50 transition-colors"
                            whileHover={{ y: -3, boxShadow: "0 10px 15px -3px rgba(59, 130, 246, 0.2)" }}
                            whileTap={{ y: 0 }}
                        >
                            <ArrowUp size={16} />
                        </motion.button>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

