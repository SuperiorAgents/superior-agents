"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
    AlertCircle,
    Settings,
    Moon,
    Zap,
    BarChart,
    ChevronRight,
    Check,
    Shield,
    CloudOff,
    Bell,
    InfoIcon
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.3,
        },
    },
};

const AutomationSettings: React.FC = () => {
    const { toast } = useToast();

    // State for different settings
    const [executionMode, setExecutionMode] = useState("standard");
    const [executionMinGwei, setExecutionMinGwei] = useState(10);
    const [executionMaxGwei, setExecutionMaxGwei] = useState(60);
    const [offChainMonitoring, setOffChainMonitoring] = useState(true);
    const [dataBackup, setDataBackup] = useState(true);
    const [offlineMode, setOfflineMode] = useState(false);
    const [automationSchedule, setAutomationSchedule] = useState("always");
    const [customScheduleStart, setCustomScheduleStart] = useState("22:00");
    const [customScheduleEnd, setCustomScheduleEnd] = useState("08:00");
    const [failedRetryLimit, setFailedRetryLimit] = useState(3);
    const [failedRetryDelay, setFailedRetryDelay] = useState(15);

    // Handle saving settings
    const handleSaveSettings = () => {
        toast({
            title: "Automation settings saved",
            description: "Your automation preferences have been updated successfully.",
            variant: "default",
        });
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
        >
            {/* General Automation Settings */}
            <motion.div variants={itemVariants}>
                <Card className=' dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg'>
                    <CardHeader>
                        <CardTitle>Automation Settings</CardTitle>
                        <CardDescription>
                            Configure general settings for automated tasks
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Execution Mode */}
                        <div>
                            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-3">Execution Mode</h3>
                            <RadioGroup
                                value={executionMode}
                                onValueChange={setExecutionMode}
                                className="grid grid-cols-1 md:grid-cols-3 gap-4"
                            >
                                <div className={`p-4 border rounded-lg cursor-pointer ${executionMode === 'economic'
                                    ? 'border-blue-300 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20'
                                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                    }`}>
                                    <RadioGroupItem value="economic" id="economic" className="sr-only" />
                                    <Label
                                        htmlFor="economic"
                                        className="flex flex-col cursor-pointer"
                                    >
                                        <div className="flex items-center mb-2">
                                            <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 mr-3">
                                                <Moon className="h-5 w-5" />
                                            </div>
                                            <span className="font-medium text-slate-900 dark:text-white">Economic</span>
                                        </div>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">
                                            Prioritize gas savings over speed. Executes during low gas periods, may take longer.
                                        </p>
                                    </Label>
                                </div>

                                <div className={`p-4 border rounded-lg cursor-pointer ${executionMode === 'standard'
                                    ? 'border-blue-300 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20'
                                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                    }`}>
                                    <RadioGroupItem value="standard" id="standard" className="sr-only" />
                                    <Label
                                        htmlFor="standard"
                                        className="flex flex-col cursor-pointer"
                                    >
                                        <div className="flex items-center mb-2">
                                            <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 mr-3">
                                                <Settings className="h-5 w-5" />
                                            </div>
                                            <span className="font-medium text-slate-900 dark:text-white">Standard</span>
                                        </div>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">
                                            Balanced execution with moderate gas optimization. Recommended for most users.
                                        </p>
                                    </Label>
                                </div>

                                <div className={`p-4 border rounded-lg cursor-pointer ${executionMode === 'priority'
                                    ? 'border-blue-300 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20'
                                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                    }`}>
                                    <RadioGroupItem value="priority" id="priority" className="sr-only" />
                                    <Label
                                        htmlFor="priority"
                                        className="flex flex-col cursor-pointer"
                                    >
                                        <div className="flex items-center mb-2">
                                            <div className="p-2 rounded-full bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 mr-3">
                                                <Zap className="h-5 w-5" />
                                            </div>
                                            <span className="font-medium text-slate-900 dark:text-white">Priority</span>
                                        </div>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">
                                            Fastest execution with higher gas costs. Best for time-sensitive tasks.
                                        </p>
                                    </Label>
                                </div>
                            </RadioGroup>

                            {/* Gas Price Range Slider */}
                            {executionMode === 'standard' && (
                                <div className="mt-6">
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="text-base font-medium text-slate-900 dark:text-white">Gas Price Range</h4>
                                        <Badge>
                                            {executionMinGwei} - {executionMaxGwei} Gwei
                                        </Badge>
                                    </div>
                                    <Slider
                                        value={[executionMinGwei, executionMaxGwei]}
                                        min={1}
                                        max={200}
                                        step={1}
                                        onValueChange={(value) => {
                                            setExecutionMinGwei(value[0]);
                                            setExecutionMaxGwei(value[1]);
                                        }}
                                        className="mt-2"
                                    />
                                    <div className="flex justify-between mt-1 text-xs text-slate-500 dark:text-slate-400">
                                        <span>Eco (1 Gwei)</span>
                                        <span>Standard (30 Gwei)</span>
                                        <span>Fast (100+ Gwei)</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <Separator />

                        {/* Execution Schedule */}
                        <div>
                            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-3">Execution Schedule</h3>
                            <RadioGroup
                                value={automationSchedule}
                                onValueChange={setAutomationSchedule}
                                className="space-y-4"
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="always" id="always" />
                                    <Label htmlFor="always">Always active (24/7)</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="custom" id="custom" />
                                    <Label htmlFor="custom">Custom schedule</Label>
                                </div>
                            </RadioGroup>

                            {automationSchedule === 'custom' && (
                                <div className="mt-4 p-4 border border-slate-200 dark:border-slate-800 rounded-lg">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="schedule-start">Start Time</Label>
                                            <Input
                                                id="schedule-start"
                                                type="time"
                                                value={customScheduleStart}
                                                onChange={(e) => setCustomScheduleStart(e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="schedule-end">End Time</Label>
                                            <Input
                                                id="schedule-end"
                                                type="time"
                                                value={customScheduleEnd}
                                                onChange={(e) => setCustomScheduleEnd(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center mt-4 text-sm text-blue-600 dark:text-blue-400">
                                        <InfoIcon className="h-4 w-4 mr-2" />
                                        {customScheduleStart < customScheduleEnd ? (
                                            <p>Tasks will only execute between {customScheduleStart} and {customScheduleEnd}</p>
                                        ) : (
                                            <p>Tasks will execute between {customScheduleStart} and {customScheduleEnd} (overnight)</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <Separator />

                        {/* Retry Settings */}
                        <div>
                            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-3">Retry Settings</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="retry-limit">Failed Task Retry Limit</Label>
                                    <Select
                                        value={failedRetryLimit.toString()}
                                        onValueChange={(value) => setFailedRetryLimit(parseInt(value))}
                                    >
                                        <SelectTrigger id="retry-limit">
                                            <SelectValue placeholder="Select retry limit" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="0">No retries</SelectItem>
                                            <SelectItem value="1">1 retry</SelectItem>
                                            <SelectItem value="3">3 retries</SelectItem>
                                            <SelectItem value="5">5 retries</SelectItem>
                                            <SelectItem value="10">10 retries</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Number of times MetaPilot will retry failed tasks
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="retry-delay">Retry Delay (minutes)</Label>
                                    <Select
                                        value={failedRetryDelay.toString()}
                                        onValueChange={(value) => setFailedRetryDelay(parseInt(value))}
                                    >
                                        <SelectTrigger id="retry-delay">
                                            <SelectValue placeholder="Select retry delay" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="5">5 minutes</SelectItem>
                                            <SelectItem value="15">15 minutes</SelectItem>
                                            <SelectItem value="30">30 minutes</SelectItem>
                                            <SelectItem value="60">1 hour</SelectItem>
                                            <SelectItem value="360">6 hours</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Wait time between retry attempts
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <Button variant="outline">Reset to Default</Button>
                        <Button
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                            onClick={handleSaveSettings}
                        >
                            Save Changes
                        </Button>
                    </CardFooter>
                </Card>
            </motion.div>

            {/* Advanced Options */}
            <motion.div variants={itemVariants}>
                <Card className=' dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg'>
                    <CardHeader>
                        <CardTitle>Advanced Options</CardTitle>
                        <CardDescription>
                            Configure additional automation settings
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="offchain-monitoring" className="text-base">Off-chain Monitoring</Label>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">
                                            Monitor off-chain data sources (e.g., Snapshot, prices)
                                        </p>
                                    </div>
                                    <Switch
                                        id="offchain-monitoring"
                                        checked={offChainMonitoring}
                                        onCheckedChange={setOffChainMonitoring}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="data-backup" className="text-base">Data Backup</Label>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">
                                            Store task configuration backups in cloud
                                        </p>
                                    </div>
                                    <Switch
                                        id="data-backup"
                                        checked={dataBackup}
                                        onCheckedChange={setDataBackup}
                                    />
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="offline-mode" className="text-base">Offline Mode</Label>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">
                                            Pause all automated tasks temporarily
                                        </p>
                                    </div>
                                    <Switch
                                        id="offline-mode"
                                        checked={offlineMode}
                                        onCheckedChange={setOfflineMode}
                                    />
                                </div>

                                <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-lg">
                                    <div className="flex items-center mb-2">
                                        <BarChart className="h-5 w-5 text-slate-600 dark:text-slate-400 mr-2" />
                                        <h4 className="font-medium text-slate-900 dark:text-white">
                                            Analytics & Reporting
                                        </h4>
                                    </div>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                                        Configure data collection for performance metrics
                                    </p>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full"
                                    >
                                        Configure Analytics
                                        <ChevronRight className="h-4 w-4 ml-2" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {offlineMode && (
                            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg flex items-start space-x-3 mt-2">
                                <CloudOff className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                                <div>
                                    <h4 className="font-medium text-orange-700 dark:text-orange-300">
                                        Offline Mode Enabled
                                    </h4>
                                    <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
                                        All automated tasks are currently paused. Your automation rules remain saved but no actions will be executed until offline mode is disabled.
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <Tabs defaultValue="network">
                                <TabsList className="mb-4">
                                    <TabsTrigger value="network">Network Settings</TabsTrigger>
                                    <TabsTrigger value="security">Security</TabsTrigger>
                                    <TabsTrigger value="timeout">Timeouts</TabsTrigger>
                                </TabsList>

                                <TabsContent value="network" className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="rpc-url">Custom RPC URL (Optional)</Label>
                                            <Input id="rpc-url" placeholder="https://your-rpc-endpoint.com" />
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                Use your own node instead of default provider
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="api-frequency">API Call Frequency</Label>
                                            <Select defaultValue="standard">
                                                <SelectTrigger id="api-frequency">
                                                    <SelectValue placeholder="Select frequency" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="low">Low (5 minute intervals)</SelectItem>
                                                    <SelectItem value="standard">Standard (1 minute intervals)</SelectItem>
                                                    <SelectItem value="high">High (15 second intervals)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                How often to check for conditions
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label htmlFor="fallback-provider" className="text-base">Use Fallback Providers</Label>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                                Automatically switch to backup providers if primary fails
                                            </p>
                                        </div>
                                        <Switch id="fallback-provider" defaultChecked />
                                    </div>
                                </TabsContent>

                                <TabsContent value="security" className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label htmlFor="transaction-signing" className="text-base">Enhanced Transaction Signing</Label>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                                Additional verification before signing high-value transactions
                                            </p>
                                        </div>
                                        <Switch id="transaction-signing" defaultChecked />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label htmlFor="approve-threshold" className="text-base">Approval Value Threshold</Label>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                                Request approval for transactions above this value
                                            </p>
                                        </div>
                                        <div className="w-32">
                                            <Input id="approve-threshold" type="number" defaultValue="1.5" min="0" step="0.1" />
                                        </div>
                                    </div>

                                    <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-lg">
                                        <div className="flex items-center mb-2">
                                            <Shield className="h-5 w-5 text-slate-600 dark:text-slate-400 mr-2" />
                                            <h4 className="font-medium text-slate-900 dark:text-white">
                                                Session Key Management
                                            </h4>
                                        </div>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                                            Configure permissions and expiration for session keys
                                        </p>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full"
                                        >
                                            Manage Session Keys
                                            <ChevronRight className="h-4 w-4 ml-2" />
                                        </Button>
                                    </div>
                                </TabsContent>

                                <TabsContent value="timeout" className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="transaction-timeout">Transaction Timeout (seconds)</Label>
                                            <Input id="transaction-timeout" type="number" defaultValue="60" min="10" />
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                Max wait time for transaction confirmation
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="api-timeout">API Request Timeout (seconds)</Label>
                                            <Input id="api-timeout" type="number" defaultValue="10" min="1" />
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                Max wait time for API responses
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label htmlFor="pending-cleanup" className="text-base">Auto-cancel Pending Transactions</Label>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                                Cancel stuck transactions after timeout
                                            </p>
                                        </div>
                                        <Switch id="pending-cleanup" defaultChecked />
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end">
                        <Button
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                            onClick={handleSaveSettings}
                        >
                            Save Advanced Settings
                        </Button>
                    </CardFooter>
                </Card>
            </motion.div>

            {/* Notification Thresholds */}
            <motion.div variants={itemVariants}>
                <Card className=' dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg'>
                    <CardHeader>
                        <CardTitle>Notification Thresholds</CardTitle>
                        <CardDescription>
                            Configure when you receive notifications for automated tasks
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-lg">
                                <div className="flex items-center mb-3">
                                    <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 mr-2">
                                        <Bell className="h-5 w-5" />
                                    </div>
                                    <h3 className="font-medium text-slate-900 dark:text-white">
                                        Task Execution
                                    </h3>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="notify-success" className="text-sm">Successful Executions</Label>
                                        <Switch id="notify-success" defaultChecked />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="notify-failure" className="text-sm">Failed Executions</Label>
                                        <Switch id="notify-failure" defaultChecked />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="notify-pending" className="text-sm">Pending Executions</Label>
                                        <Switch id="notify-pending" />
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-lg">
                                <div className="flex items-center mb-3">
                                    <div className="p-2 rounded-full bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 mr-2">
                                        <AlertCircle className="h-5 w-5" />
                                    </div>
                                    <h3 className="font-medium text-slate-900 dark:text-white">
                                        System Alerts
                                    </h3>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="notify-gas" className="text-sm">High Gas Prices</Label>
                                        <Switch id="notify-gas" defaultChecked />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="notify-wallet" className="text-sm">Low Wallet Balance</Label>
                                        <Switch id="notify-wallet" defaultChecked />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="notify-system" className="text-sm">System Status Updates</Label>
                                        <Switch id="notify-system" defaultChecked />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-medium text-slate-900 dark:text-white">Value Thresholds</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <div className="flex justify-between mb-2">
                                        <Label htmlFor="high-value">High-Value Transaction Threshold (ETH)</Label>
                                        <Badge>0.5 ETH</Badge>
                                    </div>
                                    <Slider
                                        id="high-value"
                                        defaultValue={[0.5]}
                                        max={5}
                                        step={0.1}
                                        className="mt-2"
                                    />
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Notify for transactions exceeding this value
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between mb-2">
                                        <Label htmlFor="low-balance">Low Balance Warning Threshold (ETH)</Label>
                                        <Badge>0.1 ETH</Badge>
                                    </div>
                                    <Slider
                                        id="low-balance"
                                        defaultValue={[0.1]}
                                        max={1}
                                        step={0.01}
                                        className="mt-2"
                                    />
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Notify when wallet balance falls below this value
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-green-50 dark:bg-green-900/10 rounded-lg p-4 border border-green-100 dark:border-green-900">
                            <div className="flex space-x-3">
                                <Check className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-medium text-green-700 dark:text-green-300">Important Notifications Cannot Be Disabled</h4>
                                    <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                                        Critical security alerts and high-risk transactions will always generate notifications regardless of your settings.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <Button variant="outline">Reset to Default</Button>
                        <Button
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                            onClick={handleSaveSettings}
                        >
                            Save Notification Settings
                        </Button>
                    </CardFooter>
                </Card>
            </motion.div>
        </motion.div>
    );
};

export default AutomationSettings;