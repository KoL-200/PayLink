import { Router } from 'express';
import { requireAuth } from '../../common/middleware/require-auth';
import * as controller from './invoices.controller';
import { validate } from '../../common/middleware/validate';
import { requireWorkspaceAccess } from '../../common/middleware/require-workspace-access';
import { createInvoiceSchema, updateInvoiceSchema, listInvoicesQuerySchema } from './invoices.validation';

const router = Router({ mergeParams: true });
const manage = requireWorkspaceAccess(['OWNER', 'ADMIN'])

router.use(requireAuth);

router.post('/', manage, validate(createInvoiceSchema), controller.createInvoice);
router.get('/', requireWorkspaceAccess(), validate(listInvoicesQuerySchema, 'query'), controller.list);
router.get('/:invoiceId', requireWorkspaceAccess(), controller.get);
router.patch('/:invoiceId', manage, validate(updateInvoiceSchema), controller.update);

export default router;
