import { Router } from "express";

// main router
const router = Router();
import authRouter from './auth';

router.use('/auth', authRouter);

export default router;