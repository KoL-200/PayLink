import { prisma } from '../../config/prisma';
import type { CreateWorkspaceInput } from "./workspaces.validation";

export async function createWorkspace(userId: string, input: CreateWorkspaceInput) {
    // workspace and OWNER membership are written together in one atomic operation
    return prisma.workspace.create({
        data: {
            name: input.name,
            members: { 'create': { userId, role: 'OWNER' } },
        },
    });
}

export async function listWorkspaces(userId: string) {
    const memberships = await prisma.workspaceMember.findMany({
        where: { userId },
        include: { workspace: true },
        orderBy: { workspace: { createdAt: 'desc' } },
    });

    return memberships.map((m) => ({ ...m.workspace, role: m.role }));
}