import { z } from 'zod';

export const createCustomerSchema = z.object({
    name: z.string().trim().min(1).max(150),
    email: z.string().trim().toLowerCase().email().optional(),
    phone: z.string().trim().min(5).max(30).optional(),
});

export const listCustomersQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().trim().min(1).optional(),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type ListCustomersQuery = z.infer<typeof listCustomersQuerySchema>;