package com.sms.config;

import com.sms.entity.Course;
import com.sms.entity.Role;
import com.sms.entity.User;
import com.sms.repository.CourseRepository;
import com.sms.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/** Creates demo accounts on first start. Change / remove the passwords before deploying. */
@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository users;
    private final CourseRepository courses;
    private final PasswordEncoder encoder;

    public DataSeeder(UserRepository users, CourseRepository courses, PasswordEncoder encoder) {
        this.users = users;
        this.courses = courses;
        this.encoder = encoder;
    }

    @Override
    public void run(String... args) {
        if (users.count() > 0) {
            return;
        }
        createUser("System Admin", "admin@sms.com", "Admin@123", Role.ADMIN);
        User lecturer = createUser("Dr. Nimal Perera", "lecturer@sms.com", "Lecturer@123", Role.LECTURER);
        createUser("Kasun Silva", "student@sms.com", "Student@123", Role.STUDENT);

        createCourse("CS101", "Introduction to Programming", "Basics of programming using Java.", 3, 40, lecturer);
        createCourse("CS201", "Database Systems", "Relational design, SQL and transactions.", 4, 30, lecturer);
    }

    private User createUser(String name, String email, String rawPassword, Role role) {
        User u = new User();
        u.setFullName(name);
        u.setEmail(email);
        u.setPassword(encoder.encode(rawPassword));
        u.setRole(role);
        return users.save(u);
    }

    private void createCourse(String code, String title, String desc, int credits, int capacity, User lecturer) {
        Course c = new Course();
        c.setCode(code);
        c.setTitle(title);
        c.setDescription(desc);
        c.setCredits(credits);
        c.setCapacity(capacity);
        c.setLecturer(lecturer);
        courses.save(c);
    }
}
