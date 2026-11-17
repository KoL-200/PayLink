import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { notFoundHandler, errorHandler } from './common/middleware/error-handler';

const app: Express = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
    res.json({ success: true, status: 'ok', uptime: process.uptime() })
});

// other routes will be mounted

app.use(notFoundHandler);
app.use(errorHandler);

export default app;