import axios from 'axios';
import { prisma } from '../db/prisma.js';
import { ENV } from '../config/env.js';
import { addSeconds } from 'date-fns';

export async function exchangeCodeForToken(code: string) {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: ENV.ML_CLIENT_ID,
    client_secret: ENV.ML_CLIENT_SECRET,
    code,
    redirect_uri: ENV.ML_REDIRECT_URI,
  });

  const { data } = await axios.post(
    'https://api.mercadolibre.com/oauth/token',
    body.toString(),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );

  // data: { access_token, token_type, expires_in, scope, user_id, refresh_token }
  return data as {
    access_token: string;
    token_type: string;
    expires_in: number;
    scope: string;
    user_id: number;
    refresh_token: string;
  };
}

export async function refreshAccessToken(accountId: string) {
  const account = await prisma.mLAccount.findUnique({ where: { id: accountId } });
  if (!account) throw new Error('MLAccount not found');

  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: ENV.ML_CLIENT_ID,
    client_secret: ENV.ML_CLIENT_SECRET,
    refresh_token: account.refreshToken,
  });

  const { data } = await axios.post(
    'https://api.mercadolibre.com/oauth/token',
    body.toString(),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );

  const tokenExpiresAt = addSeconds(new Date(), data.expires_in);

  await prisma.mLAccount.update({
    where: { id: accountId },
    data: {
      accessToken: data.access_token,
      refreshToken: data.refresh_token ?? account.refreshToken,
      tokenExpiresAt,
      scope: data.scope ?? account.scope,
    },
  });

  return data.access_token as string;
}

export async function getValidToken(accountId: string) {
  const acc = await prisma.mLAccount.findUnique({ where: { id: accountId } });
  if (!acc) throw new Error('Account not found');

  // se faltar menos de 60s para expirar, faz refresh
  if (acc.tokenExpiresAt.getTime() - Date.now() < 60_000) {
    return await refreshAccessToken(accountId);
  }
  return acc.accessToken;
}
