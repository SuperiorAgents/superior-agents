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
import { Badge } from '@/components/ui/badge';
import {
    CreditCard,
    Check,
    Zap,
    Shield,
    Clock,
    Calendar,
    ChevronRight,
    ChevronsUpDown,
    AlertTriangle,
    LucideIcon,
    Cpu,
    LineChart,
    CheckCircle2,
    X,
    Trash,
    Download,
    Wallet,
    Plus,
    ExternalLink,
    Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger
} from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

// Animation variants
const pageVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
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

// Types definitions
interface Plan {
    id: string;
    name: string;
    price: string;
    description: string;
    features: string[];
    isPopular?: boolean;
    isEnterprise?: boolean;
    taskLimit: number;
    taskFrequency: string;
    chains: string[];
    apiAccess: boolean;
    supportLevel: string;
}

interface PaymentMethod {
    id: string;
    type: 'card' | 'crypto';
    lastFour?: string;
    expiryDate?: string;
    network?: string;
    address?: string;
    isDefault: boolean;
    cardBrand?: string;
}

interface Invoice {
    id: string;
    date: Date;
    amount: string;
    status: 'paid' | 'pending' | 'failed';
    description: string;
    downloadUrl: string;
}

// Sample data
const plans: Plan[] = [
    {
        id: 'free',
        name: 'Free',
        price: '$0',
        description: 'Perfect for getting started and exploring basic automation',
        features: [
            '3 active tasks',
            'Standard execution times',
            'Main Ethereum network only',
            'Community support',
            '24-hour activity history'
        ],
        taskLimit: 3,
        taskFrequency: 'Every 24 hours',
        chains: ['Ethereum'],
        apiAccess: false,
        supportLevel: 'Community'
    },
    {
        id: 'pro',
        name: 'Pro',
        price: '$19/month',
        description: 'For active traders and DeFi enthusiasts',
        features: [
            'Unlimited active tasks',
            'Priority execution',
            'All supported networks',
            'API access',
            'Email support',
            '30-day activity history'
        ],
        isPopular: true,
        taskLimit: 50,
        taskFrequency: 'Every 1 hour',
        chains: ['Ethereum', 'Polygon', 'Arbitrum', 'Optimism', 'Base'],
        apiAccess: true,
        supportLevel: 'Email'
    },
    {
        id: 'enterprise',
        name: 'Enterprise',
        price: 'Contact Us',
        description: 'Custom solutions for institutions and DAOs',
        features: [
            'Unlimited active tasks',
            'High-priority execution',
            'All networks including custom chains',
            'Full API access',
            'Dedicated support manager',
            'Custom integrations',
            'SLA guarantees'
        ],
        isEnterprise: true,
        taskLimit: Infinity,
        taskFrequency: 'Real-time',
        chains: ['All chains + Custom'],
        apiAccess: true,
        supportLevel: 'Dedicated'
    }
];

const paymentMethods: PaymentMethod[] = [
    {
        id: 'pm-1',
        type: 'card',
        lastFour: '4242',
        expiryDate: '12/25',
        isDefault: true,
        cardBrand: 'visa'
    },
    {
        id: 'pm-2',
        type: 'crypto',
        network: 'Ethereum',
        address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
        isDefault: false
    }
];

const invoices: Invoice[] = [
    {
        id: 'inv-001',
        date: new Date(2025, 3, 25),
        amount: '$19.00',
        status: 'paid',
        description: 'MetaPilot Pro - April 2025',
        downloadUrl: '#'
    },
    {
        id: 'inv-002',
        date: new Date(2025, 2, 25),
        amount: '$19.00',
        status: 'paid',
        description: 'MetaPilot Pro - March 2025',
        downloadUrl: '#'
    },
    {
        id: 'inv-003',
        date: new Date(2025, 1, 25),
        amount: '$19.00',
        status: 'paid',
        description: 'MetaPilot Pro - February 2025',
        downloadUrl: '#'
    }
];

// Current usage stats
const usageStats = {
    activeTasks: 12,
    maxTasks: 50,
    tasksThisMonth: 86,
    apiCalls: 324
};

// Helper function to format date
const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    }).format(date);
};

// Helper function for payment method icon
const getPaymentMethodIcon = (method: PaymentMethod) => {
    if (method.type === 'card') {
        return <CreditCard className="h-5 w-5 text-slate-600 dark:text-slate-400" />;
    } else {
        return <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
    }
};

// Feature item component
interface FeatureItemProps {
    feature: string;
    included: boolean;
}

const FeatureItem: React.FC<FeatureItemProps> = ({ feature, included }) => (
    <div className="flex items-center space-x-2">
        {included ? (
            <Check className="h-4 w-4 text-green-500" />
        ) : (
            <div className="h-4 w-4 border rounded-full border-slate-300 dark:border-slate-600" />
        )}
        <span className={cn(
            "text-sm",
            included ? "text-slate-900 dark:text-slate-100" : "text-slate-500 dark:text-slate-500"
        )}>
            {feature}
        </span>
    </div>
);

// Plan card component
interface PlanCardProps {
    plan: Plan;
    isCurrentPlan?: boolean;
    onSelect: (planId: string) => void;
}

const PlanCard: React.FC<PlanCardProps> = ({ plan, isCurrentPlan, onSelect }) => (
    <Card className={cn(
        "flex flex-col transition-all",
        plan.isPopular ? "border-blue-200 dark:border-blue-800/50 dark:bg-blue-900/5 shadow-lg" :
            "dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg",
        isCurrentPlan && "ring-2 ring-blue-500 dark:ring-blue-400"
    )}>
        {plan.isPopular && (
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-medium text-center py-1">
                MOST POPULAR
            </div>
        )}

        <CardHeader className={plan.isPopular ? "pt-4" : ""}>
            <div className="flex justify-between items-start">
                <div>
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <CardDescription className="mt-1.5">{plan.description}</CardDescription>
                </div>
                {isCurrentPlan && (
                    <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/60">
                        Current Plan
                    </Badge>
                )}
            </div>
            <div className="mt-2">
                <span className="text-3xl font-bold text-slate-900 dark:text-white">{plan.price}</span>
                {!plan.isEnterprise && <span className="text-slate-600 dark:text-slate-400 ml-1">per month</span>}
            </div>
        </CardHeader>

        <CardContent className="flex-grow">
            <div className="space-y-3">
                {plan.features.map((feature, index) => (
                    <FeatureItem key={index} feature={feature} included={true} />
                ))}
            </div>
        </CardContent>

        <CardFooter className="pt-2 pb-6">
            <Button
                className={cn(
                    "w-full",
                    plan.isPopular ?
                        "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white" :
                        isCurrentPlan ? "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700" : ""
                )}
                variant={!plan.isPopular && !isCurrentPlan ? "outline" : "default"}
                onClick={() => onSelect(plan.id)}
                disabled={isCurrentPlan}
            >
                {isCurrentPlan ? 'Current Plan' : plan.isEnterprise ? 'Contact Sales' : 'Upgrade'}
            </Button>
        </CardFooter>
    </Card>
);

const BillingPage: React.FC = () => {
    const [selectedPlan, setSelectedPlan] = useState('pro');
    const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
    const [showChangePlanDialog, setShowChangePlanDialog] = useState(false);
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [showAddPaymentDialog, setShowAddPaymentDialog] = useState(false);
    const [showEditPaymentDialog, setShowEditPaymentDialog] = useState(false);
    const [showRemovePaymentDialog, setShowRemovePaymentDialog] = useState(false);
    const [showContactSalesDialog, setShowContactSalesDialog] = useState(false);
    const [selectedUpgradePlan, setSelectedUpgradePlan] = useState<Plan | null>(null);
    const [editingPaymentMethod, setEditingPaymentMethod] = useState<PaymentMethod | null>(null);
    const [removingPaymentMethod, setRemovingPaymentMethod] = useState<PaymentMethod | null>(null);
    const [paymentType, setPaymentType] = useState<'card' | 'crypto'>('card');
    const { toast } = useToast();

    const handleSelectPlan = (planId: string) => {
        const plan = plans.find(p => p.id === planId);
        if (plan && plan.id !== selectedPlan) {
            if (plan.isEnterprise) {
                setShowContactSalesDialog(true);
            } else {
                setSelectedUpgradePlan(plan);
                setShowUpgradeDialog(true);
            }
        }
    };

    const handleUpgrade = () => {
        if (selectedUpgradePlan) {
            setSelectedPlan(selectedUpgradePlan.id);
            setShowUpgradeDialog(false);
            toast({
                title: "Plan updated",
                description: `You have successfully upgraded to the ${selectedUpgradePlan.name} plan.`,
                variant: "default",
            });
        }
    };

    const handleChangePlan = () => {
        setShowChangePlanDialog(true);
    };

    const handleCancelSubscription = () => {
        setShowCancelDialog(true);
    };

    const confirmCancelSubscription = () => {
        setSelectedPlan('free');
        setShowCancelDialog(false);
        toast({
            title: "Subscription canceled",
            description: "Your subscription has been canceled. You've been downgraded to the Free plan.",
            variant: "default",
        });
    };

    const handleEditPaymentMethod = (method: PaymentMethod) => {
        setEditingPaymentMethod(method);
        setShowEditPaymentDialog(true);
    };

    const handleRemovePaymentMethod = (method: PaymentMethod) => {
        setRemovingPaymentMethod(method);
        setShowRemovePaymentDialog(true);
    };

    const confirmRemovePaymentMethod = () => {
        if (removingPaymentMethod) {
            // In a real app, this would call an API to remove the payment method
            toast({
                title: "Payment method removed",
                description: "Your payment method has been successfully removed.",
                variant: "default",
            });
            setShowRemovePaymentDialog(false);
        }
    };

    const handleSetDefaultPaymentMethod = (method: PaymentMethod) => {
        // In a real app, this would call an API to set the default payment method
        toast({
            title: "Default payment method updated",
            description: "Your default payment method has been updated.",
            variant: "default",
        });
    };

    const handleAddPaymentMethod = () => {
        setShowAddPaymentDialog(true);
    };

    const confirmAddPaymentMethod = () => {
        // In a real app, this would call an API to add the payment method
        toast({
            title: "Payment method added",
            description: "Your new payment method has been successfully added.",
            variant: "default",
        });
        setShowAddPaymentDialog(false);
    };

    const handleDownloadInvoice = (invoice: Invoice) => {
        // In a real app, this would trigger a download
        toast({
            title: "Invoice downloaded",
            description: `Invoice ${invoice.id} has been downloaded.`,
            variant: "default",
        });
    };

    const handleExportAllInvoices = () => {
        // In a real app, this would trigger a download of all invoices
        toast({
            title: "Invoices exported",
            description: "All invoices have been exported to CSV.",
            variant: "default",
        });
    };

    const handleContactSales = (formData: FormData) => {
        // In a real app, this would send the form data to the server
        toast({
            title: "Request submitted",
            description: "Your enterprise plan request has been submitted. Our sales team will contact you shortly.",
            variant: "default",
        });
        setShowContactSalesDialog(false);
    };

    return (
        <motion.div
            variants={pageVariants}
            initial="hidden"
            animate="visible"
            className="container mx-auto py-6 px-4 max-w-6xl"
        >
            {/* Header */}
            <motion.div variants={itemVariants} className="mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                    Billing & Plans
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                    Manage your subscription, payment methods, and billing history
                </p>
            </motion.div>

            {/* Current Plan & Usage */}
            <motion.div variants={itemVariants} className="mb-8">
                <Card className="dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg">
                    <CardHeader>
                        <CardTitle>Current Plan</CardTitle>
                        <CardDescription>
                            Your subscription and usage details
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-lg font-medium text-slate-900 dark:text-white flex items-center">
                                    {plans.find(p => p.id === selectedPlan)?.name} Plan
                                    <Badge className="ml-2 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/60">
                                        Active
                                    </Badge>
                                </h3>

                                <p className="mt-1 text-slate-600 dark:text-slate-400">
                                    {selectedPlan === 'free'
                                        ? 'Free plan with basic features'
                                        : selectedPlan === 'pro'
                                            ? 'Pro plan billed at $19/month'
                                            : 'Enterprise plan with custom pricing'}
                                </p>

                                <div className="mt-4">
                                    <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                                        <Clock className="h-4 w-4 mr-1.5" />
                                        <span>Renews on May 25, 2025</span>
                                    </div>

                                    <div className="flex items-center mt-1.5 text-sm text-slate-600 dark:text-slate-400">
                                        <Calendar className="h-4 w-4 mr-1.5" />
                                        <span>Active since January 25, 2025</span>
                                    </div>
                                </div>

                                <div className="mt-6 space-y-2">
                                    <Button
                                        variant="outline"
                                        className="w-full sm:w-auto mr-2"
                                        onClick={handleChangePlan}
                                        disabled={selectedPlan === 'enterprise'}
                                    >
                                        Change Plan
                                    </Button>

                                    {selectedPlan !== 'free' && (
                                        <Button
                                            variant="outline"
                                            className="w-full sm:w-auto text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 border-red-200 dark:border-red-900/30"
                                            onClick={handleCancelSubscription}
                                        >
                                            Cancel Subscription
                                        </Button>
                                    )}
                                </div>
                            </div>

                            <div className="border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 pt-4 md:pt-0 md:pl-6">
                                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">
                                    Usage Statistics
                                </h3>

                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-slate-600 dark:text-slate-400">Active Tasks</span>
                                            <span className="font-medium text-slate-900 dark:text-slate-100">
                                                {usageStats.activeTasks} / {usageStats.maxTasks}
                                            </span>
                                        </div>
                                        <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-blue-500 dark:bg-blue-600 rounded-full"
                                                style={{ width: `${(usageStats.activeTasks / usageStats.maxTasks) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    <div className="flex justify-between">
                                        <div>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">Total Tasks This Month</p>
                                            <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mt-1">
                                                {usageStats.tasksThisMonth}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">API Calls</p>
                                            <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mt-1">
                                                {usageStats.apiCalls}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="pt-3">
                                        <Button
                                            variant="link"
                                            className="p-0 h-auto text-blue-600 dark:text-blue-400 flex items-center"
                                        >
                                            View detailed usage stats
                                            <ChevronRight className="h-4 w-4 ml-1" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Plans Comparison */}
            <motion.div variants={itemVariants} className="mb-8">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">
                    Available Plans
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {plans.map((plan) => (
                        <PlanCard
                            key={plan.id}
                            plan={plan}
                            isCurrentPlan={plan.id === selectedPlan}
                            onSelect={handleSelectPlan}
                        />
                    ))}
                </div>
            </motion.div>

            {/* Payment Methods */}
            <motion.div variants={itemVariants} className="mb-8">
                <Card className="dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Payment Methods</CardTitle>
                            <CardDescription>
                                Manage your payment options
                            </CardDescription>
                        </div>
                        <Button variant="outline" onClick={handleAddPaymentMethod}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Payment Method
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {paymentMethods.map((method) => (
                                <div
                                    key={method.id}
                                    className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-800 rounded-lg"
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                            {getPaymentMethodIcon(method)}
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-900 dark:text-slate-100">
                                                {method.type === 'card'
                                                    ? `${method.cardBrand?.toUpperCase() || 'Card'} ending in ${method.lastFour}`
                                                    : `${method.network} Wallet`}
                                            </p>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                                {method.type === 'card'
                                                    ? `Expires ${method.expiryDate}`
                                                    : `${method.address?.substring(0, 6)}...${method.address?.substring(method.address.length - 4)}`}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        {method.isDefault && (
                                            <Badge variant="outline" className="border-green-200 dark:border-green-900/30 text-green-700 dark:text-green-400">
                                                Default
                                            </Badge>
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleEditPaymentMethod(method)}
                                        >
                                            Edit
                                        </Button>
                                        {!method.isDefault && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-red-600 dark:text-red-400"
                                                onClick={() => handleRemovePaymentMethod(method)}
                                            >
                                                Remove
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Billing History */}
            <motion.div variants={itemVariants}>
                <Card className="dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Billing History</CardTitle>
                            <CardDescription>
                                View and download past invoices
                            </CardDescription>
                        </div>
                        <Button variant="outline" onClick={handleExportAllInvoices}>
                            <Download className="h-4 w-4 mr-2" />
                            Export All
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {invoices.map((invoice) => (
                                    <TableRow key={invoice.id}>
                                        <TableCell className="font-medium">
                                            {formatDate(invoice.date)}
                                        </TableCell>
                                        <TableCell>{invoice.description}</TableCell>
                                        <TableCell>{invoice.amount}</TableCell>
                                        <TableCell>
                                            <Badge className={cn(
                                                invoice.status === 'paid' ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                                                    invoice.status === 'pending' ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                                                        "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                            )}>
                                                {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 text-blue-600 dark:text-blue-400"
                                                onClick={() => handleDownloadInvoice(invoice)}
                                            >
                                                <Download className="h-3.5 w-3.5 mr-1" />
                                                Download
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Upgrade Dialog */}
            <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
                <DialogContent className="dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg max-w-md">
                    <DialogHeader>
                        <DialogTitle>Upgrade to {selectedUpgradePlan?.name}</DialogTitle>
                        <DialogDescription>
                            You are about to change your subscription plan.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedUpgradePlan && (
                        <div className="py-4">
                            <div className="flex justify-between items-center mb-4">
                                <span className="font-medium">New Plan:</span>
                                <span className="font-bold text-slate-900 dark:text-slate-100">{selectedUpgradePlan.name}</span>
                            </div>

                            <div className="flex justify-between items-center mb-4">
                                <span className="font-medium">Price:</span>
                                <span>{selectedUpgradePlan.price}</span>
                            </div>

                            <div className="mb-4">
                                <span className="font-medium">Includes:</span>
                                <ul className="mt-2 space-y-2">
                                    {selectedUpgradePlan.features.map((feature, index) => (
                                        <li key={index} className="flex items-center">
                                            <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                                            <span className="text-slate-700 dark:text-slate-300">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-900/30">
                                <p className="text-sm text-blue-700 dark:text-blue-300">
                                    Your new plan will be effective immediately. You'll be charged the prorated amount for the remainder of your billing cycle.
                                </p>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowUpgradeDialog(false)}>
                            Cancel
                        </Button>
                        <Button
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                            onClick={handleUpgrade}
                        >
                            Confirm Upgrade
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Change Plan Dialog */}
            <Dialog open={showChangePlanDialog} onOpenChange={setShowChangePlanDialog}>
                <DialogContent className="dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg max-w-md">
                    <DialogHeader>
                        <DialogTitle>Change Your Plan</DialogTitle>
                        <DialogDescription>
                            Select a new plan below
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4 space-y-4">
                        <RadioGroup defaultValue={selectedPlan}>
                            {plans.filter(p => !p.isEnterprise).map((plan) => (
                                <div key={plan.id} className="flex items-center space-x-2 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                                    <RadioGroupItem value={plan.id} id={plan.id} />
                                    <Label htmlFor={plan.id} className="flex flex-1 justify-between cursor-pointer">
                                        <div>
                                            <span className="font-medium text-slate-900 dark:text-slate-100">{plan.name}</span>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">{plan.taskLimit} tasks</p>
                                        </div>
                                        <span className="font-medium">{plan.price}</span>
                                    </Label>
                                </div>
                            ))}
                        </RadioGroup>

                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-900/30">
                            <p className="text-sm text-blue-700 dark:text-blue-300">
                                Your new plan will be effective immediately. Downgrading may affect your active tasks.
                            </p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowChangePlanDialog(false)}>
                            Cancel
                        </Button>
                        <Button
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                            onClick={() => {
                                // Handle plan change
                                setShowChangePlanDialog(false);
                                toast({
                                    title: "Plan changed",
                                    description: "Your plan has been updated successfully.",
                                    variant: "default",
                                });
                            }}
                        >
                            Confirm Change
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Cancel Subscription Dialog */}
            <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                <DialogContent className="dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg max-w-md">
                    <DialogHeader>
                        <DialogTitle>Cancel Subscription</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to cancel your subscription?
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                        <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-100 dark:border-amber-900/30 mb-4">
                            <div className="flex gap-2">
                                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                                        What happens when you cancel:
                                    </p>
                                    <ul className="mt-2 text-sm text-amber-600 dark:text-amber-400 space-y-1 list-disc pl-5">
                                        <li>Your subscription will end immediately</li>
                                        <li>You'll be downgraded to the Free plan</li>
                                        <li>Tasks exceeding the Free plan limit will be paused</li>
                                        <li>Your data and history will remain intact</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                                <Label htmlFor="cancelReason" className="flex-shrink-0">Reason for cancellation</Label>
                                <Select defaultValue="too-expensive">
                                    <SelectTrigger id="cancelReason">
                                        <SelectValue placeholder="Select a reason" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="too-expensive">Too expensive</SelectItem>
                                        <SelectItem value="not-using">Not using it enough</SelectItem>
                                        <SelectItem value="missing-features">Missing features</SelectItem>
                                        <SelectItem value="switching">Switching to another service</SelectItem>
                                        <SelectItem value="other">Other reason</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <Textarea
                                placeholder="Please provide any additional feedback about your experience..."
                                className="resize-none"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
                            Keep Subscription
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmCancelSubscription}
                        >
                            Confirm Cancellation
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Add Payment Method Dialog */}
            <Dialog open={showAddPaymentDialog} onOpenChange={setShowAddPaymentDialog}>
                <DialogContent className="dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add Payment Method</DialogTitle>
                        <DialogDescription>
                            Enter your payment details
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                        <div className="space-y-4">
                            <div className="flex border rounded-lg overflow-hidden">
                                <Button
                                    type="button"
                                    variant={paymentType === 'card' ? 'default' : 'outline'}
                                    className={cn(
                                        "rounded-none w-full border-0",
                                        paymentType === 'card' && "bg-gradient-to-r from-blue-600 to-indigo-600"
                                    )}
                                    onClick={() => setPaymentType('card')}
                                >
                                    <CreditCard className="h-4 w-4 mr-2" />
                                    Credit Card
                                </Button>
                                <Button
                                    type="button"
                                    variant={paymentType === 'crypto' ? 'default' : 'outline'}
                                    className={cn(
                                        "rounded-none w-full border-0",
                                        paymentType === 'crypto' && "bg-gradient-to-r from-blue-600 to-indigo-600"
                                    )}
                                    onClick={() => setPaymentType('crypto')}
                                >
                                    <Wallet className="h-4 w-4 mr-2" />
                                    Crypto Wallet
                                </Button>
                            </div>

                            {paymentType === 'card' ? (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="cardNumber">Card Number</Label>
                                        <Input id="cardNumber" placeholder="1234 5678 9012 3456" />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="expiryDate">Expiry Date</Label>
                                            <Input id="expiryDate" placeholder="MM/YY" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="cvv">CVV</Label>
                                            <Input id="cvv" placeholder="123" type="password" />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="nameOnCard">Name on Card</Label>
                                        <Input id="nameOnCard" placeholder="John Doe" />
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="network">Blockchain Network</Label>
                                        <Select defaultValue="ethereum">
                                            <SelectTrigger id="network">
                                                <SelectValue placeholder="Select network" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="ethereum">Ethereum</SelectItem>
                                                <SelectItem value="polygon">Polygon</SelectItem>
                                                <SelectItem value="arbitrum">Arbitrum</SelectItem>
                                                <SelectItem value="optimism">Optimism</SelectItem>
                                                <SelectItem value="base">Base</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="walletAddress">Wallet Address</Label>
                                        <Input id="walletAddress" placeholder="0x..." />
                                    </div>

                                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-900/30">
                                        <p className="text-sm text-blue-700 dark:text-blue-300 flex items-start gap-2">
                                            <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                            <span>We'll generate a unique payment link for each invoice that you can pay from your wallet.</span>
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center space-x-2 pt-2">
                                <Switch id="setDefault" defaultChecked />
                                <Label htmlFor="setDefault">Set as default payment method</Label>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAddPaymentDialog(false)}>
                            Cancel
                        </Button>
                        <Button
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                            onClick={confirmAddPaymentMethod}
                        >
                            Add Payment Method
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Payment Method Dialog */}
            <Dialog open={showEditPaymentDialog} onOpenChange={setShowEditPaymentDialog}>
                <DialogContent className="dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit Payment Method</DialogTitle>
                        <DialogDescription>
                            Update your payment details
                        </DialogDescription>
                    </DialogHeader>

                    {editingPaymentMethod && (
                        <div className="py-4">
                            <div className="space-y-4">
                                {editingPaymentMethod.type === 'card' ? (
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="cardNumber">Card Number</Label>
                                            <Input id="cardNumber" value={`•••• •••• •••• ${editingPaymentMethod.lastFour}`} disabled />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="expiryDate">Expiry Date</Label>
                                                <Input id="expiryDate" defaultValue={editingPaymentMethod.expiryDate} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="newCvv">New CVV (optional)</Label>
                                                <Input id="newCvv" placeholder="123" type="password" />
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="network">Blockchain Network</Label>
                                            <Input id="network" value={editingPaymentMethod.network} disabled />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="walletAddress">Wallet Address</Label>
                                            <Input id="walletAddress" value={editingPaymentMethod.address} disabled />
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center space-x-2 pt-2">
                                    <Switch id="makeDefault" defaultChecked={editingPaymentMethod.isDefault} />
                                    <Label htmlFor="makeDefault">Set as default payment method</Label>
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowEditPaymentDialog(false)}>
                            Cancel
                        </Button>
                        <Button
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                            onClick={() => {
                                setShowEditPaymentDialog(false);
                                toast({
                                    title: "Payment method updated",
                                    description: "Your payment method has been updated successfully.",
                                    variant: "default",
                                });
                            }}
                        >
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Remove Payment Method Dialog */}
            <Dialog open={showRemovePaymentDialog} onOpenChange={setShowRemovePaymentDialog}>
                <DialogContent className="dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg max-w-md">
                    <DialogHeader>
                        <DialogTitle>Remove Payment Method</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to remove this payment method?
                        </DialogDescription>
                    </DialogHeader>

                    {removingPaymentMethod && (
                        <div className="py-4">
                            <div className="flex items-center space-x-4 p-4 border border-slate-200 dark:border-slate-800 rounded-lg mb-4">
                                <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                    {getPaymentMethodIcon(removingPaymentMethod)}
                                </div>
                                <div>
                                    <p className="font-medium text-slate-900 dark:text-slate-100">
                                        {removingPaymentMethod.type === 'card'
                                            ? `${removingPaymentMethod.cardBrand?.toUpperCase() || 'Card'} ending in ${removingPaymentMethod.lastFour}`
                                            : `${removingPaymentMethod.network} Wallet`}
                                    </p>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                        {removingPaymentMethod.type === 'card'
                                            ? `Expires ${removingPaymentMethod.expiryDate}`
                                            : `${removingPaymentMethod.address?.substring(0, 6)}...${removingPaymentMethod.address?.substring(removingPaymentMethod.address.length - 4)}`}
                                    </p>
                                </div>
                            </div>

                            <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg border border-amber-100 dark:border-amber-900/30">
                                <p className="text-sm text-amber-700 dark:text-amber-300 flex items-start gap-2">
                                    <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                    <span>You will need to add a new payment method for future billing cycles.</span>
                                </p>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowRemovePaymentDialog(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmRemovePaymentMethod}
                        >
                            Remove Payment Method
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Contact Sales Dialog */}
            <Dialog open={showContactSalesDialog} onOpenChange={setShowContactSalesDialog}>
                <DialogContent className="dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg max-w-md">
                    <DialogHeader>
                        <DialogTitle>Contact Sales for Enterprise Plan</DialogTitle>
                        <DialogDescription>
                            Please fill out the form below and our team will get back to you
                        </DialogDescription>
                    </DialogHeader>

                    <form className="py-4 space-y-4" action={handleContactSales}>
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input id="name" name="name" placeholder="Your name" required />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="companyEmail">Company Email</Label>
                            <Input id="companyEmail" name="email" type="email" placeholder="email@company.com" required />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="company">Company</Label>
                            <Input id="company" name="company" placeholder="Your company" required />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="tasksPerMonth">Estimated Tasks per Month</Label>
                            <Select defaultValue="100-500" name="tasksPerMonth">
                                <SelectTrigger id="tasksPerMonth">
                                    <SelectValue placeholder="Select range" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="<100">Less than 100</SelectItem>
                                    <SelectItem value="100-500">100 - 500</SelectItem>
                                    <SelectItem value="500-1000">500 - 1,000</SelectItem>
                                    <SelectItem value="1000-5000">1,000 - 5,000</SelectItem>
                                    <SelectItem value=">5000">More than 5,000</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="requirements">Specific Requirements</Label>
                            <Textarea
                                id="requirements"
                                name="requirements"
                                placeholder="Please let us know about your specific needs or questions..."
                                className="resize-none"
                                rows={4}
                            />
                        </div>

                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-900/30">
                            <p className="text-sm text-blue-700 dark:text-blue-300 flex items-start gap-2">
                                <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                <span>Our team will contact you within 1 business day to discuss your Enterprise plan options.</span>
                            </p>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setShowContactSalesDialog(false)}>
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                            >
                                Submit Request
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
};

export default BillingPage;