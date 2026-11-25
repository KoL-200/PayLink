import { Request } from "express";
import { BadRequestError } from "../errors";

export function getParam(req: Request, name: string): string {
    const raw = req.params[name];
    const value = Array.isArray(raw) ? raw[0] : raw;
    if (!value) throw new BadRequestError(`Missing route parameter: ${name}`);
    return value;
}