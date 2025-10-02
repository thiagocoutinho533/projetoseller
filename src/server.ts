import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import { ENV } from './config/env.js';
import mlRoutes from './routes/ml.routes.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

// middlewares base
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));

// health checks (úteis para teste local e via proxy)
app.get('/health', (_req, res) => res.json({ ok: true }));
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// rotas da API
app.use('/api/ml', mlRoutes);

// 404 padrão
app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

// middleware de erro centralizado
app.use(errorHandler);

// start
app.listen(ENV.PORT, () => {
  console.log(`API listening on http://localhost:${ENV.PORT}`);
});
