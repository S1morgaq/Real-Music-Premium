$ErrorActionPreference = "Stop"

function Test-Admin {
  $identity = [Security.Principal.WindowsIdentity]::GetCurrent()
  $principal = New-Object Security.Principal.WindowsPrincipal($identity)
  return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

function Test-PortOpen {
  param([int] $Port)

  try {
    $client = New-Object Net.Sockets.TcpClient
    $result = $client.BeginConnect("127.0.0.1", $Port, $null, $null)
    $connected = $result.AsyncWaitHandle.WaitOne(700)
    if ($connected) {
      $client.EndConnect($result)
    }
    $client.Close()
    return $connected
  } catch {
    return $false
  }
}

function Start-RedisService {
  $serviceNames = @("Memurai", "Redis", "redis")
  foreach ($serviceName in $serviceNames) {
    $service = Get-Service -Name $serviceName -ErrorAction SilentlyContinue
    if ($service) {
      if ($service.Status -ne "Running") {
        Start-Service -Name $serviceName
        Start-Sleep -Seconds 2
      }
      return $true
    }
  }

  return $false
}

if (-not (Test-Admin)) {
  Write-Host "Run this command in PowerShell as Administrator:"
  Write-Host "  npm run redis:install:windows"
  exit 1
}

if (Test-PortOpen -Port 6379) {
  Write-Host "Redis is already reachable on 127.0.0.1:6379."
  exit 0
}

$winget = Get-Command winget -ErrorAction SilentlyContinue
if ($winget) {
  winget install --id Memurai.MemuraiDeveloper -e --accept-package-agreements --accept-source-agreements
} else {
  $choco = Get-Command choco -ErrorAction SilentlyContinue
  if (-not $choco) {
    Write-Host "winget was not found. Installing Chocolatey first..."
    Set-ExecutionPolicy Bypass -Scope Process -Force
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
    Invoke-Expression ((New-Object System.Net.WebClient).DownloadString("https://community.chocolatey.org/install.ps1"))
    $env:Path = [Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [Environment]::GetEnvironmentVariable("Path", "User")
  }

  choco install memurai-developer -y
}

Start-RedisService | Out-Null
Start-Sleep -Seconds 2

if (Test-PortOpen -Port 6379) {
  Write-Host "Redis-compatible Memurai service is running on 127.0.0.1:6379."
  exit 0
}

Write-Host "Memurai was installed, but port 6379 is not reachable yet."
Write-Host "Open Services, start the Memurai service, then run:"
Write-Host "  npm run redis:start"
exit 1
