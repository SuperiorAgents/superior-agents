import express, { Request, Response, NextFunction } from 'express';
import { WebSocket, WebSocketServer } from 'ws';
import { spawn } from 'child_process';
import path from 'path';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { Session, SSEClient, PythonMessage, WebSocketMessage } from './types';
// import fs from 'fs';
import sqlite3 from 'sqlite3';
import { Database, open } from 'sqlite';
import cors from 'cors';
import { VaultClient } from './vault-client';
import { sessionManager, initializeRedis } from './redis';
import axios from 'axios'; // or use axios
import { getAgentSession, updateAgentSession } from './db'
import { statSync } from 'fs';
import dayjs from 'dayjs';
import fs from 'fs-extra';


const vaultClient = new VaultClient(process.env.VAULT_URL || 'http://localhost:3000');

dotenv.config();

const AGENT_FOLDER = "agent"
// Replace Python interpreter setup with path configuration
const VENV_PYTHON = path.join(__dirname, `../${AGENT_FOLDER}/.venv/bin/python`);
const MAIN_SCRIPT = `scripts.main`

const memoryStatsClients = new Set<Response>();
let memoryStatsInterval: NodeJS.Timeout | null = null;

function getMemoryStats() {
    const memoryUsage = process.memoryUsage();
    return {
      rss: memoryUsage.rss / 1024 / 1024,         
      heapTotal: memoryUsage.heapTotal / 1024 / 1024,
      heapUsed: memoryUsage.heapUsed / 1024 / 1024,
      external: memoryUsage.external / 1024 / 1024,
      timestamp: new Date().toISOString(),
    };
  }

// Express server
const app = express();
const port = process.env.PORT || 4999;

// WebSocket server
const wss = new WebSocketServer({ noServer: true });

// Add these constants after other constants
const LOGS_DIR = path.join(__dirname, './logs');
const DB_PATH = path.join(__dirname, `../${AGENT_FOLDER}/db/trading_agent.db`);
let db: Database;

// Create logs directory if it doesn't exist
if (!fs.existsSync(LOGS_DIR)) {
    fs.mkdirSync(LOGS_DIR, { recursive: true });
}

// Add CORS middleware before other middleware and routes
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

function sseMiddleware(req: Request, res: Response, next: NextFunction): void {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const pingInterval = setInterval(() => {
        res.write('event: ping\ndata: ping\n\n');
    }, 30000);

    res.on('close', () => {
        clearInterval(pingInterval);
    });

    next();
}

// Helper function to verify session existence
async function getSessionWithErrorHandling(sessionId: string, context: string): Promise<Session | undefined> {
    const session = await sessionManager.getSession(sessionId);
    console.log(`[Session Manager] Session ID: ${sessionId}, Found: ${!!session}, Status: ${session?.status || 'N/A'}`);
    
    if (!session) {
        console.log(`[Session Not Found] ID: ${sessionId}, Context: ${context}`);
        return undefined;
    }
    console.log(`[Session Found] ID: ${sessionId}, Context: ${context}, Status: ${session.status}`);
    return session;
}

// Add a debug route to test basic connectivity
app.get('/ping', (req: Request, res: Response) => {
  console.log('[DEBUG] Ping endpoint hit');
  res.send('pong');
});

// Move the memory-stats endpoint earlier in your route definitions
// Add explicit debugging to track when it's accessed
app.get('/memory-stats', (req: Request, res: Response) => {
  console.log('[DEBUG] Memory stats endpoint accessed');
  
  try {
    // Add SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    });
    
    console.log('[DEBUG] SSE headers set');
    
    // Add client to tracking set
    memoryStatsClients.add(res);
    console.log('[DEBUG] Client added to tracking set, total clients:', memoryStatsClients.size);
  
    // Send initial stats immediately
    const initialStats = getMemoryStats();
    console.log('[DEBUG] Initial stats:', initialStats);
    res.write(`event: update\ndata: ${JSON.stringify(initialStats)}\n\n`);
  
    // Start interval if not already running
    if (!memoryStatsInterval) {
      console.log('[DEBUG] Starting stats interval');
      memoryStatsInterval = setInterval(() => {
        const stats = getMemoryStats();
        console.log('[DEBUG] Broadcasting stats to', memoryStatsClients.size, 'clients');
        memoryStatsClients.forEach(client => {
          client.write(`event: update\ndata: ${JSON.stringify(stats)}\n\n`);
        });
      }, 1000);  // Update every second
    }
  
    // Remove client on disconnect
    res.on('close', () => {
      console.log('[DEBUG] Client disconnected');
      memoryStatsClients.delete(res);
      if (memoryStatsClients.size === 0 && memoryStatsInterval) {
        console.log('[DEBUG] No more clients, clearing interval');
        clearInterval(memoryStatsInterval);
        memoryStatsInterval = null;
      }
    });
  } catch (error) {
    console.error('[DEBUG] Error in memory-stats endpoint:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/sessions/:sessionId/events', sseMiddleware, async (req: Request, res: Response) => {
    const sessionId = req.params.sessionId;
    const session = await getSessionWithErrorHandling(sessionId, 'GET /sessions/:sessionId/events');

    if (!session) {
        res.write(`event: error\ndata: ${JSON.stringify({ message: 'Session not found' })}\n\n`);
        res.end();
        return;
    }

    res.write(`event: status\ndata: ${JSON.stringify({
        status: session.status,
        connectedClients: session.wsClients.size
    })}\n\n`);

    const sseClient: SSEClient = {
        send: (data: any) => {
            const event = data.type || 'message';
            res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
        }
    };

    if (!session.sseClients) {
        session.sseClients = new Set();
    }
    session.sseClients.add(sseClient);

    res.on('close', () => {
        if (session.sseClients) {
            session.sseClients.delete(sseClient);
        }
    });
});

app.post('/sessions/:sessionId/push_token', express.json(), async (req, res) => {
    const sessionId = req.params.sessionId;
    // const session = await getSessionWithErrorHandling(sessionId, 'POST /sessions/:sessionId/push_token');
    const logFilePath = path.join(LOGS_DIR, `${sessionId}.jsonl`);

    // if (!session) {
    //     return res.status(404).json({
    //         status: 'error',
    //         message: 'Session not found'
    //     });
    // }

    // console.log(`[Push TOKEN Request] Session: ${sessionId}, Message type: ${req.body.type}`);

    try {
        // Parse the message if it's a string
        const message = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        // console.log(message)

        const logEntry = {
            timestamp: new Date().toISOString(),
            type: 'stdout',
            message: message
        };

        // Write to log file in JSONL format
        fs.appendFileSync(logFilePath, message.message);

        // broadcastToClients(session, {
        //     type: 'LOG',
        //     message: message
        // });

        res.json({
            status: 'success',
            message: 'Log entry pushed successfully'
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to push log entry'
        });
    }
});

app.post('/sessions/:sessionId/push', express.json(), async (req, res) => {
    const sessionId = req.params.sessionId;
    const session = await getSessionWithErrorHandling(sessionId, 'POST /sessions/:sessionId/push');

    if (!session) {
        return res.status(404).json({
            status: 'error',
            message: 'Session not found'
        });
    }

    console.log(`[Push Request] Session: ${sessionId}, Message type: ${req.body.type}`);

    try {
        // Parse the message if it's a string
        const message = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

        const logEntry = {
            timestamp: new Date().toISOString(),
            type: 'stdout',
            message: message
        };

        // Write to log file in JSONL format
        fs.appendFileSync(session.logFilePath, JSON.stringify(logEntry) + '\n');

        broadcastToClients(session, {
            type: 'LOG',
            message: message
        });

        res.json({
            status: 'success',
            message: 'Log entry pushed successfully'
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to push log entry'
        });
    }
});

app.post('/backup_log', async (req: Request, res: Response) => {
    try {
        const sessionId = req.body?.session_id;
        const sourceFile = path.join(LOGS_DIR, `${sessionId}.jsonl`);
        if (!await fs.pathExists(sourceFile)) {
            return res.status(404).json({ message: 'Source file not found.' });
        }

        const date = dayjs().format('YYYY-MM-DD_HH-mm-ss');
        const backupFile = path.join(LOGS_DIR, `${sessionId}_${date}.jsonl`);
        
        await fs.copy(sourceFile, backupFile);
        
        return res.status(200).json({ message: 'Backup successful.', backupFile });
    } catch (error) {
        console.error('Error during backup:', error);
        return res.status(500).json({ message: 'Backup failed.', error: String(error) });
    }
});

app.post('/filesize', (req: Request, res: Response) => {
    const sessionId = req.body?.session_id;
    const filePath = path.join(LOGS_DIR, `${sessionId}.jsonl`);
    try {
        const stats = statSync(filePath);
        const fileSize = stats.size;  // Size in bytes
        res.json({ file: filePath, size: `${fileSize} bytes` });
    } catch (error) {
        res.status(500).json({ error: 'Error reading file size', details: error });
    }
});

async function cleanupSession(sessionId: string, code: number = 1000, reason: string = 'Session ended'): Promise<void> {
    console.log(`[Session Cleanup Started] ID: ${sessionId}, Reason: ${reason}`);
    
    try {
        const session = await sessionManager.getSession(sessionId);
        
        if (!session) {
            console.log(`[Session Cleanup Warning] Session ${sessionId} not found`);
            return;
        }

        // Safely close WebSocket clients
        if (session.wsClients) {
            for (const client of session.wsClients) {
                try {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({
                            type: 'SESSION_END',
                            reason: reason
                        }));
                        client.close(code, reason);
                    }
                } catch (err) {
                    console.error(`[WS Cleanup Error] Failed to close WebSocket client: ${err}`);
                }
            }
        }

        // Safely close SSE clients
        if (session.sseClients) {
            for (const client of session.sseClients) {
                try {
                    client.send({
                        type: 'SESSION_END',
                        reason: reason
                    });
                } catch (err) {
                    console.error(`[SSE Cleanup Error] Failed to notify SSE client: ${err}`);
                }
            }
        }

        // Safely terminate the process
        if (session.process) {
            try {
                if (!session.process.killed && session.process.pid) {
                    // Close stdin if it exists
                    if (session.process.stdin) {
                        session.process.stdin.end();
                    }
                    
                    const pid = session.process.pid;
                    try {
                        // Send SIGTERM to the entire process group
                        process.kill(-pid, 'SIGTERM');
                    } catch (err) {
                        console.error(`Error sending SIGTERM to process group ${pid}:`, err);
                    }

                    // Wait for graceful termination
                    await new Promise(resolve => setTimeout(resolve, 5000));

                    // Check if process group still exists
                    try {
                        process.kill(-pid, 0); // Check if process group exists
                        // Still alive, send SIGKILL
                        process.kill(-pid, 'SIGKILL');
                    } catch (err) {
                        // Process group already terminated
                        console.error(`Error sending SIGKILL to process group ${pid}:`, err);
                    }
                } else if (!session.process.killed) {
                    // Fallback if PID isn't available
                    session.process.kill('SIGTERM');
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    if (!session.process.killed) {
                        session.process.kill('SIGKILL');
                    }
                }
            } catch (err) {
                console.error(`[Process Cleanup Error] Failed to terminate process: ${err}`);
            }
        }

        // Finally remove the session from Redis
        await sessionManager.deleteSession(sessionId);
        console.log(`[Session Cleanup Completed] ID: ${sessionId}`);
        
    } catch (error) {
        console.error(`[Session Cleanup Failed] ID: ${sessionId}, Error:`, error);
        throw new Error(`Failed to cleanup session: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

function broadcastToClients(session: Session, message: any): void {
    session.wsClients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message));
        }
    });

    if (session.sseClients) {
        session.sseClients.forEach(client => {
            client.send(message);
        });
    }
}

// Send prompts to client
app.get('/prompts', async (req: Request, res: Response) => {
    try {
        const promptsPath = path.join(__dirname, `../${AGENT_FOLDER}/data/prompts.json`);
        const promptsData = await fs.promises.readFile(promptsPath, 'utf8');
        res.json(JSON.parse(promptsData));
    } catch (error) {
        console.error('Error reading prompts file:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to read prompts file'
        });
    }
});

// Add this initialization before the Express routes
async function initializeDatabase() {
    try {
        db = await open({
            filename: DB_PATH,
            driver: sqlite3.Database
        });
        console.log('Successfully connected to SQLite database');
    } catch (error) {
        console.error('Failed to connect to database:', error);
        process.exit(1);
    }
}

app.post('/sessions', async (req: Request, res: Response) => {
    const sessionId = crypto.randomUUID();
    const logFile = path.join(LOGS_DIR, `${sessionId}.jsonl`);

    // Log the initial request payload
    const initialLogEntry = {
        timestamp: new Date().toISOString(),
        type: 'request',
        payload: req.body || {}
    };
    fs.writeFileSync(logFile, JSON.stringify(initialLogEntry) + '\n');

    // Determine which script to run based on agent_type
    const scriptToRun =  MAIN_SCRIPT;

    const agentType = req.body?.agent_type;

    const agentId = req.body?.agent_id; 

    if (!scriptToRun) {
        return res.status(400).json({
            status: 'error',
            message: 'Invalid agent type, must be either "trading" or "marketing"'
        });
    }

    const pythonProcess = spawn(VENV_PYTHON, ['-m', scriptToRun, agentType, sessionId, agentId], {
        stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
        env: {
            ...process.env,
            VIRTUAL_ENV: path.join(__dirname, `../${AGENT_FOLDER}/.venv`),
            PATH: `${path.join(__dirname, `../${AGENT_FOLDER}/.venv/bin`)}:${process.env.PATH}`,
            PYTHONPATH: path.join(__dirname, `../${AGENT_FOLDER}`),
        },
        cwd: path.join(__dirname, `../${AGENT_FOLDER}`)
    });

    if (!pythonProcess.stdout || !pythonProcess.stderr || !pythonProcess.stdin) {
        return res.status(500).json({
            status: 'error',
            message: 'Failed to start trading session'
        });
    }

    const session: Session = {
        process: pythonProcess,
        status: 'starting',
        wsClients: new Set(),
        pendingRequests: new Map(),
        sseClients: new Set(),
        logFilePath: logFile,
        createdAt: new Date(),
        lastActivity: new Date()
    };
    await sessionManager.setSession(sessionId, session);
    console.log(`[Session Created] ID: ${sessionId}, Status: starting, Log File: ${logFile}`);

    let initReceived = false;
    let stdoutBuffer = '';
    let responseHandled = false;

    // Send initial response immediately
    res.json({
        sessionId,
        status: 'success',
        message: 'Session created successfully'
    });
    responseHandled = true;

    pythonProcess.stdout?.on('data', (data: Buffer) => {
        stdoutBuffer += data.toString();

        let newlineIndex: number;
        while ((newlineIndex = stdoutBuffer.indexOf('\n')) !== -1) {
            const line = stdoutBuffer.slice(0, newlineIndex).trim();
            stdoutBuffer = stdoutBuffer.slice(newlineIndex + 1);

            try {
                const parsed = JSON.parse(line) as PythonMessage;

                if (!initReceived) {
                    initReceived = true;
                    session.status = 'ready';
                }

                const logEntry = {
                    timestamp: new Date().toISOString(),
                    type: 'stdout',
                    data: parsed
                };

                fs.appendFileSync(session.logFilePath, JSON.stringify(logEntry) + '\n');

                broadcastToClients(session, {
                    type: 'MESSAGE',
                    data: parsed
                });
            } catch (error) {
                const logEntry = {
                    timestamp: new Date().toISOString(),
                    type: 'stdout',
                    message: line
                };

                fs.appendFileSync(session.logFilePath, JSON.stringify(logEntry) + '\n');

                broadcastToClients(session, {
                    type: 'LOG',
                    message: line
                });
            }
        }
    });

    pythonProcess.stderr?.on('data', (data: Buffer) => {
        const errorMessage = data.toString().trim();

        const logEntry = {
            timestamp: new Date().toISOString(),
            type: 'stderr',
            message: errorMessage
        };

        fs.appendFileSync(session.logFilePath, JSON.stringify(logEntry) + '\n');

        if (!initReceived && errorMessage.includes('Reset agent')) {
            initReceived = true;
            session.status = 'ready';
        }

        broadcastToClients(session, {
            type: 'LOG',
            message: errorMessage
        });
    });

    pythonProcess.on('error', (error: Error) => {
        console.error('Process failed:', error);
        broadcastToClients(session, {
            type: 'ERROR',
            message: error.message
        });
        cleanupSession(sessionId, 500, 'Process startup failed');
    });

    setTimeout(() => {
        if (!initReceived) {
            cleanupSession(sessionId, 500, 'Initialization timeout');
        }
    }, 30000);
});

app.post('/single_agent_session', async (req: Request, res: Response) => {
    const sessionId = req.body?.agent_id;
    const logFile = path.join(LOGS_DIR, `${sessionId}.jsonl`);

    // Log the initial request payload
    const initialLogEntry = {
        timestamp: new Date().toISOString(),
        type: 'request',
        payload: req.body || {}
    };
    fs.writeFileSync(logFile, JSON.stringify(initialLogEntry) + '\n');

    // Determine which script to run based on agent_type
    const scriptToRun =  MAIN_SCRIPT;

    const agentType = req.body?.agent_type;

    const agentId = req.body?.agent_id; 

    if (!scriptToRun) {
        return res.status(400).json({
            status: 'error',
            message: 'Invalid agent type, must be either "trading" or "marketing"'
        });
    }

    const pythonProcess = spawn(VENV_PYTHON, ['-m', scriptToRun, agentType, sessionId, agentId], {
        stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
        env: {
            ...process.env,
            VIRTUAL_ENV: path.join(__dirname, `../${AGENT_FOLDER}/.venv`),
            PATH: `${path.join(__dirname, `../${AGENT_FOLDER}/.venv/bin`)}:${process.env.PATH}`,
            PYTHONPATH: path.join(__dirname, `../${AGENT_FOLDER}`),
        },
        cwd: path.join(__dirname, `../${AGENT_FOLDER}`)
    });

    if (!pythonProcess.stdout || !pythonProcess.stderr || !pythonProcess.stdin) {
        return res.status(500).json({
            status: 'error',
            message: 'Failed to start trading session'
        });
    }

    const session: Session = {
        process: pythonProcess,
        status: 'starting',
        wsClients: new Set(),
        pendingRequests: new Map(),
        sseClients: new Set(),
        logFilePath: logFile,
        createdAt: new Date(),
        lastActivity: new Date()
    };
    await sessionManager.setSession(sessionId, session);
    console.log(`[Session Created] ID: ${sessionId}, Status: starting, Log File: ${logFile}`);

    let initReceived = false;
    let stdoutBuffer = '';
    let responseHandled = false;

    // Send initial response immediately
    res.json({
        sessionId,
        status: 'success',
        message: 'Session created successfully'
    });
    responseHandled = true;

    pythonProcess.stdout?.on('data', (data: Buffer) => {
        stdoutBuffer += data.toString();

        let newlineIndex: number;
        while ((newlineIndex = stdoutBuffer.indexOf('\n')) !== -1) {
            const line = stdoutBuffer.slice(0, newlineIndex).trim();
            stdoutBuffer = stdoutBuffer.slice(newlineIndex + 1);

            try {
                const parsed = JSON.parse(line) as PythonMessage;

                if (!initReceived) {
                    initReceived = true;
                    session.status = 'ready';
                }

                const logEntry = {
                    timestamp: new Date().toISOString(),
                    type: 'stdout',
                    data: parsed
                };

                fs.appendFileSync(session.logFilePath, JSON.stringify(logEntry) + '\n');

                broadcastToClients(session, {
                    type: 'MESSAGE',
                    data: parsed
                });
            } catch (error) {
                const logEntry = {
                    timestamp: new Date().toISOString(),
                    type: 'stdout',
                    message: line
                };

                fs.appendFileSync(session.logFilePath, JSON.stringify(logEntry) + '\n');

                broadcastToClients(session, {
                    type: 'LOG',
                    message: line
                });
            }
        }
    });

    pythonProcess.stderr?.on('data', (data: Buffer) => {
        const errorMessage = data.toString().trim();

        const logEntry = {
            timestamp: new Date().toISOString(),
            type: 'stderr',
            message: errorMessage
        };

        fs.appendFileSync(session.logFilePath, JSON.stringify(logEntry) + '\n');

        if (!initReceived && errorMessage.includes('Reset agent')) {
            initReceived = true;
            session.status = 'ready';
        }

        broadcastToClients(session, {
            type: 'LOG',
            message: errorMessage
        });
    });

    pythonProcess.on('error', (error: Error) => {
        console.error('Process failed:', error);
        broadcastToClients(session, {
            type: 'ERROR',
            message: error.message
        });
        cleanupSession(sessionId, 500, 'Process startup failed');
    });

    // setTimeout(() => {
    //     if (!initReceived) {
    //         cleanupSession(sessionId, 500, 'Initialization timeout');
    //     }
    // }, 30000);
});

app.get('/sessions/:sessionId', async (req: Request, res: Response) => {
    const session = await getSessionWithErrorHandling(req.params.sessionId, 'GET /sessions/:sessionId');
    if (!session) {
        return res.status(404).json({
            status: 'error',
            message: 'Session not found'
        });
    }

    res.json({
        status: 'success',
        sessionStatus: session.status,
        connectedClients: session.wsClients.size
    });
});

app.get('/sessions/:sessionId/logs', sseMiddleware, async (req: Request, res: Response) => {
    const sessionId = req.params.sessionId;
    const session = await getSessionWithErrorHandling(sessionId, 'GET /sessions/:sessionId/logs');

    if (!session) {
        res.write(`event: error\ndata: ${JSON.stringify({ message: 'Session not found' })}\n\n`);
        res.end();
        return;
    }

    // Send initial status
    res.write(`event: status\ndata: ${JSON.stringify({
        status: session.status,
        connectedClients: session.wsClients.size
    })}\n\n`);

    // Send existing logs
    try {
        const logs = fs.readFileSync(session.logFilePath, 'utf8');
        res.write(`event: logs\ndata: ${JSON.stringify({ logs })}\n\n`);
    } catch (error) {
        console.error(`Error reading log file: ${error}`);
        res.write(`event: error\ndata: ${JSON.stringify({ message: 'Error reading logs' })}\n\n`);
    }

    // Watch for new logs
    const watcher = fs.watch(session.logFilePath, (eventType) => {
        if (eventType === 'change') {
            try {
                const newLogs = fs.readFileSync(session.logFilePath, 'utf8');
                res.write(`event: logs\ndata: ${JSON.stringify({ logs: newLogs })}\n\n`);
            } catch (error) {
                console.error(`Error reading log file: ${error}`);
            }
        }
    });

    // Cleanup on connection close
    res.on('close', () => {
        watcher.close();
    });
});

app.get('/sessions', async (req: Request, res: Response) => {
    try {
        const sessions = await sessionManager.getAllSessions();
        const sessionInfo = Array.from(sessions.entries()).map(([id, session]) => ({
            sessionId: id,
            status: session.status,
            connectedClients: session.wsClients.size,
            createdAt: session.createdAt || new Date(),
            lastActivity: session.lastActivity || new Date(),
        }));

        res.json({
            status: 'success',
            sessions: sessionInfo
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to retrieve sessions',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

app.delete('/sessions/:sessionId', async (req: Request, res: Response) => {
    const sessionId = req.params.sessionId;
    const session = await getSessionWithErrorHandling(sessionId, 'DELETE /sessions/:sessionId');

    if (!session) {
        return res.status(404).json({
            status: 'error',
            message: 'Session not found'
        });
    }

    try {
        await cleanupSession(sessionId, 1000, 'Session terminated by administrator');
        res.json({
            status: 'success',
            message: 'Session terminated successfully'
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to terminate session',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});



app.post('/continue_session', async (req: Request, res: Response) => {
    const { session_id, agent_id } = req.body;

    if (!session_id || !agent_id) {
        return res.status(400).json({
            status: 'error',
            message: 'session_id, agent_id is required'
        });
    }

    const sessionData = await getAgentSession(agent_id, session_id);
    
    if (!sessionData) {
        return res.status(404).json({
            status: 'error',
            message: 'Session not found'
        });
    }
    

    // Reuse the existing log file
    const logFile = path.join(LOGS_DIR, `${session_id}.jsonl`);

    // Log the initial request payload
    const initialLogEntry = {
        timestamp: new Date().toISOString(),
        type: 'request',
        payload: req.body || {}
    };
    fs.appendFileSync(logFile, JSON.stringify(initialLogEntry) + '\n');

    // Determine which script to run based on agent_type
    const scriptToRun = MAIN_SCRIPT;
    const agentType = req.body?.agent_type;
    const agentId = req.body?.agent_id;

    if (!scriptToRun) {
        return res.status(400).json({
            status: 'error',
            message: 'Invalid agent type, must be either "trading" or "marketing"'
        });
    }

    const pythonProcess = spawn(VENV_PYTHON, ['-m', scriptToRun, agentType, session_id, agentId], {
        stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
        env: {
            ...process.env,
            VIRTUAL_ENV: path.join(__dirname, `../${AGENT_FOLDER}/.venv`),
            PATH: `${path.join(__dirname, `../${AGENT_FOLDER}/.venv/bin`)}:${process.env.PATH}`,
            PYTHONPATH: path.join(__dirname, `../${AGENT_FOLDER}`),
        },
        cwd: path.join(__dirname, `../${AGENT_FOLDER}`)
    });

    if (!pythonProcess.stdout || !pythonProcess.stderr || !pythonProcess.stdin) {
        return res.status(500).json({
            status: 'error',
            message: 'Failed to start session'
        });
    }

    const session: Session = {
        process: pythonProcess,
        status: 'starting',
        wsClients: new Set(),
        pendingRequests: new Map(),
        sseClients: new Set(),
        logFilePath: logFile,
        createdAt: new Date(),
        lastActivity: new Date()
    };
    await sessionManager.setSession(session_id, session);
    console.log(`[Session Continued] ID: ${session_id}, Status: starting, Log File: ${logFile}`);

    let initReceived = false;
    let stdoutBuffer = '';

    // Send initial response immediately
    res.json({
        session_id,
        agentId,
        status: 'success',
        message: 'Session continued successfully'
    });

    pythonProcess.stdout?.on('data', (data: Buffer) => {
        stdoutBuffer += data.toString();

        let newlineIndex: number;
        while ((newlineIndex = stdoutBuffer.indexOf('\n')) !== -1) {
            const line = stdoutBuffer.slice(0, newlineIndex).trim();
            stdoutBuffer = stdoutBuffer.slice(newlineIndex + 1);

            try {
                const parsed = JSON.parse(line) as PythonMessage;

                if (!initReceived) {
                    initReceived = true;
                    session.status = 'ready';
                }

                const logEntry = {
                    timestamp: new Date().toISOString(),
                    type: 'stdout',
                    data: parsed
                };

                fs.appendFileSync(session.logFilePath, JSON.stringify(logEntry) + '\n');

                broadcastToClients(session, {
                    type: 'MESSAGE',
                    data: parsed
                });
            } catch (error) {
                const logEntry = {
                    timestamp: new Date().toISOString(),
                    type: 'stdout',
                    message: line
                };

                fs.appendFileSync(session.logFilePath, JSON.stringify(logEntry) + '\n');

                broadcastToClients(session, {
                    type: 'LOG',
                    message: line
                });
            }
        }
    });

    pythonProcess.stderr?.on('data', (data: Buffer) => {
        const errorMessage = data.toString().trim();

        const logEntry = {
            timestamp: new Date().toISOString(),
            type: 'stderr',
            message: errorMessage
        };

        fs.appendFileSync(session.logFilePath, JSON.stringify(logEntry) + '\n');

        if (!initReceived && errorMessage.includes('Reset agent')) {
            initReceived = true;
            session.status = 'ready';
        }

        broadcastToClients(session, {
            type: 'LOG',
            message: errorMessage
        });
    });

    pythonProcess.on('error', (error: Error) => {
        console.error('Process failed:', error);
        broadcastToClients(session, {
            type: 'ERROR',
            message: error.message
        });
        cleanupSession(session_id, 500, 'Process startup failed');
    });

    setTimeout(() => {
        if (!initReceived) {
            cleanupSession(session_id, 500, 'Initialization timeout');
        }
    }, 30000);
});

// Add this endpoint to your existing Express app
app.delete('/delete_session', async (req: Request, res: Response) => {
    const { agent_id, session_id } = req.body;

    if (!agent_id || !session_id) {
        return res.status(400).json({
            status: 'error',
            message: 'agent_id and session are required'
        });
    }


    try {
        const responseData = await updateAgentSession(agent_id, session_id, 'stopping');

        res.json({
            status: 'success',
            message: 'Session update request sent successfully',
            data: responseData
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

wss.on('connection', async (ws: WebSocket, req: Request) => {
    const url = new URL(req.url!, `http://${req.headers.host}`);
    const sessionId = url.searchParams.get('sessionId');

    if (!sessionId) {
        console.log(`[WS Connection Rejected] Missing sessionId`);
        ws.close(4001, 'Session ID required');
        return;
    }

    const session = await getSessionWithErrorHandling(sessionId, 'WebSocket connection');
    if (!session) {
        console.log(`[WS Connection Rejected] Session not found: ${sessionId}`);
        ws.close(4004, 'Session not found');
        return;
    }

    session.wsClients.add(ws);
    console.log(`[WS Client Connected] Session: ${sessionId}, Total clients: ${session.wsClients.size}`);

    ws.send(JSON.stringify({
        type: 'CONNECTION_STATUS',
        status: 'connected',
        sessionId
    }));

    let buffer = '';

    ws.on('message', (message: Buffer | ArrayBuffer | Buffer[]) => {
        try {
            const { action, params = {} }: WebSocketMessage = JSON.parse(message.toString());
            const correlationId = crypto.randomUUID();

            const command = JSON.stringify({
                action,
                params,
                correlationId
            }) + '\n';

            if (session.process.stdin) {
                session.process.stdin.write(command);
                session.pendingRequests.set(correlationId, ws);
            } else {
                ws.send(JSON.stringify({
                    type: 'ERROR',
                    message: 'Process stdin not available'
                }));
            }
        } catch (error) {
            ws.send(JSON.stringify({
                type: 'ERROR',
                message: error instanceof Error ? error.message : 'Unknown error'
            }));
        }
    });

    if (session.process.stdout) {
        session.process.stdout.on('data', (data: Buffer) => {
            buffer += data.toString();
            while (true) {
                const end = buffer.indexOf('}\n');
                if (end === -1) break;

                const message = buffer.slice(0, end + 1);
                buffer = buffer.slice(end + 2);

                try {
                    const { correlationId, result, error } = JSON.parse(message);
                    const client = session.pendingRequests.get(correlationId);

                    if (client) {
                        client.send(JSON.stringify({
                            status: error ? 'error' : 'success',
                            correlationId,
                            result,
                            error
                        }));
                        session.pendingRequests.delete(correlationId);
                    }
                } catch (e) {
                    console.error('Failed to process response:', message);
                }
            }
        });
    }

    ws.on('close', () => {
        session.wsClients.delete(ws);
        console.log(`[WS Client Disconnected] Session: ${sessionId}, Remaining clients: ${session.wsClients.size}`);
    });
});

// Initialize both database and Redis when starting the server
Promise.all([initializeDatabase(), initializeRedis()]).then(() => {
    const server = app.listen(port, () => {
        console.log(`Server running on port ${port}`);
        
        // Signal to PM2 that the application is ready only after Redis and DB are connected
        if (process.send) {
            process.send('ready');
        }
    });

    server.on('upgrade', (request: Request, socket: any, head: Buffer) => {
        wss.handleUpgrade(request, socket, head, (ws) => {
            wss.emit('connection', ws, request);
        });
    });

    app.use(express.static(path.join(__dirname, 'static')));
}).catch(error => {
    console.error('Failed to start server:', error);
    process.exit(1);  // Exit if either Redis or DB fails to initialize
}); 