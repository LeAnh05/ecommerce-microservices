-- CreateTable
CREATE TABLE "Order" (
    "oid" SERIAL NOT NULL,
    "uid" INTEGER NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "finalTotal" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("oid")
);

-- CreateTable
CREATE TABLE "OrderDetail" (
    "odid" SERIAL NOT NULL,
    "oid" INTEGER NOT NULL,
    "pid" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "OrderDetail_pkey" PRIMARY KEY ("odid")
);

-- AddForeignKey
ALTER TABLE "OrderDetail" ADD CONSTRAINT "OrderDetail_oid_fkey" FOREIGN KEY ("oid") REFERENCES "Order"("oid") ON DELETE RESTRICT ON UPDATE CASCADE;
