-- CreateTable
CREATE TABLE "Admin" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Announcement" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "summary" TEXT,
    "isImportant" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Album" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "coverImage" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Photo" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "albumId" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "thumbnailUrl" TEXT NOT NULL,
    "caption" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Photo_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "Album" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Member" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "position" TEXT,
    "avatar" TEXT,
    "bio" TEXT,
    "specialty" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Schedule" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "dayOfWeek" INTEGER NOT NULL,
    "period" INTEGER NOT NULL,
    "subject" TEXT NOT NULL,
    "teacher" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Homework" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" DATETIME NOT NULL,
    "subject" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "deadline" DATETIME,
    "attachments" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Honor" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "date" DATETIME NOT NULL,
    "imageUrl" TEXT,
    "category" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Message" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nickname" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "OperationLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "adminId" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "targetId" INTEGER,
    "details" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OperationLog_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ClassInfo" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "className" TEXT NOT NULL,
    "motto" TEXT,
    "description" TEXT,
    "classPhoto" TEXT,
    "emblem" TEXT,
    "studentCount" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_username_key" ON "Admin"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Schedule_dayOfWeek_period_key" ON "Schedule"("dayOfWeek", "period");
