import { Router } from 'express';
import { requireAuth } from '../../common/middleware/require-auth';
import { requireWorkspaceAccess } from '../../common/middleware/require-workspace-access';
import { validate } from '../../common/middleware/validate';
import * as controller from './customers.controller';
import { createCustomerSchema, listCustomersQuerySchema } from './customers.validation';

const router = Router({ mergeParams: true });

router.use(requireAuth);

router.post(
    '/',
    requireWorkspaceAccess(['OWNER', 'ADMIN']),
    validate(createCustomerSchema),
    controller.create
);

router.get(
    '/',
    requireWorkspaceAccess(),
    validate(listCustomersQuerySchema, 'query'),
    controller.list
);

export default router;