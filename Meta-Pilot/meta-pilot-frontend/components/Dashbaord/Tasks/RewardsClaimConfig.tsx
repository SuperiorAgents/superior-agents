import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    BellRing,
    ChevronRight,
    ChevronLeft,
    Check,
    X,
    Search,
    Info,
    Calendar,
    Timer,
    DollarSign,
    BarChart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// RewardsClaimConfig component
interface RewardsClaimConfigProps {
    onNext: () => void;
    onBack: () => void;
}

export const RewardsClaimConfig: React.FC<RewardsClaimConfigProps> = ({ onNext, onBack }) => {
    // Protocols with rewards
    const protocols = [
        { id: "aave", name: "Aave", icon: "/icons/aave.svg", rewards: "32.5 stkAAVE", value: "$158.32" },
        { id: "compound", name: "Compound", icon: "/icons/compound.svg", rewards: "241 COMP", value: "$987.65" },
        { id: "curve", name: "Curve", icon: "/icons/curve.svg", rewards: "156 CRV", value: "$123.45" },
        { id: "synthetix", name: "Synthetix", icon: "/icons/synthetix.svg", rewards: "87 SNX", value: "$432.80" },
        { id: "uniswap", name: "Uniswap", icon: "/icons/uniswap.svg", rewards: "12 UNI", value: "$98.76" },
    ];

    const [selectedProtocols, setSelectedProtocols] = useState<string[]>([]);
    const [customProtocol, setCustomProtocol] = useState("");
    const [claimType, setClaimType] = useState<string>("schedule");
    const [threshold, setThreshold] = useState<string>("100");
    const [schedule, setSchedule] = useState<string>("weekly");
    const [reinvest, setReinvest] = useState<boolean>(false);
    const [reinvestProtocol, setReinvestProtocol] = useState<string>("aave");
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [gasLevel, setGasLevel] = useState(50);
    const [notifyEmail, setNotifyEmail] = useState(true);
    const [notifyApp, setNotifyApp] = useState(true);

    const toggleProtocol = (id: string) => {
        if (selectedProtocols.includes(id)) {
            setSelectedProtocols(selectedProtocols.filter(p => p !== id));
        } else {
            setSelectedProtocols([...selectedProtocols, id]);
        }
    };

    const isValid = selectedProtocols.length > 0 || customProtocol;

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">
                    Configure Rewards Claiming
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    Set up automated claiming of protocol rewards and airdrops
                </p>

                {/* Protocol Selection */}
                <div className="space-y-4 mb-6">
                    <h4 className="text-md font-medium text-slate-800 dark:text-slate-200 flex items-center justify-between">
                        <span>Select Protocols with Rewards</span>
                        <Badge variant="outline" className="bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-300">
                            Available: 5
                        </Badge>
                    </h4>
                    <div className="space-y-3">
                        {protocols.map((protocol) => (
                            <motion.div
                                key={protocol.id}
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                onClick={() => toggleProtocol(protocol.id)}
                                className={cn(
                                    "border rounded-lg p-3 cursor-pointer transition-all",
                                    selectedProtocols.includes(protocol.id)
                                        ? "border-orange-500 dark:border-orange-400 bg-orange-50 dark:bg-orange-900/20"
                                        : "border-slate-200 dark:border-slate-800 hover:border-orange-200 dark:hover:border-orange-900"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={protocol.icon} alt={protocol.name} />
                                            <AvatarFallback className="bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-200 text-xs">
                                                {protocol.name.substring(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-slate-900 dark:text-slate-100">{protocol.name}</h4>
                                        <div className="flex gap-4 mt-1">
                                            <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                                                <BellRing className="h-3 w-3 mr-1" />
                                                <span>{protocol.rewards}</span>
                                            </div>
                                            <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                                                <DollarSign className="h-3 w-3 mr-1" />
                                                <span>{protocol.value}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="ml-auto">
                                        {selectedProtocols.includes(protocol.id) ? (
                                            <div className="h-5 w-5 rounded-full bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center">
                                                <Check className="h-3 w-3 text-orange-600 dark:text-orange-400" />
                                            </div>
                                        ) : (
                                            <div className="h-5 w-5 rounded-full border-2 border-slate-200 dark:border-slate-700"></div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}

                        <div className="relative">
                            <Input
                                placeholder="Enter custom protocol address (0x...)"
                                value={customProtocol}
                                onChange={(e) => setCustomProtocol(e.target.value)}
                                className={cn(
                                    "pl-10",
                                    customProtocol && "border-orange-500 dark:border-orange-400"
                                )}
                            />
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                            {customProtocol && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6"
                                    onClick={() => setCustomProtocol("")}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Claim Type */}
                <div className="space-y-3 mb-6">
                    <h4 className="text-md font-medium text-slate-800 dark:text-slate-200">
                        When to Claim Rewards
                    </h4>
                    <RadioGroup value={claimType} onValueChange={setClaimType} className="space-y-2">
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="schedule" id="claim-schedule" />
                            <label htmlFor="claim-schedule" className="text-sm text-slate-700 dark:text-slate-300">
                                Claim on a regular schedule
                            </label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="threshold" id="claim-threshold" />
                            <label htmlFor="claim-threshold" className="text-sm text-slate-700 dark:text-slate-300">
                                Claim when rewards reach a value threshold
                            </label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="asap" id="claim-asap" />
                            <label htmlFor="claim-asap" className="text-sm text-slate-700 dark:text-slate-300">
                                Claim as soon as available
                            </label>
                        </div>
                    </RadioGroup>

                    {claimType === 'schedule' && (
                        <div className="mt-4 space-y-4">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-orange-500 dark:text-orange-400" />
                                <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Claim Schedule
                                </h5>
                            </div>

                            <div className="space-y-3">
                                <Select value={schedule} onValueChange={setSchedule}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select schedule" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="daily">Daily</SelectItem>
                                        <SelectItem value="weekly">Weekly</SelectItem>
                                        <SelectItem value="biweekly">Bi-weekly</SelectItem>
                                        <SelectItem value="monthly">Monthly</SelectItem>
                                    </SelectContent>
                                </Select>

                                {schedule === 'weekly' && (
                                    <Select defaultValue="monday">
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select day" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="monday">Monday</SelectItem>
                                            <SelectItem value="tuesday">Tuesday</SelectItem>
                                            <SelectItem value="wednesday">Wednesday</SelectItem>
                                            <SelectItem value="thursday">Thursday</SelectItem>
                                            <SelectItem value="friday">Friday</SelectItem>
                                            <SelectItem value="saturday">Saturday</SelectItem>
                                            <SelectItem value="sunday">Sunday</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}

                                {schedule === 'monthly' && (
                                    <Select defaultValue="1">
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select day of month" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Array.from({ length: 28 }, (_, i) => (
                                                <SelectItem key={i} value={(i + 1).toString()}>
                                                    {i + 1}{i === 0 ? 'st' : i === 1 ? 'nd' : i === 2 ? 'rd' : 'th'}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            </div>
                        </div>
                    )}

                    {claimType === 'threshold' && (
                        <div className="mt-4 space-y-4">
                            <div className="flex items-center gap-2">
                                <BarChart className="h-5 w-5 text-orange-500 dark:text-orange-400" />
                                <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Value Threshold
                                </h5>
                            </div>

                            <div className="space-y-3">
                                <div className="relative">
                                    <Input
                                        type="text"
                                        value={threshold}
                                        onChange={(e) => setThreshold(e.target.value)}
                                        className="pl-10"
                                    />
                                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                </div>

                                <div className="text-xs text-slate-500 dark:text-slate-400">
                                    Claim rewards when their total USD value reaches ${threshold}
                                </div>
                            </div>
                        </div>
                    )}

                    {claimType === 'asap' && (
                        <div className="mt-4 space-y-4">
                            <div className="flex items-center gap-2">
                                <Timer className="h-5 w-5 text-orange-500 dark:text-orange-400" />
                                <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Claim Immediately
                                </h5>
                            </div>

                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-100 dark:border-blue-800/50 text-sm text-blue-700 dark:text-blue-300">
                                <div className="flex gap-2 items-start">
                                    <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                    <p>
                                        The system will automatically claim rewards as soon as they become available.
                                        Note that frequent claiming may result in higher gas costs.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Auto-Reinvest */}
                <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between">
                        <h4 className="text-md font-medium text-slate-800 dark:text-slate-200">
                            Auto-Reinvest Rewards
                        </h4>
                        <Switch
                            checked={reinvest}
                            onCheckedChange={setReinvest}
                        />
                    </div>

                    {reinvest && (
                        <div className="mt-3 space-y-3">
                            <label className="text-sm text-slate-600 dark:text-slate-400">
                                Select protocol to reinvest rewards
                            </label>

                            <Select value={reinvestProtocol} onValueChange={setReinvestProtocol}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select protocol" />
                                </SelectTrigger>
                                <SelectContent>
                                    {protocols.map(p => (
                                        <SelectItem key={p.id} value={p.id}>
                                            {p.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 border border-orange-100 dark:border-orange-800/50 text-sm text-orange-700 dark:text-orange-300">
                                <div className="flex gap-2 items-start">
                                    <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                    <p>
                                        Claimed rewards will be automatically swapped to the protocol's native token
                                        and staked/deposited for additional yield.
                                    </p>
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