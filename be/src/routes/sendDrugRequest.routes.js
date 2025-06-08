import express from 'express';
import {
      createRequest,
      acceptRequest,
      refuseRequest,
      cancelRequest,
      receiveDrug,
      doneTakingMedicine
}
      from '../controllers/sendDrugRequest.controller.js';

const router = express.Router();

router.post('/create', createRequest);
router.patch('/:id/accept', acceptRequest);
router.patch('/:id/refuse', refuseRequest);
router.patch('/:id/cancel', cancelRequest);
router.patch('/:id/receive', receiveDrug);
router.patch('/:id/done', doneTakingMedicine);

export default router;
