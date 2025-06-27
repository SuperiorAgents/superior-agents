"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Clock, AlertTriangle, MoreHorizontal, PauseCircle, PlayCircle, RotateCcw, Edit, Trash2, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useRouter } from 'next/navigation';
import CreateTaskModal from '@/components/Dashbaord/Tasks/CreateTaskModal';

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.3 },
    },
};

// Mock data for tasks
const tasks = [
    {
        id: "task-1",
        name: "DAO Voting on Nouns",
        type: "dao-vote",
        description: "Vote YES when proposal contains 'rewards' or 'incentives'",
        status: "active",
        lastAction: "Voted YES on Proposal #427 (May 10, 2025)",
        nextAction: "Waiting for new proposals",
        icon: "/icons/nouns.svg",
        progress: 100,
        createdAt: new Date(2025, 3, 15),
        stats: {
            executed: 12,
            pending: 0,
            gas: 0.0523
        }
    },
    {
        id: "task-2",
        name: "ETH/USDC Price Monitor",
        type: "swap",
        description: "Swap 2 ETH for USDC when price increases by 5%",
        // Mock data for tasks (continued)
        status: "active",
        lastAction: "Monitoring price (Currently +2.3% from baseline)",
        nextAction: "Will swap at +5% (Target: $3,407.65)",
        icon: "/icons/uniswap.svg",
        progress: 46,
        createdAt: new Date(2025, 4, 5),
        stats: {
            executed: 0,
            pending: 1,
            gas: 0
        }
    },
    {
        id: "task-3",
        name: "USDC Yield Optimizer",
        type: "yield",
        description: "Move USDC to highest APY platform when difference exceeds 0.5%",
        status: "active",
        lastAction: "Moved 5,000 USDC to Compound (May 8, 2025)",
        nextAction: "Monitoring yields across platforms",
        icon: "/icons/compound.svg",
        progress: 100,
        createdAt: new Date(2025, 3, 20),
        stats: {
            executed: 3,
            pending: 0,
            gas: 0.0241
        }
    },
    {
        id: "task-4",
        name: "Weekly Compound Claim",
        type: "claim",
        description: "Claim COMP rewards every Monday at 10am UTC",
        status: "paused",
        lastAction: "Claimed 42 COMP (May 7, 2025)",
        nextAction: "Resume to continue claiming",
        icon: "/icons/compound.svg",
        progress: 0,
        createdAt: new Date(2025, 2, 12),
        stats: {
            executed: 8,
            pending: 0,
            gas: 0.0412
        },
        pauseReason: "Paused manually on May 8, 2025"
    },
    {
        id: "task-5",
        name: "BAYC Floor Monitor",
        type: "nft",
        description: "Buy when floor price drops by 10% or more",
        status: "error",
        lastAction: "Error: Insufficient funds for purchase (May 4, 2025)",
        nextAction: "Update budget or disable task",
        icon: "/icons/bayc.svg",
        progress: 0,
        createdAt: new Date(2025, 3, 30),
        stats: {
            executed: 0,
            pending: 0,
            gas: 0.0062
        },
        errorMessage: "Transaction failed: Insufficient funds to complete purchase"
    },
];

// Get status badge
const getStatusBadge = (status: string) => {
    switch (status) {
        case 'active':
            return <Badge variant="outline" className="text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900/30">
                <Check className="h-3 w-3 mr-1" />
                Active
            </Badge>;
        case 'paused':
            return <Badge variant="outline" className="text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-900/30">
                <PauseCircle className="h-3 w-3 mr-1" />
                Paused
            </Badge>;
        case 'error':
            return <Badge variant="outline" className="text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Error
            </Badge>;
        default:
            return <Badge variant="outline" className="text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                {status}
            </Badge>;
    }
};

// Get type icon and name
const getTypeInfo = (type: string) => {
    switch (type) {
        case 'dao-vote':
            return {
                name: "DAO Voting",
                bgColor: "bg-blue-100 dark:bg-blue-900/30",
                textColor: "text-blue-600 dark:text-blue-400"
            };
        case 'swap':
            return {
                name: "Token Swap",
                bgColor: "bg-indigo-100 dark:bg-indigo-900/30",
                textColor: "text-indigo-600 dark:text-indigo-400"
            };
        case 'yield':
            return {
                name: "Yield Optimizer",
                bgColor: "bg-green-100 dark:bg-green-900/30",
                textColor: "text-green-600 dark:text-green-400"
            };
        case 'claim':
            return {
                name: "Rewards Claim",
                bgColor: "bg-orange-100 dark:bg-orange-900/30",
                textColor: "text-orange-600 dark:text-orange-400"
            };
        case 'nft':
            return {
                name: "NFT Purchase",
                bgColor: "bg-purple-100 dark:bg-purple-900/30",
                textColor: "text-purple-600 dark:text-purple-400"
            };
        default:
            return {
                name: "Automation",
                bgColor: "bg-slate-100 dark:bg-slate-900/30",
                textColor: "text-slate-600 dark:text-slate-400"
            };
    }
};

const ActiveTasksPage = () => {
    const router = useRouter();
    const [filter, setFilter] = useState('all');
    const [openTaskModal, setOpenTaskModal] = useState(false);

    // Handle task toggle (active/paused)
    const handleToggleTask = (taskId: string, currentStatus: string) => {
        // In a real app, you would update the task status in your database
        console.log(`Toggle task ${taskId} from ${currentStatus} to ${currentStatus === 'active' ? 'paused' : 'active'}`);
    };

    // Handle task edit
    const handleEditTask = (taskId: string) => {
        setOpenTaskModal(true);
    };

    // Handle task deletion
    const handleDeleteTask = (taskId: string) => {
        // In a real app, you would delete the task from your database
        console.log(`Delete task ${taskId}`);
    };

    // Filter tasks based on selected filter
    const filteredTasks = tasks.filter(task => {
        if (filter === 'all') return task.status !== 'completed';
        return task.status === filter;
    });

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6 p-6"
        >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                        Active Tasks
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
                        Manage and monitor your automated tasks
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        onClick={() => setOpenTaskModal(true)}
                        className="gap-2 h-9 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                    >
                        <Check className="h-4 w-4" />
                        Create Task
                    </Button>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex justify-between items-center">
                <Tabs value={filter} onValueChange={setFilter} className="w-full sm:w-auto">
                    <TabsList className="w-full sm:w-auto h-full flex flex-wrap gap-3">
                        <TabsTrigger value="all" className="flex-1 sm:flex-none">
                            All
                            <Badge className="ml-2" variant="secondary">
                                {tasks.filter(t => t.status !== 'completed').length}
                            </Badge>
                        </TabsTrigger>
                        <TabsTrigger value="active" className="flex-1 sm:flex-none">
                            Active
                            <Badge className="ml-2 bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-300">
                                {tasks.filter(t => t.status === 'active').length}
                            </Badge>
                        </TabsTrigger>
                        <TabsTrigger value="paused" className="flex-1 sm:flex-none">
                            Paused
                            <Badge className="ml-2 bg-amber-100 text-amber-700 dark:bg-amber-800 dark:text-amber-300">
                                {tasks.filter(t => t.status === 'paused').length}
                            </Badge>
                        </TabsTrigger>
                        <TabsTrigger value="error" className="flex-1 sm:flex-none">
                            Error
                            <Badge className="ml-2 bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-300">
                                {tasks.filter(t => t.status === 'error').length}
                            </Badge>
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {/* Tasks Grid */}
            {filteredTasks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTasks.map((task) => {
                        const typeInfo = getTypeInfo(task.type);

                        return (
                            <motion.div key={task.id} variants={itemVariants}>
                                <Card className="h-full flex flex-col dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg overflow-hidden">
                                    <CardHeader className="pb-2">
                                        <div className="flex justify-between items-start">
                                            <Badge className={`${typeInfo.bgColor} ${typeInfo.textColor} font-medium`}>
                                                {typeInfo.name}
                                            </Badge>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    {task.status === 'active' ? (
                                                        <DropdownMenuItem onClick={() => handleToggleTask(task.id, task.status)}>
                                                            <PauseCircle className="h-4 w-4 mr-2" />
                                                            Pause Task
                                                        </DropdownMenuItem>
                                                    ) : task.status === 'paused' ? (
                                                        <DropdownMenuItem onClick={() => handleToggleTask(task.id, task.status)}>
                                                            <PlayCircle className="h-4 w-4 mr-2" />
                                                            Resume Task
                                                        </DropdownMenuItem>
                                                    ) : task.status === 'error' ? (
                                                        <DropdownMenuItem onClick={() => handleToggleTask(task.id, task.status)}>
                                                            <RotateCcw className="h-4 w-4 mr-2" />
                                                            Retry Task
                                                        </DropdownMenuItem>
                                                    ) : null}
                                                    <DropdownMenuItem onClick={() => handleEditTask(task.id)}>
                                                        <Edit className="h-4 w-4 mr-2" />
                                                        Edit Task
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleDeleteTask(task.id)}
                                                        className="text-red-600 dark:text-red-400"
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        Delete Task
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>

                                        <div className="flex items-center mt-2">
                                            <Avatar className="h-10 w-10 mr-3">
                                                <AvatarImage src={task.icon} alt={task.name} />
                                                <AvatarFallback className={`${typeInfo.bgColor} ${typeInfo.textColor}`}>
                                                    {task.name.substring(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <CardTitle className="text-lg">{task.name}</CardTitle>
                                                <CardDescription className="line-clamp-1">{task.description}</CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="py-2 flex-grow">
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-slate-500 dark:text-slate-400">Status</span>
                                                {getStatusBadge(task.status)}
                                            </div>

                                            <div>
                                                <span className="text-sm text-slate-500 dark:text-slate-400">Last Action</span>
                                                <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">{task.lastAction}</p>
                                            </div>

                                            <div>
                                                <span className="text-sm text-slate-500 dark:text-slate-400">Next Action</span>
                                                <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">{task.nextAction}</p>
                                            </div>

                                            {task.status === 'active' && (
                                                <div>
                                                    <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                                                        <span>Progress</span>
                                                        <span>{task.progress}%</span>
                                                    </div>
                                                    <Progress value={task.progress} className="h-1" />
                                                </div>
                                            )}

                                            {task.status === 'error' && task.errorMessage && (
                                                <Alert variant="destructive" className="py-2 bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30">
                                                    <AlertDescription className="text-xs">
                                                        {task.errorMessage}
                                                    </AlertDescription>
                                                </Alert>
                                            )}

                                            {task.status === 'paused' && task.pauseReason && (
                                                <Alert className="py-2 bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-900/30">
                                                    <AlertDescription className="text-xs text-amber-700 dark:text-amber-400">
                                                        {task.pauseReason}
                                                    </AlertDescription>
                                                </Alert>
                                            )}
                                        </div>
                                    </CardContent>

                                    <CardFooter className="border-t border-slate-200 dark:border-slate-800 pt-4">
                                        <div className="flex justify-between w-full text-xs text-slate-500 dark:text-slate-400">
                                            <div>Executed: {task.stats.executed}</div>
                                            <div>Pending: {task.stats.pending}</div>
                                            <div>Gas Used: Ξ {task.stats.gas.toFixed(4)}</div>
                                        </div>
                                    </CardFooter>
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Clock className="h-12 w-12 text-slate-300 dark:text-slate-700 mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">No tasks found</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
                        {filter === 'all'
                            ? "You don't have any active tasks. Create a new task to get started."
                            : `You don't have any ${filter} tasks.`}
                    </p>
                    <Button
                        onClick={() => setOpenTaskModal(true)}
                        className="mt-4"
                    >
                        Create New Task
                    </Button>
                </div>
            )}

            {/* Create Task Modal */}
            <CreateTaskModal
                open={openTaskModal}
                onOpenChange={setOpenTaskModal}
            />
        </motion.div>
    );
};

export default ActiveTasksPage;