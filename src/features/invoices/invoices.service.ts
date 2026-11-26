import type { Prisma } from '../../src/generated/prisma/client';
import { prisma } from '../../config/prisma';
import { BadRequestError, ConflictError, NotFoundError } from '../../common/errors';
import type {
    CreateInvoiceInput,
    UpdateInvoiceInput,
    ListInvoicesQuery,
} from './invoices.validation';

type PaymentMethod = CreateInvoiceInput['paymentMethod'];

const invoiceInclude = {
    customer: { select: { id: true, name: true, email: true } },
    bankAccount: {
        select: { id: true, bankName: true, accountNumber: true, accountName: true },
    },
} satisfies Prisma.InvoiceInclude;

const formatNumber = (n: number) => `INV-${String(n).padStart(4, '0')}`;

export async function findInvoice(workspaceId: string, invoiceId: string) {
    const invoice = await prisma.invoice.findFirst({
        where: { id: invoiceId, workspaceId, deletedAt: null },
        include: invoiceInclude,
    });
    if (!invoice) throw new NotFoundError('Invoice not found');
    return invoice;
}

async function assertCustomerInWorkspace(workspaceId: string, customerId: string) {
    const customer = await prisma.customer.findFirst({
        where: { id: customerId, workspaceId },
        select: { id: true },
    });
    if (!customer) throw new BadRequestError('Customer not found in this workspace');
}

async function resolveBankAccountId(
    workspaceId: string,
    method: PaymentMethod,
    bankAccountId?: string
): Promise<string | null> {
    if (method !== 'BANK_TRANSFER') return null;

    const account = await prisma.bankAccount.findFirst({
        where: bankAccountId
            ? { id: bankAccountId, workspaceId, deletedAt: null }
            : { workspaceId, isDefault: true, deletedAt: null },
        select: { id: true },
    });

    if (!account) {
        throw new BadRequestError(
            bankAccountId
                ? 'Bank account not found in this workspace'
                : 'Add a bank account first, or pass bankAccountId'
        );
    }
    return account.id;
}

export async function createInvoice(workspaceId: string, input: CreateInvoiceInput) {
    if (input.customerId) await assertCustomerInWorkspace(workspaceId, input.customerId);
    const bankAccountId = await resolveBankAccountId(
        workspaceId,
        input.paymentMethod,
        input.bankAccountId
    );

    return prisma.$transaction(async (tx) => {
        // The increment locks the workspace row, so two simultaneous creates
        // can never receive the same number.
        const { invoiceCounter } = await tx.workspace.update({
            where: { id: workspaceId },
            data: { invoiceCounter: { increment: 1 } },
            select: { invoiceCounter: true },
        });

        return tx.invoice.create({
            data: {
                ...(input.customerId !== undefined ? { customerId: input.customerId } : {}),
                ...(input.title !== undefined ? { title: input.title } : {}),
                ...(input.description !== undefined ? { description: input.description } : {}),
                amount: input.amount,
                currency: input.currency,
                ...(input.duedate !== undefined ? { duedate: input.duedate } : {}),
                paymentMethod: input.paymentMethod,
                workspaceId,
                bankAccountId,
                number: formatNumber(invoiceCounter),
            },
            include: invoiceInclude,
        });
    });
}

export async function listInvoices(workspaceId: string, q: ListInvoicesQuery) {
    const where: Prisma.InvoiceWhereInput = {
        workspaceId,
        deletedAt: null,
        ...(q.status ? { status: q.status } : {}),
        ...(q.customerId ? { customerId: q.customerId } : {}),
        ...(q.search
            ? {
                OR: [
                    { number: { contains: q.search, mode: 'insensitive' } },
                    { title: { contains: q.search, mode: 'insensitive' } },
                ],
            }
            : {}),
    };

    const [items, total] = await Promise.all([
        prisma.invoice.findMany({
            where,
            include: { customer: { select: { id: true, name: true } } },
            orderBy: { createdAt: 'desc' },
            skip: (q.page - 1) * q.limit,
            take: q.limit,
        }),
        prisma.invoice.count({ where }),
    ]);

    return {
        items,
        meta: { page: q.page, limit: q.limit, total, totalPages: Math.ceil(total / q.limit) },
    };
}

export async function updateInvoice(
    workspaceId: string,
    invoiceId: string,
    input: UpdateInvoiceInput
) {
    const invoice = await findInvoice(workspaceId, invoiceId);
    if (invoice.status !== 'DRAFT') {
        throw new ConflictError('Only draft invoices can be edited');
    }

    if (input.customerId) await assertCustomerInWorkspace(workspaceId, input.customerId);

    const method = input.paymentMethod ?? invoice.paymentMethod;
    const methodChanged = method !== invoice.paymentMethod;

    // undefined leave the stored value alone
    let bankAccountId: string | null | undefined;
    if (method === 'PROVIDER') {
        bankAccountId = null;
    } else if (input.bankAccountId || methodChanged) {
        bankAccountId = await resolveBankAccountId(workspaceId, method, input.bankAccountId);
    }

    return prisma.invoice.update({
        where: { id: invoiceId },
        data: {
            ...(input.customerId !== undefined ? { customerId: input.customerId } : {}),
            ...(input.title !== undefined ? { title: input.title } : {}),
            ...(input.description !== undefined ? { description: input.description } : {}),
            ...(input.amount !== undefined ? { amount: input.amount } : {}),
            ...(input.currency !== undefined ? { currency: input.currency } : {}),
            ...(input.duedate !== undefined ? { duedate: input.duedate } : {}),
            ...(input.paymentMethod !== undefined ? { paymentMethod: input.paymentMethod } : {}),
            ...(bankAccountId !== undefined ? { bankAccountId } : {}),
        },
        include: invoiceInclude,
    });
}