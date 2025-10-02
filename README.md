## README.md (como rodar)
```md
# integraseller-backend


### 1) Pré-requisitos
- Node 20+
- PostgreSQL 14+


### 2) Instalação
```bash
npm i
cp .env.example .env
# edite o .env com suas credenciais
```


### 3) Banco de dados
```bash
npm run prisma:generate
npm run prisma:migrate -- --name init
```


### 4) Rodar em desenvolvimento
```bash
npm run dev
```
A API sobe em `http://localhost:3000` (rota `/health`).


### 5) Fluxo OAuth (teste rápido)
1. Chame `GET /api/ml/connect-url` → receba `{ url }`.
2. Abra a URL no navegador, autorize a app do Mercado Livre.
3. O ML redireciona para `ML_REDIRECT_URI` com `?code=...`.
4. O backend troca o `code` por token, salva em `MLAccount` e retorna `{ accountId }`.


### 6) Testes de recursos
- `GET /api/ml/:accountId/me` → informações do usuário no ML.
- `GET /api/ml/:accountId/items` → lista IDs de anúncios.
- `POST /api/ml/webhooks` → endpoint público para notificações.


> Em produção, **use HTTPS** e registre `ML_REDIRECT_URI` idêntico ao cadastrado na aplicação do Mercado Livre.


### 7) Próximos passos
- Vincular autenticação do seu usuário real (remover upsert de admin@example.com).
- Implementar fila (BullMQ) para processar webhooks e sincronizações.
- Mapear itens (IDs) para detalhes (GET /items/:id) e popular tabela `Item`.
- Criar endpoints para atualizar preço/estoque.
- Criar módulo de Orders (listagem + detalhes + status).