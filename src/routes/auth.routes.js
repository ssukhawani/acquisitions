import { signin, signout, signup } from '#controllers/auth.controller.js';
import express from 'express';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', signin);
router.post('/logout', signout);

export default router;
