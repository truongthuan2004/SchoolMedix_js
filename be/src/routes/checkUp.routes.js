import express from 'express';
import { 
        cancelRegister,
        closeRegister,
        createCampaign ,
        getCheckupRegisterParent,
        updateHealthRecord,
        submitRegister,
        getCheckupRegisterStudent,
        getHealthRecordParent,
        getHealthRecordStudent,
        
 } 
 from '../controllers/checkUp.controller.js';

const router = express.Router();

router.post('/campaigns/create', createCampaign); // admin tạo campaigns
router.get('/checkup-registers-parent/:id',getCheckupRegisterParent);   //Parent nhận form Register
router.put('/submit/:id',submitRegister);// Parent nhập form Register
router.put('/close/:id',closeRegister);// Amdin đóng form Register
router.put('/cancel/:id',cancelRegister) //Admin cancel form Register
router.put('/record',updateHealthRecord) // Doctor or Nurse update Heatlh Record for Student
router.get('/checkup-registers-student/:id',getCheckupRegisterStudent);  // Student xem dc Register
router.get('/health-record-parent/:parent_id/:campaign_id',getHealthRecordParent);//Parent view  Health Record của Student
router.get('/health-record-student/:student_id/:campaign_id',getHealthRecordStudent);//Student view Health Record
export default router;
