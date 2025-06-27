"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Check, CheckCircle2, Clock, ExternalLink, MoreHorizontal, Search, SlidersHorizontal, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { formatDate, cn } from '@/lib/utils';
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

// Mock data for completed tasks
const completedTasks = [
    {
        id: "task-c1",
        name: "ETH/DAI Price Monitor",
        type: "swap",
        description: "Swap 1 ETH for DAI when price increases by 8%",
        outcome: "Successfully swapped 1 ETH for 2,150 DAI",
        completedAt: new Date(2025, 4, 3, 14, 32),
        icon: "/icons/uniswap.svg",
        stats: {
            executed: 1,
            gas: 0.0046,
            savedGas: 0.0022,
            txHash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
        }
    },
    {
        id: "task-c2",
        name: "UNI Reward Claim",
        type: "claim",
        description: "Claim UNI rewards when they reach 100 tokens",
        outcome: "Claimed 127 UNI tokens",
        completedAt: new Date(2025, 3, 25, 10, 15),
        icon: "/icons/uniswap.svg",
        stats: {
            executed: 1,
            gas: 0.0028,
            savedGas: 0.0005,
            txHash: "0xdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abc",
        }
    },
    {
        id: "task-c3",
        name: "Polygon Bridge Watcher",
        type: "yield",
        description: "Move USDC to Polygon when gas prices are low",
        outcome: "Bridged 2,500 USDC to Polygon",
        completedAt: new Date(2025, 3, 18, 3, 45),
        icon: "/icons/polygon.svg",
        stats: {
            executed: 1,
            gas: 0.0031,
            savedGas: 0.0008,
            txHash: "0x7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456",
        }
    },
    {
        id: "task-c4",
        name: "ENS DAO Vote",
        type: "dao-vote",
        description: "Vote on ENS governance proposals",
        outcome: "Voted YES on ENS proposal #72",
        completedAt: new Date(2025, 3, 12, 18, 30),
        icon: "/icons/ens.svg",
        stats: {
            executed: 1,
            gas: 0.0022,
            savedGas: 0.0007,
            txHash: "0x567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234",
        }
    },
    {
        id: "task-c5",
        name: "Doodles Floor Monitor",
        type: "nft",
        description: "Buy a Doodle NFT when floor price drops by 15%",
        outcome: "Purchased Doodle #8752 for 5.8 ETH",
        completedAt: new Date(2025, 3, 5, 21, 10),
        icon: "/icons/doodles.svg",
        stats: {
            executed: 1,
            gas: 0.0062,
            savedGas: 0.0018,
            txHash: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b",
        }
    },
];

// Get type info
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

const CompletedTasksPage = () => {
    const [filterType, setFilterType] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [date, setDate] = useState<Date | undefined>();
    const [openTaskModal, setOpenTaskModal] = useState(false);

    // Filter tasks based on selected filters
    const filteredTasks = completedTasks.filter(task => {
        // Type filter
        const matchesType = filterType === 'all' || task.type === filterType;

        // Search query filter
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch =
            searchQuery === '' ||
            task.name.toLowerCase().includes(searchLower) ||
            task.description.toLowerCase().includes(searchLower) ||
            task.outcome.toLowerCase().includes(searchLower);

        // Date filter
        const matchesDate = !date || formatDate(task.completedAt, 'PP') === formatDate(date, 'PP');

        return matchesType && matchesSearch && matchesDate;
    });

    const clearFilters = () => {
        setFilterType('all');
        setSearchQuery('');
        setDate(undefined);
    };

    // Format savings
    const formatSavings = (gas: number, savedGas: number) => {
        const savingsPercent = (savedGas / (gas + savedGas)) * 100;
        return savingsPercent.toFixed(0);
    };

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
                        Completed Tasks
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
                        View your successfully completed automated tasks
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

            {/* Search and Filters */}
            <motion.div variants={itemVariants}>
                <Card className="dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg">
                    <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="relative flex-grow">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="Search completed tasks..."
                                    className="pl-9 dark:bg-slate-800/50"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <Select
                                    value={filterType}
                                    onValueChange={setFilterType}
                                >
                                    <SelectTrigger className="w-[140px] dark:bg-slate-800/50">
                                        <SelectValue placeholder="Type" />
                                    </SelectTrigger>
                                    <SelectContent className="dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg">
                                        <SelectItem value="all">All Types</SelectItem>
                                        <SelectItem value="dao-vote">DAO Votes</SelectItem>
                                        <SelectItem value="swap">Token Swaps</SelectItem>
                                        <SelectItem value="yield">Yield Actions</SelectItem>
                                        <SelectItem value="claim">Claims</SelectItem>
                                        <SelectItem value="nft">NFT Actions</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                "flex gap-2 items-center dark:bg-slate-800/50",
                                                date && "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-900/30"
                                            )}
                                        >
                                            <Calendar className="h-4 w-4" />
                                            {date ? formatDate(date, 'PP') : 'Date'}
                                            {date && (
                                                <X
                                                    className="h-3 w-3 ml-1 opacity-60 hover:opacity-100"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setDate(undefined);
                                                    }}
                                                />
                                            )}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0 dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg">
                                        <CalendarComponent
                                            mode="single"
                                            selected={date}
                                            onSelect={setDate}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>

                                <Button
                                    variant={Object.values([searchQuery, filterType, date])
                                        .some(val => val && val !== 'all') ? "secondary" : "outline"}
                                    size="icon"
                                    className="dark:bg-slate-800/50"
                                    onClick={clearFilters}
                                    title="Clear filters"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Task Cards */}
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
                                                    <DropdownMenuItem onClick={() => setOpenTaskModal(true)}>
                                                        <Check className="h-4 w-4 mr-2" />
                                                        Create Similar Task
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <a
                                                            href={`https://etherscan.io/tx/${task.stats.txHash}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                        >
                                                            <ExternalLink className="h-4 w-4 mr-2" />
                                                            View Transaction
                                                        </a>
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
                                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{task.name}</h3>
                                                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1">{task.description}</p>
                                            </div>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="py-2 flex-grow">
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                                                <CheckCircle2 className="h-4 w-4" />
                                                <span className="text-sm font-medium">Task Completed Successfully</span>
                                            </div>

                                            <div>
                                                <span className="text-sm text-slate-500 dark:text-slate-400">Outcome</span>
                                                <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">{task.outcome}</p>
                                            </div>

                                            <div>
                                                <span className="text-sm text-slate-500 dark:text-slate-400">Completed On</span>
                                                <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">
                                                    {formatDate(task.completedAt, 'PPP')} at {formatDate(task.completedAt, 'p')}
                                                </p>
                                            </div>

                                            <div className="flex gap-2 mt-4">
                                                <div className="flex-1 p-2 rounded-md bg-slate-50 dark:bg-slate-800/50 text-center">
                                                    <span className="text-xs text-slate-500 dark:text-slate-400 block">Gas Used</span>
                                                    <span className="text-sm font-medium text-slate-900 dark:text-white">
                                                        Ξ {task.stats.gas.toFixed(4)}
                                                    </span>
                                                </div>
                                                <div className="flex-1 p-2 rounded-md bg-green-50 dark:bg-green-900/10 text-center">
                                                    <span className="text-xs text-green-600 dark:text-green-400 block">Gas Saved</span>
                                                    <span className="text-sm font-medium text-green-600 dark:text-green-400">
                                                        {formatSavings(task.stats.gas, task.stats.savedGas)}% (Ξ {task.stats.savedGas.toFixed(4)})
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>

                                    <CardFooter className="border-t border-slate-200 dark:border-slate-800 pt-4">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full"
                                            asChild
                                        >
                                            <a
                                                href={`https://etherscan.io/tx/${task.stats.txHash}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <ExternalLink className="h-3.5 w-3.5 mr-2" />
                                                View on Etherscan
                                            </a>
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <CheckCircle2 className="h-12 w-12 text-slate-300 dark:text-slate-700 mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">No completed tasks found</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
                        {Object.values([searchQuery, filterType, date])
                            .some(val => val && val !== 'all')
                            ? "No tasks match your current filters. Try adjusting your search criteria."
                            : "You don't have any completed tasks yet. Tasks will appear here once they are successfully completed."}
                    </p>
                    {Object.values([searchQuery, filterType, date])
                        .some(val => val && val !== 'all') && (
                            <Button
                                variant="outline"
                                className="mt-4"
                                onClick={clearFilters}
                            >
                                Clear Filters
                            </Button>
                        )}
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

export default CompletedTasksPage;