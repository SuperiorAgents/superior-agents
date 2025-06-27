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
import {
    Bell,
    Mail,
    MessageSquare,
    AlertTriangle,
    Zap,
    Wallet,
    Settings,
    HelpCircle,
    ArrowDownCircle,
    Vote
} from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
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

interface NotificationChannel {
    id: string;
    name: string;
    description: string;
    icon: React.ReactNode;
    enabled: boolean;
}

interface NotificationCategory {
    id: string;
    name: string;
    description: string;
    icon: React.ReactNode;
    email: boolean;
    push: boolean;
    discord: boolean;
    telegram: boolean;
}

const NotificationSettingsForm: React.FC = () => {
    const { toast } = useToast();

    // Notification channels state
    const [notificationChannels, setNotificationChannels] = useState<NotificationChannel[]>([
        {
            id: 'email',
            name: 'Email Notifications',
            description: 'Receive updates via email',
            icon: <Mail className="h-5 w-5" />,
            enabled: true
        },
        {
            id: 'push',
            name: 'Push Notifications',
            description: 'Browser and mobile push notifications',
            icon: <Bell className="h-5 w-5" />,
            enabled: true
        },
        {
            id: 'discord',
            name: 'Discord Alerts',
            description: 'Connect and receive alerts on Discord',
            icon: <MessageSquare className="h-5 w-5" />,
            enabled: false
        },
        {
            id: 'telegram',
            name: 'Telegram Notifications',
            description: 'Connect and receive alerts on Telegram',
            icon: <MessageSquare className="h-5 w-5" />,
            enabled: false
        }
    ]);

    // Notification categories state
    const [notificationCategories, setNotificationCategories] = useState<NotificationCategory[]>([
        {
            id: 'automations',
            name: 'Task Automations',
            description: 'Updates about your automated tasks',
            icon: <Zap className="h-5 w-5" />,
            email: true,
            push: true,
            discord: false,
            telegram: false
        },
        {
            id: 'dao-voting',
            name: 'DAO Voting',
            description: 'New proposals and voting results',
            icon: <Vote className="h-5 w-5" />,
            email: true,
            push: true,
            discord: false,
            telegram: false
        },
        {
            id: 'rewards',
            name: 'Rewards & Claims',
            description: 'Notifications about claimed rewards',
            icon: <Wallet className="h-5 w-5" />,
            email: true,
            push: true,
            discord: false,
            telegram: false
        },
        {
            id: 'security',
            name: 'Security Alerts',
            description: 'Important security notifications',
            icon: <AlertTriangle className="h-5 w-5" />,
            email: true,
            push: true,
            discord: false,
            telegram: false
        },
        {
            id: 'transactions',
            name: 'Transaction Updates',
            description: 'Status updates for your transactions',
            icon: <ArrowDownCircle className="h-5 w-5" />,
            email: false,
            push: true,
            discord: false,
            telegram: false
        },
        {
            id: 'system',
            name: 'System Notifications',
            description: 'Service updates and announcements',
            icon: <Settings className="h-5 w-5" />,
            email: true,
            push: false,
            discord: false,
            telegram: false
        }
    ]);

    const [emailDigestFrequency, setEmailDigestFrequency] = useState("daily");
    const [telegramUsername, setTelegramUsername] = useState("");
    const [discordUsername, setDiscordUsername] = useState("");

    // Toggle channel enabled state
    const toggleChannelEnabled = (channelId: string) => {
        setNotificationChannels(channels =>
            channels.map(channel =>
                channel.id === channelId
                    ? { ...channel, enabled: !channel.enabled }
                    : channel
            )
        );
    };

    // Toggle category notification setting
    const toggleCategoryChannel = (categoryId: string, channelId: string) => {
        setNotificationCategories(categories =>
            categories.map(category =>
                category.id === categoryId
                    ? { ...category, [channelId]: !category[channelId as keyof NotificationCategory] }
                    : category
            )
        );
    };

    // Handle connect channel (Telegram or Discord)
    const handleConnectChannel = (channelId: string) => {
        // In a real app, this would connect to the service
        toast({
            title: `${channelId.charAt(0).toUpperCase() + channelId.slice(1)} connected`,
            description: `You have successfully connected your ${channelId} account.`,
            variant: "default",
        });

        // Update the channel state to enabled
        toggleChannelEnabled(channelId);
    };

    // Handle save settings
    const handleSaveSettings = () => {
        toast({
            title: "Notification settings saved",
            description: "Your notification preferences have been updated successfully.",
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
            {/* Notification Channels */}
            <motion.div variants={itemVariants}>
                <Card className=' dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg'>
                    <CardHeader>
                        <CardTitle>Notification Channels</CardTitle>
                        <CardDescription>
                            Configure how you want to receive notifications
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {notificationChannels.map((channel) => (
                                <div
                                    key={channel.id}
                                    className="flex items-start space-x-4 p-4 rounded-lg border border-slate-200 dark:border-slate-800"
                                >
                                    <div className={`p-2 rounded-full ${channel.enabled
                                        ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                                        }`}>
                                        {channel.icon}
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-medium text-slate-900 dark:text-white">
                                                {channel.name}
                                            </h4>
                                            <Switch
                                                checked={channel.enabled}
                                                onCheckedChange={() => toggleChannelEnabled(channel.id)}
                                            />
                                        </div>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">
                                            {channel.description}
                                        </p>

                                        {(channel.id === 'telegram' || channel.id === 'discord') && !channel.enabled && (
                                            <div className="mt-3">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <Input
                                                        placeholder={`${channel.id === 'telegram' ? 'Telegram' : 'Discord'} username`}
                                                        className="h-8 text-sm"
                                                        value={channel.id === 'telegram' ? telegramUsername : discordUsername}
                                                        onChange={(e) => channel.id === 'telegram'
                                                            ? setTelegramUsername(e.target.value)
                                                            : setDiscordUsername(e.target.value)
                                                        }
                                                    />
                                                    <Button
                                                        size="sm"
                                                        className="text-xs bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                                                        onClick={() => handleConnectChannel(channel.id)}
                                                    >
                                                        Connect
                                                    </Button>
                                                </div>
                                            </div>
                                        )}

                                        {channel.id === 'email' && channel.enabled && (
                                            <div className="mt-3">
                                                <Label htmlFor="emailDigest" className="text-xs">Digest Frequency</Label>
                                                <Select
                                                    value={emailDigestFrequency}
                                                    onValueChange={setEmailDigestFrequency}
                                                >
                                                    <SelectTrigger id="emailDigest" className="mt-1 h-8 text-sm">
                                                        <SelectValue placeholder="Select frequency" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="realtime">Real-time</SelectItem>
                                                        <SelectItem value="hourly">Hourly digest</SelectItem>
                                                        <SelectItem value="daily">Daily digest</SelectItem>
                                                        <SelectItem value="weekly">Weekly digest</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Notification Categories */}
            <motion.div variants={itemVariants}>
                <Card className=' dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg'>
                    <CardHeader>
                        <CardTitle>Notification Categories</CardTitle>
                        <CardDescription>
                            Customize which events trigger notifications by channel
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-slate-800">
                                        <th className="text-left py-3 px-4 font-medium text-slate-500 dark:text-slate-400">Category</th>
                                        <th className="text-center py-3 px-4 font-medium text-slate-500 dark:text-slate-400">Email</th>
                                        <th className="text-center py-3 px-4 font-medium text-slate-500 dark:text-slate-400">Push</th>
                                        <th className="text-center py-3 px-4 font-medium text-slate-500 dark:text-slate-400">Discord</th>
                                        <th className="text-center py-3 px-4 font-medium text-slate-500 dark:text-slate-400">Telegram</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {notificationCategories.map((category) => (
                                        <tr key={category.id} className="border-b border-slate-200 dark:border-slate-800">
                                            <td className="py-3 px-4">
                                                <div className="flex items-center space-x-3">
                                                    <div className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                                        {category.icon}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-medium text-slate-900 dark:text-white">
                                                            {category.name}
                                                        </h4>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                                            {category.description}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="text-center py-3 px-4">
                                                <div className="flex justify-center">
                                                    <Switch
                                                        checked={category.email}
                                                        onCheckedChange={() => toggleCategoryChannel(category.id, 'email')}
                                                        disabled={!notificationChannels.find(c => c.id === 'email')?.enabled}
                                                    />
                                                </div>
                                            </td>
                                            <td className="text-center py-3 px-4">
                                                <div className="flex justify-center">
                                                    <Switch
                                                        checked={category.push}
                                                        onCheckedChange={() => toggleCategoryChannel(category.id, 'push')}
                                                        disabled={!notificationChannels.find(c => c.id === 'push')?.enabled}
                                                    />
                                                </div>
                                            </td>
                                            <td className="text-center py-3 px-4">
                                                <div className="flex justify-center">
                                                    <Switch
                                                        checked={category.discord}
                                                        onCheckedChange={() => toggleCategoryChannel(category.id, 'discord')}
                                                        disabled={!notificationChannels.find(c => c.id === 'discord')?.enabled}
                                                    />
                                                </div>
                                            </td>
                                            <td className="text-center py-3 px-4">
                                                <div className="flex justify-center">
                                                    <Switch
                                                        checked={category.telegram}
                                                        onCheckedChange={() => toggleCategoryChannel(category.id, 'telegram')}
                                                        disabled={!notificationChannels.find(c => c.id === 'telegram')?.enabled}
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-100 dark:border-blue-800">
                            <div className="flex space-x-3">
                                <HelpCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                                <div>
                                    <h4 className="font-medium text-blue-700 dark:text-blue-300">Priority Notifications</h4>
                                    <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                                        Security alerts will always be sent to your email regardless of your notification settings.
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
        </motion.div>
    );
};

export default NotificationSettingsForm;