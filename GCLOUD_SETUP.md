# Local Environment Setup for Way Back Home Level 4 (End-to-End)

## Prerequisites
- macOS with Homebrew installed
- Docker Desktop installed and running
- Node.js 20+ (`brew install node@20` if needed)
- `uv` Python package manager (`curl -LsSf https://astral.sh/uv/install.sh | sh` if needed)
- A Google Cloud project with billing/credits enabled

## Step 1: Install gcloud CLI

```bash
brew install --cask google-cloud-sdk
```

**If this fails with an SSL error** (common on Macs with corporate security software like Lighthouse, Zscaler, etc.): the error is only during the post-install component update — the core binary still gets installed at `/opt/homebrew/share/google-cloud-sdk/bin/gcloud`. You can safely ignore the error and continue.

## Step 2: Add gcloud to your shell

Append to `~/.zshrc` (**do not just run `export` in the terminal** — it won't persist):

```bash
echo '' >> ~/.zshrc
echo '# Google Cloud SDK' >> ~/.zshrc
echo 'export PATH="/opt/homebrew/share/google-cloud-sdk/bin:$PATH"' >> ~/.zshrc
```

**If you had the SSL error in Step 1**, also add this (replace the path with your corporate CA bundle if different):

```bash
echo 'export CLOUDSDK_CORE_CUSTOM_CA_CERTS_FILE="/Library/Lighthouse/ca-bundle.pem"' >> ~/.zshrc
```

Then reload:

```bash
source ~/.zshrc
```

Verify:

```bash
gcloud --version
```

Expected output: `Google Cloud SDK` followed by a version number.

## Step 3: Authenticate with Google Cloud

```bash
gcloud auth login
```

This opens a browser. Sign in with the Google account that owns your project.

Set your project (replace `YOUR_PROJECT_ID` with your actual project ID):

```bash
gcloud config set project YOUR_PROJECT_ID
```

Create Application Default Credentials (used by Python SDKs like Vertex AI and ADK):

```bash
gcloud auth application-default login
```

Verify:

```bash
gcloud auth list                # should show your account as ACTIVE
gcloud config get project       # should show your project ID
```

## Step 4: Enable required Google Cloud APIs

```bash
gcloud services enable aiplatform.googleapis.com
```

## Step 5: Clone the tutorial repository

```bash
git clone https://github.com/google-americas/way-back-home.git ~/way-back-home
```

## Step 6: Install Python dependencies

```bash
cd ~/way-back-home/level_4
uv sync
```

## Step 7: Final verification

```bash
gcloud --version
gcloud auth list
gcloud config get project
cd ~/way-back-home/level_4 && ls
```

You should see: gcloud working, your account active, your project ID, and the tutorial files (backend/, frontend/, scripts/, etc.).

## Done

You're ready to start the tutorial from the **Schematic Vault & Architect Agent** section, which begins with launching a local Redis container:

```bash
docker run -d --name ozymandias-vault -p 6379:6379 redis:8.6-rc1-alpine
```
