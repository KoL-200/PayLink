import { Request, Response } from "express";
import { getParam } from "../../common/utils/params";
import * as service from './bank-accounts.service';

export async function list(req: Request, res: Response) {
    const data = await service.listBankAccounts(req.workspace!.id);
    res.json({ success: true, data });
}

export async function create(req: Request, res: Response) {
    const data = await service.createBankAccount(req.workspace!.id, req.body);
    res.status(201).json({ success: true, data });
}

export async function update(req: Request, res: Response) {
    const data = await service.updateBankAccount(req.workspace!.id, getParam(req, 'bankId'), req.body);
    res.json({ success: true, data });
}

export async function remove(req: Request, res: Response) {
    await service.deleteBankAccount(req.workspace!.id, getParam(req, 'bankId'));
    res.status(204).send();
}