import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../../config/env';
import { UnauthorizedError } from '../errors';

export interface AccessTokenPayload {
    sub: string;
}

export function signAccessToken(userId: string): string {
    return jwt.sign({ sub: userId }, env.JWT_ACCESS_SECRET, { expiresIn: 15 * 60 });
};

export function verifyAccessToken(token: string): AccessTokenPayload {
    try {
        const payload = jwt.verify(token, env.JWT_ACCESS_SECRET);
        if (typeof payload === 'string' || !payload.sub) {
            throw new Error('Bad Payload');
        }

        return { sub: payload.sub }
    } catch {
        throw new UnauthorizedError('Invalid or expired token');
    }
}

export const generateRefreshToken = (): string =>
    crypto.randomBytes(48).toString('hex');

export const hashToken = (token: string): string =>
    crypto.createHash('sha256').update(token).digest('hex')