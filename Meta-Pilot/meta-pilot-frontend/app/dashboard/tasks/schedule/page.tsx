"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, Check, Clock, MoreHorizontal, PauseCircle, PlayCircle, AlertCircle } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

// Mock data for scheduled tasks
const scheduledTasks = [
    {
        id: "task-s1",
        name: "Weekly COMP Claim",
        type: "claim",
        description: "Claim COMP rewards every Monday at 10am UTC",
        status: "active",
        icon: "/icons/compound.svg",
        schedule: {
            type: "weekly",
            day: "Monday",
            time: "10:00 AM",
        },
        nextExecution: new Date(2025, 4, 20, 10, 0) // Next Monday
    },
    {
        id: "task-s2",
        name: "Monthly Yield Rebalance",
        type: "yield",
        description: "Rebalance stablecoin positions on first day of each month",
        status: "active",
        icon: "/icons/compound.svg",
        schedule: {
            type: "monthly",
            day: "1",
            time: "12:00 PM",
        },
        nextExecution: new Date(2025, 5, 1, 12, 0) // First of next month
    },
    {
        id: "task-s3",
        name: "Uniswap LP Weekly Claim",
        type: "claim",
        description: "Claim UNI LP rewards every Friday at 8pm UTC",
        status: "active",
        icon: "/icons/uniswap.svg",
        schedule: {
            type: "weekly",
            day: "Friday",
            time: "8:00 PM",
        },
        nextExecution: new Date(2025, 4, 16, 20, 0) // Next Friday
    },
    {
        id: "task-s4",
        name: "Bi-weekly ETH DCA",
        type: "swap",
        description: "Buy 0.5 ETH with USDC every two weeks",
        status: "active",
        icon: "/icons/ethereum.svg",
        schedule: {
            type: "biweekly",
            day: "Wednesday",
            time: "3:00 PM",
        },
        nextExecution: new Date(2025, 4, 21, 15, 0) // Two weeks from now
    },
    {
        id: "task-s5",
        name: "Daily Gas Price Check",
        type: "yield",
        description: "Check gas prices and execute bridging if below threshold",
        status: "paused",
        icon: "/icons/polygon.svg",
        schedule: {
            type: "daily",
            time: "4:00 AM",
        },
        nextExecution: null // Paused
    },
    // Add more tasks with dates for selected day testing
    {
        id: "task-s6",
        name: "ENS Governance Vote",
        type: "dao-vote",
        description: "Vote on ENS governance proposals",
        status: "active",
        icon: "/icons/ens.svg",
        schedule: {
            type: "weekly",
            day: "Wednesday",
            time: "6:00 PM",
        },
        nextExecution: new Date(2025, 4, 14, 18, 0) // Today's date
    },
    {
        id: "task-s7",
        name: "AAVE Interest Rate Check",
        type: "yield",
        description: "Monitor AAVE interest rates and move assets if beneficial",
        status: "active",
        icon: "/icons/aave.svg",
        schedule: {
            type: "daily",
            time: "1:00 PM",
        },
        nextExecution: new Date(2025, 4, 14, 13, 0) // Today's date
    },
    {
        id: "task-s8",
        name: "Doodles Floor Monitoring",
        type: "nft",
        description: "Monitor Doodles floor price changes",
        status: "active",
        icon: "/icons/doodles.svg",
        schedule: {
            type: "daily",
            time: "9:00 AM",
        },
        nextExecution: new Date(2025, 4, 14, 9, 0) // Today's date
    }
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

// Status badge renderer
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
        default:
            return <Badge variant="outline" className="text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                {status}
            </Badge>;
    }
};

// Function to get events for the calendar
const getCalendarEvents = (tasks: typeof scheduledTasks) => {
    const events = new Map();

    tasks.forEach(task => {
        if (task.nextExecution && task.status === 'active') {
            const date = formatDate(task.nextExecution, 'yyyy-MM-dd');
            if (!events.has(date)) {
                events.set(date, []);
            }
            events.get(date).push(task);
        }
    });

    return events;
};

// Function to group tasks by time for a given day
const groupTasksByTime = (tasks: typeof scheduledTasks, date: Date) => {
    const dateStr = formatDate(date, 'yyyy-MM-dd');
    const filteredTasks = tasks.filter(task =>
        task.nextExecution &&
        formatDate(task.nextExecution, 'yyyy-MM-dd') === dateStr
    );

    // Sort by time
    filteredTasks.sort((a, b) => {
        if (!a.nextExecution || !b.nextExecution) return 0;
        return a.nextExecution.getTime() - b.nextExecution.getTime();
    });

    return filteredTasks;
};

const SchedulePage = () => {
    const [filterType, setFilterType] = useState('all');
    const [filterSchedule, setFilterSchedule] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [openTaskModal, setOpenTaskModal] = useState(false);

    // Get calendar events
    const events = getCalendarEvents(scheduledTasks);

    // Get tasks for selected date
    const tasksForSelectedDate = selectedDate
        ? groupTasksByTime(scheduledTasks, selectedDate)
        : [];

    // Filter tasks based on selected filters
    const filteredTasks = scheduledTasks.filter(task => {
        // Type filter
        const matchesType = filterType === 'all' || task.type === filterType;

        // Schedule filter
        const matchesSchedule = filterSchedule === 'all' || task.schedule.type === filterSchedule;

        // Status filter
        const matchesStatus = filterStatus === 'all' || task.status === filterStatus;

        return matchesType && matchesSchedule && matchesStatus;
    });

    // Handle task toggle (active/paused)
    const handleToggleTask = (taskId: string, currentStatus: string) => {
        // In a real app, you would update the task status in your database
        console.log(`Toggle task ${taskId} from ${currentStatus} to ${currentStatus === 'active' ? 'paused' : 'active'}`);
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
                        Task Schedule
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
                        View and manage your recurring automated tasks
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        onClick={() => setOpenTaskModal(true)}
                        className="gap-2 h-9 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                    >
                        <Check className="h-4 w-4  " />
                        Create Task
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left side: Calendar and Selected Day Tasks */}
                <motion.div variants={itemVariants} className="lg:col-span-7 space-y-6">
                    {/* Calendar Card */}
                    <Card className="dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg">
                        <CardHeader className="pb-2 flex flex-row items-center justify-between">
                            <CardTitle>Schedule Calendar</CardTitle>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedDate(new Date())}
                                >
                                    Today
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3">
                                <Calendar
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={setSelectedDate}
                                    className="w-full"
                                    modifiers={{
                                        hasEvent: (date) => {
                                            const dateStr = formatDate(date, 'yyyy-MM-dd');
                                            return events.has(dateStr);
                                        }
                                    }}
                                    modifiersClassNames={{
                                        hasEvent: "bg-blue-100 dark:bg-blue-900/30 font-bold text-blue-600 dark:text-blue-400"
                                    }}
                                    components={{
                                        DayContent: (props) => {
                                            const dateStr = formatDate(props.date, 'yyyy-MM-dd');
                                            const hasEvents = events.has(dateStr);
                                            const eventCount = hasEvents ? events.get(dateStr).length : 0;

                                            return (
                                                <div className="relative w-full h-full flex items-center justify-center">
                                                    <span>{props.date.getDate()}</span>
                                                    {hasEvents && eventCount > 0 && (
                                                        <div className="absolute -bottom-1 flex justify-center w-full">
                                                            <span className="inline-flex items-center justify-center w-5 h-4 text-[10px] font-semibold text-white bg-blue-500 dark:bg-blue-600 rounded-full">
                                                                {eventCount}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        }
                                    }}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Selected Day Tasks Card */}
                    <Card className="dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-center">
                                <CardTitle className="flex items-center">
                                    <CalendarIcon className="h-5 w-5 mr-2 text-blue-500" />
                                    {selectedDate && formatDate(selectedDate, 'PPPP')}
                                </CardTitle>
                                <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                    {tasksForSelectedDate.length} Tasks
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4">
                            {tasksForSelectedDate.length > 0 ? (
                                <div className="space-y-4">
                                    {tasksForSelectedDate.map((task, index) => {
                                        const typeInfo = getTypeInfo(task.type);

                                        return (
                                            <div
                                                key={task.id}
                                                className={cn(
                                                    "p-3 sm:p-4 rounded-lg transition-colors border",
                                                    task.status === 'active'
                                                        ? "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                                                        : "bg-slate-100/50 dark:bg-slate-800/20 border-slate-200/70 dark:border-slate-700/50"
                                                )}
                                            >
                                                <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                                                    {/* Time column - stacks vertically on mobile */}
                                                    <div className="flex sm:flex-col items-center sm:items-center gap-2 sm:gap-0 sm:w-20 sm:text-center flex-shrink-0">
                                                        <div className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                                                            {task.nextExecution && formatDate(task.nextExecution, 'p')}
                                                        </div>
                                                        <div className="text-xs text-slate-500 dark:text-slate-400 sm:mt-1">
                                                            {task.schedule.type === 'daily' && 'Daily'}
                                                            {task.schedule.type === 'weekly' && `Weekly`}
                                                            {task.schedule.type === 'biweekly' && `Bi-weekly`}
                                                            {task.schedule.type === 'monthly' && `Monthly`}
                                                        </div>
                                                    </div>

                                                    {/* Task info column - takes remaining space */}
                                                    <div className="flex-grow">
                                                        <div className="flex items-center gap-2">
                                                            <Avatar className="h-8 w-8 flex-shrink-0">
                                                                <AvatarImage src={task.icon} alt={task.name} />
                                                                <AvatarFallback className={`${typeInfo.bgColor} ${typeInfo.textColor}`}>
                                                                    {task.name.substring(0, 2).toUpperCase()}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div className="min-w-0"> {/* Prevent overflow */}
                                                                <h4 className="font-medium text-slate-900 dark:text-white truncate">{task.name}</h4>
                                                                <div className="flex flex-wrap items-center gap-2 text-sm">
                                                                    <Badge className={`${typeInfo.bgColor} ${typeInfo.textColor} font-medium text-xs py-0 h-5`}>
                                                                        {typeInfo.name}
                                                                    </Badge>
                                                                    {getStatusBadge(task.status)}
                                                                </div>
                                                            </div>

                                                            {/* Action buttons - position to right */}
                                                            <div className="ml-auto sm:hidden">
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
                                                                        ) : null}
                                                                        <DropdownMenuItem onClick={() => setOpenTaskModal(true)}>
                                                                            <Check className="h-4 w-4 mr-2" />
                                                                            Edit Schedule
                                                                        </DropdownMenuItem>
                                                                    </DropdownMenuContent>
                                                                </DropdownMenu>
                                                            </div>
                                                        </div>
                                                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 line-clamp-2 sm:line-clamp-none">
                                                            {task.description}
                                                        </p>
                                                    </div>

                                                    {/* Action buttons for desktop - hidden on mobile */}
                                                    <div className="hidden sm:block flex-shrink-0">
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
                                                                ) : null}
                                                                <DropdownMenuItem onClick={() => setOpenTaskModal(true)}>
                                                                    <Check className="h-4 w-4 mr-2" />
                                                                    Edit Schedule
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-6 sm:py-10 text-center border border-dashed border-slate-300 dark:border-slate-700 rounded-lg px-4">
                                    <Clock className="h-8 w-8 sm:h-10 sm:w-10 text-slate-300 dark:text-slate-700 mb-2" />
                                    <h3 className="text-base sm:text-lg font-medium text-slate-900 dark:text-slate-100 mb-1">No tasks scheduled</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-4">
                                        There are no tasks scheduled for {selectedDate && formatDate(selectedDate, 'PPP')}.
                                    </p>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setOpenTaskModal(true)}
                                    >
                                        Schedule a Task
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                        {tasksForSelectedDate.length > 0 && (
                            <CardFooter className="flex justify-center border-t border-slate-200 dark:border-slate-800 pt-4">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setOpenTaskModal(true)}
                                >
                                    Add Task for This Day
                                </Button>
                            </CardFooter>
                        )}
                    </Card>
                </motion.div>

                {/* Right side: All Scheduled Tasks */}
                <motion.div variants={itemVariants} className="lg:col-span-5">
                    <Card className="dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg h-full">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-center">
                                <CardTitle>All Scheduled Tasks</CardTitle>
                                <Badge>
                                    {scheduledTasks.length} Total
                                </Badge>
                            </div>
                        </CardHeader>

                        <div className="px-6 pb-0 pt-2">
                            {/* Filter Tabs */}
                            <Tabs defaultValue="all" onValueChange={setFilterStatus} className="w-full">
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="all">
                                        All Tasks
                                        <Badge className="ml-2 bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                                            {scheduledTasks.length}
                                        </Badge>
                                    </TabsTrigger>
                                    <TabsTrigger value="active">
                                        Active Only
                                        <Badge className="ml-2 bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-300">
                                            {scheduledTasks.filter(t => t.status === 'active').length}
                                        </Badge>
                                    </TabsTrigger>
                                </TabsList>
                            </Tabs>

                            {/* Additional Filters */}
                            <div className="flex flex-wrap gap-2 mt-4">
                                <div className='flex-1'>
                                    <Select value={filterType} onValueChange={setFilterType} >
                                        <SelectTrigger >
                                            <SelectValue placeholder="Task Type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Types</SelectItem>
                                            <SelectItem value="dao-vote">DAO Voting</SelectItem>
                                            <SelectItem value="swap">Token Swap</SelectItem>
                                            <SelectItem value="yield">Yield Actions</SelectItem>
                                            <SelectItem value="claim">Claims</SelectItem>
                                            <SelectItem value="nft">NFT Actions</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex-1">
                                    <Select value={filterSchedule} onValueChange={setFilterSchedule} >
                                        <SelectTrigger >
                                            <SelectValue placeholder="Schedule" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Schedules</SelectItem>
                                            <SelectItem value="daily">Daily</SelectItem>
                                            <SelectItem value="weekly">Weekly</SelectItem>
                                            <SelectItem value="biweekly">Bi-weekly</SelectItem>
                                            <SelectItem value="monthly">Monthly</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                            </div>
                        </div>

                        <CardContent className="pt-4 overflow-auto" style={{ maxHeight: 'calc(100vh - 0px)' }}>
                            {/* Task List */}
                            <div className="space-y-3 mt-2">
                                {filteredTasks.length > 0 ? (
                                    filteredTasks.map(task => {
                                        const typeInfo = getTypeInfo(task.type);

                                        return (
                                            <div
                                                key={task.id}
                                                className={cn(
                                                    "p-3 border rounded-lg transition-colors",
                                                    task.status === 'active'
                                                        ? "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                                        : "border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30"
                                                )}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <Avatar className="h-10 w-10 mt-1">
                                                        <AvatarImage src={task.icon} alt={task.name} />
                                                        <AvatarFallback className={`${typeInfo.bgColor} ${typeInfo.textColor}`}>
                                                            {task.name.substring(0, 2).toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>

                                                    <div className="flex-grow min-w-0">
                                                        <div className="flex items-start justify-between">
                                                            <div>
                                                                <h4 className="font-medium text-slate-900 dark:text-white truncate">{task.name}</h4>
                                                                <div className="flex flex-wrap items-center gap-2 mt-1">
                                                                    <Badge className={`${typeInfo.bgColor} ${typeInfo.textColor} font-medium text-xs py-0 h-5`}>
                                                                        {typeInfo.name}
                                                                    </Badge>
                                                                    {getStatusBadge(task.status)}
                                                                </div>
                                                            </div>
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
                                                                    ) : null}
                                                                    <DropdownMenuItem onClick={() => setOpenTaskModal(true)}>
                                                                        <Check className="h-4 w-4 mr-2" />
                                                                        Edit Schedule
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </div>

                                                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                                                            {task.description}
                                                        </p>

                                                        <div className="mt-3 flex items-center text-xs text-slate-500 dark:text-slate-400">
                                                            <Clock className="h-3 w-3 mr-1" />
                                                            <span>
                                                                {task.schedule.type === 'daily' && 'Daily at '}
                                                                {task.schedule.type === 'weekly' && `Every ${task.schedule.day} at `}
                                                                {task.schedule.type === 'biweekly' && `Every other ${task.schedule.day} at `}
                                                                {task.schedule.type === 'monthly' && `${task.schedule.day}${Number(task.schedule.day) === 1 ? 'st' : Number(task.schedule.day) === 2 ? 'nd' : Number(task.schedule.day) === 3 ? 'rd' : 'th'} of each month at `}
                                                                {task.schedule.time}
                                                            </span>
                                                        </div>

                                                        {task.nextExecution && task.status === 'active' && (
                                                            <div className="mt-1 text-xs">
                                                                <span className="font-medium text-blue-600 dark:text-blue-400">
                                                                    Next: {formatDate(task.nextExecution, 'PPP')} at {formatDate(task.nextExecution, 'p')}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-slate-300 dark:border-slate-700 rounded-lg">
                                        <AlertCircle className="h-10 w-10 text-slate-300 dark:text-slate-700 mb-2" />
                                        <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-1">No tasks found</h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-4">
                                            No tasks match your current filters.
                                        </p>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setFilterType('all');
                                                setFilterSchedule('all');
                                                setFilterStatus('all');
                                            }}
                                        >
                                            Reset Filters
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardContent>

                        <CardFooter className="flex justify-center border-t border-slate-200 dark:border-slate-800 pt-4">
                            <Button onClick={() => setOpenTaskModal(true)} className='h-9 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white'>
                                Create New Task
                            </Button>
                        </CardFooter>
                    </Card>
                </motion.div>
            </div>

            {/* Create Task Modal */}
            <CreateTaskModal
                open={openTaskModal}
                onOpenChange={setOpenTaskModal}
            />
        </motion.div>
    );
};

export default SchedulePage;