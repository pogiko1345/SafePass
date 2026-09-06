param(
    [ValidateSet('full', 'visitor')]
    [string]$Variant = 'full'
)

$ErrorActionPreference = 'Stop'
$projectDirectory = Split-Path -Parent $PSScriptRoot
$env:NODE_ENV = 'production'
$env:EXPO_NO_DOTENV = '1'
$env:EXPO_PUBLIC_APP_VARIANT = $Variant
$env:EXPO_PUBLIC_API_MODE = 'production'
$env:EXPO_PUBLIC_API_BASE_URL = 'https://safepass-052h.onrender.com/api'
$env:EXPO_PUBLIC_ENABLE_DEV_FALLBACK = 'false'
$env:EXPO_PUBLIC_E2E_LOCAL_ONLY = 'false'
$buildVariant = (Get-Culture).TextInfo.ToTitleCase($Variant)

Push-Location (Join-Path $projectDirectory 'android')
try {
    # Substituted drives can disagree with canonical dependency paths in Kotlin's cache.
    rtk proxy .\gradlew.bat ":app:assemble${buildVariant}Release" --console=plain --max-workers=2 '-Pkotlin.incremental=false'
    if ($LASTEXITCODE -ne 0) {
        throw "Android build failed with exit code $LASTEXITCODE."
    }
} finally {
    Pop-Location
}

$apkSource = Join-Path $projectDirectory "android\app\build\outputs\apk\$Variant\release\app-$Variant-release.apk"
$downloadDirectory = Join-Path $projectDirectory 'dist'
New-Item -ItemType Directory -Path $downloadDirectory -Force | Out-Null
$apkName = if ($Variant -eq 'full') { 'CentrixMobile.apk' } else { 'SafePass-Visitor-Live.apk' }
$apkDestination = Join-Path $downloadDirectory $apkName
Copy-Item -LiteralPath $apkSource -Destination $apkDestination -Force
Write-Output "APK ready: $apkDestination"
