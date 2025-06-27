"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Plus,
    ChevronRight,
    RefreshCw,
    Filter,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import TokenBalances from '@/components/Dashbaord/TokenBalances';
import GasTracker from '@/components/Dashbaord/GasTracker';
import RecentActivityList from '@/components/Dashbaord/RecentActivityList';
import AnalyticsDashboard from '@/components/Dashbaord/AnalyticsDashboard';
import CreateTaskModal from '@/components/Dashbaord/Tasks/CreateTaskModal';
import LatestAnnouncements from '@/components/Dashbaord/LatestAnnouncements';
import TaskSummaryCard from '@/components/Dashbaord/Tasks/TaskSummaryCard';
import { ActivityItem, ActivityStatus, ActivityType, TaskData, TaskStatus } from '@/components/Dashbaord/data/dashboardTypes';
import { sampleActivities, sampleAnnouncement, sampleTasks, taskStatistics } from '@/components/Dashbaord/data/mockData';


const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
        },
    },
};

// Animation variants
export const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};


const DashboardPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [tasks, setTasks] = useState<TaskData[]>(sampleTasks);
    const [activities, setActivities] = useState<ActivityItem[]>(sampleActivities);
    const { toast } = useToast();

    // Handle refresh data
    const handleRefreshData = () => {
        setIsRefreshing(true);

        // Simulate data fetching
        setTimeout(() => {
            setIsRefreshing(false);
            toast({
                title: "Dashboard refreshed",
                description: "Your dashboard data has been updated.",
                variant: "default",
            });
        }, 1500);
    };

    // Handle task status change
    const handleTaskStatusChange = (id: string, status: TaskStatus) => {
        setTasks(prevTasks =>
            prevTasks.map(task =>
                task.id === id ? { ...task, status } : task
            )
        );

        // Add a new activity for this status change
        const taskToUpdate = tasks.find(task => task.id === id);
        if (taskToUpdate) {
            const newActivity: ActivityItem = {
                id: `activity-${Date.now()}`,
                type: "check" as ActivityType,
                status: "success" as ActivityStatus,
                title: `${status === "paused" ? "Paused" : "Activated"} task: ${taskToUpdate.name}`,
                description: `Task has been ${status === "paused" ? "paused" : "activated"} successfully`,
                timestamp: new Date(),
                taskId: id,
                taskName: taskToUpdate.name,
                taskType: taskToUpdate.type,
                network: taskToUpdate.targetChain
            };

            setActivities(prev => [newActivity, ...prev]);
        }

        toast({
            title: `Task ${status === "paused" ? "paused" : "activated"}`,
            description: `The task has been ${status === "paused" ? "paused" : "activated"} successfully.`,
            variant: "default",
        });
    };

    // Handle task edit
    const handleTaskEdit = (id: string) => {
        // Would typically open edit modal
        console.log(`Editing task ${id}`);
        toast({
            title: "Edit task",
            description: "Task edit functionality coming soon.",
            variant: "default",
        });
    };

    // Handle task deletion
    const handleTaskDelete = (id: string) => {
        setTasks(prevTasks => prevTasks.filter(task => task.id !== id));

        // Add activity for deletion
        const taskToDelete = tasks.find(task => task.id === id);
        if (taskToDelete) {
            const newActivity: ActivityItem = {
                id: `activity-${Date.now()}`,
                type: "error" as ActivityType,
                status: "warning" as ActivityStatus,
                title: `Deleted task: ${taskToDelete.name}`,
                description: `Task has been permanently deleted`,
                timestamp: new Date(),
                taskId: id,
                taskName: taskToDelete.name,
                taskType: taskToDelete.type,
                network: taskToDelete.targetChain
            };

            setActivities(prev => [newActivity, ...prev]);
        }

        toast({
            title: "Task deleted",
            description: "The task has been deleted successfully.",
            variant: "default",
        });
    };

    // Handle view task details
    const handleViewTaskDetails = (id: string) => {
        console.log(`Viewing task ${id} details`);
        // Would typically navigate to task details page
    };

    // Handle create new task
    const handleCreateTask = (newTask: Partial<TaskData>) => {
        const createdTask: TaskData = {
            id: `task-${Date.now()}`,
            type: newTask.type || "dao-voting",
            name: newTask.name || "New Task",
            description: newTask.description || "Task description",
            status: "pending",
            createdAt: new Date(),
            isHighPriority: newTask.isHighPriority || false,
            targetChain: newTask.targetChain || "Ethereum"
        };

        setTasks(prev => [createdTask, ...prev]);

        // Add activity for task creation
        const newActivity: ActivityItem = {
            id: `activity-${Date.now()}`,
            type: "check" as ActivityType,
            status: "success" as ActivityStatus,
            title: `Created new task: ${createdTask.name}`,
            description: `New ${createdTask.type} task has been created`,
            timestamp: new Date(),
            taskId: createdTask.id,
            taskName: createdTask.name,
            taskType: createdTask.type,
            network: createdTask.targetChain
        };

        setActivities(prev => [newActivity, ...prev]);

        toast({
            title: "Task created",
            description: "Your new task has been created successfully.",
            variant: "default",
        });
    };

    return (
        <>
            <div className="flex flex-col">
                {/* Dashboard Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                            Dashboard
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400 mt-1">
                            Welcome back! Here's what's happening with your tasks.
                        </p>
                    </div>
                    <div className="flex items-center space-x-2 mt-4 sm:mt-0">
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-9 px-3 text-slate-700 dark:text-slate-300 dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg"
                            onClick={handleRefreshData}
                            disabled={isRefreshing}
                        >
                            <RefreshCw className={cn(
                                "h-4 w-4 mr-2 ",
                                isRefreshing && "animate-spin"
                            )} />
                            Refresh
                        </Button>
                        <Button
                            className="h-9 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                            onClick={() => setIsCreateTaskModalOpen(true)}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            New Task
                        </Button>
                    </div>
                </div>

                {/* Tabs for Dashboard Sections */}
                <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="space-y-6"
                >
                    <div className=" rounded-lg shadow-sm  p-1">
                        <TabsList className="grid grid-cols-3 h-full md:w-auto w-full bg-slate-50 dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg">
                            <TabsTrigger
                                value="overview"
                                className="px-4 py-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 dark:data-[state=active]:bg-blue-900/20 dark:data-[state=active]:text-blue-400"
                            >
                                Overview
                            </TabsTrigger>
                            <TabsTrigger
                                value="tasks"
                                className="px-4 py-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 dark:data-[state=active]:bg-blue-900/20 dark:data-[state=active]:text-blue-400"
                            >
                                Active Tasks
                            </TabsTrigger>
                            <TabsTrigger
                                value="analytics"
                                className="px-4 py-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 dark:data-[state=active]:bg-blue-900/20 dark:data-[state=active]:text-blue-400"
                            >
                                Analytics
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    {/* Overview Tab Content */}
                    <TabsContent value="overview" className="space-y-6 mt-6">
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            {/* Latest Announcement (optional) */}
                            <motion.div variants={itemVariants} className="mb-6">
                                <LatestAnnouncements
                                    announcements={[sampleAnnouncement]}
                                    className='dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg'
                                    limit={1}
                                    showReadStatus={false}
                                    onViewAll={() => console.log("View all announcements")}
                                />
                            </motion.div>

                            {/* Stats Row */}
                            <motion.div variants={itemVariants}>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                                    {taskStatistics.map((stat) => (
                                        <Card key={stat.id} className="overflow-hidden dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg">
                                            <CardContent className="p-6">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                                            {stat.name}
                                                        </p>
                                                        <h3 className="text-3xl font-bold mt-1 text-slate-900 dark:text-white">
                                                            {stat.value}
                                                        </h3>
                                                    </div>
                                                    <div className={cn(
                                                        "p-3 rounded-2xl rounded-tr-none bg-opacity-15 dark:bg-opacity-20",
                                                        stat.id === 'active' ? 'bg-blue-100 dark:bg-blue-900' : '',
                                                        stat.id === 'completed' ? 'bg-green-100 dark:bg-green-900' : '',
                                                        stat.id === 'pending' ? 'bg-orange-100 dark:bg-orange-900' : '',
                                                        stat.id === 'failed' ? 'bg-red-100 dark:bg-red-900' : ''
                                                    )}>
                                                        <span className={stat.color}>{stat.icon}</span>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Main Content */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Left Column (Token Balances and Gas Tracker) */}
                                <div className="lg:col-span-1 space-y-6">
                                    <motion.div variants={itemVariants}>
                                        <TokenBalances className='dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg' />
                                    </motion.div>
                                    <motion.div variants={itemVariants}>
                                        <GasTracker className="dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg" />
                                    </motion.div>
                                </div>

                                {/* Right Column (Tasks and Activity) */}
                                <div className="lg:col-span-2 space-y-6">
                                    {/* Task Summary Cards */}
                                    <motion.div variants={itemVariants}>
                                        <div className="flex justify-between items-center mb-4">
                                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                                                Active Tasks
                                            </h2>
                                            <Button
                                                variant="link"
                                                className="text-blue-600 dark:text-blue-400 p-0 h-auto font-medium"
                                                onClick={() => setActiveTab('tasks')}
                                            >
                                                View All
                                                <ChevronRight className="ml-1 h-4 w-4" />
                                            </Button>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {tasks
                                                .filter(task => task.status !== "completed" && task.status !== "failed")
                                                .slice(0, 4)
                                                .map(task => (
                                                    <TaskSummaryCard
                                                        key={task.id}
                                                        task={task}
                                                        onStatusChange={handleTaskStatusChange}
                                                        onEdit={handleTaskEdit}
                                                        onDelete={handleTaskDelete}
                                                        onViewDetails={handleViewTaskDetails}
                                                        compact={true}
                                                    />
                                                ))
                                            }
                                        </div>
                                    </motion.div>

                                    {/* Recent Activity */}
                                    <motion.div variants={itemVariants}>
                                        <RecentActivityList
                                            activities={activities}
                                            className="dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg"
                                            limit={4}
                                            showTaskInfo={true}
                                            onViewAll={() => console.log("View all activities")}
                                        />
                                    </motion.div>
                                </div>
                            </div>
                        </motion.div>
                    </TabsContent>

                    {/* Tasks Tab Content */}
                    <TabsContent value="tasks" className="space-y-6 mt-6">
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            <motion.div variants={itemVariants}>
                                <Card className='dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg'>
                                    <CardHeader className="pb-4">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                                            <div>
                                                <CardTitle>All Active Tasks</CardTitle>
                                                <CardDescription>
                                                    Manage all your automated tasks in one place
                                                </CardDescription>
                                            </div>
                                            <div className="flex items-center space-x-2 mt-4 sm:mt-0">
                                                <Button variant="outline" size="sm" className='dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg'>
                                                    <Filter className="h-4 w-4 mr-2" />
                                                    Filter
                                                </Button>
                                                <Button
                                                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                                                    size="sm"
                                                    onClick={() => setIsCreateTaskModalOpen(true)}
                                                >
                                                    <Plus className="h-4 w-4 mr-2" />
                                                    New Task
                                                </Button>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <Tabs defaultValue="all" className="mt-2">
                                            <TabsList className="mb-4 flex flex-wrap gap-3 dark:bg-slate-900/90 border-indigo-100 h-full dark:border-indigo-900/30 shadow-lg">
                                                <TabsTrigger value="all" className="px-4 py-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 dark:data-[state=active]:bg-blue-900/20 dark:data-[state=active]:text-blue-400">
                                                    All
                                                    <Badge className="ml-2 bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300 ">
                                                        {tasks.length}
                                                    </Badge>
                                                </TabsTrigger>
                                                <TabsTrigger value="dao" className="px-4 py-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 dark:data-[state=active]:bg-blue-900/20 dark:data-[state=active]:text-blue-400">
                                                    DAO Voting
                                                    <Badge className="ml-2 bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                                                        {tasks.filter(t => t.type === 'dao-voting').length}
                                                    </Badge>
                                                </TabsTrigger>
                                                <TabsTrigger value="token" className="px-4 py-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 dark:data-[state=active]:bg-blue-900/20 dark:data-[state=active]:text-blue-400">
                                                    Token Swaps
                                                    <Badge className="ml-2 bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                                                        {tasks.filter(t => t.type === 'token-swap').length}
                                                    </Badge>
                                                </TabsTrigger>
                                                <TabsTrigger value="rewards" className="px-4 py-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 dark:data-[state=active]:bg-blue-900/20 dark:data-[state=active]:text-blue-400">
                                                    Rewards
                                                    <Badge className="ml-2 bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                                                        {tasks.filter(t => t.type === 'reward-claim').length}
                                                    </Badge>
                                                </TabsTrigger>
                                                <TabsTrigger value="other" className="px-4 py-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 dark:data-[state=active]:bg-blue-900/20 dark:data-[state=active]:text-blue-400">
                                                    Others
                                                    <Badge className="ml-2 bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                                                        {tasks.filter(t => !['dao-voting', 'token-swap', 'reward-claim'].includes(t.type)).length}
                                                    </Badge>
                                                </TabsTrigger>
                                            </TabsList>

                                            <TabsContent value="all" className="space-y-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {tasks.map(task => (
                                                        <TaskSummaryCard
                                                            key={task.id}
                                                            task={task}
                                                            onStatusChange={handleTaskStatusChange}
                                                            onEdit={handleTaskEdit}
                                                            onDelete={handleTaskDelete}
                                                            onViewDetails={handleViewTaskDetails}
                                                        />
                                                    ))}
                                                </div>
                                            </TabsContent>

                                            {/* Other tab contents for filtered tasks */}
                                            <TabsContent value="dao">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {tasks
                                                        .filter(task => task.type === 'dao-voting')
                                                        .map(task => (
                                                            <TaskSummaryCard
                                                                key={task.id}
                                                                task={task}
                                                                onStatusChange={handleTaskStatusChange}
                                                                onEdit={handleTaskEdit}
                                                                onDelete={handleTaskDelete}
                                                                onViewDetails={handleViewTaskDetails}
                                                            />
                                                        ))
                                                    }
                                                </div>
                                            </TabsContent>

                                            <TabsContent value="token">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {tasks
                                                        .filter(task => task.type === 'token-swap')
                                                        .map(task => (
                                                            <TaskSummaryCard
                                                                key={task.id}
                                                                task={task}
                                                                onStatusChange={handleTaskStatusChange}
                                                                onEdit={handleTaskEdit}
                                                                onDelete={handleTaskDelete}
                                                                onViewDetails={handleViewTaskDetails}
                                                            />
                                                        ))
                                                    }
                                                </div>
                                            </TabsContent>

                                            <TabsContent value="rewards">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {tasks
                                                        .filter(task => task.type === 'reward-claim')
                                                        .map(task => (
                                                            <TaskSummaryCard
                                                                key={task.id}
                                                                task={task}
                                                                onStatusChange={handleTaskStatusChange}
                                                                onEdit={handleTaskEdit}
                                                                onDelete={handleTaskDelete}
                                                                onViewDetails={handleViewTaskDetails}
                                                            />
                                                        ))
                                                    }
                                                </div>
                                            </TabsContent>

                                            <TabsContent value="other">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {tasks
                                                        .filter(task => !['dao-voting', 'token-swap', 'reward-claim'].includes(task.type))
                                                        .map(task => (
                                                            <TaskSummaryCard
                                                                key={task.id}
                                                                task={task}
                                                                onStatusChange={handleTaskStatusChange}
                                                                onEdit={handleTaskEdit}
                                                                onDelete={handleTaskDelete}
                                                                onViewDetails={handleViewTaskDetails}
                                                            />
                                                        ))
                                                    }
                                                </div>
                                            </TabsContent>
                                        </Tabs>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </motion.div>
                    </TabsContent>

                    {/* Analytics Tab Content */}
                    <TabsContent value="analytics" className="space-y-6 mt-6">
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            <motion.div variants={itemVariants}>
                                <AnalyticsDashboard />
                            </motion.div>
                        </motion.div>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Create Task Modal */}
            <CreateTaskModal
                open={isCreateTaskModalOpen}
                onOpenChange={(open) => setIsCreateTaskModalOpen(open)}
                onTaskCreated={handleCreateTask}
            />
        </>
    );
};

export default DashboardPage;