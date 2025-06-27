import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, Vote, Check } from 'lucide-react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const ExecutionDemo: React.FC = () => {
    const [stage, setStage] = useState<number>(0);

    useEffect(() => {
        const timer = setTimeout(() => {
            setStage((prev) => Math.min(prev + 1, 4)); // Max 4 stages
        }, 1200);

        return () => clearTimeout(timer);
    }, [stage]);

    return (
        <div className="h-full flex items-center justify-center">
            <div className="w-full max-w-md">
                <Card className="overflow-hidden border-0 bg-[#081142]/90 backdrop-blur-sm shadow-xl">
                    <CardHeader className="bg-gradient-to-r from-[#3B82F6] to-[#4F46E5] p-4 text-white">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-lg text-white">Task Execution</h3>
                                <p className="text-blue-200 text-sm">Voting on DAO proposal</p>
                            </div>
                            <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                                <Zap className="h-6 w-6 text-white" />
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="p-4">
                        <div className="bg-[#0c1a54] rounded-lg p-3 mb-4 border border-slate-700/30">
                            <div className="flex justify-between mb-2">
                                <span className="text-xs text-[#9CA3AF]">Task ID: #38291</span>
                                <Badge variant="outline" className="text-[#60A5FA] bg-transparent border-[#60A5FA]/30">In Progress</Badge>
                            </div>

                            <div className="flex items-start">
                                <div className="w-8 h-8 rounded-full bg-[#162254] flex items-center justify-center shrink-0">
                                    <Vote className="h-4 w-4 text-[#3B82F6]" />
                                </div>
                                <div className="ml-3">
                                    <h4 className="font-medium text-white">Vote on Proposal #42</h4>
                                    <p className="text-sm text-[#9CA3AF]">
                                        Nouns DAO - Community Rewards Program
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {/* Step 1: Prepare transaction */}
                            <div className="relative">
                                <div className={`absolute top-0 -left-[17px] w-8 h-8 rounded-full ${stage >= 0
                                    ? 'bg-[#3B82F6] text-white'
                                    : 'bg-[#1F2937] text-[#9CA3AF]'
                                    } flex items-center justify-center`}>
                                    <span className="text-sm">1</span>
                                </div>
                                <div className={`ml-4 pl-4 ${stage > 0 ? 'border-l-2 border-[#3B82F6]' : 'border-l-2 border-slate-700/30'}`}>
                                    <h4 className={`font-medium ${stage >= 0 ? 'text-white' : 'text-[#9CA3AF]'}`}>
                                        Preparing Transaction
                                    </h4>

                                    <div className="mt-2 mb-6">
                                        {stage >= 0 && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                className="bg-[#0c1a54] p-2.5 rounded border border-slate-700/30"
                                            >
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-[#9CA3AF]">Action:</span>
                                                    <span className="font-medium text-white">
                                                        Vote "YES"
                                                    </span>
                                                </div>

                                                <div className="flex justify-between text-sm mt-1">
                                                    <span className="text-[#9CA3AF]">Rule Match:</span>
                                                    <span className="font-medium text-[#4ADE80]">
                                                        "rewards" found in proposal
                                                    </span>
                                                </div>

                                                {stage >= 1 && (
                                                    <motion.div
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                    >
                                                        <div className="flex justify-between text-sm mt-1">
                                                            <span className="text-[#9CA3AF]">Estimated Gas:</span>
                                                            <span className="font-medium text-white">
                                                                0.0012 ETH
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between text-sm mt-1">
                                                            <span className="text-[#9CA3AF]">Current Gas Price:</span>
                                                            <span className="font-medium text-[#F97316]">
                                                                29 Gwei (Medium)
                                                            </span>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </motion.div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Step 2: Submit transaction */}
                            <div className="relative">
                                <div className={`absolute top-0 -left-[17px] w-8 h-8 rounded-full ${stage >= 2
                                    ? 'bg-[#3B82F6] text-white'
                                    : 'bg-[#1F2937] text-[#9CA3AF]'
                                    } flex items-center justify-center`}>
                                    <span className="text-sm">2</span>
                                </div>
                                <div className={`ml-4 pl-4 ${stage > 2 ? 'border-l-2 border-[#3B82F6]' : 'border-l-2 border-slate-700/30'}`}>
                                    <h4 className={`font-medium ${stage >= 2 ? 'text-white' : 'text-[#9CA3AF]'}`}>
                                        Submitting Transaction
                                    </h4>

                                    <div className="mt-2 mb-6">
                                        {stage >= 2 && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                className="bg-[#0c1a54] p-2.5 rounded border border-slate-700/30"
                                            >
                                                <div className="flex justify-center items-center">
                                                    {stage === 2 ? (
                                                        <div className="flex flex-col items-center py-3">
                                                            <div className="w-6 h-6 border-2 border-[#3B82F6] border-t-transparent rounded-full animate-spin mb-2"></div>
                                                            <span className="text-sm text-[#9CA3AF]">
                                                                Submitting vote...
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col items-center py-2">
                                                            <div className="w-8 h-8 rounded-full bg-[#173345] flex items-center justify-center mb-2">
                                                                <Check className="h-5 w-5 text-[#4ADE80]" />
                                                            </div>
                                                            <span className="text-sm text-[#4ADE80] font-medium">
                                                                Transaction submitted!
                                                            </span>
                                                            <span className="text-xs text-[#9CA3AF] mt-1">
                                                                TX: 0x71c...8e3f
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Step 3: Confirmation */}
                            <div className="relative">
                                <div className={`absolute top-0 -left-[17px] w-8 h-8 rounded-full ${stage >= 4
                                    ? 'bg-[#3B82F6] text-white'
                                    : 'bg-[#1F2937] text-[#9CA3AF]'
                                    } flex items-center justify-center`}>
                                    <span className="text-sm">3</span>
                                </div>
                                <div className={`ml-4 pl-4 ${stage > 4 ? 'border-l-2 border-[#3B82F6]' : 'border-l-2 border-slate-700/30'}`}>
                                    <h4 className={`font-medium ${stage >= 4 ? 'text-white' : 'text-[#9CA3AF]'}`}>
                                        Confirming Vote
                                    </h4>

                                    <div className="mt-2">
                                        {stage >= 4 && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                className="rounded"
                                            >
                                                <div className="bg-[#173345]/50 p-2.5 rounded border border-[#4ADE80]/30 flex items-center">
                                                    <div className="w-8 h-8 rounded-full bg-[#173345] flex items-center justify-center">
                                                        <Check className="h-5 w-5 text-[#4ADE80]" />
                                                    </div>
                                                    <div className="ml-3">
                                                        <h5 className="font-medium text-[#4ADE80]">Vote Successful!</h5>
                                                        <p className="text-xs text-[#9CA3AF]">
                                                            Voted YES on Nouns DAO Proposal #42
                                                        </p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};