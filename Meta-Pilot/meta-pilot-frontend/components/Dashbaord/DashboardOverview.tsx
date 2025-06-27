"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
    ArrowUpRight,
    ArrowDownRight,
    Activity,
    Wallet,
    CheckCircle2,
    Clock,
    Plus,
    ChevronRight,
    AlertCircle,
    TrendingUp,
    Zap,
    Info,
    BarChart3,
    BellRing,
    RefreshCcw,
    MoreVertical,
    Vote
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

interface StatCardProps {
    title: string;
    value: string;
    change?: {
        value: string;
        type: "increase" | "decrease";
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
        <Card>
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
                                <ArrowUpRight className="h-3 w-3" />
                            ) : (
                                <ArrowDownRight className="h-3 w-3" />
                            )}
                            {change.value}
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
                </div>
            </CardContent>
        </Card>
    </motion.div>
);

const DashboardOverview: React.FC = () => {
    const [activeTab, setActiveTab] = useState("overview");

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
            className="space-y-6"
        >
            {/* Welcome Section */}
            <motion.div
                variants={itemVariants}
                className="flex flex-col md:flex-row items-start justify-between gap-4"
            >
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">
                        Welcome back, Alex!
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
                        Here's what's happening with your Web3 automation today.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button asChild size="sm" className="gap-2" variant="outline">
                        <Link href="/dashboard/wallet">
                            <Wallet className="h-4 w-4" />
                            <span>Wallet</span>
                        </Link>
                    </Button>
                    <Button asChild size="sm" className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                        <Link href="/dashboard/tasks/create">
                            <Plus className="h-4 w-4" />
                            <span>Create Task</span>
                        </Link>
                    </Button>
                </div>
            </motion.div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Active Tasks"
                    value="7"
                    change={{ value: "2", type: "increase" }}
                    icon={<Activity className="h-6 w-6" />}
                    iconBg="bg-blue-100 dark:bg-blue-900/30"
                    iconColor="text-blue-600 dark:text-blue-400"
                />
                <StatCard
                    title="Tasks Completed"
                    value="124"
                    change={{ value: "12%", type: "increase" }}
                    icon={<CheckCircle2 className="h-6 w-6" />}
                    iconBg="bg-green-100 dark:bg-green-900/30"
                    iconColor="text-green-600 dark:text-green-400"
                />
                <StatCard
                    title="Gas Saved"
                    value="Ξ 0.87"
                    change={{ value: "0.12", type: "increase" }}
                    icon={<TrendingUp className="h-6 w-6" />}
                    iconBg="bg-indigo-100 dark:bg-indigo-900/30"
                    iconColor="text-indigo-600 dark:text-indigo-400"
                />
                <StatCard
                    title="Portfolio Value"
                    value="$12,548.90"
                    change={{ value: "3.2%", type: "decrease" }}
                    icon={<Wallet className="h-6 w-6" />}
                    iconBg="bg-orange-100 dark:bg-orange-900/30"
                    iconColor="text-orange-600 dark:text-orange-400"
                />
            </div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="bg-slate-100 dark:bg-slate-800/50">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="tasks">Tasks</TabsTrigger>
                    <TabsTrigger value="wallet">Wallet</TabsTrigger>
                    <TabsTrigger value="activity">Activity</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        {/* Left Column */}
                        <div className="lg:col-span-2 space-y-4">
                            <motion.div
                                variants={itemVariants}
                                className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-800/30 rounded-xl p-4 sm:p-6"
                            >
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
                                    <div>
                                        <h3 className="font-semibold text-blue-800 dark:text-blue-200 flex items-center gap-2">
                                            <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                            AI Task Suggestions
                                        </h3>
                                        <p className="text-sm text-blue-700/80 dark:text-blue-300/80 mt-1">
                                            Based on your wallet activity, we recommend these automations.
                                        </p>
                                    </div>
                                    <Button variant="link" size="sm" asChild className="text-blue-700 dark:text-blue-300">
                                        <Link href="/dashboard/tasks/suggested">
                                            View all suggestions
                                            <ChevronRight className="ml-1 h-4 w-4" />
                                        </Link>
                                    </Button>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {/* Suggestion Card 1 */}
                                    <div className="bg-white dark:bg-slate-800 rounded-lg border border-blue-100 dark:border-blue-800/50 p-3 flex gap-3 hover:shadow-md transition-shadow">
                                        <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-300 flex-shrink-0">
                                            <BellRing className="h-5 w-5" />
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="font-medium text-slate-900 dark:text-slate-200">Claim AAVE Rewards</h4>
                                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">You have unclaimed rewards worth $32.45</p>
                                            <Button variant="link" size="sm" className="h-6 p-0 mt-1">Set up automation</Button>
                                        </div>
                                    </div>

                                    {/* Suggestion Card 2 */}
                                    <div className="bg-white dark:bg-slate-800 rounded-lg border border-blue-100 dark:border-blue-800/50 p-3 flex gap-3 hover:shadow-md transition-shadow">
                                        <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center text-purple-600 dark:text-purple-300 flex-shrink-0">
                                            <Vote className="h-5 w-5" />
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="font-medium text-slate-900 dark:text-slate-200">Vote on ENS Proposals</h4>
                                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">3 active proposals need your vote</p>
                                            <Button variant="link" size="sm" className="h-6 p-0 mt-1">Set up automation</Button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Active Tasks Panel */}
                            <motion.div variants={itemVariants}>
                                <Card>
                                    <CardHeader className="pb-2">
                                        <div className="flex justify-between items-center">
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                                Active Tasks
                                            </CardTitle>
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link href="/dashboard/tasks/active" className="text-sm flex items-center gap-1">
                                                    View all
                                                    <ChevronRight className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                        </div>
                                        <CardDescription>
                                            Your currently running automated tasks
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {/* Task item 1 */}
                                        <div className="flex items-center gap-3 border border-slate-200 dark:border-slate-800 rounded-lg p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-300 flex-shrink-0">
                                                <Vote className="h-5 w-5" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-start justify-between">
                                                    <h4 className="font-medium text-slate-900 dark:text-slate-100 truncate">
                                                        Vote on Nouns DAO
                                                    </h4>
                                                    <Badge variant="outline" className="ml-2 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900/30">
                                                        Active
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                                                    Vote YES if proposal mentions rewards or treasury
                                                </p>
                                                <div className="flex items-center mt-1.5 gap-4">
                                                    <span className="flex items-center text-xs text-slate-500 dark:text-slate-500">
                                                        <CheckCircle2 className="h-3 w-3 mr-1 text-green-500" />
                                                        14 votes cast
                                                    </span>
                                                    <span className="flex items-center text-xs text-slate-500 dark:text-slate-500">
                                                        <Clock className="h-3 w-3 mr-1" />
                                                        Next check in 2h
                                                    </span>
                                                </div>
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem>Edit Task</DropdownMenuItem>
                                                    <DropdownMenuItem>View History</DropdownMenuItem>
                                                    <DropdownMenuItem className="text-red-600 dark:text-red-400">
                                                        Pause Task
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>

                                        {/* Task item 2 */}
                                        <div className="flex items-center gap-3 border border-slate-200 dark:border-slate-800 rounded-lg p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center text-green-600 dark:text-green-300 flex-shrink-0">
                                                <RefreshCcw className="h-5 w-5" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-start justify-between">
                                                    <h4 className="font-medium text-slate-900 dark:text-slate-100 truncate">
                                                        USDC Yield Optimizer
                                                    </h4>
                                                    <Badge variant="outline" className="ml-2 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-900/30">
                                                        Pending
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                                                    Move USDC to highest yielding platform when APY difference &gt; 0.5%
                                                </p>
                                                <div className="flex items-center mt-1.5 gap-4">
                                                    <span className="flex items-center text-xs text-slate-500 dark:text-slate-500">
                                                        <CheckCircle2 className="h-3 w-3 mr-1 text-green-500" />
                                                        3 movements
                                                    </span>
                                                    <span className="flex items-center text-xs text-slate-500 dark:text-slate-500">
                                                        <Clock className="h-3 w-3 mr-1" />
                                                        Checking rates...
                                                    </span>
                                                </div>
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem>Edit Task</DropdownMenuItem>
                                                    <DropdownMenuItem>View History</DropdownMenuItem>
                                                    <DropdownMenuItem className="text-red-600 dark:text-red-400">
                                                        Pause Task
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>

                                        {/* Task item 3 */}
                                        <div className="flex items-center gap-3 border border-slate-200 dark:border-slate-800 rounded-lg p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <div className="h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center text-orange-600 dark:text-orange-300 flex-shrink-0">
                                                <BellRing className="h-5 w-5" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-start justify-between">
                                                    <h4 className="font-medium text-slate-900 dark:text-slate-100 truncate">
                                                        Claim Compound Rewards
                                                    </h4>
                                                    <Badge variant="outline" className="ml-2 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900/30">
                                                        Active
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                                                    Auto-claim when rewards reach 10 COMP tokens
                                                </p>
                                                <div className="mt-2">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-xs text-slate-600 dark:text-slate-400">
                                                            Progress: 7.2 / 10 COMP
                                                        </span>
                                                        <span className="text-xs text-slate-600 dark:text-slate-400">
                                                            72%
                                                        </span>
                                                    </div>
                                                    <Progress value={72} className="h-2" />
                                                </div>
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem>Edit Task</DropdownMenuItem>
                                                    <DropdownMenuItem>View History</DropdownMenuItem>
                                                    <DropdownMenuItem className="text-red-600 dark:text-red-400">
                                                        Pause Task
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="pt-0">
                                        <Button asChild className="w-full gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                                            <Link href="/dashboard/tasks/create">
                                                <Plus className="h-4 w-4" />
                                                <span>Create New Task</span>
                                            </Link>
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </motion.div>

                            {/* Recent Activity Panel */}
                            <motion.div variants={itemVariants}>
                                <Card>
                                    <CardHeader className="pb-2">
                                        <div className="flex justify-between items-center">
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                                Recent Activity
                                            </CardTitle>
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link href="/dashboard/activity" className="text-sm flex items-center gap-1">
                                                    View all
                                                    <ChevronRight className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                        </div>
                                        <CardDescription>
                                            Recent automated actions taken on your behalf
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {/* Activity Timeline */}
                                            <div className="ml-2">
                                                {/* Activity 1 */}
                                                <div className="flex gap-3 relative pt-2 pb-5">
                                                    <div className="absolute top-0 left-[11px] h-full w-px bg-slate-200 dark:bg-slate-700"></div>
                                                    <div className="h-6 w-6 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center text-green-600 dark:text-green-300 z-10 flex-shrink-0 mt-2 border-2 border-white dark:border-slate-900">
                                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                                            Voted YES on Nouns DAO Proposal #156
                                                        </p>
                                                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                                                            Proposal matched rule: "Contains rewards"
                                                        </p>
                                                        <div className="flex items-center mt-1 gap-3">
                                                            <Badge variant="secondary" className="text-[10px] h-4 px-1">
                                                                DAO Voting
                                                            </Badge>
                                                            <span className="text-xs text-slate-500 dark:text-slate-500">
                                                                15 min ago
                                                            </span>
                                                            <Button variant="link" size="sm" className="h-4 p-0 text-xs">
                                                                View Details
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Activity 2 */}
                                                <div className="flex gap-3 relative pt-2 pb-5">
                                                    <div className="absolute top-0 left-[11px] h-full w-px bg-slate-200 dark:bg-slate-700"></div>
                                                    <div className="h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-300 z-10 flex-shrink-0 mt-2 border-2 border-white dark:border-slate-900">
                                                        <RefreshCcw className="h-3.5 w-3.5" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                                            Moved 5,000 USDC to Compound
                                                        </p>
                                                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                                                            APY difference was 0.75% (Aave: 3.2%, Compound: 3.95%)
                                                        </p>
                                                        <div className="flex items-center mt-1 gap-3">
                                                            <Badge variant="secondary" className="text-[10px] h-4 px-1">
                                                                Yield Optimization
                                                            </Badge>
                                                            <span className="text-xs text-slate-500 dark:text-slate-500">
                                                                2 hours ago
                                                            </span>
                                                            <Button variant="link" size="sm" className="h-4 p-0 text-xs">
                                                                View Details
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Activity 3 */}
                                                <div className="flex gap-3 relative pt-2">
                                                    <div className="h-6 w-6 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-amber-600 dark:text-amber-300 z-10 flex-shrink-0 mt-2 border-2 border-white dark:border-slate-900">
                                                        <AlertCircle className="h-3.5 w-3.5" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                                            Skipped ETH Purchase
                                                        </p>
                                                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                                                            Gas prices were too high (85 gwei, threshold: 50 gwei)
                                                        </p>
                                                        <div className="flex items-center mt-1 gap-3">
                                                            <Badge variant="secondary" className="text-[10px] h-4 px-1">
                                                                Token Purchase
                                                            </Badge>
                                                            <span className="text-xs text-slate-500 dark:text-slate-500">
                                                                5 hours ago
                                                            </span>
                                                            <Button variant="link" size="sm" className="h-4 p-0 text-xs">
                                                                View Details
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-4">
                            {/* Gas Tracker Panel */}
                            <motion.div variants={itemVariants}>
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                            Current Gas Prices
                                        </CardTitle>
                                        <CardDescription className="flex items-center justify-between">
                                            <span>Ethereum Network Status</span>
                                            <span className="text-xs text-slate-500 dark:text-slate-400">
                                                Updated 2 min ago
                                            </span>
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="pt-0">
                                        <div className="space-y-3">
                                            {/* Gas Speed Options */}
                                            <div className="grid grid-cols-3 gap-2">
                                                {/* Slow */}
                                                <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-3 text-center">
                                                    <div className="font-semibold text-slate-900 dark:text-slate-100">16</div>
                                                    <div className="text-xs text-slate-500 dark:text-slate-400">Slow</div>
                                                    <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">~5 min</div>
                                                </div>

                                                {/* Average */}
                                                <div className="border dark:border-slate-800 rounded-lg p-3 text-center bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-900/30">
                                                    <div className="font-semibold text-blue-600 dark:text-blue-400">22</div>
                                                    <div className="text-xs text-blue-600 dark:text-blue-400">Average</div>
                                                    <div className="text-xs text-blue-600/80 dark:text-blue-400/80 mt-1">~3 min</div>
                                                </div>

                                                {/* Fast */}
                                                <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-3 text-center">
                                                    <div className="font-semibold text-slate-900 dark:text-slate-100">29</div>
                                                    <div className="text-xs text-slate-500 dark:text-slate-400">Fast</div>
                                                    <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">~1 min</div>
                                                </div>
                                            </div>

                                            {/* Gas over time graph - placeholder */}
                                            <div className="mt-4 h-[140px] bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                                                <span className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
                                                    <BarChart3 className="h-4 w-4" />
                                                    Gas Price History (24h)
                                                </span>
                                            </div>

                                            {/* Info */}
                                            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 mt-2">
                                                <Info className="h-3.5 w-3.5" />
                                                <span>Gas prices in gwei. MetaPilot automatically optimizes your transaction fees.</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>

                            {/* Wallet Overview Panel */}
                            <motion.div variants={itemVariants}>
                                <Card>
                                    <CardHeader className="pb-2">
                                        <div className="flex justify-between items-center">
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                <Wallet className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                                Wallet Overview
                                            </CardTitle>
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link href="/dashboard/wallet" className="text-sm flex items-center gap-1">
                                                    View all
                                                    <ChevronRight className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                        </div>
                                        <CardDescription>
                                            Your connected wallet balances
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {/* ETH Balance */}
                                        <div className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-800 rounded-lg">
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src="/icons/ethereum.svg" alt="ETH" />
                                                    <AvatarFallback className="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200">
                                                        ETH
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium text-slate-900 dark:text-slate-100">Ethereum</p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">ETH</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-medium text-slate-900 dark:text-slate-100">2.45 ETH</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">$5,230.25</p>
                                            </div>
                                        </div>

                                        {/* USDC Balance */}
                                        <div className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-800 rounded-lg">
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src="/icons/usdc.svg" alt="USDC" />
                                                    <AvatarFallback className="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200">
                                                        USDC
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium text-slate-900 dark:text-slate-100">USD Coin</p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">USDC</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-medium text-slate-900 dark:text-slate-100">5,000 USDC</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">$5,000.00</p>
                                            </div>
                                        </div>

                                        {/* AAVE Balance */}
                                        <div className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-800 rounded-lg">
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src="/icons/aave.svg" alt="AAVE" />
                                                    <AvatarFallback className="bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-200">
                                                        AAVE
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium text-slate-900 dark:text-slate-100">Aave</p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">AAVE</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-medium text-slate-900 dark:text-slate-100">18.2 AAVE</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">$1,456.00</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="pt-0 flex justify-between">
                                        <Button variant="outline" size="sm" className="gap-2">
                                            <RefreshCcw className="h-4 w-4" />
                                            Refresh
                                        </Button>
                                        <Button variant="outline" size="sm" className="gap-2">
                                            <Plus className="h-4 w-4" />
                                            Add Tokens
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </motion.div>
                        </div>
                    </div>
                </TabsContent>

                {/* Tasks Tab */}
                <TabsContent value="tasks">
                    <Card>
                        <CardHeader>
                            <CardTitle>Task Management</CardTitle>
                            <CardDescription>
                                View and manage your automated Web3 tasks
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p>Task management content will go here...</p>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Wallet Tab */}
                <TabsContent value="wallet">
                    <Card>
                        <CardHeader>
                            <CardTitle>Wallet Details</CardTitle>
                            <CardDescription>
                                View your wallet balances and transaction history
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p>Wallet details content will go here...</p>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Activity Tab */}
                <TabsContent value="activity">
                    <Card>
                        <CardHeader>
                            <CardTitle>Activity History</CardTitle>
                            <CardDescription>
                                Track all automated actions performed on your behalf
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p>Activity history content will go here...</p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </motion.div>
    );
};

export default DashboardOverview;