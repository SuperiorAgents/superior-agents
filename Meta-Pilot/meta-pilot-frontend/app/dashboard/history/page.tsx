"use client";

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    Card,
    CardContent,
    CardHeader,
    CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
    Activity,
    Calendar,
    Check,
    ChevronLeft,
    ChevronRight,
    Download,
    ExternalLink,
    Search,
    SlidersHorizontal,
    Zap,
    AlertTriangle,
    X,
    Info,
    Clock
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose
} from '@/components/ui/dialog';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { formatDate, cn } from '@/lib/utils';

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

// Mock transaction data
const transactions = [
    {
        id: "tx-1",
        date: new Date(2025, 4, 10, 14, 32),
        type: "dao-vote",
        description: "Voted YES on Nouns Proposal #427",
        amount: null,
        status: "success",
        network: "Ethereum",
        txHash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        gas: 0.0034,
        savedGas: 0.0012,
        task: "Nouns DAO Auto-Voting"
    },
    {
        id: "tx-2",
        date: new Date(2025, 4, 9, 8, 15),
        type: "swap",
        description: "Swapped 1.5 ETH for 2,850 USDC",
        amount: "1.5 ETH",
        status: "success",
        network: "Ethereum",
        txHash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
        gas: 0.0046,
        savedGas: 0.0022,
        task: "ETH/USDC Swap"
    },
    {
        id: "tx-3",
        date: new Date(2025, 4, 8, 22, 45),
        type: "yield",
        description: "Moved 5,000 USDC to Compound",
        amount: "5,000 USDC",
        status: "success",
        network: "Ethereum",
        txHash: "0x7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456",
        gas: 0.0031,
        savedGas: 0.0008,
        task: "Yield Optimizer"
    },
    {
        id: "tx-4",
        date: new Date(2025, 4, 7, 17, 30),
        type: "claim",
        description: "Claimed 42 COMP rewards",
        amount: "42 COMP",
        status: "success",
        network: "Ethereum",
        txHash: "0xdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abc",
        gas: 0.0028,
        savedGas: 0.0005,
        task: "Reward Claimer"
    },
    {
        id: "tx-5",
        date: new Date(2025, 4, 6, 9, 12),
        type: "dao-vote",
        description: "Voted NO on Compound Proposal #62",
        amount: null,
        status: "success",
        network: "Ethereum",
        txHash: "0x567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234",
        gas: 0.0022,
        savedGas: 0.0007,
        task: "Compound Governance"
    },
    {
        id: "tx-6",
        date: new Date(2025, 4, 5, 14, 25),
        type: "swap",
        description: "Swapped 500 USDC for 0.25 ETH",
        amount: "500 USDC",
        status: "failed",
        network: "Ethereum",
        txHash: "0x90abcdef1234567890abcdef1234567890abcdef1234567890abcdef12345678",
        gas: 0.0014,
        savedGas: 0,
        task: "USDC/ETH Swap",
        error: "Slippage exceeded"
    },
    {
        id: "tx-7",
        date: new Date(2025, 4, 11, 10, 15),
        type: "dao-vote",
        description: "Voting on MakerDAO Proposal #325",
        amount: null,
        status: "pending",
        network: "Ethereum",
        txHash: "0xf5a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2",
        gas: 0.0023,
        savedGas: 0,
        task: "MakerDAO Governance",
        pendingReason: "Waiting for confirmation"
    },
    {
        id: "tx-8",
        date: new Date(2025, 4, 4, 16, 45),
        type: "nft",
        description: "Purchased BAYC #3578",
        amount: "85 ETH",
        status: "failed",
        network: "Ethereum",
        txHash: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b",
        gas: 0.0062,
        savedGas: 0,
        task: "NFT Floor Hunter",
        error: "Transaction reverted: price increased during execution"
    }
];

// Define transaction type icon and color mappings
const getTransactionIcon = (type: string) => {
    switch (type) {
        case 'dao-vote':
            return <Badge className="h-8 w-8 rounded-full p-1.5 bg-blue-100 dark:bg-blue-900/30">
                <Activity className="h-full w-full text-blue-600 dark:text-blue-400" />
            </Badge>;
        case 'swap':
            return <Badge className="h-8 w-8 rounded-full p-1.5 bg-indigo-100 dark:bg-indigo-900/30">
                <svg className="h-full w-full text-indigo-600 dark:text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M7 10l5 5 5-5M7 15l5-5 5 5" />
                </svg>
            </Badge>;
        case 'yield':
            return <Badge className="h-8 w-8 rounded-full p-1.5 bg-green-100 dark:bg-green-900/30">
                <svg className="h-full w-full text-green-600 dark:text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
            </Badge>;
        case 'claim':
            return <Badge className="h-8 w-8 rounded-full p-1.5 bg-yellow-100 dark:bg-yellow-900/30">
                <svg className="h-full w-full text-yellow-600 dark:text-yellow-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8v16m0-16c-1.657 0-3 .895-3 2m3-2c1.657 0 3 .895 3 2m-9 8h18" />
                </svg>
            </Badge>;
        case 'nft':
            return <Badge className="h-8 w-8 rounded-full p-1.5 bg-purple-100 dark:bg-purple-900/30">
                <svg className="h-full w-full text-purple-600 dark:text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            </Badge>;
        default:
            return <Badge className="h-8 w-8 rounded-full p-1.5 bg-slate-100 dark:bg-slate-900/30">
                <Activity className="h-full w-full text-slate-600 dark:text-slate-400" />
            </Badge>;
    }
};

const getStatusBadge = (status: string) => {
    switch (status) {
        case 'success':
            return <Badge variant="outline" className="text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900/30">
                <Check className="h-3 w-3 mr-1" />
                Success
            </Badge>;
        case 'pending':
            return <Badge variant="outline" className="text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-900/30">
                <Clock className="h-3 w-3 mr-1" />
                Pending
            </Badge>;
        case 'failed':
            return <Badge variant="outline" className="text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30">
                <X className="h-3 w-3 mr-1" />
                Failed
            </Badge>;
        default:
            return <Badge variant="outline" className="text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                {status}
            </Badge>;
    }
};

// Transaction Details Modal
const TransactionDetailsModal = ({
    transaction,
    isOpen,
    onClose
}: {
    transaction: any,
    isOpen: boolean,
    onClose: () => void
}) => {
    if (!transaction) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3">
                        {getTransactionIcon(transaction.type)}
                        <span>Transaction Details</span>
                        {getStatusBadge(transaction.status)}
                    </DialogTitle>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="flex flex-col space-y-4">
                        <div className="rounded-md bg-slate-50 dark:bg-slate-800/50 p-4">
                            <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-2">{transaction.description}</h3>
                            <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                                <strong>Task:</strong> {transaction.task}
                            </div>
                            <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                                <strong>Date:</strong> {formatDate(transaction.date, 'PP')} at {formatDate(transaction.date, 'p')}
                            </div>
                            <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                                <strong>Network:</strong> {transaction.network}
                            </div>
                            {transaction.amount && (
                                <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                                    <strong>Amount:</strong> {transaction.amount}
                                </div>
                            )}
                            <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                                <strong>Gas Used:</strong> Ξ {transaction.gas.toFixed(4)}
                                {transaction.savedGas > 0 && (
                                    <span className="text-green-600 dark:text-green-400 ml-2">
                                        (Saved: Ξ {transaction.savedGas.toFixed(4)})
                                    </span>
                                )}
                            </div>
                            {transaction.status === 'failed' && transaction.error && (
                                <div className="text-sm text-red-600 dark:text-red-400 mt-2 flex items-start gap-2">
                                    <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <strong>Error:</strong> {transaction.error}
                                    </div>
                                </div>
                            )}
                            {transaction.status === 'pending' && transaction.pendingReason && (
                                <div className="text-sm text-amber-600 dark:text-amber-400 mt-2 flex items-start gap-2">
                                    <Clock className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <strong>Status:</strong> {transaction.pendingReason}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <div className="font-medium text-slate-900 dark:text-slate-100">Transaction Hash</div>
                            <div className="flex items-center gap-2">
                                <code className="bg-slate-100 dark:bg-slate-800 p-2 rounded text-xs font-mono w-full overflow-x-auto">
                                    {transaction.txHash}
                                </code>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => navigator.clipboard.writeText(transaction.txHash)}
                                    className="flex-shrink-0"
                                >
                                    Copy
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        asChild
                    >
                        <a
                            href={`https://etherscan.io/tx/${transaction.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View on Etherscan
                        </a>
                    </Button>
                    <Button onClick={onClose}>
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

// Error Details Modal
const ErrorDetailsModal = ({
    transaction,
    isOpen,
    onClose
}: {
    transaction: any,
    isOpen: boolean,
    onClose: () => void
}) => {
    if (!transaction || transaction.status !== 'failed') return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                        <AlertTriangle className="h-5 w-5" />
                        Transaction Failed
                    </DialogTitle>
                </DialogHeader>

                <div className="py-4">
                    <div className="flex flex-col space-y-4">
                        <div className="rounded-md bg-red-50 dark:bg-red-900/10 p-4 border border-red-100 dark:border-red-900/30">
                            <h3 className="font-medium text-red-800 dark:text-red-300 mb-2">Error Details</h3>
                            <p className="text-sm text-red-700 dark:text-red-400">
                                {transaction.error}
                            </p>
                        </div>

                        <div className="space-y-2">
                            <h4 className="font-medium text-slate-900 dark:text-slate-100">Transaction Information</h4>
                            <div className="text-sm text-slate-600 dark:text-slate-400">
                                <strong>Type:</strong> {transaction.type.replace('-', ' ')}
                            </div>
                            <div className="text-sm text-slate-600 dark:text-slate-400">
                                <strong>Description:</strong> {transaction.description}
                            </div>
                            <div className="text-sm text-slate-600 dark:text-slate-400">
                                <strong>Date:</strong> {formatDate(transaction.date, 'PP')} at {formatDate(transaction.date, 'p')}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h4 className="font-medium text-slate-900 dark:text-slate-100">Recommended Actions</h4>
                            <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                                <li className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                                    Adjust slippage tolerance for future transactions
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                                    Try again during periods of lower network congestion
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                                    Check token approval limits for the smart contract
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Close
                    </Button>
                    <Button
                        onClick={() => {
                            // In a real app, you would implement retry logic here
                            onClose();
                        }}
                    >
                        Retry Transaction
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

// Export Modal
const ExportModal = ({
    isOpen,
    onClose
}: {
    isOpen: boolean,
    onClose: () => void
}) => {
    const [exportFormat, setExportFormat] = useState("csv");
    const [timeRange, setTimeRange] = useState("all");
    const [dateRange, setDateRange] = useState<{ from: Date | undefined, to: Date | undefined }>({
        from: undefined,
        to: undefined
    });

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Download className="h-5 w-5" />
                        Export Transaction History
                    </DialogTitle>
                </DialogHeader>

                <div className="py-4 space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-900 dark:text-slate-100">
                            Export Format
                        </label>
                        <Select value={exportFormat} onValueChange={setExportFormat}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select format" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="csv">CSV (.csv)</SelectItem>
                                <SelectItem value="json">JSON (.json)</SelectItem>
                                <SelectItem value="pdf">PDF Document (.pdf)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-900 dark:text-slate-100">
                            Time Range
                        </label>
                        <Select value={timeRange} onValueChange={setTimeRange}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select time range" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Time</SelectItem>
                                <SelectItem value="last7">Last 7 Days</SelectItem>
                                <SelectItem value="last30">Last 30 Days</SelectItem>
                                <SelectItem value="last90">Last 90 Days</SelectItem>
                                <SelectItem value="custom">Custom Range</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {timeRange === 'custom' && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                    From Date
                                </label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="w-full justify-start text-left"
                                        >
                                            <Calendar className="h-4 w-4 mr-2" />
                                            {dateRange.from ? formatDate(dateRange.from, 'PP') : 'Select date'}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0 dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg">
                                        <CalendarComponent
                                            mode="single"
                                            selected={dateRange.from}
                                            onSelect={(date) => setDateRange({ ...dateRange, from: date })}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                    To Date
                                </label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="w-full justify-start text-left"
                                        >
                                            <Calendar className="h-4 w-4 mr-2" />
                                            {dateRange.to ? formatDate(dateRange.to, 'PP') : 'Select date'}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0 dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg">
                                        <CalendarComponent
                                            mode="single"
                                            selected={dateRange.to}
                                            onSelect={(date) => setDateRange({ ...dateRange, to: date })}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                    )}

                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-100 dark:border-blue-800/50 text-sm text-blue-700 dark:text-blue-300">
                        <div className="flex gap-2 items-start">
                            <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            <p>
                                {exportFormat === 'csv' && "CSV format is compatible with Excel, Google Sheets, and other spreadsheet applications."}
                                {exportFormat === 'json' && "JSON format is suitable for importing into programming environments or data analysis tools."}
                                {exportFormat === 'pdf' && "PDF format provides a printable document with a formatted table of transactions."}
                            </p>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        onClick={() => {
                            // In a real app, implement the download logic here
                            onClose();
                            // Simulate a download by creating a notification
                            alert(`Export started in ${exportFormat.toUpperCase()} format`);
                        }}
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

const Page: React.FC = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [filterNetwork, setFilterNetwork] = useState('all');
    const [date, setDate] = useState<Date | undefined>();
    const [activeTab, setActiveTab] = useState('all');

    // Modals state
    const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
    const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
    const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);

    // Calculate statistics
    const totalSavedGas = transactions.reduce((sum, tx) => sum + (tx.savedGas || 0), 0);
    const successRate = Math.round((transactions.filter(tx => tx.status === 'success').length / transactions.length) * 100);

    // Filter transactions based on search, type, network, date, and status filters
    const filteredTransactions = useMemo(() => {
        return transactions.filter(tx => {
            // Search query filter
            const searchLower = searchQuery.toLowerCase();
            const matchesSearch =
                searchQuery === '' ||
                tx.description.toLowerCase().includes(searchLower) ||
                tx.task.toLowerCase().includes(searchLower) ||
                tx.txHash.toLowerCase().includes(searchLower);

            // Type filter
            const matchesType = filterType === 'all' || tx.type === filterType;

            // Network filter
            const matchesNetwork = filterNetwork === 'all' || tx.network.toLowerCase() === filterNetwork.toLowerCase();

            // Date filter
            const matchesDate = !date || formatDate(tx.date, 'PP') === formatDate(date, 'PP');

            // Status filter (tab)
            const matchesStatus = activeTab === 'all' || tx.status === activeTab;

            return matchesSearch && matchesType && matchesNetwork && matchesDate && matchesStatus;
        });
    }, [searchQuery, filterType, filterNetwork, date, activeTab]);

    // Handle pagination
    const itemsPerPage = 5;
    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
    const paginatedTransactions = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredTransactions.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredTransactions, currentPage]);

    // Handle transaction click
    const handleTransactionClick = (tx: any) => {
        setSelectedTransaction(tx);
        setIsTransactionModalOpen(true);
    };

    // Handle error details click
    const handleErrorDetailsClick = (tx: any, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedTransaction(tx);
        setIsErrorModalOpen(true);
    };

    // Clear all filters
    const clearFilters = () => {
        setSearchQuery('');
        setFilterType('all');
        setFilterNetwork('all');
        setDate(undefined);
        setActiveTab('all');
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
                        Transaction History
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
                        View all transactions executed by MetaPilot on your behalf
                    </p>
                </div>
                <div className="flex items-center gap-2 mt-4 sm:mt-0">
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-9 dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg"
                        onClick={() => setIsExportModalOpen(true)}
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg">
                    <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Transactions</p>
                                <h3 className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">{transactions.length}</h3>
                            </div>
                            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                                <Activity className="h-5 w-5" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg">
                    <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Success Rate</p>
                                <h3 className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">{successRate}%</h3>
                            </div>
                            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                                <Check className="h-5 w-5" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg">
                    <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Gas Saved</p>
                                <h3 className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">Ξ {totalSavedGas.toFixed(4)}</h3>
                            </div>
                            <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400">
                                <Zap className="h-5 w-5" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg">
                    <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Last Transaction</p>
                                <h3 className="text-sm font-bold mt-1 text-slate-900 dark:text-white truncate">
                                    {formatDate(transactions[0].date, 'MMM d, yyyy HH:mm')}
                                </h3>
                            </div>
                            <div className="p-3 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                <Calendar className="h-5 w-5" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Search and Filters */}
            <motion.div variants={itemVariants}>
                <Card className="dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg">
                    <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="relative flex-grow">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="Search transactions..."
                                    className="pl-9 dark:bg-slate-800/50"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <Select
                                    value={filterType}
                                    onValueChange={setFilterType}
                                >
                                    <SelectTrigger className="w-[140px] dark:bg-slate-800/50">
                                        <SelectValue placeholder="Type" />
                                    </SelectTrigger>
                                    <SelectContent className="dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg">
                                        <SelectItem value="all">All Types</SelectItem>
                                        <SelectItem value="dao-vote">DAO Votes</SelectItem>
                                        <SelectItem value="swap">Token Swaps</SelectItem>
                                        <SelectItem value="yield">Yield Actions</SelectItem>
                                        <SelectItem value="claim">Claims</SelectItem>
                                        <SelectItem value="nft">NFT Actions</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select
                                    value={filterNetwork}
                                    onValueChange={setFilterNetwork}
                                >
                                    <SelectTrigger className="w-[140px] dark:bg-slate-800/50">
                                        <SelectValue placeholder="Network" />
                                    </SelectTrigger>
                                    <SelectContent className="dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg">
                                        <SelectItem value="all">All Networks</SelectItem>
                                        <SelectItem value="ethereum">Ethereum</SelectItem>
                                        <SelectItem value="polygon">Polygon</SelectItem>
                                        <SelectItem value="arbitrum">Arbitrum</SelectItem>
                                        <SelectItem value="optimism">Optimism</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                "flex gap-2 items-center dark:bg-slate-800/50",
                                                date && "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-900/30"
                                            )}
                                        >
                                            <Calendar className="h-4 w-4" />
                                            {date ? formatDate(date, 'PP') : 'Date'}
                                            {date && (
                                                <X
                                                    className="h-3 w-3 ml-1 opacity-60 hover:opacity-100"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setDate(undefined);
                                                    }}
                                                />
                                            )}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0 dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg">
                                        <CalendarComponent
                                            mode="single"
                                            selected={date}
                                            onSelect={setDate}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>

                                <Button
                                    variant={Object.values([searchQuery, filterType, filterNetwork, date])
                                        .some(val => val && val !== 'all') ? "secondary" : "outline"}
                                    size="icon"
                                    className="dark:bg-slate-800/50"
                                    onClick={clearFilters}
                                    title="Clear filters"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Transactions Table */}
            <motion.div variants={itemVariants}>
                <Card className="dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg">
                    <CardHeader className="p-4 pb-0">
                        <Tabs value={activeTab} onValueChange={setActiveTab}>
                            <TabsList className="w-full justify-start dark:bg-slate-700 bg-slate-50 border-indigo-100 dark:border-indigo-900/30 shadow-lg">
                                <TabsTrigger value="all">
                                    All
                                    <Badge className="ml-2 bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                                        {transactions.length}
                                    </Badge>
                                </TabsTrigger>
                                <TabsTrigger value="success">
                                    Successful
                                    <Badge className="ml-2 bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-300">
                                        {transactions.filter(tx => tx.status === 'success').length}
                                    </Badge>
                                </TabsTrigger>
                                <TabsTrigger value="failed">
                                    Failed
                                    <Badge className="ml-2 bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-300">
                                        {transactions.filter(tx => tx.status === 'failed').length}
                                    </Badge>
                                </TabsTrigger>
                                <TabsTrigger value="pending">
                                    Pending
                                    <Badge className="ml-2 bg-amber-100 text-amber-700 dark:bg-amber-800 dark:text-amber-300">
                                        {transactions.filter(tx => tx.status === 'pending').length}
                                    </Badge>
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </CardHeader>

                    <CardContent className="p-0">
                        {filteredTransactions.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-slate-200 dark:border-slate-800">
                                            <th className="text-left p-4 font-medium text-slate-500 dark:text-slate-400">Type</th>
                                            <th className="text-left p-4 font-medium text-slate-500 dark:text-slate-400">Description</th>
                                            <th className="text-left p-4 font-medium text-slate-500 dark:text-slate-400">Date</th>
                                            <th className="text-left p-4 font-medium text-slate-500 dark:text-slate-400">Network</th>
                                            <th className="text-left p-4 font-medium text-slate-500 dark:text-slate-400">Status</th>
                                            <th className="text-left p-4 font-medium text-slate-500 dark:text-slate-400">Gas Used</th>
                                            <th className="text-left p-4 font-medium text-slate-500 dark:text-slate-400">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedTransactions.map(tx => (
                                            <tr
                                                key={tx.id}
                                                className="border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer"
                                                onClick={() => handleTransactionClick(tx)}
                                            >
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        {getTransactionIcon(tx.type)}
                                                        <span className="text-sm font-medium text-slate-900 dark:text-slate-100 capitalize">
                                                            {tx.type.replace('-', ' ')}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="text-sm text-slate-700 dark:text-slate-300">
                                                        {tx.description}
                                                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                            Task: {tx.task}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="text-sm text-slate-700 dark:text-slate-300">
                                                        {formatDate(tx.date, 'MMM d, yyyy')}
                                                        <div className="text-xs text-slate-500 dark:text-slate-400">
                                                            {formatDate(tx.date, 'h:mm a')}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <Badge variant="outline" className="text-xs border-slate-200 dark:border-slate-700">
                                                        {tx.network}
                                                    </Badge>
                                                </td>
                                                <td className="p-4">
                                                    {getStatusBadge(tx.status)}
                                                    {tx.error && (
                                                        <Button
                                                            variant="link"
                                                            size="sm"
                                                            className="p-0 h-auto text-xs text-red-600 dark:text-red-400 mt-1"
                                                            onClick={(e) => handleErrorDetailsClick(tx, e)}
                                                        >
                                                            View Error
                                                        </Button>
                                                    )}
                                                </td>
                                                <td className="p-4">
                                                    <div className="text-sm text-slate-700 dark:text-slate-300">
                                                        Ξ {tx.gas.toFixed(4)}
                                                        {tx.savedGas > 0 && (
                                                            <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                                                                Saved: Ξ {tx.savedGas.toFixed(4)}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 w-8 p-0"
                                                            asChild
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                            }}
                                                        >
                                                            <a
                                                                href={`https://etherscan.io/tx/${tx.txHash}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                title="View on Etherscan"
                                                            >
                                                                <ExternalLink className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                                            </a>
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 w-8 p-0"
                                                            title="View Details"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleTransactionClick(tx);
                                                            }}
                                                        >
                                                            <Info className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12">
                                <Activity className="h-12 w-12 text-slate-300 dark:text-slate-700 mb-4" />
                                <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">No transactions found</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md text-center">
                                    {activeTab !== 'all'
                                        ? `There are no ${activeTab} transactions that match your filters.`
                                        : "There are no transactions that match your filters."}
                                </p>
                                {Object.values([searchQuery, filterType, filterNetwork, date, activeTab !== 'all'])
                                    .some(val => val && val !== 'all') && (
                                        <Button
                                            variant="outline"
                                            className="mt-4"
                                            onClick={clearFilters}
                                        >
                                            Clear Filters
                                        </Button>
                                    )}
                            </div>
                        )}
                    </CardContent>

                    {filteredTransactions.length > 0 && (
                        <CardFooter className="flex items-center justify-between p-4 border-t border-slate-200 dark:border-slate-800">
                            <div className="text-sm text-slate-500 dark:text-slate-400">
                                Showing <strong>{Math.min((currentPage - 1) * itemsPerPage + 1, filteredTransactions.length)}-{Math.min(currentPage * itemsPerPage, filteredTransactions.length)}</strong> of <strong>{filteredTransactions.length}</strong> transactions
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                >
                                    <ChevronLeft className="h-4 w-4 mr-1" />
                                    Prev
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={currentPage === totalPages || totalPages === 0}
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                >
                                    Next
                                    <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                            </div>
                        </CardFooter>
                    )}
                </Card>
            </motion.div>

            {/* Modals */}
            <TransactionDetailsModal
                transaction={selectedTransaction}
                isOpen={isTransactionModalOpen}
                onClose={() => setIsTransactionModalOpen(false)}
            />

            <ErrorDetailsModal
                transaction={selectedTransaction}
                isOpen={isErrorModalOpen}
                onClose={() => setIsErrorModalOpen(false)}
            />

            <ExportModal
                isOpen={isExportModalOpen}
                onClose={() => setIsExportModalOpen(false)}
            />
        </motion.div>
    );
};

export default Page;