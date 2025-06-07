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
