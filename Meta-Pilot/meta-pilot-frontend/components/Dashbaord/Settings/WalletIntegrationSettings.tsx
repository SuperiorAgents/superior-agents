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
    Check,
    ChevronRight,
    Clock,
    Copy,
    ExternalLink,
    HelpCircle,
    Info,
    Link,
    Plus,
    RefreshCw,
    Shield,
    Trash2,
    Vote,
    Wallet,
    Zap
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Slider } from '@/components/ui/slider';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

interface ConnectedWallet {
    id: string;
    name: string;
    address: string;
    chain: string;
    icon: string;
    isPrimary: boolean;
    lastActive: string;
    permissions: {
        dao: boolean;
        defi: boolean;
        nft: boolean;
        autoGas: boolean;
        maxGas: number;
        maxValue: number;
    };
}

interface GasPreset {
    id: string;
    name: string;
    speed: string;
    priority: number;
    gasLimit: number;
}

interface DelegationScopeProps {
    title: string;
    description: string;
    enabled: boolean;
    onChange: (checked: boolean) => void;
    icon: React.ReactNode;
}

const DelegationScope: React.FC<DelegationScopeProps> = ({
    title,
    description,
    enabled,
    onChange,
    icon
}) => {
    return (
        <div className="flex justify-between items-start p-4  dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg rounded-lg">
            <div className="flex space-x-3">
                <div className={`p-2 rounded-full ${enabled
                    ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                    }`}>
                    {icon}
                </div>
                <div>
                    <h4 className="font-medium text-slate-900 dark:text-white">
                        {title}
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        {description}
                    </p>
                </div>
            </div>
            <Switch
                checked={enabled}
                onCheckedChange={onChange}
                className=' dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg'
            />
        </div>
    );
};

const WalletIntegrationSettings: React.FC = () => {
    const { toast } = useToast();
    const [wallets, setWallets] = useState<ConnectedWallet[]>([
        {
            id: '1',
            name: 'MetaMask Primary',
            address: '0x1234...5678',
            chain: 'Ethereum',
            icon: '/icons/metamask.svg',
            isPrimary: true,
            lastActive: '2 hours ago',
            permissions: {
                dao: true,
                defi: true,
                nft: false,
                autoGas: true,
                maxGas: 50,
                maxValue: 0.5
            }
        },
        {
            id: '2',
            name: 'Hardware Wallet',
            address: '0xabcd...ef12',
            chain: 'Ethereum',
            icon: '/icons/ledger.svg',
            isPrimary: false,
            lastActive: '3 days ago',
            permissions: {
                dao: false,
                defi: false,
                nft: true,
                autoGas: false,
                maxGas: 100,
                maxValue: 1.0
            }
        }
    ]);

    const [gasPresets, setGasPresets] = useState<GasPreset[]>([
        {
            id: '1',
            name: 'Economic',
            speed: 'Slow (5-20 mins)',
            priority: 1,
            gasLimit: 21000
        },
        {
            id: '2',
            name: 'Standard',
            speed: 'Normal (1-5 mins)',
            priority: 1.5,
            gasLimit: 21000
        },
        {
            id: '3',
            name: 'Fast',
            speed: 'Quick (< 1 min)',
            priority: 2,
            gasLimit: 21000
        }
    ]);

    const [selectedWallet, setSelectedWallet] = useState<string>(wallets[0].id);
    const [isEditPermissionsOpen, setIsEditPermissionsOpen] = useState(false);
    const [isAddWalletOpen, setIsAddWalletOpen] = useState(false);
    const [isGasSettingsOpen, setIsGasSettingsOpen] = useState(false);
    const [tempPermissions, setTempPermissions] = useState<ConnectedWallet['permissions']>({} as ConnectedWallet['permissions']);
    const [defaultGasPreset, setDefaultGasPreset] = useState<string>('2');

    // Get the currently selected wallet object
    const currentWallet = wallets.find(w => w.id === selectedWallet);

    // Handle setting a wallet as primary
    const handleSetPrimary = (walletId: string) => {
        setWallets(wallets.map(wallet => ({
            ...wallet,
            isPrimary: wallet.id === walletId
        })));

        toast({
            title: "Primary wallet updated",
            description: "Your primary wallet has been successfully changed.",
            variant: "default",
        });
    };

    // Handle disconnecting a wallet
    const handleDisconnectWallet = (walletId: string) => {
        setWallets(wallets.filter(wallet => wallet.id !== walletId));

        toast({
            title: "Wallet disconnected",
            description: "The wallet has been successfully disconnected.",
            variant: "default",
        });

        // If we disconnected the selected wallet, select the first available one
        if (walletId === selectedWallet && wallets.length > 1) {
            const nextWallet = wallets.find(w => w.id !== walletId);
            if (nextWallet) {
                setSelectedWallet(nextWallet.id);
            }
        }
    };

    // Handle opening the edit permissions dialog
    const handleEditPermissions = (walletId: string) => {
        const wallet = wallets.find(w => w.id === walletId);
        if (wallet) {
            setTempPermissions({ ...wallet.permissions });
            setIsEditPermissionsOpen(true);
        }
    };

    // Handle saving permissions
    const handleSavePermissions = () => {
        setWallets(wallets.map(wallet =>
            wallet.id === selectedWallet
                ? { ...wallet, permissions: tempPermissions }
                : wallet
        ));
        setIsEditPermissionsOpen(false);

        toast({
            title: "Permissions updated",
            description: "Wallet permissions have been successfully updated.",
            variant: "default",
        });
    };

    // Handle copying address
    const handleCopyAddress = (address: string) => {
        navigator.clipboard.writeText(address);
        toast({
            title: "Address copied",
            description: "Wallet address has been copied to clipboard.",
            variant: "default",
        });
    };

    // Handle updating wallet permission toggle
    const handlePermissionToggle = (permission: keyof ConnectedWallet['permissions'], value: boolean) => {
        setTempPermissions({ ...tempPermissions, [permission]: value });
    };

    // Handle updating max gas/value sliders
    const handleMaxValueChange = (value: number[]) => {
        setTempPermissions({ ...tempPermissions, maxValue: value[0] });
    };

    const handleMaxGasChange = (value: number[]) => {
        setTempPermissions({ ...tempPermissions, maxGas: value[0] });
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
        >
            {/* Connected Wallets */}
            <motion.div variants={itemVariants}>
                <Card className=' dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg'>
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                            <div>
                                <CardTitle>Connected Wallets</CardTitle>
                                <CardDescription>
                                    Manage wallets connected to MetaPilot
                                </CardDescription>
                            </div>
                            <Button
                                className="mt-4 sm:mt-0 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                                onClick={() => setIsAddWalletOpen(true)}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Connect Wallet
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {wallets.map((wallet) => (
                                <div
                                    key={wallet.id}
                                    className={`p-4 border ${wallet.id === selectedWallet ? 'border-blue-300 dark:border-blue-800' : 'border-slate-200 dark:border-slate-800'} rounded-lg ${wallet.id === selectedWallet ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-white dark:bg-[#0c1a54]'}`}
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                                <Wallet className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                                            </div>
                                            <div>
                                                <div className="flex items-center space-x-2">
                                                    <h3 className="font-medium text-slate-900 dark:text-white">
                                                        {wallet.name}
                                                    </h3>
                                                    {wallet.isPrimary && (
                                                        <Badge variant="outline" className="text-xs font-normal">Primary</Badge>
                                                    )}
                                                </div>
                                                <div className="flex items-center mt-1">
                                                    <p className="text-sm font-mono text-slate-600 dark:text-slate-400">
                                                        {wallet.address}
                                                    </p>
                                                    <button
                                                        className="ml-1.5 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                                                        onClick={() => handleCopyAddress(wallet.address)}
                                                    >
                                                        <Copy className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                                <div className="flex items-center mt-1 text-xs text-slate-500 dark:text-slate-500">
                                                    <Clock className="h-3 w-3 mr-1" />
                                                    Last active: {wallet.lastActive}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
                                            {!wallet.isPrimary && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleSetPrimary(wallet.id)}
                                                    className=' dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg'
                                                >
                                                    Set Primary
                                                </Button>
                                            )}
                                            <Button
                                                variant={wallet.id === selectedWallet ? "default" : "outline"}
                                                size="sm"
                                                className={wallet.id === selectedWallet ? "bg-blue-600 hover:bg-blue-700 text-white" : " dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg"}
                                                onClick={() => setSelectedWallet(wallet.id)}
                                            >
                                                {wallet.id === selectedWallet ? "Selected" : "Select"}
                                            </Button>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild className=' dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg'>
                                                    <Button variant="outline" size="icon" className="h-8 w-8">
                                                        <ChevronRight className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleEditPermissions(wallet.id)} className=' dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg'>
                                                        <Shield className="h-4 w-4 mr-2" />
                                                        Edit Permissions
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleDisconnectWallet(wallet.id)} className=' dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg'>
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        Disconnect
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Wallet Permissions */}
            <motion.div variants={itemVariants}>
                <Card className=' dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg'>
                    <CardHeader>
                        <CardTitle>Wallet Permissions</CardTitle>
                        <CardDescription>
                            Configure what MetaPilot can do with your selected wallet
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {currentWallet && (
                            <>
                                <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center">
                                            <Wallet className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-900 dark:text-white">
                                                Currently configuring: <span className="text-blue-600 dark:text-blue-400">{currentWallet.name}</span>
                                            </p>
                                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                                                {currentWallet.address}
                                            </p>
                                        </div>
                                    </div>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className=' dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg'
                                        onClick={() => handleEditPermissions(currentWallet.id)}
                                    >
                                        <Shield className="h-4 w-4 mr-2" />
                                        Edit Permissions
                                    </Button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <DelegationScope
                                        title="DAO Governance"
                                        description="Allow MetaPilot to vote in DAOs on your behalf"
                                        enabled={currentWallet.permissions.dao}
                                        onChange={(checked) => {
                                            setWallets(wallets.map(wallet =>
                                                wallet.id === selectedWallet
                                                    ? { ...wallet, permissions: { ...wallet.permissions, dao: checked } }
                                                    : wallet
                                            ));
                                        }}
                                        icon={<Vote className="h-5 w-5" />}
                                    />
                                    <DelegationScope
                                        title="DeFi Operations"
                                        description="Allow token swaps, staking, and yield optimization"
                                        enabled={currentWallet.permissions.defi}
                                        onChange={(checked) => {
                                            setWallets(wallets.map(wallet =>
                                                wallet.id === selectedWallet
                                                    ? { ...wallet, permissions: { ...wallet.permissions, defi: checked } }
                                                    : wallet
                                            ));
                                        }}
                                        icon={<Zap className="h-5 w-5" />}
                                    />
                                    <DelegationScope
                                        title="NFT Transactions"
                                        description="Allow purchasing and trading NFTs"
                                        enabled={currentWallet.permissions.nft}
                                        onChange={(checked) => {
                                            setWallets(wallets.map(wallet =>
                                                wallet.id === selectedWallet
                                                    ? { ...wallet, permissions: { ...wallet.permissions, nft: checked } }
                                                    : wallet
                                            ));
                                        }}
                                        icon={<Link className="h-5 w-5" />}
                                    />
                                    <DelegationScope
                                        title="Automatic Gas Adjustment"
                                        description="Optimize gas fees automatically for transactions"
                                        enabled={currentWallet.permissions.autoGas}
                                        onChange={(checked) => {
                                            setWallets(wallets.map(wallet =>
                                                wallet.id === selectedWallet
                                                    ? { ...wallet, permissions: { ...wallet.permissions, autoGas: checked } }
                                                    : wallet
                                            ));
                                        }}
                                        icon={<RefreshCw className="h-5 w-5" />}
                                    />
                                </div>

                                <Separator />

                                <div className="space-y-4  dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg">
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <div className="space-y-0.5">
                                                <Label className="text-base">Maximum Transaction Value</Label>
                                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                                    Maximum ETH value MetaPilot can use in a single transaction
                                                </p>
                                            </div>
                                            <Badge>
                                                {currentWallet.permissions.maxValue} ETH
                                            </Badge>
                                        </div>
                                        <Slider
                                            value={[currentWallet.permissions.maxValue]}
                                            max={5}
                                            step={0.1}
                                            onValueChange={(value) => {
                                                setWallets(wallets.map(wallet =>
                                                    wallet.id === selectedWallet
                                                        ? { ...wallet, permissions: { ...wallet.permissions, maxValue: value[0] } }
                                                        : wallet
                                                ));
                                            }}
                                            className="mt-2"
                                        />
                                    </div>

                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <div className="space-y-0.5">
                                                <Label className="text-base">Maximum Gas Price (Gwei)</Label>
                                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                                    MetaPilot will not exceed this gas price limit
                                                </p>
                                            </div>
                                            <Badge>
                                                {currentWallet.permissions.maxGas} Gwei
                                            </Badge>
                                        </div>
                                        <Slider
                                            value={[currentWallet.permissions.maxGas]}
                                            max={200}
                                            step={1}
                                            onValueChange={(value) => {
                                                setWallets(wallets.map(wallet =>
                                                    wallet.id === selectedWallet
                                                        ? { ...wallet, permissions: { ...wallet.permissions, maxGas: value[0] } }
                                                        : wallet
                                                ));
                                            }}
                                            className="mt-2"
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        {!currentWallet && (
                            <div className="flex flex-col items-center justify-center py-8">
                                <AlertCircle className="h-10 w-10 text-slate-400 mb-3" />
                                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">
                                    No Wallet Selected
                                </h3>
                                <p className="text-slate-600 dark:text-slate-400 text-center max-w-md mb-4">
                                    Please select a wallet or connect a new one to configure permissions
                                </p>
                                <Button
                                    onClick={() => setIsAddWalletOpen(true)}
                                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Connect Wallet
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>

            {/* Gas Settings */}
            <motion.div variants={itemVariants}>
                <Card className=' dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg'>
                    <CardHeader>
                        <CardTitle>Gas Settings</CardTitle>
                        <CardDescription>
                            Configure default gas presets for automated transactions
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
                            <div className="space-y-1">
                                <h3 className="font-medium text-slate-900 dark:text-white">
                                    Default Gas Preset
                                </h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    Select the default gas strategy for all automated actions
                                </p>
                            </div>
                            <div className="mt-2 sm:mt-0  dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg">
                                <Select value={defaultGasPreset} onValueChange={setDefaultGasPreset}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Select a preset" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {gasPresets.map(preset => (
                                            <SelectItem key={preset.id} value={preset.id}>
                                                {preset.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {gasPresets.map(preset => (
                                <div
                                    key={preset.id}
                                    className={`p-4 border rounded-lg ${preset.id === defaultGasPreset
                                        ? 'border-blue-300 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20'
                                        : 'border-slate-200 dark:border-slate-800'
                                        }`}
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                                        <div>
                                            <div className="flex items-center">
                                                <h4 className="font-medium text-slate-900 dark:text-white">
                                                    {preset.name}
                                                </h4>
                                                {preset.id === defaultGasPreset && (
                                                    <Badge className="ml-2 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                                                        Default
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                                {preset.speed} • Priority fee: {preset.priority} Gwei
                                            </p>
                                        </div>

                                        <div className="flex items-center space-x-2 mt-3 sm:mt-0">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setIsGasSettingsOpen(true)}
                                                className=' dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg'
                                            >
                                                Edit
                                            </Button>
                                            {preset.id !== defaultGasPreset && (
                                                <Button
                                                    size="sm"
                                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                                    onClick={() => setDefaultGasPreset(preset.id)}
                                                >
                                                    Set Default
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-between items-center mt-4">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsGasSettingsOpen(true)}
                                className=' dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg'
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add New Preset
                            </Button>

                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="flex items-center text-sm text-slate-600 dark:text-slate-400 cursor-help">
                                            <Info className="h-4 w-4 mr-1" />
                                            About gas settings
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-xs p-3">
                                        <p className="text-sm">
                                            Gas presets control how MetaPilot prioritizes your transactions on the network.
                                            Higher gas settings result in faster confirmations but cost more.
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Edit Permissions Dialog */}
            <Dialog open={isEditPermissionsOpen} onOpenChange={setIsEditPermissionsOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Edit Wallet Permissions</DialogTitle>
                        <DialogDescription>
                            Configure what MetaPilot can do with this wallet
                        </DialogDescription>
                    </DialogHeader>

                    {currentWallet && (
                        <div className="space-y-4 py-4">
                            <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center">
                                    <Wallet className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <p className="font-medium text-slate-900 dark:text-white">
                                        {currentWallet.name}
                                    </p>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                                        {currentWallet.address}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h4 className="font-medium text-slate-900 dark:text-white">
                                    Task Permissions
                                </h4>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <Vote className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                                            <Label htmlFor="dao-permission">DAO Governance</Label>
                                        </div>
                                        <Switch
                                            id="dao-permission"
                                            checked={tempPermissions.dao}
                                            onCheckedChange={(checked) => handlePermissionToggle('dao', checked)}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <Zap className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                                            <Label htmlFor="defi-permission">DeFi Operations</Label>
                                        </div>
                                        <Switch
                                            id="defi-permission"
                                            checked={tempPermissions.defi}
                                            onCheckedChange={(checked) => handlePermissionToggle('defi', checked)}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <Link className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                                            <Label htmlFor="nft-permission">NFT Transactions</Label>
                                        </div>
                                        <Switch
                                            id="nft-permission"
                                            checked={tempPermissions.nft}
                                            onCheckedChange={(checked) => handlePermissionToggle('nft', checked)}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <RefreshCw className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                                            <Label htmlFor="autogas-permission">Auto Gas Adjustment</Label>
                                        </div>
                                        <Switch
                                            id="autogas-permission"
                                            checked={tempPermissions.autoGas}
                                            onCheckedChange={(checked) => handlePermissionToggle('autoGas', checked)}
                                        />
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-4">
                                <h4 className="font-medium text-slate-900 dark:text-white">
                                    Transaction Limits
                                </h4>

                                <div>
                                    <div className="flex justify-between mb-2">
                                        <Label>Max Transaction Value (ETH)</Label>
                                        <Badge>{tempPermissions.maxValue} ETH</Badge>
                                    </div>
                                    <Slider
                                        value={[tempPermissions.maxValue]}
                                        max={5}
                                        step={0.1}
                                        onValueChange={handleMaxValueChange}
                                    />
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                        MetaPilot will not execute transactions exceeding this value
                                    </p>
                                </div>

                                <div>
                                    <div className="flex justify-between mb-2">
                                        <Label>Max Gas Price (Gwei)</Label>
                                        <Badge>{tempPermissions.maxGas} Gwei</Badge>
                                    </div>
                                    <Slider
                                        value={[tempPermissions.maxGas]}
                                        max={200}
                                        step={1}
                                        onValueChange={handleMaxGasChange}
                                    />
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                        Transactions will wait until gas price drops below this threshold
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditPermissionsOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                            onClick={handleSavePermissions}
                        >
                            Save Permissions
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Add New Wallet Dialog */}
            <Dialog open={isAddWalletOpen} onOpenChange={setIsAddWalletOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Connect a New Wallet</DialogTitle>
                        <DialogDescription>
                            Choose a wallet provider to connect to MetaPilot
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <Button
                                variant="outline"
                                className="h-24 flex flex-col items-center justify-center bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700"
                                onClick={() => {
                                    toast({
                                        title: "MetaMask Connected",
                                        description: "Your MetaMask wallet has been successfully connected.",
                                        variant: "default",
                                    });
                                    setIsAddWalletOpen(false);
                                }}
                            >
                                <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mb-2">
                                    <svg viewBox="0 0 24 24" width="22" height="22" xmlns="http://www.w3.org/2000/svg" className="text-orange-500">
                                        <path d="M21.9969 4L12.8787 9.1875L14.2813 6.28125L21.9969 4Z" fill="currentColor" />
                                        <path d="M2 4L11.0625 9.23438L9.71875 6.28125L2 4Z" fill="currentColor" />
                                        <path d="M19.125 15.5469L16.875 18.5156L21.4375 19.6875L22.75 15.625L19.125 15.5469Z" fill="currentColor" />
                                        <path d="M1.25 15.625L2.5625 19.6875L7.125 18.5156L4.875 15.5469L1.25 15.625Z" fill="currentColor" />
                                        <path d="M6.9375 10.3438L5.71875 12.0469L10.25 12.2188L10.125 7.34375L6.9375 10.3438Z" fill="currentColor" />
                                        <path d="M17.0625 10.3438L13.8438 7.28125L13.75 12.2188L18.2813 12.0469L17.0625 10.3438Z" fill="currentColor" />
                                        <path d="M7.125 18.5156L10 17.3438L7.5 15.6719L7.125 18.5156Z" fill="currentColor" />
                                        <path d="M14 17.3438L16.875 18.5156L16.5 15.6719L14 17.3438Z" fill="currentColor" />
                                    </svg>
                                </div>
                                <span className="font-medium">MetaMask</span>
                            </Button>

                            <Button
                                variant="outline"
                                className="h-24 flex flex-col items-center justify-center bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700"
                                onClick={() => {
                                    toast({
                                        title: "WalletConnect Ready",
                                        description: "Please approve the connection in your WalletConnect app.",
                                        variant: "default",
                                    });
                                    setIsAddWalletOpen(false);
                                }}
                            >
                                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-2">
                                    <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg" className="text-blue-500">
                                        <path d="M7.08 10.348c2.73-2.73 7.16-2.73 9.89 0l.33.328c.137.136.137.357 0 .493l-1.12 1.125a.174.174 0 0 1-.247 0l-.453-.456c-1.904-1.904-4.992-1.904-6.896 0l-.486.486a.174.174 0 0 1-.247 0l-1.12-1.125a.349.349 0 0 1 0-.493l.338-.358ZM18.511 8.72l1.12 1.125a.349.349 0 0 1 0 .493l-5.037 5.037a.35.35 0 0 1-.494 0l-3.574-3.575a.087.087 0 0 0-.123 0l-3.574 3.575a.35.35 0 0 1-.493 0L1.297 10.34a.349.349 0 0 1 0-.493l1.12-1.125a.35.35 0 0 1 .494 0l3.574 3.574a.087.087 0 0 0 .123 0l3.574-3.574a.35.35 0 0 1 .494 0l3.574 3.574a.087.087 0 0 0 .123 0l3.574-3.574a.35.35 0 0 1 .564 0Z" fill="currentColor" />
                                    </svg>
                                </div>
                                <span className="font-medium">WalletConnect</span>
                            </Button>

                            <Button
                                variant="outline"
                                className="h-24 flex flex-col items-center justify-center bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700"
                                onClick={() => {
                                    toast({
                                        title: "Coinbase Wallet",
                                        description: "Please approve the connection request.",
                                        variant: "default",
                                    });
                                    setIsAddWalletOpen(false);
                                }}
                            >
                                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-2">
                                    <svg viewBox="0 0 24 24" width="22" height="22" xmlns="http://www.w3.org/2000/svg" className="text-blue-500">
                                        <path d="M12 1C5.925 1 1 5.925 1 12s4.925 11 11 11 11-4.925 11-11S18.075 1 12 1zm0 20.092c-5.02 0-9.092-4.072-9.092-9.092 0-5.02 4.072-9.092 9.092-9.092 5.02 0 9.092 4.072 9.092 9.092 0 5.02-4.072 9.092-9.092 9.092zm.274-13.633c-2.454 0-4.451 1.976-4.451 4.427s1.997 4.427 4.451 4.427c2.452 0 4.441-1.976 4.441-4.427s-1.999-4.427-4.441-4.427zm0 7.265c-1.562 0-2.832-1.27-2.832-2.838 0-1.568 1.27-2.838 2.832-2.838 1.56 0 2.822 1.27 2.822 2.838 0 1.568-1.262 2.838-2.822 2.838z" fill="currentColor" />
                                    </svg>
                                </div>
                                <span className="font-medium">Coinbase Wallet</span>
                            </Button>

                            <Button
                                variant="outline"
                                className="h-24 flex flex-col items-center justify-center bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700"
                                onClick={() => {
                                    toast({
                                        title: "Ledger",
                                        description: "Please connect your Ledger device.",
                                        variant: "default",
                                    });
                                    setIsAddWalletOpen(false);
                                }}
                            >
                                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-2">
                                    <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg" className="text-slate-500">
                                        <path d="M19.7778 0H4.22222C1.9 0 0 1.9 0 4.22222V19.7778C0 22.1 1.9 24 4.22222 24H19.7778C22.1 24 24 22.1 24 19.7778V4.22222C24 1.9 22.1 0 19.7778 0ZM10.6667 16.8889H4.22222V4.22222H10.6667V16.8889ZM19.7778 16.8889H13.3333V10.6667H19.7778V16.8889ZM19.7778 7.11111H13.3333V4.22222H19.7778V7.11111Z" fill="currentColor" />
                                    </svg>
                                </div>
                                <span className="font-medium">Ledger</span>
                            </Button>
                        </div>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-sm text-blue-700 dark:text-blue-300 flex items-start space-x-2">
                        <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                        <p>
                            MetaPilot uses ERC-7715 session keys to securely automate tasks without holding your private keys. Learn more about <a href="#" className="underline">how our permissions work</a>.
                        </p>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Gas Settings Dialog */}
            <Dialog open={isGasSettingsOpen} onOpenChange={setIsGasSettingsOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Edit Gas Preset</DialogTitle>
                        <DialogDescription>
                            Configure gas settings for automated transactions
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="preset-name">Preset Name</Label>
                            <Input id="preset-name" placeholder="e.g., Fast, Economic, etc." defaultValue="Standard" />
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between mb-1">
                                <Label htmlFor="priority-fee">Priority Fee (Gwei)</Label>
                                <Badge>1.5 Gwei</Badge>
                            </div>
                            <Slider
                                id="priority-fee"
                                value={[1.5]}
                                min={0.1}
                                max={10}
                                step={0.1}
                            />
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Higher priority fee can result in faster transaction confirmations
                            </p>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between mb-1">
                                <Label htmlFor="gas-limit">Gas Limit</Label>
                                <Badge>21000</Badge>
                            </div>
                            <Input
                                id="gas-limit"
                                type="number"
                                defaultValue="21000"
                            />
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Standard ETH transfer: 21000, ERC-20 transfer: ~65000, Complex contract: 100000+
                            </p>
                        </div>

                        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 text-sm text-orange-700 dark:text-orange-300 flex items-start space-x-2">
                            <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                            <p>
                                Setting gas limits too low may cause transactions to fail. MetaPilot will estimate appropriate gas limits when possible.
                            </p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsGasSettingsOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                            onClick={() => {
                                toast({
                                    title: "Gas preset updated",
                                    description: "Your gas settings have been saved successfully.",
                                    variant: "default",
                                });
                                setIsGasSettingsOpen(false);
                            }}
                        >
                            Save Gas Settings
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Security Note */}
            <motion.div variants={itemVariants}>
                <Card className="bg-green-50 dark:bg-green-900/10 border-green-100 dark:border-green-900">
                    <CardContent className="p-6">
                        <div className="flex space-x-4 items-start">
                            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full text-green-600 dark:text-green-400">
                                <Shield className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-green-700 dark:text-green-300 mb-2">
                                    How MetaPilot Keeps Your Assets Safe
                                </h3>
                                <p className="text-green-600 dark:text-green-400 mb-3">
                                    MetaPilot uses ERC-7715 session keys to securely automate your Web3 tasks without requiring access to your private keys. Here's how we protect your assets:
                                </p>
                                <ul className="space-y-2">
                                    <li className="flex items-start">
                                        <Check className="h-5 w-5 text-green-600 dark:text-green-400 mr-2 flex-shrink-0 mt-0.5" />
                                        <span className="text-green-600 dark:text-green-400">Limited permissions that you control and can revoke anytime</span>
                                    </li>
                                    <li className="flex items-start">
                                        <Check className="h-5 w-5 text-green-600 dark:text-green-400 mr-2 flex-shrink-0 mt-0.5" />
                                        <span className="text-green-600 dark:text-green-400">Transaction value limits to cap maximum spending</span>
                                    </li>
                                    <li className="flex items-start">
                                        <Check className="h-5 w-5 text-green-600 dark:text-green-400 mr-2 flex-shrink-0 mt-0.5" />
                                        <span className="text-green-600 dark:text-green-400">All automation actions are transparent and auditable</span>
                                    </li>
                                </ul>
                                <Button
                                    variant="outline"
                                    className="mt-4 bg-white dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/50"
                                >
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    Learn More About Our Security
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </motion.div>
    );
};

export default WalletIntegrationSettings;