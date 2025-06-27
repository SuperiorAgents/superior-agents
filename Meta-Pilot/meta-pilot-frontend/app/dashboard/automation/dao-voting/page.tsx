"use client";

import React, { useState } from "react";
import {
    Vote,
    ArrowRight,
    PlusCircle,
    RefreshCw,
    TrendingUp,
    Clock,
    ExternalLink,
    Users,
    Info,
    Zap,
    CheckCircle2,
    MoreHorizontal,
    Eye,
    Sparkles,
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
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import CreateTaskModal from "@/components/Dashbaord/Tasks/CreateTaskModal";


type DAOInsight = {
    name: string;
    logo: string;
    summary: string;
    stats: {
        participation: string;
        participationChange: string;
        treasuryValue: string;
        treasuryChange: string;
        proposalsWeekly: number;
        proposalSuccess: string;
    };
    votingTrends?: { week: string; participation: number }[];  // Optional property
    keyVotingThemes?: { theme: string; volume: number; success: number }[];  // Optional property
    recommendations: {
        title: string;
        reason: string;
        impact: string;
        implementation: string;
    }[];
    upcomingVotes: {
        title: string;
        description: string;
        timeRemaining: string;
        importance: string;
        recommendation: string;
    }[];
};


const DAOVotingPage = () => {
    const [createTaskModalOpen, setCreateTaskModalOpen] = useState(false);
    const [insightModalOpen, setInsightModalOpen] = useState(false);
    const [selectedDAO, setSelectedDAO] = useState<string | null>(null);
    const [insightLoading, setInsightLoading] = useState(false);

    // Function to open DAO insight modal
    const openDAOInsight = (daoId: string) => {
        setSelectedDAO(daoId);
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
            dao: "Uniswap",
            icon: "/icons/uniswap.svg",
            rule: "Vote YES if proposal reduces treasury spending",
            nextVote: "Estimated in 2 days",
            status: "active"
        }
    ];

    // Recent tasks history
    const tasksHistory = [
        {
            id: "history-1",
            dao: "Nouns DAO",
            icon: "/icons/nouns.svg",
            rule: "Vote YES if proposal mentions rewards or incentives",
            completedDate: "May 10, 2023",
            votes: 7,
            outcome: "successful"
        },
        {
            id: "history-2",
            dao: "ENS DAO",
            icon: "/icons/ens.svg",
            rule: "Vote YES if proposal improves governance processes",
            completedDate: "Apr 28, 2023",
            votes: 3,
            outcome: "successful"
        }
    ];

    // DAO data for insights
    const daoData = [
        {
            id: "nouns",
            name: "Nouns DAO",
            icon: "/icons/nouns.svg",
            activeProposals: 5,
            participation: 67,
            participationTrend: "+5.2%",
            treasury: "$42.3M",
            activityLevel: "high"
        },
        {
            id: "uniswap",
            name: "Uniswap",
            icon: "/icons/uniswap.svg",
            activeProposals: 7,
            participation: 58,
            participationTrend: "+6.1%",
            treasury: "$245.9M",
            activityLevel: "medium"
        },
        {
            id: "ens",
            name: "ENS DAO",
            icon: "/icons/ens.svg",
            activeProposals: 3,
            participation: 72,
            participationTrend: "+3.8%",
            treasury: "$72.1M",
            activityLevel: "high"
        },
        {
            id: "compound",
            name: "Compound",
            icon: "/icons/compound.svg",
            activeProposals: 2,
            participation: 59,
            participationTrend: "-2.3%",
            treasury: "$156.8M",
            activityLevel: "medium"
        },
        {
            id: "aave",
            name: "Aave",
            icon: "/icons/aave.svg",
            activeProposals: 4,
            participation: 64,
            participationTrend: "+0.7%",
            treasury: "$123.4M",
            activityLevel: "medium"
        }
    ];

    // Detailed insight data for each DAO
    const daoInsights: Record<string, DAOInsight> = {
        "nouns": {
            name: "Nouns DAO",
            logo: "/icons/nouns.svg",
            summary: "Growing participation with focus on treasury diversification and art initiatives.",
            stats: {
                participation: "67%",
                participationChange: "+5.2%",
                treasuryValue: "$42.3M",
                treasuryChange: "+2.1%",
                proposalsWeekly: 5.2,
                proposalSuccess: "73%"
            },
            votingTrends: [
                { week: "Week 1", participation: 62 },
                { week: "Week 2", participation: 58 },
                { week: "Week 3", participation: 65 },
                { week: "Week 4", participation: 67 }
            ],
            keyVotingThemes: [
                { theme: "Treasury Diversification", volume: 32, success: 89 },
                { theme: "Artist Grants", volume: 28, success: 75 },
                { theme: "Protocol Upgrades", volume: 18, success: 61 },
                { theme: "Community Development", volume: 22, success: 82 }
            ],
            recommendations: [
                {
                    title: "Adopt 'Yes' voting for artist grants",
                    reason: "Strong community sentiment (89% approval rate) for supporting creators and artists",
                    impact: "high",
                    implementation: "Configure rule to detect artistic and creative grant proposals"
                },
                {
                    title: "Treasury diversification evaluation",
                    reason: "Complex treasury management proposals are frequent but require careful evaluation",
                    impact: "medium",
                    implementation: "Set rule to notify but not auto-vote on these proposals"
                }
            ],
            upcomingVotes: [
                {
                    title: "Nouns Art Bounty Program",
                    description: "Allocate 25 ETH for the quarterly NFT art bounty program",
                    timeRemaining: "2 days",
                    importance: "high",
                    recommendation: "Vote YES based on historical success of art initiatives"
                },
                {
                    title: "Treasury Diversification into stETH",
                    description: "Convert 15% of ETH treasury to stETH for yield generation",
                    timeRemaining: "5 days",
                    importance: "critical",
                    recommendation: "Manual review recommended due to financial impact"
                }
            ]
        },
        "uniswap": {
            name: "Uniswap",
            logo: "/icons/uniswap.svg",
            summary: "Fee structure and V4 development dominate discussions with rising voter engagement.",
            stats: {
                participation: "58%",
                participationChange: "+6.1%",
                treasuryValue: "$245.9M",
                treasuryChange: "-0.8%",
                proposalsWeekly: 3.7,
                proposalSuccess: "65%"
            },
            votingTrends: [
                { week: "Week 1", participation: 52 },
                { week: "Week 2", participation: 54 },
                { week: "Week 3", participation: 57 },
                { week: "Week 4", participation: 58 }
            ],
            keyVotingThemes: [
                { theme: "Fee Adjustments", volume: 35, success: 72 },
                { theme: "New Chain Deployments", volume: 28, success: 81 },
                { theme: "Protocol Upgrades", volume: 26, success: 68 },
                { theme: "Grants", volume: 11, success: 59 }
            ],
            recommendations: [
                {
                    title: "Support fee structure optimization",
                    reason: "Consistent success rate (72%) for fee adjustment proposals that optimize for market conditions",
                    impact: "high",
                    implementation: "Rule to vote YES on fee proposals with data-supported ROI"
                },
                {
                    title: "Favor multi-chain expansion",
                    reason: "Strong support (81%) for deployment to new chains, boosting protocol adoption",
                    impact: "medium",
                    implementation: "Create rule recognizing chain deployment keywords"
                }
            ],
            upcomingVotes: [
                {
                    title: "Fee Structure Adjustment for V3",
                    description: "Modify fee tiers to optimize for current market volatility",
                    timeRemaining: "4 days",
                    importance: "critical",
                    recommendation: "Vote YES based on technical analysis provided"
                },
                {
                    title: "Base Chain Integration Funding",
                    description: "Allocate resources for expanded deployment on Base",
                    timeRemaining: "6 days",
                    importance: "medium",
                    recommendation: "Auto-vote YES based on historical support for expansion"
                }
            ]
        },
        "ens": {
            name: "ENS DAO",
            logo: "/icons/ens.svg",
            summary: "Governance improvements and name service expansions show strong community support.",
            stats: {
                participation: "72%",
                participationChange: "+3.8%",
                treasuryValue: "$72.1M",
                treasuryChange: "+5.2%",
                proposalsWeekly: 3.2,
                proposalSuccess: "77%"
            },
            votingTrends: [
                { week: "Week 1", participation: 70 },
                { week: "Week 2", participation: 69 },
                { week: "Week 3", participation: 71 },
                { week: "Week 4", participation: 72 }
            ],
            keyVotingThemes: [
                { theme: "Name Service Enhancements", volume: 42, success: 85 },
                { theme: "Governance Improvements", volume: 35, success: 79 },
                { theme: "Treasury Management", volume: 23, success: 67 },
                { theme: "Community Grants", volume: 20, success: 72 }
            ],
            recommendations: [
                {
                    title: "Strongly support service enhancements",
                    reason: "Very high success rate (85%) for proposals improving ENS functionality",
                    impact: "high",
                    implementation: "Configure voting rule to detect technical improvement keywords"
                },
                {
                    title: "Back governance efficiency proposals",
                    reason: "Consistent support (79%) for streamlining decision processes",
                    impact: "medium",
                    implementation: "Set rule to detect governance optimization language"
                }
            ],
            upcomingVotes: [
                {
                    title: "L2 Name Resolution Implementation",
                    description: "Deploy name resolution capabilities to Layer 2 networks",
                    timeRemaining: "3 days",
                    importance: "high",
                    recommendation: "Vote YES based on technical roadmap alignment"
                },
                {
                    title: "Governance Participation Incentives",
                    description: "Implement rewards for consistent voting participation",
                    timeRemaining: "7 days",
                    importance: "medium",
                    recommendation: "Auto-vote YES based on governance improvement history"
                }
            ]
        },
        "compound": {
            name: "Compound",
            logo: "/icons/compound.svg",
            summary: "Protocol parameter adjustments dominate with declining participation rates.",
            stats: {
                participation: "59%",
                participationChange: "-2.3%",
                treasuryValue: "$156.8M",
                treasuryChange: "-1.5%",
                proposalsWeekly: 2.8,
                proposalSuccess: "69%"
            },
            recommendations: [
                {
                    title: "Cautious approach to parameter changes",
                    reason: "Mixed success rates for protocol parameter changes suggest community division",
                    impact: "medium",
                    implementation: "Set rules with stricter criteria for technical parameter proposals"
                }
            ],
            upcomingVotes: [
                {
                    title: "Risk Parameter Adjustment",
                    description: "Modify collateral factors for certain assets",
                    timeRemaining: "4 days",
                    importance: "high",
                    recommendation: "Manual review recommended due to technical complexity"
                }
            ]
        },
        "aave": {
            name: "Aave",
            logo: "/icons/aave.svg",
            summary: "Stability in governance with focus on asset listings and risk management.",
            stats: {
                participation: "64%",
                participationChange: "+0.7%",
                treasuryValue: "$123.4M",
                treasuryChange: "+0.5%",
                proposalsWeekly: 3.1,
                proposalSuccess: "71%"
            },
            recommendations: [
                {
                    title: "Support risk-managed asset listings",
                    reason: "Strong success rate for asset listings with proper risk parameters",
                    impact: "medium",
                    implementation: "Create rule to detect asset listing proposals with robust risk analysis"
                }
            ],
            upcomingVotes: [
                {
                    title: "New Asset Listing: sUSD",
                    description: "Add sUSD as a supported asset with initial parameters",
                    timeRemaining: "5 days",
                    importance: "medium",
                    recommendation: "Vote YES if risk parameters match standard protocol requirements"
                }
            ]
        }
    };

    // Get selected DAO insights
    const getSelectedDAOInsights = () => {
        if (!selectedDAO) return null;
        return daoInsights[selectedDAO as keyof typeof daoInsights];
    };



    return (
        <div className="container mx-auto px-3 rounded-xl py-6 space-y-8 dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        <span className="flex items-center gap-2">
                            <Vote className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            DAO Voting Automation
                        </span>
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Automate your DAO governance votes based on custom rules and preferences
                    </p>
                </div>
                <Button
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                    onClick={() => setCreateTaskModalOpen(true)}
                >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Voting Task
                </Button>
            </div>

            {/* Interactive DAO Insights Section */}
            <Card className="border-indigo-100 dark:bg-slate-900/90  dark:border-indigo-900/30 shadow-lg overflow-hidden">
                <CardHeader className="pb-0">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-amber-500" />
                            <CardTitle className="text-lg">Interactive DAO Intelligence</CardTitle>
                        </div>
                        <Badge variant="outline" className="px-2 py-1 text-xs bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                            <Clock className="mr-1 h-3 w-3" />
                            Live Data
                        </Badge>
                    </div>
                    <CardDescription>
                        Get actionable insights, market trends, and optimal voting strategies for popular DAOs
                    </CardDescription>
                </CardHeader>

                <CardContent className="p-0 mt-4">
                    <div className="p-4 bg-gradient-to-b from-blue-50/50 to-indigo-50/30 dark:from-blue-950/20 dark:to-indigo-950/10 border-y border-blue-100/50 dark:border-blue-800/30 mb-4">
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                            Click on any DAO to view detailed market insights, analyze voting patterns, and get personalized recommendations for setting up automated voting rules.
                        </p>
                    </div>

                    {/* DAO Insights Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                        {daoData.map(dao => (
                            <Card
                                key={dao.id}
                                className="group hover:border-blue-300 dark:hover:border-blue-700 
                                transition-all cursor-pointer relative overflow-hidden dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg"
                                onClick={() => openDAOInsight(dao.id)}
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3 mb-3">
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src={dao.icon} alt={dao.name} />
                                            <AvatarFallback className="bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-200">
                                                {dao.name.substring(0, 2)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h3 className="font-semibold">{dao.name}</h3>
                                            <Badge variant="outline" className={cn(
                                                "mt-1",
                                                dao.activityLevel === "high"
                                                    ? "border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                                                    : "border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400"
                                            )}>
                                                <TrendingUp className="mr-1 h-3 w-3" />
                                                {dao.activityLevel === "high" ? "High Activity" : "Medium Activity"}
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className="mb-3 text-sm">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-slate-600 dark:text-slate-400">Voter Participation</span>
                                            <span className="font-medium">{dao.participation}%
                                                <span className={cn(
                                                    "text-xs ml-1",
                                                    dao.participationTrend.startsWith("+")
                                                        ? "text-green-600 dark:text-green-400"
                                                        : "text-red-600 dark:text-red-400"
                                                )}>
                                                    {dao.participationTrend}
                                                </span>
                                            </span>
                                        </div>
                                        <Progress value={dao.participation} className="h-1.5" />
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 mb-3">
                                        <div className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded-md">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-slate-500 dark:text-slate-400">Active Proposals</span>
                                                <span className="font-medium">{dao.activeProposals}</span>
                                            </div>
                                        </div>
                                        <div className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded-md">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-slate-500 dark:text-slate-400">Treasury</span>
                                                <span className="font-medium">{dao.treasury}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full gap-1 group-hover:bg-blue-50 group-hover:text-blue-600
                                         dark:group-hover:bg-blue-900/20 dark:group-hover:text-blue-400
                                        group-hover:border-blue-200 dark:group-hover:border-blue-800
                                        dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg
                                        "
                                    >
                                        <Eye className="h-3.5 w-3.5" />
                                        View Market Insights
                                    </Button>

                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-blue-500/5 dark:to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
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
                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                                Active Voting Tasks
                            </CardTitle>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 gap-1 text-blue-600"
                                onClick={() => setCreateTaskModalOpen(true)}
                            >
                                <PlusCircle className="h-3.5 w-3.5" />
                                <span>Add New</span>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {activeTasks.length > 0 ? (
                            <div className="space-y-4">
                                {activeTasks.map(task => (
                                    <div
                                        key={task.id}
                                        className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700"
                                    >
                                        <div className="flex items-start gap-3">
                                            <Avatar className="h-10 w-10 mt-1">
                                                <AvatarImage src={task.icon} alt={task.dao} />
                                                <AvatarFallback className="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200">
                                                    {task.dao.substring(0, 2)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <h4 className="font-medium text-slate-900 dark:text-white">{task.dao}</h4>
                                                        <Badge className="mt-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 font-normal">
                                                            Active
                                                        </Badge>
                                                    </div>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                                                    <span className="font-medium">Rule:</span> {task.rule}
                                                </p>
                                                <div className="flex items-center gap-1 mt-3 text-xs text-slate-500 dark:text-slate-400">
                                                    <Clock className="h-3.5 w-3.5" />
                                                    <span>{task.nextVote}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-center border border-dashed border-slate-300 dark:border-slate-700 rounded-lg">
                                <Vote className="h-10 w-10 text-slate-300 dark:text-slate-700 mb-2" />
                                <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-1">No active tasks</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-4">
                                    You don't have any active DAO voting tasks. Create one to start automating your governance.
                                </p>
                                <Button
                                    size="sm"
                                    onClick={() => setCreateTaskModalOpen(true)}
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
                            <CheckCircle2 className="h-5 w-5 text-purple-500" />
                            Recent Voting History
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
                                                <AvatarImage src={task.icon} alt={task.dao} />
                                                <AvatarFallback className="bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-200">
                                                    {task.dao.substring(0, 2)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <h4 className="font-medium text-slate-900 dark:text-white">{task.dao}</h4>
                                                        <Badge className="mt-1 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 font-normal">
                                                            Completed
                                                        </Badge>
                                                    </div>
                                                    <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                                        {task.votes} votes cast
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                                                    <span className="font-medium">Rule:</span> {task.rule}
                                                </p>
                                                <div className="flex items-center gap-1 mt-3 text-xs text-slate-500 dark:text-slate-400">
                                                    <Clock className="h-3.5 w-3.5" />
                                                    <span>Last active: {task.completedDate}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <div className="flex justify-center pt-2">
                                    <Button variant="link" className="text-blue-600 dark:text-blue-400 h-auto p-0">
                                        View All History
                                        <ArrowRight className="ml-1 h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-center border border-dashed border-slate-300 dark:border-slate-700 rounded-lg">
                                <Vote className="h-10 w-10 text-slate-300 dark:text-slate-700 mb-2" />
                                <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-1">No voting history</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
                                    Your completed voting tasks will appear here
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Resources Section */}
            <Card className="dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg">
                <CardHeader>
                    <CardTitle className="text-lg">Resources & Documentation</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                            <h3 className="font-semibold mb-2 flex items-center gap-2">
                                <Info className="h-4 w-4 text-blue-600" />
                                <span>DAO Voting Guide</span>
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                                Learn how to optimize your DAO voting strategy using automation
                            </p>
                            <Button variant="link" className="h-auto p-0 text-blue-600 dark:text-blue-400">
                                Read Guide
                                <ExternalLink className="ml-1 h-3 w-3" />
                            </Button>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                            <h3 className="font-semibold mb-2 flex items-center gap-2">
                                <Users className="h-4 w-4 text-purple-600" />
                                <span>Top DAO Voting Rules</span>
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                                Browse popular automation rules used by other MetaPilot users
                            </p>
                            <Button variant="link" className="h-auto p-0 text-blue-600 dark:text-blue-400">
                                See Examples
                                <ExternalLink className="ml-1 h-3 w-3" />
                            </Button>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                            <h3 className="font-semibold mb-2 flex items-center gap-2">
                                <Zap className="h-4 w-4 text-amber-600" />
                                <span>Advanced Features</span>
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                                Discover power-user settings for DAO voting automation
                            </p>
                            <Button variant="link" className="h-auto p-0 text-blue-600 dark:text-blue-400">
                                View Docs
                                <ExternalLink className="ml-1 h-3 w-3" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* DAO Insights Modal */}
            <Dialog open={insightModalOpen} onOpenChange={setInsightModalOpen}>
                <DialogContent className="sm:max-w-[900px] p-0 max-h-[90vh] overflow-hidden dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg">
                    {insightLoading ? (
                        <div className="flex items-center justify-center p-8">
                            <div className="text-center">
                                <RefreshCw className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium">Loading insights...</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                                    Fetching the latest market data and voting patterns
                                </p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {selectedDAO && (
                                <div className="flex flex-col h-full max-h-[90vh]">
                                    <DialogHeader className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10">
                                                <AvatarImage src={daoInsights[selectedDAO as keyof typeof daoInsights]?.logo} />
                                                <AvatarFallback className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                                                    {daoInsights[selectedDAO as keyof typeof daoInsights]?.name.substring(0, 2)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <DialogTitle className="text-xl">
                                                    {daoInsights[selectedDAO as keyof typeof daoInsights]?.name} Insights
                                                </DialogTitle>
                                                <DialogDescription>
                                                    Market analysis and voting strategy recommendations
                                                </DialogDescription>
                                            </div>
                                        </div>
                                    </DialogHeader>

                                    <ScrollArea className="flex-1 px-6 py-4 h-full">
                                        <div className="space-y-6">
                                            {/* Summary */}
                                            <div>
                                                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 rounded-lg p-4">
                                                    <p className="text-blue-800 dark:text-blue-300">
                                                        {getSelectedDAOInsights()?.summary}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Stats Overview */}
                                            <div>
                                                <h3 className="text-lg font-semibold mb-3">Overview</h3>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                                    <Card className="bg-slate-50/50 dark:bg-slate-800/20">
                                                        <CardContent className="p-4">
                                                            <p className="text-sm text-muted-foreground mb-1">Voter Participation</p>
                                                            <div className="flex items-baseline">
                                                                <span className="text-2xl font-bold">{getSelectedDAOInsights()?.stats.participation}</span>
                                                                <Badge className={cn(
                                                                    "ml-2",
                                                                    getSelectedDAOInsights()?.stats.participationChange.startsWith("+")
                                                                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                                                        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                                                )}>
                                                                    {getSelectedDAOInsights()?.stats.participationChange}
                                                                </Badge>
                                                            </div>
                                                        </CardContent>
                                                    </Card>

                                                    <Card className="bg-slate-50/50 dark:bg-slate-800/20">
                                                        <CardContent className="p-4">
                                                            <p className="text-sm text-muted-foreground mb-1">Treasury</p>
                                                            <div className="flex items-baseline">
                                                                <span className="text-2xl font-bold">{getSelectedDAOInsights()?.stats.treasuryValue}</span>
                                                                <Badge className={cn(
                                                                    "ml-2",
                                                                    getSelectedDAOInsights()?.stats.treasuryChange.startsWith("+")
                                                                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                                                        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                                                )}>
                                                                    {getSelectedDAOInsights()?.stats.treasuryChange}
                                                                </Badge>
                                                            </div>
                                                        </CardContent>
                                                    </Card>

                                                    <Card className="bg-slate-50/50 dark:bg-slate-800/20">
                                                        <CardContent className="p-4">
                                                            <p className="text-sm text-muted-foreground mb-1">Proposals Success Rate</p>
                                                            <div className="flex items-baseline">
                                                                <span className="text-2xl font-bold">{getSelectedDAOInsights()?.stats.proposalSuccess}</span>
                                                                <span className="text-sm text-slate-500 dark:text-slate-400 ml-2">
                                                                    ({getSelectedDAOInsights()?.stats.proposalsWeekly}/week)
                                                                </span>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                </div>
                                            </div>

                                            {/* Key Voting Themes */}
                                            {getSelectedDAOInsights()?.keyVotingThemes && (
                                                <div>
                                                    <h3 className="text-lg font-semibold mb-3">Key Voting Themes</h3>
                                                    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                                                        <div className="grid grid-cols-12 text-sm font-medium bg-slate-50 dark:bg-slate-800/80 p-3 border-b border-slate-200 dark:border-slate-700">
                                                            <div className="col-span-6">Theme</div>
                                                            <div className="col-span-3 text-center">Proposals</div>
                                                            <div className="col-span-3 text-center">Success Rate</div>
                                                        </div>

                                                        {getSelectedDAOInsights()?.keyVotingThemes?.map((theme, i) => (
                                                            <div key={i} className="grid grid-cols-12 p-3 text-sm border-b border-slate-200 dark:border-slate-700 last:border-0">
                                                                <div className="col-span-6 font-medium">{theme.theme}</div>
                                                                <div className="col-span-3 text-center">{theme.volume}</div>
                                                                <div className="col-span-3 text-center">
                                                                    <Badge className={cn(
                                                                        theme.success >= 75
                                                                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                                                            : theme.success >= 60
                                                                                ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                                                                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                                                    )}>
                                                                        {theme.success}%
                                                                    </Badge>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Recommended Voting Strategies */}
                                            {getSelectedDAOInsights()?.recommendations && (
                                                <div>
                                                    <h3 className="text-lg font-semibold mb-3">Recommended Strategies</h3>
                                                    <div className="space-y-4">
                                                        {getSelectedDAOInsights()?.recommendations.map((rec, i) => (
                                                            <Card key={i} className="bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30">
                                                                <CardContent className="p-4">
                                                                    <div className="flex gap-3">
                                                                        <Badge className={cn(
                                                                            "h-fit",
                                                                            rec.impact === "high"
                                                                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                                                                : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                                                        )}>
                                                                            {rec.impact === "high" ? "High Impact" : "Medium Impact"}
                                                                        </Badge>
                                                                        <div>
                                                                            <h4 className="font-medium text-blue-800 dark:text-blue-300">{rec.title}</h4>
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
                                                                                    className="text-xs h-8 gap-1"
                                                                                >
                                                                                    <Zap className="h-3 w-3" />
                                                                                    Create Rule
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

                                            {/* Upcoming Critical Votes */}
                                            {getSelectedDAOInsights()?.upcomingVotes && (
                                                <div>
                                                    <h3 className="text-lg font-semibold mb-3">Upcoming Critical Votes</h3>
                                                    <div className="space-y-4">
                                                        {getSelectedDAOInsights()?.upcomingVotes.map((vote, i) => (
                                                            <Card key={i} className="dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg">
                                                                <CardContent className="p-4">
                                                                    <div className="flex items-start justify-between">
                                                                        <div>
                                                                            <div className="flex items-center gap-2">
                                                                                <h4 className="font-medium">{vote.title}</h4>
                                                                                <Badge className={cn(
                                                                                    vote.importance === "critical"
                                                                                        ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                                                                        : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                                                                )}>
                                                                                    {vote.importance === "critical" ? "Critical" : "Important"}
                                                                                </Badge>
                                                                            </div>
                                                                            <p className="text-sm mt-1 text-slate-600 dark:text-slate-400">{vote.description}</p>
                                                                        </div>
                                                                        <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                                                                            <Clock className="h-3.5 w-3.5" />
                                                                            <span>In {vote.timeRemaining}</span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-md text-sm">
                                                                        <span className="font-medium">Recommendation:</span> {vote.recommendation}
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
                                        <div className="flex items-center justify-between w-full">
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                Data based on historical voting patterns and market analysis
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
                                                    className="gap-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                                                >
                                                    <PlusCircle className="h-4 w-4" />
                                                    Create Voting Task
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

export default DAOVotingPage;