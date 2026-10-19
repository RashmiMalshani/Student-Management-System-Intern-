
package com.sms.config;

import com.sms.entity.Course;
import com.sms.entity.Role;
import com.sms.entity.User;
import com.sms.repository.CourseRepository;
import com.sms.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository users;
    private final CourseRepository courses;
    private final PasswordEncoder encoder;

    public DataSeeder(
            UserRepository users,
            CourseRepository courses,
            PasswordEncoder encoder) {
        this.users = users;
        this.courses = courses;
        this.encoder = encoder;
    }

    @Override
    public void run(String... args) {

        // Create Admin account if it does not exist
        if (!users.existsByEmail("admin@sms.com")) {
            createUser(
                    "System Admin",
                    "admin@sms.com",
                    "Admin@123",
                    Role.ADMIN
            );
            System.out.println("Demo Admin account created.");
        }

        // Create Lecturer account if it does not exist
        User lecturer = users.findByEmail("lecturer@sms.com")
                .orElseGet(() -> createUser(
                        "Dr. Nimal Perera",
                        "lecturer@sms.com",
                        "Lecturer@123",
                        Role.LECTURER
                ));

        // Create Student account if it does not exist
        if (!users.existsByEmail("student@sms.com")) {
            createUser(
                    "Kasun Silva",
                    "student@sms.com",
                    "Student@123",
                    Role.STUDENT
            );
        }

        // Create demo courses if they do not exist
        if (!courses.existsByCode("CS101")) {
            createCourse(
                    "CS101",
                    "Introduction to Programming",
                    "Basics of programming using Java.",
                    3,
                    40,
                    lecturer
            );
        }

        if (!courses.existsByCode("CS201")) {
            createCourse(
                    "CS201",
                    "Database Systems",
                    "Relational design, SQL and transactions.",
                    4,
                    30,
                    lecturer
            );
        }
    }

    private User createUser(
            String name,
            String email,
            String rawPassword,
            Role role) {

        User user = new User();
        user.setFullName(name);
        user.setEmail(email);
        user.setPassword(encoder.encode(rawPassword));
        user.setRole(role);

        return users.save(user);
    }

    private void createCourse(
            String code,
            String title,
            String description,
            int credits,
            int capacity,
            User lecturer) {

        Course course = new Course();
        course.setCode(code);
        course.setTitle(title);
        course.setDescription(description);
        course.setCredits(credits);
        course.setCapacity(capacity);
        course.setLecturer(lecturer);

        courses.save(course);
    }
}
