# ZMEN Backend Core Server - Complete Technical Documentation

## 1. System Overview

The ZMEN Backend Core Server is the central API and business-logic layer for the ZMEN ecosystem. It is responsible for:

- User authentication and identity validation
- Secure access to protected endpoints using JWT Bearer tokens
- Handling ZMEN URO workflows:
  - symptom-based assessment submission and scoring
  - strip-image upload and AI-assisted analysis
  - risk score aggregation and combined interpretation
- Handling ZMEN PRO workflows:
  - pH strip scan processing
  - sperm-count image processing
  - final semen-analysis assessment classification
- Persistent test result storage in MongoDB
- User-centric history aggregation and retrieval
- Communication with an external AI server for computer-vision and model inference

In production terms, this service acts as the API gateway and domain engine consumed by:

- React Native mobile client
- React web client
- Internal AI inference service (upstream dependency)

This document is the single source of truth for backend behavior discovered in the codebase.

---

## 2. High-Level Architecture

### 2.1 Technology Stack

- Runtime: Python 3 (FastAPI async architecture)
- Web framework: FastAPI
- ASGI server: Uvicorn
- Database: MongoDB
- Mongo driver: Motor (async)
- Auth: OAuth2 password flow + JWT (HS256)
- Password hashing: bcrypt
- External calls: httpx (async)

### 2.2 Folder Structure and Layer Responsibilities

Current implemented structure:

- app/main.py
  - FastAPI application creation
  - CORS middleware registration
  - Router registration
- app/core
  - config.py: environment-based settings
  - database.py: Mongo client and DB accessor
  - dependencies.py: auth dependency and current-user resolution
  - security.py: token creation and password hashing/verification
- app/routers
  - auth.py: authentication endpoints
  - uro.py: URO feature endpoints
  - pro.py: PRO feature endpoints
  - history.py: user history endpoint
- app/services
  - user_service.py: user persistence logic
  - uro_service.py: URO orchestration and persistence
  - pro_service.py: PRO orchestration and persistence
  - history_service.py: history write/read helpers
  - ai_client.py: outbound calls to AI server
  - uro_risk_engine.py: URO form risk engine
  - strip_scoring_engine.py: URO strip scoring engine
  - pro_scoring_engine.py: PRO metric/scoring engine
- app/schemas
  - user.py: auth/user request-response contracts
  - uro.py: URO request-response contracts
  - pro.py: PRO request-response contracts
  - history.py: history contract
- run.py
  - local dev startup entrypoint

### 2.3 Request Lifecycle (End-to-End)

1. UI triggers API call from mobile/web app.
2. FastAPI router receives request and validates request body/query/form/file against schema/dependencies.
3. For protected endpoints, get_current_user decodes JWT and fetches user from MongoDB.
4. Router delegates processing to service layer.
5. Service layer may:
   - execute scoring engine logic
   - call AI server via ai_client
   - persist documents to MongoDB
   - log activity into history collection
6. Service returns normalized payload.
7. Router maps exceptions into HTTP status + detail message.
8. FastAPI serializes response via response_model and returns JSON to UI.

### 2.4 Controllers, Models, Middleware, Utils Mapping

The project does not use separate controllers or model classes as distinct folders. The practical mapping is:

- Controller role: app/routers/\*.py route handlers
- Service role: app/services/\*.py
- Model role:
  - Database document shape is implicit in service-layer write operations
  - API contract model is explicit in app/schemas/\*.py
- Middleware:
  - CORS middleware configured globally
  - Auth enforcement is dependency-based middleware pattern via Depends(get_current_user)
- Utils:
  - Domain utilities are implemented inside scoring engine modules

---

## 3. Environment and Configuration

Configuration is centralized in app/core/config.py.

### 3.1 Environment Variables

- PROJECT_NAME (default: ZMEN Backend)
- MONGODB_URL (default: mongodb://localhost:27017)
- DATABASE_NAME (default: zmen_db)
- SECRET_KEY (default: your-super-secret-key-for-development)
- AI_SERVER_URL (default: http://127.0.0.1:8080)
- GEOAPIFY_API_KEY (declared, currently not consumed in routes/services)
- ALGORITHM (default: HS256)
- ACCESS_TOKEN_EXPIRE_MINUTES (default: 10080 minutes = 7 days)

### 3.2 Startup and App Wiring

- run.py launches app.main:app using Uvicorn on 0.0.0.0:8000 with reload enabled.
- main.py registers CORS with wildcard policy:
  - allow_origins: ["*"]
  - allow_methods: ["*"]
  - allow_headers: ["*"]
  - allow_credentials: true

Note for production: wildcard origins with credentials are generally not recommended for hardened deployments.

### 3.3 Database Connection

- Motor client is initialized once from MONGODB_URL.
- Selected DB uses DATABASE_NAME.
- get_db() returns DB instance for service usage.

---

## 4. Authentication and Authorization

## 4.1 Implemented Auth Endpoints

- POST /api/auth/signup
- POST /api/auth/login

Important naming note:

- The codebase uses /signup, not /register.
- Any client currently using /auth/register must be updated or proxied.

### 4.2 Signup Flow

1. Client sends JSON body with email and password.
2. Backend checks if email already exists.
3. Password is hashed using bcrypt.gensalt + bcrypt.hashpw.
4. User is stored in users collection.
5. Response returns id and email (hashed_password is never returned).

### 4.3 Login Flow

1. Client sends OAuth2 form fields (application/x-www-form-urlencoded):
   - username (email)
   - password
2. Backend fetches user by email.
3. bcrypt password verification is performed.
4. On success, JWT access token is created with:
   - sub claim = user email
   - exp claim = now + configured expiration
   - algorithm = HS256
5. Response returns access_token and token_type=bearer.

### 4.4 Protected Route Behavior

Protected routes require Authorization header:

- Authorization: Bearer <access_token>

Dependency chain:

1. OAuth2PasswordBearer extracts bearer token.
2. JWT decode is performed with SECRET_KEY and ALGORITHM.
3. sub claim (email) must be present.
4. User must still exist in DB.
5. Failure returns 401 with WWW-Authenticate: Bearer.

### 4.5 Refresh Token Logic

Refresh token endpoint or rotating refresh-token mechanism is not implemented in the current codebase.

- Present behavior: long-lived access token (7 days by default)
- Operational implication: clients must re-login after token expiry

---

## 5. Database Schema and Collection Design

MongoDB collections inferred from service-layer writes:

- users
- uro_assessments
- uro_strip_scans
- pro_assessments
- user_history

### 5.1 users Collection (User model)

Purpose: identity + credential storage.

Representative document:

```json
{
  "_id": "ObjectId",
  "email": "user@example.com",
  "hashed_password": "$2b$12$..."
}
```

Notes:

- Unique-email behavior is enforced at application layer (pre-insert check).
- A database unique index on email is recommended for race-condition safety.

### 5.2 uro_assessments Collection (URO form assessment model)

Purpose: persist questionnaire-derived risk results.

Representative document:

```json
{
  "_id": "ObjectId",
  "user_id": "string|null",
  "user_email": "user@example.com",
  "assessment_type": "health_assessment",
  "answers": {
    "freq": "sometimes",
    "stream": "slightly_weak",
    "night": "once",
    "pain": "mild_discomfort",
    "blood": "never",
    "family": "no_known_history"
  },
  "breakdown": [
    {
      "question_id": "freq",
      "question_text": "How often do you experience frequent urination?",
      "question_weight": 14.0,
      "choice_id": "sometimes",
      "choice_label": "Sometimes",
      "choice_score": 0.45,
      "weighted_points": 6.3
    }
  ],
  "score_percentage": 32.5,
  "risk_level": "Medium",
  "risk_flags": ["blood_in_urine_reported"],
  "scoring_version": "uro-assessment-v1",
  "score_partition": {
    "assessment_weight": 1.0,
    "strip_weight": 0.0
  },
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### 5.3 uro_strip_scans Collection (URO strip scan model)

Purpose: persist AI strip analysis + weighted scoring output.

Representative document:

```json
{
  "_id": "ObjectId",
  "user_id": "string|null",
  "user_email": "user@example.com",
  "assessment_type": "strip_scan",
  "strip_score_percentage": 48.25,
  "strip_risk_level": "Mild",
  "parameter_scores": [
    {
      "parameter": "Leukocytes",
      "value": "Trace",
      "unit": "cells/uL",
      "severity_score": 25,
      "weight": 0.3,
      "weighted_score": 7.5,
      "is_normal": false,
      "match_confidence": 0.848,
      "detected_color_hex": "#DED9E3"
    }
  ],
  "abnormal_count": 3,
  "abnormal_parameters": ["Leukocytes", "Nitrite", "Blood"],
  "flags": ["UTI-like pattern flag"],
  "scoring_version": "uro-strip-v1",
  "ai_summary": {},
  "ai_filename": "strip.png",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### 5.4 pro_assessments Collection (PRO assessment model)

Purpose: persist final semen-analysis classification with computed metrics.

Representative document:

```json
{
  "_id": "ObjectId",
  "user_id": "string|null",
  "user_email": "user@example.com",
  "assessment_type": "pro_assessment",
  "classification_result": "Normal",
  "metrics": [
    {
      "parameter": "Sperm Concentration",
      "value": "61.0 Million/mL",
      "numeric_value": 61.0,
      "unit": "Million/mL",
      "status": "Normal",
      "is_normal": true,
      "reference": ">= 16 Million/mL (WHO 2021)"
    }
  ],
  "abnormal_count": 1,
  "abnormal_parameters": ["pH Level"],
  "scoring_version": "pro-assessment-v1",
  "viscosity_label": "Normal",
  "viscosity_value": 10.0,
  "raw_inputs": {
    "ph_level": "7",
    "sperm_concentration": "61",
    "viscosity_value": 10.0,
    "viscosity_label": "Normal",
    "volume_ml": 2.5
  },
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### 5.5 user_history Collection (History model)

Purpose: one-document-per-user activity timeline.

Representative document:

```json
{
  "user_email": "user@example.com",
  "created_at": "datetime",
  "updated_at": "datetime",
  "entries": [
    {
      "entry_type": "uro_assessment",
      "title": "ZMEN URO Assessment",
      "result": "Mild Risk (38.8%)",
      "result_badge": "mild",
      "created_at": "datetime"
    }
  ]
}
```

Behavioral details:

- New history entry is prepended to entries (most recent first).
- Optional slicing is used for limit query support.

### 5.6 Relationships

Logical relationships (app-level, not DB-enforced foreign keys):

- User.email links to:
  - uro_assessments.user_email
  - uro_strip_scans.user_email
  - pro_assessments.user_email
  - user_history.user_email

---

## 6. API Endpoint Documentation (Complete)

All publicly exposed routes implemented in this backend are documented below.

## 6.1 General API Conventions

- Base URL (example): https://api.yourdomain.com
- Content-Type:
  - JSON endpoints: application/json
  - login endpoint: application/x-www-form-urlencoded
  - file endpoints: multipart/form-data
- Auth header for protected routes:
  - Authorization: Bearer <token>

### 6.1.1 Error Shape

Current implementation returns FastAPI default error structure:

```json
{
  "detail": "Error message"
}
```

Validation errors use FastAPI's 422 schema with detail array.

A standardized success/message/error-code envelope is not currently implemented.

---

## 6.2 Module: AUTH

### Endpoint: Sign Up

- Method: POST
- Path: /api/auth/signup
- Purpose: Register a new user account
- Authentication required: No

Request headers:

- Content-Type: application/json

Request body schema:

```json
{
  "email": "string (email)",
  "password": "string"
}
```

Example request:

```json
{
  "email": "john.doe@example.com",
  "password": "StrongPassword@123"
}
```

Success response (200):

```json
{
  "id": "680de9f2c908f4d4f7869f12",
  "email": "john.doe@example.com"
}
```

Example error response (400 - duplicate email):

```json
{
  "detail": "User with this email already exists."
}
```

Frontend usage context:

- Mobile/web registration screen calls this once user completes signup form.
- On success, UI should route to login and request token.

---

### Endpoint: Login

- Method: POST
- Path: /api/auth/login
- Purpose: Authenticate user and issue JWT access token
- Authentication required: No

Request headers:

- Content-Type: application/x-www-form-urlencoded

Request body schema (form fields):

- username: string (email)
- password: string

Example form payload:

```text
username=john.doe@example.com&password=StrongPassword@123
```

Success response (200):

```json
{
  "access_token": "<jwt>",
  "token_type": "bearer"
}
```

Example error response (401):

```json
{
  "detail": "Incorrect email or password"
}
```

Frontend usage context:

- Called from login screen in mobile and web.
- Token must be stored securely:
  - Mobile: secure keychain/keystore abstraction
  - Web: prefer httpOnly cookie architecture or hardened storage strategy

---

## 6.3 Module: USER PROFILE

Status in current codebase:

- GET /user/profile: Not implemented
- PUT /user/profile: Not implemented

What exists instead:

- User identity is resolved from JWT subject and DB lookup in protected endpoints.

Integration recommendation:

- If frontend currently expects profile endpoints, add dedicated router/service methods in a future release.

---

## 6.4 Module: ZMEN URO

### Endpoint: Submit URO Health Assessment

- Method: POST
- Path: /api/uro/assessment
- Purpose: Submit 6-question URO questionnaire and persist scored result
- Authentication required: Yes (Bearer token)

Request headers:

- Authorization: Bearer <token>
- Content-Type: application/json

Request body schema:

```json
{
  "answers": {
    "freq": "never|rarely|sometimes|often|very_often",
    "stream": "strong_and_steady|slightly_weak|noticeably_weak|very_weak|can_barely_urinate",
    "night": "never|once|two_to_three|four_to_five|more_than_five",
    "pain": "no_pain|mild_discomfort|moderate_pain|severe_pain",
    "blood": "never|once_or_twice|occasionally|frequently",
    "family": "no_known_history|distant_relative|parent_or_sibling|not_sure"
  }
}
```

Example request:

```json
{
  "answers": {
    "freq": "sometimes",
    "stream": "slightly_weak",
    "night": "two_to_three",
    "pain": "mild_discomfort",
    "blood": "never",
    "family": "no_known_history"
  }
}
```

Success response (201):

```json
{
  "id": "680dea7cc908f4d4f7869f13",
  "user_email": "john.doe@example.com",
  "score_percentage": 38.8,
  "risk_level": "Medium",
  "risk_flags": [],
  "scoring_version": "uro-assessment-v1",
  "score_partition": {
    "assessment_weight": 1.0,
    "strip_weight": 0.0
  },
  "answers": {
    "freq": "sometimes",
    "stream": "slightly_weak",
    "night": "two_to_three",
    "pain": "mild_discomfort",
    "blood": "never",
    "family": "no_known_history"
  },
  "breakdown": [],
  "created_at": "2026-04-27T09:25:30.123456"
}
```

Example error response (422 - invalid or missing answers):

```json
{
  "detail": "Missing answers for: blood"
}
```

Frontend usage context:

- Mobile/web form-submit action for URO questionnaire.
- Returned score/risk should be shown immediately and cached for details screen.

---

### Endpoint: Get Latest URO Health Assessment

- Method: GET
- Path: /api/uro/assessment/latest
- Purpose: Retrieve most recent questionnaire assessment for current user
- Authentication required: Yes

Request headers:

- Authorization: Bearer <token>

Request body: none

Success response (200):

- Same schema as POST /api/uro/assessment response

Example error response (404):

```json
{
  "detail": "No URO health assessment found for this user"
}
```

Frontend usage context:

- Used by app dashboard when reopening URO module.

---

### Endpoint: Submit URO Strip Scan Image

- Method: POST
- Path: /api/uro/strip-scan
- Purpose: Upload strip image, call AI service, compute weighted strip risk, persist result
- Authentication required: Yes

Request headers:

- Authorization: Bearer <token>
- Content-Type: multipart/form-data

Request form-data:

- file: image file

Example request behavior:

- Max size: 10 MB
- Must be image/\* content type

Success response (201):

```json
{
  "id": "680deafdc908f4d4f7869f14",
  "user_email": "john.doe@example.com",
  "strip_score_percentage": 48.25,
  "strip_risk_level": "Mild",
  "parameter_scores": [],
  "abnormal_count": 3,
  "abnormal_parameters": ["Leukocytes", "Nitrite", "Blood"],
  "flags": ["UTI-like pattern flag"],
  "scoring_version": "uro-strip-v1",
  "created_at": "2026-04-27T09:27:41.112233"
}
```

Example error responses:

400 (bad file type):

```json
{
  "detail": "Only image files are accepted."
}
```

413 (file too large):

```json
{
  "detail": "File size exceeds the 10 MB limit."
}
```

503 (AI server unavailable):

```json
{
  "detail": "AI analysis server is currently unavailable. Please try again later."
}
```

502 (AI upstream error):

```json
{
  "detail": "AI analysis server returned an error: 500"
}
```

Frontend usage context:

- Camera/gallery upload flow from URO strip capture screen.
- UI should support retry strategy for 503/502 and clear upload errors for 400/413.

---

### Endpoint: Get Latest URO Strip Scan

- Method: GET
- Path: /api/uro/strip-scan/latest
- Purpose: Fetch most recent URO strip scan for current user
- Authentication required: Yes

Success response (200):

- Same schema as POST /api/uro/strip-scan

Example error response (404):

```json
{
  "detail": "No strip scan found for this user"
}
```

Frontend usage context:

- Used in result recap and history shortcuts.

---

### Endpoint: Get Combined URO Assessment

- Method: GET
- Path: /api/uro/combined
- Purpose: Return combined risk from form (60%) + strip scan (40%) when available
- Authentication required: Yes

Success response (200):

```json
{
  "combined_score_percentage": 38.8,
  "combined_risk_level": "Mild",
  "assessment_weight": 0.6,
  "strip_weight": 0.4,
  "assessment_score_percentage": 32.5,
  "assessment_risk_level": "Medium",
  "assessment_risk_flags": [],
  "assessment_scoring_version": "uro-assessment-v1",
  "assessment_created_at": "2026-04-27T09:25:30.123456",
  "strip_score_percentage": 48.25,
  "strip_risk_level": "Mild",
  "strip_parameter_scores": [],
  "strip_abnormal_count": 3,
  "strip_abnormal_parameters": ["Leukocytes", "Nitrite", "Blood"],
  "strip_flags": ["UTI-like pattern flag"],
  "strip_scoring_version": "uro-strip-v1",
  "strip_created_at": "2026-04-27T09:27:41.112233",
  "has_strip_scan": true
}
```

Example error response (404):

```json
{
  "detail": "No URO assessment data found. Complete the health assessment first."
}
```

Frontend usage context:

- Summary card in home/dashboard for consolidated URO status.

---

## 6.5 Module: ZMEN PRO

### Endpoint: Scan pH Strip

- Method: POST
- Path: /api/pro/ph-scan
- Purpose: Upload pH strip image and return detected pH classification details
- Authentication required: Yes

Request headers:

- Authorization: Bearer <token>
- Content-Type: multipart/form-data

Request form-data:

- file: image file

Success response (200):

```json
{
  "ph_level": "7",
  "ph_status": "Low (Acidic)",
  "ph_is_normal": false,
  "bands": [132, 97, 211, 168],
  "filename": "ph_strip_20260427.png"
}
```

Example error response:

```json
{
  "detail": "AI analysis server is currently unavailable. Please try again later."
}
```

Frontend usage context:

- First step in PRO workflow after pH strip capture/upload.

---

### Endpoint: Scan Sperm Count

- Method: POST
- Path: /api/pro/sperm-count
- Purpose: Upload microscope image and return derived sperm metrics
- Authentication required: Yes

Request headers:

- Authorization: Bearer <token>
- Content-Type: multipart/form-data

Request form-data:

- file: image file

Success response (200):

```json
{
  "concentration_million_per_ml": 61.0,
  "total_sperm_count_million": 152.5,
  "estimated_motility_percent": 56.3,
  "volume_ml": 2.5,
  "concentration_status": "Normal",
  "total_count_status": "Normal",
  "motility_status": "Normal"
}
```

Frontend usage context:

- Second step in PRO workflow before final classification call.

---

### Endpoint: Submit Full PRO Assessment

- Method: POST
- Path: /api/pro/assessment
- Purpose: Submit final PRO parameters, call AI predictor, score metrics, persist result
- Authentication required: Yes

Request headers:

- Authorization: Bearer <token>
- Content-Type: application/json

Request body schema:

```json
{
  "ph_level": "string",
  "sperm_concentration": "string",
  "viscosity_label": "Normal|Slightly Viscous|Moderately Viscous|Highly Viscous|Other",
  "viscosity_custom_value": "number|null"
}
```

Example request:

```json
{
  "ph_level": "7",
  "sperm_concentration": "61",
  "viscosity_label": "Normal",
  "viscosity_custom_value": null
}
```

Success response (201):

```json
{
  "id": "680deb6bc908f4d4f7869f15",
  "user_email": "john.doe@example.com",
  "classification_result": "Normal",
  "metrics": [],
  "abnormal_count": 1,
  "abnormal_parameters": ["pH Level"],
  "scoring_version": "pro-assessment-v1",
  "viscosity_label": "Normal",
  "viscosity_value": 10.0,
  "created_at": "2026-04-27T09:30:11.010203"
}
```

Example error response (503):

```json
{
  "detail": "AI analysis server is currently unavailable. Please try again later."
}
```

Frontend usage context:

- Final step of PRO flow after obtaining pH and concentration context.

---

### Endpoint: Get Latest PRO Assessment

- Method: GET
- Path: /api/pro/assessment/latest
- Purpose: Fetch latest persisted PRO assessment for current user
- Authentication required: Yes

Success response (200):

- Same schema as POST /api/pro/assessment response

Example error response (404):

```json
{
  "detail": "No PRO assessment found for this user"
}
```

Frontend usage context:

- Dashboard recap and details screen hydration.

---

## 6.6 Module: HISTORY

### Endpoint: Get User History

- Method: GET
- Path: /api/history
- Purpose: Retrieve user-specific activity history (newest first)
- Authentication required: Yes

Query parameters:

- limit (optional): integer between 1 and 100

Request headers:

- Authorization: Bearer <token>

Success response (200):

```json
{
  "user_email": "john.doe@example.com",
  "entries": [
    {
      "entry_type": "pro_assessment",
      "title": "ZMEN PRO Analysis",
      "result": "Normal",
      "result_badge": "normal",
      "created_at": "2026-04-27T09:30:11.010203"
    },
    {
      "entry_type": "uro_strip_scan",
      "title": "ZMEN URO Strip Scan",
      "result": "Mild Risk (48.3%)",
      "result_badge": "mild",
      "created_at": "2026-04-27T09:27:41.112233"
    }
  ],
  "total_entries": 2
}
```

If no history exists, backend returns empty list:

```json
{
  "user_email": "john.doe@example.com",
  "entries": [],
  "total_entries": 0
}
```

Frontend usage context:

- History timeline screen and dashboard activity feed.

---

## 6.7 Module: CARE CONTENT

Status in current backend:

- No care-content routes are currently implemented.
- No endpoints for educational content, recommendation feed, or care plans were found.

If frontend requires CARE content, implementation is pending and should be scoped as a new module.

---

## 6.8 Module: AI Integration (Internal)

These are internal service-to-service calls from backend to AI server, not public client-facing endpoints.

Internal calls made by ai_client.py:

- POST {AI_SERVER_URL}/zmen-uro/scan-strip/
- POST {AI_SERVER_URL}/zmen-pro/detect-ph/
- POST {AI_SERVER_URL}/zmen-pro/sperm-count/
- POST {AI_SERVER_URL}/zmen-pro/predict/

Usage context:

- Frontend never calls these directly.
- Frontend always calls backend routes, backend acts as orchestrator/proxy/scoring layer.

---

## 6.9 Additional Implemented Endpoint

### Endpoint: Health/Welcome Root

- Method: GET
- Path: /
- Purpose: basic server welcome message
- Authentication required: No

Success response:

```json
{
  "message": "Welcome to ZMEN Backend"
}
```

---

## 6.10 Endpoint Compatibility Map (Requested vs Implemented)

Requested examples vs actual implementation in this codebase:

- POST /auth/register -> implemented as POST /api/auth/signup
- POST /auth/login -> implemented as POST /api/auth/login
- GET /user/profile -> not implemented
- PUT /user/profile -> not implemented
- POST /uro/test -> closest implemented: POST /api/uro/assessment and POST /api/uro/strip-scan
- POST /pro/test -> closest implemented: POST /api/pro/assessment
- GET /history -> implemented as GET /api/history
- GET /history/:id -> not implemented
- POST /analysis/uro-result -> not implemented as public route (internally handled through /api/uro routes)
- POST /analysis/pro-result -> not implemented as public route (internally handled through /api/pro routes)

---

## 7. Error Handling Standards

## 7.1 Current Behavior (As Implemented)

- Business and integration errors are raised as HTTPException with explicit status + detail.
- Validation failures rely on FastAPI/Pydantic (422 response).
- Upstream AI failures are translated in URO/PRO routers as:
  - 503 for connect errors
  - 502 for non-2xx upstream status
  - 500 for unexpected processing errors

### 7.2 Typical Status Codes in This API

- 200 OK
- 201 Created
- 400 Bad Request
- 401 Unauthorized
- 404 Not Found
- 413 Request Entity Too Large
- 422 Unprocessable Entity
- 500 Internal Server Error
- 502 Bad Gateway
- 503 Service Unavailable

### 7.3 Recommended Standardized Envelope (Future Improvement)

A consistent envelope requested by many frontend teams is not currently active. Suggested pattern:

```json
{
  "success": false,
  "message": "Validation failed",
  "error_code": "VALIDATION_ERROR",
  "errors": [{ "field": "answers.blood", "message": "Field required" }]
}
```

---

## 8. Frontend Integration Guide (React Native + React Web)

This section explains real-world end-to-end UI flow for both mobile and web clients.

## 8.1 Shared API Client Guidelines

- Set base URL in environment config.
- Attach bearer token automatically after login.
- Use multipart FormData for file uploads.
- Handle 401 by redirecting to login and clearing stale token.
- Retry transient 502/503 errors with capped exponential backoff.

### 8.1.1 Axios Setup Example (TypeScript)

```ts
import axios from "axios";

export const api = axios.create({
  baseURL: process.env.ZMEN_API_BASE_URL,
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### 8.1.2 Fetch Login Example

```ts
async function login(email: string, password: string) {
  const body = new URLSearchParams({ username: email, password });

  const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!res.ok) throw await res.json();
  return res.json() as Promise<{ access_token: string; token_type: string }>;
}
```

---

## 8.2 Flow: User Authentication (Mobile and Web)

1. UI action: user submits login form.
2. API call: POST /api/auth/login (form-urlencoded).
3. Backend processing:
   - validate credentials
   - issue JWT
4. DB interaction: read users collection.
5. Response: access_token returned.
6. UI rendering:
   - persist token
   - navigate to authenticated home/dashboard

Failure handling:

- 401 -> show invalid credentials message
- network error -> show retry message

---

## 8.3 Flow: ZMEN URO Questionnaire Submission

1. UI action: user completes URO symptom form and taps Submit.
2. API call: POST /api/uro/assessment.
3. Backend processing:
   - validate all required question IDs
   - compute weighted score and risk flags
4. DB storage:
   - write to uro_assessments
   - prepend history entry in user_history
5. Response:
   - scored assessment payload
6. UI rendering:
   - show risk label, score, and explanation

Mobile-specific note:

- Cache latest response for offline detail replay when network drops after submit confirmation.

Web-specific note:

- Preserve form state draft in local storage before submission.

---

## 8.4 Flow: ZMEN URO Strip Upload and Analysis

1. UI action: user captures/selects strip image.
2. API call: POST /api/uro/strip-scan (multipart).
3. Backend processing:
   - validate MIME and file size
   - send image to AI strip endpoint
   - map AI output to severity table
   - compute weighted strip score and clinical flags
4. DB storage:
   - write to uro_strip_scans
   - append history event
5. Response:
   - strip risk payload
6. UI rendering:
   - show abnormalities, flags, and risk tier

Then (recommended):

7. UI call GET /api/uro/combined to display consolidated risk card.

---

## 8.5 Flow: ZMEN PRO Full Journey

Step A: pH scan

1. UI action: capture pH strip image.
2. API call: POST /api/pro/ph-scan.
3. Backend:
   - forwards image to AI pH endpoint
   - classifies pH status
4. UI shows pH result.

Step B: sperm count scan

1. UI action: upload microscope image.
2. API call: POST /api/pro/sperm-count.
3. Backend:
   - forwards image to AI sperm-count endpoint
   - derives total count and estimated motility
4. UI shows concentration and inferred status.

Step C: final assessment

1. UI action: user confirms viscosity label and submits.
2. API call: POST /api/pro/assessment with ph_level + sperm_concentration + viscosity.
3. Backend:
   - maps viscosity label to float
   - calls AI predict classification
   - builds WHO-referenced metrics
4. DB storage:
   - write to pro_assessments
   - prepend history entry
5. UI rendering:
   - show final Normal/Abnormal + metric cards

---

## 8.6 Flow: History Screen

1. UI action: user opens History tab.
2. API call: GET /api/history?limit=20
3. Backend:
   - reads user_history document and slices entries if requested
4. Response:
   - ordered entries, newest first
5. UI rendering:
   - timeline list grouped by date and feature type

---

## 8.7 Frontend API Snippets by Use Case

### Signup

```ts
await api.post("/api/auth/signup", {
  email: "john.doe@example.com",
  password: "StrongPassword@123",
});
```

### Submit URO assessment

```ts
await api.post("/api/uro/assessment", {
  answers: {
    freq: "sometimes",
    stream: "slightly_weak",
    night: "two_to_three",
    pain: "mild_discomfort",
    blood: "never",
    family: "no_known_history",
  },
});
```

### Upload URO strip

```ts
const form = new FormData();
form.append("file", imageFile);
await api.post("/api/uro/strip-scan", form, {
  headers: { "Content-Type": "multipart/form-data" },
});
```

### Submit PRO assessment

```ts
await api.post("/api/pro/assessment", {
  ph_level: "7",
  sperm_concentration: "61",
  viscosity_label: "Normal",
  viscosity_custom_value: null,
});
```

### Fetch history

```ts
const { data } = await api.get("/api/history", { params: { limit: 20 } });
```

---

## 9. Security Considerations

## 9.1 Implemented Security Controls

- Password hashing with bcrypt
- JWT-based route protection for non-auth modules
- Basic file-content-type and file-size checks on image endpoints
- Upstream AI failure isolation through controlled error mapping

## 9.2 Security Gaps and Production Hardening Recommendations

- CORS currently allows all origins with credentials enabled.
  - Restrict allow_origins to approved domains in production.
- No refresh token implementation.
  - Add refresh/access token split with rotation and revocation strategy.
- No explicit rate limiting at API layer.
  - Add IP/user-based throttling for auth and file-upload endpoints.
- No explicit account lockout policy for repeated failed logins.
- Input validation is schema-based but no explicit anti-abuse payload anomaly checks.
- SECRET_KEY default fallback is development-grade.
  - Enforce strong environment-provided secret in production.
- No explicit PII retention policy documented in code.
  - Define retention and deletion lifecycle for medical-sensitive artifacts.

## 9.3 Privacy and Data Protection Notes

- Sensitive health-related outcomes are stored in MongoDB by user_email linkage.
- Consider encryption at rest, encrypted backups, and strict access-control for database/admin tooling.
- Ensure TLS is enforced in all environments for client-backend and backend-AI communication.

---

## 10. Operational Notes and Recommended Enhancements

### 10.1 Missing Modules Referenced by Product Requirement

Not implemented in current backend:

- User profile endpoints
- Care content endpoints
- Public analysis endpoints (/analysis/\*)
- History-by-id endpoint

### 10.2 Suggested Next API Additions for Frontend Completeness

- GET /api/user/profile
- PUT /api/user/profile
- GET /api/history/{entry_id}
- GET /api/care/content
- Standardized error response middleware
- Healthcheck endpoint with dependency probes (DB + AI)

### 10.3 Indexing Recommendations

- users.email unique index
- uro_assessments: index on user_email + created_at desc
- uro_strip_scans: index on user_email + created_at desc
- pro_assessments: index on user_email + created_at desc
- user_history.user_email unique index

---

## 11. Quick Onboarding Checklist for New Developers

1. Configure .env values (MongoDB, secret, AI server URL).
2. Start API with run.py.
3. Verify root endpoint and auth signup/login.
4. Acquire token and validate protected endpoint access.
5. Test URO and PRO flows end-to-end with sample images.
6. Confirm history writes after each assessment.
7. Validate frontend integration against exact implemented routes under /api.

---

## 12. Appendix: Scoring Logic Summary

### 12.1 URO Form Risk

- Weighted questionnaire score with 6 symptom dimensions
- Base risk buckets: Low / Medium / High
- Additional flag-based bump logic for severe clinical indicators

### 12.2 URO Strip Risk

- AI value-to-severity mapping per reagent parameter
- Clinical parameter weights (sum to 1.0)
- Four-tier risk: Low / Mild / Moderate / High

### 12.3 Combined URO

- Combined score formula:

  combined = assessment _ 0.60 + strip _ 0.40

- If strip missing, assessment-only score is used (100% weight)

### 12.4 PRO Assessment

- Inputs: pH + sperm concentration + viscosity
- AI predicts final Normal/Abnormal class
- Backend computes WHO-referenced metric statuses

---

## 13. Final Source-of-Truth Statement

This document reflects the current, implemented backend behavior from the analyzed codebase. Where requested product endpoints are not yet present, those gaps are explicitly marked. Frontend teams should integrate against the implemented /api routes listed in this document and treat this file as the canonical backend integration reference until further backend modules are introduced.
