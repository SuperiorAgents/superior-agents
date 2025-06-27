// SecurityPage.tsx
"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
    AlertTriangle,
    ArrowRight,
    Check,
    Copy,
    Eye,
    EyeOff,
    Key,
    Lock,
    RefreshCw,
    Shield,
    ShieldAlert,
    ShieldCheck,
    Smartphone,
    Timer,
    Wallet
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.3 },
    },
};

interface DeviceData {
    id: string;
    name: string;
    lastActive: Date;
    browser: string;
    ipAddress: string;
    location: string;
    trusted: boolean;
    current: boolean;
}

// Mock connected devices
const connectedDevices: DeviceData[] = [
    {
        id: "device-1",
        name: "MacBook Pro",
        lastActive: new Date(),
        browser: "Chrome 125.0",
        ipAddress: "192.168.1.45",
        location: "New York, USA",
        trusted: true,
        current: true
    },
    {
        id: "device-2",
        name: "iPhone 15 Pro",
        lastActive: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
        browser: "Safari 17.4",
        ipAddress: "86.145.212.98",
        location: "New York, USA",
        trusted: true,
        current: false
    },
    {
        id: "device-3",
        name: "Windows PC",
        lastActive: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
        browser: "Firefox 124.0",
        ipAddress: "104.28.42.153",
        location: "Boston, USA",
        trusted: false,
        current: false
    }
];

const SecurityPage: React.FC = () => {
    const [showBackupCode, setShowBackupCode] = useState(false);
    const [is2FAEnabled, setIs2FAEnabled] = useState(true);
    const [isSessionKeyExpiration, setIsSessionKeyExpiration] = useState(true);
    const [isSpendingLimits, setIsSpendingLimits] = useState(true);
    const [isAllowlist, setIsAllowlist] = useState(false);
    const [isEmailAlerts, setIsEmailAlerts] = useState(true);
    const { toast } = useToast();

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({
            title: "Copied to clipboard",
            description: "The backup code has been copied to your clipboard.",
        });
    };

    const regenerateBackupCodes = () => {
        toast({
            title: "Backup codes regenerated",
            description: "Your new backup codes have been generated. Make sure to save them securely.",
        });
    };

    const revokeDevice = (deviceId: string) => {
        toast({
            title: "Device access revoked",
            description: "The device has been revoked and can no longer access your account.",
        });
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
        >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                        Security Settings
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
                        Manage your account security and authorized devices
                    </p>
                </div>
            </div>

            {/* Security Score */}
            <motion.div variants={itemVariants}>
                <Card className="dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg">
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row gap-6 items-center">
                            <div className="relative h-36 w-36 flex-shrink-0">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-center">
                                        <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">85%</span>
                                        <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">Security Score</div>
                                    </div>
                                </div>
                                {/* SVG circle progress */}
                                <svg className="transform -rotate-90 h-36 w-36" viewBox="0 0 100 100">
                                    <circle
                                        cx="50"
                                        cy="50"
                                        r="45"
                                        fill="none"
                                        stroke="#e2e8f0"
                                        strokeWidth="10"
                                        className="dark:stroke-slate-700"
                                    />
                                    <circle
                                        cx="50"
                                        cy="50"
                                        r="45"
                                        fill="none"
                                        stroke="url(#gradient)"
                                        strokeWidth="10"
                                        strokeDasharray="282.7"
                                        strokeDashoffset="42.4" // 282.7 * (1 - 0.85)
                                        strokeLinecap="round"
                                    />
                                    <defs>
                                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#3b82f6" />
                                            <stop offset="100%" stopColor="#6366f1" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                            </div>

                            <div className="flex-1 space-y-3">
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                                    Your account is well protected
                                </h3>
                                <p className="text-slate-600 dark:text-slate-400">
                                    You've enabled most security features, but there's still room for improvement.
                                </p>

                                <div className="space-y-3 pt-2">
                                    <div className="flex items-center gap-2">
                                        <Check className="h-5 w-5 text-green-500" />
                                        <span className="text-sm text-slate-700 dark:text-slate-300">2FA Authentication enabled</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Check className="h-5 w-5 text-green-500" />
                                        <span className="text-sm text-slate-700 dark:text-slate-300">Session key expiration set</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Check className="h-5 w-5 text-green-500" />
                                        <span className="text-sm text-slate-700 dark:text-slate-300">Spending limits configured</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <AlertTriangle className="h-5 w-5 text-amber-500" />
                                        <span className="text-sm text-slate-700 dark:text-slate-300">Contract allowlist not configured</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Account Security */}
                    <motion.div variants={itemVariants}>
                        <Card className="dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Lock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    Account Security
                                </CardTitle>
                                <CardDescription>
                                    Configure your authentication and account protection settings
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="space-y-5">
                                {/* 2FA Authentication */}
                                <div className="flex flex-col sm:flex-row justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
                                    <div>
                                        <h3 className="font-medium text-slate-900 dark:text-white mb-1">
                                            Two-Factor Authentication (2FA)
                                        </h3>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">
                                            Add an extra layer of security by requiring a verification code when signing in.
                                        </p>
                                    </div>
                                    <div className="flex items-center">
                                        <Switch
                                            checked={is2FAEnabled}
                                            onCheckedChange={setIs2FAEnabled}
                                            id="2fa-toggle"
                                        />
                                    </div>
                                </div>

                                {/* Backup Codes */}
                                <div className="pb-5 border-b border-slate-200 dark:border-slate-800">
                                    <div className="flex flex-col sm:flex-row justify-between gap-4 mb-3">
                                        <div>
                                            <h3 className="font-medium text-slate-900 dark:text-white mb-1">
                                                Backup Recovery Codes
                                            </h3>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                                Use these codes to access your account if you lose your 2FA device.
                                            </p>
                                        </div>
                                        <div>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="gap-2 dark:bg-slate-800/50"
                                                onClick={regenerateBackupCodes}
                                            >
                                                <RefreshCw className="h-4 w-4" />
                                                Regenerate
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="relative">
                                        <Input
                                            readOnly
                                            value={
                                                showBackupCode
                                                    ? "ABCD-EFGH-IJKL-MNOP-QRST-UVWX-YZ12-3456"
                                                    : "••••-••••-••••-••••-••••-••••-••••-••••"
                                            }
                                            className="font-mono pr-20 bg-slate-50 dark:bg-slate-800/50"
                                        />
                                        <div className="absolute inset-y-0 right-0 flex items-center gap-1 pr-3">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => setShowBackupCode(!showBackupCode)}
                                            >
                                                {showBackupCode ? (
                                                    <EyeOff className="h-4 w-4" />
                                                ) : (
                                                    <Eye className="h-4 w-4" />
                                                )}
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => handleCopy("ABCD-EFGH-IJKL-MNOP-QRST-UVWX-YZ12-3456")}
                                            >
                                                <Copy className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 flex items-start gap-1">
                                        <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                                        Keep these codes in a safe place. You won't be able to view them again after leaving this page.
                                    </p>
                                </div>

                                {/* Password Change */}
                                <div className="pb-5 border-b border-slate-200 dark:border-slate-800">
                                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                                        <div>
                                            <h3 className="font-medium text-slate-900 dark:text-white mb-1">
                                                Change Password
                                            </h3>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                                It's recommended to change your password periodically.
                                            </p>
                                        </div>
                                        <div>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="gap-2 dark:bg-slate-800/50"
                                            >
                                                Change Password
                                                <ArrowRight className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                {/* Email Recovery */}
                                <div>
                                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                                        <div>
                                            <h3 className="font-medium text-slate-900 dark:text-white mb-1">
                                                Recovery Email
                                            </h3>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                                Your account recovery email is alex@example.com
                                            </p>
                                        </div>
                                        <div>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="gap-2 dark:bg-slate-800/50"
                                            >
                                                Update Email
                                                <ArrowRight className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Wallet Security */}
                    <motion.div variants={itemVariants}>
                        <Card className="dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Wallet className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    Wallet Security
                                </CardTitle>
                                <CardDescription>
                                    Configure security settings for your connected wallets
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="space-y-5">
                                {/* Session Key Expiration */}
                                <div className="flex flex-col sm:flex-row justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
                                    <div>
                                        <h3 className="font-medium text-slate-900 dark:text-white mb-1">
                                            Session Key Expiration
                                        </h3>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">
                                            Automatically expire session keys after 7 days of inactivity.
                                        </p>
                                    </div>
                                    <div className="flex items-center">
                                        <Switch
                                            checked={isSessionKeyExpiration}
                                            onCheckedChange={setIsSessionKeyExpiration}
                                            id="session-key-toggle"
                                        />
                                    </div>
                                </div>

                                {/* Spending Limits */}
                                <div className="flex flex-col sm:flex-row justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
                                    <div>
                                        <h3 className="font-medium text-slate-900 dark:text-white mb-1">
                                            Spending Limits
                                        </h3>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">
                                            Limit the maximum amount that can be spent in a single transaction.
                                        </p>
                                    </div>
                                    <div className="flex items-center">
                                        <Switch
                                            checked={isSpendingLimits}
                                            onCheckedChange={setIsSpendingLimits}
                                            id="spending-limits-toggle"
                                        />
                                    </div>
                                </div>

                                {/* Contract Allowlist */}
                                <div className="flex flex-col sm:flex-row justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
                                    <div>
                                        <h3 className="font-medium text-slate-900 dark:text-white mb-1">
                                            Contract Allowlist
                                        </h3>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">
                                            Only allow interactions with approved smart contracts.
                                        </p>
                                    </div>
                                    <div className="flex items-center">
                                        <Switch
                                            checked={isAllowlist}
                                            onCheckedChange={setIsAllowlist}
                                            id="allowlist-toggle"
                                        />
                                    </div>
                                </div>

                                {/* Email Alerts */}
                                <div className="flex flex-col sm:flex-row justify-between gap-4">
                                    <div>
                                        <h3 className="font-medium text-slate-900 dark:text-white mb-1">
                                            Email Alerts
                                        </h3>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">
                                            Receive email notifications for high-value transactions.
                                        </p>
                                    </div>
                                    <div className="flex items-center">
                                        <Switch
                                            checked={isEmailAlerts}
                                            onCheckedChange={setIsEmailAlerts}
                                            id="email-alerts-toggle"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* Connected Devices */}
                <motion.div variants={itemVariants} className="space-y-6">
                    <Card className="dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Smartphone className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                Connected Devices
                            </CardTitle>
                            <CardDescription>
                                Devices currently signed in to your account
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            {connectedDevices.map((device) => (
                                <div
                                    key={device.id}
                                    className={`p-4 rounded-lg border ${device.current
                                            ? 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20'
                                            : 'border-slate-200 dark:border-slate-800'
                                        }`}
                                >
                                    <div className="flex justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                                <Smartphone className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-medium text-slate-900 dark:text-white">{device.name}</h4>
                                                    {device.current && (
                                                        <Badge variant="outline" className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800">
                                                            Current
                                                        </Badge>
                                                    )}
                                                    {device.trusted && (
                                                        <Badge variant="outline" className="text-xs bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800">
                                                            Trusted
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                                                    {device.browser} • {device.location}
                                                </p>
                                            </div>
                                        </div>

                                        {!device.current && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 text-red-600 hover:text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                onClick={() => revokeDevice(device.id)}
                                            >
                                                Revoke
                                            </Button>
                                        )}
                                    </div>

                                    <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                                        <div className="flex justify-between">
                                            <span>IP Address: {device.ipAddress}</span>
                                            <span>Last active: {device.current ? 'Now' : '12h ago'}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <div className="pt-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full mt-2 dark:bg-slate-800/50"
                                >
                                    Revoke All Other Devices
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Security Activity */}
                    <Card className="dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ShieldAlert className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                Recent Security Activity
                            </CardTitle>
                            <CardDescription>
                                Recent security events on your account
                            </CardDescription>
                        </CardHeader>

                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex gap-3">
                                    <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                                        <Key className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                                            Password changed
                                        </p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                            2 days ago • New York, USA
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                                        <ShieldCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                                            2FA enabled
                                        </p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                            1 week ago • New York, USA
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                                        <Smartphone className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                                            New device signed in
                                        </p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                            1 week ago • Boston, USA
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
                                        <Timer className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                                            Session key expiration enabled
                                        </p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                            2 weeks ago • New York, USA
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-full mt-4 text-blue-600 dark:text-blue-400"
                            >
                                View All Activity
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default SecurityPage;