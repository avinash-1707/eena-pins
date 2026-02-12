ALTER TABLE "Product"
ADD COLUMN "fullPrice" INTEGER NOT NULL DEFAULT 0;

UPDATE "Product"
SET "fullPrice" = "price"
WHERE "fullPrice" = 0;
