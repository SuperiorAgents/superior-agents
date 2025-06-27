"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Check,
    PieChart,
    Wallet,
    TrendingUp,
    RefreshCw,
    Hourglass,
    ShieldCheck,
    Clock,
    ArrowRight
} from "lucide-react";

type TaskDemo = "voting" | "rewards" | "trading";

interface TaskConfig {
    id: TaskDemo;
    icon: React.ReactNode;
    name: string;
    title: string;
    description: string;
    primaryColor: string;
    secondaryColor: string;
    glowColor: string;
    action: string;
    configs: Array<{ label: string; value: string; }>;
    success: string;
    gradient: string;
}

const TaskDemo: React.FC = () => {
    const [currentTask, setCurrentTask] = useState<number>(0);
    const [demoState, setDemoState] = useState<"idle" | "processing" | "success">("idle");
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const tasks: TaskConfig[] = [
        {
            id: "voting",
            icon: <PieChart className="h-5 w-5" />,
            name: "DAO Voting",
            title: "Vote on Nouns DAO Proposal #137",
            description: "Vote on proposals automatically based on your criteria",
            primaryColor: "text-blue-400",
            secondaryColor: "text-blue-500",
            glowColor: "shadow-blue-500/20",
            action: "Voting YES on proposal",
            configs: [
                { label: "DAO", value: "Nouns DAO" },
                { label: "Rule", value: "Vote YES if proposal mentions rewards" },
                { label: "Detected keywords", value: "rewards, distribution, holders" }
            ],
            success: "Successfully voted YES on Proposal #137",
            gradient: "from-blue-500 to-blue-600"
        },
        {
            id: "rewards",
            icon: <Wallet className="h-5 w-5" />,
            name: "Claim Rewards",
            title: "Claim Compound Finance Rewards",
            description: "Automatically claim rewards when they reach your threshold",
            primaryColor: "text-orange-400",
            secondaryColor: "text-orange-500",
            glowColor: "shadow-orange-500/20",
            action: "Claiming 12.4 COMP rewards",
            configs: [
                { label: "Platform", value: "Compound Finance" },
                { label: "Token", value: "COMP" },
                { label: "Threshold", value: "10 COMP" },
                { label: "Current Rewards", value: "12.4 COMP" }
            ],
            success: "Successfully claimed 12.4 COMP tokens",
            gradient: "from-orange-500 to-orange-600"
        },
        {
            id: "trading",
            icon: <TrendingUp className="h-5 w-5" />,
            name: "Auto Trading",
            title: "Buy ETH when price increases by 5%",
            description: "Execute trades automatically when price conditions are met",
            primaryColor: "text-pink-400",
            secondaryColor: "text-pink-500",
            glowColor: "shadow-pink-500/20",
            action: "Buying 0.5 ETH at $4,127",
            configs: [
                { label: "Token", value: "ETH" },
                { label: "Action", value: "Buy 0.5 ETH" },
                { label: "Condition", value: "When price increases by 5%" },
                { label: "Current change", value: "+5.2% (condition met)" }
            ],
            success: "Successfully purchased 0.5 ETH",
            gradient: "from-pink-500 to-pink-600"
        }
    ];

    // Auto-cycling demo
    useEffect(() => {
        const startDemo = () => {
            setDemoState("processing");

            timeoutRef.current = setTimeout(() => {
                setDemoState("success");

                timeoutRef.current = setTimeout(() => {
                    setDemoState("idle");
                    setCurrentTask((prev) => (prev + 1) % tasks.length);

                    timeoutRef.current = setTimeout(startDemo, 1500);
                }, 3000);
            }, 3000);
        };

        // Start the demo cycle with a longer initial delay
        timeoutRef.current = setTimeout(startDemo, 2000);

        // Clean up on unmount
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [currentTask, tasks.length]);

    const task = tasks[currentTask];

    // Background elements rotation animation
    const backgroundPatterns = [
        {
            style: {
                top: '10%',
                left: '15%',
                width: '150px',
                height: '150px',
                opacity: 0.03,
                border: '1px solid',
                transform: 'rotate(15deg)',
                borderRadius: '24px'
            },
            color: task.id === "voting" ? "border-blue-400" : task.id === "rewards" ? "border-orange-400" : "border-pink-400"
        },
        {
            style: {
                bottom: '15%',
                right: '10%',
                width: '180px',
                height: '180px',
                opacity: 0.02,
                border: '1px solid',
                transform: 'rotate(-10deg)',
                borderRadius: '50%'
            },
            color: task.id === "voting" ? "border-blue-400" : task.id === "rewards" ? "border-orange-400" : "border-pink-400"
        }
    ];

    return (
        <div className={`bg-[#060f38] rounded-xl shadow-xl overflow-hidden border border-gray-700 relative ${task.glowColor}`}>
            {/* Background patterns */}
            {backgroundPatterns.map((pattern, index) => (
                <motion.div
                    key={index}
                    className={`absolute ${pattern.color} pointer-events-none`}
                    style={pattern.style}
                    animate={{
                        rotate: pattern.style.transform === 'rotate(15deg)' ? [15, 20, 15] : [-10, -15, -10]
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
            ))}

            {/* Header */}
            <div className="p-4 border-b border-gray-700/50 backdrop-blur-sm bg-[#081342]/70">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full bg-[#0c1d5e] flex items-center justify-center mr-3 ${task.primaryColor}`}>
                            {task.id === "voting" ?
                                <PieChart className="h-4 w-4" /> :
                                task.id === "rewards" ?
                                    <Wallet className="h-4 w-4" /> :
                                    <TrendingUp className="h-4 w-4" />
                            }
                        </div>
                        <h3 className="text-lg font-semibold text-white">MetaPilot Dashboard</h3>
                    </div>
                    <div className="flex items-center space-x-2">
                        <motion.span
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/30 text-green-400 border border-green-700/30"
                            animate={{
                                boxShadow: ['0 0 0 rgba(34, 197, 94, 0)', '0 0 8px rgba(34, 197, 94, 0.3)', '0 0 0 rgba(34, 197, 94, 0)']
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity
                            }}
                        >
                            <span className="w-2 h-2 rounded-full bg-green-400 mr-1"></span>
                            Active
                        </motion.span>
                    </div>
                </div>
            </div>

            <div className="p-4">
                {/* Task type selector */}
                <div className="flex justify-around mb-5 pb-4 border-b border-gray-700/40">
                    {tasks.map((t, idx) => (
                        <div
                            key={t.id}
                            className={`relative flex flex-col items-center px-3 py-1.5 rounded-lg transition-all duration-300 ${idx === currentTask
                                ? `${t.primaryColor} bg-[#0d1a54] border border-gray-700/50`
                                : 'text-gray-400 hover:text-gray-300'
                                }`}
                        >
                            <div className="mb-1">
                                {t.icon}
                            </div>
                            <span className="text-xs font-medium">{t.name}</span>
                            {idx === currentTask && (
                                <motion.div
                                    layoutId="activeIndicator"
                                    className={`absolute -bottom-4 w-8 h-0.5 rounded-full bg-gradient-to-r ${t.gradient}`}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.3 }}
                                />
                            )}
                        </div>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {demoState === "idle" && (
                        <motion.div
                            key="idle"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                            className={`rounded-xl p-4 border border-gray-700/50 bg-gradient-to-b from-[#0c1e5c] to-[#081342] shadow-lg`}
                        >
                            <div className="flex items-start">
                                <div className={`w-10 h-10 rounded-full bg-[#0d1a54] border border-gray-700/50 flex items-center justify-center mr-3 ${task.primaryColor}`}>
                                    {task.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className={`font-medium ${task.primaryColor} mb-0.5 text-base`}>
                                        {task.title}
                                    </h4>
                                    <p className="text-xs text-gray-300 mb-2">
                                        {task.description}
                                    </p>

                                    <div className="grid grid-cols-2 gap-x-3 gap-y-2 p-3 mb-3 rounded-lg bg-[#0a1747] border border-gray-700/40">
                                        {task.configs.map((config, i) => (
                                            <div key={i} className="flex flex-col">
                                                <span className="text-xs text-gray-400">{config.label}</span>
                                                <span className="text-xs text-white font-medium truncate">{config.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-xs text-gray-400 mb-2 px-1">
                                <span>Task Readiness</span>
                                <span className={task.secondaryColor}>Conditions Met</span>
                            </div>

                            <div className="w-full h-1.5 rounded-full bg-gray-800 overflow-hidden mb-3">
                                <motion.div
                                    className={`h-full bg-gradient-to-r ${task.gradient}`}
                                    initial={{ width: 0 }}
                                    animate={{ width: "100%" }}
                                    transition={{ duration: 1.2 }}
                                />
                            </div>

                            <motion.div
                                className="w-full py-2 flex justify-center items-center rounded-lg bg-opacity-10 text-xs bg-gray-700"
                                animate={{
                                    opacity: [0.7, 1, 0.7]
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity
                                }}
                            >
                                <ArrowRight className={`h-3.5 w-3.5 mr-1.5 ${task.primaryColor}`} />
                                <span className="text-gray-300">Ready to execute automatically</span>
                            </motion.div>
                        </motion.div>
                    )}

                    {demoState === "processing" && (
                        <motion.div
                            key="processing"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                            className="rounded-xl p-4 border border-gray-700/50 bg-gradient-to-b from-[#0c1e5c] to-[#081342] shadow-lg"
                        >
                            <div className="flex items-start mb-3">
                                <div className="relative w-10 h-10 rounded-full bg-[#0d1a54] border border-gray-700/50 flex items-center justify-center mr-3">
                                    <motion.div
                                        className="absolute inset-0 rounded-full border-2 border-transparent"
                                        style={{
                                            borderTopColor: task.id === "voting" ? "#60A5FA" : task.id === "rewards" ? "#FB923C" : "#F472B6"
                                        }}
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                    />
                                    <Hourglass className={`h-4 w-4 ${task.primaryColor}`} />
                                </div>
                                <div>
                                    <h4 className={`font-medium ${task.primaryColor} mb-0.5 text-base`}>
                                        Processing Task
                                    </h4>
                                    <p className="text-xs text-gray-300">
                                        {task.action}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2 p-3 rounded-lg bg-[#0a1747] border border-gray-700/40 mb-3">
                                <div className="flex justify-between items-center mb-1.5">
                                    <span className="text-xs text-gray-400">Transaction Status:</span>
                                    <motion.div
                                        className="flex items-center"
                                        animate={{
                                            opacity: [1, 0.7, 1]
                                        }}
                                        transition={{
                                            duration: 1.5,
                                            repeat: Infinity
                                        }}
                                    >
                                        <div className="h-1.5 w-1.5 rounded-full bg-yellow-400 mr-1"></div>
                                        <span className="text-xs text-yellow-400">Pending</span>
                                    </motion.div>
                                </div>

                                <div className="flex items-center space-x-2 py-1.5 px-3 rounded-md bg-[#0c1d5e] border border-gray-700/40">
                                    <RefreshCw className={`h-4 w-4 ${task.primaryColor} animate-spin`} />
                                    <span className="text-xs text-gray-300">MetaPilot AI is executing this task...</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center text-xs text-gray-400">
                                    <ShieldCheck className="h-3 w-3 mr-1" />
                                    <span>Secured by session keys</span>
                                </div>

                                <div className="flex items-center text-xs text-gray-400">
                                    <Clock className="h-3 w-3 mr-1" />
                                    <span>Estimated time: 15s</span>
                                </div>
                            </div>

                            <div className="relative w-full h-1.5 rounded-full bg-gray-800 overflow-hidden">
                                <motion.div
                                    className={`h-full bg-gradient-to-r ${task.gradient}`}
                                    initial={{ width: "20%" }}
                                    animate={{ width: "70%" }}
                                    transition={{ duration: 2.5, ease: "easeInOut" }}
                                />

                                {/* Animated glow effect */}
                                <motion.div
                                    className="absolute top-0 h-full w-20 bg-white opacity-30 blur-md"
                                    animate={{
                                        left: ["-10%", "100%"]
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                />
                            </div>
                        </motion.div>
                    )}

                    {demoState === "success" && (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                            className="rounded-xl p-4 border border-gray-700/50 bg-gradient-to-b from-[#0c1e5c] to-[#081342] shadow-lg"
                        >
                            <div className="flex items-start mb-3">
                                <motion.div
                                    className="w-10 h-10 rounded-full bg-green-900/30 border border-green-700/50 flex items-center justify-center mr-3 text-green-400"
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{
                                        scale: 1,
                                        opacity: 1,
                                        boxShadow: ['0 0 0 rgba(74, 222, 128, 0)', '0 0 10px rgba(74, 222, 128, 0.3)', '0 0 0 rgba(74, 222, 128, 0)']
                                    }}
                                    transition={{
                                        duration: 0.3,
                                        boxShadow: {
                                            duration: 2,
                                            repeat: Infinity
                                        }
                                    }}
                                >
                                    <Check className="h-5 w-5" />
                                </motion.div>
                                <div>
                                    <motion.h4
                                        className="font-medium text-green-400 mb-0.5 text-base"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.3, delay: 0.1 }}
                                    >
                                        Task Completed
                                    </motion.h4>
                                    <motion.p
                                        className="text-xs text-gray-300"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.3, delay: 0.2 }}
                                    >
                                        {task.success}
                                    </motion.p>
                                </div>
                            </div>

                            <motion.div
                                className="px-3 py-3 rounded-lg bg-[#0a1747] border border-gray-700/40 mb-2"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: 0.3 }}
                            >
                                <div className="flex flex-wrap justify-between">
                                    <div className="flex items-center mb-2 w-full sm:w-auto">
                                        <div className="w-6 h-6 rounded-full bg-[#0c1d5e] border border-gray-700/50 flex items-center justify-center mr-2">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M7.5 3.5C5.5 4.5 4 6.8 4 9.5C4 14.5 9 18 12 20C15 18 20 14.5 20 9.5C20 6.8 18.5 4.5 16.5 3.5" stroke={task.id === "voting" ? "#60A5FA" : task.id === "rewards" ? "#FB923C" : "#F472B6"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                <path d="M12 8V13" stroke={task.id === "voting" ? "#60A5FA" : task.id === "rewards" ? "#FB923C" : "#F472B6"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                <path d="M15 10.5H9" stroke={task.id === "voting" ? "#60A5FA" : task.id === "rewards" ? "#FB923C" : "#F472B6"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-gray-400">Transaction</span>
                                            <span className="text-xs font-mono text-gray-300">0x71c...9e3f</span>
                                        </div>
                                    </div>

                                    <div className="flex space-x-3">
                                        <div className="flex items-center">
                                            <div className="w-6 h-6 rounded-full bg-[#0c1d5e] border border-gray-700/50 flex items-center justify-center mr-2">
                                                <Clock className="h-3 w-3 text-green-400" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-gray-400">Saved</span>
                                                <span className="text-xs text-gray-300">~23 min</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center">
                                            <div className="w-6 h-6 rounded-full bg-[#0c1d5e] border border-gray-700/50 flex items-center justify-center mr-2">
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke={task.id === "voting" ? "#60A5FA" : task.id === "rewards" ? "#FB923C" : "#F472B6"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                    <path d="M15 9.5L12 6.5L9 9.5" stroke={task.id === "voting" ? "#60A5FA" : task.id === "rewards" ? "#FB923C" : "#F472B6"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                    <path d="M12 17.5V9.5" stroke={task.id === "voting" ? "#60A5FA" : task.id === "rewards" ? "#FB923C" : "#F472B6"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-gray-400">Gas</span>
                                                <span className="text-xs text-gray-300">0.0043 ETH</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                className={`w-full h-1.5 rounded-full bg-gradient-to-r ${task.gradient} shadow-lg`}
                                initial={{ width: 0 }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 0.5, delay: 0.4 }}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default TaskDemo;
