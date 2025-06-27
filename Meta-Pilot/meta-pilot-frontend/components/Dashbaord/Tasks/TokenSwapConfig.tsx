import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowLeftRight,
    ChevronRight,
    ChevronLeft,
    Check,
    X,
    Search,
    TrendingUp,
    Clock,
    CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// TokenSwapConfig component
interface TokenSwapConfigProps {
    onNext: () => void;
    onBack: () => void;
}

export const TokenSwapConfig: React.FC<TokenSwapConfigProps> = ({ onNext, onBack }) => {
    // Popular tokens data
    const tokens = [
        { id: "eth", name: "Ethereum", icon: "/icons/eth.svg", price: "$3,245.75", change: "+2.4%" },
        { id: "btc", name: "Bitcoin", icon: "/icons/btc.svg", price: "$51,245.30", change: "+1.8%" },
        { id: "usdc", name: "USDC", icon: "/icons/usdc.svg", price: "$1.00", change: "0.0%" },
        { id: "dai", name: "DAI", icon: "/icons/dai.svg", price: "$1.01", change: "+0.1%" },
        { id: "uni", name: "Uniswap", icon: "/icons/uni.svg", price: "$18.45", change: "-0.8%" },
        { id: "link", name: "Chainlink", icon: "/icons/link.svg", price: "$24.30", change: "+5.2%" },
    ];

    // Exchange options
    const exchanges = [
        { id: "uniswap", name: "Uniswap", icon: "/icons/uniswap.svg", fee: "0.3%" },
        { id: "sushiswap", name: "SushiSwap", icon: "/icons/sushi.svg", fee: "0.25%" },
        { id: "1inch", name: "1inch", icon: "/icons/1inch.svg", fee: "varies" },
        { id: "curve", name: "Curve", icon: "/icons/curve.svg", fee: "0.04%" },
    ];

    const [sourceToken, setSourceToken] = useState<string | null>(null);
    const [customSourceToken, setCustomSourceToken] = useState("");
    const [targetToken, setTargetToken] = useState<string | null>(null);
    const [customTargetToken, setCustomTargetToken] = useState("");
    const [selectedExchange, setSelectedExchange] = useState<string>("uniswap");
    const [triggerType, setTriggerType] = useState<string>("price");
    const [priceThreshold, setPriceThreshold] = useState<string>("");
    const [percentage, setPercentage] = useState<number>(5);
    const [amount, setAmount] = useState<string>("");
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [gasLevel, setGasLevel] = useState(50);
    const [notifyEmail, setNotifyEmail] = useState(true);
    const [notifyApp, setNotifyApp] = useState(true);
    const [slippage, setSlippage] = useState(0.5);

    const isValid = (sourceToken || customSourceToken) && (targetToken || customTargetToken) && amount && (triggerType === 'now' || priceThreshold);

    const handleSwapTokens = () => {
        const temp = sourceToken;
        setSourceToken(targetToken);
        setTargetToken(temp);

        const tempCustom = customSourceToken;
        setCustomSourceToken(customTargetToken);
        setCustomTargetToken(tempCustom);
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">
                    Configure Token Swap
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    Set up automated token swaps when price conditions are met
                </p>

                {/* Token Selection */}
                <div className="space-y-5 mb-6">
                    {/* Source Token */}
                    <div className="space-y-3">
                        <h4 className="text-md font-medium text-slate-800 dark:text-slate-200">
                            From Token
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {tokens.slice(0, 6).map((token) => (
                                <motion.div
                                    key={`source-${token.id}`}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setSourceToken(token.id)}
                                    className={cn(
                                        "border rounded-lg p-3 cursor-pointer transition-all",
                                        sourceToken === token.id
                                            ? "border-indigo-500 dark:border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20"
                                            : "border-slate-200 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-900"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={token.icon} alt={token.name} />
                                                <AvatarFallback className="bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-200 text-xs">
                                                    {token.name.substring(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-slate-900 dark:text-slate-100">{token.name}</h4>
                                            <div className="flex items-center text-xs">
                                                <span className="text-slate-500 dark:text-slate-400 mr-2">{token.price}</span>
                                                <span className={token.change.startsWith('+') ? 'text-green-500' : token.change.startsWith('-') ? 'text-red-500' : 'text-slate-500'}>
                                                    {token.change}
                                                </span>
                                            </div>
                                        </div>
                                        {sourceToken === token.id && (
                                            <div className="ml-auto">
                                                <Check className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <div className="relative">
                            <Input
                                placeholder="Enter custom token address (0x...)"
                                value={customSourceToken}
                                onChange={(e) => {
                                    setCustomSourceToken(e.target.value);
                                    setSourceToken(null);
                                }}
                                className={cn(
                                    "pl-10",
                                    customSourceToken && "border-indigo-500 dark:border-indigo-400"
                                )}
                            />
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                            {customSourceToken && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6"
                                    onClick={() => setCustomSourceToken("")}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Swap Direction Button */}
                    <div className="flex justify-center">
                        <Button
                            variant="outline"
                            size="icon"
                            className="rounded-full h-10 w-10 border-dashed border-slate-300 dark:border-slate-700"
                            onClick={handleSwapTokens}
                        >
                            <ArrowLeftRight className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                        </Button>
                    </div>

                    {/* Target Token */}
                    <div className="space-y-3">
                        <h4 className="text-md font-medium text-slate-800 dark:text-slate-200">
                            To Token
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {tokens.slice(0, 6).map((token) => (
                                <motion.div
                                    key={`target-${token.id}`}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setTargetToken(token.id)}
                                    className={cn(
                                        "border rounded-lg p-3 cursor-pointer transition-all",
                                        targetToken === token.id
                                            ? "border-indigo-500 dark:border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20"
                                            : "border-slate-200 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-900"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={token.icon} alt={token.name} />
                                                <AvatarFallback className="bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-200 text-xs">
                                                    {token.name.substring(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-slate-900 dark:text-slate-100">{token.name}</h4>
                                            <div className="flex items-center text-xs">
                                                <span className="text-slate-500 dark:text-slate-400 mr-2">{token.price}</span>
                                                <span className={token.change.startsWith('+') ? 'text-green-500' : token.change.startsWith('-') ? 'text-red-500' : 'text-slate-500'}>
                                                    {token.change}
                                                </span>
                                            </div>
                                        </div>
                                        {targetToken === token.id && (
                                            <div className="ml-auto">
                                                <Check className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <div className="relative">
                            <Input
                                placeholder="Enter custom token address (0x...)"
                                value={customTargetToken}
                                onChange={(e) => {
                                    setCustomTargetToken(e.target.value);
                                    setTargetToken(null);
                                }}
                                className={cn(
                                    "pl-10",
                                    customTargetToken && "border-indigo-500 dark:border-indigo-400"
                                )}
                            />
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                            {customTargetToken && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6"
                                    onClick={() => setCustomTargetToken("")}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Exchange Selection */}
                <div className="space-y-3 mb-6">
                    <h4 className="text-md font-medium text-slate-800 dark:text-slate-200">
                        Select Exchange
                    </h4>
                    <div className="flex flex-wrap gap-3">
                        {exchanges.map((exchange) => (
                            <motion.div
                                key={exchange.id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setSelectedExchange(exchange.id)}
                                className={cn(
                                    "border rounded-lg p-2.5 cursor-pointer transition-all flex items-center gap-2",
                                    selectedExchange === exchange.id
                                        ? "border-indigo-500 dark:border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20"
                                        : "border-slate-200 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-900"
                                )}
                            >
                                <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                    <Avatar className="h-6 w-6">
                                        <AvatarImage src={exchange.icon} alt={exchange.name} />
                                        <AvatarFallback className="bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-200 text-xs">
                                            {exchange.name.substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100">{exchange.name}</h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Fee: {exchange.fee}</p>
                                </div>
                                {selectedExchange === exchange.id && (
                                    <Check className="h-4 w-4 ml-1 text-indigo-600 dark:text-indigo-400" />
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Trigger Type */}
                <div className="space-y-3 mb-6">
                    <h4 className="text-md font-medium text-slate-800 dark:text-slate-200">
                        When to Execute Swap
                    </h4>
                    <RadioGroup value={triggerType} onValueChange={setTriggerType} className="space-y-2">
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="now" id="trigger-now" />
                            <label htmlFor="trigger-now" className="text-sm text-slate-700 dark:text-slate-300">
                                Execute swap immediately
                            </label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="price" id="trigger-price" />
                            <label htmlFor="trigger-price" className="text-sm text-slate-700 dark:text-slate-300">
                                Execute when price condition is met
                            </label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="time" id="trigger-time" />
                            <label htmlFor="trigger-time" className="text-sm text-slate-700 dark:text-slate-300">
                                Execute at a specific time
                            </label>
                        </div>
                    </RadioGroup>

                    {triggerType === 'price' && (
                        <div className="mt-4 space-y-4">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
                                <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Price Condition
                                </h5>
                            </div>

                            <div className="space-y-3">
                                <div className="space-y-1">
                                    <label className="text-xs text-slate-500 dark:text-slate-400">
                                        Target Price or Percentage Change
                                    </label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <Input
                                                type="text"
                                                placeholder="Price threshold"
                                                value={priceThreshold}
                                                onChange={(e) => setPriceThreshold(e.target.value)}
                                                className="pl-10"
                                            />
                                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-xs font-medium text-slate-500">
                                                {targetToken === 'eth' || targetToken === 'btc' ? '$' : '%'}
                                            </div>
                                        </div>

                                        <Select
                                            value={percentage >= 0 ? 'increase' : 'decrease'}
                                            onValueChange={(value) => {
                                                setPercentage(prev => value === 'increase' ? Math.abs(prev) : -Math.abs(prev));
                                            }}
                                        >
                                            <SelectTrigger className="w-[120px]">
                                                <SelectValue placeholder="Change" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="increase">Increases by</SelectItem>
                                                <SelectItem value="decrease">Decreases by</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs text-slate-500 dark:text-slate-400">
                                        Percentage Change
                                    </label>
                                    <div className="space-y-4">
                                        <Slider
                                            value={[Math.abs(percentage)]}
                                            min={0.5}
                                            max={20}
                                            step={0.5}
                                            onValueChange={(value) => setPercentage(percentage < 0 ? -value[0] : value[0])}
                                            className="my-2"
                                        />
                                        <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                                            <span>0.5%</span>
                                            <span>Current: {Math.abs(percentage)}%</span>
                                            <span>20%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {triggerType === 'time' && (
                        <div className="mt-4 space-y-4">
                            <div className="flex items-center gap-2">
                                <Clock className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
                                <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Time Condition
                                </h5>
                            </div>

                            <div className="space-y-3">
                                <div className="space-y-1">
                                    <label className="text-xs text-slate-500 dark:text-slate-400">
                                        Select Date and Time
                                    </label>
                                    <Input
                                        type="datetime-local"
                                        className="w-full"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Amount Input */}
                <div className="space-y-3 mb-6">
                    <h4 className="text-md font-medium text-slate-800 dark:text-slate-200">
                        Amount to Swap
                    </h4>
                    <div className="relative">
                        <Input
                            type="text"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="Enter amount"
                            className="pl-10"
                        />
                        <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-6 py-0 px-1.5 text-xs"
                                onClick={() => {
                                    setAmount("100");
                                }}
                            >
                                Max
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-6 py-0 px-1.5 text-xs"
                                onClick={() => {
                                    setAmount("50");
                                }}
                            >
                                Half
                            </Button>
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
                                    {/* Slippage Settings */}
                                    <div>
                                        <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                                            Slippage Tolerance
                                        </h4>
                                        <div className="space-y-4">
                                            <Slider
                                                value={[slippage]}
                                                min={0.1}
                                                max={5}
                                                step={0.1}
                                                onValueChange={(value) => setSlippage(value[0])}
                                                className="my-2"
                                            />
                                            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                                                <span>0.1%</span>
                                                <span>Current: {slippage}%</span>
                                                <span>5%</span>
                                            </div>
                                        </div>
                                    </div>

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