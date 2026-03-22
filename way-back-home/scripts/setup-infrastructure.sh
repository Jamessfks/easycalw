#!/bin/bash
# Way Back Home - Infrastructure Setup Script
# Sets up Firestore, Artifact Registry, IAM roles, and enables required APIs
#
# PREREQUISITE: Firebase must be enabled for your project first!
# Visit: https://console.firebase.google.com/ and add your GCP project

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}🚀 Way Back Home - Infrastructure Setup${NC}"
echo ""

# Get project ID
PROJECT_ID=$(gcloud config get-value project 2>/dev/null)
if [ -z "$PROJECT_ID" ]; then
    echo -e "${RED}✗ No Google Cloud project configured${NC}"
    echo "Run: gcloud config set project YOUR_PROJECT_ID"
    exit 1
fi
echo -e "${GREEN}✓ Using project: ${CYAN}${PROJECT_ID}${NC}"

# Set variables
REGION="us-central1"
AR_REPO="way-back-home"
FIREBASE_BUCKET="${PROJECT_ID}.firebasestorage.app"

# =============================================================================
# Enable Required APIs
# =============================================================================
echo ""
echo -e "${YELLOW}Enabling required APIs...${NC}"
gcloud services enable \
    run.googleapis.com \
    firestore.googleapis.com \
    storage.googleapis.com \
    cloudbuild.googleapis.com \
    artifactregistry.googleapis.com \
    --quiet

echo -e "${GREEN}✓ APIs enabled${NC}"

# =============================================================================
# IAM Role Bindings for Cloud Build
# =============================================================================
echo ""
echo -e "${YELLOW}Configuring IAM roles for Cloud Build...${NC}"

# Get project number (needed for service account emails)
PROJECT_NUMBER=$(gcloud projects describe "${PROJECT_ID}" --format='value(projectNumber)')

# Cloud Build service account
CLOUDBUILD_SA="${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com"

# Default compute service account (used during build steps)
COMPUTE_SA="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

# Firebase Admin SDK service account (used as Cloud Run runtime identity)
FIREBASE_SA="firebase-adminsdk-fbsvc@${PROJECT_ID}.iam.gserviceaccount.com"

echo "  Cloud Build SA: ${CLOUDBUILD_SA}"
echo "  Compute SA:     ${COMPUTE_SA}"
echo "  Firebase SA:    ${FIREBASE_SA}"

# Check if Firebase service account exists
if ! gcloud iam service-accounts describe "${FIREBASE_SA}" --project="${PROJECT_ID}" &>/dev/null; then
    echo -e "${RED}✗ Firebase Admin SDK service account not found.${NC}"
    echo -e "  Please enable Firebase for this project first:"
    echo -e "  ${CYAN}https://console.firebase.google.com/project/${PROJECT_ID}${NC}"
    exit 1
fi

# Grant Cloud Build the ability to push to Artifact Registry
gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
    --member="serviceAccount:${CLOUDBUILD_SA}" \
    --role="roles/artifactregistry.writer" \
    --quiet > /dev/null

# Grant Cloud Build the ability to deploy to Cloud Run
gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
    --member="serviceAccount:${CLOUDBUILD_SA}" \
    --role="roles/run.admin" \
    --quiet > /dev/null

# Grant Compute service account Cloud Run admin (used during deploy step)
gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
    --member="serviceAccount:${COMPUTE_SA}" \
    --role="roles/run.admin" \
    --quiet > /dev/null

# Grant Compute service account permission to act as itself (required for Cloud Run deploy)
gcloud iam service-accounts add-iam-policy-binding "${COMPUTE_SA}" \
    --member="serviceAccount:${COMPUTE_SA}" \
    --role="roles/iam.serviceAccountUser" \
    --project="${PROJECT_ID}" \
    --quiet > /dev/null

# Grant Compute service account permission to act as Firebase SA (for Cloud Run deploy)
gcloud iam service-accounts add-iam-policy-binding "${FIREBASE_SA}" \
    --member="serviceAccount:${COMPUTE_SA}" \
    --role="roles/iam.serviceAccountUser" \
    --project="${PROJECT_ID}" \
    --quiet > /dev/null

# Grant Cloud Build the ability to act as the Firebase service account
gcloud iam service-accounts add-iam-policy-binding "${FIREBASE_SA}" \
    --member="serviceAccount:${CLOUDBUILD_SA}" \
    --role="roles/iam.serviceAccountUser" \
    --project="${PROJECT_ID}" \
    --quiet > /dev/null

# Grant Cloud Build logging permissions
gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
    --member="serviceAccount:${CLOUDBUILD_SA}" \
    --role="roles/logging.logWriter" \
    --quiet > /dev/null

# Grant Cloud Build storage permissions (for uploading source)
gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
    --member="serviceAccount:${CLOUDBUILD_SA}" \
    --role="roles/storage.admin" \
    --quiet > /dev/null

echo -e "${GREEN}✓ IAM roles configured${NC}"

# =============================================================================
# Artifact Registry Setup
# =============================================================================
echo ""
echo -e "${YELLOW}Setting up Artifact Registry...${NC}"

# Check if repository already exists
if gcloud artifacts repositories describe "${AR_REPO}" --location="${REGION}" --project="${PROJECT_ID}" 2>/dev/null; then
    echo -e "${GREEN}✓ Artifact Registry repository already exists${NC}"
else
    echo "Creating Artifact Registry repository: ${AR_REPO}..."
    gcloud artifacts repositories create "${AR_REPO}" \
        --repository-format=docker \
        --location="${REGION}" \
        --description="Way Back Home container images" \
        --quiet
    echo -e "${GREEN}✓ Artifact Registry repository created${NC}"
fi

# =============================================================================
# Firestore Setup
# =============================================================================
echo ""
echo -e "${YELLOW}Setting up Firestore...${NC}"
if gcloud firestore databases describe --project="${PROJECT_ID}" 2>/dev/null; then
    echo -e "${GREEN}✓ Firestore database already exists${NC}"
else
    echo "Creating Firestore database in ${REGION}..."
    gcloud firestore databases create \
        --location="${REGION}" \
        --type=firestore-native \
        --quiet
    echo -e "${GREEN}✓ Firestore database created${NC}"
fi

# =============================================================================
# Firebase Storage Setup
# =============================================================================
echo ""
echo -e "${YELLOW}Configuring Firebase Storage...${NC}"
echo -e "Bucket: ${CYAN}gs://${FIREBASE_BUCKET}${NC}"

# Check if bucket exists
if gcloud storage buckets describe "gs://${FIREBASE_BUCKET}" &>/dev/null; then
    echo -e "${GREEN}✓ Firebase Storage bucket exists${NC}"

    # Disable uniform bucket-level access to allow per-object ACLs (needed for public avatar URLs)
    echo "  Configuring bucket access control..."
    gcloud storage buckets update "gs://${FIREBASE_BUCKET}" \
        --no-uniform-bucket-level-access \
        --quiet 2>/dev/null || echo "  Note: Could not update bucket ACL settings (may already be configured or locked)"

    echo -e "${GREEN}✓ Firebase Storage configured${NC}"
else
    echo -e "${YELLOW}⚠ Firebase Storage bucket not found.${NC}"
    echo -e "  Please enable Firebase Storage for this project:"
    echo -e "  ${CYAN}https://console.firebase.google.com/project/${PROJECT_ID}/storage${NC}"
    echo -e "  Then re-run this script."
fi

# =============================================================================
# Create Firestore Indexes
# =============================================================================
echo ""
echo -e "${YELLOW}Creating Firestore indexes...${NC}"

# Deploy indexes using gcloud (may take a few minutes to build)
gcloud firestore indexes composite create \
    --collection-group=participants \
    --field-config field-path=event_code,order=ascending \
    --field-config field-path=username_lower,order=ascending \
    --project="${PROJECT_ID}" \
    --quiet 2>/dev/null || echo "  Index may already exist (participants/event_code+username_lower)"

gcloud firestore indexes composite create \
    --collection-group=participants \
    --field-config field-path=event_code,order=ascending \
    --field-config field-path=active,order=ascending \
    --project="${PROJECT_ID}" \
    --quiet 2>/dev/null || echo "  Index may already exist (participants/event_code+active)"

echo -e "${GREEN}✓ Firestore indexes created (may take a few minutes to build)${NC}"

# =============================================================================
# Summary
# =============================================================================
echo ""
echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ Infrastructure setup complete!${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "Configuration:"
echo -e "  Project:           ${CYAN}${PROJECT_ID}${NC}"
echo -e "  Project Number:    ${CYAN}${PROJECT_NUMBER}${NC}"
echo -e "  Region:            ${CYAN}${REGION}${NC}"
echo -e "  Artifact Registry: ${CYAN}${REGION}-docker.pkg.dev/${PROJECT_ID}/${AR_REPO}${NC}"
echo -e "  Firebase Storage:  ${CYAN}gs://${FIREBASE_BUCKET}${NC}"
echo -e "  Cloud Run SA:      ${CYAN}${FIREBASE_SA}${NC}"
echo ""
echo ""
echo -e "${GREEN}✅ Infrastructure setup complete! Ready to proceed with the codelab instructions.${NC}"
echo ""