import { RequestHandler } from "express";
import { UnauthorizedError } from "../errors";
import { verifyAccessToken } from "../utils/tokens";

export const requireAuth: RequestHandler = (req, _res, next) => {
    const header = req.headers.authorization;

    if (!header?.startsWith('Bearer')) {
        throw new UnauthorizedError('Missing bearer token');
    }

    const { sub } = verifyAccessToken(header.slice(7));
    req.user = { id: sub };
    next();
};