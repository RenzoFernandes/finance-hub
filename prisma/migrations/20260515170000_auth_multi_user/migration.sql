-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('income', 'expense');

-- CreateEnum
CREATE TYPE "GoalStatus" AS ENUM ('active', 'completed', 'overdue');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Goal" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "targetAmount" DOUBLE PRECISION NOT NULL,
    "currentAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "deadline" TIMESTAMP(3) NOT NULL,
    "status" "GoalStatus" NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Goal_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "Category_userId_name_type_key" ON "Category"("userId", "name", "type");

-- Preserve existing local transactions under the demo account.
INSERT INTO "User" ("id", "name", "email", "passwordHash")
VALUES ('demo_seed_user', 'Usuário Demo', 'demo@financehub.com', 'seed:pending')
ON CONFLICT ("email") DO NOTHING;

INSERT INTO "Category" ("id", "name", "color", "type", "userId")
VALUES
  ('demo_cat_salario', 'Salário', '#22c55e', 'income', 'demo_seed_user'),
  ('demo_cat_freelance', 'Freelance', '#14b8a6', 'income', 'demo_seed_user'),
  ('demo_cat_investimentos', 'Investimentos', '#3b82f6', 'income', 'demo_seed_user'),
  ('demo_cat_moradia', 'Moradia', '#ef4444', 'expense', 'demo_seed_user'),
  ('demo_cat_alimentacao', 'Alimentação', '#f97316', 'expense', 'demo_seed_user'),
  ('demo_cat_transporte', 'Transporte', '#eab308', 'expense', 'demo_seed_user'),
  ('demo_cat_saude', 'Saúde', '#ec4899', 'expense', 'demo_seed_user'),
  ('demo_cat_lazer', 'Lazer', '#8b5cf6', 'expense', 'demo_seed_user')
ON CONFLICT DO NOTHING;

INSERT INTO "Category" ("id", "name", "color", "type", "userId")
SELECT
  CONCAT('legacy_', MD5(COALESCE("category", 'Sem categoria') || COALESCE("type", 'expense'))),
  COALESCE(NULLIF("category", ''), 'Sem categoria'),
  CASE WHEN "type" = 'income' THEN '#22c55e' ELSE '#ef4444' END,
  CASE WHEN "type" = 'income' THEN 'income'::"TransactionType" ELSE 'expense'::"TransactionType" END,
  'demo_seed_user'
FROM "Transaction"
GROUP BY "category", "type"
ON CONFLICT DO NOTHING;

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN "date" TIMESTAMP(3);
ALTER TABLE "Transaction" ADD COLUMN "updatedAt" TIMESTAMP(3);
ALTER TABLE "Transaction" ADD COLUMN "userId" TEXT;
ALTER TABLE "Transaction" ADD COLUMN "categoryId" TEXT;

UPDATE "Transaction"
SET
  "date" = COALESCE("createdAt", CURRENT_TIMESTAMP),
  "updatedAt" = CURRENT_TIMESTAMP,
  "userId" = 'demo_seed_user',
  "categoryId" = (
    SELECT "Category"."id"
    FROM "Category"
    WHERE
      "Category"."userId" = 'demo_seed_user'
      AND "Category"."name" = COALESCE(NULLIF("Transaction"."category", ''), 'Sem categoria')
      AND "Category"."type" = CASE
        WHEN "Transaction"."type" = 'income' THEN 'income'::"TransactionType"
        ELSE 'expense'::"TransactionType"
      END
    LIMIT 1
  );

ALTER TABLE "Transaction" ALTER COLUMN "date" SET NOT NULL;
ALTER TABLE "Transaction" ALTER COLUMN "date" SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Transaction" ALTER COLUMN "updatedAt" SET NOT NULL;
ALTER TABLE "Transaction" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "Transaction" ALTER COLUMN "categoryId" SET NOT NULL;

ALTER TABLE "Transaction"
  ALTER COLUMN "type" TYPE "TransactionType"
  USING CASE WHEN "type" = 'income' THEN 'income'::"TransactionType" ELSE 'expense'::"TransactionType" END;

ALTER TABLE "Transaction" DROP COLUMN "category";

-- CreateIndex
CREATE UNIQUE INDEX "Session_tokenHash_key" ON "Session"("tokenHash");
CREATE INDEX "Session_userId_idx" ON "Session"("userId");
CREATE INDEX "Category_userId_idx" ON "Category"("userId");
CREATE INDEX "Goal_userId_deadline_idx" ON "Goal"("userId", "deadline");
CREATE INDEX "Transaction_userId_date_idx" ON "Transaction"("userId", "date");
CREATE INDEX "Transaction_categoryId_idx" ON "Transaction"("categoryId");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Category" ADD CONSTRAINT "Category_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Goal" ADD CONSTRAINT "Goal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
