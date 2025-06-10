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
router.use("/", diseaseRoutes);


app.use('/api/post', postRoutes);
app.use('/api/users', userRoutes);
app.use('/api/send-drug-requests', sendDrugRequestRoutes);
app.use('/api/checkup', checkUpRoutes);


app.listen(PORT, () => {
      console.log(`🚀 Server is running at http://localhost:${PORT}`);
});

export default app;     

