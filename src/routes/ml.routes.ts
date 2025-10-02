import { Router } from 'express';
import { MLController } from '../controllers/mlController.js';

const router = Router();

// OAuth
router.get('/connect-url', MLController.connectUrl);
router.get('/oauth/callback', MLController.oauthCallback);

// Recursos
router.get('/:accountId/me', MLController.me);
router.get('/:accountId/items', MLController.listItems);

// Webhooks
router.post('/webhooks', MLController.webhook);

export default router;
