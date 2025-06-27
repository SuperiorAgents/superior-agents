import React, { useState } from 'react';
import { BarChart3, Vote, Sparkles, TrendingUp, Check } from 'lucide-react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export const AnalyticsDemo: React.FC = () => {
    const [activeTab, setActiveTab] = useState<string>('overview');

    return (
        <div className="h-full flex items-center justify-center">
            <div className="w-full max-w-md">
                <Card className="overflow-hidden border-0 bg-[#081142]/90 backdrop-blur-sm shadow-xl">
                    <CardHeader className="bg-gradient-to-r from-[#3B82F6] via-[#6366F1] to-[#4F46E5] p-4 text-white">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-lg text-white">Dashboard</h3>
                                <p className="text-blue-100 text-sm">Performance & Analytics</p>
                            </div>
                            <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                                <BarChart3 className="h-6 w-6 text-white" />
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="p-0">
                        <Tabs defaultValue="overview" onValueChange={setActiveTab} value={activeTab}>
                            <TabsList className="grid grid-cols-3 border-b border-slate-700/30 w-full rounded-none bg-[#0c1a54]">
                                <TabsTrigger value="overview" className="data-[state=active]:bg-[#162254] data-[state=active]:text-white">Overview</TabsTrigger>
                                <TabsTrigger value="tasks" className="data-[state=active]:bg-[#162254] data-[state=active]:text-white">Tasks</TabsTrigger>
                                <TabsTrigger value="savings" className="data-[state=active]:bg-[#162254] data-[state=active]:text-white">Savings</TabsTrigger>
                            </TabsList>

                            <div className="p-4">
                                <TabsContent value="overview" className="mt-0 space-y-4">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="p-3 bg-[#0c1a54] rounded-lg border border-slate-700/30">
                                            <h5 className="text-xs font-medium text-[#9CA3AF]">Active Tasks</h5>
                                            <div className="mt-2 flex justify-between items-end">
                                                <span className="text-2xl font-bold text-white">12</span>
                                                <span className="text-xs text-[#4ADE80]">+3 this week</span>
                                            </div>
                                        </div>

                                        <div className="p-3 bg-[#0c1a54] rounded-lg border border-slate-700/30">
                                            <h5 className="text-xs font-medium text-[#9CA3AF]">Actions Taken</h5>
                                            <div className="mt-2 flex justify-between items-end">
                                                <span className="text-2xl font-bold text-white">47</span>
                                                <span className="text-xs text-[#4ADE80]">+15 this week</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-3 bg-[#0c1a54] rounded-lg border border-slate-700/30">
                                        <div className="flex justify-between items-center">
                                            <h5 className="text-sm font-medium text-white">Task Performance</h5>
                                            <span className="text-xs text-[#9CA3AF]">Last 30 days</span>
                                        </div>

                                        <div className="mt-3 h-24 flex items-end space-x-2">
                                            {[35, 42, 58, 40, 45, 60, 70, 38, 50, 62, 55, 65].map((value, idx) => (
                                                <div key={idx} className="flex-1 flex flex-col items-center">
                                                    <div
                                                        className="w-full bg-gradient-to-t from-[#3B82F6] to-[#6366F1] rounded-t"
                                                        style={{ height: `${value}%` }}
                                                    ></div>
                                                    <span className="text-[8px] text-[#9CA3AF] mt-1">
                                                        {idx + 1}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="p-3 bg-[#0c1a54] rounded-lg border border-slate-700/30">
                                        <div className="flex justify-between items-center">
                                            <h5 className="text-sm font-medium text-white">Gas Savings</h5>
                                            <Badge variant="outline" className="bg-[#173345]/50 text-[#4ADE80] border-[#4ADE80]/30">+35%</Badge>
                                        </div>

                                        <div className="mt-3">
                                            <Progress value={65} className="h-2 bg-[#1a2b6a] [&>div]:bg-gradient-to-r [&>div]:from-[#3B82F6] [&>div]:to-[#4ADE80]" />
                                        </div>

                                        <div className="mt-3 flex justify-between items-center">
                                            <span className="text-xs text-[#9CA3AF]">Estimated savings</span>
                                            <span className="text-sm font-medium text-white">0.132 ETH ($325)</span>
                                        </div>
                                    </div>

                                    <div className="mt-3">
                                        <Button className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white">
                                            View Detailed Analytics
                                        </Button>
                                    </div>
                                </TabsContent>

                                <TabsContent value="tasks" className="mt-0 space-y-3">
                                    <div className="flex justify-between">
                                        <h4 className="text-sm font-medium text-white">Recent Tasks</h4>
                                        <Button variant="link" className="text-xs text-[#3B82F6] p-0 h-5">View All</Button>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="p-2.5 rounded-lg border border-l-4 border-l-[#4ADE80] border-slate-700/30 bg-[#0c1a54]">
                                            <div className="flex justify-between">
                                                <div className="flex items-center">
                                                    <Vote className="h-4 w-4 text-white" />
                                                    <span className="ml-2 text-sm font-medium text-white">DAO Vote</span>
                                                </div>
                                                <Badge variant="outline" className="bg-[#173345]/50 text-[#4ADE80] border-[#4ADE80]/30">Success</Badge>
                                            </div>
                                            <p className="text-xs text-[#9CA3AF] mt-1">Voted YES on Nouns Proposal #42</p>
                                            <div className="flex justify-between mt-1 text-xs text-[#9CA3AF]">
                                                <span>TX: 0x71c...8e3f</span>
                                                <span>2 hours ago</span>
                                            </div>
                                        </div>

                                        <div className="p-2.5 rounded-lg border border-l-4 border-l-[#4ADE80] border-slate-700/30 bg-[#0c1a54]">
                                            <div className="flex justify-between">
                                                <div className="flex items-center">
                                                    <Sparkles className="h-4 w-4 text-white" />
                                                    <span className="ml-2 text-sm font-medium text-white">Claim Rewards</span>
                                                </div>
                                                <Badge variant="outline" className="bg-[#173345]/50 text-[#4ADE80] border-[#4ADE80]/30">Success</Badge>
                                            </div>
                                            <p className="text-xs text-[#9CA3AF] mt-1">Claimed 25 UNI tokens</p>
                                            <div className="flex justify-between mt-1 text-xs text-[#9CA3AF]">
                                                <span>TX: 0x93a...4b2d</span>
                                                <span>1 day ago</span>
                                            </div>
                                        </div>

                                        <div className="p-2.5 rounded-lg border border-l-4 border-l-[#F97316] border-slate-700/30 bg-[#0c1a54]">
                                            <div className="flex justify-between">
                                                <div className="flex items-center">
                                                    <TrendingUp className="h-4 w-4 text-white" />
                                                    <span className="ml-2 text-sm font-medium text-white">Token Purchase</span>
                                                </div>
                                                <Badge variant="outline" className="bg-[#2e2913]/50 text-[#F97316] border-[#F97316]/30">Pending</Badge>
                                            </div>
                                            <p className="text-xs text-[#9CA3AF] mt-1">Buy 0.5 ETH at $2,250</p>
                                            <div className="flex justify-between mt-1 text-xs text-[#9CA3AF]">
                                                <span>Waiting for price condition</span>
                                                <span>Created 3 days ago</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-3">
                                        <Button variant="outline" className="w-full border-slate-700/30 text-[#9CA3AF] hover:text-white hover:bg-[#162254]">
                                            Create New Task
                                        </Button>
                                    </div>
                                </TabsContent>

                                <TabsContent value="savings" className="mt-0 space-y-4">
                                    <div className="bg-[#162254] rounded-lg p-3 border border-[#3B82F6]/30">
                                        <h4 className="font-medium text-[#60A5FA] text-sm">Total Savings</h4>
                                        <div className="flex justify-between mt-2">
                                            <span className="text-2xl font-bold text-white">0.132 ETH</span>
                                            <span className="text-lg font-medium text-[#9CA3AF]">$325</span>
                                        </div>
                                        <p className="text-xs text-[#60A5FA] mt-1">
                                            Based on optimized gas usage and automated timing
                                        </p>
                                    </div>

                                    <div>
                                        <h4 className="font-medium text-white text-sm mb-2">Savings Breakdown</h4>

                                        <div className="space-y-3">
                                            <div className="p-3 bg-[#0c1a54] rounded-lg border border-slate-700/30">
                                                <div className="flex justify-between">
                                                    <span className="text-sm font-medium text-white">Gas Optimization</span>
                                                    <span className="text-sm font-medium text-white">0.085 ETH</span>
                                                </div>
                                                <div className="mt-2">
                                                    <Progress value={65} className="h-1.5 bg-[#1a2b6a] [&>div]:bg-[#4ADE80]" />
                                                </div>
                                                <span className="text-xs text-[#9CA3AF] mt-1 block">
                                                    Transactions executed during low gas periods
                                                </span>
                                            </div>

                                            <div className="p-3 bg-[#0c1a54] rounded-lg border border-slate-700/30">
                                                <div className="flex justify-between">
                                                    <span className="text-sm font-medium text-white">Time Saved</span>
                                                    <span className="text-sm font-medium text-white">14.5 hours</span>
                                                </div>
                                                <div className="mt-2">
                                                    <Progress value={80} className="h-1.5 bg-[#1a2b6a] [&>div]:bg-[#3B82F6]" />
                                                </div>
                                                <span className="text-xs text-[#9CA3AF] mt-1 block">
                                                    Based on avg. 15 min per manual transaction
                                                </span>
                                            </div>

                                            <div className="p-3 bg-[#0c1a54] rounded-lg border border-slate-700/30">
                                                <div className="flex justify-between">
                                                    <span className="text-sm font-medium text-white">Opportunity Value</span>
                                                    <span className="text-sm font-medium text-white">0.047 ETH</span>
                                                </div>
                                                <div className="mt-2">
                                                    <Progress value={35} className="h-1.5 bg-[#1a2b6a] [&>div]:bg-[#6366F1]" />
                                                </div>
                                                <span className="text-xs text-[#9CA3AF] mt-1 block">
                                                    Value from never missing rewards or opportunities
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>
                            </div>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};