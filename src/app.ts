import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { notFoundHandler, errorHandler } from './common/middleware/error-handler';
import { prisma } from './config/prisma';

// auth
import { authRoutes } from './features/auth';

// workspaces
import { workspaceRoutes } from './features/workspaces';

const app: Express = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
    res.json({ success: true, status: 'ok', uptime: process.uptime() });
});

// DB health check
app.get('/health/db', async (_req, res) => {
    await prisma.$queryRaw` SELECT 1`;
    res.json({ success: true, db: 'connected' })
})

// other routes will be mounted
app.use('/auth', authRoutes);
app.use('/workspace', workspaceRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;