import { Request, Response } from 'express';
import { getParam } from '../../common/utils/params';
import * as service from './invoices.service';
import type { ListInvoicesQuery } from './invoices.validation';

export async function createInvoice(req: Request, res: Response) {
    const data = await service.createInvoice(getParam(req, 'workspaceId'), req.body);
    res.status(201).json({ success: true, data });
}

export async function list(req: Request, res: Response) {
    const query = res.locals.query as ListInvoicesQuery;
    const { items, meta } = await service.listInvoices(getParam(req, 'workspaceId'), query);
    res.json({ success: true, data: items, meta });
}

export async function get(req: Request, res: Response) {
    const data = await service.findInvoice(req.workspace!.id, getParam(req, 'invoiceId'));
    res.json({ success: true, data });
}

export async function update(req: Request, res: Response) {
    const data = await service.updateInvoice(req.workspace!.id, getParam(req, 'invoiceId'), req.body);
    res.json({ success: true, data });
}