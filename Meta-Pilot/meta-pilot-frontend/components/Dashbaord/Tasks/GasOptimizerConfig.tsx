import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChevronRight,
    ChevronLeft,
    Check,
    X,
    Search,
    Info,
    Activity,
    CreditCard,
    AlarmClock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// GasOptimizerConfig component
interface GasOptimizerConfigProps {
    onNext: () => void;
    onBack: () => void;
}

export const GasOptimizerConfig: React.FC<GasOptimizerConfigProps> = ({ onNext, onBack }) => {
    // Transaction types data
    const transactionTypes = [
        { id: "transfer", name: "Token Transfer", icon: "💸", gasEstimate: "21,000" },
        { id: "swap", name: "Token Swap", icon: "🔄", gasEstimate: "120,000-180,000" },
        { id: "approve", name: "Token Approval", icon: "✅", gasEstimate: "45,000" },
        { id: "mint", name: "NFT Mint", icon: "🖼️", gasEstimate: "150,000-300,000" },
        { id: "stake", name: "Staking", icon: "📈", gasEstimate: "100,000-150,000" },
    ];

    const [selectedTxType, setSelectedTxType] = useState<string | null>(null);
    const [targetAddress, setTargetAddress] = useState<string>("");
    const [transactionData, setTransactionData] = useState<string>("");
    const [optimizeType, setOptimizeType] = useState<string>("price");
    const [maxGasPrice, setMaxGasPrice] = useState<number>(30);
    const [deadline, setDeadline] = useState<string>("");
    const [notifyEmail, setNotifyEmail] = useState(true);
    const [notifyApp, setNotifyApp] = useState(true);
    const [showAdvanced, setShowAdvanced] = useState(false);

    const isValid = selectedTxType && targetAddress && (optimizeType === 'price' || (optimizeType === 'deadline' && deadline));

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">
                    Configure Gas Optimizer
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    Schedule transactions to execute when gas prices are low
                </p>

                {/* Transaction Type Selection */}
                <div className="space-y-4 mb-6">
                    <h4 className="text-md font-medium text-slate-800 dark:text-slate-200">
                        Transaction Type
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {transactionTypes.map((txType) => (
                            <motion.div
                                key={txType.id}
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                onClick={() => setSelectedTxType(txType.id)}
                                className={cn(
                                    "border rounded-lg p-3 cursor-pointer transition-all",
                                    selectedTxType === txType.id
                                        ? "border-yellow-500 dark:border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20"
                                        : "border-slate-200 dark:border-slate-800 hover:border-yellow-200 dark:hover:border-yellow-900"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-lg">
                                        {txType.icon}
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-slate-900 dark:text-slate-100">{txType.name}</h4>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            Est. gas: {txType.gasEstimate}
                                        </p>
                                    </div>
                                    {selectedTxType === txType.id && (
                                        <div className="ml-auto">
                                            <Check className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Target Address */}
                <div className="space-y-3 mb-6">
                    <h4 className="text-md font-medium text-slate-800 dark:text-slate-200">
                        Target Address
                    </h4>
                    <div className="relative">
                        <Input
                            placeholder="Enter contract address (0x...)"
                            value={targetAddress}
                            onChange={(e) => setTargetAddress(e.target.value)}
                            className="pl-10"
                        />
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                        {targetAddress && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6"
                                onClick={() => setTargetAddress("")}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>

                {/* Transaction Data */}
                <div className="space-y-3 mb-6">
                    <h4 className="text-md font-medium text-slate-800 dark:text-slate-200">
                        Transaction Data (Optional)
                    </h4>
                    <div className="relative">
                        <Input
                            placeholder="Enter transaction data (0x...)"
                            value={transactionData}
                            onChange={(e) => setTransactionData(e.target.value)}
                            className="pl-10 font-mono text-xs"
                        />
                        <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                        {transactionData && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6"
                                onClick={() => setTransactionData("")}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                        For advanced users: enter the raw transaction data or leave blank
                    </div>
                </div>

                {/* Optimization Type */}
                <div className="space-y-3 mb-6">
                    <h4 className="text-md font-medium text-slate-800 dark:text-slate-200">
                        Optimization Strategy
                    </h4>
                    <RadioGroup value={optimizeType} onValueChange={setOptimizeType} className="space-y-2">
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="price" id="optimize-price" />
                            <label htmlFor="optimize-price" className="text-sm text-slate-700 dark:text-slate-300">
                                Execute when gas price is low
                            </label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="deadline" id="optimize-deadline" />
                            <label htmlFor="optimize-deadline" className="text-sm text-slate-700 dark:text-slate-300">
                                Execute by specific deadline
                            </label>
                        </div>
                    </RadioGroup>

                    {optimizeType === 'price' && (
                        <div className="mt-4 space-y-4">
                            <div className="flex items-center gap-2">
                                <Activity className="h-5 w-5 text-yellow-500 dark:text-yellow-400" />
                                <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Gas Price Threshold
                                </h5>
                            </div>

                            <div className="space-y-4">
                                <Slider
                                    value={[maxGasPrice]}
                                    min={5}
                                    max={100}
                                    step={1}
                                    onValueChange={(value) => setMaxGasPrice(value[0])}
                                    className="my-2"
                                />
                                <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                                    <span>5 gwei</span>
                                    <span>Current: {maxGasPrice} gwei</span>
                                    <span>100 gwei</span>
                                </div>
                            </div>

                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-100 dark:border-blue-800/50 text-sm text-blue-700 dark:text-blue-300">
                                <div className="flex gap-2 items-start">
                                    <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                    <p>
                                        Transaction will execute when the network gas price falls below {maxGasPrice} gwei.
                                        Current network average: 25 gwei.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {optimizeType === 'deadline' && (
                        <div className="mt-4 space-y-4">
                            <div className="flex items-center gap-2">
                                <AlarmClock className="h-5 w-5 text-yellow-500 dark:text-yellow-400" />
                                <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Execution Deadline
                                </h5>
                            </div>

                            <div className="space-y-3">
                                <div className="space-y-1">
                                    <label className="text-xs text-slate-500 dark:text-slate-400">
                                        Select deadline date and time
                                    </label>
                                    <Input
                                        type="datetime-local"
                                        value={deadline}
                                        onChange={(e) => setDeadline(e.target.value)}
                                        className="w-full"
                                    />
                                </div>

                                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 border border-yellow-100 dark:border-yellow-800/50 text-sm text-yellow-700 dark:text-yellow-300">
                                    <div className="flex gap-2 items-start">
                                        <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                        <p>
                                            This transaction will be submitted at the optimal gas price but
                                            no later than the deadline you've selected.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
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
                                    {/* Priority Fee Settings */}
                                    <div>
                                        <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                                            Max Priority Fee
                                        </h4>
                                        <div className="space-y-4">
                                            <Slider
                                                defaultValue={[2]}
                                                min={0.1}
                                                max={5}
                                                step={0.1}
                                                className="my-2"
                                            />
                                            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                                                <span>0.1 gwei</span>
                                                <span>Current: 2 gwei</span>
                                                <span>5 gwei</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* EIP-1559 Settings */}
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                                Use EIP-1559 Transaction
                                            </h4>
                                            <Switch defaultChecked={true} />
                                        </div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400">
                                            Uses the more gas-efficient EIP-1559 transaction format
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