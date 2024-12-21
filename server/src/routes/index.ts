import { Router } from "express";
import authRoutes from "./authRoute"
import roomRoutes from "./roomRoute"

const router = Router();
router.use('/auth',authRoutes);
router.use('/room',roomRoutes);

export default router;