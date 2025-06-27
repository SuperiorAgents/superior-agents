"use client";

import React, { useState } from "react";
import {
    Shuffle,
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
    Percent,
    TrendingUp,
    ArrowLeftRight,
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
type ArbitrageOpportunityInsight = {
    name: string;
    pairName: string;
    logos: string[];
    exchanges: string[];
    exchangeLogos: string[];
    summary: string;
    stats: {
        currentSpread: string;
        spreadChange: string;
        volume24h: string;
        avgProfit: string;
        successRate: string;
        lastOpportunity: string;
    };
    spreadHistory?: { time: string; spread: number }[];
    marketDetails?: {
        exchange: string;
        logo: string;
        price: string;
        volume: string;
        slippage: string;
        liquidity: string;
    }[];
    profitAnalysis?: {
        tradeSize: string;
        estimatedGas: string;
        potentialProfit: string;
        netProfit: string;
        roi: string;
    }[];
    recommendations: {
        title: string;
        reason: string;
        impact: string;
        implementation: string;
    }[];
    strategies: {
        title: string;
        description: string;
        complexity: string;
        expectedReturn: string;
        risk: string;
        recommendation: string;
    }[];
};

const ArbitragePage = () => {
    const [createTaskModalOpen, setCreateTaskModalOpen] = useState(false);
    const [insightModalOpen, setInsightModalOpen] = useState(false);
    const [selectedOpportunity, setSelectedOpportunity] = useState<string | null>(null);
    const [insightLoading, setInsightLoading] = useState(false);

    // Function to open opportunity insight modal
    const openOpportunityInsight = (opportunityId: string) => {
        setSelectedOpportunity(opportunityId);
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
            exchanges: ["Uniswap", "Curve"],
            rule: "Execute when spread exceeds 0.8%",
            nextCheck: "Every 10 minutes",
            status: "active",
            currentSpread: "0.42%"
        }
    ];

    // Recent tasks history
    const tasksHistory = [
        {
            id: "history-1",
            pair: "BTC / ETH",
            icons: ["/icons/btc.svg", "/icons/eth.svg"],
            exchanges: ["Binance", "Coinbase"],
            rule: "Execute when spread exceeds 0.5%",
            completedDate: "May 12, 2023",
            profit: "0.032 ETH",
            outcome: "successful",
            roi: "0.72%"
        },
        {
            id: "history-2",
            pair: "LINK / ETH",
            icons: ["/icons/link.svg", "/icons/eth.svg"],
            exchanges: ["Uniswap", "SushiSwap"],
            rule: "Execute when spread exceeds 1.0%",
            completedDate: "May 8, 2023",
            profit: "0.15 ETH",
            outcome: "successful",
            roi: "1.2%"
        }
    ];

    // Arbitrage opportunity data for insights
    const arbitrageOpportunities = [
        {
            id: "eth-usdc-uni-curve",
            name: "ETH/USDC Uniswap-Curve",
            pair: "ETH / USDC",
            icons: ["/icons/eth.svg", "/icons/usdc.svg"],
            exchanges: ["Uniswap", "Curve"],
            exchangeIcons: ["/icons/uniswap.svg", "/icons/curve.svg"],
            spread: "0.42%",
            change: "+0.12%",
            volume: "$18.2M",
            profitPotential: "Medium"
        },
        {
            id: "btc-eth-binance-coinbase",
            name: "BTC/ETH Binance-Coinbase",
            pair: "BTC / ETH",
            icons: ["/icons/btc.svg", "/icons/eth.svg"],
            exchanges: ["Binance", "Coinbase"],
            exchangeIcons: ["/icons/binance.svg", "/icons/coinbase.svg"],
            spread: "0.31%",
            change: "-0.08%",
            volume: "$24.5M",
            profitPotential: "Low"
        },
        {
            id: "usdc-usdt-curve-uni",
            name: "USDC/USDT Curve-Uniswap",
            pair: "USDC / USDT",
            icons: ["/icons/usdc.svg", "/icons/usdt.svg"],
            exchanges: ["Curve", "Uniswap"],
            exchangeIcons: ["/icons/curve.svg", "/icons/uniswap.svg"],
            spread: "0.15%",
            change: "+0.03%",
            volume: "$42.7M",
            profitPotential: "Low"
        },
        {
            id: "link-eth-uni-sushi",
            name: "LINK/ETH Uniswap-SushiSwap",
            pair: "LINK / ETH",
            icons: ["/icons/link.svg", "/icons/eth.svg"],
            exchanges: ["Uniswap", "SushiSwap"],
            exchangeIcons: ["/icons/uniswap.svg", "/icons/sushi.svg"],
            spread: "0.87%",
            change: "+0.23%",
            volume: "$8.4M",
            profitPotential: "High"
        },
        {
            id: "wbtc-usdc-uni-sushi",
            name: "WBTC/USDC Uniswap-SushiSwap",
            pair: "WBTC / USDC",
            icons: ["/icons/wbtc.svg", "/icons/usdc.svg"],
            exchanges: ["Uniswap", "SushiSwap"],
            exchangeIcons: ["/icons/uniswap.svg", "/icons/sushi.svg"],
            spread: "0.56%",
            change: "+0.14%",
            volume: "$12.3M",
            profitPotential: "Medium"
        }
    ];

    // Detailed insight data for each arbitrage opportunity
    const opportunityInsights: Record<string, ArbitrageOpportunityInsight> = {
        "eth-usdc-uni-curve": {
            name: "ETH/USDC Uniswap-Curve",
            pairName: "ETH/USDC",
            logos: ["/icons/eth.svg", "/icons/usdc.svg"],
            exchanges: ["Uniswap", "Curve"],
            exchangeLogos: ["/icons/uniswap.svg", "/icons/curve.svg"],
            summary: "Moderate spread with consistent arbitrage potential due to different pricing mechanisms between AMMs.",
            stats: {
                currentSpread: "0.42%",
                spreadChange: "+0.12%",
                volume24h: "$18.2M",
                avgProfit: "0.2-0.5%",
                successRate: "78%",
                lastOpportunity: "47 minutes ago"
            },
            spreadHistory: [
                { time: "24h ago", spread: 0.28 },
                { time: "20h ago", spread: 0.31 },
                { time: "16h ago", spread: 0.38 },
                { time: "12h ago", spread: 0.35 },
                { time: "8h ago", spread: 0.29 },
                { time: "4h ago", spread: 0.36 },
                { time: "Now", spread: 0.42 }
            ],
            marketDetails: [
                {
                    exchange: "Uniswap V3",
                    logo: "/icons/uniswap.svg",
                    price: "3,248.75 USDC",
                    volume: "$12.4M",
                    slippage: "0.12%",
                    liquidity: "$245.8M"
                },
                {
                    exchange: "Curve",
                    logo: "/icons/curve.svg",
                    price: "3,235.21 USDC",
                    volume: "$5.8M",
                    slippage: "0.08%",
                    liquidity: "$128.5M"
                }
            ],
            profitAnalysis: [
                {
                    tradeSize: "5 ETH",
                    estimatedGas: "$25-35",
                    potentialProfit: "$67.75",
                    netProfit: "$32.75-$42.75",
                    roi: "0.20-0.26%"
                },
                {
                    tradeSize: "10 ETH",
                    estimatedGas: "$28-38",
                    potentialProfit: "$135.50",
                    netProfit: "$97.50-$107.50",
                    roi: "0.30-0.33%"
                },
                {
                    tradeSize: "20 ETH",
                    estimatedGas: "$32-42",
                    potentialProfit: "$271.00",
                    netProfit: "$229.00-$239.00",
                    roi: "0.35-0.37%"
                }
            ],
            recommendations: [
                {
                    title: "Wait for 0.8%+ spread",
                    reason: "Historical analysis shows highest ROI for ETH/USDC arbitrage at 0.8%+ spread threshold",
                    impact: "high",
                    implementation: "Set threshold trigger at 0.8% with position size of 15-20 ETH for optimal gas efficiency"
                },
                {
                    title: "Monitor gas prices",
                    reason: "Execution during high gas price periods significantly reduces or eliminates profit potential",
                    impact: "medium",
                    implementation: "Add max gas price limit of 50 gwei to arbitrage triggers"
                }
            ],
            strategies: [
                {
                    title: "Flash Loan Arbitrage",
                    description: "Use flash loans to execute larger arbitrage trades without capital requirements",
                    complexity: "High",
                    expectedReturn: "0.6-0.9%",
                    risk: "Medium (smart contract risk)",
                    recommendation: "Consider for advanced users with smart contract experience"
                },
                {
                    title: "Standard Cross-Exchange",
                    description: "Basic arbitrage using your own capital across exchanges",
                    complexity: "Low",
                    expectedReturn: "0.3-0.5%",
                    risk: "Low",
                    recommendation: "Optimal for most users, especially at higher spread thresholds"
                }
            ]
        },
        "link-eth-uni-sushi": {
            name: "LINK/ETH Uniswap-SushiSwap",
            pairName: "LINK/ETH",
            logos: ["/icons/link.svg", "/icons/eth.svg"],
            exchanges: ["Uniswap", "SushiSwap"],
            exchangeLogos: ["/icons/uniswap.svg", "/icons/sushi.svg"],
            summary: "Significant pricing inefficiency between two major DEXs with potential for profitable arbitrage.",
            stats: {
                currentSpread: "0.87%",
                spreadChange: "+0.23%",
                volume24h: "$8.4M",
                avgProfit: "0.5-1.1%",
                successRate: "85%",
                lastOpportunity: "18 minutes ago"
            },
            spreadHistory: [
                { time: "24h ago", spread: 0.56 },
                { time: "20h ago", spread: 0.64 },
                { time: "16h ago", spread: 0.72 },
                { time: "12h ago", spread: 0.68 },
                { time: "8h ago", spread: 0.75 },
                { time: "4h ago", spread: 0.82 },
                { time: "Now", spread: 0.87 }
            ],
            recommendations: [
                {
                    title: "Immediate arbitrage opportunity",
                    reason: "Current spread exceeds profitable threshold with positive trend",
                    impact: "high",
                    implementation: "Set up arbitrage task with 0.5% threshold to capture current opportunity"
                }
            ],
            strategies: [
                {
                    title: "Multi-Hop Arbitrage",
                    description: "Execute through intermediate tokens for enhanced profits",
                    complexity: "Medium",
                    expectedReturn: "0.9-1.3%",
                    risk: "Medium",
                    recommendation: "Implement for LINK/ETH pair to maximize returns"
                }
            ]
        },
        "wbtc-usdc-uni-sushi": {
            name: "WBTC/USDC Uniswap-SushiSwap",
            pairName: "WBTC/USDC",
            logos: ["/icons/wbtc.svg", "/icons/usdc.svg"],
            exchanges: ["Uniswap", "SushiSwap"],
            exchangeLogos: ["/icons/uniswap.svg", "/icons/sushi.svg"],
            summary: "Moderate but consistent spread with lower competition due to capital requirements.",
            stats: {
                currentSpread: "0.56%",
                spreadChange: "+0.14%",
                volume24h: "$12.3M",
                avgProfit: "0.3-0.6%",
                successRate: "81%",
                lastOpportunity: "32 minutes ago"
            },
            recommendations: [
                {
                    title: "Set trigger at 0.65%",
                    reason: "Historical data suggests optimal execution at 0.65%+ spread given gas costs",
                    impact: "medium",
                    implementation: "Configure arbitrage with 0.65% threshold and monitoring"
                }
            ],
            strategies: [
                {
                    title: "Aggregator Routing",
                    description: "Use DEX aggregators to optimize execution paths",
                    complexity: "Low",
                    expectedReturn: "0.4-0.7%",
                    risk: "Low",
                    recommendation: "Ideal for this pair given liquidity distribution"
                }
            ]
        },
        "btc-eth-binance-coinbase": {
            name: "BTC/ETH Binance-Coinbase",
            pairName: "BTC/ETH",
            logos: ["/icons/btc.svg", "/icons/eth.svg"],
            exchanges: ["Binance", "Coinbase"],
            exchangeLogos: ["/icons/binance.svg", "/icons/coinbase.svg"],
            summary: "Cross-exchange CEX arbitrage with withdrawal/deposit delays and fees reducing profitability.",
            stats: {
                currentSpread: "0.31%",
                spreadChange: "-0.08%",
                volume24h: "$24.5M",
                avgProfit: "0.1-0.3%",
                successRate: "62%",
                lastOpportunity: "2.5 hours ago"
            },
            recommendations: [
                {
                    title: "Maintain capital on both exchanges",
                    reason: "Withdrawal delays eliminate most opportunities; requires pre-positioned capital",
                    impact: "high",
                    implementation: "Split funds across exchanges and set higher spread threshold (0.7%+)"
                }
            ],
            strategies: [
                {
                    title: "Statistical Arbitrage",
                    description: "Use price reversion patterns rather than immediate execution",
                    complexity: "High",
                    expectedReturn: "0.3-0.5%",
                    risk: "Medium",
                    recommendation: "Better approach for CEX arbitrage given settlement times"
                }
            ]
        },
        "usdc-usdt-curve-uni": {
            name: "USDC/USDT Curve-Uniswap",
            pairName: "USDC/USDT",
            logos: ["/icons/usdc.svg", "/icons/usdt.svg"],
            exchanges: ["Curve", "Uniswap"],
            exchangeLogos: ["/icons/curve.svg", "/icons/uniswap.svg"],
            summary: "Stablecoin arbitrage with minimal spreads but high capital efficiency and safety.",
            stats: {
                currentSpread: "0.15%",
                spreadChange: "+0.03%",
                volume24h: "$42.7M",
                avgProfit: "0.05-0.2%",
                successRate: "92%",
                lastOpportunity: "38 minutes ago"
            },
            recommendations: [
                {
                    title: "Large volume stablecoin strategy",
                    reason: "Small spreads require larger positions for gas efficiency",
                    impact: "medium",
                    implementation: "Set high minimum ($100k+) with tight spread threshold (0.2%+)"
                }
            ],
            strategies: [
                {
                    title: "Triangle Arbitrage",
                    description: "Arbitrage through a third stablecoin for enhanced returns",
                    complexity: "Medium",
                    expectedReturn: "0.15-0.25%",
                    risk: "Very Low",
                    recommendation: "Optimal for risk-averse arbitrage with stablecoins"
                }
            ]
        }
    };

    // Get selected opportunity insights
    const getSelectedOpportunityInsights = () => {
        if (!selectedOpportunity) return null;
        return opportunityInsights[selectedOpportunity];
    };

    // Determine badge color based on profit potential
    const getProfitBadgeColor = (potential: string) => {
        switch (potential) {
            case "High":
                return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
            case "Medium":
                return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
            case "Low":
                return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
            default:
                return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400";
        }
    };

    return (
        <div className="container mx-auto py-6 space-y-8">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        <span className="flex items-center gap-2">
                            <Shuffle className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                            Arbitrage Automation
                        </span>
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Automate cross-exchange arbitrage to capture price inefficiencies
                    </p>
                </div>
                <Button
                    className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white"
                    onClick={() => setCreateTaskModalOpen(true)}
                >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Arbitrage Task
                </Button>
            </div>

            {/* Interactive Arbitrage Opportunities Section */}
            <Card className="border-teal-100 dark:bg-slate-900/90  dark:border-indigo-900/30 shadow-lg overflow-hidden">
                <CardHeader className="pb-0">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-amber-500" />
                            <CardTitle className="text-lg">Arbitrage Opportunities</CardTitle>
                        </div>
                        <Badge variant="outline" className="px-2 py-1 text-xs bg-teal-50 text-teal-600 dark:bg-teal-900/20 dark:text-teal-300 border-teal-200 dark:border-teal-800">
                            <Clock className="mr-1 h-3 w-3" />
                            Live Market Data
                        </Badge>
                    </div>
                    <CardDescription>
                        Analyze cross-exchange price differences and set up automated arbitrage strategies
                    </CardDescription>
                </CardHeader>

                <CardContent className="p-0 mt-4 dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg">
                    <div className="p-4 bg-gradient-to-b from-teal-50/50 to-emerald-50/30 dark:from-teal-950/20 dark:to-emerald-950/10 border-y border-teal-100/50 dark:border-teal-800/30 mb-4">
                        <p className="text-sm text-teal-700 dark:text-teal-300">
                            Click on any arbitrage opportunity to view detailed spread analysis, profitability calculations, and optimal execution strategies.
                        </p>
                    </div>

                    {/* Arbitrage Opportunities Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                        {arbitrageOpportunities.map(opportunity => (
                            <Card
                                key={opportunity.id}
                                className="group hover:border-teal-300 dark:hover:border-teal-700 transition-all 
                                cursor-pointer relative overflow-hidden dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg"
                                onClick={() => openOpportunityInsight(opportunity.id)}
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="relative h-12 w-16 flex-shrink-0">
                                            <Avatar className="h-10 w-10 absolute left-0 top-0">
                                                <AvatarImage src={opportunity.icons[0]} alt={opportunity.pair.split(' / ')[0]} />
                                                <AvatarFallback className="bg-teal-100 text-teal-600 dark:bg-teal-900 dark:text-teal-200">
                                                    {opportunity.pair.split(' / ')[0].substring(0, 2)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <Avatar className="h-10 w-10 absolute left-6 top-2 border-2 border-white dark:border-slate-900">
                                                <AvatarImage src={opportunity.icons[1]} alt={opportunity.pair.split(' / ')[1]} />
                                                <AvatarFallback className="bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-200">
                                                    {opportunity.pair.split(' / ')[1].substring(0, 2)}
                                                </AvatarFallback>
                                            </Avatar>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold">{opportunity.pair}</h3>
                                            <div className="flex gap-1 mt-1">
                                                <Badge variant="outline" className="text-xs px-1.5 py-0 h-5">
                                                    {opportunity.exchanges[0]}
                                                </Badge>
                                                <ArrowLeftRight className="h-3 w-3 text-slate-400" />
                                                <Badge variant="outline" className="text-xs px-1.5 py-0 h-5">
                                                    {opportunity.exchanges[1]}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <div className="flex justify-between items-center mb-1 text-sm">
                                            <span className="text-slate-600 dark:text-slate-400">Price Spread</span>
                                            <span className="font-medium">{opportunity.spread}
                                                <span className={cn(
                                                    "text-xs ml-1",
                                                    opportunity.change.startsWith("+")
                                                        ? "text-green-600 dark:text-green-400"
                                                        : "text-red-600 dark:text-red-400"
                                                )}>
                                                    {opportunity.change}
                                                </span>
                                            </span>
                                        </div>
                                        <Progress
                                            value={parseFloat(opportunity.spread.replace('%', ''))}
                                            max={1}
                                            className="h-1.5 [&>div]:bg-teal-500"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 mb-3">
                                        <div className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded-md">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-slate-500 dark:text-slate-400">24h Volume</span>
                                                <span className="font-medium">{opportunity.volume}</span>
                                            </div>
                                        </div>
                                        <div className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded-md">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-slate-500 dark:text-slate-400">Profit Potential</span>
                                                <Badge className={cn("text-xs", getProfitBadgeColor(opportunity.profitPotential))}>
                                                    {opportunity.profitPotential}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full gap-1 group-hover:bg-teal-50 group-hover:text-teal-600 dark:group-hover:bg-teal-900/20
                                         dark:group-hover:text-teal-400 group-hover:border-teal-200 
                                         dark:group-hover:border-teal-800 dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg"
                                    >
                                        <Eye className="h-3.5 w-3.5" />
                                        View Opportunity
                                    </Button>

                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-teal-500/5 dark:to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
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
                                <CheckCircle2 className="h-5 w-5 text-teal-500" />
                                Active Arbitrage Tasks
                            </CardTitle>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 gap-1 text-teal-600"
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
                                                    <AvatarFallback className="bg-teal-100 text-teal-600 dark:bg-teal-900 dark:text-teal-200">
                                                        {task.pair.split(' / ')[0].substring(0, 2)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <Avatar className="h-8 w-8 absolute left-6 top-1 border-2 border-white dark:border-slate-800">
                                                    <AvatarImage src={task.icons[1]} alt={task.pair.split(' / ')[1]} />
                                                    <AvatarFallback className="bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-200">
                                                        {task.pair.split(' / ')[1].substring(0, 2)}
                                                    </AvatarFallback>
                                                </Avatar>
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <h4 className="font-medium text-slate-900 dark:text-white">{task.pair}</h4>
                                                        <Badge className="mt-1 bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 font-normal">
                                                            Active
                                                        </Badge>
                                                    </div>
                                                    <div className="flex flex-col items-end">
                                                        <div className="flex gap-1 mb-1">
                                                            <Badge variant="outline" className="text-xs px-1.5 py-0 h-5">
                                                                {task.exchanges[0]}
                                                            </Badge>
                                                            <ArrowLeftRight className="h-3 w-3 text-slate-400" />
                                                            <Badge variant="outline" className="text-xs px-1.5 py-0 h-5">
                                                                {task.exchanges[1]}
                                                            </Badge>
                                                        </div>
                                                        <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                                            Check: {task.nextCheck}
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                                                    <span className="font-medium">Rule:</span> {task.rule}
                                                </p>
                                                <div className="flex items-center gap-1 mt-3 text-xs text-slate-500 dark:text-slate-400">
                                                    <Percent className="h-3.5 w-3.5" />
                                                    <span>Current spread: {task.currentSpread}</span>
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
                                <Shuffle className="h-10 w-10 text-slate-300 dark:text-slate-700 mb-2" />
                                <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-1">No active tasks</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-4">
                                    You don't have any active arbitrage tasks. Create one to start capturing price inefficiencies.
                                </p>
                                <Button
                                    size="sm"
                                    onClick={() => setCreateTaskModalOpen(true)}
                                    className="bg-teal-600 hover:bg-teal-700 text-white"
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
                            Arbitrage History
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
                                                    <AvatarFallback className="bg-teal-100 text-teal-600 dark:bg-teal-900 dark:text-teal-200">
                                                        {task.pair.split(' / ')[0].substring(0, 2)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <Avatar className="h-8 w-8 absolute left-6 top-1 border-2 border-white dark:border-slate-800">
                                                    <AvatarImage src={task.icons[1]} alt={task.pair.split(' / ')[1]} />
                                                    <AvatarFallback className="bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-200">
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
                                                        Profit: {task.profit}
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
                                                    <div className="flex items-center gap-1">
                                                        <TrendingUp className="h-3.5 w-3.5" />
                                                        <span>ROI: {task.roi}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <div className="flex justify-center pt-2">
                                    <Button variant="link" className="text-teal-600 dark:text-teal-400 h-auto p-0">
                                        View All History
                                        <ArrowRight className="ml-1 h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-center border border-dashed border-slate-300 dark:border-slate-700 rounded-lg">
                                <Shuffle className="h-10 w-10 text-slate-300 dark:text-slate-700 mb-2" />
                                <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-1">No arbitrage history</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
                                    Your completed arbitrage tasks will appear here
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Resources Section */}
            <Card className="dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg">
                <CardHeader>
                    <CardTitle className="text-lg">Resources & Strategies</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                            <h3 className="font-semibold mb-2 flex items-center gap-2">
                                <Info className="h-4 w-4 text-teal-600" />
                                <span>Arbitrage Fundamentals</span>
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                                Learn about different types of crypto arbitrage and how to execute them effectively
                            </p>
                            <Button variant="link" className="h-auto p-0 text-teal-600 dark:text-teal-400">
                                Read Guide
                                <ExternalLink className="ml-1 h-3 w-3" />
                            </Button>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                            <h3 className="font-semibold mb-2 flex items-center gap-2">
                                <Users className="h-4 w-4 text-teal-600" />
                                <span>Gas Optimization</span>
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                                Learn techniques to minimize gas costs and maximize profits in arbitrage trades
                            </p>
                            <Button variant="link" className="h-auto p-0 text-teal-600 dark:text-teal-400">
                                View Strategies
                                <ExternalLink className="ml-1 h-3 w-3" />
                            </Button>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                            <h3 className="font-semibold mb-2 flex items-center gap-2">
                                <Zap className="h-4 w-4 text-amber-600" />
                                <span>Flash Loan Arbitrage</span>
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                                Advanced techniques using flash loans to execute capital-efficient arbitrage
                            </p>
                            <Button variant="link" className="h-auto p-0 text-teal-600 dark:text-teal-400">
                                View Guide
                                <ExternalLink className="ml-1 h-3 w-3" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Arbitrage Opportunity Insights Modal */}
            <Dialog open={insightModalOpen} onOpenChange={setInsightModalOpen}>
                <DialogContent className="sm:max-w-[900px] p-0 max-h-[90vh] dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg overflow-hidden">
                    {insightLoading ? (
                        <div className="flex items-center justify-center p-8">
                            <div className="text-center">
                                <RefreshCw className="h-8 w-8 animate-spin text-teal-600 dark:text-teal-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium">Loading insights...</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                                    Fetching the latest arbitrage data and profit calculations
                                </p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {selectedOpportunity && (
                                <div className="flex flex-col h-full max-h-[90vh] dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg">
                                    <DialogHeader className="px-6 py-4 border-b border-slate-200 dark:bg-slate-900/90  dark:border-indigo-900/30 shadow-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="relative h-12 w-16">
                                                <Avatar className="h-10 w-10 absolute left-0 top-0">
                                                    <AvatarImage src={opportunityInsights[selectedOpportunity]?.logos[0]} />
                                                    <AvatarFallback className="bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300">
                                                        {opportunityInsights[selectedOpportunity]?.pairName.split('/')[0]}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <Avatar className="h-10 w-10 absolute left-6 top-2 border-2 border-white dark:border-slate-900">
                                                    <AvatarImage src={opportunityInsights[selectedOpportunity]?.logos[1]} />
                                                    <AvatarFallback className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                                                        {opportunityInsights[selectedOpportunity]?.pairName.split('/')[1]}
                                                    </AvatarFallback>
                                                </Avatar>
                                            </div>
                                            <div>
                                                <DialogTitle className="text-xl">
                                                    {opportunityInsights[selectedOpportunity]?.name} Arbitrage
                                                </DialogTitle>
                                                <DialogDescription>
                                                    Cross-exchange analysis and profit calculations
                                                </DialogDescription>
                                            </div>
                                            <div className="ml-auto flex items-center">
                                                <Badge className={cn(
                                                    "ml-2",
                                                    parseFloat(getSelectedOpportunityInsights()?.stats.currentSpread?.replace('%', '') || '0') >= 0.7
                                                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                                        : parseFloat(getSelectedOpportunityInsights()?.stats.currentSpread?.replace('%', '') || '0') >= 0.4
                                                            ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                                            : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                                )}>
                                                    {parseFloat(getSelectedOpportunityInsights()?.stats.currentSpread?.replace('%', '') || '0') >= 0.7
                                                        ? "High Profit Potential"
                                                        : parseFloat(getSelectedOpportunityInsights()?.stats.currentSpread?.replace('%', '') || '0') >= 0.4
                                                            ? "Medium Profit Potential"
                                                            : "Low Profit Potential"
                                                    }
                                                </Badge>
                                            </div>
                                        </div>
                                    </DialogHeader>

                                    <ScrollArea className="flex-1 px-6 py-4 h-full">
                                        <div className="space-y-6">
                                            {/* Summary */}
                                            <div>
                                                <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-100 dark:border-teal-900/30 rounded-lg p-4">
                                                    <p className="text-teal-800 dark:text-teal-300">
                                                        {getSelectedOpportunityInsights()?.summary}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Stats Overview */}
                                            <div>
                                                <h3 className="text-lg font-semibold mb-3">Opportunity Overview</h3>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                                    <Card className="bg-slate-50/50 dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg">
                                                        <CardContent className="p-4">
                                                            <p className="text-sm text-muted-foreground mb-1">Current Spread</p>
                                                            <div className="flex items-baseline">
                                                                <span className="text-2xl font-bold">{getSelectedOpportunityInsights()?.stats.currentSpread}</span>
                                                                <Badge className={cn(
                                                                    "ml-2",
                                                                    getSelectedOpportunityInsights()?.stats.spreadChange?.startsWith("+")
                                                                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                                                        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                                                )}>
                                                                    {getSelectedOpportunityInsights()?.stats.spreadChange}
                                                                </Badge>
                                                            </div>
                                                        </CardContent>
                                                    </Card>

                                                    <Card className="bg-slate-50/50 dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg">
                                                        <CardContent className="p-4">
                                                            <p className="text-sm text-muted-foreground mb-1">24h Volume</p>
                                                            <div className="flex items-baseline">
                                                                <span className="text-2xl font-bold">{getSelectedOpportunityInsights()?.stats.volume24h}</span>
                                                            </div>
                                                        </CardContent>
                                                    </Card>

                                                    <Card className="bg-slate-50/50 dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg">
                                                        <CardContent className="p-4">
                                                            <p className="text-sm text-muted-foreground mb-1">Historical Performance</p>
                                                            <div className="text-sm space-y-0.5">
                                                                <div className="flex justify-between">
                                                                    <span className="text-slate-500 dark:text-slate-400">Avg. Profit:</span>
                                                                    <span className="font-medium">{getSelectedOpportunityInsights()?.stats.avgProfit}</span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span className="text-slate-500 dark:text-slate-400">Success Rate:</span>
                                                                    <span className="font-medium">{getSelectedOpportunityInsights()?.stats.successRate}</span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span className="text-slate-500 dark:text-slate-400">Last Opportunity:</span>
                                                                    <span className="font-medium">{getSelectedOpportunityInsights()?.stats.lastOpportunity}</span>
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                </div>
                                            </div>

                                            {/* Spread History Chart */}
                                            {getSelectedOpportunityInsights()?.spreadHistory && (
                                                <div>
                                                    <h3 className="text-lg font-semibold mb-3">Spread Trend (24 Hours)</h3>
                                                    <Card className="dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg">
                                                        <CardContent className="p-4">
                                                            <div className="h-64 w-full">
                                                                <div className="flex justify-center items-center h-full">
                                                                    <div className="w-full flex flex-col space-y-2">
                                                                        <div className="flex items-center justify-between">
                                                                            <div className="text-xs text-slate-500 dark:text-slate-400">Spread (%)</div>
                                                                            <div className="text-xs text-slate-500 dark:text-slate-400">Time</div>
                                                                        </div>
                                                                        <div className="relative h-52 w-full">
                                                                            <div className="absolute bottom-0 left-0 right-0 top-0">
                                                                                {/* Simple chart visualization */}
                                                                                <div className="relative h-full w-full">
                                                                                    <div className="absolute inset-0 flex items-end justify-between px-2">
                                                                                        {getSelectedOpportunityInsights()?.spreadHistory?.map((point, i) => (
                                                                                            <div key={i} className="flex flex-col items-center">
                                                                                                <div
                                                                                                    className="bg-teal-500 dark:bg-teal-400 rounded-t w-10"
                                                                                                    style={{ height: `${(point.spread / 1) * 100}%` }}
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

                                            {/* Market Comparison */}
                                            {getSelectedOpportunityInsights()?.marketDetails && (
                                                <div className="dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg">
                                                    <h3 className="text-lg font-semibold mb-3">Exchange Comparison</h3>
                                                    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                                                        <div className="grid grid-cols-18 text-sm font-medium bg-slate-50 dark:bg-slate-800/80 p-3 border-b border-slate-200 dark:border-slate-700">
                                                            <div className="col-span-5">Exchange</div>
                                                            <div className="col-span-4 text-center">Price</div>
                                                            <div className="col-span-3 text-center">Volume</div>
                                                            <div className="col-span-3 text-center">Slippage</div>
                                                            <div className="col-span-3 text-center">Liquidity</div>
                                                        </div>

                                                        {getSelectedOpportunityInsights()?.marketDetails?.map((market, i) => (
                                                            <div key={i} className="grid grid-cols-18 p-3 text-sm border-b border-slate-200 dark:border-slate-700 last:border-0">
                                                                <div className="col-span-5">
                                                                    <div className="flex items-center gap-2">
                                                                        <Avatar className="h-6 w-6">
                                                                            <AvatarImage src={market.logo} alt={market.exchange} />
                                                                            <AvatarFallback className="bg-teal-100 text-teal-600 dark:bg-teal-900 dark:text-teal-200 text-xs">
                                                                                {market.exchange.substring(0, 2)}
                                                                            </AvatarFallback>
                                                                        </Avatar>
                                                                        <span className="font-medium">{market.exchange}</span>
                                                                    </div>
                                                                </div>
                                                                <div className="col-span-4 text-center font-medium">{market.price}</div>
                                                                <div className="col-span-3 text-center">{market.volume}</div>
                                                                <div className="col-span-3 text-center">
                                                                    <Badge className={cn(
                                                                        parseFloat(market.slippage.replace('%', '')) < 0.15
                                                                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                                                            : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                                                    )}>
                                                                        {market.slippage}
                                                                    </Badge>
                                                                </div>
                                                                <div className="col-span-3 text-center">{market.liquidity}</div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Profit Analysis */}
                                            {getSelectedOpportunityInsights()?.profitAnalysis && (
                                                <div className="dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg">
                                                    <h3 className="text-lg font-semibold mb-3">Profit Analysis</h3>
                                                    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                                                        <div className="grid grid-cols-15 text-sm font-medium bg-slate-50 dark:bg-slate-800/80 p-3 border-b border-slate-200 dark:border-slate-700">
                                                            <div className="col-span-3">Trade Size</div>
                                                            <div className="col-span-3 text-center">Est. Gas</div>
                                                            <div className="col-span-3 text-center">Potential Profit</div>
                                                            <div className="col-span-3 text-center">Net Profit</div>
                                                            <div className="col-span-3 text-center">ROI</div>
                                                        </div>

                                                        {getSelectedOpportunityInsights()?.profitAnalysis?.map((profit, i) => (
                                                            <div key={i} className="grid grid-cols-15 p-3 text-sm border-b border-slate-200 dark:border-slate-700 last:border-0">
                                                                <div className="col-span-3 font-medium">{profit.tradeSize}</div>
                                                                <div className="col-span-3 text-center">{profit.estimatedGas}</div>
                                                                <div className="col-span-3 text-center text-green-600 dark:text-green-400">{profit.potentialProfit}</div>
                                                                <div className="col-span-3 text-center text-green-600 dark:text-green-400">{profit.netProfit}</div>
                                                                <div className="col-span-3 text-center">
                                                                    <Badge className={cn(
                                                                        parseFloat(profit.roi.split('-')[0].replace('%', '')) > 0.3
                                                                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                                                            : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                                                    )}>
                                                                        {profit.roi}
                                                                    </Badge>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Recommended Strategies */}
                                            {getSelectedOpportunityInsights()?.recommendations && (
                                                <div className="dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg">
                                                    <h3 className="text-lg font-semibold mb-3">Recommended Approach</h3>
                                                    <div className="space-y-4">
                                                        {getSelectedOpportunityInsights()?.recommendations.map((rec, i) => (
                                                            <Card key={i} className="bg-teal-50/50 dark:bg-teal-900/10 border-teal-100 dark:border-teal-900/30">
                                                                <CardContent className="p-4">
                                                                    <div className="flex gap-3">
                                                                        <Badge className={cn(
                                                                            "h-fit",
                                                                            rec.impact === "high"
                                                                                ? "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400"
                                                                                : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                                                        )}>
                                                                            {rec.impact === "high" ? "High Impact" : "Medium Impact"}
                                                                        </Badge>
                                                                        <div>
                                                                            <h4 className="font-medium text-teal-800 dark:text-teal-300">{rec.title}</h4>
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
                                                                                    className="text-xs h-8 gap-1 bg-teal-600 hover:bg-teal-700 text-white"
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

                                            {/* Arbitrage Strategies */}
                                            {getSelectedOpportunityInsights()?.strategies && (
                                                <div className="dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg">
                                                    <h3 className="text-lg font-semibold mb-3">Advanced Strategies</h3>
                                                    <div className="space-y-4">
                                                        {getSelectedOpportunityInsights()?.strategies.map((strategy, i) => (
                                                            <Card key={i}>
                                                                <CardContent className="p-4">
                                                                    <div className="flex items-start justify-between">
                                                                        <div>
                                                                            <div className="flex items-center gap-2">
                                                                                <h4 className="font-medium">{strategy.title}</h4>
                                                                                <Badge className={cn(
                                                                                    strategy.complexity === "Low"
                                                                                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                                                                        : strategy.complexity === "Medium"
                                                                                            ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                                                                            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                                                                )}>
                                                                                    {strategy.complexity} Complexity
                                                                                </Badge>
                                                                            </div>
                                                                            <p className="text-sm mt-1 text-slate-600 dark:text-slate-400">{strategy.description}</p>
                                                                        </div>
                                                                        <div className="text-right">
                                                                            <div className="text-sm font-medium text-green-600 dark:text-green-400">
                                                                                {strategy.expectedReturn}
                                                                            </div>
                                                                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                                                Risk: {strategy.risk}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="mt-3 bg-slate-50 dark:bg-slate-800 rounded-md p-3 text-sm">
                                                                        <div className="flex justify-between items-center">
                                                                            <div>
                                                                                <span className="font-medium">Recommendation:</span> {strategy.recommendation}
                                                                            </div>
                                                                            <Button
                                                                                variant="outline"
                                                                                size="sm"
                                                                                onClick={() => {
                                                                                    setInsightModalOpen(false);
                                                                                    setCreateTaskModalOpen(true);
                                                                                }}
                                                                                className="h-7 text-xs border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300"
                                                                            >
                                                                                Set Up Strategy
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
                                                Data based on real-time market analysis and historical arbitrage performance
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
                                                    className="gap-1 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white"
                                                >
                                                    <PlusCircle className="h-4 w-4" />
                                                    Create Arbitrage Task
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

export default ArbitragePage;