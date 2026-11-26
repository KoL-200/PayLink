import { number, z } from 'zod';

const money = z.coerce
    .string()
    .trim()
    .regex(/^\d{1,16}(\.\d{1,2})?$/, 'Amount must be a number with at most 2 decimals')
    .refine((v) => Number(v) > 0, 'Amount must be greater than 0');

// Shared fields without default because
// if the update schema carried .default('NGN'), 
// a PATCH that only changed the title could silently reset currency 
// and paymentMethod. Keeping defaults on create only avoids that.

const fields = {
    customerId: z.string().min(1).optional(),
    title: z.string().trim().min(1).max(200).optional(),
    description: z.string().trim().max(2000).optional(),
    amount: money,
    currency: z.string().trim().toUpperCase().length(3),
    duedate: z.coerce.date().optional(),
    paymentMethod: z.enum(['PROVIDER', 'BANK_TRANSFER']),
    bankAccountId: z.string().min(1).optional(),
};

export const createInvoiceSchema = z.object({
    ...fields,
    currency: fields.currency.default('NGN'),
    paymentMethod: fields.paymentMethod.default('PROVIDER'),
});

export const updateInvoiceSchema = z
    .object(fields)
    .partial()
    .refine((d) => Object.keys(d).length > 0, 'Provide at least one field');

export const listInvoicesQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(100),
    status: z.enum(['DRAFT', 'SENT', 'PENDING', 'PAID', 'FAILED', 'EXPIRED', 'CANCELLED'])
        .optional(),
    customerId: z.string().min(1).optional(),
    search: z.string().trim().min(1).optional(),
});

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>;
export type ListInvoicesQuery = z.infer<typeof listInvoicesQuerySchema>;