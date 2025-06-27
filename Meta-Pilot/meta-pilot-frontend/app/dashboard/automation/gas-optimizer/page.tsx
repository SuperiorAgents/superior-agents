"use client";

import React, { useState } from "react";
import {
    Zap,
    ArrowRight,
    PlusCircle,
    BarChart3,
    RefreshCw,
    Lightbulb,
    TrendingUp,
    Clock,
    ExternalLink,
    Activity,
    Gauge,
    Wallet,
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
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import CreateTaskModal from "@/components/Dashbaord/Tasks/CreateTaskModal";

const GasOptimizerPage = () => {
    const [createTaskModalOpen, setCreateTaskModalOpen] = useState(false);
    const [refreshingInsights, setRefreshingInsights] = useState(false);

    // Simulate API call for refreshing insights
    const refreshInsights = () => {
        setRefreshingInsights(true);
        // Simulate API call
        setTimeout(() => {
            setRefreshingInsights(false);
        }, 1500);
    };

    // Mock data for gas insights
    const gasInsights = {
        currentGasPrice: "25 gwei",
        trend: "decreasing",
        weeklyLow: "12 gwei",
        weeklyHigh: "82 gwei",
        bestDayTime: "Sunday, 3-5 AM UTC",
        bestTransactionTypes: ["Simple Transfer", "ERC20 Transfer"],
        highCostTransactions: ["NFT Minting", "Complex DeFi Interactions"],
        gasUsageByType: [
            { type: "Transfer", percentage: 25, avgGas: "21,000" },
            { type: "Swap", percentage: 42, avgGas: "150,000" },
            { type: "NFT", percentage: 18, avgGas: "250,000" },
            { type: "Staking", percentage: 15, avgGas: "120,000" }
        ],
        savingsTips: [
            "Bundle multiple transactions to save on overall gas costs",
            "Use EIP-1559 transactions for more predictable pricing",
            "Consider L2 solutions like Arbitrum or Optimism for frequent transactions"
        ]
    };

    // Gas price trends for chart (simplified for this example)
    const gasTrends = [
        { time: "00:00", price: 35 },
        { time: "04:00", price: 28 },
        { time: "08:00", price: 42 },
        { time: "12:00", price: 52 },
        { time: "16:00", price: 38 },
        { time: "20:00", price: 31 },
        { time: "24:00", price: 25 }
    ];

    // Active gas optimization tasks
    const activeTasks = [
        {
            id: "task-1",
            name: "USDC Transfer to MetaMask",
            type: "transfer",
            targetGas: "< 20 gwei",
            created: "2 days ago",
            status: "waiting"
        },
        {
            id: "task-2",
            name: "Weekly Staking on Aave",
            type: "stake",
            targetGas: "< 30 gwei",
            created: "5 days ago",
            status: "executed",
            savedGas: "42%"
        }
    ];

    return (
        <div className="container mx-auto p-6">
            <div className="flex flex-col space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Gas Optimizer</h1>
                        <p className="text-muted-foreground">Schedule transactions when gas prices are low to save on fees</p>
                    </div>
                    <Button
                        onClick={() => setCreateTaskModalOpen(true)}
                        className="gap-2 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white"
                    >
                        <PlusCircle className="h-4 w-4" />
                        Create Gas Task
                    </Button>
                </div>

                {/* Gas Insights Section */}
                <Card className="border-yellow-200 dark:border-yellow-900/50 dark:bg-slate-900/90 shadow-lg">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Lightbulb className="h-5 w-5 text-yellow-500" />
                                <CardTitle className="text-lg font-medium">Gas Insights</CardTitle>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={refreshInsights}
                                disabled={refreshingInsights}
                                className="gap-2"
                            >
                                <RefreshCw className={cn("h-3 w-3", refreshingInsights && "animate-spin")} />
                                Refresh
                            </Button>
                        </div>
                        <CardDescription>
                            Real-time gas price analysis and optimization recommendations
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Current Gas Status */}
                            <Card className="border-yellow-100 dark:border-yellow-900/30 dark:bg-slate-900/90 shadow-lg">
                                <CardHeader className="pb-2 pt-4">
                                    <CardTitle className="text-md font-medium flex items-center gap-2">
                                        <Activity className="h-4 w-4 text-yellow-500" />
                                        Current Gas
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-col">
                                        <div className="flex items-baseline">
                                            <span className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                                                {gasInsights.currentGasPrice}
                                            </span>
                                            <span className="ml-2 text-xs text-green-600 dark:text-green-400 flex items-center">
                                                <TrendingUp className="h-3 w-3 mr-1" />
                                                {gasInsights.trend}
                                            </span>
                                        </div>
                                        <div className="mt-3 flex justify-between text-xs text-slate-500 dark:text-slate-400">
                                            <span>Weekly Low: {gasInsights.weeklyLow}</span>
                                            <span>Weekly High: {gasInsights.weeklyHigh}</span>
                                        </div>
                                        <div className="mt-2">
                                            <Progress value={30} className="h-1 bg-slate-100 dark:bg-slate-700" />
                                        </div>
                                        <div className="mt-4 text-xs text-slate-600 dark:text-slate-300">
                                            <span className="font-medium">Optimal time:</span> {gasInsights.bestDayTime}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Transaction Types Analysis */}
                            <Card className="border-yellow-100 dark:border-yellow-900/30 dark:bg-slate-900/90 shadow-lg">
                                <CardHeader className="pb-2 pt-4">
                                    <CardTitle className="text-md font-medium flex items-center gap-2">
                                        <Wallet className="h-4 w-4 text-yellow-500" />
                                        Transaction Types
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {gasInsights.gasUsageByType.map((item, index) => (
                                            <div key={index}>
                                                <div className="flex justify-between text-xs mb-1">
                                                    <span className="font-medium text-slate-700 dark:text-slate-300">{item.type}</span>
                                                    <span className="text-slate-500 dark:text-slate-400">Avg: {item.avgGas}</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <Progress value={item.percentage} className="h-2 bg-slate-100 dark:bg-slate-700" />
                                                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                                                        {item.percentage}%
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Gas Saving Tips */}
                            <Card className="border-yellow-100 dark:border-yellow-900/30 dark:bg-slate-900/90  shadow-lg">
                                <CardHeader className="pb-2 pt-4">
                                    <CardTitle className="text-md font-medium flex items-center gap-2">
                                        <Gauge className="h-4 w-4 text-yellow-500" />
                                        Optimization Tips
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2">
                                        {gasInsights.savingsTips.map((tip, index) => (
                                            <li key={index} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                                                <span className="mt-0.5 text-yellow-500">•</span>
                                                <span>{tip}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <Button
                                        variant="link"
                                        className="text-xs p-0 h-auto mt-3 text-yellow-600 dark:text-yellow-400"
                                    >
                                        View detailed gas guide
                                        <ExternalLink className="h-3 w-3 ml-1" />
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Gas Prediction (24h) */}
                        <div className="mt-6 dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-medium text-slate-800 dark:text-slate-200">
                                    Gas Price Prediction (24h)
                                </h3>
                                <Badge variant="outline" className="text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800">
                                    AI Prediction
                                </Badge>
                            </div>

                            <div className="h-[100px] w-full bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 flex items-end justify-between relative">
                                {/* Simplified chart visualization */}
                                {gasTrends.map((point, index) => (
                                    <div key={index} className="flex flex-col items-center">
                                        <div
                                            className="bg-yellow-500 dark:bg-yellow-400 w-2 rounded-t-sm"
                                            style={{ height: `${point.price}px`, maxHeight: "80px" }}
                                        ></div>
                                        <span className="text-[10px] mt-1 text-slate-500 dark:text-slate-400">{point.time}</span>
                                    </div>
                                ))}

                                {/* Overlay with message to create better chart */}
                                <div className="absolute inset-0 flex items-center justify-center bg-slate-50/80 dark:bg-slate-800/80 backdrop-blur-[1px] rounded-lg">
                                    <div className="text-center px-4">
                                        <Badge className="mb-2 bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800">
                                            API Integration Required
                                        </Badge>
                                        <p className="text-xs text-slate-600 dark:text-slate-400">
                                            Connect to our API for detailed gas predictions based on historical data and network activity
                                        </p>
                                        <Button
                                            variant="link"
                                            className="text-xs p-0 h-auto mt-2 text-yellow-600 dark:text-yellow-400"
                                        >
                                            View API documentation
                                            <ExternalLink className="h-3 w-3 ml-1" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Active Tasks */}
                <div className="dark:bg-slate-900/90 border-indigo-100 p-4 rounded-lg dark:border-indigo-900/30 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold">Active Gas Tasks</h2>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCreateTaskModalOpen(true)}
                            className="gap-2"
                        >
                            <PlusCircle className="h-3 w-3" />
                            New Task
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {activeTasks.map((task) => (
                            <Card key={task.id} className="border-slate-200 dark:border-slate-800 dark:bg-slate-900/90  dark:border-indigo-900/30 shadow-lg ">
                                <CardContent className="p-4">
                                    <div className="flex items-start gap-4">
                                        <div className="h-10 w-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center text-yellow-600 dark:text-yellow-400">
                                            {task.type === 'transfer' ? (
                                                <ArrowRight className="h-5 w-5" />
                                            ) : task.type === 'stake' ? (
                                                <BarChart3 className="h-5 w-5" />
                                            ) : (
                                                <Zap className="h-5 w-5" />
                                            )}
                                        </div>
                                        <div className="flex-grow">
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-medium text-slate-900 dark:text-slate-100">{task.name}</h3>
                                                <Badge
                                                    variant={task.status === 'executed' ? "default" : "secondary"}
                                                    className={cn(
                                                        task.status === 'executed'
                                                            ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800"
                                                            : "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800"
                                                    )}
                                                >
                                                    {task.status === 'executed' ? 'Executed' : 'Waiting for gas price'}
                                                </Badge>
                                            </div>
                                            <div className="mt-2 flex items-center gap-x-2 text-sm text-slate-500 dark:text-slate-400">
                                                <span className="flex items-center">
                                                    <Gauge className="h-3 w-3 mr-1" />
                                                    Target: {task.targetGas}
                                                </span>
                                                <span className="flex items-center">
                                                    <Clock className="h-3 w-3 mr-1" />
                                                    Created: {task.created}
                                                </span>
                                            </div>
                                            {task.status === 'executed' && task.savedGas && (
                                                <div className="mt-2 text-sm font-medium text-green-600 dark:text-green-400">
                                                    Saved {task.savedGas} on gas fees
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}

                        {/* Create new task card */}
                        <Card
                            className="border-dashed border-slate-300 dark:border-slate-700 shadow-none cursor-pointer
                             hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors
                             dark:bg-slate-900/90  dark:border-indigo-900/30 "
                            onClick={() => setCreateTaskModalOpen(true)}
                        >
                            <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full min-h-[124px]">
                                <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                                    <PlusCircle className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                                </div>
                                <h3 className="font-medium text-slate-700 dark:text-slate-300">Create a New Gas Task</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                    Schedule transactions to execute at optimal gas prices
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

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

export default GasOptimizerPage;