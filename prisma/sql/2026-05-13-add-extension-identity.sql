-- Adds the extension-identity fields to ExtensionTrade.
-- Apply once against the production Postgres before (or as part of) the deploy
-- that ships the Chrome-extension profile gate (v2.5).
--
-- This project uses `prisma db push` rather than migration history, so this
-- file is a one-shot script — not part of the prisma/migrations chain.
--
-- Idempotent: safe to run multiple times.

ALTER TABLE "ExtensionTrade"
  ADD COLUMN IF NOT EXISTS "memberEmail" TEXT,
  ADD COLUMN IF NOT EXISTS "installId" TEXT;

CREATE INDEX IF NOT EXISTS "ExtensionTrade_installId_idx"
  ON "ExtensionTrade"("installId");
