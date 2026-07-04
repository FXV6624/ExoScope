Write-Host "Fetching OpenAPI schema from local backend..."
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/api/v1/openapi.json" -UseBasicParsing
    [IO.File]::WriteAllText("$PWD\frontend\openapi.json", $response.Content)
} catch {
    Write-Error "Failed to fetch OpenAPI schema. Ensure the backend is running locally at http://localhost:8000."
    exit 1
}

Write-Host "Copying openapi.json to the frontend container..."
docker compose cp frontend/openapi.json frontend:/app/frontend/openapi.json

Write-Host "Generating frontend client inside Docker container..."
docker compose exec frontend bun run generate-client
docker compose exec frontend bun run lint

Write-Host "Syncing generated files back to Windows..."
docker compose cp frontend:/app/frontend/src/client ./frontend/src/

Write-Host "Frontend client successfully generated!"
