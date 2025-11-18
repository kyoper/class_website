-- CreateTable
CREATE TABLE "ResourceCategory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Resource" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "categoryId" INTEGER NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER,
    "fileType" TEXT,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Resource_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ResourceCategory" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ResourceDownload" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "resourceId" INTEGER NOT NULL,
    "downloaderIp" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ResourceDownload_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ResourceCategory_name_key" ON "ResourceCategory"("name");
