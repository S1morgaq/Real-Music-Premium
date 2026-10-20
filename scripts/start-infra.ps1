$ErrorActionPreference = "Stop"

Set-Location (Resolve-Path (Join-Path $PSScriptRoot ".."))

function Test-PortOpen {
  param(
    [string] $HostName = "127.0.0.1",
    [int] $Port
  )

  try {
    $client = New-Object Net.Sockets.TcpClient
    $result = $client.BeginConnect($HostName, $Port, $null, $null)
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

function Wait-Port {
  param(
    [string] $Name,
    [int] $Port,
    [int] $TimeoutSeconds = 120
  )

  $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
  while ((Get-Date) -lt $deadline) {
    if (Test-PortOpen -Port $Port) {
      Write-Host "$Name hazir: 127.0.0.1:$Port"
      return
    }

    Start-Sleep -Seconds 2
  }

  throw "$Name 127.0.0.1:$Port uzerinde $TimeoutSeconds saniye icinde hazir olmadi."
}

function Get-EnvValue {
  param([string] $Name)

  if (-not (Test-Path ".env")) {
    return $null
  }

  $line = Get-Content ".env" | Where-Object { $_ -match "^\s*$Name\s*=" } | Select-Object -First 1
  if (-not $line) {
    return $null
  }

  return ($line -replace "^\s*$Name\s*=\s*", "").Trim().Trim('"').Trim("'")
}

function Start-LocalLavalink {
  if (Test-PortOpen -Port 2333) {
    Write-Host "Lavalink zaten calisiyor: 127.0.0.1:2333"
    return
  }

  $java = Get-Command java -ErrorAction SilentlyContinue
  if (-not $java) {
    throw "Docker yoksa Lavalink icin Java 17+ kurulu olmali."
  }

  $lavalinkDir = Resolve-Path "lavalink"
  $lavalinkJar = Join-Path $lavalinkDir "Lavalink.jar"
  if (-not (Test-Path $lavalinkJar)) {
    Write-Host "Lavalink.jar indiriliyor..."
    Invoke-WebRequest `
      -Uri "https://github.com/lavalink-devs/Lavalink/releases/latest/download/Lavalink.jar" `
      -OutFile $lavalinkJar
  }

  Write-Host "Lavalink Java ile baslatiliyor..."
  Start-Process `
    -FilePath "java" `
    -ArgumentList @("-jar", "Lavalink.jar") `
    -WorkingDirectory $lavalinkDir `
    -WindowStyle Hidden `
    -RedirectStandardOutput (Join-Path $lavalinkDir "lavalink.out.log") `
    -RedirectStandardError (Join-Path $lavalinkDir "lavalink.err.log")
}

$docker = Get-Command docker -ErrorAction SilentlyContinue
$waitForRedis = $true
$waitForMongo = $false
$mongoUri = Get-EnvValue -Name "MONGO_URI"
if (-not $mongoUri -or $mongoUri -match "127\.0\.0\.1|localhost") {
  $waitForMongo = $true
}

if ($docker) {
  $composeServices = @("redis", "lavalink")
  if ($waitForMongo) {
    $composeServices = @("mongo") + $composeServices
  }

  Write-Host "Docker ile altyapi baslatiliyor: $($composeServices -join ', ')..."
  docker compose up -d @composeServices
} else {
  Write-Host "Docker bulunamadi. Yerel Redis ve Java Lavalink deneniyor..."
  if ($waitForMongo -and -not (Test-PortOpen -Port 27017)) {
    throw "MongoDB calismiyor: 127.0.0.1:27017. Docker Desktop ile bu scripti tekrar calistir veya yerel MongoDB servisini baslat."
  }

  try {
    & powershell -NoProfile -ExecutionPolicy Bypass -File scripts/start-redis.ps1
    if ($LASTEXITCODE -ne 0) {
      throw "Redis start script exited with code $LASTEXITCODE."
    }
  } catch {
    $redisRequired = Get-EnvValue -Name "REDIS_REQUIRED"
    if ($redisRequired -eq "true") {
      throw "Redis baslatilamadi ve REDIS_REQUIRED=true."
    }

    Write-Host ""
    Write-Host "Redis baslatilamadi, ama REDIS_REQUIRED=true olmadigi icin devam ediliyor."
    Write-Host "Redis kullanmak istersen Docker Desktop veya Memurai Developer kur."
    $waitForRedis = $false
  }

  Start-LocalLavalink
}

if ($waitForMongo) {
  Wait-Port -Name "MongoDB" -Port 27017
}

if ($waitForRedis) {
  Wait-Port -Name "Redis" -Port 6379
}
Wait-Port -Name "Lavalink" -Port 2333 -TimeoutSeconds 180

Write-Host ""
if ($waitForRedis) {
  if ($waitForMongo) {
    Write-Host "MongoDB, Redis ve Lavalink hazir."
  } else {
    Write-Host "Redis ve Lavalink hazir."
  }
} else {
  if ($waitForMongo) {
    Write-Host "MongoDB ve Lavalink hazir. Redis atlandi."
  } else {
    Write-Host "Lavalink hazir. Redis atlandi."
  }
}
