ALTER TABLE "Order" ADD COLUMN "checkoutKey" TEXT;
CREATE UNIQUE INDEX "Order_checkoutKey_key" ON "Order"("checkoutKey");
CREATE TABLE "StockAllocation" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "orderId" TEXT NOT NULL,
  "variantId" TEXT NOT NULL,
  "quantity" INTEGER NOT NULL,
  CONSTRAINT "StockAllocation_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "StockAllocation_orderId_variantId_key" ON "StockAllocation"("orderId", "variantId");
