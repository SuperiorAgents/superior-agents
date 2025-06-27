import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Vote, Sparkles, TrendingUp, Coins, Landmark, Zap, Brain, ChevronRight, Check } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface TaskType {
    name: string;
    icon: React.ReactNode;
}

export const TaskCreationDemo: React.FC = () => {
    const [stage, setStage] = useState<number>(0);

    useEffect(() => {
        const timer = setTimeout(() => {
            setStage((prev) => (prev + 1) % 5);
        }, 1500);

        return () => clearTimeout(timer);
    }, [stage]);

    const taskTypes: TaskType[] = [
        { name: "DAO Voting", icon: <Vote className="h-5 w-5" /> },
        { name: "Claim Rewards", icon: <Sparkles className="h-5 w-5" /> },
        { name: "Trade Tokens", icon: <TrendingUp className="h-5 w-5" /> },
        { name: "Yield Optimization", icon: <Coins className="h-5 w-5" /> },
        { name: "Liquidity Management", icon: <Landmark className="h-5 w-5" /> },
        { name: "Gas Optimization", icon: <Zap className="h-5 w-5" /> }
    ];

    return (
        <div className="h-full flex items-center justify-center">
            <div className="w-full max-w-md">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-[#081142]/90 rounded-lg shadow-xl border border-slate-700/30 overflow-hidden backdrop-blur-sm"
                >
                    {/* Top header */}
                    <div className="bg-gradient-to-r from-[#3B82F6] to-[#4F46E5] p-4 text-white">
                        <h3 className="font-bold text-lg">Create New Task</h3>
                        <p className="text-sm text-blue-100">Automate your Web3 actions</p>
                    </div>

                    {/* Step indicator */}
                    <div className="flex border-b border-slate-700/30">
                        <div className={`flex-1 text-center py-2 text-xs font-medium ${stage >= 0 ? 'text-[#3B82F6] border-b-2 border-[#3B82F6]' : 'text-[#9CA3AF]'}`}>
                            Select Type
                        </div>
                        <div className={`flex-1 text-center py-2 text-xs font-medium ${stage >= 2 ? 'text-[#3B82F6] border-b-2 border-[#3B82F6]' : 'text-[#9CA3AF]'}`}>
                            Configure
                        </div>
                        <div className={`flex-1 text-center py-2 text-xs font-medium ${stage >= 4 ? 'text-[#3B82F6] border-b-2 border-[#3B82F6]' : 'text-[#9CA3AF]'}`}>
                            Confirm
                        </div>
                    </div>

                    <div className="p-4">
                        {/* Step 1: Select task type */}
                        {stage < 2 && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <p className="text-sm text-[#9CA3AF] mb-3">
                                    Select the type of task you want to automate:
                                </p>

                                <div className="grid grid-cols-2 gap-2">
                                    {taskTypes.map((task, idx) => (
                                        <div
                                            key={idx}
                                            className={`p-3 rounded-lg border cursor-pointer ${stage === 1 && idx === 0
                                                ? 'border-[#3B82F6] bg-[#0c1a54]'
                                                : 'border-slate-700/30 hover:border-[#3B82F6]/60'
                                                }`}
                                        >
                                            <div className="flex flex-col items-center text-center">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 ${stage === 1 && idx === 0
                                                    ? 'bg-[#1a2b6a] text-[#3B82F6]'
                                                    : 'bg-[#0e1a4d] text-[#9CA3AF]'
                                                    }`}>
                                                    {task.icon}
                                                </div>
                                                <span className={`text-sm font-medium ${stage === 1 && idx === 0
                                                    ? 'text-white'
                                                    : 'text-[#9CA3AF]'
                                                    }`}>
                                                    {task.name}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Step 2: Configure task */}
                        {stage >= 2 && stage < 4 && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="space-y-4"
                            >
                                <div>
                                    <Label className="text-sm font-medium text-white">
                                        Select DAO
                                    </Label>
                                    <div className="relative mt-1">
                                        <Select defaultValue="nouns">
                                            <SelectTrigger className="border-slate-700/40 bg-[#0c1a54]">
                                                <SelectValue placeholder="Select a DAO" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-[#0c1a54] border-slate-700/40">
                                                <SelectItem value="nouns">Nouns DAO</SelectItem>
                                                <SelectItem value="compound">Compound DAO</SelectItem>
                                                <SelectItem value="uniswap">Uniswap DAO</SelectItem>
                                                <SelectItem value="ens">ENS DAO</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div>
                                    <Label className="text-sm font-medium text-white">
                                        Define Voting Rule
                                    </Label>
                                    <Textarea
                                        className={`w-full mt-1 bg-[#0c1a54] ${stage === 3
                                            ? 'border-[#3B82F6] ring-1 ring-[#3B82F6]'
                                            : 'border-slate-700/40'
                                            } text-white placeholder:text-[#9CA3AF]`}
                                        placeholder="Vote YES if proposal mentions rewards"
                                        value={stage === 3 ? "Vote YES if proposal mentions rewards or community incentives" : ""}
                                    />

                                    {stage === 3 && (
                                        <div className="flex mt-1">
                                            <Badge variant="secondary" className="bg-[#162254] text-[#6366F1] hover:bg-[#162254]">
                                                <Brain className="h-3 w-3 mr-1" />
                                                AI will analyze proposals using NLP
                                            </Badge>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <div className="flex justify-between">
                                        <Label className="text-sm font-medium text-white">
                                            Advanced Settings
                                        </Label>
                                        <Button variant="link" className="text-[#3B82F6] text-xs p-0 h-auto">
                                            Configure
                                        </Button>
                                    </div>
                                    <div className="p-2.5 mt-1 border border-slate-700/40 rounded-lg bg-[#0c1a54]">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-[#9CA3AF]">Gas settings</span>
                                            <span className="text-white">Auto-optimize</span>
                                        </div>
                                        <div className="flex justify-between text-sm mt-1">
                                            <span className="text-[#9CA3AF]">Notifications</span>
                                            <span className="text-white">Email & In-app</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 3: Confirm */}
                        {stage >= 4 && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="space-y-4"
                            >
                                <div className="bg-[#0e1949] rounded-lg p-3 border border-[#3B82F6]/30">
                                    <div className="flex">
                                        <div className="w-8 h-8 rounded-full bg-[#162254] flex items-center justify-center text-[#3B82F6] shrink-0">
                                            <Vote className="h-4 w-4" />
                                        </div>
                                        <div className="ml-3">
                                            <h4 className="font-medium text-white">DAO Voting Task</h4>
                                            <p className="text-sm text-[#9CA3AF]">Nouns DAO</p>
                                        </div>
                                    </div>

                                    <div className="mt-3 bg-[#0c1a54] rounded-md p-2.5 border border-slate-700/40">
                                        <h5 className="text-sm font-medium text-white">Voting Rule:</h5>
                                        <p className="text-sm text-[#9CA3AF] mt-1">
                                            Vote YES if proposal mentions rewards or community incentives
                                        </p>
                                    </div>

                                    <div className="mt-2 flex items-start">
                                        <div className="flex-shrink-0 mt-0.5">
                                            <Check className="h-4 w-4 text-[#4ADE80]" />
                                        </div>
                                        <p className="ml-2 text-xs text-[#9CA3AF]">
                                            This task will automatically analyze proposals in Nouns DAO and vote based on your rule.
                                        </p>
                                    </div>
                                </div>

                                <div className="p-3 border border-slate-700/40 rounded-lg bg-[#0c1a54]">
                                    <h5 className="font-medium text-sm text-white">Task Permissions:</h5>
                                    <div className="mt-2 space-y-2">
                                        <div className="flex items-center">
                                            <div className="w-6 h-6 rounded-full bg-[#0f2d12] flex items-center justify-center">
                                                <Check className="h-3 w-3 text-[#4ADE80]" />
                                            </div>
                                            <span className="ml-2 text-xs text-[#9CA3AF]">
                                                Limited to voting actions only
                                            </span>
                                        </div>
                                        <div className="flex items-center">
                                            <div className="w-6 h-6 rounded-full bg-[#0f2d12] flex items-center justify-center">
                                                <Check className="h-3 w-3 text-[#4ADE80]" />
                                            </div>
                                            <span className="ml-2 text-xs text-[#9CA3AF]">
                                                Can't move or transfer funds
                                            </span>
                                        </div>
                                        <div className="flex items-center">
                                            <div className="w-6 h-6 rounded-full bg-[#0f2d12] flex items-center justify-center">
                                                <Check className="h-3 w-3 text-[#4ADE80]" />
                                            </div>
                                            <span className="ml-2 text-xs text-[#9CA3AF]">
                                                Optimized for low gas fees
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex space-x-2">
                                    <Button variant="outline" className="flex-1 border-slate-700/40 text-[#9CA3AF] hover:text-white hover:bg-[#0c1a54]">
                                        Back
                                    </Button>
                                    <Button className="flex-1 bg-[#3B82F6] hover:bg-[#2563EB] text-white">
                                        Create Task
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};