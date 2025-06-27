"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    Card,
    CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    ChevronRight,
    ChevronLeft,
    Copy,
    Bookmark,
    FileText,
    LucideIcon,
    CheckCircle,
    AlertCircle,
    Menu,
    ThumbsUp,
    Info,
    Clock,

} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import DocSidebar from '@/components/Dashbaord/DocSidebar';
import ThemeToggle from '@/components/Shared/ThemeToggle';
import MetaPilotLogo from '@/components/Shared/MetaPilotLogo';



const contentVariants = {
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

// Types for docs structure
interface DocLink {
    title: string;
    href: string;
    badge?: {
        text: string;
        variant: 'new' | 'updated' | 'beta' | 'deprecated';
    };
}

interface DocCategory {
    title: string;
    icon: LucideIcon;
    links: DocLink[];
    expanded?: boolean;
}



// Code snippet examples for the current page
const codeExamples = {
    javascript: `// Initialize MetaPilot with your API key
const metapilot = new MetaPilot({
  apiKey: 'your_api_key',
  network: 'ethereum'
});

// Create a DAO voting task
const task = await metapilot.createTask({
  type: 'dao-voting',
  name: 'Nouns DAO Voter',
  config: {
    daoAddress: '0x6f3E6272A167e8AcCb32072d08E0957F9c79223d',
    votingRule: 'Vote YES if proposal mentions rewards or community',
    gasLimit: 50, // in gwei
  }
});

// Get task status
const status = await task.getStatus();
console.log(\`Task status: \${status}\`);`,

    python: `# Initialize MetaPilot with your API key
from metapilot import MetaPilot

client = MetaPilot(
    api_key='your_api_key',
    network='ethereum'
)

# Create a DAO voting task
task = client.create_task(
    type='dao-voting',
    name='Nouns DAO Voter',
    config={
        'daoAddress': '0x6f3E6272A167e8AcCb32072d08E0957F9c79223d',
        'votingRule': 'Vote YES if proposal mentions rewards or community',
        'gasLimit': 50  # in gwei
    }
)

# Get task status
status = task.get_status()
print(f"Task status: {status}")`,

    typescript: `// Initialize MetaPilot with your API key
import { MetaPilot, TaskType, DAOVotingConfig } from 'metapilot';

const metapilot = new MetaPilot({
  apiKey: 'your_api_key',
  network: 'ethereum'
});

// Create a DAO voting task
const task = await metapilot.createTask<DAOVotingConfig>({
  type: TaskType.DaoVoting,
  name: 'Nouns DAO Voter',
  config: {
    daoAddress: '0x6f3E6272A167e8AcCb32072d08E0957F9c79223d',
    votingRule: 'Vote YES if proposal mentions rewards or community',
    gasLimit: 50, // in gwei
  }
});

// Get task status
const status = await task.getStatus();
console.log(\`Task status: \${status}\`);`
};


// Documentation Page component
const DocumentationPage: React.FC = () => {

    const [activeTab, setActiveTab] = useState<string>("javascript");
    const [sidebarOpen, setSidebarOpen] = useState<boolean>(window.innerWidth >= 1024);

    const { toast } = useToast();


    // In DocumentationPage.tsx

    // Add an effect to manage sidebar state on resize
    useEffect(() => {
        const handleResize = () => {
            setSidebarOpen(window.innerWidth >= 1024);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);



    // Handle copy code to clipboard
    const handleCopyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        toast({
            title: "Code copied to clipboard",
            description: "The code snippet has been copied to your clipboard.",
        });
    };



    return (
        <div className="flex min-h-screen bg-slate-50 dark:bg-[#040d36]">
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <DocSidebar
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                currentPath="/docs/dao-voting"
            />

            {/* Main content */}
            <main className="flex-1 overflow-auto">
                {/* Mobile header */}
                <div className=" flex items-center justify-between p-4 bg-white dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30">
                    <MetaPilotLogo className='' />
                    <div className="flex items-center gap-2">
                        <ThemeToggle />
                        <Button
                            variant="ghost"
                            className='lg:hidden'
                            size="icon"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <Menu className="h-5 w-5" />
                        </Button>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto py-8 px-4 md:px-8">
                    <motion.div
                        variants={contentVariants}
                        initial="hidden"
                        animate="visible"
                        className="space-y-8"
                    >
                        {/* Breadcrumbs */}
                        <motion.div variants={itemVariants} className="flex items-center text-sm text-slate-500 dark:text-slate-400 mb-8">
                            <a href="/docs" className="hover:text-blue-600 dark:hover:text-blue-400">Documentation</a>
                            <ChevronRight className="h-4 w-4 mx-2" />
                            <a href="/docs/core-features" className="hover:text-blue-600 dark:hover:text-blue-400">Core Features</a>
                            <ChevronRight className="h-4 w-4 mx-2" />
                            <span className="text-slate-900 dark:text-white">DAO Voting Automation</span>
                        </motion.div>

                        {/* Title and metadata */}
                        <motion.div variants={itemVariants} className="space-y-3">
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                                DAO Voting Automation
                            </h1>
                            <div className="flex flex-wrap gap-2 items-center text-sm text-slate-500 dark:text-slate-400">
                                <div className="flex items-center gap-1">
                                    <FileText className="h-4 w-4" />
                                    <span>Updated 3 days ago</span>
                                </div>
                                <span>•</span>
                                <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    <span>8 min read</span>
                                </div>
                                <span>•</span>
                                <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1">
                                    <Bookmark className="h-4 w-4" />
                                    <span>Save</span>
                                </a>
                            </div>
                        </motion.div>

                        {/* Table of contents */}
                        <motion.div variants={itemVariants}>
                            <Card className="overflow-hidden dark:bg-slate-900/90 border-indigo-100 dark:border-indigo-900/30 shadow-lg">
                                <CardContent className="p-4">
                                    <h2 className="text-lg font-medium text-slate-900 dark:text-white mb-3">
                                        On this page
                                    </h2>
                                    <ul className="space-y-2 text-sm">
                                        <li>
                                            <a href="#introduction" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                                                Introduction
                                            </a>
                                        </li>
                                        <li>
                                            <a href="#how-it-works" className="text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400">
                                                How it Works
                                            </a>
                                        </li>
                                        <li>
                                            <a href="#code-examples" className="text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400">
                                                Code Examples
                                            </a>
                                        </li>
                                        <li>
                                            <a href="#supported-daos" className="text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400">
                                                Supported DAOs
                                            </a>
                                        </li>
                                        <li>
                                            <a href="#natural-language-rules" className="text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400">
                                                Natural Language Rules
                                            </a>
                                        </li>
                                        <li>
                                            <a href="#advanced-configuration" className="text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400">
                                                Advanced Configuration
                                            </a>
                                        </li>
                                    </ul>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Introduction section */}
                        <motion.div variants={itemVariants} id="introduction" className="space-y-4">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white scroll-mt-20">
                                Introduction
                            </h2>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                DAO Voting Automation is one of MetaPilot's core features, allowing you to automate your participation in decentralized governance. This feature uses AI to analyze proposal text and vote according to your predefined rules, ensuring you never miss important governance decisions while saving time and gas.
                            </p>
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 rounded-lg p-4 flex items-start gap-3">
                                <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                                <div className="text-sm text-blue-700 dark:text-blue-300">
                                    <p className="font-medium mb-1">Important</p>
                                    <p>DAO Voting requires delegation permissions but never needs access to transfer tokens or other high-risk operations. MetaPilot uses secure ERC-7715 session keys with limited scopes.</p>
                                </div>
                            </div>
                        </motion.div>

                        {/* How it works section */}
                        <motion.div variants={itemVariants} id="how-it-works" className="space-y-4 pt-6">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white scroll-mt-20">
                                How it Works
                            </h2>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                MetaPilot's DAO voting automation follows a straightforward workflow:
                            </p>
                            <ol className="space-y-4 mt-4 ml-6 list-decimal text-slate-600 dark:text-slate-400">
                                <li className="pl-2">
                                    <span className="font-medium text-slate-900 dark:text-white">Connect your wallet</span> and delegate limited voting permissions to MetaPilot using secure session keys.
                                </li>
                                <li className="pl-2">
                                    <span className="font-medium text-slate-900 dark:text-white">Define your voting rule</span> using natural language (e.g., "Vote YES if the proposal mentions rewards or community benefits").
                                </li>
                                <li className="pl-2">
                                    <span className="font-medium text-slate-900 dark:text-white">MetaPilot monitors</span> your selected DAOs for new proposals using both on-chain and off-chain data sources.
                                </li>
                                <li className="pl-2">
                                    <span className="font-medium text-slate-900 dark:text-white">When a new proposal is detected</span>, our AI analyzes the proposal text against your voting rule.
                                </li>
                                <li className="pl-2">
                                    <span className="font-medium text-slate-900 dark:text-white">If the rule conditions are met</span>, MetaPilot automatically casts your vote while optimizing for gas costs.
                                </li>
                                <li className="pl-2">
                                    <span className="font-medium text-slate-900 dark:text-white">You receive a notification</span> about the action taken, with a link to view the transaction details.
                                </li>
                            </ol>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mt-4">
                                This process ensures you maintain an active voice in DAO governance without the need to constantly monitor proposal feeds or manually execute voting transactions.
                            </p>
                        </motion.div>

                        {/* Code examples section */}
                        <motion.div variants={itemVariants} id="code-examples" className="space-y-4 pt-6">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white scroll-mt-20">
                                Code Examples
                            </h2>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                The following examples demonstrate how to create a DAO voting task programmatically using our API:
                            </p>

                            <div className="mt-6">
                                <Tabs value={activeTab} onValueChange={setActiveTab}>
                                    <TabsList className="w-full justify-start dark:bg-slate-800 bg-slate-100 dark:border-indigo-900/30 shadow-sm rounded-t-lg border border-b-0 border-slate-200 dark:border-slate-700">
                                        <TabsTrigger value="javascript" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900">JavaScript</TabsTrigger>
                                        <TabsTrigger value="typescript" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900">TypeScript</TabsTrigger>
                                        <TabsTrigger value="python" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900">Python</TabsTrigger>
                                    </TabsList>
                                    <div className="relative rounded-b-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden">
                                        <div className="absolute top-0 right-0 p-2 z-10">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                                                onClick={() => handleCopyCode(codeExamples[activeTab as keyof typeof codeExamples])}
                                            >
                                                <Copy className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <TabsContent value="javascript" className="p-4 mt-0">
                                            <pre className="font-mono text-sm text-slate-800 dark:text-slate-300 overflow-x-auto">
                                                {codeExamples.javascript}
                                            </pre>
                                        </TabsContent>
                                        <TabsContent value="typescript" className="p-4 mt-0">
                                            <pre className="font-mono text-sm text-slate-800 dark:text-slate-300 overflow-x-auto">
                                                {codeExamples.typescript}
                                            </pre>
                                        </TabsContent>
                                        <TabsContent value="python" className="p-4 mt-0">
                                            <pre className="font-mono text-sm text-slate-800 dark:text-slate-300 overflow-x-auto">
                                                {codeExamples.python}
                                            </pre>
                                        </TabsContent>
                                    </div>
                                </Tabs>
                            </div>
                        </motion.div>

                        {/* Supported DAOs section */}
                        <motion.div variants={itemVariants} id="supported-daos" className="space-y-4 pt-6">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white scroll-mt-20">
                                Supported DAOs
                            </h2>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                MetaPilot currently supports automated voting for the following DAOs:
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                <div className="flex items-center p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900/90">
                                    <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mr-3">
                                        <span className="font-medium text-slate-900 dark:text-white">N</span>
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-slate-900 dark:text-white">Nouns DAO</h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Ethereum • On-chain</p>
                                    </div>
                                    <Badge className="ml-auto" variant="outline">Popular</Badge>
                                </div>

                                <div className="flex items-center p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900/90">
                                    <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mr-3">
                                        <span className="font-medium text-slate-900 dark:text-white">E</span>
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-slate-900 dark:text-white">ENS DAO</h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Ethereum • On-chain</p>
                                    </div>
                                    <Badge className="ml-auto" variant="outline">Popular</Badge>
                                </div>

                                <div className="flex items-center p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900/90">
                                    <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mr-3">
                                        <span className="font-medium text-slate-900 dark:text-white">C</span>
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-slate-900 dark:text-white">Compound</h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Ethereum • On-chain</p>
                                    </div>
                                </div>

                                <div className="flex items-center p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900/90">
                                    <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mr-3">
                                        <span className="font-medium text-slate-900 dark:text-white">U</span>
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-slate-900 dark:text-white">Uniswap</h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Ethereum • On-chain</p>
                                    </div>
                                </div>

                                <div className="flex items-center p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900/90">
                                    <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mr-3">
                                        <span className="font-medium text-slate-900 dark:text-white">A</span>
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-slate-900 dark:text-white">Aave</h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Ethereum • Snapshot + On-chain</p>
                                    </div>
                                </div>

                                <div className="flex items-center p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900/90">
                                    <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mr-3">
                                        <span className="font-medium text-slate-900 dark:text-white">+</span>
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-slate-900 dark:text-white">Custom DAOs</h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Any DAO with Governor Bravo/Alpha compatibility</p>
                                    </div>
                                    <Badge className="ml-auto bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">Beta</Badge>
                                </div>
                            </div>

                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mt-4">
                                We're continually adding support for more DAOs. If you don't see a specific DAO on this list, you can request it through our <a href="/feedback" className="text-blue-600 dark:text-blue-400 hover:underline">feedback form</a> or configure a custom DAO if it uses a compatible governance framework.
                            </p>
                        </motion.div>

                        {/* Natural Language Rules section */}
                        <motion.div variants={itemVariants} id="natural-language-rules" className="space-y-4 pt-6">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white scroll-mt-20">
                                Natural Language Rules
                            </h2>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                One of MetaPilot's most powerful features is the ability to define voting rules using natural language. Our AI understands complex conditions and can evaluate proposal text against your specified criteria.
                            </p>

                            <div className="mt-4 space-y-4">
                                <h3 className="text-lg font-medium text-slate-900 dark:text-white">Example Rules</h3>

                                <div className="space-y-3">
                                    <div className="p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900/90">
                                        <div className="flex items-start gap-3">
                                            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                                            <div>
                                                <p className="font-medium text-slate-900 dark:text-white">"Vote YES if the proposal mentions rewards or community benefits."</p>
                                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Approves proposals focused on community incentives.</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900/90">
                                        <div className="flex items-start gap-3">
                                            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                                            <div>
                                                <p className="font-medium text-slate-900 dark:text-white">"Vote NO if the proposal increases treasury spending by more than 10% without clear ROI."</p>
                                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Rejects proposals with large, unjustified expenditures.</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900/90">
                                        <div className="flex items-start gap-3">
                                            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                                            <div>
                                                <p className="font-medium text-slate-900 dark:text-white">"Vote with the majority if voter turnout exceeds 30%, otherwise abstain."</p>
                                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Follows consensus on high-engagement proposals, abstains on low participation.</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900/90">
                                        <div className="flex items-start gap-3">
                                            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                                            <div>
                                                <p className="font-medium text-slate-900 dark:text-white">"Vote YES if the proposal improves security or reduces risk, NO if it compromises security for growth."</p>
                                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Prioritizes security-focused improvements.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/30 rounded-lg p-4 mt-6 flex items-start gap-3">
                                    <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                                    <div className="text-sm text-amber-700 dark:text-amber-300">
                                        <p className="font-medium mb-1">Important Note on Rule Complexity</p>
                                        <p>While our AI can understand complex rules, we recommend keeping conditions clear and specific. Overly complex rules with too many conditions may lead to unexpected voting behavior.</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Advanced Configuration section */}
                        <motion.div variants={itemVariants} id="advanced-configuration" className="space-y-4 pt-6">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white scroll-mt-20">
                                Advanced Configuration
                            </h2>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                Beyond basic voting rules, MetaPilot offers several advanced configuration options for DAO voting tasks:
                            </p>

                            <div className="mt-4 space-y-6">
                                <div>
                                    <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">Gas Optimization</h3>
                                    <p className="text-slate-600 dark:text-slate-400">
                                        Set maximum gas prices and scheduling preferences to optimize transaction costs. MetaPilot will automatically execute votes when gas prices fall within your specified range.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">Notification Preferences</h3>
                                    <p className="text-slate-600 dark:text-slate-400">
                                        Configure when and how you receive notifications about voting actions, including email, in-app, and webhook options.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">Proposal Filters</h3>
                                    <p className="text-slate-600 dark:text-slate-400">
                                        Filter which proposals to consider based on criteria like minimum quorum, proposal creator, or specific tags/categories.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">Delegation Management</h3>
                                    <p className="text-slate-600 dark:text-slate-400">
                                        Control how much voting power to delegate to MetaPilot and set expiration dates for delegations to enhance security.
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Next/Previous navigation */}
                        <motion.div variants={itemVariants} className="pt-8 mt-8 border-t border-slate-200 dark:border-slate-800">
                            <div className="flex flex-col sm:flex-row justify-between gap-4">
                                <a href="/docs/introduction" className="group flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400">
                                    <ChevronLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                                    <div>
                                        <div className="text-xs">Previous</div>
                                        <div className="font-medium">Introduction</div>
                                    </div>
                                </a>

                                <a href="/docs/yield-optimization" className="group flex items-center gap-2 text-right text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400">
                                    <div>
                                        <div className="text-xs">Next</div>
                                        <div className="font-medium">Yield Optimization</div>
                                    </div>
                                    <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </a>
                            </div>
                        </motion.div>

                        {/* Feedback section */}
                        <motion.div variants={itemVariants} className="mt-12 p-6 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-900/90">
                            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                                Was this page helpful?
                            </h3>
                            <p className="text-slate-600 dark:text-slate-400 mb-4">
                                Help us improve our documentation by providing feedback.
                            </p>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" className="gap-2">
                                    <ThumbsUp className="h-4 w-4" />
                                    Yes, it was helpful
                                </Button>
                                <Button variant="outline" size="sm" className="gap-2">
                                    <ThumbsDown className="h-4 w-4" />
                                    No, it needs improvement
                                </Button>
                                <Button variant="ghost" size="sm" className="ml-auto text-slate-600 dark:text-slate-400">
                                    <span>Edit this page</span>
                                    <PencilIcon className="h-4 w-4 ml-2" />
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </main>
        </div>
    );
};

// PencilIcon component
const PencilIcon = (props: React.ComponentProps<LucideIcon>) => (
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
        {...props}
    >
        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3Z" />
    </svg>
);

// ThumbsDown component
const ThumbsDown = (props: React.ComponentProps<LucideIcon>) => (
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
        {...props}
    >
        <path d="M17 14V2" />
        <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22h0a3.13 3.13 0 0 1-3-3.88Z" />
    </svg>
);

export default DocumentationPage;