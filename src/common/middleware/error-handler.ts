import { ErrorRequestHandler, RequestHandler } from "express";
import { AppError, NotFoundError } from "../errors";
import { env } from '../../config/env';

export const notFoundHandler: RequestHandler = (req, _res, next) => {
    next(new NotFoundError(`Route ${req.method} ${req.originalUrl} not found`));
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, next) => {
    if (err instanceof AppError) {
        res.status(err.statusCode).json(
            {
                success: false,
                error: {
                    code: err.code,
                    message: err.message,
                    details: err.details
                },

            }
        );
        return;
    }

    console.error(err);
    res.status(500).json(
        {
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: env.NODE_ENV === 'production' ? 'internal server error' : String(err),
            },
        }
    );
};