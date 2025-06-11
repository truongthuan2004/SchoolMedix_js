import express from 'express';
import { 
        cancelRegister,
        closeRegister,
        createCampaign ,
        getCheckupRegister,
        recordCheckUp,
        submitRegister,
        
 } 
 from '../controllers/checkUp.controller.js';

const router = express.Router();

router.post('/campaigns/create', createCampaign); // admin tạo campaigns
router.get('/checkup-registers/:id',getCheckupRegister);   //Parent nhận form Register
router.put('/:id/submit',submitRegister);// Parent nhập form Register
router.put('/:id/close',closeRegister);// Amdin đóng form Register
router.put('/:id/cancel',cancelRegister) //Admin cancel form Register
router.post('/record',recordCheckUp) // Doctor or Nurse record Heatlh Check Up for Student

                                        // Student xem dc Register

export default router;
