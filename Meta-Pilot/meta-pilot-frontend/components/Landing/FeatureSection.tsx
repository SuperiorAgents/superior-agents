"use client"

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, Vote, Landmark, Coins, TrendingUp, Sparkles, Zap } from 'lucide-react';

// Define TypeScript interfaces
interface Benefit {
    text: string;
}

interface Feature {
    id: string;
    title: string;
    icon: React.ReactNode;
    description: string;
    benefits: string[];
}

const FeatureSection: React.FC = () => {
    const [activeTab, setActiveTab] = useState<string>('governance');
    const [userInteracted, setUserInteracted] = useState<boolean>(false);
    const autoRotateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const autoRotateDelayMs = 20000; //  seconds

    const features: Feature[] = [
        {
            id: 'governance',
            title: 'DAO Governance',
            icon: <Vote size={24} />,
            description: 'Automatically analyze and vote on DAO proposals based on your preferences and rules.',
            benefits: [
                'Vote intelligently using AI pattern recognition',
                'Never miss important governance decisions',
                'Set simple rules like "Vote YES if proposal mentions rewards"',
                'Stay involved across multiple DAOs effortlessly'
            ]
        },
        {
            id: 'rewards',
            title: 'Claim Rewards',
            icon: <Sparkles size={24} />,
            description: 'Automatically claim staking rewards, airdrops, and yield farming returns at optimal times.',
            benefits: [
                'Auto-harvest at gas-efficient times',
                'Claim across multiple protocols',
                'Reinvest rewards automatically',
                'Optimize claiming frequency based on reward size'
            ]
        },
        {
            id: 'trading',
            title: 'Token Trading',
            icon: <TrendingUp size={24} />,
            description: 'Buy or sell tokens based on price conditions, automating your trading strategy.',
            benefits: [
                'Execute trades when price targets are met',
                'Create complex conditional orders',
                'Implement dollar-cost averaging strategies',
                'Capture cross-exchange arbitrage opportunities'
            ]
        },
        {
            id: 'yield',
            title: 'Yield Optimization',
            icon: <Coins size={24} />,
            description: 'Move your assets to the highest-yielding platforms automatically as rates change.',
            benefits: [
                'Maximize stablecoin yields across protocols',
                'Balance risk vs. return in your selections',
                'Factor in gas costs for optimal moves',
                'Compare real APY across lending platforms'
            ]
        },
        {
            id: 'liquidity',
            title: 'Liquidity Management',
            icon: <Landmark size={24} />,
            description: 'Manage liquidity positions, add or remove based on market conditions and yields.',
            benefits: [
                'Auto-adjust concentrated liquidity ranges',
                'Rebalance when impermanent loss risk changes',
                'Add liquidity at strategic price points',
                'Move between pools to maximize fees'
            ]
        },
        {
            id: 'gas',
            title: 'Gas Optimization',
            icon: <Zap size={24} />,
            description: 'Execute transactions at optimal gas prices, saving fees without sacrificing speed.',
            benefits: [
                'Schedule transactions during low gas periods',
                'Prioritize time-sensitive operations',
                'Bundle multiple actions to save fees',
                'Adaptive gas strategies based on network conditions'
            ]
        }
    ];

    // Setup auto-rotation
    useEffect(() => {
        // Function to handle rotation to the next tab
        const rotateToNextTab = () => {
            // If user has manually interacted, don't auto-rotate
            if (userInteracted) {
                // Reset the flag after some time
                const resetTimer = setTimeout(() => {
                    setUserInteracted(false);
                }, autoRotateDelayMs * 2); // Reset after double the normal rotation time

                return () => clearTimeout(resetTimer);
            }

            // Find current index
            const currentIndex = features.findIndex(f => f.id === activeTab);
            const nextIndex = (currentIndex + 1) % features.length;

            // Move to next tab
            setActiveTab(features[nextIndex].id);
        };

        // Set up a rotation timer
        autoRotateTimeoutRef.current = setTimeout(rotateToNextTab, autoRotateDelayMs);

        // Cleanup on unmount or when activeTab changes
        return () => {
            if (autoRotateTimeoutRef.current) {
                clearTimeout(autoRotateTimeoutRef.current);
            }
        };
    }, [activeTab, userInteracted, features]);

    // Handle manual tab changes
    const handleTabChange = (tabId: string) => {
        // Clear any existing timeout
        if (autoRotateTimeoutRef.current) {
            clearTimeout(autoRotateTimeoutRef.current);
        }

        // Set the user interaction flag
        setUserInteracted(true);

        // Change the tab
        setActiveTab(tabId);
    };

    const activeFeature = features.find(f => f.id === activeTab) || features[0];

    // Animation type definitions
    type MotionVariants = {
        [key: string]: {
            [key: string]: any;
        };
    };

    // Motion variants for animations
    const itemVariants: MotionVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: 'spring',
                stiffness: 100,
                damping: 15
            }
        }
    };

    return (
        <section id='features' className="py-12 relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 dark:from-[#050e2d] dark:to-[#071236]">
            {/* Background Elements - Unchanged */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                {/* Gradient blobs */}
                <div className="absolute -left-40 -top-40 w-80 h-80 rounded-full bg-blue-500/5 dark:bg-blue-500/10 blur-3xl"></div>
                <div className="absolute -right-20 top-1/3 w-96 h-96 rounded-full bg-pink-600/5 dark:bg-pink-600/10 blur-3xl"></div>
                <div className="absolute bottom-0 left-1/3 w-80 h-80 rounded-full bg-orange-500/5 dark:bg-orange-500/10 blur-3xl"></div>
            </div>

            <div className="container mx-auto px-4 relative z-10">
                {/* Section Header - More compact */}
                <div className="text-center max-w-3xl mx-auto mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold mb-3 bg-gradient-to-r from-blue-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
                        AI-Powered Web3 Automation
                    </h2>
                    <p className="text-slate-700 dark:text-slate-300 text-base">
                        Set up your automated tasks once, and let MetaPilot handle the rest. Save time and never miss an opportunity.
                    </p>
                </div>

                {/* Features Navigation - More compact */}
                <div className="flex flex-wrap justify-center gap-1 mb-8">
                    {features.map((feature, index) => (
                        <motion.button
                            key={feature.id}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleTabChange(feature.id)}
                            className={`flex items-center px-3 py-2 rounded-full border transition-all text-sm ${activeTab === feature.id
                                ? 'bg-gradient-to-r from-blue-500/10 via-pink-600/10 to-orange-500/10 border-blue-500/30 dark:border-blue-500/40 shadow-sm'
                                : 'bg-white/80 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:bg-gradient-to-r hover:from-blue-500/5 hover:via-pink-600/5 hover:to-orange-500/5'
                                }`}
                        >
                            <span className={`mr-1.5 ${activeTab === feature.id
                                ? 'text-blue-600 dark:text-blue-400'
                                : 'text-slate-600 dark:text-slate-400'
                                }`}>
                                {feature.icon}
                            </span>
                            <span className={`font-medium ${activeTab === feature.id
                                ? 'text-slate-900 dark:text-white'
                                : 'text-slate-700 dark:text-slate-300'
                                }`}>
                                {feature.title}
                            </span>
                        </motion.button>
                    ))}
                </div>

                {/* Feature Content with AnimatePresence for smoother transitions */}
                {/* <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{
                            type: 'spring',
                            stiffness: 300,
                            damping: 30
                        }}
                        className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-5"
                    > */}
                <AnimatePresence initial={false}>
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20, position: 'absolute', width: '100%', top: 0, left: 0 }}
                        transition={{
                            opacity: { duration: 0.4, ease: 'easeInOut' },
                            x: { duration: 0.4, ease: 'easeInOut' }
                        }}
                        className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-5"
                    >
                        {/* Feature Illustration - More compact */}
                        <div className="lg:col-span-2 hidden md:flex items-center justify-center">
                            <div className="rounded-lg bg-white dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 p-5 w-full h-64 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/30 backdrop-blur-sm">
                                <div className="relative w-full h-full flex items-center justify-center">
                                    {/* Feature illustration placeholder */}
                                    <div className="absolute inset-0 rounded-md overflow-hidden">
                                        <div className="w-full h-full bg-gradient-to-br from-blue-500/5 via-pink-600/5 to-orange-500/5 dark:from-blue-500/10 dark:via-pink-600/10 dark:to-orange-500/10 flex items-center justify-center">
                                            <span className="text-6xl text-blue-500/30 dark:text-blue-400/40">
                                                {activeFeature.icon}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Dynamic feature illustration */}
                                    <motion.div
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ type: 'spring', stiffness: 100, damping: 15 }}
                                        className="absolute inset-0 flex items-center justify-center"
                                    >
                                        <div className="w-44 h-44 relative">
                                            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/20 via-pink-600/20 to-orange-500/20 dark:from-blue-500/30 dark:via-pink-600/30 dark:to-orange-500/30 animate-pulse" style={{ animationDuration: '3s' }}></div>
                                            <div className="absolute inset-4 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center">
                                                <span className="text-5xl text-blue-600 dark:text-blue-400">
                                                    {activeFeature.icon}
                                                </span>
                                            </div>
                                        </div>
                                    </motion.div>
                                </div>
                            </div>
                        </div>

                        {/* Feature Details - More compact */}
                        <div className="lg:col-span-3 flex flex-col">
                            <div className="h-full rounded-lg bg-white/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 p-5 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/30 backdrop-blur-sm flex flex-col">
                                <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white flex items-center">
                                    <span className="mr-2 text-blue-600 dark:text-blue-400">
                                        {activeFeature.icon}
                                    </span>
                                    {activeFeature.title}
                                </h3>

                                <p className="text-slate-700 dark:text-slate-300 mb-4 text-base">
                                    {activeFeature.description}
                                </p>

                                <h4 className="font-semibold text-slate-900 dark:text-white mb-3">Key Benefits:</h4>

                                <div className="space-y-2 mt-auto">
                                    {activeFeature.benefits.map((benefit, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.1 + (index * 0.08) }}
                                            className="flex items-start"
                                        >
                                            <div className="flex-shrink-0 mt-1">
                                                <div className="w-4 h-4 rounded-full bg-gradient-to-r from-blue-500 via-pink-600 to-orange-500 flex items-center justify-center">
                                                    <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                                                    </svg>
                                                </div>
                                            </div>
                                            <p className="ml-2.5 text-slate-700 dark:text-slate-300 text-sm">{benefit}</p>
                                        </motion.div>
                                    ))}
                                </div>

                                <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-700/60">
                                    <a href="#" className="inline-flex items-center text-blue-600 dark:text-blue-400 font-medium hover:text-blue-700 dark:hover:text-blue-300 group text-sm">
                                        Learn how to set up {activeFeature.title}
                                        <svg className="w-4 h-4 ml-1.5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                                        </svg>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Progress indicator - Professional and subtle */}
                <div className="mt-6 flex justify-center">
                    <div className="flex space-x-2">
                        {features.map((feature, index) => (
                            <button
                                key={index}
                                onClick={() => handleTabChange(feature.id)}
                                className="focus:outline-none"
                                aria-label={`Switch to ${feature.title}`}
                            >
                                <div className="flex flex-col items-center">
                                    <div
                                        className={`w-6 h-1.5 rounded-full transition-all duration-300 ${activeTab === feature.id
                                            ? 'bg-gradient-to-r from-blue-500 via-pink-600 to-orange-600'
                                            : 'bg-slate-300 dark:bg-slate-700'
                                            }`}
                                    >
                                        {activeTab === feature.id && (
                                            <motion.div
                                                className="h-full bg-white/0 rounded-full"
                                                initial={{ width: '100%' }}
                                                animate={{ width: '0%' }}
                                                transition={{
                                                    duration: autoRotateDelayMs / 1000,
                                                    ease: 'linear'
                                                }}
                                            />
                                        )}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Call to Action - More compact */}
                <div className="mt-8 text-center">
                    <motion.a
                        href="#create-task"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}
                        className="inline-flex items-center px-6 py-2.5 rounded-full bg-gradient-to-r from-blue-600 via-pink-600 to-orange-600 text-white font-medium text-base shadow-lg hover:shadow-xl transition-all"
                    >
                        <Wallet className="mr-2 h-4 w-4" />
                        Create Your First Task
                    </motion.a>
                </div>
            </div>
        </section>
    );
};

export default FeatureSection;
