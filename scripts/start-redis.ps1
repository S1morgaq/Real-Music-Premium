$ErrorActionPreference = "Stop"

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

if (Test-PortOpen -Port 6379) {
  Write-Host "Redis is already reachable on 127.0.0.1:6379."
  exit 0
}

$serviceNames = @("Memurai", "Redis", "redis")
foreach ($serviceName in $serviceNames) {
  $service = Get-Service -Name $serviceName -ErrorAction SilentlyContinue
  if ($service) {
    if ($service.Status -ne "Running") {
      Start-Service -Name $serviceName
      Start-Sleep -Seconds 2
    }

    if (Test-PortOpen -Port 6379) {
      Write-Host "$serviceName service is running on 127.0.0.1:6379."
      exit 0
    }
  }
}

$docker = Get-Command docker -ErrorAction SilentlyContinue
if ($docker) {
  $existing = docker ps -a --filter "name=ardmetra-music-redis" --format "{{.Names}}"
  if ($existing -eq "ardmetra-music-redis") {
    docker start ardmetra-music-redis | Out-Null
  } else {
    docker run -d --name ardmetra-music-redis -p 6379:6379 redis:7-alpine redis-server --appendonly yes | Out-Null
  }

  Start-Sleep -Seconds 2
  if (Test-PortOpen -Port 6379) {
    Write-Host "Redis started with Docker on 127.0.0.1:6379."
    exit 0
  }
}

Write-Host "Docker is not available or Redis did not start."
Write-Host "No Redis-compatible Windows service was found."
Write-Host "Install Memurai Developer, then run npm run redis:start again:"
Write-Host "  winget install Memurai.MemuraiDeveloper"
Write-Host "If winget is missing, download Memurai Developer from https://www.memurai.com/get-memurai"
Write-Host "After installation, keep REDIS_URL=redis://127.0.0.1:6379 in .env."
exit 1
