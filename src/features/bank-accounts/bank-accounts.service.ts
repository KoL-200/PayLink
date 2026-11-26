import { prisma } from '../../config/prisma';
import { NotFoundError, BadRequestError } from '../../common/errors';
import type { CreateBankAccountInput, UpdateBankAccountInput } from './bank-accounts.validation';

async function findActive(workspaceId: string, bankId: string) {
    const account = await prisma.bankAccount.findFirst({
        where: { id: bankId, workspaceId, deletedAt: null },
    });
    if (!account) throw new NotFoundError('Bank account not found');
    return account;
}

export function listBankAccounts(workspaceId: string) {
    return prisma.bankAccount.findMany({
        where: { workspaceId, deletedAt: null },
        orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }]
    });
}

export function createBankAccount(workspaceId: string, input: CreateBankAccountInput) {
    return prisma.$transaction(async (tx) => {
        const existing = await tx.bankAccount.count({
            where: { workspaceId, deletedAt: null },
        });

        // first account is always the default.
        const makeDefault = input.isDefault === true || existing === 0;

        if (makeDefault) {
            await tx.bankAccount.updateMany({
                where: { workspaceId, isDefault: true },
                data: { isDefault: false },
            });
        }

        return tx.bankAccount.create({
            data: {
                workspaceId,
                bankName: input.bankName,
                accountNumber: input.accountNumber,
                accountName: input.accountName,
                isDefault: makeDefault,
            },
        });
    });
}

export async function updateBankAccount(workspaceId: string, bankId: string, input: UpdateBankAccountInput) {
    const account = await findActive(workspaceId, bankId);

    if (input.isDefault === false) {
        throw new BadRequestError('Set another bank account as default instead');
    };

    return prisma.$transaction(async (tx) => {
        if (input.isDefault === true) {
            await tx.bankAccount.updateMany({
                where: { workspaceId, isDefault: true, id: { not: bankId } },
                data: { isDefault: false },
            });
        }
        return tx.bankAccount.update({
            where: { id: bankId },
            data: {
                ...(input.bankName !== undefined && { bankName: input.bankName }),
                ...(input.accountNumber !== undefined && { accountNumber: input.accountNumber }),
                ...(input.accountName !== undefined && { accountName: input.accountName }),
                ...(input.isDefault !== undefined && { isDefault: input.isDefault }),
            },
        });
    });
}

export async function deleteBankAccount(workspaceId: string, bankId: string) {
    const account = await findActive(workspaceId, bankId);

    await prisma.$transaction(async (tx) => {
        await tx.bankAccount.update({
            where: { id: bankId },
            data: {
                deletedAt: new Date(),
                isDefault: false
            }
        });

        // if we deleted the default, promote the newest remaining account.
        if (account.isDefault) {
            const next = await tx.bankAccount.findFirst({
                where: { workspaceId, deletedAt: null },
                orderBy: { createdAt: 'desc' },
            });

            if (next) {
                await tx.bankAccount.update({
                    where: { id: next.id },
                    data: {
                        isDefault: true
                    },
                });
            }
        }
    });
}