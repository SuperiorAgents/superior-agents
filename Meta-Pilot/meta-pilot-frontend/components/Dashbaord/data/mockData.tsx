import { CheckCircle2, Clock, XCircle, Zap } from "lucide-react";
import { ActivityItem, Announcement, TaskData } from "./dashboardTypes";

export const taskStatistics = [
  { id: 'active', name: 'Active Tasks', value: 12, icon: <Zap className="h-5 w-5" />, color: 'text-blue-600 dark:text-blue-400' },
  { id: 'completed', name: 'Completed', value: 87, icon: <CheckCircle2 className="h-5 w-5" />, color: 'text-green-600 dark:text-green-400' },
  { id: 'pending', name: 'Pending', value: 4, icon: <Clock className="h-5 w-5" />, color: 'text-orange-600 dark:text-orange-400' },
  { id: 'failed', name: 'Failed', value: 2, icon: <XCircle className="h-5 w-5" />, color: 'text-red-600 dark:text-red-400' },
];

// Sample task data
export const sampleTasks: TaskData[] = [
  {
    id: "task-1",
    type: "dao-voting",
    name: "Vote on Nouns DAO Proposals",
    description: "Automatically vote YES if proposal mentions community rewards",
    status: "active",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
    lastRun: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    nextRun: "~8 hours",
    actionsCount: 15,
    progressPercent: 75,
    progressLabel: "Vote Completion",
    targetChain: "Ethereum",
    isHighPriority: false,
    successRate: 98
  },
  {
    id: "task-2",
    type: "token-swap",
    name: "ETH to USDC when price increases",
    description: "Swap 2 ETH when price increases by 5% from current price",
    status: "active",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72), // 3 days ago
    lastRun: undefined,
    nextRun: "When condition is met",
    actionsCount: 0,
    progressPercent: 30,
    progressLabel: "ETH Price Tracking",
    targetChain: "Ethereum",
    isHighPriority: true
  },
  {
    id: "task-3",
    type: "reward-claim",
    name: "Claim Aave Rewards Weekly",
    description: "Automatically claim AAVE rewards every Monday at 9 AM",
    status: "active",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 120), // 5 days ago
    lastRun: new Date(Date.now() - 1000 * 60 * 60 * 96), // 4 days ago
    nextRun: "3 days",
    actionsCount: 4,
    targetChain: "Polygon",
    gasSaved: 0.05,
    successRate: 100
  },
  {
    id: "task-4",
    type: "yield-optimizer",
    name: "Stablecoin Yield Optimization",
    description: "Move USDC to highest yielding protocol when APY changes by 1%",
    status: "pending",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
    progressPercent: 40,
    progressLabel: "Analyzing Yields",
    targetChain: "Arbitrum"
  },
  {
    id: "task-5",
    type: "liquidation-protection",
    name: "Aave Liquidation Protection",
    description: "Add collateral if health factor drops below 1.5",
    status: "active",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 120), // 5 days ago
    lastRun: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    nextRun: "Monitoring 24/7",
    targetChain: "Ethereum"
  }
];

// Sample announcement data
export const sampleAnnouncement: Announcement = {
  id: "announcement-1",
  title: "New MetaPilot Version Released",
  content: "We've released a new version with enhanced DAO voting features and gas optimizations.",
  type: "feature",
  priority: "high",
  date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
  link: {
    url: "/announcements/v2-1-release",
    text: "Learn More",
  }
};

// Sample activity data
export const sampleActivities: ActivityItem[] = [
  {
    id: "activity-1",
    type: "vote",
    status: "success",
    title: "Voted YES on Nouns DAO Proposal #156",
    description: "Proposal matched rule: 'Contains rewards'",
    timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
    taskId: "task-1",
    taskName: "Nouns DAO Auto-Voting",
    taskType: "dao-voting",
    txHash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    network: "Ethereum",
  },
  {
    id: "activity-2",
    type: "move",
    status: "success",
    title: "Moved 5,000 USDC to Compound",
    description: "APY difference: 0.75% (Aave: 3.2%, Compound: 3.95%)",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    taskId: "task-4",
    taskName: "USDC Yield Optimizer",
    taskType: "yield-optimizer",
    txHash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
    network: "Ethereum",
  },
  {
    id: "activity-3",
    type: "claim",
    status: "pending",
    title: "Claiming 7.2 COMP rewards",
    description: "Waiting for transaction confirmation",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
    taskId: "task-3",
    taskName: "Compound Rewards Claimer",
    taskType: "rewards-claim",
    network: "Ethereum",
  },
  {
    id: "activity-4",
    type: "gas",
    status: "warning",
    title: "Skipped ETH Purchase",
    description: "Gas prices were too high (85 gwei, threshold: 50 gwei)",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    taskId: "task-2",
    taskName: "ETH Dollar-Cost Averaging",
    taskType: "token-swap",
    network: "Ethereum",
  }
];
