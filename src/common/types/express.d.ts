import type { Role } from "../../src/generated/prisma/enums";

declare global {
    namespace Express {
        interface Request {
            user?: { id: string };
            workspace?: { id: string; role: Role }
        }
    }
}

export { };