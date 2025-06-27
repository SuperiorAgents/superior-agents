"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChevronRight,
    ChevronLeft,
    Check,
    X,
    Search,
    Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";


// DAOVotingConfig component
interface DAOVotingConfigProps {
    onNext: () => void;
    onBack: () => void;
}

export const DAOVotingConfig: React.FC<DAOVotingConfigProps> = ({ onNext, onBack }) => {
    // Popular DAOs data
    const popularDAOs = [
        { id: "nouns", name: "Nouns DAO", icon: "/icons/nouns.svg", proposals: 12 },
        { id: "ens", name: "ENS DAO", icon: "/icons/ens.svg", proposals: 8 },
        { id: "compound", name: "Compound", icon: "/icons/compound.svg", proposals: 5 },
        { id: "aave", name: "Aave", icon: "/icons/aave.svg", proposals: 3 },
        { id: "uniswap", name: "Uniswap", icon: "/icons/uniswap.svg", proposals: 7 },
    ];

    // Rule templates
    const ruleTemplates = [
        { id: "rewards", rule: "Vote YES if proposal mentions rewards or incentives" },
        { id: "treasury", rule: "Vote YES if proposal reduces treasury spending" },
        { id: "governance", rule: "Vote YES if proposal improves governance processes" },
        { id: "majority", rule: "Always vote with the majority" },
    ];

    const [selectedDAO, setSelectedDAO] = useState<string | null>(null);
    const [customDAO, setCustomDAO] = useState("");
    const [votingRule, setVotingRule] = useState("");
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [gasLevel, setGasLevel] = useState(50);
    const [notifyEmail, setNotifyEmail] = useState(true);
    const [notifyApp, setNotifyApp] = useState(true);

    const handleSelectTemplate = (rule: string) => {
        setVotingRule(rule);
    };

    const isValid = (selectedDAO || customDAO) && votingRule;

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">
                    Select DAO
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    Choose the DAO governance system where you want to automate voting
                </p>

                {/* DAO Selection */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                    {popularDAOs.map((dao) => (
                        <motion.div
                            key={dao.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setSelectedDAO(dao.id)}
                            className={cn(
                                "border rounded-lg p-3 cursor-pointer transition-all",
                                selectedDAO === dao.id
                                    ? "border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20"
                                    : "border-slate-200 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-900"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={dao.icon} alt={dao.name} />
                                        <AvatarFallback className="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200 text-xs">
                                            {dao.name.substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                </div>
                                <div>
                                    <h4 className="font-medium text-slate-900 dark:text-slate-100">{dao.name}</h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        {dao.proposals} active proposals
                                    </p>
                                </div>
                                {selectedDAO === dao.id && (
                                    <div className="ml-auto">
                                        <Check className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}

                    <div className="col-span-2 md:col-span-3 mt-2">
                        <div className="relative">
                            <Input
                                placeholder="Enter custom DAO contract address (0x...)"
                                value={customDAO}
                                onChange={(e) => {
                                    setCustomDAO(e.target.value);
                                    setSelectedDAO(null);
                                }}
                                className={cn(
                                    "pl-10",
                                    customDAO && "border-blue-500 dark:border-blue-400"
                                )}
                            />
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                            {customDAO && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6"
                                    onClick={() => setCustomDAO("")}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Voting Rule */}
                <div className="space-y-4 mt-8">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">
                            Define Voting Rule
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                            Create a rule in plain language to determine how AI should vote
                        </p>
                    </div>

                    <div className="space-y-3">
                        <Textarea
                            placeholder="e.g., Vote YES if proposal mentions rewards or improvements"
                            value={votingRule}
                            onChange={(e) => setVotingRule(e.target.value)}
                            className="min-h-[100px]"
                        />

                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-100 dark:border-blue-800/50 text-sm text-blue-700 dark:text-blue-300">
                            <div className="flex gap-2 items-start">
                                <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                <p>
                                    The AI will analyze proposal text and vote according to your rule. Use natural
                                    language to describe your voting preferences.
                                </p>
                            </div>
                        </div>

                        <div className="mt-4">
                            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Rule Templates
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {ruleTemplates.map((template) => (
                                    <Badge
                                        key={template.id}
                                        variant="outline"
                                        className={cn(
                                            "cursor-pointer py-1 px-3",
                                            votingRule === template.rule
                                                ? "bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300"
                                                : "hover:bg-slate-100 dark:hover:bg-slate-800"
                                        )}
                                        onClick={() => handleSelectTemplate(template.rule)}
                                    >
                                        {template.rule}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Advanced Settings */}
                <div className="mt-8">
                    <Button
                        variant="ghost"
                        className="flex items-center w-full justify-between p-0 h-auto"
                        onClick={() => setShowAdvanced(!showAdvanced)}
                    >
                        <span className="font-semibold text-sm text-slate-700 dark:text-slate-300">
                            Advanced Settings
                        </span>
                        <ChevronRight
                            className={cn(
                                "h-5 w-5 text-slate-400 transition-transform",
                                showAdvanced && "transform rotate-90"
                            )}
                        />
                    </Button>

                    <AnimatePresence>
                        {showAdvanced && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden mt-4"
                            >
                                <div className="space-y-6 border-t border-slate-200 dark:border-slate-800 pt-4">
                                    {/* Gas Settings */}
                                    <div>
                                        <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                                            Gas Price Limit
                                        </h4>
                                        <div className="space-y-4">
                                            <Slider
                                                value={[gasLevel]}
                                                min={0}
                                                max={100}
                                                step={5}
                                                onValueChange={(value) => setGasLevel(value[0])}
                                                className="my-2"
                                            />
                                            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                                                <span>Low (Save Gas)</span>
                                                <span>Current: {gasLevel} gwei</span>
                                                <span>High (Fast)</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Notification Settings */}
                                    <div>
                                        <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                                            Notifications
                                        </h4>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <label
                                                    htmlFor="notify-email"
                                                    className="text-sm text-slate-600 dark:text-slate-400"
                                                >
                                                    Email notifications
                                                </label>
                                                <Switch
                                                    id="notify-email"
                                                    checked={notifyEmail}
                                                    onCheckedChange={setNotifyEmail}
                                                />
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <label
                                                    htmlFor="notify-app"
                                                    className="text-sm text-slate-600 dark:text-slate-400"
                                                >
                                                    In-app notifications
                                                </label>
                                                <Switch
                                                    id="notify-app"
                                                    checked={notifyApp}
                                                    onCheckedChange={setNotifyApp}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Task Duration */}
                                    <div>
                                        <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                                            Task Duration
                                        </h4>
                                        <RadioGroup defaultValue="indefinite" className="space-y-3">
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="indefinite" id="indefinite" />
                                                <label
                                                    htmlFor="indefinite"
                                                    className="text-sm text-slate-600 dark:text-slate-400"
                                                >
                                                    Run until manually disabled
                                                </label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="count" id="count" />
                                                <label
                                                    htmlFor="count"
                                                    className="text-sm text-slate-600 dark:text-slate-400"
                                                >
                                                    Run for the next 10 proposals
                                                </label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="date" id="date" />
                                                <label
                                                    htmlFor="date"
                                                    className="text-sm text-slate-600 dark:text-slate-400"
                                                >
                                                    Run until specific date
                                                </label>
                                            </div>
                                        </RadioGroup>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
                <Button variant="outline" onClick={onBack}>
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>
                <Button
                    disabled={!isValid}
                    onClick={onNext}
                    className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                    Continue
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
};
