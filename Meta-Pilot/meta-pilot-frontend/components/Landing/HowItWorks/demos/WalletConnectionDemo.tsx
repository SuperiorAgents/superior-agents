import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wallet, Lock, Check, ChevronRight, Shield } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const WalletConnectionDemo: React.FC = () => {
    const [stage, setStage] = useState<number>(0);

    useEffect(() => {
        const timer = setTimeout(() => {
            // Cycle through stages 0-3
            setStage(prev => (prev + 1) % 4);
        }, 2500);

        return () => clearTimeout(timer);
    }, [stage]);

    return (
        <div className="h-full flex items-center justify-center">
            <div className="w-full max-w-sm">
                <Card className="overflow-hidden border-slate-700/30 bg-[#070f3e]/90 backdrop-blur-sm shadow-xl">
                    {/* Browser-like header */}
                    <div className="bg-[#080f43] p-2 flex items-center space-x-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                        <div className="flex-1 ml-2 bg-[#091250] h-3.5 rounded-full"></div>
                    </div>

                    <CardContent className="p-4">
                        <div className="flex justify-center mb-4">
                            <div className="h-14 w-14 rounded-full bg-gradient-to-r from-[#3B82F6] to-[#4F46E5] flex items-center justify-center shadow-lg shadow-[#3B82F6]/20">
                                <Wallet className="h-7 w-7 text-white" />
                            </div>
                        </div>

                        <h3 className="text-center font-bold text-white mb-2">
                            Connect Wallet
                        </h3>

                        <p className="text-sm text-center text-[#9CA3AF] mb-4">
                            Connect your wallet to automate your Web3 tasks
                        </p>

                        {stage === 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Button variant="outline" className="w-full p-2.5 mb-2 flex items-center justify-between border-slate-700/30 bg-[#081142]/50 hover:bg-[#081142]/80 text-white">
                                    <div className="flex items-center">
                                        <div className="w-7 h-7 rounded-full bg-[#F97316] flex items-center justify-center">
                                            <svg className="h-4 w-4" viewBox="0 0 35 33" fill="none">
                                                <path d="M32.9582 1L19.8241 10.7183L22.2665 5.09333L32.9582 1Z" fill="#E17726" stroke="#E17726" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round" />
                                                <path d="M2.04834 1L15.0182 10.8237L12.734 5.09333L2.04834 1Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                        <span className="ml-2 font-medium">MetaMask</span>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-[#9CA3AF]" />
                                </Button>

                                <Button variant="outline" className="w-full p-2.5 flex items-center justify-between border-slate-700/30 bg-[#081142]/50 hover:bg-[#081142]/80 text-white">
                                    <div className="flex items-center">
                                        <div className="w-7 h-7 rounded-full bg-[#2563EB] flex items-center justify-center">
                                            <svg className="h-3.5 w-3.5" viewBox="0 0 96 96">
                                                <path d="M96 48C96 74.51 74.51 96 48 96C21.49 96 0 74.51 0 48C0 21.49 21.49 0 48 0C74.51 0 96 21.49 96 48Z" fill="#3396FF" />
                                                <path d="M24 47C24 33.2 34.2 23 48 23C61.8 23 72 33.2 72 47C72 60.8 61.8 71 48 71C34.2 71 24 60.8 24 47Z" fill="white" />
                                            </svg>
                                        </div>
                                        <span className="ml-2 font-medium">WalletConnect</span>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-[#9CA3AF]" />
                                </Button>
                            </motion.div>
                        )}

                        {stage === 1 && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="h-32 flex flex-col items-center justify-center"
                            >
                                <div className="w-10 h-10 rounded-full border-2 border-[#3B82F6] border-t-transparent animate-spin mb-4"></div>
                                <p className="text-sm text-[#9CA3AF]">Requesting wallet connection...</p>
                            </motion.div>
                        )}

                        {stage === 2 && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="h-32"
                            >
                                <div className="border border-slate-700/30 bg-[#081142]/50 rounded-md p-3 mb-3">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center">
                                            <div className="w-7 h-7 rounded-full bg-[#F97316] flex items-center justify-center mr-2">
                                                <svg className="h-4 w-4" viewBox="0 0 35 33" fill="none">
                                                    <path d="M32.9582 1L19.8241 10.7183L22.2665 5.09333L32.9582 1Z" fill="#E17726" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-xs text-[#9CA3AF]">MetaMask requesting</p>
                                                <p className="font-medium text-sm text-white">Session Key Permission</p>
                                            </div>
                                        </div>
                                        <Shield className="h-4 w-4 text-[#60A5FA]" />
                                    </div>

                                    <div className="mt-2 pt-2 border-t border-slate-700/20">
                                        <p className="text-xs text-[#9CA3AF]">Limited permission for:</p>
                                        <div className="flex items-center mt-1">
                                            <Check className="h-3 w-3 text-[#60A5FA] mr-1" />
                                            <p className="text-xs text-[#9CA3AF]">Voting on DAOs</p>
                                        </div>
                                        <div className="flex items-center mt-1">
                                            <Check className="h-3 w-3 text-[#60A5FA] mr-1" />
                                            <p className="text-xs text-[#9CA3AF]">Claiming rewards</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex space-x-2">
                                    <Button variant="outline" className="flex-1 text-[#9CA3AF] border-slate-700/30 bg-[#081142]/50 hover:bg-[#081142]/80">Reject</Button>
                                    <Button className="flex-1 bg-[#3B82F6] hover:bg-[#2563EB] text-white">Approve</Button>
                                </div>
                            </motion.div>
                        )}

                        {stage === 3 && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="h-32 flex flex-col items-center justify-center"
                            >
                                <motion.div
                                    className="h-12 w-12 rounded-full bg-[#0b1755] flex items-center justify-center mb-3 text-[#4ADE80]"
                                    initial={{ scale: 0.8 }}
                                    animate={{ scale: 1 }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 300,
                                        damping: 20
                                    }}
                                >
                                    <Check className="h-6 w-6" />
                                </motion.div>
                                <p className="font-medium text-white">Wallet Connected!</p>
                                <p className="text-sm text-[#9CA3AF] mt-1">Ready to set up your tasks</p>
                            </motion.div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};