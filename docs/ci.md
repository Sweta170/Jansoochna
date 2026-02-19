# Continuous Integration (GitHub Actions)

This repository includes a GitHub Actions workflow at `.github/workflows/ci.yml` that runs on pushes and pull requests to `main`.

What the workflow does:
- Checks out the repository
- Installs Node.js
- Installs frontend and backend dependencies
- Builds the frontend (`vite build`)
- Builds backend (placeholder checks)
- Builds backend and frontend Docker images locally in the runner (does not push by default)
- Uploads frontend `dist/` as an artifact

Enable pushing images to a registry:
1. Create a registry secret (for example `CR_PAT` or use `GITHUB_TOKEN` for GHCR).
2. Update the `docker/build-push-action` steps in `.github/workflows/ci.yml` to set `push: true` and provide `registry` and `tags`.

Example (GHCR):

```yaml
- name: Login to GHCR
  uses: docker/login-action@v2
  with:
    registry: ghcr.io
    username: ${{ github.actor }}
    password: ${{ secrets.GITHUB_TOKEN }}

- name: Build and push
  uses: docker/build-push-action@v4
  with:
    context: backend
    file: backend/Dockerfile
    push: true
    tags: ghcr.io/<owner>/jansoochna-backend:latest
```

Adjust as needed for other registries (Docker Hub, ECR, ACR).
