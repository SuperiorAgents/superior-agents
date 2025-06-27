import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Check, Vote, Sparkles, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ProposalData {
    id: string;
    title: string;
    match: string;
    dao: string;
}

export const AIMonitoringDemo: React.FC = () => {
    const [activeProposal, setActiveProposal] = useState<number>(0);
    const [scanning, setScanning] = useState<boolean>(true);

    useEffect(() => {
        const timer = setInterval(() => {
            setActiveProposal(prev => (prev + 1) % 3);
        }, 1500);

        const scanTimer = setTimeout(() => {
            setScanning(false);
        }, 3000);

        return () => {
            clearInterval(timer);
            clearTimeout(scanTimer);
        };
    }, []);

    const proposals: ProposalData[] = [
        {
            id: "Proposal #42",
            title: "Community Rewards Program",
            match: "YES - Detected 'rewards'",
            dao: "Nouns DAO"
        },
        {
            id: "Proposal #87",
            title: "Update Treasury Diversification",
            match: "ANALYZING",
            dao: "Compound DAO"
        },
        {
            id: "Proposal #19",
            title: "Governance Parameter Update",
            match: "NO MATCH",
            dao: "ENS DAO"
        }
    ];

    return (
        <div className="h-full flex items-center justify-center">
            <div className="w-full max-w-md">
                <Card className="overflow-hidden border-0 bg-[#081142]/90 backdrop-blur-sm shadow-xl">
                    <CardHeader className="bg-gradient-to-r from-[#4F46E5] to-[#6366F1] p-4 text-white">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-lg text-white">AI Monitoring</h3>
                                <p className="text-indigo-200 text-sm">Real-time analysis</p>
                            </div>
                            <div className="flex items-center">
                                <Brain className="h-6 w-6 text-white mr-2" />
                                {scanning ? (
                                    <div className="animate-pulse px-2 py-1 bg-indigo-500/50 text-white text-xs rounded-full flex items-center">
                                        <span className="w-2 h-2 rounded-full bg-white mr-1.5"></span>
                                        Scanning...
                                    </div>
                                ) : (
                                    <div className="px-2 py-1 bg-[#4ADE80]/20 text-[#4ADE80] text-xs rounded-full flex items-center">
                                        <Check className="h-3 w-3 mr-1" />
                                        Active
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="p-4">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="font-medium text-white">Monitoring Tasks</h4>
                            <Badge variant="outline" className="bg-[#173345]/50 text-[#4ADE80] hover:bg-[#173345]/50 border-[#4ADE80]/30">
                                3 Active
                            </Badge>
                        </div>

                        <div className="space-y-2">
                            <div className="p-2.5 rounded-lg border-l-4 border-l-[#3B82F6] bg-[#162254] border border-[#3B82F6]/30">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <Vote className="h-4 w-4 text-[#60A5FA]" />
                                        <span className="ml-2 text-sm font-medium text-[#60A5FA]">DAO Voting</span>
                                    </div>
                                    <span className="text-xs text-[#60A5FA]">Active</span>
                                </div>
                                <p className="text-xs text-[#9CA3AF] mt-1">Vote on proposals with keyword "rewards"</p>
                            </div>

                            <div className="p-2.5 rounded-lg border border-slate-700/30 bg-[#0c1a54] hover:border-l-4 hover:border-l-[#DB2777] hover:bg-[#162254]">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <Sparkles className="h-4 w-4 text-[#9CA3AF]" />
                                        <span className="ml-2 text-sm font-medium text-white">Claim Rewards</span>
                                    </div>
                                    <span className="text-xs text-[#9CA3AF]">Active</span>
                                </div>
                                <p className="text-xs text-[#9CA3AF] mt-1">Auto-claim when rewards {">"} 10 tokens</p>
                            </div>

                            <div className="p-2.5 rounded-lg border border-slate-700/30 bg-[#0c1a54] hover:border-l-4 hover:border-l-[#F97316] hover:bg-[#162254]">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <TrendingUp className="h-4 w-4 text-[#9CA3AF]" />
                                        <span className="ml-2 text-sm font-medium text-white">Token Trading</span>
                                    </div>
                                    <span className="text-xs text-[#9CA3AF]">Active</span>
                                </div>
                                <p className="text-xs text-[#9CA3AF] mt-1">Buy ETH if price drops 5%</p>
                            </div>
                        </div>

                        <div className="mt-4">
                            <h4 className="font-medium text-white mb-2">AI Analysis Feed</h4>

                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                {proposals.map((proposal, idx) => (
                                    <motion.div
                                        key={idx}
                                        className={`p-3 rounded-lg border ${activeProposal === idx
                                            ? 'border-[#3B82F6]/30 bg-[#162254]'
                                            : 'border-slate-700/30 bg-[#0c1a54]'
                                            }`}
                                        animate={activeProposal === idx ? { y: [5, 0], x: [3, 0] } : {}}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <div className="flex justify-between">
                                            <div className="flex items-center">
                                                <div className="w-6 h-6 rounded-full bg-[#1a2b6a] flex items-center justify-center text-xs font-medium text-white">
                                                    {proposal.dao.charAt(0)}
                                                </div>
                                                <span className="ml-2 text-xs font-medium text-[#9CA3AF]">
                                                    {proposal.dao}
                                                </span>
                                            </div>
                                            <span className="text-xs text-[#9CA3AF]">
                                                {proposal.id}
                                            </span>
                                        </div>

                                        <p className="text-sm font-medium text-white mt-1">
                                            {proposal.title}
                                        </p>

                                        <div className="mt-1 flex justify-between items-center">
                                            <div className={`text-xs ${proposal.match.includes('YES')
                                                ? 'text-[#4ADE80]'
                                                : proposal.match === 'ANALYZING'
                                                    ? 'text-[#F97316]'
                                                    : 'text-[#9CA3AF]'
                                                }`}>
                                                {proposal.match}
                                            </div>

                                            {activeProposal === idx && proposal.match.includes('YES') && (
                                                <div className="flex items-center">
                                                    <motion.div
                                                        initial={{ opacity: 0, scale: 0 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        transition={{ delay: 0.5 }}
                                                        className="px-2 py-0.5 bg-[#173345]/50 rounded text-xs text-[#4ADE80] border border-[#4ADE80]/30"
                                                    >
                                                        Vote scheduled
                                                    </motion.div>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};