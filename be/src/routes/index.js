// index.js

import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import postRoutes from './post.routes.js';
import userRoutes from './users.routes.js'
import sendDrugRequestRoutes from './sendDrugRequest.routes.js';
import checkUpRoutes from './checkUp.routes.js';



const router = express.Router();

router.use("/", postRoutes);
router.use("/", userRoutes);
//router.use("/", diseaseRoutes);


router.use('/post', postRoutes);
router.use('/users', userRoutes);
router.use('/send-drug-requests', sendDrugRequestRoutes);
router.use('/checkup', checkUpRoutes);




export default router;     

