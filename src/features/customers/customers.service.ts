import { prisma } from '../../config/prisma';
import type { CreateCustomerInput, ListCustomersQuery } from './customers.validation';

export function createCustomer(workspaceId: string, input: CreateCustomerInput) {
    return prisma.customer.create({
        data: {
            workspaceId,
            name: input.name,
            ...(input.email !== undefined ? { email: input.email } : {}),
            ...(input.phone !== undefined ? { phone: input.phone } : {}),
        },
    });
}

export async function listCustomers(workspaceId: string, q: ListCustomersQuery) {
    const where = {
        workspaceId,
        ...(q.search
            ? { name: { contains: q.search, mode: 'insensitive' as const } }
            : {}
        )
    };

    const [items, total] = await Promise.all([
        prisma.customer.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip: (q.page - 1) * q.limit,
            take: q.limit,
        }),
        prisma.customer.count({ where }),
    ]);

    return {
        items,
        meta: { page: q.page, limit: q.limit, total, totalPages: Math.ceil(total / q.limit) },
    };
}