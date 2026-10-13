# Student Management System

Role-based Student Management System.

| Layer    | Tech                                   |
|----------|----------------------------------------|
| Frontend | Next.js 14 (App Router), Tailwind, Axios |
| Backend  | Spring Boot 3 (Java 17), Spring Security + JWT |
| Database | MySQL 8                                |

## Roles and permissions

| Action                                   | Admin | Lecturer         | Student |
|------------------------------------------|:-----:|:----------------:|:-------:|
| View courses                             | yes   | yes              | yes     |
| Add a course                             | yes   | yes (own)        | no      |
| Update a course                          | yes (any) | yes (own only) | no    |
| Delete a course                          | yes   | no               | no      |
| Enroll in / drop a course                | yes (any student) | no | yes (self) |
| See enrolled students                    | all   | own courses      | no      |
| Manage users (create, edit role, delete) | yes   | no               | no      |

Public registration creates STUDENT or LECTURER accounts only. Admin accounts are created by an admin (or the seeded one).

## Backend: layered architecture

```
com.sms
 ├─ controller   REST endpoints + @PreAuthorize role checks
 ├─ service      service interfaces (AuthService, UserService, CourseService, EnrollmentService)
 │   └─ impl     implementations (…ServiceImpl) with the business rules (capacity, ownership, duplicates)
 ├─ repository   Spring Data JPA
 ├─ entity       User, Course, Enrollment, Role
 ├─ dto          request / response records (validation here)
 ├─ security     JwtService, JwtAuthFilter
 ├─ config       SecurityConfig (CORS, stateless JWT), DataSeeder
 └─ exception    custom exceptions + GlobalExceptionHandler
```

## Run it

### 1. MySQL
Install MySQL and make sure it is running. The database `student_management` is created automatically.
Default connection is user `root`, password `root`. Change it in `backend/src/main/resources/application.properties`
or with environment variables: `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`.
(`database/schema.sql` is only needed if you want to create tables manually.)

### 2. Backend (needs Java 17+ and Maven)
```
cd backend
mvn spring-boot:run
```
API runs on http://localhost:8080/api

### 3. Frontend (needs Node 18+)
```
cd frontend
npm install
npm run dev
```
Open http://localhost:3000

## Demo accounts (created on first start)

| Role     | Email             | Password     |
|----------|-------------------|--------------|
| Admin    | admin@sms.com     | Admin@123    |
| Lecturer | lecturer@sms.com  | Lecturer@123 |
| Student  | student@sms.com   | Student@123  |

## API summary

| Method | Endpoint                   | Who                    |
|--------|----------------------------|------------------------|
| POST   | /api/auth/register         | public                 |
| POST   | /api/auth/login            | public                 |
| GET    | /api/auth/me               | any logged-in user     |
| GET    | /api/courses, /{id}        | any logged-in user     |
| POST   | /api/courses               | admin, lecturer        |
| PUT    | /api/courses/{id}          | admin, lecturer (own)  |
| DELETE | /api/courses/{id}          | admin                  |
| GET    | /api/courses/{id}/students | admin, lecturer (own)  |
| POST   | /api/enrollments           | student (self), admin  |
| GET    | /api/enrollments/my        | student                |
| GET    | /api/enrollments           | admin (all), lecturer (own courses) |
| DELETE | /api/enrollments/{id}      | student (own), admin   |
| GET/POST/PUT/DELETE | /api/users[/{id}] | admin             |

Send the token as `Authorization: Bearer <token>` (use Postman to test).

## Before deploying
- Set a strong `JWT_SECRET` (32+ characters).
- Change or remove the demo accounts in `DataSeeder.java`.
- Set `CORS_ORIGINS` to your deployed frontend URL and `NEXT_PUBLIC_API_URL` in the frontend.
