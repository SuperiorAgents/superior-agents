// Task types and statuses
export type TaskType =
    | "dao-voting"
    | "yield-optimizer"
    | "token-swap"
    | "reward-claim"
    | "nft-purchase"
    | "gas-optimizer"
    | "portfolio-rebalance"
    | "liquidation-protection"
    | "dollar-cost-average"
    | "limit-order";

export type TaskStatus = "active" | "pending" | "paused" | "completed" | "failed";
export type TaskNetwork = "Ethereum" | "Polygon" | "Arbitrum" | "Optimism" | "Base" | "Solana" | "Avalanche";

// Task data interface
export interface TaskData {
    id: string;
    type: TaskType;
    name: string;
    description: string;
    status: TaskStatus;
    createdAt: Date;
    lastRun?: Date;
    nextRun?: Date | string;
    actionsCount?: number;
    progressPercent?: number;
    progressLabel?: string;
    targetChain?: TaskNetwork;
    isHighPriority?: boolean;
    isPaused?: boolean;
    successRate?: number;
    gasSaved?: number;
    errorMessage?: string;
}

export interface TaskSummaryCardProps {
    task: TaskData;
    onStatusChange?: (id: string, status: TaskStatus) => void;
    onEdit?: (id: string) => void;
    onDelete?: (id: string) => void;
    onViewDetails?: (id: string) => void;
    className?: string;
    compact?: boolean;
}



// Announcement types
export type AnnouncementType =
    | "feature"
    | "security"
    | "performance"
    | "alert"
    | "update"
    | "promotion";

export type AnnouncementPriority = "low" | "medium" | "high";

// Announcement interface
export interface Announcement {
    id: string;
    title: string;
    content: string;
    type: AnnouncementType;
    priority: AnnouncementPriority;
    date: Date;
    link?: {
        url: string;
        text: string;
        external?: boolean;
    };
    read?: boolean;
}




// Activity types and statuses
export type ActivityType =
    | "vote"
    | "move"
    | "swap"
    | "claim"
    | "purchase"
    | "check"
    | "gas"
    | "error";

export type ActivityStatus = "success" | "pending" | "error" | "warning";

// Activity data interface
export interface ActivityItem {
    id: string;
    type: ActivityType;
    status: ActivityStatus;
    title: string;
    description: string;
    timestamp: Date;
    taskId?: string;
    taskName?: string;
    taskType?: string;
    txHash?: string;
    network?: string;
}

// Props interface
export interface RecentActivityListProps {
    activities: ActivityItem[];
    limit?: number;
    showTaskInfo?: boolean;
    showFilters?: boolean;
    className?: string;
    emptyMessage?: string;
    onViewAll?: () => void;
}

