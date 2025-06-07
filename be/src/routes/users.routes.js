import express from 'express';
import { createParent, createStudent, createAdmin, createNurse } from '../controllers/users.controller.js';

const router = express.Router();

router.post('/create/parent', createParent);
router.post('/create/student', createStudent);
router.post('/create/admin', createAdmin);
router.post('/create/nurse', createNurse);

export default router;
