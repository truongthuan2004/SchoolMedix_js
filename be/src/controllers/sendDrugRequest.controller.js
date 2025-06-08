import { query } from "../config/database.js";

export async function createRequest(req, res) {
      const {
            student_id,
            create_by,
            diagnosis,
            schedule_send_date,
            note,
            prescription_file_url,
            request_items
      } = req.body;

      if (!student_id || !create_by || !diagnosis || !schedule_send_date) {
            return res.status(400).json({ error: "Thiếu các thông tin cần thiết." });
      }

      if (!request_items || !Array.isArray(request_items) || request_items.length === 0) {
            return res.status(400).json({ error: "Thiếu các đơn vị thuốc cần cho học sinh uống." });
      }

      let result;

      try {
            // Step 1: insert SendDrugRequest
            result = await query(
                  `INSERT INTO SendDrugRequest 
                  (student_id, create_by, diagnosis, schedule_send_date, note, prescription_file_url, status)
                  VALUES ($1, $2, $3, $4, $5, $6, $7)
                  RETURNING *`,
                  [student_id, create_by, diagnosis, schedule_send_date, note, prescription_file_url, 'PROCESSING']
            );

            const sendDrugRequest = result.rows[0];
            const request_id = sendDrugRequest.id;

            // Step 2: insert RequestItems
            for (const item of request_items) {
                  await query(
                        `INSERT INTO RequestItem (request_id, name, intake_template_time, dosage_usage)
                        VALUES ($1, $2, $3, $4)`,
                        [request_id, item.name, item.intake_template_time, item.dosage_usage]
                  );
            }

            console.log("✅ Created SendDrugRequest and associated RequestItems");

            // Only respond after all DB inserts are successful
            return res.status(201).json(sendDrugRequest);

      } catch (err) {
            console.error("❌ Error creating send-drug-request or request items:", err);
            return res.status(500).json({ error: "Lỗi server khi tạo đơn thuốc." });
      }
}

export async function acceptRequest(req, res) {
      const { id } = req.params;
      if (!id) {
            return res.status(400).json({ error: "Thiếu ID đơn gửi." });
      }

      try {
            const result = await query(
                  "UPDATE SendDrugRequest SET status = 'ACCEPTED' WHERE id = $1 RETURNING *",
                  [id]
            );
            if (result.rows.length === 0) {
                  return res.status(404).json({ error: "Không tìm thấy đơn với ID này." });
            }

            return res.status(200).json({ message: "Đã đồng ý đơn.", data: result.rows[0] });
      } catch (err) {
            console.error("Gặp lỗi khi chấp nhận đơn thuốc.");
            return res.status(500).json({ error: "Gặp lỗi khi chấp nhận đơn thuốc." });
      }

}

export async function refuseRequest(req, res) {
      const { id } = req.params;
      if (!id) {
            return res.status(400).json({ error: "Thiếu ID đơn gửi." });
      }

      try {
            const result = await query(
                  "UPDATE SendDrugRequest SET status = 'REFUSED' WHERE id = $1 RETURNING *",
                  [id]
            );
            if (result.rows.length === 0) {
                  return res.status(404).json({ error: "Không tìm thấy đơn với ID này." });
            }

            return res.status(200).json({ message: "Đã từ chối đơn.", data: result.rows[0] });
      } catch (err) {
            console.error("Gặp lỗi khi từ chối đơn thuốc.");
            return res.status(500).json({ error: "Gặp lỗi khi từ chối đơn thuốc." });
      }

}

export async function cancelRequest(req, res) {
      const { id } = req.params;
      if (!id) {
            return res.status(400).json({ error: "Thiếu ID đơn gửi." });
      }

      try {
            const result = await query(
                  "UPDATE SendDrugRequest SET status = 'CANCELLED' WHERE id = $1 RETURNING *",
                  [id]
            );
            if (result.rows.length === 0) {
                  return res.status(404).json({ error: "Không tìm thấy đơn với ID này." });
            }

            return res.status(200).json({ message: "Đã hủy đơn.", data: result.rows[0] });
      } catch (err) {
            console.error("Gặp lỗi khi hủy đơn thuốc.");
            return res.status(500).json({ error: "Gặp lỗi khi hủy đơn thuốc." });
      }

}

export async function receiveDrug(req, res) {
      const { id } = req.params;
      if (!id) {
            return res.status(400).json({ error: "Thiếu ID đơn gửi." });
      }

      try {
            const today = new Date();
            const formatted = today.toISOString().split('T')[0]; // "2025-06-10"
            const result = await query(
                  "UPDATE SendDrugRequest SET status = 'RECEIVED' and receive_date = $2 WHERE id = $1 RETURNING *",
                  [id, formatted]
            );
            if (result.rows.length === 0) {
                  return res.status(404).json({ error: "Không tìm thấy đơn với ID này." });
            }

            return res.status(200).json({ message: "Đã nhận thuốc.", data: result.rows[0] });
      } catch (err) {
            console.error("Gặp lỗi khi cập nhật đơn thuốc: " + err);
            return res.status(500).json({ error: "Gặp lỗi khi cập nhật đơn thuốc." });
      }

}

export async function doneTakingMedicine(req, res) {
      const { id } = req.params;
      if (!id) {
            return res.status(400).json({ error: "Thiếu ID đơn gửi." });
      }

      try {
            const today = new Date();
            const formatted = today.toISOString().split('T')[0]; // "2025-06-10"
            const result = await query(
                  "UPDATE SendDrugRequest SET status = 'DONE' and intake_date = $2 WHERE id = $1 RETURNING *",
                  [id, formatted]
            );
            if (result.rows.length === 0) {
                  return res.status(404).json({ error: "Không tìm thấy đơn với ID này." });
            }

            return res.status(200).json({ message: "Đã cho học sinh uống thuốc.", data: result.rows[0] });
      } catch (err) {
            console.error("Gặp lỗi khi cập nhật đơn thuốc: " + err);
            return res.status(500).json({ error: "Gặp lỗi khi cập nhật đơn thuốc." });
      }

}

export async function retrieveRequestByID(req, res) {

}

export async function retrieveRequestByID(req, res) {

}


