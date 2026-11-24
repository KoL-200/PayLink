import { RequestHandler } from "express";
import type { Role } from "../../src/generated/prisma/client";
import { prisma } from '../../config/prisma';
import { NotFoundError, ForbiddenError } from "../errors";
import { getParam } from "../utils/params";

export const requireWorkspaceAccess =
    (allowedRoles: Role[] = []): RequestHandler =>
        async (req, _res, next) => {
            const workspaceId = getParam(req, 'id');

            const membership = await prisma.workspaceMember.findUnique({
                where: { workspaceId_userId: { workspaceId, userId: req.user!.id } }
            });

            // Do not reveal that a workspace exists to non-members. 404 not 403
            if (!membership) throw new NotFoundError('Workspace not found');

            if (allowedRoles.length > 0 && !allowedRoles.includes(membership.role)) {
                throw new ForbiddenError('Insufficient permissions');
            }

            req.workspace = { id: workspaceId, role: membership.role };
            next();
        }