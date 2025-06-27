"use client";

import React from "react";
import { motion } from "framer-motion";
import {
    Vote,
    TrendingUp,
    BellRing,
    Wallet,
    ArrowRight,
    CheckCircle2,
    Clock,
    MoreVertical,
    AlertCircle,
    Play,
    Pause,
    Trash2,
    PencilLine,
    Shield,
    Gem,
    Zap,
    ArrowLeftRight,
    BarChart3,
    CalendarDays,
    ArrowUpRight,
    CircleDollarSign,
    RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from "next/link";
import { TaskStatus, TaskSummaryCardProps, TaskType } from "../data/dashboardTypes";


const TaskSummaryCard: React.FC<TaskSummaryCardProps> = ({
    task,
    onStatusChange,
    onEdit,
    onDelete,
    onViewDetails,
    className,
    compact = false,
}) => {
    // Get icon for task type
    const getTaskIcon = (type: TaskType) => {
        switch (type) {
            case "dao-voting":
                return <Vote className="h-5 w-5" />;
            case "yield-optimizer":
                return <TrendingUp className="h-5 w-5" />;
            case "token-swap":
                return <ArrowLeftRight className="h-5 w-5" />;
            case "reward-claim":
                return <BellRing className="h-5 w-5" />;
            case "nft-purchase":
                return <Gem className="h-5 w-5" />;
            case "gas-optimizer":
                return <Zap className="h-5 w-5" />;
            case "portfolio-rebalance":
                return <BarChart3 className="h-5 w-5" />;
            case "liquidation-protection":
                return <Shield className="h-5 w-5" />;
            case "dollar-cost-average":
                return <CircleDollarSign className="h-5 w-5" />;
            case "limit-order":
                return <ArrowUpRight className="h-5 w-5" />;
            default:
                return <Wallet className="h-5 w-5" />;
        }
    };

    // Get color for task type
    const getTaskTypeColors = (type: TaskType) => {
        switch (type) {
            case "dao-voting":
                return {
                    icon: "text-blue-600 dark:text-blue-400",
                    bg: "bg-blue-100 dark:bg-blue-900/30",
                    border: "border-blue-200 dark:border-blue-800",
                };
            case "yield-optimizer":
                return {
                    icon: "text-green-600 dark:text-green-400",
                    bg: "bg-green-100 dark:bg-green-900/30",
                    border: "border-green-200 dark:border-green-800",
                };
            case "token-swap":
                return {
                    icon: "text-indigo-600 dark:text-indigo-400",
                    bg: "bg-indigo-100 dark:bg-indigo-900/30",
                    border: "border-indigo-200 dark:border-indigo-800",
                };
            case "reward-claim":
                return {
                    icon: "text-orange-600 dark:text-orange-400",
                    bg: "bg-orange-100 dark:bg-orange-900/30",
                    border: "border-orange-200 dark:border-orange-800",
                };
            case "nft-purchase":
                return {
                    icon: "text-purple-600 dark:text-purple-400",
                    bg: "bg-purple-100 dark:bg-purple-900/30",
                    border: "border-purple-200 dark:border-purple-800",
                };
            case "gas-optimizer":
                return {
                    icon: "text-yellow-600 dark:text-yellow-400",
                    bg: "bg-yellow-100 dark:bg-yellow-900/30",
                    border: "border-yellow-200 dark:border-yellow-800",
                };
            case "portfolio-rebalance":
                return {
                    icon: "text-pink-600 dark:text-pink-400",
                    bg: "bg-pink-100 dark:bg-pink-900/30",
                    border: "border-pink-200 dark:border-pink-800",
                };
            case "liquidation-protection":
                return {
                    icon: "text-red-600 dark:text-red-400",
                    bg: "bg-red-100 dark:bg-red-900/30",
                    border: "border-red-200 dark:border-red-800",
                };
            case "dollar-cost-average":
                return {
                    icon: "text-cyan-600 dark:text-cyan-400",
                    bg: "bg-cyan-100 dark:bg-cyan-900/30",
                    border: "border-cyan-200 dark:border-cyan-800",
                };
            case "limit-order":
                return {
                    icon: "text-amber-600 dark:text-amber-400",
                    bg: "bg-amber-100 dark:bg-amber-900/30",
                    border: "border-amber-200 dark:border-amber-800",
                };
            default:
                return {
                    icon: "text-slate-600 dark:text-slate-400",
                    bg: "bg-slate-100 dark:bg-slate-800",
                    border: "border-slate-200 dark:border-slate-700",
                };
        }
    };

    // Get status badge
    const getStatusBadge = (status: TaskStatus) => {
        switch (status) {
            case "active":
                return (
                    <Badge variant="outline" className="text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900/30">
                        <div className="flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 dark:bg-green-400 animate-pulse"></div>
                            Active
                        </div>
                    </Badge>
                );
            case "pending":
                return (
                    <Badge variant="outline" className="text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-900/30">
                        <div className="flex items-center gap-1">
                            <RefreshCw className="h-3 w-3 animate-spin" />
                            Pending
                        </div>
                    </Badge>
                );
            case "paused":
                return (
                    <Badge variant="outline" className="text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
                        Paused
                    </Badge>
                );
            case "completed":
                return (
                    <Badge variant="outline" className="text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-900/30">
                        <div className="flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Completed
                        </div>
                    </Badge>
                );
            case "failed":
                return (
                    <Badge variant="outline" className="text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30">
                        <div className="flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            Failed
                        </div>
                    </Badge>
                );
            default:
                return null;
        }
    };

    // Format date string
    const formatDate = (date?: Date | string) => {
        if (!date) return "N/A";
        if (typeof date === 'string') return date;

        return new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
        }).format(date);
    };

    // Handle pause/resume action
    const handlePauseResume = () => {
        if (onStatusChange) {
            onStatusChange(task.id, task.status === "paused" ? "active" : "paused");
        }
    };

    // Handle edit action
    const handleEdit = () => {
        if (onEdit) {
            onEdit(task.id);
        }
    };

    // Handle delete action
    const handleDelete = () => {
        if (onDelete) {
            onDelete(task.id);
        }
    };

    // Handle view details action
    const handleViewDetails = () => {
        if (onViewDetails) {
            onViewDetails(task.id);
        }
    };

    // Get task type colors
    const colors = getTaskTypeColors(task.type);

    // Animation variants for hover effect
    const cardVariants = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        hover: { y: -2, transition: { duration: 0.2 } },
        tap: { scale: 0.98, transition: { duration: 0.1 } }
    };

    return (
        <motion.div
            initial="initial"
            animate="animate"
            whileHover="hover"
            whileTap="tap"
            variants={cardVariants}
            transition={{ duration: 0.3 }}
            className={cn("group", className)}
        >
            <Card className={cn(
                "overflow-hidden transition-shadow duration-300 h-full dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg",
                "hover:shadow-md dark:hover:shadow-2xl dark:hover:shadow-blue-900/10",
                task.isHighPriority && "ring-1 ring-orange-300 dark:ring-orange-800"
            )}>
                {/* Priority indicator */}
                {task.isHighPriority && (
                    <div className="h-1 bg-gradient-to-r from-orange-500 to-pink-600" />
                )}

                <CardHeader className={cn(
                    "p-4 pb-2",
                    compact && "pb-0"
                )}>
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                            <div className={cn(
                                "h-9 w-9 rounded-full flex items-center justify-center transition-transform group-hover:scale-110",
                                colors.bg
                            )}>
                                <div className={colors.icon}>
                                    {getTaskIcon(task.type)}
                                </div>
                            </div>
                            <div>
                                <CardTitle className="text-base">{task.name}</CardTitle>
                                <CardDescription className="text-xs mt-0.5">
                                    {task.targetChain && (
                                        <Badge variant="secondary" className="text-[10px] h-4 mr-2 px-1">
                                            {task.targetChain}
                                        </Badge>
                                    )}
                                    {task.description}
                                </CardDescription>
                            </div>
                        </div>
                        <div className="flex flex-col items-end">
                            {getStatusBadge(task.status)}

                            {task.isHighPriority && (
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Badge variant="secondary" className="mt-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-[10px] h-4 px-1">
                                                High Priority
                                            </Badge>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>This task is set as high priority</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            )}
                        </div>
                    </div>
                </CardHeader>

                <CardContent className={cn(
                    "p-4 pt-2 pb-3",
                    compact && "pt-1 pb-2"
                )}>
                    {/* Progress bar (only for some task types) */}
                    {task.progressPercent !== undefined && !compact && (
                        <div className="mt-3">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-slate-600 dark:text-slate-400">
                                    {task.progressLabel || "Progress"}
                                </span>
                                <span className="text-xs text-slate-600 dark:text-slate-400">
                                    {task.progressPercent}%
                                </span>
                            </div>
                            <Progress value={task.progressPercent} className={cn(
                                "h-2",
                                task.status === "active" && "animate-pulse"
                            )} />
                        </div>
                    )}

                    {/* Task stats - only show if not compact mode */}
                    {!compact && (
                        <div className="flex flex-wrap items-center mt-4 text-xs text-slate-600 dark:text-slate-400 gap-3">
                            {task.actionsCount !== undefined && (
                                <div className="flex items-center gap-1.5">
                                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                                    <span>{task.actionsCount} actions taken</span>
                                </div>
                            )}

                            {task.successRate !== undefined && (
                                <div className="flex items-center gap-1.5">
                                    <CheckCircle2 className="h-3.5 w-3.5 text-blue-500" />
                                    <span>{task.successRate}% success rate</span>
                                </div>
                            )}

                            {task.gasSaved !== undefined && (
                                <div className="flex items-center gap-1.5">
                                    <Zap className="h-3.5 w-3.5 text-yellow-500" />
                                    <span>{task.gasSaved} ETH gas saved</span>
                                </div>
                            )}

                            {task.lastRun && (
                                <div className="flex items-center gap-1.5">
                                    <CalendarDays className="h-3.5 w-3.5" />
                                    <span>Last run: {formatDate(task.lastRun)}</span>
                                </div>
                            )}

                            {task.nextRun && !task.isPaused && (
                                <div className="flex items-center gap-1.5">
                                    <Clock className="h-3.5 w-3.5" />
                                    <span>Next: {formatDate(task.nextRun)}</span>
                                </div>
                            )}

                            {task.status === "failed" && task.errorMessage && (
                                <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400">
                                    <AlertCircle className="h-3.5 w-3.5" />
                                    <span>Error: {task.errorMessage}</span>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>

                <CardFooter className={cn(
                    "p-3 pt-0 flex justify-between border-t border-slate-100 dark:border-slate-800",
                    compact && "p-2"
                )}>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 h-8 transition-colors"
                        asChild
                        onClick={handleViewDetails}
                    >
                        <Link href={`/dashboard/tasks/${task.id}`} className="flex items-center gap-1">
                            View Details
                            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                        </Link>
                    </Button>

                    <div className="flex items-center gap-1">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className={cn(
                                            "h-8 w-8 transition-colors",
                                            task.status === "paused" ?
                                                "hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20" :
                                                "hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                                        )}
                                        onClick={handlePauseResume}
                                    >
                                        {task.status === "paused" ? (
                                            <Play className="h-4 w-4 text-green-600 dark:text-green-400" />
                                        ) : (
                                            <Pause className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                        )}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{task.status === "paused" ? "Resume task" : "Pause task"}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                                >
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 dark:bg-slate-900 border-indigo-100 dark:border-indigo-900/30 shadow-lg">
                                <DropdownMenuItem onClick={handleEdit} className="cursor-pointer">
                                    <PencilLine className="h-4 w-4 mr-2" />
                                    Edit Task
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handlePauseResume} className="cursor-pointer">
                                    {task.status === "paused" ? (
                                        <>
                                            <Play className="h-4 w-4 mr-2 text-green-600 dark:text-green-400" />
                                            Resume Task
                                        </>
                                    ) : (
                                        <>
                                            <Pause className="h-4 w-4 mr-2 text-amber-600 dark:text-amber-400" />
                                            Pause Task
                                        </>
                                    )}
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer">
                                    <Shield className="h-4 w-4 mr-2" />
                                    Security Settings
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={handleDelete}
                                    className="text-red-600 dark:text-red-400 cursor-pointer hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 focus:bg-red-50 dark:focus:bg-red-900/20 focus:text-red-700 dark:focus:text-red-300"
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Task
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </CardFooter>
            </Card>
        </motion.div>
    );
};

export default TaskSummaryCard;