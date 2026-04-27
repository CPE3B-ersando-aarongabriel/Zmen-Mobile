# ZMEN AI Server: Full System Documentation

## 1. System Overview

The ZMEN AI Server is a dedicated medical-image and clinical-feature inference service that powers two major product flows in the ZMEN ecosystem:

- ZMEN URO flow (urine strip analysis)
- ZMEN PRO flow (male fertility/prostate-support analysis)

The AI server is responsible for ingesting medical test inputs, running specialized AI and algorithmic pipelines, and returning structured outputs consumed by backend core services and frontend applications (React Native mobile app and web UI).

Core responsibilities include:

- Urine strip image analysis (10-pad colorimetric interpretation)
- Semen microscopy image analysis for sperm count estimation
- Litmus-strip style pH interpretation from banded images
- Rule-based abnormality flagging for urine screening
- Clinical risk-oriented classification support (BPH vs Normal) using a trained ONNX model
- Producing machine-readable outputs that upstream systems can persist, audit, and present

Important architecture note:

- The current implementation exposes native AI-server routes under `/zmen-uro/*` and `/zmen-pro/*`.
- Product-facing paths such as `/ai/uro/analyze` and `/ai/pro/analyze` are typically implemented at the Backend Core API layer as stable aliases/wrappers that forward to these native AI endpoints.

This document is the authoritative technical guide for understanding implementation details, integration mechanics, and production operation.

---

## 2. Runtime and Service Topology

### 2.1 Execution Context

- Framework: FastAPI
- Server: Uvicorn
- Language: Python
- Startup model loading: eager (module-level service instantiation in routes)
- Optional tunnel: ngrok lifecycle hook

### 2.2 High-Level Topology

```text
React Native App / Web UI
        |
        v
Backend Core Server (auth, user context, persistence, orchestration)
        |
        v
ZMEN AI Server (this repository)
   |         |          |
   |         |          +-- ONNX Runtime model: random_forest_huawei.onnx
   |         +------------- TFLite model: sperm_detect_version1.tflite
   +----------------------- OpenCV/NumPy/Scipy algorithmic pipelines
```

### 2.3 Internal Request Lifecycle

```text
HTTP request
  -> FastAPI route parsing
  -> file/body validation
  -> service-level preprocessing
  -> model or rule-based inference
  -> post-processing and interpretation
  -> JSON response formatting
```

---

## 3. AI Architecture and Pipeline Design

The AI server uses a hybrid architecture combining:

- Classical image processing pipelines (OpenCV + color-space analysis)
- Statistical heuristics (mode-based hue extraction)
- Deep learning inference (TFLite object-detection model)
- Classical ML classifier inference (ONNX Random Forest)

This is not a single monolithic neural network. It is a composable multi-engine inference system where each engine is optimized for a specific biomedical sub-task.

### 3.1 URO Pipeline (Urine Strip)

Pipeline type: deterministic computer vision + color matching + rule-based medical flagging.

Stages:

1. Decode uploaded image bytes.
2. Detect strip ROI via contour/aspect heuristics.
3. Segment 10 reagent pads.
4. Extract robust pad color (median of central region with HSV mask).
5. Convert RGB to CIELAB and match nearest reference color level for each analyte.
6. Compute per-pad confidence from color distance.
7. Build abnormal parameter list and high-level pattern flags.
8. Return per-parameter result objects + summary object.

### 3.2 PRO pH Pipeline

Pipeline type: deterministic color-band interpretation.

Stages:

1. Decode uploaded image.
2. Convert BGR to RGB.
3. Resize to fixed 60x200 frame.
4. Convert RGB to HSV.
5. Split image into 4 horizontal bands.
6. Compute dominant hue in each band (`scipy.stats.mode`).
7. Use threshold-based decision logic to identify pH class.
8. Return band signature + interpreted pH value (or Unknown fallback).

### 3.3 PRO Sperm Count Pipeline

Pipeline type: deep-learning object detection with post-hoc concentration formula.

Stages:

1. Decode uploaded microscopy image.
2. Convert BGR to RGB.
3. Resize to TFLite input shape.
4. Run inference through TFLite interpreter.
5. Read detection count tensor and score tensor.
6. Count valid detections above confidence threshold (default 0.3).
7. Convert detections to concentration estimate using fixed domain formula.
8. Return concentration (string in API response).

### 3.4 PRO Risk Classification Pipeline

Pipeline type: classical ML tabular classification (ONNX Random Forest).

Input features:

- sperm_concentration
- viscosity
- ph_level

Stages:

1. Parse strings to float.
2. Build float32 array shape `(1, 3)`.
3. Run ONNX Runtime session.
4. Convert output label to domain class:
   - 0 -> Normal
   - 1 -> BPH

---

## 4. Codebase Structure (Detailed)

### 4.1 Root Files

- `main.py`: uvicorn startup entrypoint.
- `run.py`: duplicate startup entrypoint behavior.
- `requirements.txt`: runtime dependencies.
- `.env.example`: environment variable template.
- `random_forest_huawei.onnx`: ONNX classifier artifact.
- `sperm_detect_version1.tflite`: TFLite detector artifact.

### 4.2 App Package

- `app/main.py`
  - Creates FastAPI app.
  - Loads dotenv.
  - Registers routes and middleware.
  - Attaches lifespan context.

- `app/lifecycle.py`
  - Optional ngrok tunnel startup/teardown.
  - Uses `ENABLE_NGROK`, `NGROK_AUTH_TOKEN`, `NGROK_DOMAIN`.

- `app/core/settings.py`
  - Centralized settings dataclass.
  - Loads environment variables.
  - Resolves model paths.
  - Caches settings via `lru_cache`.

- `app/core/config.py`
  - Configures CORS and trusted-host middleware.

- `app/routes/zmen_uro.py`
  - URO route definitions.
  - Delegates to `UroStripService`.

- `app/routes/zmen_pro.py`
  - PRO route definitions.
  - Delegates to pH service, sperm detector service, and ONNX classifier service.

- `app/schemas/predict.py`
  - Pydantic request schema for classifier endpoint.

- `app/services/uro_strip_service.py`
  - Complete urine-strip analysis engine.
  - Contains reference chart definitions and confidence heuristics.

- `app/services/ph_service.py`
  - Litmus paper pH interpretation engine.

- `app/services/sperm_service.py`
  - TFLite detector wrapper and concentration computation.

- `app/services/classifier_service.py`
  - ONNX classifier wrapper.

No dedicated controllers/utils folders are currently present; route files directly orchestrate service calls.

---

## 5. End-to-End Processing Flows

## 5.1 Global Request Flow

```text
API Request
  -> Route Handler
  -> Input Validation (file empty check / numeric coercion)
  -> Service Preprocessing
  -> Inference Engine (CV / TFLite / ONNX)
  -> Domain Post-processing
  -> Response JSON
```

## 5.2 ZMEN URO End-to-End

```text
upload strip image
  -> /zmen-uro/scan-strip/
  -> decode image
  -> detect strip area
  -> segment 10 pads
  -> per-pad color extraction
  -> nearest reference-level match
  -> normal/abnormal decision per parameter
  -> summary abnormal count + pattern flags
  -> response to backend
  -> backend stores record and returns frontend-ready payload
```

## 5.3 ZMEN PRO End-to-End (Composed)

```text
Step 1: pH image -> /zmen-pro/detect-ph/
Step 2: semen image -> /zmen-pro/sperm-count/
Step 3: viscosity input + previous outputs -> /zmen-pro/predict/
Step 4: backend aggregates into one clinical result object
Step 5: frontend renders summary + interpretation
```

---

## 6. API Endpoint Documentation (Implemented Server Routes)

Base URL examples:

- Local: `http://127.0.0.1:8000`
- Via ngrok: runtime-generated URL when enabled

### 6.1 POST /zmen-uro/scan-strip/

Method: POST  
Route: `/zmen-uro/scan-strip/`  
Purpose: Analyze urine strip image and produce 10-parameter interpretation with confidence and flags.

Content type:

- `multipart/form-data`
- file field: `file`

Input requirements:

- Non-empty image file bytes
- Image should contain a visible vertical strip with all 10 reagent pads

Preprocessing details:

- OpenCV decode
- Grayscale + blur + Canny edge extraction
- Contour selection by area and aspect ratio
- ROI fallback crop when contour confidence is low
- Morphological mask segmentation and projection fallback

Model logic:

- Rule-based nearest-color matching in LAB space against built-in reference chart
- No CNN in this endpoint

Output structure (actual):

```json
{
  "filename": "uro_strip.jpg",
  "results": [
    {
      "parameter": "Leukocytes",
      "value": "Neg",
      "unit": "cells/uL",
      "is_normal": true,
      "detected_color": {
        "rgb": [236, 236, 208],
        "hex": "#ECECD0"
      },
      "matched_chart_color": {
        "rgb": [236, 236, 208],
        "hex": "#ECECD0"
      },
      "match_confidence": 0.93
    }
  ],
  "summary": {
    "abnormal_count": 2,
    "abnormal_parameters": ["Nitrite", "Leukocytes"],
    "flags": ["UTI-like pattern flag"],
    "disclaimer": "Screening support only. Not a diagnosis. Confirm with clinical evaluation."
  }
}
```

Error responses:

- `400`: `{"detail": "Uploaded file is empty"}`
- `400`: `{"detail": "Invalid image file"}`
- `400`: `{"detail": "Unable to confidently detect all 10 strip pads"}`

---

### 6.2 POST /zmen-pro/detect-ph/

Method: POST  
Route: `/zmen-pro/detect-ph/`  
Purpose: Estimate pH from litmus-like band image.

Content type:

- `multipart/form-data`
- file field: `file`

Input requirements:

- Non-empty image bytes
- Clear 4-band visual structure

Preprocessing details:

- Decode -> RGB conversion -> resize to 60x200 -> HSV conversion
- Per-band hue mode extraction

Inference logic:

- Deterministic threshold tree over hue features (`band1..band4`)
- Returns integer-like pH label string or Unknown message

Output structure (actual):

```json
{
  "filename": "ph_strip.jpg",
  "Bands": [21.0, 19.0, 97.0, 12.0],
  "pH_level": "6"
}
```

Error responses:

- `400`: `{"detail": "Uploaded file is empty"}`
- `400`: `{"detail": "Invalid image file"}`

---

### 6.3 POST /zmen-pro/sperm-count/

Method: POST  
Route: `/zmen-pro/sperm-count/`  
Purpose: Detect sperm objects and return concentration estimate.

Content type:

- `multipart/form-data`
- file field: `file`

Input requirements:

- Non-empty microscopy image bytes

Preprocessing details:

- Decode BGR image
- Convert to RGB
- Resize to model input tensor shape
- Expand batch dimension and cast to uint8

Model logic:

- TFLite object detector inference
- Reads `num_detections` and per-box `scores`
- Counts valid detections above threshold 0.3
- Converts detection count to concentration via formula in service code

Output structure (actual):

```json
{
  "concentration": "34"
}
```

Error responses:

- `400`: `{"detail": "Uploaded file is empty"}`
- `400`: `{"detail": "Invalid image file"}`

---

### 6.4 POST /zmen-pro/predict/

Method: POST  
Route: `/zmen-pro/predict/`  
Purpose: Classify risk-support label from concentration, viscosity, and pH.

Content type:

- `application/json`

Input schema:

```json
{
  "sperm_concentration": "34",
  "viscosity": "1.2",
  "ph_level": "7"
}
```

Preprocessing details:

- String-to-float coercion
- Input tensor assembly `[sperm_concentration, viscosity, ph_level]`

Model logic:

- ONNX Runtime inference against Random Forest model
- Label conversion: 0 -> Normal, 1 -> BPH

Output structure (actual):

```json
{
  "classification_result": "Normal"
}
```

Error responses:

- `400`: `{"detail": "Invalid input: All values must be numeric strings."}`

---

## 7. Integration Endpoint Map (Backend-Facing Contract)

The user-facing product spec often expects the following routes:

- `POST /ai/uro/analyze`
- `POST /ai/pro/analyze`
- `POST /ai/uro/image-upload`
- `POST /ai/pro/image-upload`

These routes are not natively implemented in this AI server codebase. They should be exposed by Backend Core as orchestration aliases.

### 7.1 Recommended Mapping Table

| Integration Route | Backend Action | AI Server Route(s) |
|---|---|---|
| `POST /ai/uro/image-upload` | Accept file/base64, validate, store temp, forward bytes | `POST /zmen-uro/scan-strip/` |
| `POST /ai/uro/analyze` | Return normalized medical summary envelope | `POST /zmen-uro/scan-strip/` |
| `POST /ai/pro/image-upload` | Accept semen/pH images and metadata | `POST /zmen-pro/detect-ph/`, `POST /zmen-pro/sperm-count/` |
| `POST /ai/pro/analyze` | Aggregate pH + sperm + viscosity and classify | `POST /zmen-pro/predict/` (+ previous step outputs) |

### 7.2 Suggested Backend Composite Output for /ai/pro/analyze

```json
{
  "request_id": "2f5a4f66-f40b-4630-9a55-2c5781f67c99",
  "flow": "ZMEN_PRO",
  "status": "success",
  "result": {
    "sperm_concentration": 34,
    "motility": null,
    "viscosity": 1.2,
    "ph_level": 7.0,
    "classification": "Normal",
    "risk_level": "LOW",
    "confidence": null,
    "interpretation": "Model predicts low risk pattern based on provided features."
  },
  "errors": []
}
```

Note:

- `motility` and `viscosity evaluation from image` are not computed by the current AI server implementation.
- Viscosity must currently be provided externally as numeric input.

---

## 8. AI Models and Inference Behavior

### 8.1 Model Inventory

1. `sperm_detect_version1.tflite`
   - Type: deep learning object-detection model (CNN-based detector family style output tensors)
   - Runtime: TensorFlow Lite interpreter
   - Task: sperm object detection for concentration estimation

2. `random_forest_huawei.onnx`
   - Type: classical ML model exported to ONNX (Random Forest classifier)
   - Runtime: ONNX Runtime
   - Task: binary classification (`Normal` vs `BPH`)

3. URO strip and pH engines
   - Type: algorithmic/rule-based CV pipelines
   - Runtime: OpenCV + NumPy + SciPy
   - Task: colorimetric interpretation and threshold decisioning

### 8.2 Preprocessing Summary by Engine

- URO strip:
  - decode, ROI crop, pad segmentation, center-region robust color extraction, LAB transform
- pH:
  - fixed resize, HSV decomposition, mode extraction
- sperm count:
  - color conversion + resize to model input, uint8 tensor format
- classifier:
  - feature vector numeric coercion to float32

### 8.3 Post-Processing and Interpretation

- URO:
  - confidence per parameter from LAB distance normalization
  - abnormal parameter list + pattern flags
- pH:
  - human-readable pH class (or unknown fallback)
- sperm count:
  - concentration integer from domain scaling formula
- classifier:
  - textual class mapping for downstream UI/logic

### 8.4 Risk Labeling Guidance for Product Teams

Current AI server behavior:

- Returns class labels (`Normal`, `BPH`) and strip abnormality flags.
- Does not directly output standardized `LOW/MEDIUM/HIGH` risk tiers.

Recommended backend risk normalization:

- URO:
  - LOW: `abnormal_count == 0`
  - MEDIUM: `abnormal_count in [1,2]` or non-critical flags
  - HIGH: `abnormal_count >= 3` or specific flag combinations
- PRO:
  - LOW: classifier `Normal`
  - HIGH: classifier `BPH`
  - MEDIUM: optional intermediary policy if confidence/secondary models are introduced

---

## 9. Response Schema Standardization

To unify mobile/web/backend contracts, use a normalized envelope wrapping raw AI results.

### 9.1 Recommended Standard Envelope

```json
{
  "request_id": "uuid",
  "timestamp": "2026-04-27T12:34:56Z",
  "flow": "ZMEN_URO | ZMEN_PRO",
  "status": "success | partial_success | failed",
  "risk_level": "LOW | MEDIUM | HIGH | UNKNOWN",
  "confidence": 0.0,
  "result": {},
  "interpretation": "Clinical-support text",
  "model_metadata": {
    "model_name": "string",
    "model_version": "string",
    "inference_time_ms": 0,
    "thresholds": {}
  },
  "errors": []
}
```

### 9.2 Mapping from Native AI Responses

- `/zmen-uro/scan-strip/` -> map `summary.flags`, `abnormal_count`, mean `match_confidence`
- `/zmen-pro/detect-ph/` -> map `pH_level` and `Bands`
- `/zmen-pro/sperm-count/` -> map `concentration`
- `/zmen-pro/predict/` -> map `classification_result`

---

## 10. Frontend Integration Guide

## 10.1 ZMEN URO Flow (Mobile and Web)

Step-by-step operational flow:

1. User captures/uploads urine strip image in React Native or web UI.
2. Frontend sends file to Backend Core endpoint (recommended: `/ai/uro/image-upload`).
3. Backend validates mime/size, optionally compresses, forwards multipart file to AI server `/zmen-uro/scan-strip/`.
4. AI server returns parameter-level interpretation + summary flags.
5. Backend stores full payload in medical history.
6. Backend transforms to frontend-safe schema with risk tier and interpretation.
7. Frontend renders result screen with parameter cards, abnormal markers, and disclaimer.

### 10.1.1 Axios example (frontend -> backend)

```ts
import axios from "axios";

export async function analyzeUroImage(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await axios.post("/ai/uro/analyze", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });

  return data;
}
```

### 10.1.2 Backend forwarding example (Node/TypeScript)

```ts
import axios from "axios";
import FormData from "form-data";

export async function forwardUroToAiServer(fileBuffer: Buffer, filename: string) {
  const form = new FormData();
  form.append("file", fileBuffer, filename);

  const response = await axios.post(
    "http://127.0.0.1:8000/zmen-uro/scan-strip/",
    form,
    { headers: form.getHeaders() }
  );

  return response.data;
}
```

## 10.2 ZMEN PRO Full Pipeline (Mobile and Web)

Step-by-step operational flow:

1. User provides pH strip image.
2. Frontend sends pH image to backend.
3. Backend forwards to `/zmen-pro/detect-ph/`.
4. User provides semen microscopy image.
5. Backend forwards to `/zmen-pro/sperm-count/`.
6. User provides viscosity value (manual/device entry).
7. Backend calls `/zmen-pro/predict/` using concentration + pH + viscosity.
8. Backend aggregates all outputs into a single report object.
9. Frontend renders detailed report, class label, and risk explanation.

### 10.2.1 Backend orchestrator pseudo-flow

```ts
const phResult = await ai.detectPh(phImage);
const spermResult = await ai.spermCount(semenImage);

const classifierResult = await ai.predict({
  sperm_concentration: String(spermResult.concentration),
  viscosity: String(viscosityInput),
  ph_level: String(phResult.pH_level)
});

return buildCompositeProResult(phResult, spermResult, classifierResult);
```

### 10.2.2 Fetch example using base64 payload to backend

The AI server expects multipart files; base64 should be decoded by backend and forwarded as multipart.

```ts
async function sendBase64ToBackend(base64Image: string) {
  const response = await fetch("/ai/pro/image-upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      image_base64: base64Image,
      image_type: "semen"
    })
  });

  if (!response.ok) {
    throw new Error("Upload failed");
  }

  return response.json();
}
```

### 10.2.3 React Native image upload example

```ts
import axios from "axios";

export async function uploadFromReactNative(uri: string, name = "capture.jpg") {
  const formData = new FormData();
  formData.append("file", {
    uri,
    name,
    type: "image/jpeg"
  } as any);

  const { data } = await axios.post("/ai/pro/analyze", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });

  return data;
}
```

---

## 11. Error Handling and Fallback Strategy

### 11.1 Current Error Behaviors in AI Server

- Empty file uploads -> HTTP 400
- Image decode failures -> HTTP 400
- Invalid numeric coercion for classifier -> HTTP 400
- URO pad segmentation failure -> HTTP 400

### 11.2 Recommended Backend-Side Error Standardization

Normalize AI errors to a stable envelope:

```json
{
  "status": "failed",
  "error_code": "AI_PREPROCESSING_FAILED",
  "message": "Unable to confidently detect all strip pads",
  "action": "Retake photo with better lighting and full strip visibility"
}
```

### 11.3 Low Confidence and Quality Gate Policy

Recommended policy layer (backend):

- For URO: if mean `match_confidence < 0.60`, flag as low confidence and request recapture.
- For sperm count: if `valid_detections` is very low relative to `num_detections`, mark uncertain quality.
- For pH: if returned text contains `Unknown`, trigger manual confirmation workflow.

### 11.4 Frontend Fallback UX

- Show actionable recapture instructions (lighting, focus, alignment).
- Preserve failed attempt in history for audit.
- Allow clinician/manual override where medically necessary.

---

## 12. Performance and Scalability Considerations

### 12.1 Inference Time Optimization

- Warm model sessions at startup (already effectively done via module-level instantiation).
- Keep image resolution constrained before inference.
- Avoid repeated object construction per request.

### 12.2 Throughput and Concurrency

- FastAPI async routes are used, but heavy CV/model operations are CPU-bound.
- For higher load:
  - run multiple Uvicorn workers
  - isolate model-heavy endpoints if needed
  - consider queue-based asynchronous inference for burst traffic

### 12.3 Caching Strategy

Potential backend caches:

- Hash image payload and reuse result for duplicate submissions.
- Cache short-lived pH/sperm intermediate outputs during multi-step PRO flow.

### 12.4 Batch Processing

Current implementation is single-request inference. If batch mode is required:

- Introduce new batch endpoints
- Add request IDs and per-item status
- Return partial-success arrays for robust processing

### 12.5 Resource Footprint

- TensorFlow/TFLite + OpenCV + ONNXRuntime are memory-intensive.
- Monitor startup and steady-state memory in production.
- Pin CPU affinity if co-locating with other services.

---

## 13. Backend Core Integration Contract

Backend Core should provide:

- Authentication and authorization
- Patient/user identity binding
- Data persistence and audit history
- Stable public API contracts (`/ai/...` aliases)
- Error normalization and clinical interpretation text
- Risk-tier policy mapping

AI Server should provide:

- Deterministic inference execution
- Raw and semi-structured technical outputs
- Minimal validation errors and direct model results

This separation keeps AI service focused, testable, and replaceable while preserving consistent product contracts.

---

## 14. Security and Compliance Notes

- Enforce size/type validation at backend ingress.
- Avoid storing raw medical images longer than required.
- Log request IDs, not sensitive payloads.
- Maintain model version metadata per inference result for traceability.
- Use TLS between backend and AI server in production deployments.

---

## 15. Deployment and Configuration

### 15.1 Environment Variables

Supported variables include:

- `APPLICATION_HOST`
- `PORT`
- `RELOAD`
- `ENABLE_NGROK`
- `NGROK_AUTH_TOKEN`
- `NGROK_DOMAIN`
- `CORS_ALLOW_ORIGINS`
- `CORS_ALLOW_CREDENTIALS`
- `CORS_ALLOW_METHODS`
- `CORS_ALLOW_HEADERS`
- `TRUSTED_HOSTS`

### 15.2 Startup

- Entrypoint: `python main.py` (or `python run.py`)
- Auto docs available via FastAPI standard docs paths when running:
  - `/docs`
  - `/redoc`

---

## 16. Testing and Observability Recommendations

### 16.1 API Testing

- Golden-image tests for URO and pH
- Threshold-edge tests for pH hue decision boundaries
- Numeric coercion tests for classifier endpoint
- Empty/invalid upload negative tests

### 16.2 Model Drift and Validation

- Track confidence distributions over time
- Revalidate against labeled datasets periodically
- Store model artifact checksums in release metadata

### 16.3 Logging

- Log request ID, endpoint, latency, and major inference signals
- Avoid logging full image payloads

---

## 17. Current Capability vs Product Expectation Matrix

| Capability | Current AI Server | Product Expectation | Integration Action |
|---|---|---|---|
| URO strip analysis | Implemented | Implemented | Expose as `/ai/uro/analyze` via backend alias |
| URO image upload endpoint | Not native | Expected | Implement at backend, forward to AI |
| PRO pH analysis | Implemented | Implemented | Keep as internal stage |
| PRO sperm count | Implemented | Implemented | Keep as internal stage |
| PRO final classify | Implemented (`Normal`/`BPH`) | Risk tiers + interpretation | Add backend mapping policy |
| Motility classification | Not implemented | Desired | Add new model/service |
| Viscosity from image | Not implemented | Desired | Add CV/ML module or external input |
| Confidence score in all outputs | Partial (URO only) | Desired | Backend standardization + model updates |

---

## 18. Authoritative Integration Summary

The ZMEN AI Server is a production-ready inference microservice built around a hybrid AI stack:

- deterministic CV for strip chemistry
- TFLite object detection for sperm quantification
- ONNX classical ML for final PRO classification support

Its native API is clean and operational, but product-level endpoint contracts (`/ai/uro/analyze`, `/ai/pro/analyze`, upload aliases, and unified risk envelope) should be implemented in Backend Core as orchestration and normalization layers.

When integrated with this contract, mobile and web clients can rely on a stable, high-quality medical-AI interface while the AI server remains focused on inference correctness, speed, and maintainability.
