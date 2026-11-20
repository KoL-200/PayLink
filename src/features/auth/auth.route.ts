import { Router } from "express";
import { validate } from '../../common/middleware/validate';
import * as controller from './auth.controller';
import { registerSchema, loginSchema, refreshSchema } from "./auth.validation";

const router = Router();

router.post('/register', validate(registerSchema), controller.register);
router.post('/login', validate(loginSchema), controller.login);
router.post('/refresh', validate(refreshSchema), controller.refresh);
router.post('/logout', validate(refreshSchema), controller.logout);

export default router;