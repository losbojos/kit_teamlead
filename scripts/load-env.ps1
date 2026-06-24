param(
    # Save variables to Windows User environment so new terminals keep Forge login.
    [switch]$Remember
)

$envFile = Join-Path $PSScriptRoot "..\.env"

if (-not (Test-Path $envFile)) {
    Write-Error ".env file not found: $envFile"
    exit 1
}

Get-Content $envFile | ForEach-Object {
    if ($_ -match '^\s*#' -or $_ -match '^\s*$') { return }
    $name, $value = $_ -split '=', 2
    $value = $value.Trim()
    Set-Item -Path "env:$name" -Value $value

    if ($Remember) {
        [System.Environment]::SetEnvironmentVariable($name, $value, "User")
    }
}

Write-Host "Loaded from .env for current session."

if ($Remember) {
    Write-Host "Saved to User environment. New terminals will keep Forge login."
}

if ($env:FORGE_EMAIL) {
    Write-Host "FORGE_EMAIL: $($env:FORGE_EMAIL)"
}

if ($env:FORGE_API_TOKEN) {
    Write-Host "FORGE_API_TOKEN: [set]"
}
