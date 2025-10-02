-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MLAccount" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "mlUserId" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "tokenExpiresAt" TIMESTAMP(3) NOT NULL,
    "scope" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MLAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Item" (
    "id" TEXT NOT NULL,
    "mlAccountId" TEXT NOT NULL,
    "mlItemId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "sku" TEXT,
    "price" DECIMAL(18,2) NOT NULL,
    "stock" INTEGER,
    "status" TEXT NOT NULL,
    "rawPayload" JSONB NOT NULL,
    "lastSync" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "mlAccountId" TEXT NOT NULL,
    "mlOrderId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "totalAmount" DECIMAL(18,2) NOT NULL,
    "buyerInfo" JSONB,
    "rawPayload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebhookEvent" (
    "id" TEXT NOT NULL,
    "mlAccountId" TEXT,
    "topic" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "result" TEXT,

    CONSTRAINT "WebhookEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "MLAccount_mlUserId_key" ON "MLAccount"("mlUserId");

-- CreateIndex
CREATE UNIQUE INDEX "Item_mlItemId_key" ON "Item"("mlItemId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_mlOrderId_key" ON "Order"("mlOrderId");

-- AddForeignKey
ALTER TABLE "MLAccount" ADD CONSTRAINT "MLAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_mlAccountId_fkey" FOREIGN KEY ("mlAccountId") REFERENCES "MLAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_mlAccountId_fkey" FOREIGN KEY ("mlAccountId") REFERENCES "MLAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
