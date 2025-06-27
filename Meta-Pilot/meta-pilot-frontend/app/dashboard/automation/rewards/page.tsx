"use client";

import React, { useState } from "react";
import {
    BellRing,
    ArrowRight,
    PlusCircle,
    RefreshCw,
    Clock,
    ExternalLink,
    Users,
    Info,
    Zap,
    CheckCircle2,
    MoreHorizontal,
    Eye,
    DollarSign,
    Sparkles
} from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import CreateTaskModal from "@/components/Dashbaord/Tasks/CreateTaskModal";

// Component type definitions to fix TypeScript errors
type ProtocolInsight = {
    name: string;
    logo: string;
    summary: string;
    stats: {
        claimableRewards: string;
        rewardValue: string;
        rewardChange: string;
        rewardFrequency: string;
        gasToEarn: string;
        expectedAnnual: string;
    };
    rewardHistory?: { date: string; amount: number }[];
    tokenDetails?: {
        token: string;
        ticker: string;
        price: string;
        change24h: string;
        marketCap: string;
        volume: string;
    }[];
    recommendations: {
        title: string;
        reason: string;
        impact: string;
        implementation: string;
    }[];
    opportunities: {
        title: string;
        description: string;
        timeWindow: string;
        expectedReward: string;
        gasCost: string;
        recommendation: string;
    }[];
};

const ClaimRewardsPage = () => {
    const [createTaskModalOpen, setCreateTaskModalOpen] = useState(false);
    const [insightModalOpen, setInsightModalOpen] = useState(false);
    const [selectedProtocol, setSelectedProtocol] = useState<string | null>(null);
    const [insightLoading, setInsightLoading] = useState(false);

    // Function to open protocol insight modal
    const openProtocolInsight = (protocolId: string) => {
        setSelectedProtocol(protocolId);
        setInsightLoading(true);
        setInsightModalOpen(true);

        // Simulate loading data from API
        setTimeout(() => {
            setInsightLoading(false);
        }, 1500);
    };

    // Active tasks data
    const activeTasks = [
        {
            id: "task-1",
            protocol: "Aave",
            icon: "/icons/aave.svg",
            rule: "Claim weekly on Mondays",
            nextClaim: "In 2 days",
            status: "active",
            currentRewards: "32.5 stkAAVE ($158.32)"
        },
        {
            id: "task-2",
            protocol: "Compound",
            icon: "/icons/compound.svg",
            rule: "Claim when rewards exceed $500",
            nextClaim: "Estimated in 5 days",
            status: "active",
            currentRewards: "241 COMP ($987.65)"
        }
    ];

    // Recent tasks history
    const tasksHistory = [
        {
            id: "history-1",
            protocol: "Uniswap",
            icon: "/icons/uniswap.svg",
            rule: "Claim as soon as available",
            completedDate: "May 10, 2023",
            claimed: "12 UNI",
            outcome: "successful",
            value: "$98.76"
        },
        {
            id: "history-2",
            protocol: "Curve",
            icon: "/icons/curve.svg",
            rule: "Claim weekly",
            completedDate: "May 3, 2023",
            claimed: "156 CRV",
            outcome: "successful",
            value: "$123.45"
        }
    ];

    // Protocols data for insights
    const protocolData = [
        {
            id: "aave",
            name: "Aave",
            icon: "/icons/aave.svg",
            rewards: "32.5 stkAAVE",
            value: "$158.32",
            change: "+2.4%",
            frequency: "Daily"
        },
        {
            id: "compound",
            name: "Compound",
            icon: "/icons/compound.svg",
            rewards: "241 COMP",
            value: "$987.65",
            change: "+3.8%",
            frequency: "Per block"
        },
        {
            id: "curve",
            name: "Curve",
            icon: "/icons/curve.svg",
            rewards: "156 CRV",
            value: "$123.45",
            change: "-1.2%",
            frequency: "Daily"
        },
        {
            id: "synthetix",
            name: "Synthetix",
            icon: "/icons/synthetix.svg",
            rewards: "87 SNX",
            value: "$432.80",
            change: "+0.5%",
            frequency: "Weekly"
        },
        {
            id: "uniswap",
            name: "Uniswap",
            icon: "/icons/uniswap.svg",
            rewards: "12 UNI",
            value: "$98.76",
            change: "-0.8%",
            frequency: "Distribution"
        }
    ];

    // Detailed insight data for each protocol
    const protocolInsights: Record<string, ProtocolInsight> = {
        "aave": {
            name: "Aave",
            logo: "/icons/aave.svg",
            summary: "Earn stkAAVE rewards by participating in Aave's security module, providing safety net for the protocol.",
            stats: {
                claimableRewards: "32.5 stkAAVE",
                rewardValue: "$158.32",
                rewardChange: "+2.4%",
                rewardFrequency: "Daily accrual",
                gasToEarn: "1-2 days",
                expectedAnnual: "~$2,100"
            },
            rewardHistory: [
                { date: "Week 1", amount: 28.2 },
                { date: "Week 2", amount: 29.4 },
                { date: "Week 3", amount: 30.8 },
                { date: "Week 4", amount: 32.5 }
            ],
            tokenDetails: [
                {
                    token: "staked AAVE",
                    ticker: "stkAAVE",
                    price: "$4.87",
                    change24h: "+1.8%",
                    marketCap: "$682M",
                    volume: "$12.3M"
                }
            ],
            recommendations: [
                {
                    title: "Weekly claim schedule optimal",
                    reason: "Current reward accrual rate balanced with gas costs suggests weekly claiming",
                    impact: "medium",
                    implementation: "Set up weekly claim schedule, preferably during low gas periods"
                },
                {
                    title: "Auto-compound for maximum yield",
                    reason: "Re-staking stkAAVE compounds your position and boosts safety module rewards",
                    impact: "high",
                    implementation: "Enable auto-reinvest to compound rewards back into staking position"
                }
            ],
            opportunities: [
                {
                    title: "Safety Module Boost",
                    description: "Increasing your staked position by >30% qualifies for boosted rewards",
                    timeWindow: "Ongoing",
                    expectedReward: "+15% APY",
                    gasCost: "One-time ~$15",
                    recommendation: "Stake additional AAVE to reach boost threshold, then set up auto-claim"
                },
                {
                    title: "Gas Optimization Window",
                    description: "Historical gas patterns show optimal claiming on weekends",
                    timeWindow: "Saturdays 12:00-16:00 UTC",
                    expectedReward: "Standard",
                    gasCost: "40-60% lower than weekdays",
                    recommendation: "Schedule weekly claims during this window for gas efficiency"
                }
            ]
        },
        "compound": {
            name: "Compound",
            logo: "/icons/compound.svg",
            summary: "Earn COMP governance tokens by supplying or borrowing assets on the Compound protocol.",
            stats: {
                claimableRewards: "241 COMP",
                rewardValue: "$987.65",
                rewardChange: "+3.8%",
                rewardFrequency: "Per block",
                gasToEarn: "12-24 hours",
                expectedAnnual: "~$12,400"
            },
            rewardHistory: [
                { date: "Week 1", amount: 210 },
                { date: "Week 2", amount: 220 },
                { date: "Week 3", amount: 235 },
                { date: "Week 4", amount: 241 }
            ],
            recommendations: [
                {
                    title: "Threshold-based claiming",
                    reason: "High value of accumulated COMP makes threshold-based claiming most efficient",
                    impact: "high",
                    implementation: "Set $500 minimum threshold to optimize gas costs relative to claim value"
                }
            ],
            opportunities: [
                {
                    title: "Supply-side Optimization",
                    description: "Moving supply from ETH to USDC currently offers 2.3x higher COMP rewards",
                    timeWindow: "Current market cycle",
                    expectedReward: "+130% COMP accrual",
                    gasCost: "One-time ~$25-40",
                    recommendation: "Adjust supply distribution, then set threshold-based auto-claim"
                }
            ]
        },
        "curve": {
            name: "Curve",
            logo: "/icons/curve.svg",
            summary: "Earn CRV rewards through liquidity provision and gauge voting in the Curve ecosystem.",
            stats: {
                claimableRewards: "156 CRV",
                rewardValue: "$123.45",
                rewardChange: "-1.2%",
                rewardFrequency: "Daily",
                gasToEarn: "3-4 days",
                expectedAnnual: "~$1,560"
            },
            recommendations: [
                {
                    title: "Consolidate claims",
                    reason: "Lower CRV price makes frequent claims inefficient given gas costs",
                    impact: "medium",
                    implementation: "Set up bi-weekly claim schedule to improve cost efficiency"
                }
            ],
            opportunities: [
                {
                    title: "veCRV Multiplier",
                    description: "Locking CRV for veCRV can multiply your future rewards by up to 2.5x",
                    timeWindow: "Best with 4-year lock",
                    expectedReward: "Up to 2.5x current rate",
                    gasCost: "Initial lock ~$30-45",
                    recommendation: "Lock claimed CRV for veCRV before setting up new claim schedule"
                }
            ]
        },
        "synthetix": {
            name: "Synthetix",
            logo: "/icons/synthetix.svg",
            summary: "Earn SNX rewards through staking and minting synths in the Synthetix protocol.",
            stats: {
                claimableRewards: "87 SNX",
                rewardValue: "$432.80",
                rewardChange: "+0.5%",
                rewardFrequency: "Weekly",
                gasToEarn: "7-8 days",
                expectedAnnual: "~$5,900"
            },
            recommendations: [
                {
                    title: "Weekly synchronized claims",
                    reason: "SNX rewards are distributed weekly, making synchronized claiming optimal",
                    impact: "high",
                    implementation: "Set up claim to execute shortly after weekly distribution (Wednesdays)"
                }
            ],
            opportunities: [
                {
                    title: "Debt Pool Optimization",
                    description: "Rebalancing synth exposure can reduce debt fluctuation and maximize rewards",
                    timeWindow: "Current market conditions",
                    expectedReward: "Reduced risk + ~5-8% higher returns",
                    gasCost: "Varies with market",
                    recommendation: "Rebalance synthetic assets before setting up auto-claim"
                }
            ]
        },
        "uniswap": {
            name: "Uniswap",
            logo: "/icons/uniswap.svg",
            summary: "Earn UNI governance tokens through airdrops and potential LP incentives.",
            stats: {
                claimableRewards: "12 UNI",
                rewardValue: "$98.76",
                rewardChange: "-0.8%",
                rewardFrequency: "Irregular distributions",
                gasToEarn: "N/A (airdrop)",
                expectedAnnual: "Unpredictable"
            },
            recommendations: [
                {
                    title: "Immediate claim for airdrops",
                    reason: "UNI distributions are irregular and have time limits for claiming",
                    impact: "high",
                    implementation: "Configure 'claim as soon as available' to ensure no missed airdrops"
                }
            ],
            opportunities: [
                {
                    title: "Governance Participation",
                    description: "Active participation in governance may qualify for additional distributions",
                    timeWindow: "Ongoing",
                    expectedReward: "Potential for future airdrops",
                    gasCost: "Voting ~$15-25 per proposal",
                    recommendation: "Set up immediate claim rule to capture time-sensitive distributions"
                }
            ]
        }
    };

    // Get selected protocol insights
    const getSelectedProtocolInsights = () => {
        if (!selectedProtocol) return null;
        return protocolInsights[selectedProtocol];
    };

    return (
        <div className="container mx-auto py-6 space-y-8">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        <span className="flex items-center gap-2">
                            <BellRing className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                            Claim Rewards Automation
                        </span>
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Automate claiming of protocol rewards, staking rewards, and airdrops
                    </p>
                </div>
                <Button
                    className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white"
                    onClick={() => setCreateTaskModalOpen(true)}
                >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Claim Task
                </Button>
            </div>

            {/* Interactive Protocol Intelligence Section */}
            <Card className="border-orange-100 dark:bg-slate-900/90  dark:border-indigo-900/30 shadow-lg overflow-hidden">
                <CardHeader className="pb-0">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-amber-500" />
                            <CardTitle className="text-lg">Rewards Intelligence</CardTitle>
                        </div>
                        <Badge variant="outline" className="px-2 py-1 text-xs bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-300 border-orange-200 dark:border-orange-800">
                            <Clock className="mr-1 h-3 w-3" />
                            Live Reward Data
                        </Badge>
                    </div>
                    <CardDescription>
                        Analyze claimable rewards, compare protocols, and optimize your claiming strategy
                    </CardDescription>
                </CardHeader>

                <CardContent className="p-0 mt-4">
                    <div className="p-4 bg-gradient-to-b from-orange-50/50 to-amber-50/30 dark:from-orange-950/20 dark:to-amber-950/10 border-y border-orange-100/50 dark:border-orange-800/30 mb-4">
                        <p className="text-sm text-orange-700 dark:text-orange-300">
                            Click on any protocol to view detailed insights, analyze token performance, and get recommendations for optimal claiming strategies.
                        </p>
                    </div>

                    {/* Protocol Insights Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                        {protocolData.map(protocol => (
                            <Card
                                key={protocol.id}
                                className="group hover:border-orange-300 dark:hover:border-orange-700 transition-all 
                                cursor-pointer relative overflow-hidden dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg"
                                onClick={() => openProtocolInsight(protocol.id)}
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3 mb-3">
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src={protocol.icon} alt={protocol.name} />
                                            <AvatarFallback className="bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-200">
                                                {protocol.name.substring(0, 2)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h3 className="font-semibold">{protocol.name}</h3>
                                            <Badge variant="outline" className="mt-1 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                                                <Clock className="mr-1 h-3 w-3" />
                                                {protocol.frequency}
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <div className="flex justify-between items-center mb-1 text-sm">
                                            <span className="text-slate-600 dark:text-slate-400">Rewards Value</span>
                                            <span className="font-medium">{protocol.value}
                                                <span className={cn(
                                                    "text-xs ml-1",
                                                    protocol.change.startsWith("+")
                                                        ? "text-green-600 dark:text-green-400"
                                                        : "text-red-600 dark:text-red-400"
                                                )}>
                                                    {protocol.change}
                                                </span>
                                            </span>
                                        </div>
                                        <Progress
                                            value={parseFloat(protocol.value.replace('$', ''))}
                                            max={1000}
                                            className="h-1.5 [&>div]:bg-orange-500"
                                        />
                                    </div>

                                    <div className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded-md mb-3">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-slate-500 dark:text-slate-400">Claimable Tokens</span>
                                            <span className="font-medium">{protocol.rewards}</span>
                                        </div>
                                    </div>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full gap-1 group-hover:bg-orange-50 group-hover:text-orange-600 d
                                        ark:group-hover:bg-orange-900/20 dark:group-hover:text-orange-400 
                                        group-hover:border-orange-200 dark:group-hover:border-orange-800
                                        dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg"
                                    >
                                        <Eye className="h-3.5 w-3.5" />
                                        View Reward Insights
                                    </Button>

                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-orange-500/5 dark:to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Tasks Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Active Tasks */}
                <Card className="dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <CheckCircle2 className="h-5 w-5 text-orange-500" />
                                Active Claim Tasks
                            </CardTitle>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 gap-1 text-orange-600"
                                onClick={() => setCreateTaskModalOpen(true)}
                            >
                                <PlusCircle className="h-3.5 w-3.5" />
                                <span>Add New</span>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {activeTasks.length > 0 ? (
                            <div className="space-y-4 dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg">
                                {activeTasks.map(task => (
                                    <div
                                        key={task.id}
                                        className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700"
                                    >
                                        <div className="flex items-start gap-3">
                                            <Avatar className="h-10 w-10 mt-1">
                                                <AvatarImage src={task.icon} alt={task.protocol} />
                                                <AvatarFallback className="bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-200">
                                                    {task.protocol.substring(0, 2)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <h4 className="font-medium text-slate-900 dark:text-white">{task.protocol}</h4>
                                                        <Badge className="mt-1 bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 font-normal">
                                                            Active
                                                        </Badge>
                                                    </div>
                                                    <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                                        Next: {task.nextClaim}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                                                    <span className="font-medium">Rule:</span> {task.rule}
                                                </p>
                                                <div className="flex items-center gap-1 mt-3 text-xs text-slate-500 dark:text-slate-400">
                                                    <DollarSign className="h-3.5 w-3.5" />
                                                    <span>Current rewards: {task.currentRewards}</span>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-center border border-dashed border-slate-300 dark:border-slate-700 rounded-lg">
                                <BellRing className="h-10 w-10 text-slate-300 dark:text-slate-700 mb-2" />
                                <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-1">No active tasks</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-4">
                                    You don't have any active reward claiming tasks. Create one to start automating your rewards.
                                </p>
                                <Button
                                    size="sm"
                                    onClick={() => setCreateTaskModalOpen(true)}
                                    className="bg-orange-600 hover:bg-orange-700 text-white"
                                >
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Create Task
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Completed Tasks */}
                <Card className="dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                            Claim History
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {tasksHistory.length > 0 ? (
                            <div className="space-y-4">
                                {tasksHistory.map(task => (
                                    <div
                                        key={task.id}
                                        className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700"
                                    >
                                        <div className="flex items-start gap-3">
                                            <Avatar className="h-10 w-10 mt-1">
                                                <AvatarImage src={task.icon} alt={task.protocol} />
                                                <AvatarFallback className="bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-200">
                                                    {task.protocol.substring(0, 2)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <h4 className="font-medium text-slate-900 dark:text-white">{task.protocol}</h4>
                                                        <Badge className="mt-1 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 font-normal">
                                                            Completed
                                                        </Badge>
                                                    </div>
                                                    <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                                        Claimed {task.claimed}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                                                    <span className="font-medium">Strategy:</span> {task.rule}
                                                </p>
                                                <div className="flex items-center justify-between mt-3 text-xs text-slate-500 dark:text-slate-400">
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="h-3.5 w-3.5" />
                                                        <span>{task.completedDate}</span>
                                                    </div>
                                                    <div>Value: {task.value}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <div className="flex justify-center pt-2">
                                    <Button variant="link" className="text-orange-600 dark:text-orange-400 h-auto p-0">
                                        View All History
                                        <ArrowRight className="ml-1 h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-center border border-dashed border-slate-300 dark:border-slate-700 rounded-lg">
                                <BellRing className="h-10 w-10 text-slate-300 dark:text-slate-700 mb-2" />
                                <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-1">No claim history</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
                                    Your completed reward claims will appear here
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Resources Section */}
            <Card className="dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg">
                <CardHeader>
                    <CardTitle className="text-lg">Resources & Guides</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                            <h3 className="font-semibold mb-2 flex items-center gap-2">
                                <Info className="h-4 w-4 text-orange-600" />
                                <span>Reward Claiming Guide</span>
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                                Learn strategies for optimizing when and how to claim protocol rewards
                            </p>
                            <Button variant="link" className="h-auto p-0 text-orange-600 dark:text-orange-400">
                                Read Guide
                                <ExternalLink className="ml-1 h-3 w-3" />
                            </Button>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                            <h3 className="font-semibold mb-2 flex items-center gap-2">
                                <Users className="h-4 w-4 text-orange-600" />
                                <span>Protocol Comparison</span>
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                                Compare reward rates, frequency, and claim mechanics across different protocols
                            </p>
                            <Button variant="link" className="h-auto p-0 text-orange-600 dark:text-orange-400">
                                View Comparison
                                <ExternalLink className="ml-1 h-3 w-3" />
                            </Button>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                            <h3 className="font-semibold mb-2 flex items-center gap-2">
                                <Zap className="h-4 w-4 text-amber-600" />
                                <span>Gas Optimization</span>
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                                Learn techniques to minimize gas costs when claiming protocol rewards
                            </p>
                            <Button variant="link" className="h-auto p-0 text-orange-600 dark:text-orange-400">
                                View Guide
                                <ExternalLink className="ml-1 h-3 w-3" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Protocol Insights Modal */}
            <Dialog open={insightModalOpen} onOpenChange={setInsightModalOpen}>
                <DialogContent className="sm:max-w-[900px] p-0 max-h-[90vh] overflow-hidden dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg">
                    {insightLoading ? (
                        <div className="flex items-center justify-center p-8">
                            <div className="text-center">
                                <RefreshCw className="h-8 w-8 animate-spin text-orange-600 dark:text-orange-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium">Loading insights...</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                                    Fetching the latest reward data and claiming analytics
                                </p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {selectedProtocol && (
                                <div className="flex flex-col h-full max-h-[90vh] dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg">
                                    <DialogHeader className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-12 w-12">
                                                <AvatarImage src={protocolInsights[selectedProtocol]?.logo} />
                                                <AvatarFallback className="bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300">
                                                    {protocolInsights[selectedProtocol]?.name.substring(0, 2)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <DialogTitle className="text-xl">
                                                    {protocolInsights[selectedProtocol]?.name} Rewards Insights
                                                </DialogTitle>
                                                <DialogDescription>
                                                    Reward analysis and claiming strategy recommendations
                                                </DialogDescription>
                                            </div>
                                        </div>
                                    </DialogHeader>

                                    <ScrollArea className="flex-1 px-6 py-4 h-full">
                                        <div className="space-y-6 dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg">
                                            {/* Summary */}
                                            <div>
                                                <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-900/30 rounded-lg p-4">
                                                    <p className="text-orange-800 dark:text-orange-300">
                                                        {getSelectedProtocolInsights()?.summary}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Stats Overview */}
                                            <div>
                                                <h3 className="text-lg font-semibold mb-3">Rewards Overview</h3>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                                    <Card className="bg-slate-50/50 dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg">
                                                        <CardContent className="p-4">
                                                            <p className="text-sm text-muted-foreground mb-1">Claimable Rewards</p>
                                                            <div className="flex items-baseline">
                                                                <span className="text-2xl font-bold">{getSelectedProtocolInsights()?.stats.claimableRewards}</span>
                                                                <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">
                                                                    ({getSelectedProtocolInsights()?.stats.rewardValue})
                                                                </span>
                                                            </div>
                                                        </CardContent>
                                                    </Card>

                                                    <Card className="bg-slate-50/50 dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg">
                                                        <CardContent className="p-4">
                                                            <p className="text-sm text-muted-foreground mb-1">Value Change (24h)</p>
                                                            <div className="flex items-baseline">
                                                                <span className="text-2xl font-bold">{getSelectedProtocolInsights()?.stats.rewardChange}</span>
                                                                <Badge className={cn(
                                                                    "ml-2",
                                                                    getSelectedProtocolInsights()?.stats.rewardChange?.startsWith("+")
                                                                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                                                        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                                                )}>
                                                                    Value change
                                                                </Badge>
                                                            </div>
                                                        </CardContent>
                                                    </Card>

                                                    <Card className="bg-slate-50/50 dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg">
                                                        <CardContent className="p-4">
                                                            <p className="text-sm text-muted-foreground mb-1">Reward Metrics</p>
                                                            <div className="text-sm space-y-0.5">
                                                                <div className="flex justify-between">
                                                                    <span className="text-slate-500 dark:text-slate-400">Frequency:</span>
                                                                    <span className="font-medium">{getSelectedProtocolInsights()?.stats.rewardFrequency}</span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span className="text-slate-500 dark:text-slate-400">Gas breakeven:</span>
                                                                    <span className="font-medium">{getSelectedProtocolInsights()?.stats.gasToEarn}</span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span className="text-slate-500 dark:text-slate-400">Est. Annual:</span>
                                                                    <span className="font-medium">{getSelectedProtocolInsights()?.stats.expectedAnnual}</span>
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                </div>
                                            </div>

                                            {/* Reward History Chart */}
                                            {getSelectedProtocolInsights()?.rewardHistory && (
                                                <div>
                                                    <h3 className="text-lg font-semibold mb-3">Reward Accrual (Last 4 Weeks)</h3>
                                                    <Card className="dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg">
                                                        <CardContent className="p-4">
                                                            <div className="h-64 w-full">
                                                                <div className="flex justify-center items-center h-full">
                                                                    <div className="w-full flex flex-col space-y-2">
                                                                        <div className="flex items-center justify-between">
                                                                            <div className="text-xs text-slate-500 dark:text-slate-400">Reward Amount</div>
                                                                            <div className="text-xs text-slate-500 dark:text-slate-400">Time</div>
                                                                        </div>
                                                                        <div className="relative h-52 w-full">
                                                                            <div className="absolute bottom-0 left-0 right-0 top-0">
                                                                                {/* Simple chart visualization */}
                                                                                <div className="relative h-full w-full">
                                                                                    <div className="absolute inset-0 flex items-end justify-between px-2">
                                                                                        {getSelectedProtocolInsights()?.rewardHistory?.map((point, i) => (
                                                                                            <div key={i} className="flex flex-col items-center">
                                                                                                <div
                                                                                                    className="bg-orange-500 dark:bg-orange-400 rounded-t w-10"
                                                                                                    style={{ height: `${(point.amount / (getSelectedProtocolInsights()?.rewardHistory?.reduce((max, p) => Math.max(max, p.amount), 0) || 1)) * 80}%` }}
                                                                                                ></div>
                                                                                                <span className="text-xs mt-1">{point.date}</span>
                                                                                            </div>
                                                                                        ))}
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                </div>
                                            )}

                                            {/* Token Details */}
                                            {getSelectedProtocolInsights()?.tokenDetails && (
                                                <div className="dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg">
                                                    <h3 className="text-lg font-semibold mb-3">Reward Token Details</h3>
                                                    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                                                        <div className="grid grid-cols-18 text-sm font-medium bg-slate-50 dark:bg-slate-800/80 p-3 border-b border-slate-200 dark:border-slate-700">
                                                            <div className="col-span-5">Token</div>
                                                            <div className="col-span-4 text-center">Price</div>
                                                            <div className="col-span-3 text-center">24h Change</div>
                                                            <div className="col-span-3 text-center">Market Cap</div>
                                                            <div className="col-span-3 text-center">Volume</div>
                                                        </div>

                                                        {getSelectedProtocolInsights()?.tokenDetails?.map((token, i) => (
                                                            <div key={i} className="grid grid-cols-18 p-3 text-sm border-b border-slate-200 dark:border-slate-700 last:border-0">
                                                                <div className="col-span-5">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="font-medium">{token.token}</span>
                                                                        <Badge variant="outline" className="text-xs px-1.5 py-0 h-5">
                                                                            {token.ticker}
                                                                        </Badge>
                                                                    </div>
                                                                </div>
                                                                <div className="col-span-4 text-center font-medium">{token.price}</div>
                                                                <div className="col-span-3 text-center">
                                                                    <Badge className={cn(
                                                                        token.change24h.startsWith("+")
                                                                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                                                            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                                                    )}>
                                                                        {token.change24h}
                                                                    </Badge>
                                                                </div>
                                                                <div className="col-span-3 text-center">{token.marketCap}</div>
                                                                <div className="col-span-3 text-center">{token.volume}</div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Recommended Strategies */}
                                            {getSelectedProtocolInsights()?.recommendations && (
                                                <div className="dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg">
                                                    <h3 className="text-lg font-semibold mb-3">Recommended Claiming Strategies</h3>
                                                    <div className="space-y-4">
                                                        {getSelectedProtocolInsights()?.recommendations.map((rec, i) => (
                                                            <Card key={i} className="bg-orange-50/50 dark:bg-orange-900/10 border-orange-100 dark:border-orange-900/30">
                                                                <CardContent className="p-4">
                                                                    <div className="flex gap-3">
                                                                        <Badge className={cn(
                                                                            "h-fit",
                                                                            rec.impact === "high"
                                                                                ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                                                                                : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                                                        )}>
                                                                            {rec.impact === "high" ? "High Impact" : "Medium Impact"}
                                                                        </Badge>
                                                                        <div>
                                                                            <h4 className="font-medium text-orange-800 dark:text-orange-300">{rec.title}</h4>
                                                                            <p className="text-sm mt-1 text-slate-700 dark:text-slate-300">{rec.reason}</p>
                                                                            <div className="mt-3 flex justify-between items-center">
                                                                                <p className="text-xs italic text-slate-600 dark:text-slate-400">
                                                                                    <span className="font-medium">Implementation:</span> {rec.implementation}
                                                                                </p>
                                                                                <Button
                                                                                    size="sm"
                                                                                    onClick={() => {
                                                                                        setInsightModalOpen(false);
                                                                                        setCreateTaskModalOpen(true);
                                                                                    }}
                                                                                    className="text-xs h-8 gap-1 bg-orange-600 hover:bg-orange-700 text-white"
                                                                                >
                                                                                    <Zap className="h-3 w-3" />
                                                                                    Create Task
                                                                                </Button>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </CardContent>
                                                            </Card>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Optimization Opportunities */}
                                            {getSelectedProtocolInsights()?.opportunities && (
                                                <div className="dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg">
                                                    <h3 className="text-lg font-semibold mb-3">Reward Optimization Opportunities</h3>
                                                    <div className="space-y-4">
                                                        {getSelectedProtocolInsights()?.opportunities.map((opp, i) => (
                                                            <Card key={i}>
                                                                <CardContent className="p-4">
                                                                    <div className="flex items-start justify-between">
                                                                        <div>
                                                                            <div className="flex items-center gap-2">
                                                                                <h4 className="font-medium">{opp.title}</h4>
                                                                                <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                                                                    {opp.timeWindow}
                                                                                </Badge>
                                                                            </div>
                                                                            <p className="text-sm mt-1 text-slate-600 dark:text-slate-400">{opp.description}</p>
                                                                        </div>
                                                                        <div className="text-right">
                                                                            <div className="text-sm font-medium text-green-600 dark:text-green-400">
                                                                                {opp.expectedReward}
                                                                            </div>
                                                                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                                                Gas: {opp.gasCost}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="mt-3 bg-slate-50 dark:bg-slate-800 rounded-md p-3 text-sm">
                                                                        <div className="flex justify-between items-center">
                                                                            <div>
                                                                                <span className="font-medium">Recommendation:</span> {opp.recommendation}
                                                                            </div>
                                                                            <Button
                                                                                variant="outline"
                                                                                size="sm"
                                                                                onClick={() => {
                                                                                    setInsightModalOpen(false);
                                                                                    setCreateTaskModalOpen(true);
                                                                                }}
                                                                                className="h-7 text-xs border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300"
                                                                            >
                                                                                Set Up Claim
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                </CardContent>
                                                            </Card>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </ScrollArea>

                                    <DialogFooter className="px-6 py-4 border-t border-slate-200 dark:border-slate-800">
                                        <div className="flex items-center justify-between w-full dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg">
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                Data based on current protocol rewards and claiming analytics
                                            </p>
                                            <div className="flex gap-2">
                                                <Button variant="outline" onClick={() => setInsightModalOpen(false)} className="dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg">
                                                    Close
                                                </Button>
                                                <Button
                                                    onClick={() => {
                                                        setInsightModalOpen(false);
                                                        setCreateTaskModalOpen(true);
                                                    }}
                                                    className="gap-1 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white"
                                                >
                                                    <PlusCircle className="h-4 w-4" />
                                                    Create Claim Task
                                                </Button>
                                            </div>
                                        </div>
                                    </DialogFooter>
                                </div>
                            )}
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* Create Task Modal */}
            <CreateTaskModal
                open={createTaskModalOpen}
                onOpenChange={setCreateTaskModalOpen}
                onTaskCreated={(newTask) => {
                    // Handle new task if needed
                    setCreateTaskModalOpen(false);
                }}
            />
        </div>
    );
};

export default ClaimRewardsPage;