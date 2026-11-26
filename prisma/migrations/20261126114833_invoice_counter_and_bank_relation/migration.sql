-- AlterTable
ALTER TABLE "Workspace" ADD COLUMN     "invoiceCounter" INTEGER NOT NULL DEFAULT 0;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_bankAccountId_fkey" FOREIGN KEY ("bankAccountId") REFERENCES "BankAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;
