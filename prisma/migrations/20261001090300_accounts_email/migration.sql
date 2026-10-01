ALTER TABLE "User" ADD COLUMN "sessionVersion" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN "emailVerifiedAt" DATETIME;
ALTER TABLE "User" ADD COLUMN "savedCart" TEXT NOT NULL DEFAULT '[]';
CREATE TABLE "AccountToken" ("hash" TEXT NOT NULL PRIMARY KEY, "userId" TEXT NOT NULL, "purpose" TEXT NOT NULL, "expiresAt" DATETIME NOT NULL, CONSTRAINT "AccountToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE);
CREATE INDEX "AccountToken_userId_purpose_idx" ON "AccountToken"("userId", "purpose");
CREATE TABLE "RateLimit" ("key" TEXT NOT NULL PRIMARY KEY, "count" INTEGER NOT NULL DEFAULT 1, "expiresAt" DATETIME NOT NULL);
CREATE TABLE "EmailMessage" ("id" TEXT NOT NULL PRIMARY KEY, "to" TEXT NOT NULL, "subject" TEXT NOT NULL, "text" TEXT NOT NULL, "status" TEXT NOT NULL DEFAULT 'PENDING', "attempts" INTEGER NOT NULL DEFAULT 0, "lastError" TEXT, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "sentAt" DATETIME, "lockedUntil" DATETIME, "dedupeKey" TEXT NOT NULL);
CREATE UNIQUE INDEX "EmailMessage_dedupeKey_key" ON "EmailMessage"("dedupeKey");
CREATE INDEX "EmailMessage_status_createdAt_idx" ON "EmailMessage"("status", "createdAt");
