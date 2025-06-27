"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    AlertCircle,
    ArrowUpRight,
    Clock,
    Copy,
    Edit,
    Info,
    Plus,
    RefreshCw,
    Trash2,
    Webhook as WebhookIcon,
    EyeOff,
    Eye
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
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

interface Webhook {
    id: string;
    name: string;
    url: string;
    status: 'active' | 'inactive' | 'failed';
    createdAt: string;
    lastTriggered: string | null;
    secret: string;
    events: string[];
}

interface WebhookLog {
    id: string;
    webhookId: string;
    event: string;
    status: 'success' | 'failed';
    timestamp: string;
    responseTime: number;
    responseStatus: number;
    responseBody?: string;
}

const WebhookSettings: React.FC = () => {
    const { toast } = useToast();

    // Webhook state
    const [webhooks, setWebhooks] = useState<Webhook[]>([
        {
            id: '1',
            name: 'Task Automation Status Updates',
            url: 'https://example.com/webhooks/metapilot',
            status: 'active',
            createdAt: '2025-04-12T14:30:00Z',
            lastTriggered: '2025-05-11T08:45:22Z',
            secret: 'whsec_12345abcdef67890',
            events: ['task.created', 'task.executed', 'task.failed']
        },
        {
            id: '2',
            name: 'Transaction Notifications',
            url: 'https://myapp.com/api/notifications',
            status: 'active',
            createdAt: '2025-03-22T10:15:30Z',
            lastTriggered: '2025-05-10T16:22:45Z',
            secret: 'whsec_abcdef123456789',
            events: ['transaction.created', 'transaction.confirmed']
        },
        {
            id: '3',
            name: 'Analytics Integration',
            url: 'https://analytics.example.org/ingest',
            status: 'failed',
            createdAt: '2025-01-15T09:45:12Z',
            lastTriggered: '2025-05-09T12:10:30Z',
            secret: 'whsec_xyz987654321abc',
            events: ['task.created', 'task.executed', 'transaction.confirmed']
        }
    ]);

    // Webhook logs
    const [webhookLogs, setWebhookLogs] = useState<WebhookLog[]>([
        {
            id: '101',
            webhookId: '1',
            event: 'task.executed',
            status: 'success',
            timestamp: '2025-05-11T08:45:22Z',
            responseTime: 245,
            responseStatus: 200
        },
        {
            id: '102',
            webhookId: '2',
            event: 'transaction.confirmed',
            status: 'success',
            timestamp: '2025-05-10T16:22:45Z',
            responseTime: 312,
            responseStatus: 200
        },
        {
            id: '103',
            webhookId: '3',
            event: 'transaction.confirmed',
            status: 'failed',
            timestamp: '2025-05-09T12:10:30Z',
            responseTime: 5000,
            responseStatus: 503,
            responseBody: 'Connection timeout'
        },
        {
            id: '104',
            webhookId: '1',
            event: 'task.created',
            status: 'success',
            timestamp: '2025-05-09T10:15:42Z',
            responseTime: 189,
            responseStatus: 200
        },
        {
            id: '105',
            webhookId: '2',
            event: 'transaction.created',
            status: 'success',
            timestamp: '2025-05-08T14:33:28Z',
            responseTime: 276,
            responseStatus: 201
        }
    ]);

    // Dialog states
    const [isCreateWebhookOpen, setIsCreateWebhookOpen] = useState(false);
    const [isEditWebhookOpen, setIsEditWebhookOpen] = useState(false);
    const [isDeleteWebhookOpen, setIsDeleteWebhookOpen] = useState(false);
    const [isViewSecretOpen, setIsViewSecretOpen] = useState(false);
    const [selectedWebhookId, setSelectedWebhookId] = useState<string | null>(null);
    const [showSecret, setShowSecret] = useState(false);

    // Form state for new/edit webhook
    const [webhookForm, setWebhookForm] = useState({
        name: '',
        url: '',
        events: [] as string[]
    });

    // Available webhook events
    const availableEvents = [
        { value: 'task.created', label: 'Task Created' },
        { value: 'task.executed', label: 'Task Executed' },
        { value: 'task.failed', label: 'Task Failed' },
        { value: 'transaction.created', label: 'Transaction Created' },
        { value: 'transaction.confirmed', label: 'Transaction Confirmed' },
        { value: 'transaction.failed', label: 'Transaction Failed' }
    ];

    // Get the currently selected webhook
    const selectedWebhook = selectedWebhookId ? webhooks.find(w => w.id === selectedWebhookId) : null;

    // Handle toggling webhook status
    const handleToggleWebhookStatus = (webhookId: string) => {
        setWebhooks(webhooks.map(webhook =>
            webhook.id === webhookId
                ? {
                    ...webhook,
                    status: webhook.status === 'active' ? 'inactive' : 'active'
                }
                : webhook
        ));

        toast({
            title: "Webhook status updated",
            description: "The webhook has been " + (webhooks.find(w => w.id === webhookId)?.status === 'active' ? 'deactivated' : 'activated'),
            variant: "default",
        });
    };

    // Handle deleting webhook
    const handleDeleteWebhook = () => {
        if (!selectedWebhookId) return;

        setWebhooks(webhooks.filter(webhook => webhook.id !== selectedWebhookId));
        setIsDeleteWebhookOpen(false);

        toast({
            title: "Webhook deleted",
            description: "The webhook has been successfully removed.",
            variant: "default",
        });
    };

    // Handle editing webhook
    const handleEditWebhook = () => {
        if (!selectedWebhookId) return;

        setWebhooks(webhooks.map(webhook =>
            webhook.id === selectedWebhookId
                ? {
                    ...webhook,
                    name: webhookForm.name,
                    url: webhookForm.url,
                    events: webhookForm.events
                }
                : webhook
        ));

        setIsEditWebhookOpen(false);

        toast({
            title: "Webhook updated",
            description: "The webhook has been successfully updated.",
            variant: "default",
        });
    };

    // Handle creating webhook
    const handleCreateWebhook = () => {
        // Form validation
        if (!webhookForm.name.trim() || !webhookForm.url.trim() || webhookForm.events.length === 0) {
            toast({
                title: "Invalid form",
                description: "Please fill out all fields and select at least one event.",
                variant: "destructive",
            });
            return;
        }

        // Create new webhook
        const newWebhook: Webhook = {
            id: `${webhooks.length + 1}`,
            name: webhookForm.name,
            url: webhookForm.url,
            status: 'active',
            createdAt: new Date().toISOString(),
            lastTriggered: null,
            secret: `whsec_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
            events: webhookForm.events
        };

        setWebhooks([...webhooks, newWebhook]);
        setIsCreateWebhookOpen(false);

        // Reset form
        setWebhookForm({
            name: '',
            url: '',
            events: []
        });

        toast({
            title: "Webhook created",
            description: "The new webhook has been successfully created.",
            variant: "default",
        });
    };

    // Handle opening edit webhook dialog
    const handleOpenEditWebhook = (webhookId: string) => {
        const webhook = webhooks.find(w => w.id === webhookId);
        if (webhook) {
            setWebhookForm({
                name: webhook.name,
                url: webhook.url,
                events: webhook.events
            });
            setSelectedWebhookId(webhookId);
            setIsEditWebhookOpen(true);
        }
    };

    // Format date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    // Copy to clipboard
    const handleCopy = (text: string, message: string) => {
        navigator.clipboard.writeText(text);
        toast({
            title: "Copied to clipboard",
            description: message,
            variant: "default",
        });
    };

    // Filter logs by webhook
    const getLogsForWebhook = (webhookId: string) => {
        return webhookLogs.filter(log => log.webhookId === webhookId);
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
        >
            {/* Webhooks Overview */}
            <motion.div variants={itemVariants}>
                <Card className='dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg'>
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                            <div>
                                <CardTitle>Webhooks</CardTitle>
                                <CardDescription>
                                    Configure webhooks to receive real-time updates about your automated tasks
                                </CardDescription>
                            </div>
                            <Button
                                className="mt-4 sm:mt-0 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                                onClick={() => setIsCreateWebhookOpen(true)}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Create Webhook
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {webhooks.length > 0 ? (
                            <div className="space-y-4">
                                {webhooks.map((webhook) => (
                                    <div
                                        key={webhook.id}
                                        className="p-4 border border-slate-200 dark:border-slate-800 rounded-lg"
                                    >
                                        <div className="flex flex-col md:flex-row md:items-center justify-between">
                                            <div className="space-y-2">
                                                <div className="flex items-center">
                                                    <h3 className="font-medium text-slate-900 dark:text-white mr-2">
                                                        {webhook.name}
                                                    </h3>
                                                    <Badge
                                                        variant={
                                                            webhook.status === 'active'
                                                                ? 'secondary'
                                                                : webhook.status === 'inactive'
                                                                    ? 'outline'
                                                                    : 'destructive'
                                                        }
                                                    >
                                                        {webhook.status.charAt(0).toUpperCase() + webhook.status.slice(1)}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                                                    <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-slate-800 dark:text-slate-300 mr-2">
                                                        {webhook.url}
                                                    </code>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6 dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg"
                                                        onClick={() => handleCopy(webhook.url, "Webhook URL copied to clipboard")}
                                                    >
                                                        <Copy className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {webhook.events.map((event) => (
                                                        <Badge key={event} variant="secondary" className="text-xs">
                                                            {event}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-2 mt-4 md:mt-0">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        setSelectedWebhookId(webhook.id);
                                                        setIsViewSecretOpen(true);
                                                    }}
                                                >
                                                    View Secret
                                                </Button>
                                                <Button
                                                    variant={webhook.status === 'active' ? 'destructive' : 'secondary'}
                                                    size="sm"
                                                    className={
                                                        webhook.status === 'active'
                                                            ? 'bg-transparent text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700'
                                                            : 'bg-green-600 hover:bg-green-700 text-white'
                                                    }
                                                    onClick={() => handleToggleWebhookStatus(webhook.id)}
                                                >
                                                    {webhook.status === 'active' ? 'Deactivate' : 'Activate'}
                                                </Button>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="outline" size="icon" className="h-8 w-8">
                                                            <EllipsisVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => handleOpenEditWebhook(webhook.id)} className='dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg'>
                                                            <Edit className="h-4 w-4 mr-2" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="text-red-600 dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg"
                                                            onClick={() => {
                                                                setSelectedWebhookId(webhook.id);
                                                                setIsDeleteWebhookOpen(true);
                                                            }}
                                                        >
                                                            <Trash2 className="h-4 w-4 mr-2" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>

                                        {webhook.lastTriggered && (
                                            <div className="mt-3 text-xs text-slate-500 dark:text-slate-400 flex items-center">
                                                <Clock className="h-3 w-3 mr-1" />
                                                Last triggered: {formatDate(webhook.lastTriggered)}
                                            </div>
                                        )}

                                        <Tabs defaultValue="logs" className="mt-4 dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg">
                                            <TabsList className="h-8">
                                                <TabsTrigger value="logs" className="text-xs h-7">Recent Deliveries</TabsTrigger>
                                                <TabsTrigger value="test" className="text-xs h-7">Test Webhook</TabsTrigger>
                                            </TabsList>
                                            <TabsContent value="logs" className="pt-3">
                                                <div className="max-h-48 overflow-y-auto rounded border border-slate-200 dark:border-slate-800">
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead className="w-[150px]">Time</TableHead>
                                                                <TableHead className="w-[150px]">Event</TableHead>
                                                                <TableHead className="w-[100px]">Status</TableHead>
                                                                <TableHead className="text-right">Response Time</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {getLogsForWebhook(webhook.id).length > 0 ? (
                                                                getLogsForWebhook(webhook.id).map((log) => (
                                                                    <TableRow key={log.id}>
                                                                        <TableCell className="text-xs">
                                                                            {new Date(log.timestamp).toLocaleString()}
                                                                        </TableCell>
                                                                        <TableCell>
                                                                            <Badge variant="secondary" className="text-xs">
                                                                                {log.event}
                                                                            </Badge>
                                                                        </TableCell>
                                                                        <TableCell>
                                                                            <Badge
                                                                                variant={log.status === 'success' ? 'secondary' : 'destructive'}
                                                                                className="text-xs"
                                                                            >
                                                                                {log.responseStatus}
                                                                            </Badge>
                                                                        </TableCell>
                                                                        <TableCell className="text-right text-xs">
                                                                            {log.responseTime} ms
                                                                        </TableCell>
                                                                    </TableRow>
                                                                ))
                                                            ) : (
                                                                <TableRow>
                                                                    <TableCell colSpan={4} className="text-center text-sm text-slate-500 dark:text-slate-400 h-20">
                                                                        No recent webhook deliveries
                                                                    </TableCell>
                                                                </TableRow>
                                                            )}
                                                        </TableBody>
                                                    </Table>
                                                </div>
                                            </TabsContent>
                                            <TabsContent value="test" className="pt-3">
                                                <div className="p-3 border border-slate-200 dark:border-slate-800 rounded-lg space-y-3">
                                                    <Select defaultValue="task.created">
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder="Select event" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {webhook.events.map((event) => (
                                                                <SelectItem key={event} value={event}>
                                                                    {event}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <Button
                                                        className="w-full"
                                                        onClick={() => {
                                                            toast({
                                                                title: "Test webhook sent",
                                                                description: "Check your endpoint for the test delivery.",
                                                                variant: "default",
                                                            });
                                                        }}
                                                    >
                                                        Send Test Event
                                                    </Button>
                                                </div>
                                            </TabsContent>
                                        </Tabs>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-12 text-center border border-dashed border-slate-300 dark:border-slate-700 rounded-lg">
                                <div className="flex justify-center mb-4">
                                    <WebhookIcon className="h-12 w-12 text-slate-400" />
                                </div>
                                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                                    No Webhooks Configured
                                </h3>
                                <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-6">
                                    Configure webhooks to receive real-time notifications about task executions, transactions, and more.
                                </p>
                                <Button
                                    onClick={() => setIsCreateWebhookOpen(true)}
                                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create Your First Webhook
                                </Button>
                            </div>
                        )}

                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mt-6 text-sm">
                            <div className="flex space-x-3">
                                <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                                <div>
                                    <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-1">About Webhooks</h4>
                                    <p className="text-blue-600 dark:text-blue-400">
                                        Webhooks allow your applications to receive real-time updates about events in your MetaPilot account. We'll send HTTP POST requests to your specified URL with event data.
                                    </p>
                                    <Button
                                        variant="link"
                                        className="text-blue-700 dark:text-blue-300 px-0 h-auto"
                                    >
                                        Learn more about webhooks
                                        <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Webhook Logs */}
            <motion.div variants={itemVariants}>
                <Card className='dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg'>
                    <CardHeader>
                        <CardTitle>Webhook Delivery Logs</CardTitle>
                        <CardDescription>
                            View recent webhook delivery attempts and their status
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[200px]">Time</TableHead>
                                        <TableHead className="w-[200px]">Webhook</TableHead>
                                        <TableHead>Event</TableHead>
                                        <TableHead className="w-[100px]">Status</TableHead>
                                        <TableHead className="text-right">Response</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {webhookLogs.map((log) => {
                                        const webhook = webhooks.find(w => w.id === log.webhookId);
                                        return (
                                            <TableRow key={log.id}>
                                                <TableCell className="text-sm">
                                                    {formatDate(log.timestamp)}
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    {webhook?.name || "Unknown Webhook"}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary">
                                                        {log.event}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={log.status === 'success' ? 'secondary' : 'destructive'}
                                                    >
                                                        {log.status === 'success' ? 'Success' : 'Failed'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end space-x-2">
                                                        <Badge
                                                            variant={log.status === 'success' ? 'outline' : 'destructive'}
                                                            className="font-mono"
                                                        >
                                                            {log.responseStatus}
                                                        </Badge>
                                                        <span className="text-xs text-slate-500 dark:text-slate-400">
                                                            {log.responseTime} ms
                                                        </span>
                                                    </div>
                                                    {log.responseBody && (
                                                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                            {log.responseBody}
                                                        </div>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>

                        <div className="flex justify-end mt-4">
                            <Button variant="outline" size="sm">
                                View All Logs
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Create Webhook Dialog */}
            <Dialog open={isCreateWebhookOpen} onOpenChange={setIsCreateWebhookOpen}>
                <DialogContent className="sm:max-w-[550px] dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg">
                    <DialogHeader>
                        <DialogTitle>Create Webhook</DialogTitle>
                        <DialogDescription>
                            Configure a new webhook endpoint to receive event updates
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4 dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg">
                        <div className="space-y-2">
                            <Label htmlFor="webhook-name">Webhook Name</Label>
                            <Input
                                id="webhook-name"
                                placeholder="e.g., Task Notifications"
                                value={webhookForm.name}
                                onChange={(e) => setWebhookForm({ ...webhookForm, name: e.target.value })}
                            />
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                A descriptive name to identify this webhook
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="webhook-url">Endpoint URL</Label>
                            <Input
                                id="webhook-url"
                                placeholder="https://example.com/webhook"
                                value={webhookForm.url}
                                onChange={(e) => setWebhookForm({ ...webhookForm, url: e.target.value })}
                            />
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                The URL that will receive webhook events
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label>Events to Send</Label>
                            <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-lg space-y-2 max-h-48 overflow-y-auto">
                                {availableEvents.map((event) => (
                                    <div key={event.value} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`event-${event.value}`}
                                            checked={webhookForm.events.includes(event.value)}
                                            onCheckedChange={(checked) => {
                                                if (checked) {
                                                    setWebhookForm({
                                                        ...webhookForm,
                                                        events: [...webhookForm.events, event.value]
                                                    });
                                                } else {
                                                    setWebhookForm({
                                                        ...webhookForm,
                                                        events: webhookForm.events.filter(e => e !== event.value)
                                                    });
                                                }
                                            }}
                                        />
                                        <Label htmlFor={`event-${event.value}`} className="text-sm">
                                            {event.label}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Select which events will trigger this webhook
                            </p>
                        </div>

                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-start space-x-2 text-sm">
                            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                            <p className="text-blue-600 dark:text-blue-400">
                                A webhook secret will be generated automatically. This secret is used to verify that requests are coming from MetaPilot.
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateWebhookOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                            onClick={handleCreateWebhook}
                        >
                            Create Webhook
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Webhook Dialog */}
            <Dialog open={isEditWebhookOpen} onOpenChange={setIsEditWebhookOpen}>
                <DialogContent className="sm:max-w-[550px] dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg">
                    <DialogHeader>
                        <DialogTitle>Edit Webhook</DialogTitle>
                        <DialogDescription>
                            Modify your webhook configuration
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-webhook-name">Webhook Name</Label>
                            <Input
                                id="edit-webhook-name"
                                value={webhookForm.name}
                                onChange={(e) => setWebhookForm({ ...webhookForm, name: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-webhook-url">Endpoint URL</Label>
                            <Input
                                id="edit-webhook-url"
                                value={webhookForm.url}
                                onChange={(e) => setWebhookForm({ ...webhookForm, url: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Events to Send</Label>
                            <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-lg space-y-2 max-h-48 overflow-y-auto">
                                {availableEvents.map((event) => (
                                    <div key={event.value} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`edit-event-${event.value}`}
                                            checked={webhookForm.events.includes(event.value)}
                                            onCheckedChange={(checked) => {
                                                if (checked) {
                                                    setWebhookForm({
                                                        ...webhookForm,
                                                        events: [...webhookForm.events, event.value]
                                                    });
                                                } else {
                                                    setWebhookForm({
                                                        ...webhookForm,
                                                        events: webhookForm.events.filter(e => e !== event.value)
                                                    });
                                                }
                                            }}
                                        />
                                        <Label htmlFor={`edit-event-${event.value}`} className="text-sm">
                                            {event.label}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditWebhookOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                            onClick={handleEditWebhook}
                        >
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* View Secret Dialog */}
            <Dialog open={isViewSecretOpen} onOpenChange={setIsViewSecretOpen}>
                <DialogContent className="sm:max-w-[500px] w-[95vw] max-h-[90vh] overflow-y-auto dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg p-6">
                    <DialogHeader className="space-y-2 pb-2">
                        <DialogTitle className="text-xl font-semibold">Webhook Secret</DialogTitle>
                        <DialogDescription className="text-sm text-slate-600 dark:text-slate-400">
                            Use this secret to verify webhook signatures
                        </DialogDescription>
                    </DialogHeader>
                    {selectedWebhook && (
                        <div className="py-3 space-y-5">
                            <div className="space-y-2">
                                <Label className="font-medium">Webhook Secret</Label>
                                <div className="relative flex items-center w-full">
                                    <Input
                                        value={showSecret ? selectedWebhook.secret : '•'.repeat(selectedWebhook.secret.length)}
                                        readOnly
                                        className="font-mono pr-20 text-sm w-full truncate"
                                    />
                                    <div className="absolute right-0 pr-3 flex space-x-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => setShowSecret(!showSecret)}
                                        >
                                            {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => handleCopy(selectedWebhook.secret, "Secret copied to clipboard")}
                                        >
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Use this secret to verify that webhook events are coming from MetaPilot
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label className="font-medium">Signature Verification</Label>
                                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg font-mono text-xs overflow-x-auto">
                                    <div className="whitespace-pre-wrap break-words">
                                        {`// Example signature verification in Node.js
const crypto = require('crypto');

const verifyWebhookSignature = (payload, signature, secret) => {
  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(digest)
  );
};`}
                                    </div>
                                </div>
                            </div>

                            <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg flex items-start space-x-2 text-sm">
                                <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                                <div className="text-orange-600 dark:text-orange-400 text-sm">
                                    Keep this secret secure. You won't be able to view it again after closing this dialog, but you can always generate a new secret.
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter className="flex flex-col-reverse sm:flex-row gap-3 justify-between sm:justify-between pt-2">
                        <Button
                            variant="outline"
                            className="w-full sm:w-auto"
                            onClick={() => {
                                toast({
                                    title: "Secret rotated",
                                    description: "A new webhook secret has been generated.",
                                    variant: "default",
                                });
                            }}
                        >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Rotate Secret
                        </Button>
                        <Button
                            className="w-full sm:w-auto"
                            onClick={() => setIsViewSecretOpen(false)}
                        >
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Webhook Dialog */}
            <Dialog open={isDeleteWebhookOpen} onOpenChange={setIsDeleteWebhookOpen}>
                <DialogContent className="sm:max-w-[440px] dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg">
                    <DialogHeader>
                        <DialogTitle>Delete Webhook</DialogTitle>
                        <DialogDescription>
                            This action cannot be undone. This will permanently delete the webhook configuration.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedWebhook && (
                        <div className="py-4">
                            <div className="p-4 border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 rounded-lg mb-4">
                                <div className="flex space-x-3">
                                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                                    <div>
                                        <h4 className="font-medium text-red-700 dark:text-red-300">
                                            Are you sure you want to delete this webhook?
                                        </h4>
                                        <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                                            <strong>{selectedWebhook.name}</strong> will be permanently deleted. Your endpoint will no longer receive events from MetaPilot.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <WebhookIcon className="h-5 w-5 text-slate-500" />
                                    <div>
                                        <p className="font-medium text-slate-900 dark:text-white">{selectedWebhook.name}</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">{selectedWebhook.url}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteWebhookOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteWebhook}
                        >
                            Delete Webhook
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
};

// Additional components needed for the WebhookSettings
const Webhook = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M18 16.98h-5.99c-1.66 0-3.01-1.34-3.01-3s1.34-3 3.01-3H22" />
        <path d="M2 11.98h6c1.66 0 3.01 1.34 3.01 3s-1.34 3-3.01 3H6" />
        <line x1="6" y1="16" x2="6" y2="18" />
        <line x1="10" y1="8" x2="10" y2="6" />
        <line x1="14" y1="11.98" x2="18" y2="11.98" />
        <line x1="2" y1="11.98" x2="6" y2="11.98" />
    </svg>
);

const EllipsisVertical = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <circle cx="12" cy="12" r="1" />
        <circle cx="12" cy="5" r="1" />
        <circle cx="12" cy="19" r="1" />
    </svg>
);


export default WebhookSettings;