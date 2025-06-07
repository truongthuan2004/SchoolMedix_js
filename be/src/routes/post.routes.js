// routes/post.routes.js
import express from 'express';
import { createPost } from '../controllers/post.controller.js';

const router = express.Router();

router.post('/posts', createPost);

export default router;