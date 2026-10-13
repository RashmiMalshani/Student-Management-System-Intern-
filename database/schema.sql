-- Optional: the app creates these tables automatically (spring.jpa.hibernate.ddl-auto=update).
-- Run this only if you prefer to create the schema manually.
CREATE DATABASE IF NOT EXISTS student_management;
USE student_management;

CREATE TABLE users (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL,
  created_at DATETIME NOT NULL
);

CREATE TABLE courses (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(20) NOT NULL UNIQUE,
  title VARCHAR(150) NOT NULL,
  description VARCHAR(1000),
  credits INT NOT NULL,
  capacity INT NOT NULL,
  lecturer_id BIGINT,
  created_at DATETIME NOT NULL,
  FOREIGN KEY (lecturer_id) REFERENCES users(id)
);

CREATE TABLE enrollments (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  student_id BIGINT NOT NULL,
  course_id BIGINT NOT NULL,
  enrolled_at DATETIME NOT NULL,
  UNIQUE KEY uq_student_course (student_id, course_id),
  FOREIGN KEY (student_id) REFERENCES users(id),
  FOREIGN KEY (course_id) REFERENCES courses(id)
);
