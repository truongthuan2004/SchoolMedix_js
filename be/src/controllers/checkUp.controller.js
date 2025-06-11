import { query } from "../config/database.js";

//FC lấy ID student từ Parent
async function getStudentIdsByParentId(parentId) {
    const result_student = await query(
        `SELECT id FROM Student WHERE mom_id = $1 OR dad_id = $1`,
        [parentId]
    );
    return result_student.rows.map(student => student.id);
}
//FC check ID Parent có tồn tại hay không
async function checkParentIdExists(parentId) {
    const result = await query(
        'SELECT * FROM Parent WHERE id = $1',
        [parentId]
    );
    if (result.rowCount === 0) {
        return false;
    } else return true;

}
//FC check ID Campaign có tồn tại không

async function checkCampaignExists(campaignID) {
    const result = await query(
        'SELECT * FROM checkupcampaign  WHERE id = $1',
        [campaignID]
    );
    if (result.rowCount === 0) {
        return false;
    } else return true;

}



export async function createCampaign(req, res) {
    const {
        name,
        description,
        location,
        start_date,
        end_date,
        status,   //Default:PREPARING-->UPCOMING-->ONGOING -->DONE or CANCELLED
        specialist_exam_ids // Admin chon các Special  Exam List

    } = req.body;

    const register_ids = [];

    if (!name || !description || !location || !start_date || !end_date || !Array.isArray(specialist_exam_ids)) {
        return res.status(400).json({ error: true, message: "Thiếu các thông tin cần thiết." });
    }


    try {
        // STEPT 1: Tạo mới Campaign
        const result_campaign = await query(
            `INSERT INTO CheckupCampaign 
            (name, description, location, start_date, end_date, status) 
            VALUES ($1, $2, $3, $4, $5, $6) 
            RETURNING *`,
            [name, description, location, start_date, end_date, 'PREPARING']
        );

        const campaign = result_campaign.rows[0] //Lấy Record đầu tiên trong  ( Phải có RETURNING mới có Record)

        if (result_campaign.rowCount === 0) {
            return res.status(400).json({ error: true, message: "Create Campaign không thành công." });
        }

        //STEP 2: Tạo mới campagincontainsspeexam

        for (const exam_id of specialist_exam_ids) {
            const result_campagincontain = await query('INSERT INTO CampaignContainSpeExam (campaign_id,specialist_exam_id) VALUES ($1,$2) RETURNING *',
                [campaign.id, exam_id]);

            if (result_campagincontain.rowCount === 0) {
                return res.status(400).json({ error: true, message: "Create Campagincontainsspeexam không thành công." });
            }
        }



        //STEP 3: Tạo CheckUp Register
        //Lấy danh sách student
        const result_student = await query(`SELECT * FROM Student`);
        const students = result_student.rows;
        const checkup_register = [];
        //Tạo CheckUp Register  và cho từng Student 
        for (const student of students) {
            const result_checkup_register = await query(
                `INSERT INTO CheckupRegister (campaign_id, student_id, status)
                     VALUES ($1, $2, $3)  RETURNING*`,
                [campaign.id, student.id, 'PENDING']
            );

            if (result_checkup_register.rowCount === 0) {
                return res.status(400).json({ error: true, message: "Create CheckUp Register không thành công." });
            }

            checkup_register.push(result_checkup_register.rows[0]);

        }



        // STEP 4 Tạo specialistExamRecord theo từng CheckUp Register và Special List Exam

        for (const registerId of checkup_register) {

            for (const examId of specialist_exam_ids) {
                const result_update_speciallist = await query(
                    `INSERT INTO specialistExamRecord (register_id,spe_exam_id,status)
                        VALUES ($1, $2, $3)`,
                    [registerId.id, examId, 'CAN_ATTACH']
                );

                if (result_update_speciallist.rowCount === 0) {
                    return res.status(400).json({ error: true, message: "Create Special List Exam Record không thành công." });
                }

            }
        }



        // STEP 5: Tạo HealthRecord cho từng Register và Student

        for (const registerID of checkup_register) {
            const result_check_healthrecord = await query(
                `INSERT INTO HealthRecord (register_id) VALUES ($1)`,
                [registerID.id,]
            );
            if (result_check_healthrecord.rowCount === 0) {
                return res.status(400).json({ error: true, message: "Create Health Record không thành công." });
            }

        }

        return res.status(200).json({ error: false, message: 'Create Campaign Thành Công' });

    } catch (err) {
        console.error("❌ Error creating Campaign ", err);
        return res.status(500).json({ error: true, message: "Lỗi server khi tạo Check Up Campaign." });
    }

}


//Lấy tất cả các CheckUp Register có Status là PENDING của Student theo Parent ID
export async function getCheckupRegisterParent(req, res) {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ error: true, message: "Thiếu ID Parent." });
    }

    try {

        //Lấy tất cả Student có mon_id or dad_id là parent_id
        const result_student = await query(
            `SELECT * FROM Student WHERE mom_id = $1 OR dad_id = $2`,
            [id, id]
        );

        //Lấy student_id từ Prent
        const student_ids = [];
        for (const student of result_student.rows) {
            student_ids.push(student.id);
        }

        if (student_ids.length === 0) {
            return res.status(400).json({ error: true, message: "Không tìm thấy ID của Student." });
        }

        //Lấy các CheckUpRegister và speciallistexamrecord từ Student_id có status là PENDING

        const allRegisters = [];

        for (const student_id of student_ids) {
            const result_checkup_register = await query(
                ` SELECT 
        r.id AS register_id,
        r.campaign_id,
        r.student_id,
        r.submit_by,
        r.submit_time,
        r.reason,
        r.status,
        s.spe_exam_id,
        s.status
      FROM checkupregister r
      JOIN specialistexamrecord s ON s.register_id = r.id
      WHERE r.student_id = $1 AND r.status = $2
  `, [student_id, 'PENDING']
            );

            allRegisters.push(...result_checkup_register.rows);

        }

        if (allRegisters.length <= 0) {
            return res.status(200).json({ error: false, message: 'Không có CheckUp Register' })
        }

        // 3. Group by register_id
        const mapByRegister = {};
        for (const row of allRegisters) {
            const id = row.register_id;
            if (!mapByRegister[id]) {
                // Khởi tạo lần đầu
                mapByRegister[id] = {
                    register_id: row.register_id,
                    campaign_id: row.campaign_id,
                    student_id: row.student_id,
                    submit_by: row.submit_by,
                    submit_time: row.submit_time,
                    reason: row.reason,
                    status: row.status,
                    exams: []
                };
            }
            // Đẩy exam vào mảng
            mapByRegister[id].exams.push({
                spe_exam_id: row.spe_exam_id,
                status: row.status
            });
        }

        // Chuyển về array
        const mergedRegisters = Object.values(mapByRegister);

        // 4. Trả về
        return res.status(200).json({ error: false, data: mergedRegisters });




    } catch (err) {
        console.error("❌ Error creating Campaign ", err);
        return res.status(500).json({ error: true, message: "Lỗi server khi Parent nhận Register Form." });
    }
}

// Parent nhấn Submit Register truyền vào ID parent
export async function submitRegister(req, res) {

    const { id } = req.params;
    const { registerId, submit_time, reason, exams } = req.body;
    try {

        if (!id || !registerId || !reason) {

            return res.status(400).json({ error: true, message: "Không có nội dung." });
        }

        if (!Array.isArray(exams)) {
            return res.status(400).json({ error: true, message: "Không có exams." });
        }

        const result_submit = await query(`UPDATE checkupregister
         SET
           reason      = $1,
           status      = $2,
           submit_by   = $3,
           submit_time = $4
       WHERE id = $5`,
            [reason, 'SUBMITTED', id, submit_time, registerId]
        );


        if (result_submit.rowCount === 0) {
            return res.status(400).json({ error: true, message: "Submit Register không thành công." });
        }

        const result_update_speciallis = [];

        for (const ex of exams) {
            const { spe_exam_id, status } = ex;
            const result_update = await query(
                `UPDATE specialistexamrecord
            SET status = $1
            WHERE register_id = $2
            AND spe_exam_id  = $3`,
                [status, registerId, spe_exam_id]);

            result_update_speciallis.push(result_update.rows);
        }

        if (result_update_speciallis.rowCount === 0) {
            return res.status(400).json({ error: true, message: "Submit Register không thành công." });
        } else {
            return res.status(200).json({ error: false, message: 'Submit thành công' });
        }


    } catch (err) {
        console.error("❌ Error creating Campaign ", err);
        return res.status(500).json({ error: true, message: "Lỗi server khi Submit Register Form." });
    }

}

//Admin đóng form Register truyền vào ID Campaign
export async function closeRegister(req, res) {

    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ error: true, message: "Thiếu ID Campaign." });
    }

    try {


        const result_check = await query('SELECT * FROM CheckupCampaign WHERE id = $1',
            [id]
        );
        if (result_check.rowCount === 0) {
            return res.status(400).json({ error: true, message: "Không tìm thấy id Campaign ." });
        }

        // Step 1: Cập nhật trạng thái UPCOMING cho Campaign
        const result = await query(
            'UPDATE CheckupCampaign SET status = $1 WHERE id = $2',
            ['UPCOMING', id]
        );


        // Step 2: cập nhật trạng thái cho Register

        // 2.1 Lấy tất cả các Register từ campaign_id và Status = 'PENDING'

        const result_checkup_register = await query('SELECT * FROM checkupregister WHERE status = $1 AND campaign_id = $2'
            , ['PENDING', id]);
        const data = result_checkup_register.rows;

        if (data.length < 0) {
            return res.status(400).json({ error: true, message: "Không tìm thấy Register." });
        }

        // 2.2 Chuyển trạng thái Register sang CANCELLED
        const rs = [];

        for (const register_id of data) {
            const res = await query('UPDATE checkupregister SET status = $1 WHERE id = $2'
                , ['CANCELLED', register_id.id]);

            rs.push(res.rows[0]);
        }




        if (result.rowCount === 0 || rs.length < 0) {
            return res.status(400).json({ error: true, message: "Đóng form Register không thành công ." });
        } else return res.status(200).json({ error: false, message: 'Đóng form Register thành công' });


    } catch (err) {
        console.error("❌ Error creating Campaign ", err);
        return res.status(500).json({ error: true, message: "Lỗi khi đóng Register." });
    }

}

//Admin cancel Campaign chuyển status thành CANCELLED
export async function cancelRegister(req, res) {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ error: true, message: "Thiếu ID." });
    }

    try {

        const result_check = await query('SELECT * FROM CheckupCampaign WHERE id = $1',
            [id]
        );
        if (result_check.rowCount === 0) {
            return res.status(400).json({ error: true, message: "Không tìm thấy id Campaign ." });
        }

        //Cập nhật trạng thái Cancel cho CheckUpCampaign
        const result = await query(
            'UPDATE CheckupCampaign SET status = $1 WHERE id = $2',
            ['CANCELLED', id]
        );
        //Cập nhật trạng thái cho CheckUp Register
        const result_checkup_register = await query(
            'UPDATE checkupregister SET status = $1 WHERE campaign_id = $2',
            ['CANCELLED', id]
        );




        if (result.rowCount === 0 || result_checkup_register.rowCount === 0) {
            return res.status(400).json({ error: true, message: "CANCEL không thành công." });
        } else return res.status(200).json({ error: false, message: 'CANCEL thành công' });


    } catch (err) {
        console.error("❌ Error creating Campaign ", err);
        return res.status(500).json({ error: true, message: "Lỗi khi đóng Register." });
    }


}
// Nurse or Doctor Update Health cho Student theo Register ID
export async function updateHealthRecord(req, res) {
    const {
        register_id,
        height,
        weight,
        blood_pressure,
        left_eye,
        right_eye,
        ear,
        nose,
        throat,
        teeth,
        gums,
        skin_condition,
        heart,
        lungs,
        spine,
        posture,
        final_diagnosis

    } = req.body

    if (!height || !weight || !blood_pressure || !left_eye || !right_eye || !ear || !nose || !register_id) {
        return res.status(400).json({ error: true, message: "Các chỉ số cơ bản không thể trống." });
    }


    try {

        const result_check = await query('SELECT * FROM healthrecord WHERE register_id = $1', [register_id]);

        if (result_check.rowCount === 0) {
            return res.status(400).json({ error: true, message: "Không tìm thấy hoặc không Health Record" });
        }

        //Step 1: Update Health Record
        const result = await query(
            `UPDATE HealthRecord
     SET
        height = $1,
        weight = $2,
        blood_pressure = $3,
        left_eye = $4,
        right_eye = $5,
        ear = $6,
        nose = $7,
        throat = $8,
        teeth = $9,
        gums = $10,
        skin_condition = $11,
        heart = $12,
        lungs = $13,
        spine = $14,
        posture = $15,
        final_diagnosis = $16,
        status = $17
        WHERE register_id = $18`,
            [
                height,
                weight,
                blood_pressure,
                left_eye,
                right_eye,
                ear,
                nose,
                throat,
                teeth,
                gums,
                skin_condition,
                heart,
                lungs,
                spine,
                posture,
                final_diagnosis,
                'DONE',
                register_id
            ]
        );

        const result_checkup_register = await query('UPDATE checkupregister SET status= $1 WHERE id = $2'
            , ['DONE', register_id]);

        if (result.rowCount === 0 || result_checkup_register.rowCount === 0) {
            return res.status(400).json({ error: true, message: "Không tìm thấy hoặc không Update được Health record." });
        } else {

            return res.status(200).json({ error: false, message: "Update Health record thành công." });

        }



    } catch (err) {
        console.error("❌ Error creating Campaign ", err);
        return res.status(500).json({ error: true, message: "Lỗi khi tạo record." });
    }



}

//Student xem CheckUpRegister của mình cần truyền vào student_id
export async function getCheckupRegisterStudent(req, res) {

    const { id } = req.params;

    try {
        const result = await query('SELECT * FROM checkupregister WHERE student_id = $1', [id]);
        const data_ = result.rows;
        if (result.rowCount === 0) {
            return res.status(400).json({ error: true, message: "Không Campaign đang diễn ra" });
        } else {
            return res.status(200).json({ error: false, data: data_ })
        }


    } catch (err) {
        console.error("❌ Error creating Campaign ", err);
        return res.status(500).json({ error: true, message: "Lỗi khi tạo record." });
    }

}

//Parent xem HealthRecord của Student cần truyền vào parent_id và campaign_id
export async function getHealthRecordParent(req, res) {
    const { parent_id, campaign_id } = req.params;

    if (!parent_id) {
        return res.status(400).json({ error: true, message: "Không Nhận được ID Parent." });
    }

    if (!campaign_id) {
        return res.status(400).json({ error: true, message: "Không Nhận được ID Campaign." });
    }

    try {
        //Check ID Parent tồn tại không
        const result_check_parentID = await checkParentIdExists(parent_id);


        //Check ID Campaigm tồn tại không
        const result_check_campaignID = await checkCampaignExists(campaign_id);

        if (!result_check_parentID || !result_check_campaignID) {
            return res.status(400).json({ error: true, message: "Không tìm thấy ID của Parent or ID Campaign." });
        }

        //Lấy ID Student từ Parent ID
        const student_ids = await getStudentIdsByParentId(parent_id);

        if (student_ids.length === 0) {
            return res.status(400).json({ error: true, message: "Không tìm thấy ID của Student." });
        }

        // Get  Register ID  từ student_id và campaign_id


        const register_id = []

        for (const studentID of student_ids) {
            const result = await query('SELECT * FROM checkupregister WHERE student_id = $1 and campaign_id = $2'
                , [studentID, campaign_id]);
            if (result.rows.length > 0) {
                register_id.push(result.rows[0].id);
            }
        }




        if (register_id.length === 0) {
            return res.status(400).json({ error: true, message: "Không tìm thấy ID Register." });
        }


        const data = [];

        //Lấy Health Record từ register_id và có Status là DONE

        for (const id of register_id) {
            const result = await query('SELECT * FROM healthrecord WHERE register_id = $1 AND status = $2', [id, 'DONE']);
            if (result.rows.length > 0) {
                data.push(result.rows[0]);
            }
        }



        if (data.length === 0) {
            return res.status(200).json({ error: false, message: "Không tìm thấy Health Record của Student." });
        } else {
            return res.status(200).json({ error: false, data });
        }



    } catch (err) {
        console.error("❌ Error creating Campaign ", err);
        return res.status(500).json({ error: true, message: "Lỗi khi tạo  Health Record." });
    }

}

//Student xem HealthRecord của mình cần truyền vào student_id và camaign_id
export async function getHealthRecordStudent(req,res) {
    const { student_id, campaign_id } = req.params;

    try {

        //Lấy register_id từ student id
        const result = await query('SELECT * FROM checkupregister WHERE student_id = $1 and campaign_id = $2'
            , [student_id, campaign_id]);

        const rs = result.rows[0];


        if (rs.length === 0) {
            return res.status(400).json({ error: true, message: "Không tìm thấy Register." });
        }

        //Lấy Health Record từ Student
        const result_check_healthrecord = await query('SELECT * FROM healthrecord WHERE register_id = $1 AND status = $2'
            , [rs.id, 'DONE']);

        const data = result_check_healthrecord.rows;

        if (data.length === 0) {
            return res.status(200).json({ error: false, message: "Không tìm thấy Health Record của Student." });
        } else {
            return res.status(200).json({ error: false, data });
        }



    } catch (err) {
        console.error("❌ Error creating Campaign ", err);
        return res.status(500).json({ error: true, message: "Lỗi khi tạo  Health Record." });
    }
}


