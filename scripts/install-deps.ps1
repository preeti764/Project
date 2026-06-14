$ErrorActionPreference = "Stop"
$node = "C:\Users\Preeti\AppData\Local\Programs\cursor\resources\app\resources\helpers\node.exe"
$nodeDir = Split-Path $node -Parent
$env:PATH = "$nodeDir;$env:PATH"
$npmDir = Join-Path $env:TEMP "cursor-npm-bootstrap"
$npmCli = Join-Path $npmDir "package\bin\npm-cli.js"

if (-not (Test-Path $npmCli)) {
  New-Item -ItemType Directory -Force -Path $npmDir | Out-Null
  $tgz = Join-Path $npmDir "npm.tgz"
  Write-Host "Downloading npm..."
  Invoke-WebRequest -Uri "https://registry.npmjs.org/npm/-/npm-10.9.2.tgz" -OutFile $tgz
  tar -xzf $tgz -C $npmDir
}

$root = Split-Path $PSScriptRoot -Parent
foreach ($dir in @("backend", "frontend")) {
  Write-Host "Installing $dir dependencies..."
  & $node $npmCli install --prefix (Join-Path $root $dir)
}

Write-Host "Done."
