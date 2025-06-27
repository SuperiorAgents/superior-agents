"use client";

import React, { useState, useRef } from 'react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Camera,
    Trash2,
    User,
    Twitter,
    Globe,
    CheckCircle,
    Mail,
    Clock
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

// Animation variants
const formVariants = {
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

const ProfileSettingsForm: React.FC = () => {
    const [formState, setFormState] = useState({
        displayName: 'Alex Johnson',
        email: 'alex@example.com',
        bio: 'Web3 enthusiast and DeFi explorer. Building automated solutions for the decentralized future.',
        website: 'https://alexjohnson.eth',
        twitter: '@alexjohnson',
        timeZone: 'UTC-5',
        publicProfile: true
    });

    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Here you would typically upload the file
            toast({
                title: "Avatar updated",
                description: "Your profile picture has been updated successfully.",
            });
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (value: string, field: string) => {
        setFormState(prev => ({ ...prev, [field]: value }));
    };

    const handleToggleChange = (checked: boolean) => {
        setFormState(prev => ({ ...prev, publicProfile: checked }));
    };

    const handleSaveProfile = () => {
        toast({
            title: "Profile updated",
            description: "Your profile changes have been saved successfully.",
            variant: "default",
        });
    };

    return (
        <motion.div
            variants={formVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
        >
            {/* Profile Card */}
            {/* Profile Card */}
            <motion.div variants={itemVariants}>
                <Card className="overflow-hidden bg-white dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg">
                    <div className="h-32 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative">
                        {/* Optional pattern overlay */}
                        <div className="absolute inset-0 opacity-10 bg-[url('/pattern.svg')] bg-center"></div>
                    </div>
                    <CardContent className="relative p-6 pb-8 z-10 bg-white dark:bg-slate-900/90">
                        <div className="flex flex-col sm:flex-row gap-6 -mt-16">
                            <div className="flex flex-col items-center sm:items-start">
                                <div className="relative group">
                                    <Avatar className="h-24 w-24 border-4 border-white dark:border-slate-900 shadow-xl">
                                        <AvatarImage src="/images/avatar.jpg" alt="Profile picture" />
                                        <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-xl">
                                            AJ
                                        </AvatarFallback>
                                    </Avatar>
                                    {/* Camera overlay on hover */}
                                    <div
                                        className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 rounded-full cursor-pointer transition-opacity"
                                        onClick={handleAvatarClick}
                                    >
                                        <Camera className="h-6 w-6 text-white" />
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1 space-y-3 text-center sm:text-left mt-2 sm:mt-0">
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {formState.displayName}
                                </h2>
                                <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto sm:mx-0">
                                    {formState.bio}
                                </p>
                                <div className="flex flex-wrap gap-2 justify-center sm:justify-start mt-3">
                                    <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800/30">
                                        <Mail className="w-3 h-3 mr-1" />
                                        {formState.email}
                                    </div>
                                    {formState.website && (
                                        <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800/30">
                                            <Globe className="w-3 h-3 mr-1" />
                                            {formState.website}
                                        </div>
                                    )}
                                    {formState.twitter && (
                                        <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border border-purple-100 dark:border-purple-800/30">
                                            <Twitter className="w-3 h-3 mr-1" />
                                            {formState.twitter}
                                        </div>
                                    )}
                                    <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                        <Clock className="w-3 h-3 mr-1" />
                                        {formState.timeZone}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Edit Profile Form */}
            <motion.div variants={itemVariants}>
                <Card className=' dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg'>
                    <CardHeader>
                        <CardTitle>Edit Profile</CardTitle>
                        <CardDescription>
                            Update your profile information and public presence
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="displayName">Display Name</Label>
                                <Input
                                    id="displayName"
                                    name="displayName"
                                    value={formState.displayName}
                                    onChange={handleInputChange}
                                    placeholder="Your name"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    value={formState.email}
                                    onChange={handleInputChange}
                                    type="email"
                                    placeholder="your.email@example.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="bio">Bio</Label>
                            <Textarea
                                id="bio"
                                name="bio"
                                value={formState.bio}
                                onChange={handleInputChange}
                                placeholder="Tell us about yourself"
                                rows={4}
                            />
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Brief description for your profile. URLs are hyperlinked.
                            </p>
                        </div>

                        <Separator />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="website">Website</Label>
                                <Input
                                    id="website"
                                    name="website"
                                    value={formState.website}
                                    onChange={handleInputChange}
                                    placeholder="https://yourwebsite.com"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="twitter">Twitter</Label>
                                <Input
                                    id="twitter"
                                    name="twitter"
                                    value={formState.twitter}
                                    onChange={handleInputChange}
                                    placeholder="@username"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="timeZone">Time Zone</Label>
                                <Select
                                    value={formState.timeZone}
                                    onValueChange={(value) => handleSelectChange(value, 'timeZone')}
                                >
                                    <SelectTrigger id="timeZone">
                                        <SelectValue placeholder="Select a timezone" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="UTC-12">UTC-12:00</SelectItem>
                                        <SelectItem value="UTC-11">UTC-11:00</SelectItem>
                                        <SelectItem value="UTC-10">UTC-10:00</SelectItem>
                                        <SelectItem value="UTC-9">UTC-09:00</SelectItem>
                                        <SelectItem value="UTC-8">UTC-08:00 (Pacific Time)</SelectItem>
                                        <SelectItem value="UTC-7">UTC-07:00 (Mountain Time)</SelectItem>
                                        <SelectItem value="UTC-6">UTC-06:00 (Central Time)</SelectItem>
                                        <SelectItem value="UTC-5">UTC-05:00 (Eastern Time)</SelectItem>
                                        <SelectItem value="UTC-4">UTC-04:00 (Atlantic Time)</SelectItem>
                                        <SelectItem value="UTC-3">UTC-03:00</SelectItem>
                                        <SelectItem value="UTC-2">UTC-02:00</SelectItem>
                                        <SelectItem value="UTC-1">UTC-01:00</SelectItem>
                                        <SelectItem value="UTC+0">UTC+00:00 (GMT)</SelectItem>
                                        <SelectItem value="UTC+1">UTC+01:00 (Central European Time)</SelectItem>
                                        <SelectItem value="UTC+2">UTC+02:00 (Eastern European Time)</SelectItem>
                                        <SelectItem value="UTC+3">UTC+03:00</SelectItem>
                                        <SelectItem value="UTC+4">UTC+04:00</SelectItem>
                                        <SelectItem value="UTC+5">UTC+05:00</SelectItem>
                                        <SelectItem value="UTC+5:30">UTC+05:30 (Indian Standard Time)</SelectItem>
                                        <SelectItem value="UTC+6">UTC+06:00</SelectItem>
                                        <SelectItem value="UTC+7">UTC+07:00</SelectItem>
                                        <SelectItem value="UTC+8">UTC+08:00 (China Standard Time)</SelectItem>
                                        <SelectItem value="UTC+9">UTC+09:00 (Japan Standard Time)</SelectItem>
                                        <SelectItem value="UTC+10">UTC+10:00</SelectItem>
                                        <SelectItem value="UTC+11">UTC+11:00</SelectItem>
                                        <SelectItem value="UTC+12">UTC+12:00</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="publicProfile" className="block mb-2">Public Profile</Label>
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="publicProfile"
                                        checked={formState.publicProfile}
                                        onCheckedChange={handleToggleChange}
                                    />
                                    <Label htmlFor="publicProfile" className="text-sm text-slate-600 dark:text-slate-400">
                                        Make your profile visible to other users
                                    </Label>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <Button variant="outline">Cancel</Button>
                        <Button
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                            onClick={handleSaveProfile}
                        >
                            Save Changes
                        </Button>
                    </CardFooter>
                </Card>
            </motion.div>
        </motion.div>
    );
};

export default ProfileSettingsForm;