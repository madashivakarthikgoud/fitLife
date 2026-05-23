# =============================================================================
# FitLife - Retroactive Git History Script
# Spans: 2026-05-11 to 2026-05-23
# Run from the workspace root: C:\Users\2494578\Coding\projects\fitLife
# =============================================================================

Set-Location "C:\Users\2494578\Coding\projects\fitLife"

# -- 0. Init ------------------------------------------------------------------
if (-Not (Test-Path ".git")) { git init }

git config user.email "garvmathur7700@gmail.com"
git config user.name  "Garv Mathur"

# -- Helper -------------------------------------------------------------------
function Commit {
    param(
        [string]   $Date,
        [string]   $Message,
        [string[]] $Paths
    )
    $env:GIT_AUTHOR_DATE    = $Date
    $env:GIT_COMMITTER_DATE = $Date
    foreach ($p in $Paths) { git add $p }
    git commit --date="$Date" -m "$Message"
}

# =============================================================================
# MAY 11 - Project scaffolding
# =============================================================================

# 1 · Write .gitignore, then commit it with the root README
@"
# Java / Maven
fitlife-backend/target/
*.class
*.jar
*.war

# Node / Angular
fitlife-frontend/node_modules/
fitlife-frontend/dist/
fitlife-frontend/.angular/

# IDE / OS
.idea/
*.iml
.vscode/
.DS_Store
Thumbs.db
"@ | Set-Content ".gitignore"

Commit "2026-05-11 10:00:00" `
    "chore: initial repository setup - README and .gitignore" `
    @("README.md", ".gitignore")

# 2 · Backend Maven wrapper + pom.xml
Commit "2026-05-11 10:45:00" `
    "build(backend): add Maven wrapper and pom.xml" `
    @(
        "fitlife-backend/pom.xml",
        "fitlife-backend/mvnw",
        "fitlife-backend/mvnw.cmd"
    )

# 3 · Spring Boot entry point + base application.properties
Commit "2026-05-11 11:30:00" `
    "feat(backend): Spring Boot application entry point and base configuration" `
    @(
        "fitlife-backend/src/main/java/com/fitlife/FitlifeBackendApplication.java",
        "fitlife-backend/src/main/resources/application.properties"
    )

# 4 · Angular scaffold — all root config + src bootstrap files
Commit "2026-05-11 14:00:00" `
    "chore(frontend): initialize Angular 19 project" `
    @(
        "fitlife-frontend/README.md",
        "fitlife-frontend/package.json",
        "fitlife-frontend/angular.json",
        "fitlife-frontend/tsconfig.json",
        "fitlife-frontend/tsconfig.app.json",
        "fitlife-frontend/tsconfig.spec.json",
        "fitlife-frontend/proxy.conf.json",
        "fitlife-frontend/vercel.json",
        "fitlife-frontend/public",
        "fitlife-frontend/src/index.html",
        "fitlife-frontend/src/main.ts",
        "fitlife-frontend/src/styles.scss",
        "fitlife-frontend/src/environments"
    )

# =============================================================================
# MAY 12 - Backend domain layer
# =============================================================================

# 5 · JPA entity models
Commit "2026-05-12 09:00:00" `
    "feat(backend): JPA entity models (User, Goal, Meal, WaterLog, WeightLog, Workout)" `
    @("fitlife-backend/src/main/java/com/fitlife/model")

# 6 · Spring Data repositories
Commit "2026-05-12 10:30:00" `
    "feat(backend): Spring Data JPA repositories with custom query methods" `
    @("fitlife-backend/src/main/java/com/fitlife/repository")

# 7 · Request / response DTOs
Commit "2026-05-12 13:00:00" `
    "feat(backend): DTOs with Bean Validation annotations (Auth, Goal, Meal, Water, WeightLog, Workout)" `
    @("fitlife-backend/src/main/java/com/fitlife/dto")

# =============================================================================
# MAY 13 - Backend security and cross-cutting concerns
# =============================================================================

# 8 · Custom exception hierarchy
Commit "2026-05-13 09:00:00" `
    "feat(backend): custom exception classes mapping to HTTP 400/403/404/409" `
    @("fitlife-backend/src/main/java/com/fitlife/exception")

# 9 · JWT token provider + authentication filter
Commit "2026-05-13 10:15:00" `
    "feat(backend): JWT token provider (HS256) and OncePerRequestFilter" `
    @("fitlife-backend/src/main/java/com/fitlife/security")

# 10 · SecurityConfig, CorsConfig, GlobalExceptionHandler
Commit "2026-05-13 11:45:00" `
    "feat(backend): SecurityConfig (stateless JWT chain), CorsConfig, and GlobalExceptionHandler" `
    @("fitlife-backend/src/main/java/com/fitlife/config")

# =============================================================================
# MAY 14 - Backend service and controller layer
# =============================================================================

# 11 · All service classes
Commit "2026-05-14 09:00:00" `
    "feat(backend): service layer - Auth, Goal, Meal, Water, WeightLog, Workout" `
    @("fitlife-backend/src/main/java/com/fitlife/service")

# 12 · All REST controllers
Commit "2026-05-14 11:00:00" `
    "feat(backend): REST controllers for all /api/** endpoints" `
    @("fitlife-backend/src/main/java/com/fitlife/controller")

# 13 · Seed data + production profile
Commit "2026-05-14 14:30:00" `
    "chore(backend): database seed data (data.sql) and production application properties" `
    @(
        "fitlife-backend/src/main/resources/data.sql",
        "fitlife-backend/src/main/resources/application-prod.properties"
    )

# =============================================================================
# MAY 15 - Frontend app shell
# =============================================================================

# 14 · App bootstrap (app.ts, app.config.ts, app.routes.ts)
Commit "2026-05-15 09:00:00" `
    "feat(frontend): Angular app bootstrap, provider config, and routing table" `
    @(
        "fitlife-frontend/src/app/app.ts",
        "fitlife-frontend/src/app/app.config.ts",
        "fitlife-frontend/src/app/app.routes.ts"
    )

# 15 · Auth guard + JWT HTTP interceptor
Commit "2026-05-15 10:30:00" `
    "feat(frontend): auth guard (CanActivateFn) and JWT Bearer HTTP interceptor" `
    @(
        "fitlife-frontend/src/app/guards",
        "fitlife-frontend/src/app/interceptors"
    )

# =============================================================================
# MAY 16 - Frontend services
# =============================================================================

# 16 · Core services: auth, toast, fitness-calculator
Commit "2026-05-16 09:00:00" `
    "feat(frontend): core services - AuthService, ToastService, FitnessCalculatorService" `
    @(
        "fitlife-frontend/src/app/services/auth.service.ts",
        "fitlife-frontend/src/app/services/toast.service.ts",
        "fitlife-frontend/src/app/services/fitness-calculator.service.ts"
    )

# 17 · Domain services: workout, nutrition, water, goal, weight-log
Commit "2026-05-16 11:00:00" `
    "feat(frontend): domain services - Workout, Nutrition, Water, Goal, WeightLog" `
    @(
        "fitlife-frontend/src/app/services/workout.service.ts",
        "fitlife-frontend/src/app/services/nutrition.service.ts",
        "fitlife-frontend/src/app/services/water.service.ts",
        "fitlife-frontend/src/app/services/goal.service.ts",
        "fitlife-frontend/src/app/services/weight-log.service.ts"
    )

# 18 · Analytics services: InsightsService + stat-utils
Commit "2026-05-16 14:00:00" `
    "feat(frontend): client-side analytics - InsightsService (regression, z-score, streaks) and stat-utils" `
    @(
        "fitlife-frontend/src/app/services/insights.service.ts",
        "fitlife-frontend/src/app/services/stat-utils.ts"
    )

# =============================================================================
# MAY 17 - Frontend layout and shared components
# =============================================================================

# 19 · Authenticated shell layout (MainLayout, Sidebar, Header)
Commit "2026-05-17 09:00:00" `
    "feat(frontend): authenticated shell layout - MainLayout, Sidebar, Header" `
    @("fitlife-frontend/src/app/layout")

# 20 · Shared / reusable components
Commit "2026-05-17 11:30:00" `
    "feat(frontend): shared components - Toast, ProgressRing, ProgressAvatar, EmptyState, InsightsPanel" `
    @("fitlife-frontend/src/app/shared")

# =============================================================================
# MAY 18 - Frontend auth pages
# =============================================================================

# 21 · Login + Register
Commit "2026-05-18 09:00:00" `
    "feat(frontend): login and registration pages" `
    @(
        "fitlife-frontend/src/app/pages/login",
        "fitlife-frontend/src/app/pages/register"
    )

# 22 · Forgot-password (3-step) + Reset-password
Commit "2026-05-18 11:00:00" `
    "feat(frontend): forgot-password 3-step flow and reset-password page" `
    @(
        "fitlife-frontend/src/app/pages/forgot-password",
        "fitlife-frontend/src/app/pages/reset-password"
    )

# =============================================================================
# MAY 19 - Frontend feature pages: dashboard, workouts, nutrition
# =============================================================================

# 23 · Dashboard
Commit "2026-05-19 09:00:00" `
    "feat(frontend): dashboard - KPI computed signals, chart aggregates, insights integration" `
    @("fitlife-frontend/src/app/pages/dashboard")

# 24 · Workouts
Commit "2026-05-19 11:00:00" `
    "feat(frontend): workout tracker with adaptive form fields per exercise type" `
    @("fitlife-frontend/src/app/pages/workouts")

# 25 · Nutrition
Commit "2026-05-19 14:00:00" `
    "feat(frontend): nutrition logger - food search, macro auto-calc, progress rings" `
    @("fitlife-frontend/src/app/pages/nutrition")

# =============================================================================
# MAY 20 - Frontend feature pages: goals, water, history
# =============================================================================

# 26 · Goals
Commit "2026-05-20 09:00:00" `
    "feat(frontend): goals management page with weight-log modal and auto-completion logic" `
    @("fitlife-frontend/src/app/pages/goals")

# 27 · Water tracker
Commit "2026-05-20 11:00:00" `
    "feat(frontend): water tracker - quick-add presets, daily goal progress, computed signals" `
    @("fitlife-frontend/src/app/pages/water")

# 28 · History charts
Commit "2026-05-20 14:00:00" `
    "feat(frontend): history page - ng2-charts line, bar, and pie visualisations across tabs" `
    @("fitlife-frontend/src/app/pages/history")

# =============================================================================
# MAY 21 - Profile page and backend test scaffold
# =============================================================================

# 29 · Profile page
Commit "2026-05-21 09:30:00" `
    "feat(frontend): profile page - BMI/TDEE stats, editable form, ProgressAvatar integration" `
    @("fitlife-frontend/src/app/pages/profile")

# 30 · Backend integration test scaffold
Commit "2026-05-21 13:00:00" `
    "test(backend): add integration test scaffold" `
    @("fitlife-backend/src/test")

# =============================================================================
# MAY 22 - Architecture documentation
# =============================================================================

# 31 · Architecture blueprint
Commit "2026-05-22 10:00:00" `
    "docs: add comprehensive architecture blueprint (file-by-file map, data flows, critical deps)" `
    @("plan-fitLifeArchitecture.prompt.md")


$env:GIT_AUTHOR_DATE    = "2026-05-23 09:30:00"
$env:GIT_COMMITTER_DATE = "2026-05-23 09:30:00"
git add -A
git diff --cached --quiet
if ($LASTEXITCODE -ne 0) {
    git commit --date="2026-05-23 09:30:00" -m "chore: final polish and miscellaneous cleanup"
}

# -- Restore env vars ---------------------------------------------------------
$env:GIT_AUTHOR_DATE    = $null
$env:GIT_COMMITTER_DATE = $null

Write-Host ""
Write-Host "Git history created successfully!" -ForegroundColor Green
git log --oneline
