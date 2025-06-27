import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChevronRight,
    ChevronLeft,
    Check,
    X,
    Search,
    Info,
    Percent,
    BarChart3,
    ShieldCheck,
    CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// YieldOptimizerConfig component
interface YieldOptimizerConfigProps {
    onNext: () => void;
    onBack: () => void;
}

export const YieldOptimizerConfig: React.FC<YieldOptimizerConfigProps> = ({ onNext, onBack }) => {
    // Popular platforms data
    const platforms = [
        { id: "aave", name: "Aave", icon: "/icons/aave.svg", apy: "4.2%", tvl: "$3.8B", risk: "Low" },
        { id: "compound", name: "Compound", icon: "/icons/compound.svg", apy: "3.8%", tvl: "$2.1B", risk: "Low" },
        { id: "yearn", name: "Yearn Finance", icon: "/icons/yearn.svg", apy: "7.5%", tvl: "$498M", risk: "Medium" },
        { id: "convex", name: "Convex Finance", icon: "/icons/convex.svg", apy: "8.2%", tvl: "$1.2B", risk: "Medium" },
        { id: "lido", name: "Lido", icon: "/icons/lido.svg", apy: "3.9%", tvl: "$15.6B", risk: "Low" },
    ];

    // Asset options
    const assets = [
        { id: "usdc", name: "USDC", icon: "/icons/usdc.svg", balance: "2,450.00" },
        { id: "usdt", name: "USDT", icon: "/icons/usdt.svg", balance: "1,250.75" },
        { id: "dai", name: "DAI", icon: "/icons/dai.svg", balance: "3,120.25" },
        { id: "eth", name: "ETH", icon: "/icons/eth.svg", balance: "1.25" },
        { id: "wbtc", name: "WBTC", icon: "/icons/wbtc.svg", balance: "0.12" },
    ];

    const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
    const [customPlatform, setCustomPlatform] = useState("");
    const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
    const [customAsset, setCustomAsset] = useState("");
    const [threshold, setThreshold] = useState<number>(0.5);
    const [amount, setAmount] = useState<string>("");
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [gasLevel, setGasLevel] = useState(50);
    const [notifyEmail, setNotifyEmail] = useState(true);
    const [notifyApp, setNotifyApp] = useState(true);
    const [autoCompound, setAutoCompound] = useState(true);

    const isValid = (selectedPlatform || customPlatform) && (selectedAsset || customAsset) && amount;

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">
                    Configure Yield Optimizer
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    Set up automated movement of funds to higher yielding platforms
                </p>

                {/* Asset Selection */}
                <div className="space-y-4 mb-6">
                    <h4 className="text-md font-medium text-slate-800 dark:text-slate-200">
                        Select Asset to Optimize
                    </h4>
                    <Tabs defaultValue="stablecoins" className="w-full">
                        <TabsList className="mb-4">
                            <TabsTrigger value="stablecoins">Stablecoins</TabsTrigger>
                            <TabsTrigger value="ethereum">Ethereum Assets</TabsTrigger>
                            <TabsTrigger value="all">All Assets</TabsTrigger>
                        </TabsList>
                        <TabsContent value="stablecoins" className="mt-0">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {assets.filter(a => ["usdc", "usdt", "dai"].includes(a.id)).map((asset) => (
                                    <motion.div
                                        key={asset.id}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setSelectedAsset(asset.id)}
                                        className={cn(
                                            "border rounded-lg p-3 cursor-pointer transition-all",
                                            selectedAsset === asset.id
                                                ? "border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-900/20"
                                                : "border-slate-200 dark:border-slate-800 hover:border-green-200 dark:hover:border-green-900"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={asset.icon} alt={asset.name} />
                                                    <AvatarFallback className="bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-200 text-xs">
                                                        {asset.name.substring(0, 2).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-slate-900 dark:text-slate-100">{asset.name}</h4>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                                    Balance: {asset.balance}
                                                </p>
                                            </div>
                                            {selectedAsset === asset.id && (
                                                <div className="ml-auto">
                                                    <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </TabsContent>
                        <TabsContent value="ethereum" className="mt-0">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {assets.filter(a => ["eth", "wbtc"].includes(a.id)).map((asset) => (
                                    <motion.div
                                        key={asset.id}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setSelectedAsset(asset.id)}
                                        className={cn(
                                            "border rounded-lg p-3 cursor-pointer transition-all",
                                            selectedAsset === asset.id
                                                ? "border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-900/20"
                                                : "border-slate-200 dark:border-slate-800 hover:border-green-200 dark:hover:border-green-900"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={asset.icon} alt={asset.name} />
                                                    <AvatarFallback className="bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-200 text-xs">
                                                        {asset.name.substring(0, 2).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-slate-900 dark:text-slate-100">{asset.name}</h4>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                                    Balance: {asset.balance}
                                                </p>
                                            </div>
                                            {selectedAsset === asset.id && (
                                                <div className="ml-auto">
                                                    <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </TabsContent>
                        <TabsContent value="all" className="mt-0">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {assets.map((asset) => (
                                    <motion.div
                                        key={asset.id}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setSelectedAsset(asset.id)}
                                        className={cn(
                                            "border rounded-lg p-3 cursor-pointer transition-all",
                                            selectedAsset === asset.id
                                                ? "border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-900/20"
                                                : "border-slate-200 dark:border-slate-800 hover:border-green-200 dark:hover:border-green-900"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={asset.icon} alt={asset.name} />
                                                    <AvatarFallback className="bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-200 text-xs">
                                                        {asset.name.substring(0, 2).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-slate-900 dark:text-slate-100">{asset.name}</h4>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                                    Balance: {asset.balance}
                                                </p>
                                            </div>
                                            {selectedAsset === asset.id && (
                                                <div className="ml-auto">
                                                    <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </TabsContent>
                    </Tabs>

                    <div className="relative">
                        <Input
                            placeholder="Enter custom token address (0x...)"
                            value={customAsset}
                            onChange={(e) => {
                                setCustomAsset(e.target.value);
                                setSelectedAsset(null);
                            }}
                            className={cn(
                                "pl-10",
                                customAsset && "border-green-500 dark:border-green-400"
                            )}
                        />
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                        {customAsset && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6"
                                onClick={() => setCustomAsset("")}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>

                {/* Amount Input */}
                <div className="space-y-3 mb-6">
                    <h4 className="text-md font-medium text-slate-800 dark:text-slate-200">
                        Amount to Optimize
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
                                    const asset = assets.find(a => a.id === selectedAsset);
                                    if (asset) setAmount(asset.balance);
                                }}
                            >
                                Max
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-6 py-0 px-1.5 text-xs"
                                onClick={() => {
                                    const asset = assets.find(a => a.id === selectedAsset);
                                    if (asset) {
                                        const half = parseFloat(asset.balance.replace(',', '')) / 2;
                                        setAmount(half.toString());
                                    }
                                }}
                            >
                                Half
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Platform Selection */}
                <div className="space-y-4 mb-6">
                    <div className="flex items-center justify-between">
                        <h4 className="text-md font-medium text-slate-800 dark:text-slate-200">
                            Target Platforms
                        </h4>
                        <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300">
                            Auto-select best APY
                        </Badge>
                    </div>

                    <div className="space-y-3">
                        <div className="grid grid-cols-1 gap-3 mb-4">
                            {platforms.map((platform) => (
                                <motion.div
                                    key={platform.id}
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                    onClick={() => setSelectedPlatform(platform.id)}
                                    className={cn(
                                        "border rounded-lg p-3 cursor-pointer transition-all",
                                        selectedPlatform === platform.id
                                            ? "border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-900/20"
                                            : "border-slate-200 dark:border-slate-800 hover:border-green-200 dark:hover:border-green-900"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={platform.icon} alt={platform.name} />
                                                <AvatarFallback className="bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-200 text-xs">
                                                    {platform.name.substring(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-slate-900 dark:text-slate-100">{platform.name}</h4>
                                            <div className="flex gap-4 mt-1">
                                                <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                                                    <Percent className="h-3 w-3 mr-1" />
                                                    <span>{platform.apy}</span>
                                                </div>
                                                <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                                                    <BarChart3 className="h-3 w-3 mr-1" />
                                                    <span>{platform.tvl}</span>
                                                </div>
                                                <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                                                    <ShieldCheck className="h-3 w-3 mr-1" />
                                                    <span>Risk: {platform.risk}</span>
                                                </div>
                                            </div>
                                        </div>
                                        {selectedPlatform === platform.id && (
                                            <div className="ml-auto">
                                                <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <div className="relative">
                            <Input
                                placeholder="Enter custom platform contract address (0x...)"
                                value={customPlatform}
                                onChange={(e) => {
                                    setCustomPlatform(e.target.value);
                                    setSelectedPlatform(null);
                                }}
                                className={cn(
                                    "pl-10",
                                    customPlatform && "border-green-500 dark:border-green-400"
                                )}
                            />
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                            {customPlatform && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6"
                                    onClick={() => setCustomPlatform("")}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Yield Threshold */}
                <div className="space-y-3 mb-6">
                    <h4 className="text-md font-medium text-slate-800 dark:text-slate-200">
                        Yield Optimization Threshold
                    </h4>
                    <div className="space-y-4">
                        <Slider
                            value={[threshold]}
                            min={0.1}
                            max={2}
                            step={0.1}
                            onValueChange={(value) => setThreshold(value[0])}
                            className="my-2"
                        />
                        <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                            <span>Move when yields differ by {threshold}% or more</span>
                            <span>Current: {threshold}%</span>
                        </div>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-100 dark:border-blue-800/50 text-sm text-blue-700 dark:text-blue-300">
                        <div className="flex gap-2 items-start">
                            <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            <p>
                                The optimizer will automatically move your funds when it finds a platform with
                                an APY at least {threshold}% higher than your current position.
                            </p>
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

                                    {/* Auto-compound Settings */}
                                    <div>
                                        <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                                            Auto-compound Rewards
                                        </h4>
                                        <div className="flex items-center justify-between">
                                            <label
                                                htmlFor="auto-compound"
                                                className="text-sm text-slate-600 dark:text-slate-400"
                                            >
                                                Automatically reinvest earned rewards
                                            </label>
                                            <Switch
                                                id="auto-compound"
                                                checked={autoCompound}
                                                onCheckedChange={setAutoCompound}
                                            />
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