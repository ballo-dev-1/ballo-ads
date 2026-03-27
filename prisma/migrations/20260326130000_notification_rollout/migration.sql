-- Backoffice notifications full rollout metadata fields
ALTER TABLE "Notification"
  ADD COLUMN "category" TEXT NOT NULL DEFAULT 'operations',
  ADD COLUMN "severity" TEXT NOT NULL DEFAULT 'info',
  ADD COLUMN "entityType" TEXT,
  ADD COLUMN "entityId" TEXT,
  ADD COLUMN "dedupeKey" TEXT,
  ADD COLUMN "cooldownSeconds" INTEGER,
  ADD COLUMN "targetRoles" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "metadata" JSONB,
  ADD COLUMN "source" TEXT;

CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");
CREATE INDEX "Notification_read_createdAt_idx" ON "Notification"("read", "createdAt");
CREATE INDEX "Notification_type_createdAt_idx" ON "Notification"("type", "createdAt");
CREATE INDEX "Notification_severity_createdAt_idx" ON "Notification"("severity", "createdAt");
CREATE INDEX "Notification_dedupeKey_idx" ON "Notification"("dedupeKey");
