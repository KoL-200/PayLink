import { Router } from "express";
import { requireAuth } from "../../common/middleware/require-auth";
import { validate } from '../../common/middleware/validate';
import * as controller from './workspace.controller';
import { createWorkspaceSchema } from "./workspaces.validation";

const router = Router();

router.post('/', requireAuth, validate(createWorkspaceSchema), controller.create);
router.get('/', requireAuth, controller.list);

export default router;