import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

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

interface TaskCreatedSuccessProps {
    taskType: TaskType | null;
    onClose: () => void;
    onCreateAnother: () => void;
}

export const TaskCreatedSuccess: React.FC<TaskCreatedSuccessProps> = ({
    taskType,
    onClose,
    onCreateAnother,
}) => {
    // Get success details based on task type
    const getSuccessDetails = () => {
        switch (taskType?.id) {
            case 'dao-voting':
                return {
                    subtitle: "Nouns DAO",
                    description: "Vote YES if proposal mentions rewards",
                };
            case 'yield-optimizer':
                return {
                    subtitle: "USDC Optimizer",
                    description: "Move funds to highest APY platforms",
                };
            case 'token-swap':
                return {
                    subtitle: "ETH → USDC",
                    description: "When ETH increases by 5%",
                };
            case 'rewards-claim':
                return {
                    subtitle: "Multiple Protocols",
                    description: "Weekly claim and reinvest",
                };
            case 'nft-purchase':
                return {
                    subtitle: "Bored Ape Yacht Club",
                    description: "Buy when floor price drops 10%",
                };
            case 'gas-optimizer':
                return {
                    subtitle: "Token Transfer",
                    description: "Execute when gas < 30 gwei",
                };
            default:
                return {
                    subtitle: "Nouns DAO",
                    description: "Vote YES if proposal mentions rewards",
                };
        }
    };

    const successDetails = getSuccessDetails();

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="text-center px-4 rounded-lg py-4 dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg"
        >
            <div className="mx-auto w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>

            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Task Created Successfully!
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
                Your {taskType?.name} task is now active and running. You'll receive notifications when actions are taken.
            </p>

            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-800 mb-6 max-w-md mx-auto">
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "h-10 w-10 rounded-full flex items-center justify-center",
                        taskType?.bgColor
                    )}>
                        <div className={taskType?.color}>{taskType?.icon}</div>
                    </div>
                    <div className="text-left">
                        <h4 className="font-medium text-slate-900 dark:text-slate-100">
                            {taskType?.name} - {successDetails.subtitle}
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                            {successDetails.description}
                        </p>
                    </div>
                    <Badge variant="outline" className="ml-auto bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800/50">
                        Active
                    </Badge>
                </div>
            </div>

            <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={onCreateAnother}>
                    Create Another
                </Button>
                <Button onClick={onClose}>
                    View Dashboard
                </Button>
            </div>
        </motion.div>
    );
};
