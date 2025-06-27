"use client"

import React, { useState, useEffect, useRef } from 'react';
import {
    Wallet,
    Brain,
    Zap,
    BarChart3,
    Cog,
    ArrowLeft,
    ArrowRight,
    PauseCircle,
    PlayCircle
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Steps } from './Steps';
import { StepDemo } from './StepDemo';
import { AnimatePresence, motion } from 'framer-motion';

export interface Step {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    details: string;
}

const HowItWorksSection: React.FC = () => {
    const [activeStep, setActiveStep] = useState<number>(0);
    const [isPlaying, setIsPlaying] = useState<boolean>(true);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const steps: Step[] = [
        {
            id: 'connect',
            title: 'Connect Your Wallet',
            description: 'Connect your MetaMask wallet securely through the MetaMask DTK',
            icon: <Wallet className="h-4 w-4" />,
            details: 'Your private keys remain in your control - we only use session keys for specific actions',
        },
        {
            id: 'create',
            title: 'Define Your Tasks',
            description: 'Create tasks for voting, claiming rewards, trading, and more',
            icon: <Cog className="h-4 w-4" />,
            details: 'Set custom rules and conditions using natural language or pre-built templates',
        },
        {
            id: 'monitor',
            title: 'AI Monitoring',
            description: 'Our AI constantly monitors on-chain activity and market conditions',
            icon: <Brain className="h-4 w-4" />,
            details: 'Scanning for DAO proposals, price changes, yield opportunities, and more',
        },
        {
            id: 'execute',
            title: 'Automatic Execution',
            description: 'When conditions are met, MetaPilot executes your predefined tasks',
            icon: <Zap className="h-4 w-4" />,
            details: 'Transactions are executed with optimal gas prices and verified for security',
        },
        {
            id: 'track',
            title: 'Track Performance',
            description: 'View detailed reports and analytics on all your automated activities',
            icon: <BarChart3 className="h-4 w-4" />,
            details: 'Monitor savings, earnings, and optimization metrics in real-time',
        }
    ];

    // Auto-advance steps setup
    useEffect(() => {
        // Clear any existing interval first
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }

        // Set up new interval if playing
        if (isPlaying) {
            intervalRef.current = setInterval(() => {
                setActiveStep((prev) => (prev + 1) % steps.length);
            }, 10000); // 10 seconds per step for better user comprehension
        }

        // Clean up on component unmount
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isPlaying, steps.length]);

    const handleStepClick = (index: number): void => {
        setActiveStep(index);
        setIsPlaying(false);
    };

    const togglePlayback = (): void => {
        setIsPlaying(!isPlaying);
    };

    const goToNextStep = (): void => {
        setActiveStep((prev) => (prev + 1) % steps.length);
        setIsPlaying(false);
    };

    const goToPreviousStep = (): void => {
        setActiveStep((prev) => (prev - 1 + steps.length) % steps.length);
        setIsPlaying(false);
    };

    return (
        <section className="py-16 bg-[#040d36] relative overflow-hidden">
            {/* Sophisticated background elements using brand colors */}
            <div className="absolute inset-0 overflow-hidden">
                {/* Large gradient orbs */}
                <div className="absolute w-[600px] h-[600px] rounded-full bg-gradient-to-r from-[#3B82F6]/10 to-[#4F46E5]/5 blur-3xl -top-[300px] -left-[150px]"></div>
                <div className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-r from-[#6366F1]/10 to-[#2563EB]/5 blur-3xl -bottom-[250px] -right-[100px]"></div>

                {/* Abstract network lines */}
                <svg className="absolute inset-0 w-full h-full opacity-[0.07]" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="networkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#3B82F6" />
                            <stop offset="50%" stopColor="#6366F1" />
                            <stop offset="100%" stopColor="#4F46E5" />
                        </linearGradient>
                    </defs>
                    <g stroke="url(#networkGradient)" strokeWidth="0.5" fill="none">
                        <path d="M0,50 Q150,150 300,100 T600,150 T900,100" />
                        <path d="M0,150 Q200,250 400,200 T700,250 T1000,200" />
                        <path d="M100,0 Q200,100 150,200 T250,300 T150,400" />
                        <path d="M300,0 Q400,150 350,250 T450,350 T350,450" />
                        <path d="M500,0 Q600,100 550,200 T650,300 T550,400" />
                        <path d="M700,0 Q800,150 750,250 T850,350 T750,450" />
                        <path d="M900,0 Q1000,100 950,200 T1050,300 T950,400" />
                    </g>
                    <g fill="#6366F1">
                        <circle cx="300" cy="100" r="2" opacity="0.8" />
                        <circle cx="600" cy="150" r="2" opacity="0.6" />
                        <circle cx="400" cy="200" r="2" opacity="0.8" />
                        <circle cx="700" cy="250" r="2" opacity="0.6" />
                        <circle cx="150" cy="200" r="2" opacity="0.7" />
                        <circle cx="250" cy="300" r="2" opacity="0.7" />
                        <circle cx="350" cy="250" r="2" opacity="0.7" />
                        <circle cx="450" cy="350" r="2" opacity="0.5" />
                        <circle cx="550" cy="200" r="2" opacity="0.8" />
                        <circle cx="650" cy="300" r="2" opacity="0.6" />
                        <circle cx="750" cy="250" r="2" opacity="0.7" />
                        <circle cx="850" cy="350" r="2" opacity="0.5" />
                        <circle cx="950" cy="200" r="2" opacity="0.8" />
                    </g>
                </svg>

                {/* Subtle dot pattern */}
                <div className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: 'radial-gradient(#FFFFFF 1px, transparent 1px)',
                        backgroundSize: '30px 30px'
                    }}>
                </div>
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-12">
                    <h2 className="text-3xl font-bold mb-4 text-white">
                        How <span className="text-[#3B82F6]">MetaPilot</span> Works
                    </h2>
                    <p className="text-[#9CA3AF] text-lg">
                        Set up once, automate forever. See how MetaPilot handles your Web3 tasks.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 max-w-6xl mx-auto">
                    {/* Steps sidebar - Left side */}
                    <div className="lg:col-span-4 xl:col-span-4 flex flex-col">
                        <Card className="h-full border-slate-700/20 bg-white/[0.03] backdrop-blur-sm">
                            <CardContent className="pt-6 pb-4">
                                <Steps
                                    steps={steps}
                                    activeStep={activeStep}
                                    handleStepClick={handleStepClick}
                                />

                                <div className="flex justify-between items-center mt-5 pt-4 border-t border-slate-700/20">
                                    <Button
                                        onClick={togglePlayback}
                                        variant="ghost"
                                        size="sm"
                                        className="text-sm text-[#9CA3AF] flex items-center hover:text-[#3B82F6]"
                                    >
                                        {isPlaying ? (
                                            <>
                                                <PauseCircle className="h-4 w-4 mr-1.5" />
                                                Pause Demo
                                            </>
                                        ) : (
                                            <>
                                                <PlayCircle className="h-4 w-4 mr-1.5" />
                                                Auto-play
                                            </>
                                        )}
                                    </Button>

                                    <div className="flex space-x-1.5">
                                        {steps.map((_, index) => (
                                            <button
                                                key={index}
                                                onClick={() => handleStepClick(index)}
                                                className={`w-2 h-2 rounded-full transition-all ${activeStep === index
                                                    ? 'bg-[#3B82F6]'
                                                    : 'bg-[#374151] hover:bg-[#6366F1]'
                                                    }`}
                                                aria-label={`Go to step ${index + 1}`}
                                            ></button>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Animated demo - Right side */}
                    <div className="lg:col-span-8 xl:col-span-8">
                        <Card className="shadow-sm border-slate-700/20 bg-white/[0.03] backdrop-blur-sm overflow-hidden">
                            <CardHeader className="pb-3 border-b border-slate-700/20">
                                <div className="flex items-start">
                                    <div className="p-2 rounded-lg bg-[#1F2937]/50">
                                        <div className="p-1 rounded-md bg-[#3B82F6] text-white">
                                            {steps[activeStep].icon}
                                        </div>
                                    </div>
                                    <div className="ml-3">
                                        <CardTitle className="text-xl text-white">
                                            {steps[activeStep].title}
                                        </CardTitle>
                                        <CardDescription className="text-[#9CA3AF] mt-1">
                                            {steps[activeStep].description}
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="p-4">
                                {/* Demo area */}
                                <div className="bg-[#060f3d] rounded-md p-4 h-80 md:h-96 lg:h-[420px] relative overflow-hidden border border-slate-700/20">
                                    {/* Demo content with animated transitions */}
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={activeStep}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ duration: 0.4 }}
                                            className="h-full"
                                        >
                                            <StepDemo activeStep={activeStep} />
                                        </motion.div>
                                    </AnimatePresence>

                                    {/* Step info tooltip */}
                                    <div className="absolute bottom-4 left-4 right-4 bg-[#081142]/95 p-3 rounded-md border border-slate-700/30 shadow-lg">
                                        <p className="text-sm text-[#9CA3AF]">
                                            <span className="font-medium text-white">Pro Tip:</span> {steps[activeStep].details}
                                        </p>
                                    </div>
                                </div>

                                {/* Step progress */}
                                <div className="flex justify-between items-center mt-4">
                                    <div className="text-sm text-[#9CA3AF]">
                                        Step {activeStep + 1} of {steps.length}
                                    </div>

                                    <div className="flex space-x-2">
                                        <Button
                                            onClick={goToPreviousStep}
                                            variant="outline"
                                            size="sm"
                                            className="border-slate-700/30 text-[#9CA3AF] hover:text-white hover:bg-slate-800/50 h-9 px-3"
                                        >
                                            <ArrowLeft className="h-4 w-4 mr-1" />
                                            Previous
                                        </Button>
                                        <Button
                                            onClick={goToNextStep}
                                            size="sm"
                                            className="bg-[#3B82F6] hover:bg-[#2563EB] text-white border-none h-9 px-3"
                                        >
                                            Next
                                            <ArrowRight className="h-4 w-4 ml-1" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HowItWorksSection;