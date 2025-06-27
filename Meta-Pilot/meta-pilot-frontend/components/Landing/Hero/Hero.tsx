"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import HeroBackground from "./HeroBackground";
import TaskDemo from "./TaskDemo";
import WalletConnectButton from "@/components/Shared/Wallet/WalletConnectButton";

interface BadgeProps {
    className?: string;
}

const Badge: React.FC<BadgeProps> = ({ className = "" }) => {
    return (
        <motion.div
            className={`inline-flex items-center px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium ${className}`}
            whileHover={{ scale: 1.03 }}
        >
            <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
            Web3 Automation Platform
        </motion.div>
    );
};

const HeroSection: React.FC = () => {
    return (
        <section className="relative w-full bg-[#040d36] overflow-hidden">
            {/* Background */}
            <HeroBackground />

            {/* Main Content */}
            <div className="relative z-10 container mx-auto px-4 sm:px-6 pt-24 pb-24 md:pb-32 md:pt-32 min-h-screen flex items-center">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
                    {/* Left Column - Content */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                        className="lg:col-span-6"
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                        >
                            <Badge className="mb-8" />
                        </motion.div>

                        <motion.h1
                            className="text-4xl md:text-4xl xl:text-5xl font-bold text-white leading-tight mb-8"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                        >
                            Automate Your <span className="text-blue-500">Web3</span> Tasks <span className="text-orange-500">with</span> <span className="text-pink-600">AI</span>
                        </motion.h1>

                        <motion.p
                            className="text-gray-300 text-lg mb-10 max-w-xl leading-relaxed"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.5 }}
                        >
                            MetaPilot uses AI to automate tasks like DAO voting, reward claiming, and token purchasing based on your preferences, saving you time and never missing opportunities.
                        </motion.p>

                        <motion.div
                            className="flex flex-col sm:flex-row gap-5"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.6 }}
                        >
                            <WalletConnectButton buttonClass="p-6 w-full md:w-auto" />

                            <motion.a
                                href="#features"
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                className="inline-flex items-center justify-center py-3 px-8 rounded-full border border-gray-600 text-white hover:border-gray-400 transition-colors"
                            >
                                Learn More <ArrowRight className="ml-2 h-4 w-4" />
                            </motion.a>
                        </motion.div>
                    </motion.div>

                    {/* Right Column - Demo */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.7, delay: 0.7 }}
                        className="lg:col-span-6 w-full mx-auto"
                    >
                        <TaskDemo />
                    </motion.div>
                </div>
            </div>

            {/* Bottom border line */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent opacity-30"></div>
        </section>
    );
};

export default HeroSection;