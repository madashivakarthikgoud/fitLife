npm # FitLife — Personal Fitness Tracker

A full-stack fitness tracking application built with **Angular 19** and **Spring Boot 3**.

## Features

- 🏋️ **Workout Tracking** — Log exercises with sets, reps, weight, duration. Calories burned entered from your fitness device.
- 🥗 **Nutrition Logging** — Search common foods or enter custom meals with full macros (calories, protein, carbs, fat).
- 💧 **Hydration Tracking** — Quick-add water with preset sizes or custom amounts. Daily goal based on body weight.
- 🎯 **Goal Setting** — Weight goals (driven by real weight logs), workout frequency, and custom goals.
- 📊 **History & Charts** — Weekly/monthly charts for calories, workouts, and macro breakdown.
- 👤 **Profile** — BMI, BMR, TDEE, personalized macro & calorie targets based on your stats.
- 🔐 **Security** — JWT authentication, security question for password recovery (no email required).

## Tech Stack

| Layer    | Technology                        |
|----------|-----------------------------------|
| Frontend | Angular 19, TypeScript, SCSS      |
| Backend  | Spring Boot 3, Java 17, JPA      |
| Database | MySQL                             |
| Auth     | JWT + BCrypt + Security Questions |
| Charts   | Chart.js via ng2-charts           |

## Getting Started

### Prerequisites

- Node.js 18+
- Java 17+
- MySQL 8+

### Backend Setup

```bash
cd fitlife-backend

# Set environment variables
export DATASOURCE_URL=jdbc:mysql://localhost:3306/fitlife
export DATASOURCE_USER=root
export DATASOURCE_PASSWORD=yourpassword
export JWT_SECRET=your-256-bit-secret-key-here
export FRONTEND_URL=http://localhost:4200

# Run
./mvnw spring-boot:run
```

### Frontend Setup

```bash
cd fitlife-frontend
npm install
ng serve
```

Open http://localhost:4200

### Environment Variables

| Variable           | Description                          |
|--------------------|--------------------------------------|
| `DATASOURCE_URL`   | MySQL JDBC connection URL            |
| `DATASOURCE_USER`  | MySQL username                       |
| `DATASOURCE_PASSWORD` | MySQL password                    |
| `JWT_SECRET`       | Secret key for JWT signing (256-bit) |
| `FRONTEND_URL`     | Frontend origin for CORS             |

## Project Structure

```
fitLife/
├── fitlife-backend/       # Spring Boot REST API
│   └── src/main/java/com/fitlife/
│       ├── controller/    # REST controllers
│       ├── service/       # Business logic
│       ├── model/         # JPA entities
│       ├── dto/           # Request/response DTOs
│       ├── repository/    # Data access
│       ├── security/      # JWT filter & provider
│       └── config/        # CORS, Security, Exception handling
├── fitlife-frontend/      # Angular 19 SPA
│   └── src/app/
│       ├── pages/         # Route components
│       ├── services/      # HTTP services & state
│       ├── layout/        # Header, sidebar, main layout
│       ├── shared/        # Reusable components
│       ├── guards/        # Auth guard
│       └── interceptors/  # JWT interceptor
└── README.md
```

## License

MIT

