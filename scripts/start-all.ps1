param(
  [switch] $Pm2
)

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
    [int] $TimeoutSeconds = 90
  )

  $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
  while ((Get-Date) -lt $deadline) {
    if (Test-PortOpen -Port $Port) {
      Write-Host "$Name ready on 127.0.0.1:$Port."
      return
    }

    Start-Sleep -Seconds 2
  }

  throw "$Name did not become ready on 127.0.0.1:$Port within $TimeoutSeconds seconds."
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

$docker = Get-Command docker -ErrorAction SilentlyContinue
$waitForRedis = $true
if ($docker) {
  $composeServices = @("redis", "lavalink")
  $mongoUri = Get-EnvValue -Name "MONGO_URI"
  if (-not $mongoUri -or $mongoUri -match "127\.0\.0\.1|localhost") {
    $composeServices = @("mongo") + $composeServices
  }

  Write-Host "Starting infrastructure: $($composeServices -join ', ')..."
  docker compose up -d @composeServices
} else {
  Write-Host "Docker was not found. Trying local Redis and Lavalink fallback..."
  $composeServices = @()

  try {
    & powershell -ExecutionPolicy Bypass -File scripts/start-redis.ps1
    if ($LASTEXITCODE -ne 0) {
      throw "Redis start script exited with code $LASTEXITCODE."
    }
  } catch {
    $redisRequired = Get-EnvValue -Name "REDIS_REQUIRED"
    if ($redisRequired -eq "true") {
      throw
    }

    Write-Host "Redis could not be started. Continuing because REDIS_REQUIRED is not true."
    $waitForRedis = $false
  }

  if (-not (Test-PortOpen -Port 2333)) {
    $java = Get-Command java -ErrorAction SilentlyContinue
    if (-not $java) {
      throw "Java 17+ is required to auto-start Lavalink without Docker."
    }

    $lavalinkJar = Join-Path "lavalink" "Lavalink.jar"
    if (-not (Test-Path $lavalinkJar)) {
      Write-Host "Downloading Lavalink.jar..."
      Invoke-WebRequest `
        -Uri "https://github.com/lavalink-devs/Lavalink/releases/latest/download/Lavalink.jar" `
        -OutFile $lavalinkJar
    }

    Write-Host "Starting Lavalink with Java..."
    $javaArgs = @("-jar", "Lavalink.jar")
    $lavalinkDir = Resolve-Path "lavalink"
    Start-Process `
      -FilePath "java" `
      -ArgumentList $javaArgs `
      -WorkingDirectory $lavalinkDir `
      -WindowStyle Hidden `
      -RedirectStandardOutput (Join-Path $lavalinkDir "lavalink.out.log") `
      -RedirectStandardError (Join-Path $lavalinkDir "lavalink.err.log")
  }
}

if ($composeServices -contains "mongo") {
  Wait-Port -Name "MongoDB" -Port 27017
}

if ($waitForRedis) {
  Wait-Port -Name "Redis" -Port 6379
}
Wait-Port -Name "Lavalink" -Port 2333 -TimeoutSeconds 180

Write-Host "Building bot..."
npm run build

if ($Pm2) {
  Write-Host "Starting bot with PM2..."
  pm2 start ecosystem.config.cjs --update-env
  pm2 save
} else {
  Write-Host "Starting bot..."
  npm start
}
