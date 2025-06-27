"use client";

import React, { useState } from "react";
import {
    BarChart3,
    RefreshCcw,
    TrendingUp,
    TrendingDown,
    Zap,
    Clock,
    Info,
    ChevronRight,
    Settings
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

// Gas price levels and statuses
type GasLevel = "low" | "average" | "high";
type NetworkStatus = "normal" | "congested" | "busy";

// Gas data interface
interface GasData {
    network: string;
    status: NetworkStatus;
    lastUpdated: Date;
    gasPrice: {
        low: number;
        average: number;
        fast: number;
        fastest: number;
    };
    estimatedTimes: {
        low: string;
        average: string;
        fast: string;
        fastest: string;
    };
    historicalPrices: {
        time: string;
        price: number;
    }[];
    recommendedLevel: GasLevel;
    pendingTransactions?: number;
    baseFee?: number;
    priorityFee?: number;
}

// Mock gas data
const mockGasData: GasData = {
    network: "Ethereum",
    status: "normal",
    lastUpdated: new Date(),
    gasPrice: {
        low: 16,
        average: 22,
        fast: 29,
        fastest: 35,
    },
    estimatedTimes: {
        low: "~5 min",
        average: "~3 min",
        fast: "~1 min",
        fastest: "~30 sec",
    },
    historicalPrices: Array.from({ length: 24 }, (_, i) => ({
        time: `${i}:00`,
        price: Math.floor(15 + Math.random() * 25),
    })),
    recommendedLevel: "average",
    pendingTransactions: 142_531,
    baseFee: 20,
    priorityFee: 2,
};

interface GasTrackerProps {
    className?: string;
    compact?: boolean;
}

const GasTracker: React.FC<GasTrackerProps> = ({ className, compact = false }) => {
    const [gasData, setGasData] = useState<GasData>(mockGasData);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedNetwork, setSelectedNetwork] = useState("ethereum");

    // Simulated refresh
    const refreshGasData = () => {
        setIsLoading(true);

        // Simulate API call
        setTimeout(() => {
            // Create slightly different data for effect
            const newData = {
                ...gasData,
                lastUpdated: new Date(),
                gasPrice: {
                    low: Math.max(10, gasData.gasPrice.low + Math.floor(Math.random() * 5) - 2),
                    average: Math.max(15, gasData.gasPrice.average + Math.floor(Math.random() * 5) - 2),
                    fast: Math.max(20, gasData.gasPrice.fast + Math.floor(Math.random() * 5) - 2),
                    fastest: Math.max(30, gasData.gasPrice.fastest + Math.floor(Math.random() * 5) - 2),
                },
                pendingTransactions: Math.max(100000, gasData.pendingTransactions! + (Math.floor(Math.random() * 20000) - 10000)),
            };

            setGasData(newData);
            setIsLoading(false);
        }, 1200);
    };

    // Get network status color
    const getNetworkStatusColor = (status: NetworkStatus) => {
        switch (status) {
            case "normal":
                return "text-green-600 dark:text-green-400";
            case "busy":
                return "text-amber-600 dark:text-amber-400";
            case "congested":
                return "text-red-600 dark:text-red-400";
            default:
                return "text-slate-600 dark:text-slate-400";
        }
    };

    // Get network status icon
    const getNetworkStatusIcon = (status: NetworkStatus) => {
        switch (status) {
            case "normal":
                return <Badge variant="outline" className="ml-2 bg-green-50 dark:bg-green-900/10 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800/50">
                    Normal
                </Badge>;
            case "busy":
                return <Badge variant="outline" className="ml-2 bg-amber-50 dark:bg-amber-900/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/50">
                    Busy
                </Badge>;
            case "congested":
                return <Badge variant="outline" className="ml-2 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800/50">
                    Congested
                </Badge>;
            default:
                return null;
        }
    };

    // Calculate gas price trend (compared to 6h ago)
    const getGasTrend = () => {
        const currentPrice = gasData.gasPrice.average;
        // For mock purposes, use a random historical price
        const historicalPrice = currentPrice + (Math.random() > 0.5 ? 5 : -5);

        const percentChange = ((currentPrice - historicalPrice) / historicalPrice) * 100;

        return {
            direction: percentChange >= 0 ? "up" : "down",
            percent: Math.abs(percentChange).toFixed(1),
        };
    };

    const trend = getGasTrend();

    // Render the compact version (summary)
    if (compact) {
        return (
            <Card className={className}>
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
                            <div>
                                <h3 className="font-medium text-slate-900 dark:text-slate-100">Gas: {gasData.gasPrice.average} gwei</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {getNetworkStatusIcon(gasData.status)}
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-3 gap-2">
                            <div className="grid grid-cols-3 gap-2 w-full">
                                <div className="text-center p-2 border border-slate-200 dark:border-slate-800 rounded-md bg-slate-50 dark:bg-slate-800/50">
                                    <div className="text-xs text-slate-500 dark:text-slate-400">Low</div>
                                    <div className="font-semibold text-slate-900 dark:text-slate-100">{gasData.gasPrice.low}</div>
                                </div>
                                <div className="text-center p-2 border border-blue-200 dark:border-blue-800/50 rounded-md bg-blue-50 dark:bg-blue-900/20">
                                    <div className="text-xs text-blue-600 dark:text-blue-400">Average</div>
                                    <div className="font-semibold text-blue-600 dark:text-blue-400">{gasData.gasPrice.average}</div>
                                </div>
                                <div className="text-center p-2 border border-slate-200 dark:border-slate-800 rounded-md bg-slate-50 dark:bg-slate-800/50">
                                    <div className="text-xs text-slate-500 dark:text-slate-400">Fast</div>
                                    <div className="font-semibold text-slate-900 dark:text-slate-100">{gasData.gasPrice.fast}</div>
                                </div>
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={refreshGasData}
                                disabled={isLoading}
                                className="h-8 gap-1 flex-shrink-0"
                            >
                                <RefreshCcw className={cn("h-3.5 w-3.5", isLoading && "animate-spin")} />
                                <span className="text-xs">Refresh</span>
                            </Button>
                        </div>

                        <div className="flex items-center mt-3 justify-between text-xs text-slate-500 dark:text-slate-400">
                            <span>Updated {formatDistanceToNow(gasData.lastUpdated)} ago</span>
                            <Link href="/dashboard/gas-tracker" className="flex items-center text-blue-600 dark:text-blue-400 font-medium">
                                Details
                                <ChevronRight className="h-3.5 w-3.5" />
                            </Link>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Full version
    return (
        <Card className={className}>
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        Gas Tracker
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        <Select
                            defaultValue={selectedNetwork}
                            onValueChange={setSelectedNetwork}
                        >
                            <SelectTrigger className="h-8 w-36">
                                <SelectValue placeholder="Network" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ethereum">Ethereum</SelectItem>
                                <SelectItem value="polygon">Polygon</SelectItem>
                                <SelectItem value="arbitrum">Arbitrum</SelectItem>
                                <SelectItem value="optimism">Optimism</SelectItem>
                            </SelectContent>
                        </Select>

                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={refreshGasData}
                            disabled={isLoading}
                        >
                            <RefreshCcw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                        </Button>
                    </div>
                </div>
                <CardDescription className="flex items-center justify-between mt-1">
                    <div className="flex items-center">
                        <span>{gasData.network} Network</span>
                        {getNetworkStatusIcon(gasData.status)}
                    </div>
                    <span className="text-xs">
                        Updated {formatDistanceToNow(gasData.lastUpdated)} ago
                    </span>
                </CardDescription>
            </CardHeader>

            <CardContent className="pt-0">
                {/* Current Gas Prices */}
                <div className="my-4">
                    <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                        Current Gas Prices (gwei)
                    </h3>

                    <div className="grid grid-cols-4 gap-3">
                        {/* Low */}
                        <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-3 text-center">
                            <div className="font-semibold text-xl text-slate-900 dark:text-slate-100">{gasData.gasPrice.low}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Slow</div>
                            <div className="text-xs text-slate-600 dark:text-slate-400">{gasData.estimatedTimes.low}</div>
                        </div>

                        {/* Average */}
                        <div className={cn(
                            "border rounded-lg p-3 text-center",
                            gasData.recommendedLevel === "average" ?
                                "border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20" :
                                "border-slate-200 dark:border-slate-800"
                        )}>
                            <div className={cn(
                                "font-semibold text-xl",
                                gasData.recommendedLevel === "average" ?
                                    "text-blue-600 dark:text-blue-400" :
                                    "text-slate-900 dark:text-slate-100"
                            )}>
                                {gasData.gasPrice.average}
                            </div>
                            <div className={cn(
                                "text-xs mb-1",
                                gasData.recommendedLevel === "average" ?
                                    "text-blue-600 dark:text-blue-400" :
                                    "text-slate-500 dark:text-slate-400"
                            )}>
                                Average
                                {gasData.recommendedLevel === "average" && " (Recommended)"}
                            </div>
                            <div className="text-xs text-slate-600 dark:text-slate-400">{gasData.estimatedTimes.average}</div>
                        </div>

                        {/* Fast */}
                        <div className={cn(
                            "border rounded-lg p-3 text-center",
                            gasData.recommendedLevel === "high" ?
                                "border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20" :
                                "border-slate-200 dark:border-slate-800"
                        )}>
                            <div className={cn(
                                "font-semibold text-xl",
                                gasData.recommendedLevel === "high" ?
                                    "text-blue-600 dark:text-blue-400" :
                                    "text-slate-900 dark:text-slate-100"
                            )}>
                                {gasData.gasPrice.fast}
                            </div>
                            <div className={cn(
                                "text-xs mb-1",
                                gasData.recommendedLevel === "high" ?
                                    "text-blue-600 dark:text-blue-400" :
                                    "text-slate-500 dark:text-slate-400"
                            )}>
                                Fast
                                {gasData.recommendedLevel === "high" && " (Recommended)"}
                            </div>
                            <div className="text-xs text-slate-600 dark:text-slate-400">{gasData.estimatedTimes.fast}</div>
                        </div>

                        {/* Fastest */}
                        <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-3 text-center">
                            <div className="font-semibold text-xl text-slate-900 dark:text-slate-100">{gasData.gasPrice.fastest}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Fastest</div>
                            <div className="text-xs text-slate-600 dark:text-slate-400">{gasData.estimatedTimes.fastest}</div>
                        </div>
                    </div>
                </div>

                {/* Gas Price Trend */}
                <div className="my-6">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Gas Price Trend (24h)
                        </h3>
                        <div className="flex items-center">
                            {trend.direction === "up" ? (
                                <div className="flex items-center text-xs text-red-600 dark:text-red-400">
                                    <TrendingUp className="h-3.5 w-3.5 mr-1" />
                                    <span>+{trend.percent}% from 6h ago</span>
                                </div>
                            ) : (
                                <div className="flex items-center text-xs text-green-600 dark:text-green-400">
                                    <TrendingDown className="h-3.5 w-3.5 mr-1" />
                                    <span>-{trend.percent}% from 6h ago</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Chart placeholder - would be a real chart in production */}
                    <div className="h-44 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                        <span className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
                            <BarChart3 className="h-5 w-5" />
                            Gas Price History Chart
                        </span>
                    </div>
                </div>

                {/* Additional Information */}
                <div className="grid grid-cols-2 gap-4 mt-5">
                    <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-3">
                        <h4 className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Pending Transactions
                        </h4>
                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                            {gasData.pendingTransactions?.toLocaleString()}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            May affect confirmation times
                        </div>
                    </div>

                    <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-3">
                        <h4 className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                            EIP-1559 Details
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <div className="text-xs text-slate-500 dark:text-slate-400">Base Fee</div>
                                <div className="font-semibold text-slate-900 dark:text-slate-100">{gasData.baseFee} gwei</div>
                            </div>
                            <div>
                                <div className="text-xs text-slate-500 dark:text-slate-400">Priority Fee</div>
                                <div className="font-semibold text-slate-900 dark:text-slate-100">{gasData.priorityFee} gwei</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Info Footer */}
                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 mt-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 border border-slate-200 dark:border-slate-800">
                    <Info className="h-3.5 w-3.5 flex-shrink-0" />
                    <span>
                        MetaPilot automatically optimizes your transaction fees. Tasks will execute at the selected gas price level or better.
                    </span>
                </div>
            </CardContent>

            <CardFooter className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
                <Button variant="outline" size="sm" className="gap-1">
                    <Clock className="h-4 w-4" />
                    <span>Gas Price History</span>
                </Button>
                <Button variant="outline" size="sm" className="gap-1">
                    <Settings className="h-4 w-4" />
                    <span>Gas Settings</span>
                </Button>
            </CardFooter>
        </Card>
    );
};

export default GasTracker;