ALTER TABLE "Product" ADD COLUMN "imageUrl" TEXT;
CREATE TABLE "ProductImage" ("productId" TEXT NOT NULL PRIMARY KEY, "data" BLOB NOT NULL, "updatedAt" DATETIME NOT NULL, CONSTRAINT "ProductImage_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE);
