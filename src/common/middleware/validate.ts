import { Request, Response, NextFunction } from 'express';
import { ZodTypeAny } from 'zod';
import { BadRequestError } from '../errors';

type Source = 'body' | 'query' | 'params';

export const validate =
    (schema: ZodTypeAny, source: Source = 'body') =>
        (req: Request, _res: Response, next: NextFunction) => {
            const result = schema.safeParse(req[source]);

            if (!result.success) {
                return next(
                    new BadRequestError('Validation failed', result.error.flatten().fieldErrors)
                );
            }

            if (source === 'body') req.body = result.data;
            next();
        };