# TeachHire

A platform connecting teachers, institutions, and students across four domains — job hiring, course sales, admission bulletins, and teacher-to-teacher networking — unified by a shared teacher profile.

Spring Boot (Java 17) backend + React (Vite) frontend.

## Modules

| Module | Description |
|---|---|
| `profile` | Teacher, institution, and student profiles; subjects; a cross-module aggregate endpoint that composes a teacher's job history, courses, and network into one profile view |
| `hire` | Job postings and applications |
| `learn` | Courses, course content, enrollments, reviews |
| `bulletin` | Institution announcements and admission notices |
| `network` | Teacher-to-teacher connection requests |

`auth`, `common`, and `config` provide cross-cutting concerns (JWT auth, exception handling, security config) used by all of the above.

The `profile.aggregate` package depends on `hire`, `learn`, and `network` to build the combined profile view; none of those modules depend back on it, keeping the dependency direction one-way.

## Tech stack

- **Backend:** Spring Boot 4, Spring Security, Spring Data JPA, MySQL, JWT (jjwt), Lombok
- **Frontend:** React 19, React Router 7, Vite, plain `fetch`-based API client (no external state/query library)

## Getting started

### Backend

1. Requires Java 17 and a running MySQL instance.
2. Copy the config template and fill in real values:
   ```
   cp backend/src/main/resources/application.properties.example backend/src/main/resources/application.properties
   ```
   Set `spring.datasource.username`/`password` to your MySQL credentials and generate a real `app.jwt.secret` (a base64-encoded 256-bit+ value). This file is gitignored — never commit it.
3. From `backend/`:
   ```
   mvn spring-boot:run
   ```
   The API serves on `http://localhost:8080` by default; the schema is created/updated automatically via `spring.jpa.hibernate.ddl-auto=update`.

### Frontend

1. From `frontend/`:
   ```
   npm install
   npm run dev
   ```
2. The API client points at `VITE_API_BASE_URL`, defaulting to `http://localhost:8080` if unset. Set it in a `.env` file at `frontend/` if your backend runs elsewhere.

## API conventions

- All endpoints are prefixed `/api/...`.
- Auth is stateless JWT, sent as `Authorization: Bearer <token>`.
- List endpoints are paginated (Spring `Pageable`, `?page=`) and return `{ content, totalPages, ... }`.
- Ownership checks (e.g. "can this user delete this bulletin/job posting") are enforced in the service layer, not via role annotations alone — a role tells you what a user is, not whether a given resource belongs to them.

## Known limitations

- No real payment gateway — course enrollment sets a `PAID` status directly rather than integrating a payment provider.
- No institution verification workflow — institutions are auto-verified on signup.
- Course content is a stored URL + content type, not a media delivery pipeline.
