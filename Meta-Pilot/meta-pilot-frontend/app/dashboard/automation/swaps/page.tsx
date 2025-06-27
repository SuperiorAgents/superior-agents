"use client";

import React, { useState } from "react";
import {
    ArrowLeftRight,
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
    CreditCard,
    Activity,
    Percent
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
type TokenPairInsight = {
    name: string;
    symbols: string;
    logos: string[];
    summary: string;
    stats: {
        currentRate: string;
        change24h: string;
        volume24h: string;
        liquidity: string;
        volatility: string;
    };
    priceHistory?: { time: string; price: number }[];
    exchangeData?: {
        exchange: string;
        logo: string;
        rate: string;
        volume: string;
        fees: string;
        slippage: string;
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
        expectedRate: string;
        confidence: string;
        recommendation: string;
    }[];
};

const TokenSwapsPage = () => {
    const [createTaskModalOpen, setCreateTaskModalOpen] = useState(false);
    const [insightModalOpen, setInsightModalOpen] = useState(false);
    const [selectedPair, setSelectedPair] = useState<string | null>(null);
    const [insightLoading, setInsightLoading] = useState(false);

    // Function to open pair insight modal
    const openPairInsight = (pairId: string) => {
        setSelectedPair(pairId);
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
            pair: "ETH / USDC",
            icons: ["/icons/eth.svg", "/icons/usdc.svg"],
            rule: "Swap when ETH drops by 5%",
            amount: "2 ETH",
            exchange: "Uniswap",
            status: "active",
            currentRate: "3,246.75 USDC"
        }
    ];

    // Recent tasks history
    const tasksHistory = [
        {
            id: "history-1",
            pair: "BTC / ETH",
            icons: ["/icons/btc.svg", "/icons/eth.svg"],
            rule: "Swap when BTC/ETH ratio increases by 3%",
            completedDate: "May 11, 2023",
            swapped: "0.5 BTC",
            outcome: "successful",
            rate: "16.3 ETH"
        },
        {
            id: "history-2",
            pair: "LINK / USDC",
            icons: ["/icons/link.svg", "/icons/usdc.svg"],
            rule: "Swap at specific price threshold",
            completedDate: "Apr 25, 2023",
            swapped: "200 LINK",
            outcome: "successful",
            rate: "4,825 USDC"
        }
    ];

    // Token pairs data for insights
    const tokenPairData = [
        {
            id: "eth-usdc",
            name: "ETH / USDC",
            icons: ["/icons/eth.svg", "/icons/usdc.svg"],
            rate: "3,246.75 USDC",
            change: "-2.3%",
            volume: "$542.8M",
            exchanges: ["Uniswap", "SushiSwap", "1inch"]
        },
        {
            id: "btc-eth",
            name: "BTC / ETH",
            icons: ["/icons/btc.svg", "/icons/eth.svg"],
            rate: "16.32 ETH",
            change: "+1.7%",
            volume: "$128.5M",
            exchanges: ["Uniswap", "SushiSwap", "1inch"]
        },
        {
            id: "eth-dai",
            name: "ETH / DAI",
            icons: ["/icons/eth.svg", "/icons/dai.svg"],
            rate: "3,244.20 DAI",
            change: "-2.4%",
            volume: "$218.3M",
            exchanges: ["Uniswap", "Curve", "1inch"]
        },
        {
            id: "usdc-usdt",
            name: "USDC / USDT",
            icons: ["/icons/usdc.svg", "/icons/usdt.svg"],
            rate: "0.998 USDT",
            change: "+0.02%",
            volume: "$328.7M",
            exchanges: ["Curve", "Uniswap", "1inch"]
        },
        {
            id: "link-eth",
            name: "LINK / ETH",
            icons: ["/icons/link.svg", "/icons/eth.svg"],
            rate: "0.0077 ETH",
            change: "+5.2%",
            volume: "$42.5M",
            exchanges: ["Uniswap", "SushiSwap", "1inch"]
        }
    ];

    // Detailed insight data for each token pair
    const tokenPairInsights: Record<string, TokenPairInsight> = {
        "eth-usdc": {
            name: "ETH / USDC",
            symbols: "ETH/USDC",
            logos: ["/icons/eth.svg", "/icons/usdc.svg"],
            summary: "High liquidity pair with consistent trading volume and moderate price volatility.",
            stats: {
                currentRate: "3,246.75 USDC",
                change24h: "-2.3%",
                volume24h: "$542.8M",
                liquidity: "$1.82B",
                volatility: "Medium"
            },
            priceHistory: [
                { time: "24h ago", price: 3322.18 },
                { time: "20h ago", price: 3310.45 },
                { time: "16h ago", price: 3290.72 },
                { time: "12h ago", price: 3275.34 },
                { time: "8h ago", price: 3260.51 },
                { time: "4h ago", price: 3252.12 },
                { time: "Now", price: 3246.75 }
            ],
            exchangeData: [
                {
                    exchange: "Uniswap",
                    logo: "/icons/uniswap.svg",
                    rate: "3,246.75 USDC",
                    volume: "$214.2M",
                    fees: "0.3%",
                    slippage: "0.12%"
                },
                {
                    exchange: "SushiSwap",
                    logo: "/icons/sushi.svg",
                    rate: "3,247.12 USDC",
                    volume: "$112.8M",
                    fees: "0.25%",
                    slippage: "0.18%"
                },
                {
                    exchange: "1inch",
                    logo: "/icons/1inch.svg",
                    rate: "3,246.82 USDC",
                    volume: "$98.5M",
                    fees: "0.15-0.3%",
                    slippage: "0.10%"
                },
                {
                    exchange: "Curve",
                    logo: "/icons/curve.svg",
                    rate: "3,246.91 USDC",
                    volume: "$82.6M",
                    fees: "0.04%",
                    slippage: "0.09%"
                }
            ],
            recommendations: [
                {
                    title: "Limit orders during volatility",
                    reason: "ETH price seeing short-term dips followed by recovery, optimal for limit orders",
                    impact: "high",
                    implementation: "Set up multiple limit orders at 3-5% below current price with partial amounts"
                },
                {
                    title: "Exchange arbitrage opportunity",
                    reason: "Minor but consistent price differences between SushiSwap and Curve (0.2-0.4%)",
                    impact: "medium",
                    implementation: "Create arbitrage task to monitor and execute when spread exceeds 0.3%"
                }
            ],
            opportunities: [
                {
                    title: "Support Level Test",
                    description: "ETH approaching technical support at $3,200, potential for bounce or breakdown",
                    timeWindow: "24-48 hours",
                    expectedRate: "3,180-3,220 USDC",
                    confidence: "Medium",
                    recommendation: "Set up limit buys in the support zone with stop loss below $3,150"
                },
                {
                    title: "Gas Fee Optimization",
                    description: "Historical gas price patterns show optimal swap times during US nighttime hours",
                    timeWindow: "Daily (2:00-5:00 UTC)",
                    expectedRate: "Current market rate",
                    confidence: "High",
                    recommendation: "Schedule recurring swaps during this window for 30-40% gas savings"
                }
            ]
        },
        "btc-eth": {
            name: "BTC / ETH",
            symbols: "BTC/ETH",
            logos: ["/icons/btc.svg", "/icons/eth.svg"],
            summary: "Important crypto-to-crypto pair reflecting the relative strength between the two largest cryptocurrencies.",
            stats: {
                currentRate: "16.32 ETH",
                change24h: "+1.7%",
                volume24h: "$128.5M",
                liquidity: "$684.2M",
                volatility: "Medium-Low"
            },
            priceHistory: [
                { time: "24h ago", price: 16.05 },
                { time: "20h ago", price: 16.12 },
                { time: "16h ago", price: 16.18 },
                { time: "12h ago", price: 16.21 },
                { time: "8h ago", price: 16.25 },
                { time: "4h ago", price: 16.29 },
                { time: "Now", price: 16.32 }
            ],
            recommendations: [
                {
                    title: "BTC strength trend capture",
                    reason: "BTC gaining momentum against ETH in the short-term (rising ratio)",
                    impact: "medium",
                    implementation: "Set swap rule to convert portion of ETH to BTC when ratio increases by 2%+"
                }
            ],
            opportunities: [
                {
                    title: "Ratio Reversion Strategy",
                    description: "BTC/ETH ratio tends to revert to the mean after short-term movements",
                    timeWindow: "1-2 weeks",
                    expectedRate: "16-16.5 ETH",
                    confidence: "Medium",
                    recommendation: "Set up a range-based swap strategy to capitalize on oscillations"
                }
            ]
        },
        "eth-dai": {
            name: "ETH / DAI",
            symbols: "ETH/DAI",
            logos: ["/icons/eth.svg", "/icons/dai.svg"],
            summary: "Stablecoin pairing with high liquidity and minimal spread compared to other stablecoin options.",
            stats: {
                currentRate: "3,244.20 DAI",
                change24h: "-2.4%",
                volume24h: "$218.3M",
                liquidity: "$728.1M",
                volatility: "Medium"
            },
            recommendations: [
                {
                    title: "DAI mint opportunity",
                    reason: "ETH/DAI liquidity providing better rates than ETH/USDC during market volatility",
                    impact: "medium",
                    implementation: "Set rule to swap ETH for DAI when price drops by specific percentage"
                }
            ],
            opportunities: [
                {
                    title: "Stablecoin Spread Opportunity",
                    description: "DAI occasionally trading at a slight premium to other stablecoins",
                    timeWindow: "Variable",
                    expectedRate: "Small premium (0.1-0.3%)",
                    confidence: "Medium",
                    recommendation: "Monitor DAI premium and set up triangular arbitrage with USDC"
                }
            ]
        },
        "usdc-usdt": {
            name: "USDC / USDT",
            symbols: "USDC/USDT",
            logos: ["/icons/usdc.svg", "/icons/usdt.svg"],
            summary: "Highly stable pair with minimal volatility, useful for stablecoin optimization and risk management.",
            stats: {
                currentRate: "0.998 USDT",
                change24h: "+0.02%",
                volume24h: "$328.7M",
                liquidity: "$1.42B",
                volatility: "Very Low"
            },
            recommendations: [
                {
                    title: "Stablecoin safety swap",
                    reason: "Maintain flexibility between stablecoin options during market uncertainty",
                    impact: "low",
                    implementation: "Set up monitoring for significant depegs with automatic rebalancing"
                }
            ],
            opportunities: [
                {
                    title: "Yield Differential Capture",
                    description: "Different platforms offer varying yields on USDC vs USDT",
                    timeWindow: "Long-term (weeks to months)",
                    expectedRate: "1:1 with additional yield",
                    confidence: "High",
                    recommendation: "Swap to whichever stablecoin offers highest yield on your preferred platform"
                }
            ]
        },
        "link-eth": {
            name: "LINK / ETH",
            symbols: "LINK/ETH",
            logos: ["/icons/link.svg", "/icons/eth.svg"],
            summary: "Altcoin/ETH pair with increasing momentum and significant recent price action.",
            stats: {
                currentRate: "0.0077 ETH",
                change24h: "+5.2%",
                volume24h: "$42.5M",
                liquidity: "$124.3M",
                volatility: "High"
            },
            recommendations: [
                {
                    title: "Momentum trading setup",
                    reason: "LINK showing strong technicals and sustained uptrend versus ETH",
                    impact: "high",
                    implementation: "Create swap task for ETH to LINK with 5% resistance breakout as trigger"
                }
            ],
            opportunities: [
                {
                    title: "Oracle Narrative Exposure",
                    description: "LINK benefiting from increased focus on oracle solutions in the market",
                    timeWindow: "Medium-term (weeks)",
                    expectedRate: "0.0078-0.0085 ETH",
                    confidence: "Medium-High",
                    recommendation: "Allocate portion of ETH to LINK via DCA or limit orders"
                }
            ]
        }
    };

    // Get selected pair insights
    const getSelectedPairInsights = () => {
        if (!selectedPair) return null;
        return tokenPairInsights[selectedPair];
    };

    return (
        <div className="container mx-auto py-6 space-y-8">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        <span className="flex items-center gap-2">
                            <ArrowLeftRight className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                            Token Swap Automation
                        </span>
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Automate token swaps based on price conditions, ratios, and market timing
                    </p>
                </div>
                <Button
                    className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white"
                    onClick={() => setCreateTaskModalOpen(true)}
                >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Swap Task
                </Button>
            </div>

            {/* Interactive Market Intelligence Section */}
            <Card className="dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg overflow-hidden">
                <CardHeader className="pb-0">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-amber-500" />
                            <CardTitle className="text-lg">Token Pair Intelligence</CardTitle>
                        </div>
                        <Badge variant="outline" className="px-2 py-1 text-xs bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800">
                            <Clock className="mr-1 h-3 w-3" />
                            Live Price Data
                        </Badge>
                    </div>
                    <CardDescription>
                        Analyze token pairs, track exchange rates, and get optimal swap recommendations
                    </CardDescription>
                </CardHeader>

                <CardContent className="p-0 mt-4 dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg ">
                    <div className="p-4 bg-gradient-to-b from-indigo-50/50 to-blue-50/30 dark:from-indigo-950/20 dark:to-blue-950/10 border-y border-indigo-100/50 dark:border-indigo-800/30 mb-4">
                        <p className="text-sm text-indigo-700 dark:text-indigo-300">
                            Click on any token pair to view detailed insights, compare exchange rates, and get strategy recommendations for optimal swap timing.
                        </p>
                    </div>

                    {/* Token Pair Insights Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                        {tokenPairData.map(pair => (
                            <Card
                                key={pair.id}
                                className="group hover:border-indigo-300 dark:hover:border-indigo-700 transition-all 
                                cursor-pointer relative overflow-hidden dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg "
                                onClick={() => openPairInsight(pair.id)}
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="relative h-12 w-16 flex-shrink-0">
                                            <Avatar className="h-10 w-10 absolute left-0 top-0">
                                                <AvatarImage src={pair.icons[0]} alt={pair.name.split(' / ')[0]} />
                                                <AvatarFallback className="bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-200">
                                                    {pair.name.split(' / ')[0].substring(0, 2)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <Avatar className="h-10 w-10 absolute left-6 top-2 border-2 border-white dark:border-slate-900">
                                                <AvatarImage src={pair.icons[1]} alt={pair.name.split(' / ')[1]} />
                                                <AvatarFallback className="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200">
                                                    {pair.name.split(' / ')[1].substring(0, 2)}
                                                </AvatarFallback>
                                            </Avatar>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold">{pair.name}</h3>
                                            <Badge variant="outline" className="mt-1 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                                                <Activity className="mr-1 h-3 w-3" />
                                                {pair.exchanges[0]}
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <div className="flex justify-between items-center mb-1 text-sm">
                                            <span className="text-slate-600 dark:text-slate-400">Exchange Rate</span>
                                            <span className="font-medium">{pair.rate}
                                                <span className={cn(
                                                    "text-xs ml-1",
                                                    pair.change.startsWith("+")
                                                        ? "text-green-600 dark:text-green-400"
                                                        : pair.change.startsWith("-")
                                                            ? "text-red-600 dark:text-red-400"
                                                            : "text-slate-600 dark:text-slate-400"
                                                )}>
                                                    {pair.change}
                                                </span>
                                            </span>
                                        </div>
                                        <Progress
                                            value={parseFloat(pair.change.replace('+', '').replace('-', '').replace('%', ''))}
                                            max={6}
                                            className={cn(
                                                "h-1.5",
                                                pair.change.startsWith("+") ? "[&>div]:bg-green-500" :
                                                    pair.change.startsWith("-") ? "[&>div]:bg-red-500" :
                                                        "[&>div]:bg-slate-500"
                                            )}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 mb-3">
                                        <div className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded-md">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-slate-500 dark:text-slate-400">24h Volume</span>
                                                <span className="font-medium">{pair.volume}</span>
                                            </div>
                                        </div>
                                        <div className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded-md">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-slate-500 dark:text-slate-400">Exchanges</span>
                                                <span className="font-medium">{pair.exchanges.length}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full gap-1 group-hover:bg-indigo-50 group-hover:text-indigo-600 
                                        dark:group-hover:bg-indigo-900/20 dark:group-hover:text-indigo-400 
                                        group-hover:border-indigo-200 dark:group-hover:border-indigo-800
                                        dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg "
                                    >
                                        <Eye className="h-3.5 w-3.5" />
                                        View Swap Insights
                                    </Button>

                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-indigo-500/5 dark:to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Tasks Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Active Tasks */}
                <Card className="dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg ">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <CheckCircle2 className="h-5 w-5 text-indigo-500" />
                                Active Swap Tasks
                            </CardTitle>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 gap-1 text-indigo-600"
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
                                            <div className="relative h-10 w-14 flex-shrink-0 mt-1">
                                                <Avatar className="h-8 w-8 absolute left-0 top-0">
                                                    <AvatarImage src={task.icons[0]} alt={task.pair.split(' / ')[0]} />
                                                    <AvatarFallback className="bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-200">
                                                        {task.pair.split(' / ')[0].substring(0, 2)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <Avatar className="h-8 w-8 absolute left-6 top-1 border-2 border-white dark:border-slate-800">
                                                    <AvatarImage src={task.icons[1]} alt={task.pair.split(' / ')[1]} />
                                                    <AvatarFallback className="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200">
                                                        {task.pair.split(' / ')[1].substring(0, 2)}
                                                    </AvatarFallback>
                                                </Avatar>
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <h4 className="font-medium text-slate-900 dark:text-white">{task.pair}</h4>
                                                        <Badge className="mt-1 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 font-normal">
                                                            Active
                                                        </Badge>
                                                    </div>
                                                    <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                                        On {task.exchange}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                                                    <span className="font-medium">Rule:</span> {task.rule}
                                                </p>
                                                <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-slate-500 dark:text-slate-400">
                                                    <div className="flex items-center gap-1">
                                                        <Percent className="h-3.5 w-3.5" />
                                                        <span>Current Rate: {task.currentRate}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <CreditCard className="h-3.5 w-3.5" />
                                                        <span>Amount: {task.amount}</span>
                                                    </div>
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
                                <ArrowLeftRight className="h-10 w-10 text-slate-300 dark:text-slate-700 mb-2" />
                                <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-1">No active tasks</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-4">
                                    You don't have any active token swap tasks. Create one to start automating your trades.
                                </p>
                                <Button
                                    size="sm"
                                    onClick={() => setCreateTaskModalOpen(true)}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                                >
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Create Task
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Completed Tasks */}
                <Card className="dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg ">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                            Swap History
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
                                            <div className="relative h-10 w-14 flex-shrink-0 mt-1">
                                                <Avatar className="h-8 w-8 absolute left-0 top-0">
                                                    <AvatarImage src={task.icons[0]} alt={task.pair.split(' / ')[0]} />
                                                    <AvatarFallback className="bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-200">
                                                        {task.pair.split(' / ')[0].substring(0, 2)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <Avatar className="h-8 w-8 absolute left-6 top-1 border-2 border-white dark:border-slate-800">
                                                    <AvatarImage src={task.icons[1]} alt={task.pair.split(' / ')[1]} />
                                                    <AvatarFallback className="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200">
                                                        {task.pair.split(' / ')[1].substring(0, 2)}
                                                    </AvatarFallback>
                                                </Avatar>
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <h4 className="font-medium text-slate-900 dark:text-white">{task.pair}</h4>
                                                        <Badge className="mt-1 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 font-normal">
                                                            Completed
                                                        </Badge>
                                                    </div>
                                                    <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                                        Swapped {task.swapped}
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
                                                    <div>Rate: {task.rate}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <div className="flex justify-center pt-2">
                                    <Button variant="link" className="text-indigo-600 dark:text-indigo-400 h-auto p-0">
                                        View All History
                                        <ArrowRight className="ml-1 h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-center border border-dashed border-slate-300 dark:border-slate-700 rounded-lg">
                                <ArrowLeftRight className="h-10 w-10 text-slate-300 dark:text-slate-700 mb-2" />
                                <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-1">No swap history</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
                                    Your completed token swap tasks will appear here
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Resources Section */}
            <Card className="dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg ">
                <CardHeader>
                    <CardTitle className="text-lg">Resources & Guides</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                            <h3 className="font-semibold mb-2 flex items-center gap-2">
                                <Info className="h-4 w-4 text-indigo-600" />
                                <span>Token Swap Strategies</span>
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                                Learn effective strategies for timing token swaps and optimizing trade execution
                            </p>
                            <Button variant="link" className="h-auto p-0 text-indigo-600 dark:text-indigo-400">
                                Read Guide
                                <ExternalLink className="ml-1 h-3 w-3" />
                            </Button>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                            <h3 className="font-semibold mb-2 flex items-center gap-2">
                                <Users className="h-4 w-4 text-indigo-600" />
                                <span>Exchange Comparison</span>
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                                Compare fees, slippage, and liquidity across different DEXs to maximize your trades
                            </p>
                            <Button variant="link" className="h-auto p-0 text-indigo-600 dark:text-indigo-400">
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
                                Learn how to reduce gas costs and improve execution efficiency for your swaps
                            </p>
                            <Button variant="link" className="h-auto p-0 text-indigo-600 dark:text-indigo-400">
                                View Guide
                                <ExternalLink className="ml-1 h-3 w-3" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Token Pair Insights Modal */}
            <Dialog open={insightModalOpen} onOpenChange={setInsightModalOpen}>
                <DialogContent className="sm:max-w-[900px] p-0 max-h-[90vh] overflow-hidden dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg ">
                    {insightLoading ? (
                        <div className="flex items-center justify-center p-8">
                            <div className="text-center">
                                <RefreshCw className="h-8 w-8 animate-spin text-indigo-600 dark:text-indigo-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium">Loading insights...</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                                    Fetching the latest exchange rates and market analytics
                                </p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {selectedPair && (
                                <div className="flex flex-col h-full max-h-[90vh] dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg ">
                                    <DialogHeader className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                                        <div className="flex items-center gap-3">
                                            <div className="relative h-12 w-16">
                                                <Avatar className="h-10 w-10 absolute left-0 top-0">
                                                    <AvatarImage src={tokenPairInsights[selectedPair].logos[0]} />
                                                    <AvatarFallback className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
                                                        {tokenPairInsights[selectedPair].name.split(' / ')[0].substring(0, 2)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <Avatar className="h-10 w-10 absolute left-6 top-2 border-2 border-white dark:border-slate-900">
                                                    <AvatarImage src={tokenPairInsights[selectedPair].logos[1]} />
                                                    <AvatarFallback className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                                                        {tokenPairInsights[selectedPair].name.split(' / ')[1].substring(0, 2)}
                                                    </AvatarFallback>
                                                </Avatar>
                                            </div>
                                            <div>
                                                <DialogTitle className="text-xl">
                                                    {tokenPairInsights[selectedPair].name} Insights
                                                </DialogTitle>
                                                <DialogDescription>
                                                    Exchange rates, market trends, and swap recommendations
                                                </DialogDescription>
                                            </div>
                                        </div>
                                    </DialogHeader>

                                    <ScrollArea className="flex-1 px-6 py-4 h-full">
                                        <div className="space-y-6 dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg ">
                                            {/* Summary */}
                                            <div>
                                                <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900/30 rounded-lg p-4">
                                                    <p className="text-indigo-800 dark:text-indigo-300">
                                                        {getSelectedPairInsights()?.summary}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Stats Overview */}
                                            <div>
                                                <h3 className="text-lg font-semibold mb-3">Market Overview</h3>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                                    <Card className="bg-slate-50/50 dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg ">
                                                        <CardContent className="p-4">
                                                            <p className="text-sm text-muted-foreground mb-1">Current Rate</p>
                                                            <div className="flex items-baseline">
                                                                <span className="text-2xl font-bold">{getSelectedPairInsights()?.stats.currentRate}</span>
                                                                <Badge className={cn(
                                                                    "ml-2",
                                                                    getSelectedPairInsights()?.stats.change24h?.startsWith("+")
                                                                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                                                        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                                                )}>
                                                                    {getSelectedPairInsights()?.stats.change24h}
                                                                </Badge>
                                                            </div>
                                                        </CardContent>
                                                    </Card>

                                                    <Card className="bg-slate-50/50 dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg ">
                                                        <CardContent className="p-4">
                                                            <p className="text-sm text-muted-foreground mb-1">24h Volume</p>
                                                            <div className="flex items-baseline">
                                                                <span className="text-2xl font-bold">{getSelectedPairInsights()?.stats.volume24h}</span>
                                                            </div>
                                                        </CardContent>
                                                    </Card>

                                                    <Card className="bg-slate-50/50 dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg ">
                                                        <CardContent className="p-4">
                                                            <p className="text-sm text-muted-foreground mb-1">Market Conditions</p>
                                                            <div className="text-sm space-y-0.5">
                                                                <div className="flex justify-between">
                                                                    <span className="text-slate-500 dark:text-slate-400">Liquidity:</span>
                                                                    <span className="font-medium">{getSelectedPairInsights()?.stats.liquidity}</span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span className="text-slate-500 dark:text-slate-400">Volatility:</span>
                                                                    <span className="font-medium">{getSelectedPairInsights()?.stats.volatility}</span>
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                </div>
                                            </div>

                                            {/* Price History Chart */}
                                            {getSelectedPairInsights()?.priceHistory && (
                                                <div>
                                                    <h3 className="text-lg font-semibold mb-3">Price Trend (24 Hours)</h3>
                                                    <Card className="dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg ">
                                                        <CardContent className="p-4">
                                                            <div className="h-64 w-full">
                                                                <div className="flex justify-center items-center h-full">
                                                                    <div className="w-full flex flex-col space-y-2">
                                                                        <div className="flex items-center justify-between">
                                                                            <div className="text-xs text-slate-500 dark:text-slate-400">Rate</div>
                                                                            <div className="text-xs text-slate-500 dark:text-slate-400">Time</div>
                                                                        </div>
                                                                        <div className="relative h-52 w-full">
                                                                            <div className="absolute bottom-0 left-0 right-0 top-0">
                                                                                {/* Simple chart visualization */}
                                                                                <div className="relative h-full w-full">
                                                                                    <div className="absolute inset-0 flex items-end justify-between px-2">
                                                                                        {getSelectedPairInsights()?.priceHistory?.map((point, i) => (
                                                                                            <div key={i} className="flex flex-col items-center">
                                                                                                <div
                                                                                                    className="bg-indigo-500 dark:bg-indigo-400 rounded-t w-10"
                                                                                                    style={{ height: `${(point.price / (point.price * 1.1)) * 100}%` }}
                                                                                                ></div>
                                                                                                <span className="text-xs mt-1">{point.time}</span>
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

                                            {/* Exchange Comparison */}
                                            {getSelectedPairInsights()?.exchangeData && (
                                                <div className="dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg ">
                                                    <h3 className="text-lg font-semibold mb-3">Exchange Comparison</h3>
                                                    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                                                        <div className="grid grid-cols-18 text-sm font-medium bg-slate-50 dark:bg-slate-800/80 p-3 border-b border-slate-200 dark:border-slate-700">
                                                            <div className="col-span-5">Exchange</div>
                                                            <div className="col-span-5 text-center">Rate</div>
                                                            <div className="col-span-3 text-center">Volume</div>
                                                            <div className="col-span-2 text-center">Fees</div>
                                                            <div className="col-span-3 text-center">Slippage</div>
                                                        </div>

                                                        {getSelectedPairInsights()?.exchangeData?.map((exchange, i) => (
                                                            <div key={i} className="grid grid-cols-18 p-3 text-sm border-b border-slate-200 dark:border-slate-700 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                                                <div className="col-span-5">
                                                                    <div className="flex items-center gap-2">
                                                                        <Avatar className="h-6 w-6">
                                                                            <AvatarImage src={exchange.logo} alt={exchange.exchange} />
                                                                            <AvatarFallback className="bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-200 text-xs">
                                                                                {exchange.exchange.substring(0, 2)}
                                                                            </AvatarFallback>
                                                                        </Avatar>
                                                                        <span className="font-medium">{exchange.exchange}</span>
                                                                    </div>
                                                                </div>
                                                                <div className="col-span-5 text-center font-medium">{exchange.rate}</div>
                                                                <div className="col-span-3 text-center">{exchange.volume}</div>
                                                                <div className="col-span-2 text-center">{exchange.fees}</div>
                                                                <div className="col-span-3 text-center">
                                                                    <Badge className={cn(
                                                                        parseFloat(exchange.slippage.replace('%', '')) < 0.15
                                                                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                                                            : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                                                    )}>
                                                                        {exchange.slippage}
                                                                    </Badge>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Recommended Strategies */}
                                            {getSelectedPairInsights()?.recommendations && (
                                                <div>
                                                    <h3 className="text-lg font-semibold mb-3">Recommended Strategies</h3>
                                                    <div className="space-y-4">
                                                        {getSelectedPairInsights()?.recommendations.map((rec, i) => (
                                                            <Card key={i} className="bg-indigo-50/50 dark:bg-indigo-900/10 border-indigo-100 dark:border-indigo-900/30">
                                                                <CardContent className="p-4">
                                                                    <div className="flex gap-3">
                                                                        <Badge className={cn(
                                                                            "h-fit",
                                                                            rec.impact === "high"
                                                                                ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400"
                                                                                : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                                                        )}>
                                                                            {rec.impact === "high" ? "High Impact" : "Medium Impact"}
                                                                        </Badge>
                                                                        <div>
                                                                            <h4 className="font-medium text-indigo-800 dark:text-indigo-300">{rec.title}</h4>
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
                                                                                    className="text-xs h-8 gap-1 bg-indigo-600 hover:bg-indigo-700 text-white"
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

                                            {/* Market Opportunities */}
                                            {getSelectedPairInsights()?.opportunities && (
                                                <div>
                                                    <h3 className="text-lg font-semibold mb-3">Current Opportunities</h3>
                                                    <div className="space-y-4">
                                                        {getSelectedPairInsights()?.opportunities.map((opp, i) => (
                                                            <Card key={i} className="dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg ">
                                                                <CardContent className="p-4">
                                                                    <div className="flex items-start justify-between">
                                                                        <div>
                                                                            <div className="flex items-center gap-2">
                                                                                <h4 className="font-medium">{opp.title}</h4>
                                                                                <Badge className={cn(
                                                                                    opp.confidence.includes("High")
                                                                                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                                                                        : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                                                                )}>
                                                                                    {opp.confidence} Confidence
                                                                                </Badge>
                                                                            </div>
                                                                            <p className="text-sm mt-1 text-slate-600 dark:text-slate-400">{opp.description}</p>
                                                                        </div>
                                                                        <div className="flex items-center text-sm font-medium text-indigo-600 dark:text-indigo-400">
                                                                            <span>{opp.expectedRate}</span>
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
                                                                            className="h-7 text-xs border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300"
                                                                        >
                                                                            Set Up Swap
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

                                    <DialogFooter className="px-6 py-4 border-t dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg">
                                        <div className="flex items-center justify-between w-full">
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                Data based on real-time exchange rates and market analysis
                                            </p>
                                            <div className="flex gap-2">
                                                <Button variant="outline" onClick={() => setInsightModalOpen(false)} className="dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg ">
                                                    Close
                                                </Button>
                                                <Button
                                                    onClick={() => {
                                                        setInsightModalOpen(false);
                                                        setCreateTaskModalOpen(true);
                                                    }}
                                                    className="gap-1 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white"
                                                >
                                                    <PlusCircle className="h-4 w-4" />
                                                    Create Swap Task
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

export default TokenSwapsPage;