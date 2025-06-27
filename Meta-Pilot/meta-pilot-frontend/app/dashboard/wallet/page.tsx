"use client"

import React, { useState } from "react";
import {
    Wallet,
    ArrowRightLeft,
    Send,
    Plus,
    CreditCard,
    History,
    RefreshCcw,
    Clock,
    Filter,
    MoreVertical,
    ChevronDown,
    Search,
    ExternalLink,
    EyeOff,
    Eye
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useWallet } from "@/hooks/use-wallet";
import UserProfileDropdown from "@/components/Dashbaord/UserProfileDropdown";
import TokenBalances from "@/components/Dashbaord/TokenBalances";

// Transaction Types
type TransactionType = "send" | "receive" | "swap" | "stake" | "unstake" | "approve" | "claim";

// Transaction interface
interface Transaction {
    id: string;
    type: TransactionType;
    hash: string;
    status: "pending" | "completed" | "failed";
    timestamp: number;
    fromAddress: string;
    toAddress: string;
    amount: number;
    symbol: string;
    tokenLogo?: string;
    gasFee?: number;
    nonce?: number;
    relatedToken?: {
        symbol: string;
        amount: number;
        logo?: string;
    };
}

// Mock transactions data
const mockTransactions: Transaction[] = [
    {
        id: "tx1",
        type: "send",
        hash: "0xa72bf93c65c933dcb9f33f627a7ca641b071d8eed3adcfe315b5c46c71ed8bf9",
        status: "completed",
        timestamp: Date.now() - 800000, // About 13 minutes ago
        fromAddress: "0x1234567890abcdef1234567890abcdef12345678",
        toAddress: "0xabcdef1234567890abcdef1234567890abcdef12",
        amount: 0.5,
        symbol: "ETH",
        tokenLogo: "/icons/ethereum.svg",
        gasFee: 0.002,
        nonce: 42
    },
    {
        id: "tx2",
        type: "swap",
        hash: "0xb83c94c65c933dcb9f33f627a7ca641b071d8eed3adcfe315b5c46c71ed8bf9",
        status: "completed",
        timestamp: Date.now() - 3600000, // About 1 hour ago
        fromAddress: "0x1234567890abcdef1234567890abcdef12345678",
        toAddress: "0x0000000000000000000000000000000000000000",
        amount: 1000,
        symbol: "USDC",
        tokenLogo: "/icons/usdc.svg",
        gasFee: 0.004,
        nonce: 41,
        relatedToken: {
            symbol: "ETH",
            amount: 0.45,
            logo: "/icons/ethereum.svg"
        }
    },
    {
        id: "tx3",
        type: "receive",
        hash: "0xc94bf93c65c933dcb9f33f627a7ca641b071d8eed3adcfe315b5c46c71ed8bf9",
        status: "completed",
        timestamp: Date.now() - 86400000, // About 1 day ago
        fromAddress: "0xefd693847d58c8847483a846dfd693847d58c884",
        toAddress: "0x1234567890abcdef1234567890abcdef12345678",
        amount: 0.75,
        symbol: "ETH",
        tokenLogo: "/icons/ethereum.svg",
        gasFee: 0,
        nonce: 40
    },
    {
        id: "tx4",
        type: "stake",
        hash: "0xd94bf93c65c933dcb9f33f627a7ca641b071d8eed3adcfe315b5c46c71ed8bf9",
        status: "completed",
        timestamp: Date.now() - 172800000, // About 2 days ago
        fromAddress: "0x1234567890abcdef1234567890abcdef12345678",
        toAddress: "0x45678abcdef1234567890abcdef1234567890abc",
        amount: 12.5,
        symbol: "AAVE",
        tokenLogo: "/icons/aave.svg",
        gasFee: 0.003,
        nonce: 39
    },
    {
        id: "tx5",
        type: "approve",
        hash: "0xe94bf93c65c933dcb9f33f627a7ca641b071d8eed3adcfe315b5c46c71ed8bf9",
        status: "pending",
        timestamp: Date.now() - 240000, // About 4 minutes ago
        fromAddress: "0x1234567890abcdef1234567890abcdef12345678",
        toAddress: "0x123456789abcdef1234567890abcdef123456789",
        amount: 0,
        symbol: "LINK",
        tokenLogo: "/icons/chainlink.svg",
        gasFee: 0.001,
        nonce: 43
    }
];

const WalletDashboard: React.FC = () => {
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState("assets");
    const [searchQuery, setSearchQuery] = useState("");
    const [showBalances, setShowBalances] = useState(true);
    const { address, balance } = useWallet();
    const [copied, setCopied] = useState(false);

    // Format wallet address
    const truncateAddress = (address: string): string => {
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    // Format timestamp to relative time
    const formatRelativeTime = (timestamp: number): string => {
        const seconds = Math.floor((Date.now() - timestamp) / 1000);

        if (seconds < 60) return `${seconds} seconds ago`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
        return `${Math.floor(seconds / 86400)} days ago`;
    };

    // Format currency
    const formatCurrency = (value: number | bigint) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value);
    };

    // Function to get transaction icon
    const getTransactionIcon = (type: TransactionType) => {
        switch (type) {
            case "send":
                return <Send className="h-4 w-4 text-red-500" />;
            case "receive":
                return <Send className="h-4 w-4 text-green-500 transform rotate-180" />;
            case "swap":
                return <ArrowRightLeft className="h-4 w-4 text-blue-500" />;
            case "stake":
                return <CreditCard className="h-4 w-4 text-purple-500" />;
            case "unstake":
                return <CreditCard className="h-4 w-4 text-orange-500" />;
            case "approve":
                return <Clock className="h-4 w-4 text-yellow-500" />;
            case "claim":
                return <Plus className="h-4 w-4 text-green-500" />;
            default:
                return <History className="h-4 w-4" />;
        }
    };

    // Function to get transaction status badge
    const getStatusBadge = (status: "pending" | "completed" | "failed") => {
        switch (status) {
            case "pending":
                return (
                    <Badge variant="outline" className="text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-400">
                        Pending
                    </Badge>
                );
            case "completed":
                return (
                    <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400">
                        Completed
                    </Badge>
                );
            case "failed":
                return (
                    <Badge variant="outline" className="text-red-600 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
                        Failed
                    </Badge>
                );
        }
    };

    // Mock total balance
    const totalBalanceUsd = balance?.value;

    // Refresh wallet data
    const refreshWallet = () => {
        setIsRefreshing(true);

        // Simulate API call
        setTimeout(() => {
            setIsRefreshing(false);
        }, 1000);
    };

    // Copy wallet address to clipboard
    const copyAddressToClipboard = () => {
        navigator.clipboard.writeText(address ?? "");
        setCopied(true);

        // Reset the copied state after 2 seconds
        setTimeout(() => {
            setCopied(false);
        }, 2000);
    };

    return (
        <div className="container mx-auto px-4 py-6 max-w-7xl">
            <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Wallet Dashboard</h1>
                        <p className="text-slate-500 dark:text-slate-400">
                            Manage your assets and transactions
                        </p>
                    </div>

                </div>

                {/* Wallet Overview */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main wallet card */}
                    <Card className="lg:col-span-2 dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-xl">Your Wallet</CardTitle>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    disabled={isRefreshing}
                                    onClick={refreshWallet}
                                    className="h-8 w-8"
                                >
                                    <RefreshCcw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
                                </Button>
                            </div>
                            <CardDescription>
                                Connected wallet overview and actions
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                                {/* Wallet address and balance */}
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Connected Address</p>
                                        <div
                                            className={cn(
                                                "mt-1 flex items-center rounded-md px-3 py-2 cursor-pointer transition-colors",
                                                copied
                                                    ? "bg-green-100 dark:bg-green-900/30"
                                                    : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"
                                            )}
                                            onClick={copyAddressToClipboard}
                                        >
                                            <p className="text-sm font-mono tracking-tight text-slate-700 dark:text-slate-300">
                                                {truncateAddress(address ?? "0x0000000000000000000000000000000000000000")}
                                            </p>
                                            <Badge
                                                variant="outline"
                                                className={cn(
                                                    "ml-auto text-[10px] px-1.5 py-0 transition-all",
                                                    copied
                                                        ? "border-green-300 dark:border-green-700 text-green-600 dark:text-green-400"
                                                        : "border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400"
                                                )}
                                            >
                                                {copied ? "Copied!" : "Click to copy"}
                                            </Badge>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Balance</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <h2 className={cn(
                                                "text-2xl font-bold",
                                                showBalances ? "text-slate-900 dark:text-slate-100" : "text-slate-400 dark:text-slate-500"
                                            )}>
                                                {showBalances ? formatCurrency(totalBalanceUsd ?? 0) : "••••••••"}
                                            </h2>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setShowBalances(!showBalances)}
                                                className="h-6 w-6"
                                            >
                                                {showBalances ?
                                                    <EyeOff className="h-3.5 w-3.5 text-slate-500" /> :
                                                    <Eye className="h-3.5 w-3.5 text-slate-500" />
                                                }
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2 mt-2">
                                        <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
                                            <Plus className="h-4 w-4" />
                                            Deposit
                                        </Button>
                                        <Button className="bg-purple-600 hover:bg-purple-700 gap-2">
                                            <Send className="h-4 w-4" />
                                            Send
                                        </Button>
                                        <Button className="bg-indigo-600 hover:bg-indigo-700 gap-2">
                                            <ArrowRightLeft className="h-4 w-4" />
                                            Swap
                                        </Button>
                                    </div>
                                </div>

                                {/* Network selection & quick actions */}
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Network</p>
                                        <Select defaultValue="ethereum">
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select Network" />
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

                                    <div className="grid grid-cols-2 gap-3">
                                        <Button variant="outline" className="justify-center gap-2 h-20 flex-col dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg" asChild>
                                            <Link href="/dashboard/staking">
                                                <CreditCard className="h-5 w-5 text-purple-500" />
                                                <span className="font-medium">Staking</span>
                                            </Link>
                                        </Button>
                                        <Button variant="outline" className="justify-center gap-2 h-20 flex-col dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg" asChild>
                                            <Link href="/dashboard/history">
                                                <History className="h-5 w-5 text-blue-500" />
                                                <span className="font-medium">History</span>
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent activity */}
                    <Card className="dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg">Recent Activity</CardTitle>
                            <CardDescription>Latest transactions</CardDescription>
                        </CardHeader>
                        <CardContent className="px-2 py-0">
                            <div className="space-y-1">
                                {mockTransactions.slice(0, 4).map((tx) => (
                                    <div
                                        key={tx.id}
                                        className="py-3 px-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-md transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-full">
                                                {getTransactionIcon(tx.type)}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between">
                                                    <p className="font-medium text-slate-900 dark:text-slate-100 capitalize">
                                                        {tx.type === "swap" ? (
                                                            <>Swap {tx.symbol} for {tx.relatedToken?.symbol}</>
                                                        ) : (
                                                            <>{tx.type} {tx.symbol}</>
                                                        )}
                                                    </p>
                                                    <span className="text-xs text-slate-500 dark:text-slate-400">
                                                        {formatRelativeTime(tx.timestamp)}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                                    {tx.type === "swap" ? (
                                                        <>{tx.amount} {tx.symbol} → {tx.relatedToken?.amount} {tx.relatedToken?.symbol}</>
                                                    ) : (
                                                        <>{tx.amount} {tx.symbol}</>
                                                    )}
                                                    {tx.status === "pending" && (
                                                        <span className="ml-2 inline-flex h-1.5 w-1.5 rounded-full bg-yellow-500 animate-pulse"></span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                        <CardFooter className="pt-3">
                            <Button variant="ghost" className="w-full justify-center" asChild>
                                <Link href="/dashboard/history">
                                    View All Transactions
                                    <ChevronDown className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <div className="flex justify-between items-center dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg">
                        <TabsList>
                            <TabsTrigger value="assets">Assets</TabsTrigger>
                            <TabsTrigger value="transactions">Transactions</TabsTrigger>
                        </TabsList>

                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                                <Input
                                    type="text"
                                    placeholder="Search"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 h-9 w-full md:w-[180px]"
                                />
                            </div>
                            <Button variant="outline" size="sm" className="h-9 gap-1">
                                <Filter className="h-4 w-4" />
                                <span>Filter</span>
                            </Button>
                        </div>
                    </div>

                    <TabsContent value="assets" className="pt-4">
                        <TokenBalances className="dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg" showSearch={false} showFilters={false} />
                    </TabsContent>

                    <TabsContent value="transactions" className="pt-4">
                        {/* Transactions List */}
                        <Card className="dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg">
                            <CardHeader className="pb-2">
                                <CardTitle>Transaction History</CardTitle>
                                <CardDescription>All your wallet activity</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y divide-slate-200 dark:divide-slate-800">
                                    {mockTransactions.map((tx) => (
                                        <div key={tx.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-full">
                                                        {getTransactionIcon(tx.type)}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <p className="font-medium text-slate-900 dark:text-slate-100 capitalize">
                                                                {tx.type === "swap" ? (
                                                                    <>Swap {tx.symbol} for {tx.relatedToken?.symbol}</>
                                                                ) : (
                                                                    <>{tx.type} {tx.symbol}</>
                                                                )}
                                                            </p>
                                                            {getStatusBadge(tx.status)}
                                                        </div>
                                                        <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                                                            <p>{formatRelativeTime(tx.timestamp)}</p>
                                                            <span className="mx-1">•</span>
                                                            <p>Nonce: {tx.nonce}</p>
                                                            <span className="mx-1">•</span>
                                                            <p>Gas: {tx.gasFee} ETH</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-6">
                                                    <div className="text-right">
                                                        <p className="font-medium text-slate-900 dark:text-slate-100">
                                                            {tx.type === "swap" ? (
                                                                <div className="flex items-center gap-1">
                                                                    <span>{tx.amount} {tx.symbol}</span>
                                                                    <ArrowRightLeft className="h-3 w-3 text-slate-400" />
                                                                    <span>{tx.relatedToken?.amount} {tx.relatedToken?.symbol}</span>
                                                                </div>
                                                            ) : (
                                                                <>{tx.amount} {tx.symbol}</>
                                                            )}
                                                        </p>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                                            {tx.hash.substring(0, 6)}...{tx.hash.substring(tx.hash.length - 4)}
                                                        </p>
                                                    </div>

                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                <MoreVertical className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem className="flex items-center gap-2">
                                                                <ExternalLink className="h-4 w-4" />
                                                                <span>View on Etherscan</span>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem className="flex items-center gap-2">
                                                                <History className="h-4 w-4" />
                                                                <span>View Details</span>
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-center pt-3">
                                <Button variant="outline">Load More</Button>
                            </CardFooter>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default WalletDashboard;