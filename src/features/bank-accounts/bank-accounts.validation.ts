import { z } from 'zod';

export const createBankAccountSchema = z.object({
    bankName: z.string().trim().min(1).max(100),
    accountNumber: z.string().trim().regex(/^\d{10}$/, 'Account number must be 10 digits'), // 10 digits (Nigerian NUBAN).
    accountName: z.string().trim().min(1).max(150),
    isDefault: z.boolean().optional(),
});

export const updateBankAccountSchema = createBankAccountSchema
    .partial()
    .refine((data) => Object.keys(data).length > 0, 'Provide at least one field');

export type CreateBankAccountInput = z.infer<typeof createBankAccountSchema>;
export type UpdateBankAccountInput = z.infer<typeof updateBankAccountSchema>;