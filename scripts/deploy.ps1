# PowerShell Deployment script for Ticket Management Portal
# Usage: .\scripts\deploy.ps1 [staging|production]

param(
    [Parameter(Position=0)]
    [ValidateSet("staging", "production")]
    [string]$Environment = "staging"
)

# Configuration
$ProjectName = "ticket-management-portal"
$BuildDir = "dist"
$BackupDir = "backups"

# Colors for output
$Colors = @{
    Red = "Red"
    Green = "Green"
    Yellow = "Yellow"
    Blue = "Blue"
    Cyan = "Cyan"
}

function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

function Test-Prerequisites {
    Write-ColorOutput "🔍 Checking prerequisites..." $Colors.Blue
    
    # Check if we're in the right directory
    if (-not (Test-Path "package.json")) {
        Write-ColorOutput "❌ Error: package.json not found. Please run this script from the project root." $Colors.Red
        exit 1
    }
    
    # Check if node_modules exists
    if (-not (Test-Path "node_modules")) {
        Write-ColorOutput "⚠️  node_modules not found. Installing dependencies..." $Colors.Yellow
        npm ci
        if ($LASTEXITCODE -ne 0) {
            Write-ColorOutput "❌ Failed to install dependencies" $Colors.Red
            exit 1
        }
    }
    
    Write-ColorOutput "✅ Prerequisites check passed" $Colors.Green
}

function Invoke-PreDeploymentChecks {
    Write-ColorOutput "🔍 Running pre-deployment checks..." $Colors.Blue
    
    # Check for linting errors
    Write-ColorOutput "  - Running linter..." $Colors.Cyan
    npm run lint
    if ($LASTEXITCODE -ne 0) {
        Write-ColorOutput "❌ Linting failed. Please fix errors before deploying." $Colors.Red
        exit 1
    }
    
    # Run type checking (if TypeScript)
    if (Test-Path "tsconfig.json") {
        Write-ColorOutput "  - Running type check..." $Colors.Cyan
        npm run type-check
        if ($LASTEXITCODE -ne 0) {
            Write-ColorOutput "❌ Type checking failed. Please fix errors before deploying." $Colors.Red
            exit 1
        }
    }
    
    # Run tests
    Write-ColorOutput "  - Running tests..." $Colors.Cyan
    npm run test
    if ($LASTEXITCODE -ne 0) {
        Write-ColorOutput "❌ Tests failed. Please fix failing tests before deploying." $Colors.Red
        exit 1
    }
    
    Write-ColorOutput "✅ Pre-deployment checks passed" $Colors.Green
}

function New-Backup {
    # Create backup directory if it doesn't exist
    if (-not (Test-Path $BackupDir)) {
        New-Item -ItemType Directory -Path $BackupDir | Out-Null
    }
    
    # Backup current deployment (if exists)
    if (Test-Path $BuildDir) {
        $BackupName = "$ProjectName-$Environment-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
        Write-ColorOutput "📦 Creating backup: $BackupName" $Colors.Blue
        Copy-Item -Path $BuildDir -Destination "$BackupDir\$BackupName" -Recurse
    }
}

function Invoke-Build {
    # Clean previous build
    Write-ColorOutput "🧹 Cleaning previous build..." $Colors.Blue
    if (Test-Path $BuildDir) {
        Remove-Item -Path $BuildDir -Recurse -Force
    }
    
    # Build for the specified environment
    Write-ColorOutput "🔨 Building for $Environment..." $Colors.Blue
    if ($Environment -eq "production") {
        npm run build:production
    } else {
        npm run build:staging
    }
    
    if ($LASTEXITCODE -ne 0) {
        Write-ColorOutput "❌ Build failed" $Colors.Red
        exit 1
    }
    
    # Verify build was successful
    if (-not (Test-Path $BuildDir)) {
        Write-ColorOutput "❌ Build failed - $BuildDir directory not found" $Colors.Red
        exit 1
    }
    
    # Check build size
    $BuildSize = (Get-ChildItem -Path $BuildDir -Recurse | Measure-Object -Property Length -Sum).Sum
    $BuildSizeMB = [math]::Round($BuildSize / 1MB, 2)
    Write-ColorOutput "📊 Build size: $BuildSizeMB MB" $Colors.Green
}

function Invoke-Deployment {
    switch ($Environment) {
        "staging" {
            Write-ColorOutput "🚀 Deploying to staging..." $Colors.Blue
            # Add your staging deployment commands here
            # Examples:
            # - Upload to staging server via PowerShell remoting
            # - Deploy to Azure/AWS using CLI tools
            # - Update staging environment variables
            
            Write-ColorOutput "  - Staging deployment commands would go here" $Colors.Cyan
            Write-ColorOutput "  - Example: Copy-Item -Path $BuildDir\* -Destination \\staging-server\wwwroot\ -Recurse -Force" $Colors.Cyan
            Write-ColorOutput "  - Example: az webapp deployment source config-zip --resource-group rg --name staging-app --src build.zip" $Colors.Cyan
        }
        
        "production" {
            Write-ColorOutput "🚀 Deploying to production..." $Colors.Blue
            
            # Additional production safety checks
            Write-ColorOutput "⚠️  Production deployment requires confirmation" $Colors.Yellow
            $confirm = Read-Host "Are you sure you want to deploy to PRODUCTION? (yes/no)"
            
            if ($confirm -ne "yes") {
                Write-ColorOutput "❌ Deployment cancelled" $Colors.Yellow
                exit 0
            }
            
            # Add your production deployment commands here
            # Examples:
            # - Upload to production server via PowerShell remoting
            # - Deploy to Azure/AWS using CLI tools
            # - Update production environment variables
            # - Notify team of deployment
            
            Write-ColorOutput "  - Production deployment commands would go here" $Colors.Cyan
            Write-ColorOutput "  - Example: Copy-Item -Path $BuildDir\* -Destination \\production-server\wwwroot\ -Recurse -Force" $Colors.Cyan
            Write-ColorOutput "  - Example: az webapp deployment source config-zip --resource-group rg --name production-app --src build.zip" $Colors.Cyan
        }
    }
}

function Test-PostDeployment {
    Write-ColorOutput "🔍 Running post-deployment verification..." $Colors.Blue
    
    # Check if critical files exist
    $CriticalFiles = @("index.html", "assets")
    foreach ($file in $CriticalFiles) {
        if (-not (Test-Path "$BuildDir\$file")) {
            Write-ColorOutput "❌ Critical file missing: $file" $Colors.Red
            exit 1
        }
    }
    
    # Optional: Run smoke tests against deployed application
    # Write-ColorOutput "  - Running smoke tests..." $Colors.Cyan
    # npm run test:smoke:$Environment
    # if ($LASTEXITCODE -ne 0) {
    #     Write-ColorOutput "❌ Smoke tests failed" $Colors.Red
    #     exit 1
    # }
    
    Write-ColorOutput "✅ Post-deployment verification passed" $Colors.Green
}

function Remove-OldBackups {
    Write-ColorOutput "🧹 Cleaning up old backups..." $Colors.Blue
    
    if (Test-Path $BackupDir) {
        $Backups = Get-ChildItem -Path $BackupDir | Sort-Object LastWriteTime -Descending
        if ($Backups.Count -gt 5) {
            $BackupsToRemove = $Backups | Select-Object -Skip 5
            foreach ($backup in $BackupsToRemove) {
                Remove-Item -Path $backup.FullName -Recurse -Force
            }
        }
    }
}

# Main execution
try {
    Write-ColorOutput "🚀 Starting deployment to $Environment..." $Colors.Blue
    
    Test-Prerequisites
    Invoke-PreDeploymentChecks
    New-Backup
    Invoke-Build
    Invoke-Deployment
    Test-PostDeployment
    Remove-OldBackups
    
    # Success message
    Write-ColorOutput "🎉 Deployment to $Environment completed successfully!" $Colors.Green
    Write-ColorOutput "📊 Deployment Summary:" $Colors.Blue
    Write-ColorOutput "  - Environment: $Environment" $Colors.Cyan
    Write-ColorOutput "  - Deployment time: $(Get-Date)" $Colors.Cyan
    
    if (Test-Path $BackupDir) {
        $LatestBackup = Get-ChildItem -Path $BackupDir | Sort-Object LastWriteTime -Descending | Select-Object -First 1
        if ($LatestBackup) {
            Write-ColorOutput "  - Backup created: $($LatestBackup.Name)" $Colors.Cyan
        }
    }
    
    Write-ColorOutput "✨ All done!" $Colors.Green
}
catch {
    Write-ColorOutput "❌ Deployment failed: $($_.Exception.Message)" $Colors.Red
    exit 1
}