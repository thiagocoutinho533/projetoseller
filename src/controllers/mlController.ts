import { Request, Response } from 'express';
import { addSeconds } from 'date-fns';
import { ENV } from '../config/env.js';
import { prisma } from '../db/prisma.js';
import { exchangeCodeForToken } from '../utils/token.js';
import { MLApi } from '../services/mlService.js';

export const MLController = {
  // Retorna a URL de autorização do Mercado Livre
  connectUrl: async (_req: Request, res: Response) => {
    const url = new URL('https://auth.mercadolibre.com/authorization');
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('client_id', ENV.ML_CLIENT_ID);
    url.searchParams.set('redirect_uri', ENV.ML_REDIRECT_URI);
    return res.json({ url: url.toString() });
  },

  // Callback do OAuth: troca code por tokens e salva/atualiza a conta
  oauthCallback: async (req: Request, res: Response) => {
    const code = req.query.code as string;
    if (!code) return res.status(400).json({ error: 'Missing code' });

    try {
      const tokenData = await exchangeCodeForToken(code);
      const tokenExpiresAt = addSeconds(new Date(), tokenData.expires_in);

      // TODO: vincular ao usuário autenticado do seu sistema (req.user.id)
      // MVP: cria/usa um admin fictício
      const user = await prisma.user.upsert({
        where: { email: 'admin@example.com' },
        update: {},
        create: { email: 'admin@example.com', passwordHash: 'demo' },
      });

      const account = await prisma.mLAccount.upsert({
        where: { mlUserId: String(tokenData.user_id) },
        update: {
          accessToken: tokenData.access_token,
          refreshToken: tokenData.refresh_token,
          tokenExpiresAt,
          scope: tokenData.scope,
        },
        create: {
          userId: user.id,
          mlUserId: String(tokenData.user_id),
          accessToken: tokenData.access_token,
          refreshToken: tokenData.refresh_token,
          tokenExpiresAt,
          scope: tokenData.scope,
        },
      });

      return res.json({
        ok: true,
        accountId: account.id,
        mlUserId: account.mlUserId,
        expiresAt: tokenExpiresAt,
      });
    } catch (e: any) {
      return res
        .status(500)
        .json({ error: 'OAuth exchange failed', details: e?.response?.data ?? e?.message });
    }
  },

  // Info do usuário no ML (teste rápido do token)
  me: async (req: Request, res: Response) => {
    const { accountId } = req.params;
    try {
      const acc = await prisma.mLAccount.findUnique({ where: { id: accountId } });
      if (!acc) return res.status(404).json({ error: 'Account not found' });

      const me = await MLApi.getMe(acc.accessToken);
      return res.json(me);
    } catch (e: any) {
      return res.status(500).json({ error: 'Failed to fetch me', details: e?.message });
    }
  },

  // Lista IDs de anúncios do vendedor
  listItems: async (req: Request, res: Response) => {
    const { accountId } = req.params;
    try {
      const data = await MLApi.listItems(accountId);
      return res.json(data); // { results: ["MLB..."], paging: {...} }
    } catch (e: any) {
      return res.status(500).json({ error: 'Failed to list items', details: e?.message });
    }
  },

  // Endpoint público para receber webhooks do ML
   webhook: async (req: Request, res: Response) => {
    try {
      const event = await prisma.webhookEvent.create({
        data: {
          topic: String(req.body.topic ?? 'unknown'),
          payload: req.body,
        },
      });
      // Sugestão: processar em fila (BullMQ) depois
      return res.status(200).json({ ok: true, id: event.id });
    } catch (e: any) {
      return res.status(500).json({ error: 'Webhook failed', details: e?.message });
    }
  },
}; // <- fecha o objeto MLController aqui
