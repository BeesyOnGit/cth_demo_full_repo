# Get the directory where start.ps1 is located
$root = Split-Path -Parent $MyInvocation.MyCommand.Path

# Open back folder in VS Code
Set-Location "$root\back"
code .

# Open front folder in VS Code
Set-Location "$root\front"
code .
