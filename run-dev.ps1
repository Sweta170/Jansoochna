#!/usr/bin/env pwsh
# run-dev.ps1 — start dev stack and run smoke tests
set-StrictMode -Version Latest

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Write-Host "Working directory: $root"

# Ensure backend .env exists
$envExample = Join-Path $root 'backend\.env.example'
$envFile = Join-Path $root 'backend\.env'
if (!(Test-Path $envFile) -and (Test-Path $envExample)) {
  Write-Host "Creating backend/.env from .env.example"
  Copy-Item -Path $envExample -Destination $envFile -Force
}

Push-Location (Join-Path $root 'infra')
Write-Host "Starting Docker Compose (infra)..."

# Debug: print PATH to help diagnose docker lookup issues
Write-Host "PATH: $env:PATH"

# Try to run docker --version and show output for debugging
try {
  $verOut = & docker --version 2>&1
  Write-Host "docker --version output: $verOut"
} catch {
  Write-Host "docker --version failed: $($_.Exception.Message)"
}

# Determine docker compose command (prefer `docker compose`, fallback to `docker-compose`)
# Use command execution fallback because Get-Command may not detect Docker in some PATH setups.
$composeCmd = $null
try {
  & docker --version > $null 2>&1
  $composeCmd = 'docker compose'
} catch {
  try {
    & docker-compose --version > $null 2>&1
    $composeCmd = 'docker-compose'
  } catch {
    Write-Error "Docker CLI not found. Install Docker Desktop or ensure 'docker' or 'docker-compose' is on PATH."; Pop-Location; exit 1
  }
}

Write-Host "Running: $composeCmd up --build -d"
# Use call operator to run the composed command string
if ($composeCmd -eq 'docker compose') {
  & docker compose up --build -d
} else {
  & docker-compose up --build -d
}

Write-Host "Waiting for backend to become healthy (http://localhost:4000/api/health)..."
$max = 60
$i = 0
while ($i -lt $max) {
  try {
    $r = Invoke-RestMethod -Uri 'http://localhost:4000/api/health' -Method Get -ErrorAction Stop
    if ($r.status -eq 'ok') { Write-Host "Backend healthy"; break }
  } catch {
    Start-Sleep -Seconds 2
    $i++
  }
}
if ($i -ge $max) { Write-Error "Backend did not become healthy in time."; Pop-Location; exit 1 }

Write-Host "Running smoke tests..."

$user = @{ name = 'Dev Tester'; email = 'devtester@example.com'; password = 'Password123' } | ConvertTo-Json
try {
  Invoke-RestMethod -Uri 'http://localhost:4000/api/auth/register' -Method Post -Body $user -ContentType 'application/json' -ErrorAction Stop | Out-Null
  Write-Host "Registered test user"
} catch {
  Write-Host "Register may have failed (user exists) or returned error: $($_.Exception.Message)"
}

$cred = @{ email = 'devtester@example.com'; password = 'Password123' } | ConvertTo-Json
try {
  $login = Invoke-RestMethod -Uri 'http://localhost:4000/api/auth/login' -Method Post -Body $cred -ContentType 'application/json' -ErrorAction Stop
  $token = $login.token
  Write-Host "Logged in, token length: $($token.Length)"
} catch {
  Write-Error "Login failed: $($_.Exception.Message)"; Pop-Location; exit 1
}

$comp = @{ title = 'Test complaint from run-dev'; description = 'Auto-created complaint for smoke test.' } | ConvertTo-Json
try {
  $created = Invoke-RestMethod -Uri 'http://localhost:4000/api/complaints' -Method Post -Body $comp -ContentType 'application/json' -Headers @{ Authorization = "Bearer $token" } -ErrorAction Stop
  Write-Host "Complaint created: ID=$($created.id)"
} catch {
  Write-Error "Failed creating complaint: $($_.Exception.Message)"
}

try {
  $list = Invoke-RestMethod -Uri 'http://localhost:4000/api/complaints' -Method Get -ErrorAction Stop
  Write-Host "Total complaints returned: $($list.Count)"
} catch {
  Write-Error "Failed listing complaints: $($_.Exception.Message)"
}

Write-Host "Smoke tests complete. Tail backend logs with: docker-compose logs -f backend"
Pop-Location
