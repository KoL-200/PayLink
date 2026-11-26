import { Router } from "express";
import { requireAuth } from "../../common/middleware/require-auth";
import { requireWorkspaceAccess } from "../../common/middleware/require-workspace-access";
import { validate } from "../../common/middleware/validate";
import * as controller from "./bank-accounts.controller";
import { createBankAccountSchema, updateBankAccountSchema } from "./bank-accounts.validation";

const router = Router({ mergeParams: true });
const manage = requireWorkspaceAccess(['OWNER', 'ADMIN']);

router.use(requireAuth);

router.get('/', requireWorkspaceAccess(), controller.list);
router.post('/', manage, validate(createBankAccountSchema), controller.create);
router.patch('/:bankId', manage, validate(updateBankAccountSchema), controller.update);
router.delete('/:bankId', manage, controller.remove);

export default router;