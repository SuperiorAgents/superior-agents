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
    Lock,
    ShieldCheck,
    SmartphoneNfc,
    Key,
    Fingerprint,
    Clock,
    AlertCircle,
    MailCheck
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
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

const SecuritySettingsForm: React.FC = () => {
    const { toast } = useToast();

    // State for security settings
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
    const [loginNotifications, setLoginNotifications] = useState(true);
    const [autoLogout, setAutoLogout] = useState(false);
    const [autoLogoutTime, setAutoLogoutTime] = useState("30");
    const [securityKeyEnabled, setSecurityKeyEnabled] = useState(false);
    const [transactionConfirmation, setTransactionConfirmation] = useState(true);
    const [transactionConfirmationThreshold, setTransactionConfirmationThreshold] = useState("0.5");
    const [recoveryEmail, setRecoveryEmail] = useState("alex@backup-email.com");
    const [showSetupSecurityKey, setShowSetupSecurityKey] = useState(false);
    const [showTwoFactorQr, setShowTwoFactorQr] = useState(false);

    // Handle saving settings
    const handleSaveSettings = () => {
        toast({
            title: "Security settings saved",
            description: "Your security preferences have been updated successfully.",
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
            {/* Account Security */}
            <motion.div variants={itemVariants}>
                <Card className=' dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg'>
                    <CardHeader>
                        <CardTitle>Account Security</CardTitle>
                        <CardDescription>
                            Configure security settings to protect your account
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Two-Factor Authentication */}
                            <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-lg">
                                <div className="flex justify-between items-start">
                                    <div className="flex space-x-3">
                                        <div className={`p-2 rounded-full ${twoFactorEnabled
                                            ? 'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                                            }`}>
                                            <SmartphoneNfc className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-slate-900 dark:text-white">
                                                Two-Factor Authentication
                                            </h4>
                                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                                Require a verification code when signing in
                                            </p>
                                        </div>
                                    </div>
                                    <Switch
                                        checked={twoFactorEnabled}
                                        onCheckedChange={setTwoFactorEnabled}
                                    />
                                </div>

                                {twoFactorEnabled && (
                                    <div className="mt-4 space-y-4">
                                        {!showTwoFactorQr ? (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full"
                                                onClick={() => setShowTwoFactorQr(true)}
                                            >
                                                Configure 2FA App
                                            </Button>
                                        ) : (
                                            <div className="space-y-3">
                                                <div className="p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 flex justify-center">
                                                    <div className="h-32 w-32 bg-slate-100 dark:bg-slate-700 rounded flex items-center justify-center">
                                                        <QrCode className="h-24 w-24 text-slate-800 dark:text-slate-200" />
                                                    </div>
                                                </div>
                                                <div className="flex space-x-2">
                                                    <Input placeholder="Enter verification code" className="text-center" />
                                                    <Button
                                                        size="sm"
                                                        onClick={() => {
                                                            setShowTwoFactorQr(false);
                                                            toast({
                                                                title: "2FA configured",
                                                                description: "Two-factor authentication has been set up successfully.",
                                                                variant: "default",
                                                            });
                                                        }}
                                                    >
                                                        Verify
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Security Key */}
                            <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-lg">
                                <div className="flex justify-between items-start">
                                    <div className="flex space-x-3">
                                        <div className={`p-2 rounded-full ${securityKeyEnabled
                                            ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                                            }`}>
                                            <Key className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-slate-900 dark:text-white">
                                                Security Key
                                            </h4>
                                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                                Use a hardware security key for authentication
                                            </p>
                                        </div>
                                    </div>
                                    <Switch
                                        checked={securityKeyEnabled}
                                        onCheckedChange={(checked) => {
                                            if (checked) {
                                                setShowSetupSecurityKey(true);
                                            } else {
                                                setSecurityKeyEnabled(false);
                                            }
                                        }}
                                    />
                                </div>

                                {showSetupSecurityKey && (
                                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                        <h5 className="font-medium text-blue-700 dark:text-blue-300 mb-2">
                                            Set Up Security Key
                                        </h5>
                                        <p className="text-sm text-blue-600 dark:text-blue-400 mb-3">
                                            Connect your security key to your device and press the button below to register it.
                                        </p>
                                        <div className="flex space-x-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300"
                                                onClick={() => {
                                                    setShowSetupSecurityKey(false);
                                                    setSecurityKeyEnabled(false);
                                                }}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                size="sm"
                                                className="bg-blue-600 hover:bg-blue-700 text-white"
                                                onClick={() => {
                                                    setShowSetupSecurityKey(false);
                                                    setSecurityKeyEnabled(true);
                                                    toast({
                                                        title: "Security key registered",
                                                        description: "Your security key has been successfully registered.",
                                                        variant: "default",
                                                    });
                                                }}
                                            >
                                                Register Key
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <Separator />

                        {/* Session Security */}
                        <div>
                            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">
                                Session Security
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Login Notifications */}
                                <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-800 rounded-lg">
                                    <div className="flex space-x-3">
                                        <div className={`p-2 rounded-full ${loginNotifications
                                            ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                                            }`}>
                                            <MailCheck className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-slate-900 dark:text-white">
                                                Login Notifications
                                            </h4>
                                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                                Get notified of new login attempts
                                            </p>
                                        </div>
                                    </div>
                                    <Switch
                                        checked={loginNotifications}
                                        onCheckedChange={setLoginNotifications}
                                    />
                                </div>

                                {/* Auto Logout */}
                                <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-lg">
                                    <div className="flex justify-between items-start">
                                        <div className="flex space-x-3">
                                            <div className={`p-2 rounded-full ${autoLogout
                                                ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'
                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                                                }`}>
                                                <Clock className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-slate-900 dark:text-white">
                                                    Automatic Logout
                                                </h4>
                                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                                    Log out after period of inactivity
                                                </p>
                                            </div>
                                        </div>
                                        <Switch
                                            checked={autoLogout}
                                            onCheckedChange={setAutoLogout}
                                        />
                                    </div>

                                    {autoLogout && (
                                        <div className="mt-4 space-y-2">
                                            <Label htmlFor="auto-logout-time">Logout After</Label>
                                            <Select
                                                value={autoLogoutTime}
                                                onValueChange={setAutoLogoutTime}
                                            >
                                                <SelectTrigger id="auto-logout-time">
                                                    <SelectValue placeholder="Select time" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="15">15 minutes</SelectItem>
                                                    <SelectItem value="30">30 minutes</SelectItem>
                                                    <SelectItem value="60">1 hour</SelectItem>
                                                    <SelectItem value="120">2 hours</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Transaction Security */}
                        <div>
                            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">
                                Transaction Security
                            </h3>

                            <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-lg">
                                <div className="flex justify-between items-start">
                                    <div className="flex space-x-3">
                                        <div className={`p-2 rounded-full ${transactionConfirmation
                                            ? 'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                                            }`}>
                                            <Fingerprint className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-slate-900 dark:text-white">
                                                Transaction Confirmation
                                            </h4>
                                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                                Require additional verification for large transactions
                                            </p>
                                        </div>
                                    </div>
                                    <Switch
                                        checked={transactionConfirmation}
                                        onCheckedChange={setTransactionConfirmation}
                                    />
                                </div>

                                {transactionConfirmation && (
                                    <div className="mt-4 space-y-2">
                                        <div className="flex justify-between items-center">
                                            <Label htmlFor="transaction-threshold">Confirmation Threshold</Label>
                                            <Badge>{transactionConfirmationThreshold} ETH</Badge>
                                        </div>
                                        <Select
                                            value={transactionConfirmationThreshold}
                                            onValueChange={setTransactionConfirmationThreshold}
                                        >
                                            <SelectTrigger id="transaction-threshold">
                                                <SelectValue placeholder="Select threshold" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="0.1">0.1 ETH</SelectItem>
                                                <SelectItem value="0.5">0.5 ETH</SelectItem>
                                                <SelectItem value="1.0">1.0 ETH</SelectItem>
                                                <SelectItem value="5.0">5.0 ETH</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            Transactions exceeding this value will require additional confirmation
                                        </p>
                                    </div>
                                )}
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

            {/* Account Recovery */}
            <motion.div variants={itemVariants}>
                <Card className=' dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg'>
                    <CardHeader>
                        <CardTitle>Account Recovery</CardTitle>
                        <CardDescription>
                            Configure recovery options in case you lose access to your account
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="recovery-email">Recovery Email</Label>
                                <Input
                                    id="recovery-email"
                                    type="email"
                                    value={recoveryEmail}
                                    onChange={(e) => setRecoveryEmail(e.target.value)}
                                    placeholder="backup-email@example.com"
                                />
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    This email will be used for account recovery
                                </p>
                            </div>

                            <div className="flex items-end space-x-3">
                                <Button
                                    variant="outline"
                                    className="h-10 mb-6"
                                    onClick={() => {
                                        toast({
                                            title: "Verification email sent",
                                            description: "Please check your recovery email for verification.",
                                            variant: "default",
                                        });
                                    }}
                                >
                                    Verify Email
                                </Button>
                                <Badge variant="secondary" className="mb-6">Verified</Badge>
                            </div>
                        </div>

                        <div className="p-4 border border-orange-200 dark:border-orange-900/50 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                            <div className="flex space-x-3">
                                <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400 flex-shrink-0" />
                                <div>
                                    <h4 className="font-medium text-orange-700 dark:text-orange-300">
                                        Backup Your Recovery Codes
                                    </h4>
                                    <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
                                        Recovery codes can be used to access your account if you lose your two-factor authentication device.
                                    </p>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="mt-3 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300"
                                        onClick={() => {
                                            toast({
                                                title: "Recovery codes downloaded",
                                                description: "Store these codes in a secure location.",
                                                variant: "default",
                                            });
                                        }}
                                    >
                                        Download Recovery Codes
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end">
                        <Button
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                            onClick={() => {
                                toast({
                                    title: "Recovery settings saved",
                                    description: "Your account recovery options have been updated.",
                                    variant: "default",
                                });
                            }}
                        >
                            Save Recovery Settings
                        </Button>
                    </CardFooter>
                </Card>
            </motion.div>

            {/* Session Management */}
            <motion.div variants={itemVariants}>
                <Card className=' dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg'>
                    <CardHeader>
                        <CardTitle>Active Sessions</CardTitle>
                        <CardDescription>
                            Manage your active login sessions
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="p-4 border border-green-200 dark:border-green-900/50 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                <div className="flex justify-between">
                                    <div className="flex space-x-3">
                                        <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400">
                                            <ShieldCheck className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-green-700 dark:text-green-300">
                                                Current Session (Chrome on macOS)
                                            </h4>
                                            <p className="text-sm text-green-600 dark:text-green-400">
                                                Started: 2 hours ago · IP: 192.168.1.1 · Location: New York, USA
                                            </p>
                                        </div>
                                    </div>
                                    <Badge variant="secondary">Active</Badge>
                                </div>
                            </div>

                            <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-lg">
                                <div className="flex justify-between">
                                    <div className="flex space-x-3">
                                        <div className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                            <SmartphoneNfc className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-slate-900 dark:text-white">
                                                Mobile App (iOS)
                                            </h4>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                                Started: 3 days ago · IP: 172.16.254.1 · Location: New York, USA
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                                        onClick={() => {
                                            toast({
                                                title: "Session terminated",
                                                description: "The mobile session has been logged out.",
                                                variant: "default",
                                            });
                                        }}
                                    >
                                        Terminate
                                    </Button>
                                </div>
                            </div>

                            <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-lg">
                                <div className="flex justify-between">
                                    <div className="flex space-x-3">
                                        <div className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                            <Lock className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-slate-900 dark:text-white">
                                                Firefox on Windows
                                            </h4>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                                Started: 1 week ago · IP: 10.0.0.1 · Location: Boston, USA
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                                        onClick={() => {
                                            toast({
                                                title: "Session terminated",
                                                description: "The Firefox session has been logged out.",
                                                variant: "default",
                                            });
                                        }}
                                    >
                                        Terminate
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button
                            variant="outline"
                            className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 w-full"
                            onClick={() => {
                                toast({
                                    title: "All sessions terminated",
                                    description: "You've been logged out from all devices except this one.",
                                    variant: "default",
                                });
                            }}
                        >
                            Log Out from All Other Devices
                        </Button>
                    </CardFooter>
                </Card>
            </motion.div>
        </motion.div>
    );
};

// QR Code component for demonstration
const QrCode = ({ className }: { className?: string }) => (
    <svg
        viewBox="0 0 100 100"
        className={className}
        xmlns="http://www.w3.org/2000/svg"
    >
        <rect x="10" y="10" width="80" height="80" fill="none" stroke="currentColor" strokeWidth="2" />
        <rect x="20" y="20" width="20" height="20" fill="currentColor" />
        <rect x="60" y="20" width="20" height="20" fill="currentColor" />
        <rect x="20" y="60" width="20" height="20" fill="currentColor" />
        <rect x="50" y="50" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="2" />
        <rect x="60" y="60" width="10" height="10" fill="currentColor" />
        <rect x="40" y="20" width="10" height="10" fill="currentColor" />
        <rect x="20" y="40" width="10" height="10" fill="currentColor" />
    </svg>
);

export default SecuritySettingsForm;