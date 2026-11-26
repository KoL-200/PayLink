import { Request, Response } from "express";
import * as customersService from './customers.service';
import type { ListCustomersQuery } from "./customers.validation";

export async function create(req: Request, res: Response) {
    const customer = await customersService.createCustomer(req.workspace!.id, req.body);
    res.status(201).json({ success: true, data: customer });
}

export async function list(req: Request, res: Response) {
    const query = res.locals.query as ListCustomersQuery;
    const { items, meta } = await customersService.listCustomers(req.workspace!.id, query);
    res.json({ success: true, data: items, meta });
}