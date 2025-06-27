"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";



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

interface TaskTypeSelectionProps {
    taskTypes: TaskType[];
    selectedType: string | null;
    onSelect: (id: string) => void;
}

export const TaskTypeSelection: React.FC<TaskTypeSelectionProps> = ({
    taskTypes,
    selectedType,
    onSelect,
}) => {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {taskTypes.map((taskType) => (
                <motion.div
                    key={taskType.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => onSelect(taskType.id)}
                    className={cn(
                        "relative rounded-xl p-4 cursor-pointer border-2 transition-all",
                        selectedType === taskType.id
                            ? `${taskType.color} ${taskType.bgColor} border-blue-500 dark:border-blue-400 shadow-md`
                            : "border-slate-200 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-900"
                    )}
                >
                    {taskType.popular && (
                        <Badge
                            className="absolute top-2 right-2 bg-gradient-to-r from-orange-500 to-pink-600 text-white text-[10px]"
                            variant="default"
                        >
                            Popular
                        </Badge>
                    )}
                    <div className="flex flex-col items-center text-center">
                        <div
                            className={cn(
                                "h-12 w-12 rounded-full flex items-center justify-center mb-3",
                                taskType.bgColor
                            )}
                        >
                            <div className={taskType.color}>{taskType.icon}</div>
                        </div>
                        <h3
                            className={cn(
                                "font-medium mb-1",
                                selectedType === taskType.id
                                    ? "text-blue-700 dark:text-blue-200"
                                    : "text-slate-900 dark:text-slate-100"
                            )}
                        >
                            {taskType.name}
                        </h3>
                        <p
                            className={cn(
                                "text-xs",
                                selectedType === taskType.id
                                    ? "text-blue-600/90 dark:text-blue-300/90"
                                    : "text-slate-600 dark:text-slate-400"
                            )}
                        >
                            {taskType.description}
                        </p>

                        {selectedType === taskType.id && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="mt-3"
                            >
                                <Badge variant="secondary" className="bg-white/80 dark:bg-slate-800/80">
                                    Selected
                                </Badge>
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            ))}
        </div>
    );
};
