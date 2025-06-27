"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    DollarSign,
    Activity,
    FileText,
    ChevronDown,
    Download,
    ArrowRightLeft,
    Vote,
    Layers,
    RefreshCcw,
    BarChart,
    LineChart,
    PieChart,
    Share2,
    Info,
    Settings,
    Zap,
    Cpu
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { format, subDays } from "date-fns";

interface StatCardProps {
    title: string;
    value: string;
    change?: {
        value: string;
        type: "increase" | "decrease";
        percentage: string;
    };
    icon: React.ReactNode;
    iconBg: string;
    iconColor: string;
}

const StatCard: React.FC<StatCardProps> = ({
    title,
    value,
    change,
    icon,
    iconBg,
    iconColor,
}) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
    >
        <Card className='dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg'>
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div className={cn(
                        "h-12 w-12 rounded-full flex items-center justify-center",
                        iconBg
                    )}>
                        <div className={cn("h-6 w-6", iconColor)}>
                            {icon}
                        </div>
                    </div>
                    {change && (
                        <Badge
                            variant="outline"
                            className={cn(
                                "flex items-center gap-1 px-2 py-1",
                                change.type === "increase"
                                    ? "text-green-600 dark:text-green-400 border-green-200 dark:border-green-900/30 bg-green-50 dark:bg-green-900/10"
                                    : "text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10"
                            )}
                        >
                            {change.type === "increase" ? (
                                <TrendingUp className="h-3 w-3" />
                            ) : (
                                <TrendingDown className="h-3 w-3" />
                            )}
                            {change.percentage}
                        </Badge>
                    )}
                </div>
                <div className="mt-4">
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        {title}
                    </p>
                    <h3 className="text-2xl font-bold mt-1 text-slate-900 dark:text-slate-100">
                        {value}
                    </h3>
                    {change && (
                        <p className="text-xs mt-1 text-slate-500 dark:text-slate-400">
                            {change.type === "increase" ? "+" : ""}{change.value} from last period
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    </motion.div>
);

interface ChartCardProps {
    title: string;
    description?: string;
    height?: number;
    children?: React.ReactNode;
}

const ChartCard: React.FC<ChartCardProps> = ({
    title,
    description,
    height = 300,
    children,
}) => (
    <Card className="col-span-full md:col-span-2 dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg">
        <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
                <div>
                    <CardTitle className="text-lg">{title}</CardTitle>
                    {description && <CardDescription>{description}</CardDescription>}
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8 gap-1 dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg">
                            <FileText className="h-3.5 w-3.5" />
                            <span>Export</span>
                            <ChevronDown className="h-3.5 w-3.5" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg">
                        <DropdownMenuItem>
                            <Download className="mr-2 h-4 w-4" />
                            <span>CSV</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <Download className="mr-2 h-4 w-4" />
                            <span>PDF</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                            <Share2 className="mr-2 h-4 w-4" />
                            <span>Share</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </CardHeader>
        <CardContent>
            {/* Chart placeholder - would be actual chart components in production */}
            <div
                className="bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center"
                style={{ height: `${height}px` }}
            >
                {children || (
                    <div className="text-slate-500 dark:text-slate-400 text-center">
                        <BarChart3 className="h-6 w-6 mx-auto mb-2" />
                        <p>Chart data would appear here</p>
                    </div>
                )}
            </div>
        </CardContent>
    </Card>
);

const AnalyticsDashboard: React.FC = () => {
    const [timeRange, setTimeRange] = useState("7days");

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="container mx-auto py-6 max-w-6xl space-y-6"
        >
            {/* Header with time range selector */}
            <motion.div
                variants={itemVariants}
                className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">
                        Analytics Dashboard
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
                        Monitor your automation performance and insights
                    </p>
                </div>
                <div className="flex gap-3 items-center">
                    <Select
                        value={timeRange}
                        onValueChange={setTimeRange}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select a time range" />
                        </SelectTrigger>
                        <SelectContent className="className='dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg'">
                            <SelectGroup>
                                <SelectLabel>Time Range</SelectLabel>
                                <SelectItem value="24hours">Last 24 Hours</SelectItem>
                                <SelectItem value="7days">Last 7 Days</SelectItem>
                                <SelectItem value="30days">Last 30 Days</SelectItem>
                                <SelectItem value="90days">Last 90 Days</SelectItem>
                                <SelectItem value="custom">Custom Range</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                    <Button variant="outline" size="icon" className="h-9 w-9 dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg">
                        <RefreshCcw className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="h-9 w-9 dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg">
                        <Settings className="h-4 w-4" />
                    </Button>
                </div>
            </motion.div>

            {/* Key metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Active Tasks"
                    value="12"
                    change={{ value: "2", type: "increase", percentage: "20%" }}
                    icon={<Layers className="h-6 w-6" />}
                    iconBg="bg-blue-100 dark:bg-blue-900/30"
                    iconColor="text-blue-600 dark:text-blue-400"
                />
                <StatCard
                    title="Total Actions"
                    value="187"
                    change={{ value: "32", type: "increase", percentage: "21%" }}
                    icon={<Activity className="h-6 w-6" />}
                    iconBg="bg-green-100 dark:bg-green-900/30"
                    iconColor="text-green-600 dark:text-green-400"
                />
                <StatCard
                    title="Gas Saved"
                    value="Ξ 1.42"
                    change={{ value: "Ξ 0.25", type: "increase", percentage: "22%" }}
                    icon={<Zap className="h-6 w-6" />}
                    iconBg="bg-yellow-100 dark:bg-yellow-900/30"
                    iconColor="text-yellow-600 dark:text-yellow-400"
                />
                <StatCard
                    title="Est. Value Gained"
                    value="$427.50"
                    change={{ value: "$76.20", type: "increase", percentage: "25%" }}
                    icon={<DollarSign className="h-6 w-6" />}
                    iconBg="bg-indigo-100 dark:bg-indigo-900/30"
                    iconColor="text-indigo-600 dark:text-indigo-400"
                />
            </div>

            {/* Task Performance */}
            <motion.div variants={itemVariants}>
                <Card className='dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg'>
                    <CardHeader className="pb-2">
                        <CardTitle>Task Performance Overview</CardTitle>
                        <CardDescription>
                            Success rates and activity levels across your automated tasks
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {/* Task 1 */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                            <Vote className="h-4 w-4" />
                                        </div>
                                        <span className="font-medium text-slate-900 dark:text-slate-100">DAO Voting</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900/30">
                                            98% Success
                                        </Badge>
                                        <Badge variant="secondary">57 Actions</Badge>
                                    </div>
                                </div>
                                <Progress value={98} className="h-2" />
                                <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                                    <span>56 successful votes</span>
                                    <span>1 failed</span>
                                </div>
                            </div>

                            {/* Task 2 */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                                            <TrendingUp className="h-4 w-4" />
                                        </div>
                                        <span className="font-medium text-slate-900 dark:text-slate-100">Yield Optimization</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900/30">
                                            94% Success
                                        </Badge>
                                        <Badge variant="secondary">35 Actions</Badge>
                                    </div>
                                </div>
                                <Progress value={94} className="h-2" />
                                <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                                    <span>33 successful moves</span>
                                    <span>2 failed</span>
                                </div>
                            </div>

                            {/* Task 3 */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                            <ArrowRightLeft className="h-4 w-4" />
                                        </div>
                                        <span className="font-medium text-slate-900 dark:text-slate-100">Token Swaps</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-900/30">
                                            85% Success
                                        </Badge>
                                        <Badge variant="secondary">27 Actions</Badge>
                                    </div>
                                </div>
                                <Progress value={85} className="h-2" />
                                <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                                    <span>23 successful swaps</span>
                                    <span>4 failed</span>
                                </div>
                            </div>

                            {/* More tasks button */}
                            <div className="text-center">
                                <Button variant="ghost" size="sm" className="text-blue-600 dark:text-blue-400">
                                    Show all 12 tasks
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Chart row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <ChartCard
                    title="Activity Breakdown"
                    description="Task actions by category"
                    height={280}
                >
                    <div className="h-full w-full flex flex-col items-center justify-center">
                        <PieChart className="h-8 w-8 text-slate-400 mb-2" />
                        <div className="flex flex-col items-center">
                            <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">
                                Activity distribution
                            </p>
                            <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                                <div className="flex items-center gap-2">
                                    <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                                    <span className="text-xs text-slate-700 dark:text-slate-300">DAO Voting (31%)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="h-3 w-3 rounded-full bg-green-500"></div>
                                    <span className="text-xs text-slate-700 dark:text-slate-300">Yield (19%)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="h-3 w-3 rounded-full bg-indigo-500"></div>
                                    <span className="text-xs text-slate-700 dark:text-slate-300">Swaps (14%)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="h-3 w-3 rounded-full bg-orange-500"></div>
                                    <span className="text-xs text-slate-700 dark:text-slate-300">Claims (20%)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="h-3 w-3 rounded-full bg-purple-500"></div>
                                    <span className="text-xs text-slate-700 dark:text-slate-300">NFTs (8%)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="h-3 w-3 rounded-full bg-slate-500"></div>
                                    <span className="text-xs text-slate-700 dark:text-slate-300">Other (8%)</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </ChartCard>

                <ChartCard
                    title="Gas Savings"
                    description="ETH saved on gas fees over time"
                    height={280}
                >
                    <div className="h-full w-full flex flex-col items-center justify-center">
                        <LineChart className="h-8 w-8 text-slate-400 mb-2" />
                        <div className="flex flex-col items-center">
                            <p className="text-slate-500 dark:text-slate-400 text-sm mb-2">
                                Total gas saved
                            </p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1">
                                Ξ 1.42
                                <span className="text-xs font-normal text-green-600 dark:text-green-400 flex items-center">
                                    <TrendingUp className="h-3 w-3 mr-0.5" />
                                    22%
                                </span>
                            </p>
                            <p className="text-slate-600 dark:text-slate-400 text-xs mt-1">
                                ~$3,050 at current prices
                            </p>

                            <div className="w-full mt-6 space-y-2">
                                <div className="flex justify-between text-xs">
                                    <span className="text-slate-600 dark:text-slate-400">Daily average</span>
                                    <span className="font-medium text-slate-900 dark:text-slate-100">Ξ 0.04</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-slate-600 dark:text-slate-400">Highest day</span>
                                    <span className="font-medium text-slate-900 dark:text-slate-100">Ξ 0.18</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-slate-600 dark:text-slate-400">Most efficient task</span>
                                    <span className="font-medium text-slate-900 dark:text-slate-100">Yield Optimizer</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </ChartCard>
            </div>

            {/* Activity chart */}
            <motion.div variants={itemVariants}>
                <ChartCard
                    title="Activity Timeline"
                    description="All actions taken by your automated tasks"
                    height={350}
                >
                    <div className="h-full w-full flex items-center justify-center">
                        <BarChart className="h-8 w-8 text-slate-400" />
                    </div>
                </ChartCard>
            </motion.div>

            {/* Additional analytics sections */}
            <motion.div variants={itemVariants}>
                <Tabs defaultValue="performance" className="w-full dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg">
                    <TabsList className="w-full justify-start h-full flex flex-wrap gap-3 dark:bg-slate-700 border-indigo-100 dark:border-indigo-900/30 shadow-lg">
                        <TabsTrigger value="performance">Performance Metrics</TabsTrigger>
                        <TabsTrigger value="timing">Timing Analysis</TabsTrigger>
                        <TabsTrigger value="savings">Cost Savings</TabsTrigger>
                        <TabsTrigger value="compare">Comparison</TabsTrigger>
                    </TabsList>

                    <TabsContent value="performance">
                        <Card className='dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg'>
                            <CardHeader>
                                <CardTitle>Detailed Performance Metrics</CardTitle>
                                <CardDescription>
                                    Deep analysis of your automation performance
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">Success Rates</h3>
                                        <div className="space-y-2">
                                            <div>
                                                <div className="flex justify-between mb-1">
                                                    <span className="text-sm text-slate-600 dark:text-slate-400">Overall</span>
                                                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100">92%</span>
                                                </div>
                                                <Progress value={92} className="h-2" />
                                            </div>
                                            <div>
                                                <div className="flex justify-between mb-1">
                                                    <span className="text-sm text-slate-600 dark:text-slate-400">Last 7 days</span>
                                                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100">96%</span>
                                                </div>
                                                <Progress value={96} className="h-2" />
                                            </div>
                                            <div>
                                                <div className="flex justify-between mb-1">
                                                    <span className="text-sm text-slate-600 dark:text-slate-400">Last 30 days</span>
                                                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100">91%</span>
                                                </div>
                                                <Progress value={91} className="h-2" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">Execution Speed</h3>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-sm text-slate-600 dark:text-slate-400">Avg. execution time</span>
                                                <span className="text-sm font-medium text-slate-900 dark:text-slate-100">1.2 minutes</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-slate-600 dark:text-slate-400">Fastest execution</span>
                                                <span className="text-sm font-medium text-slate-900 dark:text-slate-100">15 seconds</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-slate-600 dark:text-slate-400">Slowest execution</span>
                                                <span className="text-sm font-medium text-slate-900 dark:text-slate-100">8.5 minutes</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-slate-600 dark:text-slate-400">Avg. confirmation blocks</span>
                                                <span className="text-sm font-medium text-slate-900 dark:text-slate-100">3 blocks</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">Resource Usage</h3>
                                        <div className="space-y-2">
                                            <div>
                                                <div className="flex justify-between mb-1">
                                                    <span className="text-sm text-slate-600 dark:text-slate-400">CPU Utilization</span>
                                                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100">42%</span>
                                                </div>
                                                <Progress value={42} className="h-2" />
                                            </div>
                                            <div>
                                                <div className="flex justify-between mb-1">
                                                    <span className="text-sm text-slate-600 dark:text-slate-400">Memory Usage</span>
                                                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100">38%</span>
                                                </div>
                                                <Progress value={38} className="h-2" />
                                            </div>
                                            <div>
                                                <div className="flex justify-between mb-1">
                                                    <span className="text-sm text-slate-600 dark:text-slate-400">API Quota</span>
                                                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100">25%</span>
                                                </div>
                                                <Progress value={25} className="h-2" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800/50">
                                    <div className="flex items-start gap-2">
                                        <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">Performance Insights</p>
                                            <p className="text-sm text-blue-600/90 dark:text-blue-300/90 mt-1">
                                                Your automation success rate has improved by 4% over the last 7 days. The most reliable task is DAO Voting with a 98% success rate. Consider reviewing the Token Swap task settings to improve its 85% success rate.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="timing">
                        <Card className='dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg'>
                            <CardHeader>
                                <CardTitle>Timing Analysis</CardTitle>
                                <CardDescription>
                                    When your tasks are most active and efficient
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p>Timing analysis content would go here...</p>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="savings">
                        <Card className='dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg'>
                            <CardHeader>
                                <CardTitle>Cost Savings Analysis</CardTitle>
                                <CardDescription>
                                    Detailed breakdown of gas and opportunity cost savings
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p>Cost savings content would go here...</p>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="compare">
                        <Card className='dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg'>
                            <CardHeader>
                                <CardTitle>Performance Comparison</CardTitle>
                                <CardDescription>
                                    Compare automation performance against benchmarks
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p>Comparison content would go here...</p>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </motion.div>

            {/* AI Insights Section */}
            <motion.div variants={itemVariants}>
                <Card className='dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg'>
                    <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                            <Cpu className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            <CardTitle>AI-Generated Insights</CardTitle>
                        </div>
                        <CardDescription>
                            Smart recommendations based on your automation patterns
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="p-4 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 border border-blue-100 dark:border-blue-800/40 rounded-xl">
                                <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
                                    <Zap className="h-4 w-4 text-amber-500" />
                                    Gas Optimization Opportunity
                                </h3>
                                <p className="text-sm text-slate-700 dark:text-slate-300">
                                    Your token swap tasks are often executed during high gas periods. Consider increasing the gas price threshold for non-urgent swaps to save approximately 0.05 ETH per week.
                                </p>
                                <div className="mt-3 flex gap-2">
                                    <Button size="sm" variant="outline" className="text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800">
                                        Adjust Settings
                                    </Button>
                                    <Button size="sm" variant="ghost">
                                        Ignore
                                    </Button>
                                </div>
                            </div>

                            <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-100 dark:border-green-800/40 rounded-xl">
                                <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4 text-green-500" />
                                    Yield Optimization Improvement
                                </h3>
                                <p className="text-sm text-slate-700 dark:text-slate-300">
                                    Your USDC is currently earning 3.2% APY on Aave. Adding a Compound monitoring task could increase your yield by up to 0.8% as rates fluctuate between platforms.
                                </p>
                                <div className="mt-3 flex gap-2">
                                    <Button size="sm" variant="outline" className="text-green-600 dark:text-green-400 border-green-200 dark:border-green-800">
                                        Create Task
                                    </Button>
                                    <Button size="sm" variant="ghost">
                                        Learn More
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </motion.div>
    );
};

export default AnalyticsDashboard;