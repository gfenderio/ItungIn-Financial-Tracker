$files = @(
    'android/app/capacitor.build.gradle',
    'android/capacitor-cordova-android-plugins/build.gradle',
    'node_modules/@capgo/capacitor-social-login/android/build.gradle',
    'node_modules/@capacitor/local-notifications/android/build.gradle',
    'node_modules/@capacitor-community/admob/android/build.gradle',
    'node_modules/@capacitor/android/capacitor/build.gradle'
)

foreach ($f in $files) {
    if (Test-Path $f) {
        $content = Get-Content $f -Raw
        if ($content -match 'VERSION_21') {
            $content = $content -replace 'JavaVersion\.VERSION_21', 'JavaVersion.VERSION_17'
            Set-Content $f $content
            Write-Host "Patched: $f"
        } else {
            Write-Host "Already 17: $f"
        }
    } else {
        Write-Host "NOT FOUND: $f"
    }
}
Write-Host "Done patching all files."
