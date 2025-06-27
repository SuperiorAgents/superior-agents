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
    AlertCircle,
    ChevronRight,
    Copy,
    Eye,
    EyeOff,
    Info,
    Key,
    Lock,
    PlusCircle,
    Shield,
    Trash2,
    BarChart,
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
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

interface ApiKey {
    id: string;
    name: string;
    key: string;
    created: string;
    lastUsed: string | null;
    status: 'active' | 'expired' | 'revoked';
    permissions: {
        read: boolean;
        write: boolean;
        admin: boolean;
    };
}

const APIKeySettings: React.FC = () => {
    const { toast } = useToast();

    // State for API keys
    const [apiKeys, setApiKeys] = useState<ApiKey[]>([
        {
            id: '1',
            name: 'Main Dashboard',
            key: 'mp_VGhpcyBpcyBhIGZha2UgQVBJIGtleSBmb3IgZGVtbyBwdXJwb3Nl',
            created: '2025-04-10 09:15:22',
            lastUsed: '2025-05-10 14:32:45',
            status: 'active',
            permissions: {
                read: true,
                write: true,
                admin: false
            }
        },
        {
            id: '2',
            name: 'Mobile App Integration',
            key: 'mp_QW5vdGhlciBmYWtlIEFQSSBrZXkgZm9yIGRlbW8gcHVycG9zZXMu',
            created: '2025-03-22 12:05:10',
            lastUsed: '2025-05-11 08:11:33',
            status: 'active',
            permissions: {
                read: true,
                write: true,
                admin: false
            }
        },
        {
            id: '3',
            name: 'Analytics Integration',
            key: 'mp_TW9yZSBmYWtlIEFQSSBrZXlzIGZvciBkZW1vIHB1cnBvc2VzLg==',
            created: '2025-01-15 17:22:45',
            lastUsed: '2025-04-28 21:44:12',
            status: 'active',
            permissions: {
                read: true,
                write: false,
                admin: false
            }
        },
        {
            id: '4',
            name: 'Old Test API',
            key: 'mp_VGhpcyBrZXkgaXMgbm8gbG9uZ2VyIGluIHVzZS4=',
            created: '2024-11-05 11:08:33',
            lastUsed: '2025-01-10 15:31:08',
            status: 'revoked',
            permissions: {
                read: true,
                write: true,
                admin: true
            }
        }
    ]);

    // State for dialogs
    const [isCreateKeyOpen, setIsCreateKeyOpen] = useState(false);
    const [isViewKeyOpen, setIsViewKeyOpen] = useState(false);
    const [isRevokeKeyOpen, setIsRevokeKeyOpen] = useState(false);
    const [selectedKeyId, setSelectedKeyId] = useState<string | null>(null);
    const [showApiKey, setShowApiKey] = useState(false);

    // State for new API key form
    const [newKeyName, setNewKeyName] = useState('');
    const [newKeyExpiration, setNewKeyExpiration] = useState('never');
    const [newKeyPermissions, setNewKeyPermissions] = useState({
        read: true,
        write: false,
        admin: false
    });

    // Generate a formatted API key (masked or shown)
    const formatApiKey = (key: string, masked: boolean) => {
        if (masked) {
            const firstChars = key.substring(0, 8);
            return `${firstChars}...`;
        }
        return key;
    };

    // Get the currently selected API key
    const selectedKey = selectedKeyId ? apiKeys.find(k => k.id === selectedKeyId) : null;

    // Handle copying API key
    const handleCopyApiKey = (key: string) => {
        navigator.clipboard.writeText(key);
        toast({
            title: "API key copied",
            description: "The API key has been copied to your clipboard.",
            variant: "default",
        });
    };

    // Handle creating a new API key
    const handleCreateApiKey = () => {
        if (!newKeyName.trim()) {
            toast({
                title: "Name required",
                description: "Please provide a name for your API key.",
                variant: "destructive",
            });
            return;
        }

        // Generate a mock API key
        const newKey: ApiKey = {
            id: `${apiKeys.length + 1}`,
            name: newKeyName,
            key: `mp_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
            created: new Date().toISOString().replace('T', ' ').substring(0, 19),
            lastUsed: null,
            status: 'active',
            permissions: { ...newKeyPermissions }
        };

        setApiKeys([newKey, ...apiKeys]);
        setSelectedKeyId(newKey.id);
        setIsCreateKeyOpen(false);
        setIsViewKeyOpen(true);
        setShowApiKey(true);

        // Reset form
        setNewKeyName('');
        setNewKeyExpiration('never');
        setNewKeyPermissions({
            read: true,
            write: false,
            admin: false
        });
    };

    // Handle revoking an API key
    const handleRevokeApiKey = () => {
        if (!selectedKeyId) return;

        setApiKeys(apiKeys.map(key =>
            key.id === selectedKeyId
                ? { ...key, status: 'revoked' }
                : key
        ));

        setIsRevokeKeyOpen(false);

        toast({
            title: "API key revoked",
            description: "The API key has been successfully revoked.",
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
            {/* API Keys Overview */}
            <motion.div variants={itemVariants}>
                <Card className=' dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg'>
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                            <div>
                                <CardTitle>API Keys</CardTitle>
                                <CardDescription>
                                    Manage API keys for programmatic access to MetaPilot
                                </CardDescription>
                            </div>
                            <Button
                                className="mt-4 sm:mt-0 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                                onClick={() => setIsCreateKeyOpen(true)}
                            >
                                <PlusCircle className="h-4 w-4 mr-2" />
                                Create API Key
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[250px]">Name</TableHead>
                                        <TableHead>Key</TableHead>
                                        <TableHead className="w-[150px]">Created</TableHead>
                                        <TableHead className="w-[100px]">Status</TableHead>
                                        <TableHead className="text-right w-[120px]">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {apiKeys.map((apiKey) => (
                                        <TableRow key={apiKey.id}>
                                            <TableCell className="font-medium">{apiKey.name}</TableCell>
                                            <TableCell className="font-mono text-sm">
                                                {formatApiKey(apiKey.key, true)}
                                            </TableCell>
                                            <TableCell className="text-sm text-slate-500 dark:text-slate-400">
                                                {new Date(apiKey.created).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        apiKey.status === 'active'
                                                            ? 'secondary'
                                                            : apiKey.status === 'expired'
                                                                ? 'outline'
                                                                : 'destructive'
                                                    }
                                                    className="text-xs"
                                                >
                                                    {apiKey.status.charAt(0).toUpperCase() + apiKey.status.slice(1)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end space-x-2">
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    variant="outline"
                                                                    size="icon"
                                                                    className="h-8 w-8"
                                                                    disabled={apiKey.status !== 'active'}
                                                                    onClick={() => {
                                                                        setSelectedKeyId(apiKey.id);
                                                                        setIsViewKeyOpen(true);
                                                                    }}
                                                                >
                                                                    <Eye className="h-4 w-4" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>View API Key</TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>

                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    variant="outline"
                                                                    size="icon"
                                                                    className="h-8 w-8"
                                                                    disabled={apiKey.status !== 'active'}
                                                                    onClick={() => {
                                                                        setSelectedKeyId(apiKey.id);
                                                                        setIsRevokeKeyOpen(true);
                                                                    }}
                                                                >
                                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>Revoke API Key</TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}

                                    {apiKeys.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-24 text-center">
                                                <div className="flex flex-col items-center justify-center">
                                                    <Key className="h-8 w-8 text-slate-400 mb-2" />
                                                    <p className="text-slate-500 dark:text-slate-400">
                                                        No API keys found
                                                    </p>
                                                    <Button
                                                        variant="link"
                                                        className="mt-2"
                                                        onClick={() => setIsCreateKeyOpen(true)}
                                                    >
                                                        Create your first API key
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mt-6 text-sm">
                            <div className="flex space-x-3">
                                <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                                <div>
                                    <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-1">About API Keys</h4>
                                    <p className="text-blue-600 dark:text-blue-400">
                                        API keys allow programmatic access to your MetaPilot account. Keep your keys secure and never share them in client-side code. Revoke keys immediately if you suspect they have been compromised.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* API Rate Limits */}
            <motion.div variants={itemVariants}>
                <Card className=' dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg'>
                    <CardHeader>
                        <CardTitle>API Rate Limits & Usage</CardTitle>
                        <CardDescription>
                            Monitor your API usage and configure rate limits
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-lg">
                                <h3 className="font-medium text-slate-900 dark:text-white mb-1">Current Usage</h3>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                                    1,245 <span className="text-sm font-normal text-slate-500 dark:text-slate-400">of 10,000</span>
                                </p>
                                <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-2">
                                    <div className="h-full bg-blue-500 rounded-full" style={{ width: '12.45%' }}></div>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    API requests this month (resets in 18 days)
                                </p>
                            </div>

                            <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-lg">
                                <h3 className="font-medium text-slate-900 dark:text-white mb-1">Rate Limit</h3>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                                    60 <span className="text-sm font-normal text-slate-500 dark:text-slate-400">per minute</span>
                                </p>
                                <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-2">
                                    <div className="h-full bg-green-500 rounded-full" style={{ width: '15%' }}></div>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Current usage: 9 requests/minute
                                </p>
                            </div>

                            <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-lg">
                                <h3 className="font-medium text-slate-900 dark:text-white mb-1">Concurrent Requests</h3>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                                    5 <span className="text-sm font-normal text-slate-500 dark:text-slate-400">of 20</span>
                                </p>
                                <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-2">
                                    <div className="h-full bg-blue-500 rounded-full" style={{ width: '25%' }}></div>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Maximum concurrent API requests
                                </p>
                            </div>
                        </div>

                        {/* Usage Chart */}
                        <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-lg">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-medium text-slate-900 dark:text-white">API Usage History</h3>
                                <Select defaultValue="week">
                                    <SelectTrigger className="w-[120px] h-8 text-xs">
                                        <SelectValue placeholder="Select period" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="day">Last 24 hours</SelectItem>
                                        <SelectItem value="week">Last 7 days</SelectItem>
                                        <SelectItem value="month">Last 30 days</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="h-64 bg-slate-50 dark:bg-slate-800/50 rounded-md flex items-center justify-center">
                                <div className="text-center">
                                    <BarChart className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                        API usage chart will appear here
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                                        Visualizes request volume over time
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Rate Limit Configuration */}
                        <div>
                            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">Rate Limit Configuration</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="minute-limit">Per-Minute Limit</Label>
                                    <Select defaultValue="60">
                                        <SelectTrigger id="minute-limit">
                                            <SelectValue placeholder="Select limit" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="30">30 requests/minute</SelectItem>
                                            <SelectItem value="60">60 requests/minute</SelectItem>
                                            <SelectItem value="120">120 requests/minute</SelectItem>
                                            <SelectItem value="300">300 requests/minute</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Maximum API requests per minute
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="concurrent-limit">Concurrent Request Limit</Label>
                                    <Select defaultValue="20">
                                        <SelectTrigger id="concurrent-limit">
                                            <SelectValue placeholder="Select limit" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="5">5 concurrent requests</SelectItem>
                                            <SelectItem value="10">10 concurrent requests</SelectItem>
                                            <SelectItem value="20">20 concurrent requests</SelectItem>
                                            <SelectItem value="50">50 concurrent requests</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Maximum simultaneous API requests
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                            <div className="flex space-x-3">
                                <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400 flex-shrink-0" />
                                <div>
                                    <h4 className="font-medium text-orange-700 dark:text-orange-300">Rate Limit Warning</h4>
                                    <p className="text-sm text-orange-600 dark:text-orange-400">
                                        Exceeding these limits will result in requests being throttled or rejected.
                                    </p>
                                </div>
                            </div>
                            <Button
                                className="ml-4"
                                variant="outline"
                                size="sm"
                            >
                                Need Higher Limits?
                            </Button>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end">
                        <Button
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                            onClick={() => {
                                toast({
                                    title: "Rate limits updated",
                                    description: "Your API rate limit configuration has been saved.",
                                    variant: "default",
                                });
                            }}
                        >
                            Save Rate Limit Changes
                        </Button>
                    </CardFooter>
                </Card>
            </motion.div>

            {/* API Documentation */}
            <motion.div variants={itemVariants}>
                <Card className=' dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg'>
                    <CardHeader>
                        <CardTitle>API Documentation</CardTitle>
                        <CardDescription>
                            Resources to help you integrate with the MetaPilot API
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-lg hover:border-blue-300 dark:hover:border-blue-700 transition-colors group cursor-pointer">
                                <div className="flex items-center space-x-3 mb-2">
                                    <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
                                        <Book className="h-5 w-5" />
                                    </div>
                                    <h3 className="font-medium text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                        API Reference
                                    </h3>
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    Complete documentation for all MetaPilot API endpoints
                                </p>
                                <div className="flex items-center mt-3 text-sm text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span>View Documentation</span>
                                    <ChevronRight className="h-4 w-4 ml-1" />
                                </div>
                            </div>

                            <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-lg hover:border-blue-300 dark:hover:border-blue-700 transition-colors group cursor-pointer">
                                <div className="flex items-center space-x-3 mb-2">
                                    <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
                                        <Code className="h-5 w-5" />
                                    </div>
                                    <h3 className="font-medium text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                        Code Examples
                                    </h3>
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    Sample integrations in JavaScript, Python, and more
                                </p>
                                <div className="flex items-center mt-3 text-sm text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span>View Examples</span>
                                    <ChevronRight className="h-4 w-4 ml-1" />
                                </div>
                            </div>

                            <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-lg hover:border-blue-300 dark:hover:border-blue-700 transition-colors group cursor-pointer">
                                <div className="flex items-center space-x-3 mb-2">
                                    <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
                                        <MessageSquare className="h-5 w-5" />
                                    </div>
                                    <h3 className="font-medium text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                        Community Support
                                    </h3>
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    Get help from our developers and community
                                </p>
                                <div className="flex items-center mt-3 text-sm text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span>Join Discussion</span>
                                    <ChevronRight className="h-4 w-4 ml-1" />
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm">
                            <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-2">Base URL</h4>
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded font-mono text-blue-800 dark:text-blue-300 flex justify-between items-center">
                                <code>https://api.metapilot.com/v1</code>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 px-2 text-blue-700 dark:text-blue-400 hover:text-blue-800 hover:bg-blue-200 dark:hover:bg-blue-800"
                                    onClick={() => {
                                        navigator.clipboard.writeText('https://api.metapilot.com/v1');
                                        toast({
                                            title: "Base URL copied",
                                            description: "API base URL copied to clipboard.",
                                            variant: "default",
                                        });
                                    }}
                                >
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-lg">
                                <h4 className="font-medium text-slate-900 dark:text-white mb-2">Authentication Example</h4>
                                <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded font-mono text-xs text-slate-800 dark:text-slate-300 overflow-x-auto">
                                    <pre>{`curl -X GET \\
  "https://api.metapilot.com/v1/tasks" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`}</pre>
                                </div>
                            </div>

                            <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-lg">
                                <h4 className="font-medium text-slate-900 dark:text-white mb-2">Response Format</h4>
                                <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded font-mono text-xs text-slate-800 dark:text-slate-300 overflow-x-auto">
                                    <pre>{`{
  "status": "success",
  "data": {
    // Response data here
  },
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 42
  }
}`}</pre>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Create API Key Dialog */}
            <Dialog open={isCreateKeyOpen} onOpenChange={setIsCreateKeyOpen}>
                <DialogContent className="sm:max-w-[500px]  dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg">
                    <DialogHeader>
                        <DialogTitle>Create API Key</DialogTitle>
                        <DialogDescription>
                            Generate a new API key for your integrations
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="key-name">API Key Name</Label>
                            <Input
                                id="key-name"
                                placeholder="e.g., Dashboard Integration, Mobile App"
                                value={newKeyName}
                                onChange={(e) => setNewKeyName(e.target.value)}
                            />
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                A descriptive name to help you identify this key later
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="key-expiration">Expiration</Label>
                            <Select
                                value={newKeyExpiration}
                                onValueChange={setNewKeyExpiration}
                            >
                                <SelectTrigger id="key-expiration">
                                    <SelectValue placeholder="Select expiration" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="30days">30 days</SelectItem>
                                    <SelectItem value="90days">90 days</SelectItem>
                                    <SelectItem value="1year">1 year</SelectItem>
                                    <SelectItem value="never">Never expires</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                When this API key should expire
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-base">Permissions</Label>
                            <div className="space-y-3 mt-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Shield className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                                        <Label htmlFor="read-permission">Read Access</Label>
                                    </div>
                                    <Switch
                                        id="read-permission"
                                        checked={newKeyPermissions.read}
                                        onCheckedChange={(checked) => setNewKeyPermissions({ ...newKeyPermissions, read: checked })}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Shield className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                                        <Label htmlFor="write-permission">Write Access</Label>
                                    </div>
                                    <Switch
                                        id="write-permission"
                                        checked={newKeyPermissions.write}
                                        onCheckedChange={(checked) => setNewKeyPermissions({ ...newKeyPermissions, write: checked })}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Shield className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                                        <Label htmlFor="admin-permission">Admin Access</Label>
                                    </div>
                                    <Switch
                                        id="admin-permission"
                                        checked={newKeyPermissions.admin}
                                        onCheckedChange={(checked) => setNewKeyPermissions({ ...newKeyPermissions, admin: checked })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg flex items-start space-x-2 text-sm">
                            <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                            <p className="text-orange-600 dark:text-orange-400">
                                API keys with admin access can perform sensitive operations like modifying task rules and permissions. Use with caution.
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateKeyOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                            onClick={handleCreateApiKey}
                        >
                            Create API Key
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* View API Key Dialog */}
            <Dialog open={isViewKeyOpen} onOpenChange={setIsViewKeyOpen}>
                <DialogContent className="sm:max-w-[500px]  dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg">
                    <DialogHeader>
                        <DialogTitle>API Key Details</DialogTitle>
                        <DialogDescription>
                            {selectedKey ? `Information about ${selectedKey.name}` : 'Details about your API key'}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedKey && (
                        <div className="py-4 space-y-6">
                            <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-800">
                                <h4 className="font-medium text-slate-900 dark:text-white mb-2">API Key</h4>
                                <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-3 rounded-md">
                                    <code className="font-mono text-sm flex-1 truncate">
                                        {showApiKey ? selectedKey.key : formatApiKey(selectedKey.key, true)}
                                    </code>
                                    <div className="flex space-x-1 ml-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => setShowApiKey(!showApiKey)}
                                        >
                                            {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => handleCopyApiKey(selectedKey.key)}
                                        >
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                <p className="mt-2 text-xs text-center text-slate-500 dark:text-slate-400">
                                    This is the only time you'll be able to view this key. Store it securely.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Created</h4>
                                    <p className="font-medium text-slate-900 dark:text-white">
                                        {new Date(selectedKey.created).toLocaleString()}
                                    </p>
                                </div>

                                <div>
                                    <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Status</h4>
                                    <Badge
                                        variant={
                                            selectedKey.status === 'active'
                                                ? 'secondary'
                                                : selectedKey.status === 'expired'
                                                    ? 'outline'
                                                    : 'destructive'
                                        }
                                    >
                                        {selectedKey.status.charAt(0).toUpperCase() + selectedKey.status.slice(1)}
                                    </Badge>
                                </div>

                                <div>
                                    <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Permissions</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedKey.permissions.read && (
                                            <Badge variant="secondary">Read</Badge>
                                        )}
                                        {selectedKey.permissions.write && (
                                            <Badge variant="secondary">Write</Badge>
                                        )}
                                        {selectedKey.permissions.admin && (
                                            <Badge variant="secondary">Admin</Badge>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Last Used</h4>
                                    <p className="font-medium text-slate-900 dark:text-white">
                                        {selectedKey.lastUsed ? new Date(selectedKey.lastUsed).toLocaleString() : 'Never used'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <div className="flex items-center text-blue-700 dark:text-blue-300">
                                    <Lock className="h-5 w-5 mr-2" />
                                    <span className="text-sm font-medium">Secure Your API Key</span>
                                </div>
                                <Button
                                    variant="link"
                                    className="text-blue-700 dark:text-blue-300 p-0 h-auto"
                                >
                                    Security Best Practices
                                </Button>
                            </div>
                        </div>
                    )}
                    <DialogFooter className="flex justify-between sm:justify-between">
                        <Button
                            variant="outline"
                            className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                            onClick={() => {
                                setIsViewKeyOpen(false);
                                if (selectedKeyId) {
                                    setIsRevokeKeyOpen(true);
                                }
                            }}
                        >
                            Revoke Key
                        </Button>
                        <Button onClick={() => setIsViewKeyOpen(false)}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Revoke API Key Dialog */}
            <Dialog open={isRevokeKeyOpen} onOpenChange={setIsRevokeKeyOpen}>
                <DialogContent className="sm:max-w-[440px]  dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg">
                    <DialogHeader>
                        <DialogTitle>Revoke API Key</DialogTitle>
                        <DialogDescription>
                            This action cannot be undone. The API key will no longer work.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedKey && (
                        <div className="py-4">
                            <div className="p-4 border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 rounded-lg mb-4">
                                <div className="flex space-x-3">
                                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                                    <div>
                                        <h4 className="font-medium text-red-700 dark:text-red-300">
                                            Are you sure you want to revoke this API key?
                                        </h4>
                                        <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                                            <strong>{selectedKey.name}</strong> will immediately lose access to the MetaPilot API. Any integrations using this key will stop working.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <Key className="h-5 w-5 text-slate-500" />
                                    <div>
                                        <p className="font-medium text-slate-900 dark:text-white">{selectedKey.name}</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">Created: {new Date(selectedKey.created).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsRevokeKeyOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleRevokeApiKey}
                        >
                            Revoke API Key
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
};

// Additional components needed
const Book = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
    </svg>
);

const Code = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
    </svg>
);

const MessageSquare = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
);

export default APIKeySettings;