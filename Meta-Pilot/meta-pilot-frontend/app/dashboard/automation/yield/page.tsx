"use client";

import React, { useState } from "react";
import {
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
    Sparkles,
    DollarSign,
    ShieldCheck
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
type PlatformInsight = {
    name: string;
    logo: string;
    summary: string;
    stats: {
        currentAPY: string;
        apyChange: string;
        tvl: string;
        tvlChange: string;
        risk: string;
        volatility: string;
    };
    yieldTrends?: { week: string; apy: number }[];
    assetPerformance?: { asset: string; apy: number; risk: string; volume: number }[];
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
        expectedAPY: string;
        risk: string;
        recommendation: string;
    }[];
};

const YieldFarmingPage = () => {
    const [createTaskModalOpen, setCreateTaskModalOpen] = useState(false);
    const [insightModalOpen, setInsightModalOpen] = useState(false);
    const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
    const [insightLoading, setInsightLoading] = useState(false);

    // Function to open platform insight modal
    const openPlatformInsight = (platformId: string) => {
        setSelectedPlatform(platformId);
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
            platform: "Yearn Finance",
            icon: "/icons/yearn.svg",
            assets: "USDC",
            rule: "Optimize for highest APY with low risk",
            nextCheck: "Every 24 hours",
            status: "active",
            currentAPY: "7.5%"
        }
    ];

    // Recent tasks history
    const tasksHistory = [
        {
            id: "history-1",
            platform: "Aave",
            icon: "/icons/aave.svg",
            assets: "ETH",
            rule: "Optimize for highest stable yield",
            completedDate: "May 12, 2023",
            actions: 3,
            outcome: "successful",
            avgAPY: "4.2%"
        },
        {
            id: "history-2",
            platform: "Compound",
            icon: "/icons/compound.svg",
            assets: "DAI",
            rule: "Move funds when yield differs by 0.5% or more",
            completedDate: "Apr 30, 2023",
            actions: 2,
            outcome: "successful",
            avgAPY: "3.8%"
        }
    ];

    // Yield platform data for insights
    const platformData = [
        {
            id: "aave",
            name: "Aave",
            icon: "/icons/aave.svg",
            assets: ["USDC", "ETH", "DAI", "USDT"],
            apy: "4.2%",
            apyTrend: "+0.3%",
            tvl: "$3.8B",
            risk: "low"
        },
        {
            id: "compound",
            name: "Compound",
            icon: "/icons/compound.svg",
            assets: ["USDC", "ETH", "DAI"],
            apy: "3.8%",
            apyTrend: "-0.1%",
            tvl: "$2.1B",
            risk: "low"
        },
        {
            id: "yearn",
            name: "Yearn Finance",
            icon: "/icons/yearn.svg",
            assets: ["USDC", "ETH", "DAI", "USDT", "WBTC"],
            apy: "7.5%",
            apyTrend: "+1.2%",
            tvl: "$498M",
            risk: "medium"
        },
        {
            id: "convex",
            name: "Convex Finance",
            icon: "/icons/convex.svg",
            assets: ["USDC", "ETH", "DAI"],
            apy: "8.2%",
            apyTrend: "+0.5%",
            tvl: "$1.2B",
            risk: "medium"
        },
        {
            id: "lido",
            name: "Lido",
            icon: "/icons/lido.svg",
            assets: ["ETH"],
            apy: "3.9%",
            apyTrend: "+0.2%",
            tvl: "$15.6B",
            risk: "low"
        }
    ];

    // Detailed insight data for each platform
    const platformInsights: Record<string, PlatformInsight> = {
        "aave": {
            name: "Aave",
            logo: "/icons/aave.svg",
            summary: "Stable performance with balanced risk profile and strong liquidity across major assets.",
            stats: {
                currentAPY: "4.2%",
                apyChange: "+0.3%",
                tvl: "$3.8B",
                tvlChange: "+2.1%",
                risk: "Low",
                volatility: "Low"
            },
            yieldTrends: [
                { week: "Week 1", apy: 3.9 },
                { week: "Week 2", apy: 4.0 },
                { week: "Week 3", apy: 4.1 },
                { week: "Week 4", apy: 4.2 }
            ],
            assetPerformance: [
                { asset: "USDC", apy: 3.6, risk: "Low", volume: 980 },
                { asset: "ETH", apy: 2.9, risk: "Medium", volume: 780 },
                { asset: "DAI", apy: 3.8, risk: "Low", volume: 620 },
                { asset: "USDT", apy: 3.5, risk: "Low", volume: 540 }
            ],
            recommendations: [
                {
                    title: "Optimize stablecoin yield",
                    reason: "DAI consistently offers the highest stablecoin yield in Aave, outperforming USDC by 0.2%",
                    impact: "medium",
                    implementation: "Configure rule to prioritize DAI deposits for maximum stablecoin yield"
                },
                {
                    title: "Monitor for supply cap changes",
                    reason: "Recent governance proposals indicate potential supply cap increases, which could affect yields",
                    impact: "medium",
                    implementation: "Create notification rule for supply cap governance votes"
                }
            ],
            opportunities: [
                {
                    title: "DAI Lending Opportunity",
                    description: "Utilization rates for DAI are reaching optimal levels, pushing yields higher",
                    timeWindow: "1-2 weeks",
                    expectedAPY: "3.8-4.0%",
                    risk: "Low",
                    recommendation: "Allocate stablecoin positions to DAI for optimal risk-adjusted returns"
                },
                {
                    title: "ETH Yield Recovery",
                    description: "ETH borrowing demand is increasing after recent market volatility",
                    timeWindow: "2-4 weeks",
                    expectedAPY: "3.0-3.5%",
                    risk: "Medium",
                    recommendation: "Consider increasing ETH allocation if seeking exposure to ETH with yield"
                }
            ]
        },
        "compound": {
            name: "Compound",
            logo: "/icons/compound.svg",
            summary: "Consistent stablecoin yields with recent protocol upgrades improving capital efficiency.",
            stats: {
                currentAPY: "3.8%",
                apyChange: "-0.1%",
                tvl: "$2.1B",
                tvlChange: "-0.5%",
                risk: "Low",
                volatility: "Low"
            },
            yieldTrends: [
                { week: "Week 1", apy: 4.0 },
                { week: "Week 2", apy: 3.9 },
                { week: "Week 3", apy: 3.8 },
                { week: "Week 4", apy: 3.8 }
            ],
            assetPerformance: [
                { asset: "USDC", apy: 3.5, risk: "Low", volume: 860 },
                { asset: "ETH", apy: 2.6, risk: "Medium", volume: 620 },
                { asset: "DAI", apy: 3.6, risk: "Low", volume: 540 }
            ],
            recommendations: [
                {
                    title: "USDC-DAI rotation strategy",
                    reason: "Historical patterns show a yield rotation opportunity between these assets every 2-3 weeks",
                    impact: "low",
                    implementation: "Set up a rule to move between USDC and DAI based on 0.2% threshold difference"
                }
            ],
            opportunities: [
                {
                    title: "Stablecoin Yield Stability",
                    description: "Recent market volatility has minimal impact on Compound stablecoin yields",
                    timeWindow: "1-3 months",
                    expectedAPY: "3.5-3.8%",
                    risk: "Low",
                    recommendation: "Ideal for conservative portions of your portfolio seeking consistent returns"
                }
            ]
        },
        "yearn": {
            name: "Yearn Finance",
            logo: "/icons/yearn.svg",
            summary: "Highest yields among major platforms with optimized auto-compounding strategies.",
            stats: {
                currentAPY: "7.5%",
                apyChange: "+1.2%",
                tvl: "$498M",
                tvlChange: "+3.2%",
                risk: "Medium",
                volatility: "Medium"
            },
            yieldTrends: [
                { week: "Week 1", apy: 6.1 },
                { week: "Week 2", apy: 6.3 },
                { week: "Week 3", apy: 7.0 },
                { week: "Week 4", apy: 7.5 }
            ],
            assetPerformance: [
                { asset: "USDC", apy: 6.8, risk: "Medium", volume: 240 },
                { asset: "ETH", apy: 5.2, risk: "Medium-High", volume: 180 },
                { asset: "DAI", apy: 7.1, risk: "Medium", volume: 210 },
                { asset: "USDT", apy: 6.9, risk: "Medium", volume: 160 },
                { asset: "WBTC", apy: 4.8, risk: "Medium-High", volume: 90 }
            ],
            recommendations: [
                {
                    title: "Capitalize on DAI yield strategy",
                    reason: "Yearn's DAI vault consistently outperforms with optimal auto-compounding",
                    impact: "high",
                    implementation: "Allocate majority of stablecoin position to DAI vault with minimum 30-day hold"
                },
                {
                    title: "Monitor vault strategy changes",
                    reason: "Yearn frequently updates strategies which can temporarily affect yields",
                    impact: "medium",
                    implementation: "Create notification rule for vault strategy updates"
                }
            ],
            opportunities: [
                {
                    title: "DAI Vault Optimization",
                    description: "Recent strategy upgrade has significantly improved efficiency",
                    timeWindow: "Next 2-3 weeks",
                    expectedAPY: "7.0-7.5%",
                    risk: "Medium",
                    recommendation: "Optimal entry point for DAI positions seeking higher yields"
                },
                {
                    title: "ETH Vault Strategy Upgrade",
                    description: "Upcoming ETH vault strategy upgrade expected to boost yields",
                    timeWindow: "Within 1 week",
                    expectedAPY: "5.0-5.5%",
                    risk: "Medium-High",
                    recommendation: "Monitor for implementation and consider increasing allocation post-upgrade"
                }
            ]
        },
        "convex": {
            name: "Convex Finance",
            logo: "/icons/convex.svg",
            summary: "Highest overall APYs with boosted Curve LP incentives and CVX rewards.",
            stats: {
                currentAPY: "8.2%",
                apyChange: "+0.5%",
                tvl: "$1.2B",
                tvlChange: "+1.8%",
                risk: "Medium",
                volatility: "Medium-High"
            },
            recommendations: [
                {
                    title: "Focus on stablecoin LP positions",
                    reason: "Stablecoin pools consistently provide the best risk-adjusted returns",
                    impact: "high",
                    implementation: "Prioritize 3pool or similar stablecoin positions for optimal yields"
                }
            ],
            opportunities: [
                {
                    title: "Boosted stETH/ETH LP",
                    description: "Exceptional yields from combined CRV and CVX rewards",
                    timeWindow: "2-4 weeks",
                    expectedAPY: "8.0-9.5%",
                    risk: "Medium",
                    recommendation: "Consider allocating to this pool if comfortable with some ETH price exposure"
                }
            ]
        },
        "lido": {
            name: "Lido",
            logo: "/icons/lido.svg",
            summary: "Consistent ETH staking yields with growing adoption and liquid staking benefits.",
            stats: {
                currentAPY: "3.9%",
                apyChange: "+0.2%",
                tvl: "$15.6B",
                tvlChange: "+5.1%",
                risk: "Low",
                volatility: "Low"
            },
            recommendations: [
                {
                    title: "Long-term ETH position",
                    reason: "Lido offers the most liquid staking solution with consistent rewards",
                    impact: "medium",
                    implementation: "Stake ETH for long-term passive yield"
                }
            ],
            opportunities: [
                {
                    title: "stETH in DeFi strategies",
                    description: "Use stETH as collateral or in LP positions to stack yields",
                    timeWindow: "Ongoing",
                    expectedAPY: "3.9% base + additional DeFi yield",
                    risk: "Varies",
                    recommendation: "Consider additional DeFi strategies using stETH to enhance base yields"
                }
            ]
        }
    };

    // Get selected platform insights
    const getSelectedPlatformInsights = () => {
        if (!selectedPlatform) return null;
        return platformInsights[selectedPlatform];
    };

    return (
        <div className="container mx-auto py-6 space-y-8">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 ">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        <span className="flex items-center gap-2">
                            <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
                            Yield Farming Automation
                        </span>
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Optimize your yields by automatically moving funds between DeFi platforms
                    </p>
                </div>
                <Button
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                    onClick={() => setCreateTaskModalOpen(true)}
                >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Yield Task
                </Button>
            </div>

            {/* Interactive Yield Intelligence Section */}
            <Card className="dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg  overflow-hidden">
                <CardHeader className="pb-0">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-amber-500" />
                            <CardTitle className="text-lg">Yield Market Intelligence</CardTitle>
                        </div>
                        <Badge variant="outline" className="px-2 py-1 text-xs bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-300 border-green-200 dark:border-green-800">
                            <Clock className="mr-1 h-3 w-3" />
                            Live APY Data
                        </Badge>
                    </div>
                    <CardDescription>
                        Compare platforms, track APY trends, and get personalized yield optimization recommendations
                    </CardDescription>
                </CardHeader>

                <CardContent className="p-0 mt-4">
                    <div className="p-4 bg-gradient-to-b from-green-50/50 to-emerald-50/30 dark:from-green-950/20 dark:to-emerald-950/10 border-y border-green-100/50 dark:border-green-800/30 mb-4">
                        <p className="text-sm text-green-700 dark:text-green-300">
                            Click on any platform to view detailed yield insights, compare asset performance, and get strategy recommendations for optimal returns.
                        </p>
                    </div>

                    {/* Platform Insights Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                        {platformData.map(platform => (
                            <Card
                                key={platform.id}
                                className="group hover:border-green-300 dark:hover:border-green-700 transition-all 
                                cursor-pointer relative overflow-hidden dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg"
                                onClick={() => openPlatformInsight(platform.id)}
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3 mb-3">
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src={platform.icon} alt={platform.name} />
                                            <AvatarFallback className="bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-200">
                                                {platform.name.substring(0, 2)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h3 className="font-semibold">{platform.name}</h3>
                                            <Badge variant="outline" className={cn(
                                                "mt-1",
                                                platform.risk === "low"
                                                    ? "border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                                                    : "border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400"
                                            )}>
                                                <ShieldCheck className="mr-1 h-3 w-3" />
                                                {platform.risk === "low" ? "Low Risk" : "Medium Risk"}
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <div className="flex justify-between items-center mb-1 text-sm">
                                            <span className="text-slate-600 dark:text-slate-400">Current APY</span>
                                            <span className="font-medium">{platform.apy}
                                                <span className={cn(
                                                    "text-xs ml-1",
                                                    platform.apyTrend.startsWith("+")
                                                        ? "text-green-600 dark:text-green-400"
                                                        : "text-red-600 dark:text-red-400"
                                                )}>
                                                    {platform.apyTrend}
                                                </span>
                                            </span>
                                        </div>
                                        <Progress
                                            value={parseFloat(platform.apy) * 10}
                                            className={`h-1.5 ${platform.risk === "low" ? "[&>div]:bg-green-500" : "[&>div]:bg-amber-500"}`}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 mb-3">
                                        <div className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded-md">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-slate-500 dark:text-slate-400">TVL</span>
                                                <span className="font-medium">{platform.tvl}</span>
                                            </div>
                                        </div>
                                        <div className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded-md">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-slate-500 dark:text-slate-400">Assets</span>
                                                <span className="font-medium">{platform.assets.length}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-1 mb-3">
                                        {platform.assets.slice(0, 3).map((asset, i) => (
                                            <Badge key={i} variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-xs">
                                                {asset}
                                            </Badge>
                                        ))}
                                        {platform.assets.length > 3 && (
                                            <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-xs">
                                                +{platform.assets.length - 3} more
                                            </Badge>
                                        )}
                                    </div>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full gap-1 group-hover:bg-green-50 group-hover:text-green-600
                                         dark:group-hover:bg-green-900/20 dark:group-hover:text-green-400 group-hover:border-green-200
                                          dark:group-hover:border-green-800 dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg"
                                    >
                                        <Eye className="h-3.5 w-3.5" />
                                        View Market Insights
                                    </Button>

                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-green-500/5 dark:to-green-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Tasks Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ">
                {/* Active Tasks */}
                <Card className="dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                                Active Yield Tasks
                            </CardTitle>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 gap-1 text-green-600"
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
                                                <AvatarImage src={task.icon} alt={task.platform} />
                                                <AvatarFallback className="bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-200">
                                                    {task.platform.substring(0, 2)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <h4 className="font-medium text-slate-900 dark:text-white">{task.platform}</h4>
                                                        <Badge className="mt-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 font-normal">
                                                            Active
                                                        </Badge>
                                                    </div>
                                                    <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                                        Current APY: {task.currentAPY}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                                                    <span className="font-medium">Assets:</span> {task.assets}
                                                </p>
                                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                                    <span className="font-medium">Rule:</span> {task.rule}
                                                </p>
                                                <div className="flex items-center gap-1 mt-3 text-xs text-slate-500 dark:text-slate-400">
                                                    <Clock className="h-3.5 w-3.5" />
                                                    <span>Check frequency: {task.nextCheck}</span>
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
                                <DollarSign className="h-10 w-10 text-slate-300 dark:text-slate-700 mb-2" />
                                <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-1">No active tasks</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-4">
                                    You don't have any active yield optimization tasks. Create one to start maximizing your returns.
                                </p>
                                <Button
                                    size="sm"
                                    onClick={() => setCreateTaskModalOpen(true)}
                                    className="bg-green-600 hover:bg-green-700 text-white"
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
                            Recent Yield History
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
                                                <AvatarImage src={task.icon} alt={task.platform} />
                                                <AvatarFallback className="bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-200">
                                                    {task.platform.substring(0, 2)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <h4 className="font-medium text-slate-900 dark:text-white">{task.platform}</h4>
                                                        <Badge className="mt-1 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 font-normal">
                                                            Completed
                                                        </Badge>
                                                    </div>
                                                    <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                                                        Avg APY: {task.avgAPY}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                                                    <span className="font-medium">Assets:</span> {task.assets}
                                                </p>
                                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                                    <span className="font-medium">Rule:</span> {task.rule}
                                                </p>
                                                <div className="flex items-center gap-1 mt-3 text-xs text-slate-500 dark:text-slate-400">
                                                    <Clock className="h-3.5 w-3.5" />
                                                    <span>Last active: {task.completedDate} • {task.actions} actions</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <div className="flex justify-center pt-2">
                                    <Button variant="link" className="text-green-600 dark:text-green-400 h-auto p-0">
                                        View All History
                                        <ArrowRight className="ml-1 h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-center border border-dashed border-slate-300 dark:border-slate-700 rounded-lg">
                                <DollarSign className="h-10 w-10 text-slate-300 dark:text-slate-700 mb-2" />
                                <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-1">No yield history</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
                                    Your completed yield optimization tasks will appear here
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
                                <Info className="h-4 w-4 text-green-600" />
                                <span>Yield Optimization Guide</span>
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                                Learn strategies for maximizing your DeFi yields while managing risk
                            </p>
                            <Button variant="link" className="h-auto p-0 text-green-600 dark:text-green-400">
                                Read Guide
                                <ExternalLink className="ml-1 h-3 w-3" />
                            </Button>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                            <h3 className="font-semibold mb-2 flex items-center gap-2">
                                <Users className="h-4 w-4 text-purple-600" />
                                <span>Popular Yield Strategies</span>
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                                Explore the most successful yield farming strategies used by others
                            </p>
                            <Button variant="link" className="h-auto p-0 text-green-600 dark:text-green-400">
                                See Examples
                                <ExternalLink className="ml-1 h-3 w-3" />
                            </Button>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                            <h3 className="font-semibold mb-2 flex items-center gap-2">
                                <Zap className="h-4 w-4 text-amber-600" />
                                <span>Risk Management</span>
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                                Learn how to balance yield optimization with smart risk management
                            </p>
                            <Button variant="link" className="h-auto p-0 text-green-600 dark:text-green-400">
                                View Guide
                                <ExternalLink className="ml-1 h-3 w-3" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Platform Insights Modal */}
            <Dialog open={insightModalOpen} onOpenChange={setInsightModalOpen}>
                <DialogContent className="sm:max-w-[900px] p-0 max-h-[90vh] overflow-hidden dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg">
                    {insightLoading ? (
                        <div className="flex items-center justify-center p-8">
                            <div className="text-center">
                                <RefreshCw className="h-8 w-8 animate-spin text-green-600 dark:text-green-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium">Loading insights...</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                                    Fetching the latest yield data and market trends
                                </p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {selectedPlatform && (
                                <div className="flex flex-col h-full max-h-[90vh]">
                                    <DialogHeader className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10">
                                                <AvatarImage src={platformInsights[selectedPlatform]?.logo} />
                                                <AvatarFallback className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                                                    {platformInsights[selectedPlatform]?.name.substring(0, 2)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <DialogTitle className="text-xl">
                                                    {platformInsights[selectedPlatform]?.name} Insights
                                                </DialogTitle>
                                                <DialogDescription>
                                                    Yield analytics and optimization strategies
                                                </DialogDescription>
                                            </div>
                                        </div>
                                    </DialogHeader>

                                    <ScrollArea className="flex-1 px-6 py-4 h-full">
                                        <div className="space-y-6">
                                            {/* Summary */}
                                            <div>
                                                <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/30 rounded-lg p-4">
                                                    <p className="text-green-800 dark:text-green-300">
                                                        {getSelectedPlatformInsights()?.summary}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Stats Overview */}
                                            <div className="dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg">
                                                <h3 className="text-lg font-semibold mb-3">Yield Overview</h3>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                                    <Card className="bg-slate-50/50 dark:bg-slate-800/20">
                                                        <CardContent className="p-4">
                                                            <p className="text-sm text-muted-foreground mb-1">Current APY</p>
                                                            <div className="flex items-baseline">
                                                                <span className="text-2xl font-bold">{getSelectedPlatformInsights()?.stats.currentAPY}</span>
                                                                <Badge className={cn(
                                                                    "ml-2",
                                                                    getSelectedPlatformInsights()?.stats.apyChange?.startsWith("+")
                                                                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                                                        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                                                )}>
                                                                    {getSelectedPlatformInsights()?.stats.apyChange}
                                                                </Badge>
                                                            </div>
                                                        </CardContent>
                                                    </Card>

                                                    <Card className="bg-slate-50/50 dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg">
                                                        <CardContent className="p-4">
                                                            <p className="text-sm text-muted-foreground mb-1">Total Value Locked</p>
                                                            <div className="flex items-baseline">
                                                                <span className="text-2xl font-bold">{getSelectedPlatformInsights()?.stats.tvl}</span>
                                                                <Badge className={cn(
                                                                    "ml-2",
                                                                    getSelectedPlatformInsights()?.stats.tvlChange?.startsWith("+")
                                                                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                                                        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                                                )}>
                                                                    {getSelectedPlatformInsights()?.stats.tvlChange}
                                                                </Badge>
                                                            </div>
                                                        </CardContent>
                                                    </Card>

                                                    <Card className="bg-slate-50/50 dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg">
                                                        <CardContent className="p-4">
                                                            <p className="text-sm text-muted-foreground mb-1">Risk Profile</p>
                                                            <div className="flex items-baseline">
                                                                <span className="text-2xl font-bold">{getSelectedPlatformInsights()?.stats.risk}</span>
                                                                <span className="text-sm text-slate-500 dark:text-slate-400 ml-2">
                                                                    Volatility: {getSelectedPlatformInsights()?.stats.volatility}
                                                                </span>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                </div>
                                            </div>

                                            {/* Asset Performance Table */}
                                            {getSelectedPlatformInsights()?.assetPerformance && (
                                                <div className="dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg">
                                                    <h3 className="text-lg font-semibold mb-3">Asset Performance</h3>
                                                    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                                                        <div className="grid grid-cols-12 text-sm font-medium bg-slate-50 dark:bg-slate-800/80 p-3 border-b border-slate-200 dark:border-slate-700">
                                                            <div className="col-span-4">Asset</div>
                                                            <div className="col-span-3 text-center">Current APY</div>
                                                            <div className="col-span-3 text-center">Risk Level</div>
                                                            <div className="col-span-2 text-center">Volume</div>
                                                        </div>

                                                        {getSelectedPlatformInsights()?.assetPerformance?.map((asset, i) => (
                                                            <div key={i} className="grid grid-cols-12 p-3 text-sm border-b border-slate-200 dark:border-slate-700 last:border-0">
                                                                <div className="col-span-4 font-medium">{asset.asset}</div>
                                                                <div className="col-span-3 text-center">
                                                                    <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                                                        {asset.apy}%
                                                                    </Badge>
                                                                </div>
                                                                <div className="col-span-3 text-center">
                                                                    <Badge className={cn(
                                                                        asset.risk === "Low"
                                                                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                                                            : asset.risk === "Medium"
                                                                                ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                                                                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                                                    )}>
                                                                        {asset.risk}
                                                                    </Badge>
                                                                </div>
                                                                <div className="col-span-2 text-center text-slate-600 dark:text-slate-400">
                                                                    {asset.volume}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Yield Trends Chart */}
                                            {getSelectedPlatformInsights()?.yieldTrends && (
                                                <div>
                                                    <h3 className="text-lg font-semibold mb-3">APY Trend (30 Days)</h3>
                                                    <Card className="dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg">
                                                        <CardContent className="p-4">
                                                            <div className="h-64 w-full">
                                                                <div className="flex justify-center items-center h-full">
                                                                    <div className="w-full flex flex-col space-y-2">
                                                                        <div className="flex items-center justify-between">
                                                                            <div className="text-xs text-slate-500 dark:text-slate-400">APY %</div>
                                                                            <div className="text-xs text-slate-500 dark:text-slate-400">Time</div>
                                                                        </div>
                                                                        <div className="relative h-52 w-full">
                                                                            <div className="absolute bottom-0 left-0 right-0 top-0">
                                                                                {/* Simple chart visualization */}
                                                                                <div className="relative h-full w-full">
                                                                                    <div className="absolute inset-0 flex items-end justify-between px-2">
                                                                                        {getSelectedPlatformInsights()?.yieldTrends?.map((point, i) => (
                                                                                            <div key={i} className="flex flex-col items-center">
                                                                                                <div
                                                                                                    className="bg-green-500 dark:bg-green-400 rounded-t w-10"
                                                                                                    style={{ height: `${point.apy * 10}%` }}
                                                                                                ></div>
                                                                                                <span className="text-xs mt-1">{point.week}</span>
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

                                            {/* Recommended Strategies */}
                                            {getSelectedPlatformInsights()?.recommendations && (
                                                <div>
                                                    <h3 className="text-lg font-semibold mb-3">Recommended Strategies</h3>
                                                    <div className="space-y-4">
                                                        {getSelectedPlatformInsights()?.recommendations.map((rec, i) => (
                                                            <Card key={i} className="bg-green-50/50 dark:bg-green-900/10 border-green-100 dark:border-green-900/30">
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
                                                                            <h4 className="font-medium text-green-800 dark:text-green-300">{rec.title}</h4>
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
                                                                                    className="text-xs h-8 gap-1 bg-green-600 hover:bg-green-700 text-white"
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

                                            {/* Yield Opportunities */}
                                            {getSelectedPlatformInsights()?.opportunities && (
                                                <div>
                                                    <h3 className="text-lg font-semibold mb-3">Current Opportunities</h3>
                                                    <div className="space-y-4">
                                                        {getSelectedPlatformInsights()?.opportunities.map((opp, i) => (
                                                            <Card key={i} className="dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg">
                                                                <CardContent className="p-4">
                                                                    <div className="flex items-start justify-between">
                                                                        <div>
                                                                            <div className="flex items-center gap-2">
                                                                                <h4 className="font-medium">{opp.title}</h4>
                                                                                <Badge className={cn(
                                                                                    opp.risk === "Low"
                                                                                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                                                                        : opp.risk === "Medium"
                                                                                            ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                                                                            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                                                                )}>
                                                                                    {opp.risk} Risk
                                                                                </Badge>
                                                                            </div>
                                                                            <p className="text-sm mt-1 text-slate-600 dark:text-slate-400">{opp.description}</p>
                                                                        </div>
                                                                        <div className="flex items-center text-sm font-medium text-green-600 dark:text-green-400">
                                                                            <span>{opp.expectedAPY}</span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="mt-3 flex items-center justify-between bg-slate-50 dark:bg-slate-800 rounded-md p-3 text-sm">
                                                                        <div>
                                                                            <span className="font-medium">Time window:</span> {opp.timeWindow}
                                                                        </div>
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            onClick={() => {
                                                                                setInsightModalOpen(false);
                                                                                setCreateTaskModalOpen(true);
                                                                            }}
                                                                            className="h-7 text-xs border-green-200 dark:border-green-800 text-green-700 dark:text-green-300"
                                                                        >
                                                                            Capture Opportunity
                                                                        </Button>
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
                                                Data based on on-chain metrics and historical yield performance
                                            </p>
                                            <div className="flex gap-2">
                                                <Button variant="outline" onClick={() => setInsightModalOpen(false)}>
                                                    Close
                                                </Button>
                                                <Button
                                                    onClick={() => {
                                                        setInsightModalOpen(false);
                                                        setCreateTaskModalOpen(true);
                                                    }}
                                                    className="gap-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                                                >
                                                    <PlusCircle className="h-4 w-4" />
                                                    Create Yield Task
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

export default YieldFarmingPage;