"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import {
    Bell,
    Wallet,
    Shield,
    User,
    ArrowUpRight,
    Zap,
    MousePointerClick,
} from 'lucide-react';


import ProfileSettingsForm from './ProfileSettingsForm';
import NotificationSettingsForm from './NotificationSettingsForm';
import WalletIntegrationSettings from './WalletIntegrationSettings';
import APIKeySettings from './APIKeySettings';
import AutomationSettings from './AutomationSettings';
import SecuritySettingsForm from './SecuritySettingsForm';
import WebhookSettings from './WebhookSettings';

const SettingsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState("profile");

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
            transition: {
                duration: 0.5,
            },
        },
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="container mx-auto max-w-6xl p-4  dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg rounded-xl"
        >
            <motion.div variants={itemVariants} className="mb-8  dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Settings</h1>
                <p className="text-slate-600 dark:text-slate-400 mt-2">
                    Manage your account settings and web3 automation preferences
                </p>
            </motion.div>

            <Tabs
                defaultValue="profile"
                value={activeTab}
                onValueChange={setActiveTab}
                className="space-y-6  dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg"
            >
                <motion.div variants={itemVariants}>
                    <div className="bg-white dark:bg-[#0c1a54] rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 p-1">
                        <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 w-full h-full  dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg">
                            <TabsTrigger
                                value="profile"
                                className="px-3 py-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 dark:data-[state=active]:bg-blue-900/20 dark:data-[state=active]:text-blue-400"
                            >
                                <User className="w-4 h-4 mr-2" />
                                <span className="hidden sm:inline">Profile</span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="notifications"
                                className="px-3 py-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 dark:data-[state=active]:bg-blue-900/20 dark:data-[state=active]:text-blue-400"
                            >
                                <Bell className="w-4 h-4 mr-2" />
                                <span className="hidden sm:inline">Notifications</span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="security"
                                className="px-3 py-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 dark:data-[state=active]:bg-blue-900/20 dark:data-[state=active]:text-blue-400"
                            >
                                <Shield className="w-4 h-4 mr-2" />
                                <span className="hidden sm:inline">Security</span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="wallets"
                                className="px-3 py-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 dark:data-[state=active]:bg-blue-900/20 dark:data-[state=active]:text-blue-400"
                            >
                                <Wallet className="w-4 h-4 mr-2" />
                                <span className="hidden sm:inline">Wallets</span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="automation"
                                className="px-3 py-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 dark:data-[state=active]:bg-blue-900/20 dark:data-[state=active]:text-blue-400"
                            >
                                <Zap className="w-4 h-4 mr-2" />
                                <span className="hidden sm:inline">Automation</span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="api"
                                className="px-3 py-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 dark:data-[state=active]:bg-blue-900/20 dark:data-[state=active]:text-blue-400"
                            >
                                <MousePointerClick className="w-4 h-4 mr-2" />
                                <span className="hidden sm:inline">API</span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="webhooks"
                                className="px-3 py-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 dark:data-[state=active]:bg-blue-900/20 dark:data-[state=active]:text-blue-400"
                            >
                                <ArrowUpRight className="w-4 h-4 mr-2" />
                                <span className="hidden sm:inline">Webhooks</span>
                            </TabsTrigger>
                        </TabsList>
                    </div>
                </motion.div>

                <TabsContent value="profile">
                    <motion.div
                        variants={itemVariants}
                        className="grid grid-cols-1 gap-6"
                    >
                        <ProfileSettingsForm />
                    </motion.div>
                </TabsContent>

                <TabsContent value="notifications">
                    <motion.div
                        variants={itemVariants}
                        className="grid grid-cols-1 gap-6"
                    >
                        <NotificationSettingsForm />
                    </motion.div>
                </TabsContent>

                <TabsContent value="security">
                    <motion.div
                        variants={itemVariants}
                        className="grid grid-cols-1 gap-6"
                    >
                        <SecuritySettingsForm />
                    </motion.div>
                </TabsContent>

                <TabsContent value="wallets">
                    <motion.div
                        variants={itemVariants}
                        className="grid grid-cols-1 gap-6"
                    >
                        <WalletIntegrationSettings />
                    </motion.div>
                </TabsContent>

                <TabsContent value="automation">
                    <motion.div
                        variants={itemVariants}
                        className="grid grid-cols-1 gap-6"
                    >
                        <AutomationSettings />
                    </motion.div>
                </TabsContent>

                <TabsContent value="api">
                    <motion.div
                        variants={itemVariants}
                        className="grid grid-cols-1 gap-6"
                    >
                        <APIKeySettings />
                    </motion.div>
                </TabsContent>

                <TabsContent value="webhooks">
                    <motion.div
                        variants={itemVariants}
                        className="grid grid-cols-1 gap-6"
                    >
                        <WebhookSettings />
                    </motion.div>
                </TabsContent>
            </Tabs>
        </motion.div>
    );
};

export default SettingsPage;