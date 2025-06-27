"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Vote,
    TrendingUp,
    BellRing,
    ChevronRight,
    Gem,
    Zap,
    ArrowLeftRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TaskData } from "../data/dashboardTypes";
import { DAOVotingConfig } from "./DAOVotingConfig";
import { StepIndicator } from "./StepIndicator";
import { YieldOptimizerConfig } from "./YieldOptimizerConfig";
import { TokenSwapConfig } from "./TokenSwapConfig";
import { RewardsClaimConfig } from "./RewardsClaimConfig";
import { NFTPurchaseConfig } from "./NFTPurchaseConfig";
import { GasOptimizerConfig } from "./GasOptimizerConfig";
import { TaskTypeSelection } from "./TaskTypeSelection";
import { TaskReview } from "./TaskReview";
import { TaskCreatedSuccess } from "./TaskCreatedSuccess";


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


interface CreateTaskModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onTaskCreated?: (newTask: Partial<TaskData>) => void;
}

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
    open,
    onOpenChange,
    onTaskCreated
}) => {
    const [step, setStep] = useState(0);
    const [selectedTaskType, setSelectedTaskType] = useState<string | null>(null);

    // Task types data
    const taskTypes: TaskType[] = [
        {
            id: "dao-voting",
            name: "DAO Voting",
            description: "Automate governance votes based on your preferences",
            icon: <Vote className="h-6 w-6" />,
            color: "text-blue-600 dark:text-blue-400",
            bgColor: "bg-blue-100 dark:bg-blue-900/30",
            popular: true,
        },
        {
            id: "yield-optimizer",
            name: "Yield Optimizer",
            description: "Move funds to highest yielding platforms automatically",
            icon: <TrendingUp className="h-6 w-6" />,
            color: "text-green-600 dark:text-green-400",
            bgColor: "bg-green-100 dark:bg-green-900/30",
        },
        {
            id: "token-swap",
            name: "Token Swap",
            description: "Execute trades when price conditions are met",
            icon: <ArrowLeftRight className="h-6 w-6" />,
            color: "text-indigo-600 dark:text-indigo-400",
            bgColor: "bg-indigo-100 dark:bg-indigo-900/30",
        },
        {
            id: "rewards-claim",
            name: "Claim Rewards",
            description: "Automatically claim protocol rewards and airdrops",
            icon: <BellRing className="h-6 w-6" />,
            color: "text-orange-600 dark:text-orange-400",
            bgColor: "bg-orange-100 dark:bg-orange-900/30",
            popular: true,
        },
        {
            id: "nft-purchase",
            name: "NFT Purchase",
            description: "Buy NFTs based on floor price and rarity",
            icon: <Gem className="h-6 w-6" />,
            color: "text-purple-600 dark:text-purple-400",
            bgColor: "bg-purple-100 dark:bg-purple-900/30",
        },
        {
            id: "gas-optimizer",
            name: "Gas Optimizer",
            description: "Schedule transactions when gas prices are low",
            icon: <Zap className="h-6 w-6" />,
            color: "text-yellow-600 dark:text-yellow-400",
            bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
        },
    ];

    // Get selected task type object
    const getSelectedTaskType = (): TaskType | null => {
        return taskTypes.find((type) => type.id === selectedTaskType) || null;
    };

    // Handle steps
    const handleNext = () => {
        setStep(step + 1);
    };

    const handleBack = () => {
        setStep(Math.max(0, step - 1));
    };

    const handleComplete = () => {
        setStep(3); // Success screen
    };

    const handleCreateAnother = () => {
        setStep(0);
        setSelectedTaskType(null);
    };

    const handleClose = () => {
        onOpenChange(false);
        // Reset after animation completes
        setTimeout(() => {
            setStep(0);
            setSelectedTaskType(null);
        }, 300);
    };

    // Render the appropriate configuration component based on the selected task type
    const renderConfigComponent = () => {
        switch (selectedTaskType) {
            case 'dao-voting':
                return <DAOVotingConfig onNext={handleNext} onBack={handleBack} />;
            case 'yield-optimizer':
                return <YieldOptimizerConfig onNext={handleNext} onBack={handleBack} />;
            case 'token-swap':
                return <TokenSwapConfig onNext={handleNext} onBack={handleBack} />;
            case 'rewards-claim':
                return <RewardsClaimConfig onNext={handleNext} onBack={handleBack} />;
            case 'nft-purchase':
                return <NFTPurchaseConfig onNext={handleNext} onBack={handleBack} />;
            case 'gas-optimizer':
                return <GasOptimizerConfig onNext={handleNext} onBack={handleBack} />;
            default:
                return <DAOVotingConfig onNext={handleNext} onBack={handleBack} />;
        }
    };

    // Content based on step
    const renderStepContent = () => {
        switch (step) {
            case 0:
                return (
                    <div className="space-y-6 dark:bg-slate-900/90 border-indigo-100 p-6 rounded-xl dark:border-indigo-900/30 shadow-lg">
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">
                                Choose Task Type
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                                Select the type of Web3 task you want to automate
                            </p>
                        </div>
                        <TaskTypeSelection
                            taskTypes={taskTypes}
                            selectedType={selectedTaskType}
                            onSelect={setSelectedTaskType}
                        />
                        <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-800">
                            <Button
                                disabled={!selectedTaskType}
                                onClick={handleNext}
                                className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                            >
                                Continue
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                );
            case 1:
                return renderConfigComponent();
            case 2:
                return (
                    <TaskReview
                        taskType={getSelectedTaskType()}
                        onBack={handleBack}
                        onComplete={handleComplete}
                    />
                );
            case 3:
                return (
                    <TaskCreatedSuccess
                        taskType={getSelectedTaskType()}
                        onClose={handleClose}
                        onCreateAnother={handleCreateAnother}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="sm:max-w-[600px] p-0 overflow-auto max-h-[90vh] dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg"
                onInteractOutside={(e) => {
                    // Prevent clicking outside from closing during task creation
                    if (step === 3) return;
                    e.preventDefault();
                }}
            >
                <div
                    className={cn(
                        "divide-y divide-slate-200 dark:divide-slate-800",
                        step === 3 && "divide-y-0" // No divider for success screen
                    )}
                >
                    {/* Header */}
                    {step !== 3 && (
                        <div className="p-6">
                            <div className="flex items-center justify-between">
                                <DialogTitle className="text-xl font-semibold">
                                    {step === 0
                                        ? "Create New Task"
                                        : step === 1
                                            ? `Configure ${getSelectedTaskType()?.name}`
                                            : "Review Task"}
                                </DialogTitle>
                            </div>
                            <StepIndicator currentStep={step} totalSteps={3} />
                        </div>
                    )}

                    {/* Content */}
                    <div className={step === 3 ? "p-6" : "p-6"}>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={step}
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                {renderStepContent()}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default CreateTaskModal;