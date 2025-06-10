-- Parent
CREATE TABLE Parent (
      id UUID PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL
);

INSERT INTO parent (id, name, email)
VALUES
  ('81705d11-3052-4d70-82f2-1c11e8077dbe', 'Nguyễn Văn Tèo', 'mndkhanh.alt@gmail.com'),
  ('00f7f4c0-4998-4593-b9c4-6b8d74596cd9', 'Nguyễn Văn Bê', 'mndkhanh.alt3@gmail.com'),
  ('3dfa7d35-7f0f-449f-afbf-bb6e420016d2', 'Hoàng Tấn Đạt', 'dathtse196321@gmail.com'),
  ('be258789-4fe3-421c-baed-53ef3ed87f3b', 'Phạm Thành Phúc', 'phamthanhqb2005@gmail.com')
  ;

-- grade
CREATE TABLE grade (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL
);

INSERT INTO grade (name) VALUES
('khối 1'),
('khối 2'),
('khối 3'),
('khối 4'),
('khối 5');


-- class
CREATE TABLE class (
    id SERIAL PRIMARY KEY,
    grade_id INT REFERENCES grade(id),
    name VARCHAR(50) NOT NULL
);

-- Giả sử grade.id từ 1 đến 5 tương ứng với "khối 1" đến "khối 5"
INSERT INTO class (grade_id, name) VALUES
(1, 'lớp 1A'),
(1, 'lớp 1B'),
(2, 'lớp 2A'),
(2, 'lớp 2B'),
(3, 'lớp 3A'),
(3, 'lớp 3B'),
(4, 'lớp 4A'),
(4, 'lớp 4B'),
(5, 'lớp 5A'),
(5, 'lớp 5B');


--Student
CREATE TYPE gender_enum AS ENUM ('Nam', 'Nữ');
CREATE TABLE Student (
      id UUID PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      age INT CHECK (age > 0),
      dob DATE,
      gender gender_enum not null,
      class_id INT REFERENCES class(id),
      mom_id UUID REFERENCES parent(id),
      dad_id UUID REFERENCES parent(id)
);

INSERT INTO student (id, name, email, age, dob, gender, class_id, mom_id, dad_id)
VALUES
  ('550934ca-e6ee-456f-b40c-d7fdc173342b', 'Con Phúc', 'toannangcao3000@gmail.com', 12, '2013-09-05', 'Nam', 1, 'be258789-4fe3-421c-baed-53ef3ed87f3b', null),
  ('fc57f7ed-950e-46fb-baa5-7914798e9ae3', 'Con Đạt', 'dinhviethieu2910@gmail.com', 10, '2013-05-10', 'Nữ', 2, null, '3dfa7d35-7f0f-449f-afbf-bb6e420016d2'),
  ('1519af26-f341-471b-8471-ab33a061b657', 'Con Tèo', 'thuandntse150361@fpt.edu.vn', 9, '2013-03-11', 'Nữ', 2, null, '81705d11-3052-4d70-82f2-1c11e8077dbe'),
  ('947d26b6-13ba-47af-9aff-cade2b670d05', 'Con  Bê', 'coccamco.fpthcm@gmail.com',11, '2013-05-22', 'Nữ', 2, '00f7f4c0-4998-4593-b9c4-6b8d74596cd9', '81705d11-3052-4d70-82f2-1c11e8077dbe')
  ;


--disease
CREATE TABLE disease (
      id SERIAL PRIMARY KEY,
	  disease_category TEXT,
      name TEXT NOT NULL,
	  description TEXT,
      vaccine_need BOOLEAN,
	  dose_quantity INT
);
select * from disease

INSERT INTO disease (disease_category, name, description, vaccine_need, dose_quantity) VALUES
-- Bệnh truyền nhiễm, cần vaccine
('bệnh truyền nhiễm', 'Sởi', 'Bệnh truyền nhiễm phổ biến ở trẻ em, có thể gây biến chứng nặng.', true, 2),
('bệnh truyền nhiễm', 'Rubella', 'Gây phát ban và sốt nhẹ, ảnh hưởng đến thai phụ.', true, 1),
('bệnh truyền nhiễm', 'Thủy đậu', 'Gây mụn nước toàn thân và lây lan mạnh.', true, 2),

-- Bệnh mãn tính, cần vaccine
('bệnh mãn tính', 'Viêm gan B', 'Bệnh về gan lây qua máu, có thể thành mãn tính.', true, 3),
('bệnh mãn tính', 'Bạch hầu', 'Nhiễm khuẩn nghiêm trọng ảnh hưởng đến hô hấp.', true, 2),

-- Không cần vaccine (bệnh nhẹ, không có vaccine)
(NULL, 'Cảm lạnh thông thường', 'Bệnh nhẹ thường gặp, không có vaccine phòng ngừa.', false, 0),
(NULL, 'Viêm họng cấp', 'Viêm họng do thay đổi thời tiết, không tiêm vaccine.', false, 0),
('bệnh mãn tính', 'Hen suyễn', 'Bệnh hô hấp mãn tính, kiểm soát bằng thuốc chứ không vaccine.', false, 0);


--vaccine
CREATE TABLE vaccine (
    id SERIAL PRIMARY KEY,
    disease_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    FOREIGN KEY (disease_id) REFERENCES disease(id)
);

INSERT INTO vaccine (disease_id, name, description) VALUES
(1, 'MVAX', 'Vaccine phòng bệnh Sởi - loại MVAX'),
(1, 'Priorix', 'Vaccine phòng bệnh Sởi - loại Priorix'),
(2, 'R-Vac', 'Vaccine phòng bệnh Rubella - loại R-Vac'),
(3, 'Varivax', 'Vaccine phòng bệnh Thủy đậu - loại Varivax'),
(3, 'Varilrix', 'Vaccine phòng bệnh Thủy đậu - loại Varilrix'),
(4, 'Engerix-B', 'Vaccine phòng bệnh Viêm gan B - loại Engerix-B'),
(4, 'Heplisav-B', 'Vaccine phòng bệnh Viêm gan B - loại Heplisav-B'),
(5, 'DTP', 'Vaccine phòng bệnh Bạch hầu - loại DTP'),
(5, 'Infanrix', 'Vaccine phòng bệnh Bạch hầu - loại Infanrix');

--vaccination_campaign
CREATE TABLE vaccination_campaign (
    id SERIAL PRIMARY KEY,
    vaccine_id INT NOT NULL,
    description TEXT,
    location VARCHAR(255),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('upcoming', 'ongoing', 'completed')),
    FOREIGN KEY (vaccine_id) REFERENCES vaccine(id)
);

INSERT INTO vaccination_campaign (vaccine_id, description, location, start_date, end_date, status) VALUES
(1, 'Tiêm phòng bệnh Sởi (MVAX)', 'School Medix', '2025-06-15', '2025-06-17', 'completed'),
(2, 'Tiêm phòng bệnh Sởi (Priorix)', 'School Medix', '2025-06-18', '2025-06-20', 'ongoing'),
(3, 'Tiêm phòng bệnh Rubella (R-Vac)', 'School Medix', '2025-06-22', '2025-06-24', 'upcoming'),
(4, 'Tiêm phòng bệnh Thủy đậu (Varivax)', 'School Medix', '2025-06-25', '2025-06-27', 'upcoming'),
(5, 'Tiêm phòng bệnh Thủy đậu (Varilrix)', 'School Medix', '2025-06-28', '2025-06-30', 'upcoming'),
(6, 'Tiêm phòng bệnh Viêm gan B (Engerix-B)', 'School Medix', '2025-07-01', '2025-07-03', 'upcoming'),
(7, 'Tiêm phòng bệnh Viêm gan B (Heplisav-B)', 'School Medix', '2025-07-04', '2025-07-06', 'upcoming'),
(8, 'Tiêm phòng bệnh Bạch hầu (DTP)', 'School Medix', '2025-07-07', '2025-07-09', 'upcoming'),
(9, 'Tiêm phòng bệnh Bạch hầu (Infanrix)', 'School Medix', '2025-07-10', '2025-07-12', 'upcoming');


--vaccination_campaign_register
CREATE TABLE vaccination_campaign_register (
    id SERIAL PRIMARY KEY,
    campaign_id INT NOT NULL,
    student_id UUID NOT NULL,
    reason TEXT,
    is_registered BOOLEAN NOT NULL DEFAULT false,
    submit_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    submit_by UUID NOT NULL, -- parent ID
    FOREIGN KEY (campaign_id) REFERENCES vaccination_campaign(id),
    FOREIGN KEY (student_id) REFERENCES student(id),
    FOREIGN KEY (submit_by) REFERENCES parent(id)
);

INSERT INTO vaccination_campaign_register (
  campaign_id,
  student_id,
  reason,
  is_registered,
  submit_time,
  submit_by
)
VALUES
-- Con Phúc: có mom_id
(1, '550934ca-e6ee-456f-b40c-d7fdc173342b', 'Đăng ký theo yêu cầu của nhà trường', true, '2025-06-10 08:00:00', 'be258789-4fe3-421c-baed-53ef3ed87f3b'),

-- Con Đạt: có dad_id
(1, 'fc57f7ed-950e-46fb-baa5-7914798e9ae3', 'Đăng ký theo yêu cầu của nhà trường', true, '2025-06-10 09:00:00', '3dfa7d35-7f0f-449f-afbf-bb6e420016d2'),

-- Con Tèo: có dad_id
(1, '1519af26-f341-471b-8471-ab33a061b657', 'Đăng ký theo yêu cầu của nhà trường', true, '2025-06-11 08:30:00', '81705d11-3052-4d70-82f2-1c11e8077dbe'),

-- Con Bê: có mom_id (ưu tiên) và cũng có dad_id
(1, '947d26b6-13ba-47af-9aff-cade2b670d05', 'Đăng ký theo yêu cầu của nhà trường', true, '2025-06-11 09:30:00', '00f7f4c0-4998-4593-b9c4-6b8d74596cd9');



--vacination_record
CREATE TABLE vaccination_record (
    id SERIAL PRIMARY KEY,
    student_id UUID NOT NULL,
    register_id INT, -- NULL nếu không đăng ký qua campaign
    description TEXT,
    location VARCHAR(255),
    vaccination_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('completed', 'missed', 'cancelled')),
    campaign_id INT, -- NULL nếu không thuộc campaign
    FOREIGN KEY (student_id) REFERENCES student(id),
    FOREIGN KEY (register_id) REFERENCES vaccination_campaign_register(id),
    FOREIGN KEY (campaign_id) REFERENCES vaccination_campaign(id)
);

INSERT INTO vaccination_record (
  student_id,
  campaign_id,
  vaccination_date,
  description,
  location,
  status
)
VALUES
  (
    '550934ca-e6ee-456f-b40c-d7fdc173342b', -- Con Phúc
    1,
    '2025-06-15',
    'Tiêm vaccine MVAX phòng bệnh Sởi',
    'School Medix',
    'completed'
  ),
  (
    'fc57f7ed-950e-46fb-baa5-7914798e9ae3', -- Con Đạt
    1,
    '2025-06-15',
    'Tiêm vaccine MVAX phòng bệnh Sởi',
    'School Medix',
    'completed'
  ),
  (
    '1519af26-f341-471b-8471-ab33a061b657', -- Con Tèo
    1,
    '2025-06-16',
    'Tiêm vaccine MVAX phòng bệnh Sởi',
    'School Medix',
    'completed'
  ),
  (
    '947d26b6-13ba-47af-9aff-cade2b670d05', -- Con Bê
    1,
    '2025-06-17',
    'Tiêm vaccine MVAX phòng bệnh Sởi',
    'School Medix',
    'completed'
  );


