import axios from 'axios';
import { prisma } from '../db/prisma.js';
import { getValidToken } from '../utils/token.js';


export const MLApi = {
async getMe(accessToken: string) {
const { data } = await axios.get('https://api.mercadolibre.com/users/me', {
headers: { Authorization: `Bearer ${accessToken}` },
});
return data;
},


async listItems(accountId: string) {
const token = await getValidToken(accountId);
const acc = await prisma.mLAccount.findUnique({ where: { id: accountId } });
if (!acc) throw new Error('Account not found');
const { data } = await axios.get(`https://api.mercadolibre.com/users/${acc.mlUserId}/items/search`, {
headers: { Authorization: `Bearer ${token}` },
params: { limit: 50, offset: 0 },
});
return data; // { results: ["MLB..."], paging: {...} }
},


async getItem(accountId: string, mlItemId: string) {
const token = await getValidToken(accountId);
const { data } = await axios.get(`https://api.mercadolibre.com/items/${mlItemId}`, {
headers: { Authorization: `Bearer ${token}` },
});
return data;
},
};