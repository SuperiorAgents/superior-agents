import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BadgeCheck, Check, ChevronLeft, Shield } from "lucide-react";


// Task types
interface TaskType {
    id: string;
    name: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    bgColor: string;
    popular?: boolean;
}

interface TaskReviewProps {
    taskType: TaskType | null;
    onBack: () => void;
    onComplete: () => void;
}

export const TaskReview: React.FC<TaskReviewProps> = ({
    taskType,
    onBack,
    onComplete,
}) => {
    // We'll use different mock data based on the task type
    const getMockTaskDetails = () => {
        switch (taskType?.id) {
            case 'dao-voting':
                return {
                    dao: "Nouns DAO",
                    rule: "Vote YES if proposal mentions rewards or incentives",
                    gas: "Max 50 gwei",
                    notifications: "Email, In-app",
                    duration: "Until manually disabled",
                };
            case 'yield-optimizer':
                return {
                    asset: "USDC",
                    platforms: "Aave, Compound, Yearn",
                    threshold: "0.5% APY difference",
                    amount: "2,450 USDC",
                    autoCompound: "Enabled",
                };
            case 'token-swap':
                return {
                    from: "ETH",
                    to: "USDC",
                    condition: "When ETH increases by 5%",
                    exchange: "Uniswap",
                    amount: "1.25 ETH",
                };
            case 'rewards-claim':
                return {
                    protocols: "Aave, Compound, Curve",
                    schedule: "Weekly (Monday)",
                    reinvest: "Yes, to Aave",
                    notifications: "Email, In-app",
                    gas: "Max 50 gwei",
                };
            case 'nft-purchase':
                return {
                    collection: "Bored Ape Yacht Club",
                    strategy: "When floor price drops 10%",
                    budget: "50 ETH",
                    marketplace: "OpenSea",
                    autoRelist: "No",
                };
            case 'gas-optimizer':
                return {
                    transaction: "Token Transfer",
                    target: "0x1234...abcd",
                    threshold: "Max 30 gwei",
                    execution: "When gas price drops below threshold",
                    notifications: "Email, In-app",
                };
            default:
                return {
                    dao: "Nouns DAO",
                    rule: "Vote YES if proposal mentions rewards or incentives",
                    gas: "Max 50 gwei",
                    notifications: "Email, In-app",
                    duration: "Until manually disabled",
                };
        }
    };

    const taskDetails = getMockTaskDetails();

    // Get fields based on task type
    const getTaskFields = () => {
        switch (taskType?.id) {
            case 'dao-voting':
                return [
                    { label: "DAO", value: taskDetails.dao },
                    { label: "Voting Rule", value: taskDetails.rule },
                    { label: "Gas Limit", value: taskDetails.gas },
                    { label: "Notifications", value: taskDetails.notifications },
                    { label: "Duration", value: taskDetails.duration },
                ];
            case 'yield-optimizer':
                return [
                    { label: "Asset", value: taskDetails.asset },
                    { label: "Target Platforms", value: taskDetails.platforms },
                    { label: "Move Threshold", value: taskDetails.threshold },
                    { label: "Amount", value: taskDetails.amount },
                    { label: "Auto-compound", value: taskDetails.autoCompound },
                ];
            case 'token-swap':
                return [
                    { label: "From Token", value: taskDetails.from },
                    { label: "To Token", value: taskDetails.to },
                    { label: "Condition", value: taskDetails.condition },
                    { label: "Exchange", value: taskDetails.exchange },
                    { label: "Amount", value: taskDetails.amount },
                ];
            case 'rewards-claim':
                return [
                    { label: "Protocols", value: taskDetails.protocols },
                    { label: "Claim Schedule", value: taskDetails.schedule },
                    { label: "Auto-reinvest", value: taskDetails.reinvest },
                    { label: "Notifications", value: taskDetails.notifications },
                    { label: "Gas Limit", value: taskDetails.gas },
                ];
            case 'nft-purchase':
                return [
                    { label: "Collection", value: taskDetails.collection },
                    { label: "Strategy", value: taskDetails.strategy },
                    { label: "Budget", value: taskDetails.budget },
                    { label: "Marketplace", value: taskDetails.marketplace },
                    { label: "Auto-relist", value: taskDetails.autoRelist },
                ];
            case 'gas-optimizer':
                return [
                    { label: "Transaction Type", value: taskDetails.transaction },
                    { label: "Target Address", value: taskDetails.target },
                    { label: "Gas Threshold", value: taskDetails.threshold },
                    { label: "Execution Strategy", value: taskDetails.execution },
                    { label: "Notifications", value: taskDetails.notifications },
                ];
            default:
                return [
                    { label: "DAO", value: taskDetails.dao },
                    { label: "Voting Rule", value: taskDetails.rule },
                    { label: "Gas Limit", value: taskDetails.gas },
                    { label: "Notifications", value: taskDetails.notifications },
                    { label: "Duration", value: taskDetails.duration },
                ];
        }
    };

    const taskFields = getTaskFields();

    return (
        <div className="space-y-6 p-6 rounded-xl dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg">
            <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">
                    Review Task
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    Confirm the details of your automated task
                </p>

                <Card className="mb-6">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                            {taskType?.icon}
                            <span>{taskType?.name}</span>
                        </CardTitle>
                        <CardDescription>
                            Task Configuration Summary
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            {taskFields.map((field, index) => (
                                <div key={index} className="flex justify-between">
                                    <span className="text-sm text-slate-500 dark:text-slate-400">{field.label}</span>
                                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100 text-right max-w-[50%]">
                                        {field.value}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Permission Request - show different messages based on task type */}
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 border border-amber-200 dark:border-amber-800/50 mb-6">
                    <h4 className="font-medium text-amber-800 dark:text-amber-300 mb-2 flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Permission Request
                    </h4>
                    <p className="text-sm text-amber-700 dark:text-amber-400 mb-3">
                        {taskType?.id === 'dao-voting' && 'MetaPilot requires permission to vote on your behalf in DAO governance. This uses session keys with limited scope.'}
                        {taskType?.id === 'yield-optimizer' && 'MetaPilot requires permission to move your assets between yield platforms. This uses session keys with limited scope.'}
                        {taskType?.id === 'token-swap' && 'MetaPilot requires permission to execute token swaps on your behalf. This uses session keys with limited scope.'}
                        {taskType?.id === 'rewards-claim' && 'MetaPilot requires permission to claim rewards from protocols. This uses session keys with limited scope.'}
                        {taskType?.id === 'nft-purchase' && 'MetaPilot requires permission to purchase NFTs on your behalf. This uses session keys with limited scope.'}
                        {taskType?.id === 'gas-optimizer' && 'MetaPilot requires permission to schedule transactions. This uses session keys with limited scope.'}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-400">
                        <BadgeCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <span>Only specific privileges are granted, no full wallet access</span>
                    </div>
                </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-4 border-t gap-3 border-slate-200 dark:border-slate-800">
                <Button variant="outline" onClick={onBack}>
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back to Edit
                </Button>
                <div className="space-x-2 flex gap-3 flex-wrap">
                    <Button variant="outline">
                        Save as Template
                    </Button>
                    <Button
                        onClick={onComplete}
                        className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    >
                        Create Task
                        <Check className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
};