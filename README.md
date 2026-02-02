
# Zentask

A Zen-inspired task management application built with Spring Boot 3.4.2, Spring Security 6, and Thymeleaf.

## Features
- **Stateless Authentication**: JWT tokens stored in HTTP-only cookies.
- **Task Management**: CRUD operations for user-specific tasks.
- **Security**: BCrypt password hashing and JWT validation filters.
- **Production Ready**: Configured for deployment on Render/Railway with PostgreSQL.

## Local Setup
1. Ensure you have **Java 17** and **Maven** installed.
2. Clone the repository.
3. Run the application:
   ```bash
   mvn spring-boot:run
   ```
4. Access the dashboard at `http://localhost:8080/dashboard`.

## Deployment (Render.com)
1. Push this code to GitHub.
2. Connect a new "Web Service" on Render.
3. Add environment variables:
   - `SPRING_DATASOURCE_URL`: Your DB URL
   - `SPRING_DATASOURCE_USERNAME`: Your DB Username
   - `SPRING_DATASOURCE_PASSWORD`: Your DB Password
   - `JWT_SECRET`: A long random string
