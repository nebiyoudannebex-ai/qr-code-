param(
  [string]$OutputName = "done qr code.zip"
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$zipPath = Join-Path $root $OutputName
$staging = Join-Path $root ".release-staging"

Remove-Item $staging -Recurse -Force -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Path $staging -Force | Out-Null

$include = @(
  "src",
  "index.html",
  "supabaseClient.js",
  "server.ts",
  "package.json",
  "package-lock.json",
  "tsconfig.json",
  "vite.config.ts",
  ".env.example"
)

foreach ($item in $include) {
  $source = Join-Path $root $item
  if (Test-Path $source) {
    Copy-Item $source -Destination $staging -Recurse -Force
  }
}

Compress-Archive -Path (Join-Path $staging "*") -DestinationPath $zipPath -Force
Remove-Item $staging -Recurse -Force

Write-Host "Created: $zipPath"
Write-Host ("Size: " + [math]::Round(((Get-Item $zipPath).Length / 1MB), 2) + " MB")
