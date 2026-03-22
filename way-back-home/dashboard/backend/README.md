# Way Back Home - Mission Control API

**Backend service for the Way Back Home workshop platform.**

Handles event management, participant registration, avatar storage, and location confirmation.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Backend Architecture                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   Cloud Run                                                 │
│   ─────────                                                 │
│   ┌─────────────────────────────────────────────────────┐   │
│   │              FastAPI Application                    │   │
│   │                                                     │   │
│   │  /events/*          - Event management (public)     │   │
│   │  /participants/*    - Participant registration      │   │
│   │  /admin/*           - Admin (Firebase Auth)         │   │
│   │  /config            - Client configuration          │   │
│   └─────────────────────────────────────────────────────┘   │
│              │                        │                     │
│              ▼                        ▼                     │
│   ┌─────────────────┐     ┌─────────────────────┐           │
│   │    Firestore    │     │  Firebase Storage   │           │
│   │                 │     │                     │           │
│   │  • events       │     │  • avatars/         │           │
│   │  • participants │     │    portraits, icons │           │
│   │  • admins       │     │  • evidence/        │           │
│   └─────────────────┘     └─────────────────────┘           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- Google Cloud SDK (`gcloud`)
- Google Cloud project with Firebase enabled

### Local Development

```bash
cd dashboard/backend

# Authenticate with Google Cloud
gcloud auth application-default login
gcloud config set project YOUR_PROJECT_ID

# Configure environment
cp .env.template .env
# Edit .env with your values

# Run the development server
../../scripts/run-backend.sh
```

**Access the API:**
- API: http://localhost:8080
- Docs: http://localhost:8080/docs
- Health: http://localhost:8080/health

## 📡 API Endpoints

### Public Endpoints

#### Health & Configuration

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Health check |
| `GET` | `/health` | Health check |
| `GET` | `/config` | Get client configuration (URLs) |

#### Events

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/events/{code}` | Get event info by code |
| `GET` | `/events/{code}/check-username/{username}` | Check username availability |
| `GET` | `/events/{code}/participants` | List participants (for map) |

#### Participants

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/participants/{id}` | Get participant by ID |
| `POST` | `/participants/init` | Initialize participant (reserve username) |
| `POST` | `/participants/{id}/avatar` | Upload avatar images |
| `POST` | `/participants/{id}/evidence` | Upload crash site evidence |
| `POST` | `/participants/register` | Complete registration |
| `PATCH` | `/participants/{id}` | Update details (level overrides) |
| `PATCH` | `/participants/{id}/location` | Confirm location (Level 1) |

### Admin Endpoints (Firebase Auth Protected)

Require `Authorization: Bearer {FIREBASE_ID_TOKEN}` header.
User's email must exist in the `admins` Firestore collection.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/admin/events` | Create new event |
| `GET` | `/admin/events` | List all events |
| `DELETE` | `/admin/events/{code}` | Deactivate event |

## 🔐 Admin Setup

### 1. Add Admin Users to Firestore

In the [Firebase Console](https://console.firebase.google.com), create documents in the `admins` collection:

```
admins/
  your-email@google.com/
    { added_at: "2025-01-15T10:00:00Z" }
```

The document ID must be the user's email address.

### 2. Get a Firebase ID Token

```javascript
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";

const auth = getAuth();
const result = await signInWithPopup(auth, new GoogleAuthProvider());
const idToken = await result.user.getIdToken();
```

### 3. Call Admin Endpoints

```bash
curl -X POST https://api.waybackhome.dev/admin/events \
    -H "Authorization: Bearer YOUR_FIREBASE_ID_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"code": "sandbox", "name": "Way Back Home Sandbox"}'
```

## ⚙️ Environment Configuration

Copy `.env.template` to `.env` and configure:

| Variable | Description | Default |
|----------|-------------|---------|
| `GOOGLE_CLOUD_PROJECT` | GCP project ID | `way-back-home-dev` |
| `FIREBASE_STORAGE_BUCKET` | Storage bucket | `{project}.firebasestorage.app` |
| `API_BASE_URL` | API base URL | `https://api.waybackhome.dev` |
| `MAP_BASE_URL` | Frontend URL | `https://waybackhome.dev` |
| `MAP_WIDTH` | Coordinate width | `100` |
| `MAP_HEIGHT` | Coordinate height | `100` |
| `DEFAULT_MAX_PARTICIPANTS` | Event capacity | `500` |

## 🌐 Deployment

### Cloud Build (Recommended)

```bash
# From project root
gcloud builds submit --config cloudbuild.yaml

# With custom URLs
gcloud builds submit --config cloudbuild.yaml \
  --substitutions=_API_BASE_URL=https://api.yoursite.com,_MAP_BASE_URL=https://yoursite.com
```

### Direct Deploy

```bash
cd dashboard/backend

gcloud run deploy way-back-home-api \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars "GOOGLE_CLOUD_PROJECT=${PROJECT_ID},FIREBASE_STORAGE_BUCKET=${PROJECT_ID}.firebasestorage.app"
```

### Custom Domain

```bash
gcloud run domain-mappings create \
  --service way-back-home-api \
  --domain api.waybackhome.dev \
  --region us-central1
```

## 📊 Data Models

### Event

```json
{
    "code": "devfest-nyc-25",
    "name": "DevFest NYC 2025",
    "description": "Optional description",
    "max_participants": 500,
    "participant_count": 42,
    "created_at": "2025-01-15T10:00:00Z",
    "created_by": "admin@google.com",
    "active": true
}
```

### Participant

```json
{
    "participant_id": "a1b2c3d4",
    "username": "AstroAyo",
    "event_code": "devfest-nyc-25",
    "x": 47,
    "y": 23,
    "location_confirmed": false,
    "portrait_url": "https://storage.googleapis.com/.../portrait.png",
    "icon_url": "https://storage.googleapis.com/.../icon.png",
    "evidence_urls": {
        "soil": "https://storage.googleapis.com/.../soil_sample.png",
        "flora": "https://storage.googleapis.com/.../flora_recording.mp4",
        "stars": "https://storage.googleapis.com/.../star_field.png"
    },
    "suit_color": "deep blue with silver accents",
    "appearance": "short dark hair, glasses",
    "registered_at": "2025-01-15T10:30:00Z",
    "active": true,
    "level_0_complete": true,
    "level_1_complete": false,
    "completion_percentage": 50
}
```

### Participant Level Overrides

The backend supports manual overrides for participant level progression. This is useful for testing or custom workshop flows.

**Override Fields:**
*   `level_X_complete` (bool): If present, overrides the native level completion logic.
*   `completion_percentage` (int): If present, overrides the calculated journey progress (0-100).

**How to Update:**
Use the `PATCH` endpoint to set these fields.

```bash
# Example: Set Level 1 to complete and progress to 50%
curl -X PATCH https://api.waybackhome.dev/participants/{participant_id} \
  -H "Content-Type: application/json" \
  -d '{
    "level_1_complete": true,
    "completion_percentage": 50
  }'
```

## 🔒 Security Model

| User Type | Access |
|-----------|--------|
| **Workshop Attendees** | Public endpoints only (register, upload, confirm) |
| **Admins** | Firebase Auth + email in `admins` collection |
| **Storage** | Backend uses Admin SDK; avatars made public via `make_public()` |

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| "Permission denied" on Firestore | Check ADC: `gcloud auth application-default login` |
| Upload fails | Verify Storage bucket name in `.env` |
| CORS errors | Add frontend origin to `get_cors_origins()` in `config.py` |
| Admin endpoint 403 | Verify email in Firestore `admins` collection |

## 📝 License

Apache 2.0 - See [LICENSE](../../LICENSE) file in the repository root.

---

*Mission Control is standing by.* 📡
