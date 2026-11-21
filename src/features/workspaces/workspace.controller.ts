import { Request, Response } from "express";
import * as workspaceService from './workspaces.service';

export async function create(req: Request, res: Response) {
    const workspace = await workspaceService.createWorkspace(req.user!.id, req.body);
    res.status(201).json({ success: true, data: workspace });
}

export async function list(req: Request, res: Response) {
    const workspaces = await workspaceService.listWorkspaces(req.user!.id);
    res.json({ success: true, data: workspaces });
}