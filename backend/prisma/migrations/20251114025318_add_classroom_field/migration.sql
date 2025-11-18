-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Schedule" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "dayOfWeek" INTEGER NOT NULL,
    "period" INTEGER NOT NULL,
    "subject" TEXT NOT NULL,
    "teacher" TEXT,
    "classroom" TEXT,
    "startTime" TEXT,
    "endTime" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Schedule" ("createdAt", "dayOfWeek", "endTime", "id", "period", "startTime", "subject", "teacher", "updatedAt") SELECT "createdAt", "dayOfWeek", "endTime", "id", "period", "startTime", "subject", "teacher", "updatedAt" FROM "Schedule";
DROP TABLE "Schedule";
ALTER TABLE "new_Schedule" RENAME TO "Schedule";
CREATE UNIQUE INDEX "Schedule_dayOfWeek_period_key" ON "Schedule"("dayOfWeek", "period");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
