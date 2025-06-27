"use client";

import React from "react";
import { motion } from "framer-motion";
import {
    Vote,
    ArrowLeftRight,
    BellRing,
    Gem,
    Zap,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    ExternalLink,
    Filter,
    ChevronRight,
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
    CardTitle
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { formatDistanceToNow } from "date-fns";
import { ActivityStatus, ActivityType, RecentActivityListProps } from "./data/dashboardTypes";




// Get icon for activity type
const getActivityIcon = (type: ActivityType, status: ActivityStatus) => {
    if (status === "error") {
        return <XCircle className="h-5 w-5 text-red-500" />;
    }
    if (status === "warning") {
        return <AlertCircle className="h-5 w-5 text-amber-500" />;
    }
    if (status === "pending") {
        return <Clock className="h-5 w-5 text-indigo-500" />;
    }

    switch (type) {
        case "vote":
            return <Vote className="h-5 w-5 text-blue-500" />;
        case "move":
            return <ArrowLeftRight className="h-5 w-5 text-green-500" />;
        case "swap":
            return <ArrowLeftRight className="h-5 w-5 text-indigo-500" />;
        case "claim":
            return <BellRing className="h-5 w-5 text-orange-500" />;
        case "purchase":
            return <Gem className="h-5 w-5 text-purple-500" />;
        case "check":
            return <CheckCircle2 className="h-5 w-5 text-green-500" />;
        case "gas":
            return <Zap className="h-5 w-5 text-yellow-500" />;
        default:
            return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    }
};

// Get color for activity type
const getActivityColors = (type: ActivityType, status: ActivityStatus) => {
    if (status === "error") {
        return {
            bg: "bg-red-100 dark:bg-red-900/30",
            color: "text-red-600 dark:text-red-400",
        };
    }
    if (status === "warning") {
        return {
            bg: "bg-amber-100 dark:bg-amber-900/30",
            color: "text-amber-600 dark:text-amber-400",
        };
    }
    if (status === "pending") {
        return {
            bg: "bg-indigo-100 dark:bg-indigo-900/30",
            color: "text-indigo-600 dark:text-indigo-400",
        };
    }

    switch (type) {
        case "vote":
            return {
                bg: "bg-blue-100 dark:bg-blue-900/30",
                color: "text-blue-600 dark:text-blue-400",
            };
        case "move":
            return {
                bg: "bg-green-100 dark:bg-green-900/30",
                color: "text-green-600 dark:text-green-400",
            };
        case "swap":
            return {
                bg: "bg-indigo-100 dark:bg-indigo-900/30",
                color: "text-indigo-600 dark:text-indigo-400",
            };
        case "claim":
            return {
                bg: "bg-orange-100 dark:bg-orange-900/30",
                color: "text-orange-600 dark:text-orange-400",
            };
        case "purchase":
            return {
                bg: "bg-purple-100 dark:bg-purple-900/30",
                color: "text-purple-600 dark:text-purple-400",
            };
        case "gas":
            return {
                bg: "bg-yellow-100 dark:bg-yellow-900/30",
                color: "text-yellow-600 dark:text-yellow-400",
            };
        default:
            return {
                bg: "bg-slate-100 dark:bg-slate-800",
                color: "text-slate-600 dark:text-slate-400",
            };
    }
};

// Get status badge
const getStatusBadge = (status: ActivityStatus) => {
    switch (status) {
        case "success":
            return (
                <Badge variant="outline" className="text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900/30">
                    Success
                </Badge>
            );
        case "pending":
            return (
                <Badge variant="outline" className="text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/10 border-indigo-200 dark:border-indigo-900/30">
                    Pending
                </Badge>
            );
        case "warning":
            return (
                <Badge variant="outline" className="text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-900/30">
                    Warning
                </Badge>
            );
        case "error":
            return (
                <Badge variant="outline" className="text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30">
                    Failed
                </Badge>
            );
        default:
            return null;
    }
};

const RecentActivityList: React.FC<RecentActivityListProps> = ({
    activities,
    limit = 5,
    showTaskInfo = true,
    showFilters = false,
    className,
    emptyMessage = "No recent activities",
    onViewAll,
}) => {
    // Limit activities to display
    const displayedActivities = activities.slice(0, limit);

    // Filter state
    const [filterType, setFilterType] = React.useState<string>("all");

    return (
        <Card className={className}>
            <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        Recent Activity
                    </CardTitle>

                    {showFilters && (
                        <div className="flex items-center gap-2">
                            <Select
                                value={filterType}
                                onValueChange={setFilterType}
                            >
                                <SelectTrigger className="h-8 w-[130px]">
                                    <SelectValue placeholder="Filter" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Activities</SelectItem>
                                    <SelectItem value="vote">DAO Voting</SelectItem>
                                    <SelectItem value="move">Yield Moves</SelectItem>
                                    <SelectItem value="swap">Token Swaps</SelectItem>
                                    <SelectItem value="claim">Reward Claims</SelectItem>
                                    <SelectItem value="purchase">NFT Purchases</SelectItem>
                                </SelectContent>
                            </Select>

                            <Button variant="outline" size="sm" className="h-8 gap-1">
                                <Filter className="h-3.5 w-3.5" />
                                <span>More Filters</span>
                            </Button>
                        </div>
                    )}
                </div>
                <CardDescription>
                    Recent automated actions taken on your behalf
                </CardDescription>
            </CardHeader>

            <CardContent>
                {displayedActivities.length === 0 ? (
                    <div className="py-8 text-center">
                        <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                            <CheckCircle2 className="h-6 w-6 text-slate-500 dark:text-slate-400" />
                        </div>
                        <p className="text-slate-600 dark:text-slate-400">{emptyMessage}</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Activity Timeline */}
                        <div className="ml-2">
                            {displayedActivities.map((activity, index) => {
                                const colors = getActivityColors(activity.type, activity.status);
                                const isLast = index === displayedActivities.length - 1;

                                return (
                                    <motion.div
                                        key={activity.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: index * 0.05 }}
                                        className={cn(
                                            "flex gap-3 relative pt-2",
                                            !isLast && "pb-5"
                                        )}
                                    >
                                        {!isLast && (
                                            <div className="absolute top-0 left-[11px] h-full w-px bg-slate-200 dark:bg-slate-700"></div>
                                        )}
                                        <div className={cn(
                                            "h-6 w-6 rounded-full flex items-center justify-center z-10 flex-shrink-0 mt-2 border-2 border-white dark:border-slate-900",
                                            colors.bg
                                        )}>
                                            <div className={colors.color}>
                                                {getActivityIcon(activity.type, activity.status)}
                                            </div>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                                {activity.title}
                                            </p>
                                            {getStatusBadge(activity.status)}
                                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                                                {activity.description}
                                            </p>
                                            <div className="flex flex-wrap items-center mt-1 gap-2">
                                                {showTaskInfo && activity.taskName && (
                                                    <Badge variant="secondary" className="text-[10px] h-4 px-1">
                                                        {activity.taskName}
                                                    </Badge>
                                                )}

                                                {activity.network && (
                                                    <Badge variant="outline" className="text-[10px] h-4 px-1 border-slate-200 dark:border-slate-700">
                                                        {activity.network}
                                                    </Badge>
                                                )}

                                                <span className="text-xs text-slate-500 dark:text-slate-500">
                                                    {formatDistanceToNow(activity.timestamp)} ago
                                                </span>

                                                {activity.txHash && (
                                                    <Button variant="link" size="sm" className="h-4 p-0 text-xs text-blue-600 dark:text-blue-400" asChild>
                                                        <a
                                                            href={`https://etherscan.io/tx/${activity.txHash}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-1"
                                                        >
                                                            <ExternalLink className="h-3 w-3" />
                                                            View Transaction
                                                        </a>
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </CardContent>

            {onViewAll && displayedActivities.length > 0 && (
                <CardFooter className="pt-0">
                    <Button
                        variant="ghost"
                        className="w-full justify-center text-blue-600 dark:text-blue-400"
                        onClick={onViewAll}
                    >
                        <span>View All Activity</span>
                        <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                </CardFooter>
            )}
        </Card>
    );
};

export default RecentActivityList;