-- CreateTable
CREATE TABLE "OutboxEvent" (
    "id" SERIAL NOT NULL,
    "eventType" TEXT NOT NULL,
    "aggregateId" INTEGER NOT NULL,
    "payload" JSONB NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedAt" TIMESTAMP(3),

    CONSTRAINT "OutboxEvent_pkey" PRIMARY KEY ("id")
);
