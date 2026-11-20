import { prisma } from "../../config/prisma";
import { env } from "../../config/env";
import { ConflictError, UnauthorizedError } from '../../common/errors';
import { hashPassword, verifyPassword } from '../../common/utils/password';
import {
    signAccessToken,
    generateRefreshToken,
    hashToken,
} from '../../common/utils/tokens';
import type { RegisterInput, LoginInput } from './auth.validation';

const DAY_MS = 24 * 60 * 60 * 1000;

const toPublicUser = (user: {
    id: string,
    email: string,
    name: string | null,
    createdAt: Date,
}) => ({ id: user.id, email: user.email, name: user.name, createdAt: user.createdAt });

async function issueTokens(userId: string) {
    const refreshToken = generateRefreshToken();
    await prisma.refreshToken.create({
        data: {
            userId,
            tokenHash: hashToken(refreshToken),
            expiresAt: new Date(Date.now() + env.REFRESH_TOKEN_TTL_DAYS * DAY_MS),
        },
    });
    return { accessToken: signAccessToken(userId), refreshToken };
}

export async function register(input: RegisterInput) {
    const exiting = await prisma.user.findUnique({ where: { email: input.email } });
    if (exiting) throw new ConflictError('Email already registered');

    const user = await prisma.user.create({
        data: {
            email: input.email,
            password: await hashPassword(input.password),
            name: input.name || null,
        },
    });

    return { user: toPublicUser(user), ...(await issueTokens(user.id)) };
}

export async function login(input: LoginInput) {
    const user = await prisma.user.findUnique({ where: { email: input.email } });
    const valid = user ? await verifyPassword(input.password, user.password) : false;
    if (!user || !valid) throw new UnauthorizedError('Invalid email or password');

    return { user: toPublicUser(user), ...(await issueTokens(user.id)) };
}

export async function refreshToken(token: string) {
    const record = await prisma.refreshToken.findUnique({
        where: {
            tokenHash: hashToken(token),
        }
    });

    if (!record) throw new UnauthorizedError('Invalid refresh token');

    // kill active session for this user
    if (record.revokedAt) {
        await prisma.refreshToken.updateMany({
            where: { userId: record.userId, revokedAt: null },
            data: { revokedAt: new Date() }
        });
        throw new UnauthorizedError('Refresh token reuse detected');
    }

    if (record.expiresAt < new Date()) throw new UnauthorizedError('Refresh token expired');

    // Atomic rotate: only one concurrent request can win this update.
    const { count } = await prisma.refreshToken.updateMany({
        where: { id: record.id, revoked: null },
        data: { revokedAt: new Date() }
    });

    if (count === 0) throw new UnauthorizedError('Invalid refresh token');

    return issueTokens(record.userId);
}

export async function logout(token: string) {
    await prisma.refreshToken.updateMany({
        where: { tokenHash: hashToken(token), revokedAt: null },
        data: { revokedAt: new Date() }
    })
}