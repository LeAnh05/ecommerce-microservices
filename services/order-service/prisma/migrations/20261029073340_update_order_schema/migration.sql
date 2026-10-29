/*
  Warnings:

  - You are about to alter the column `total` on the `Order` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(12,2)`.
  - You are about to alter the column `discount` on the `Order` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(12,2)`.
  - You are about to alter the column `finalTotal` on the `Order` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(12,2)`.
  - The primary key for the `OrderDetail` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `odid` on the `OrderDetail` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `OrderDetail` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `OrderDetail` table. All the data in the column will be lost.
  - Added the required column `qty` to the `OrderDetail` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unit_price` to the `OrderDetail` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "total" SET DATA TYPE DECIMAL(12,2),
ALTER COLUMN "discount" SET DATA TYPE DECIMAL(12,2),
ALTER COLUMN "finalTotal" SET DATA TYPE DECIMAL(12,2);

-- AlterTable
ALTER TABLE "OrderDetail" DROP CONSTRAINT "OrderDetail_pkey",
DROP COLUMN "odid",
DROP COLUMN "price",
DROP COLUMN "quantity",
ADD COLUMN     "qty" INTEGER NOT NULL,
ADD COLUMN     "unit_price" DECIMAL(12,2) NOT NULL,
ADD CONSTRAINT "OrderDetail_pkey" PRIMARY KEY ("oid", "pid");
