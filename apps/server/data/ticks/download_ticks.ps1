# Fast Dukascopy Tick Data Downloader
# Downloads month-by-month with progress tracking and auto-rename

param(
    [string[]]$Symbols = @("audusd", "gbpusd", "usdjpy", "usdchf"),
    [int]$Year = 2024,
    [int]$StartMonth = 1,
    [int]$EndMonth = 12,
    [int]$BatchSize = 20,
    [int]$Retries = 5
)

Write-Host "🚀 Dukascopy Tick Data Downloader" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 Symbols: $($Symbols -join ', ')" -ForegroundColor Yellow
Write-Host "📅 Year: $Year" -ForegroundColor Yellow
Write-Host "📆 Months: $StartMonth to $EndMonth" -ForegroundColor Yellow
Write-Host "⚡ Batch Size: $BatchSize" -ForegroundColor Yellow
Write-Host "🔄 Retries: $Retries" -ForegroundColor Yellow
Write-Host ""

$TotalMonths = $EndMonth - $StartMonth + 1
$TotalDownloads = $Symbols.Count * $TotalMonths
$CurrentDownload = 0
$SuccessCount = 0
$FailCount = 0

foreach ($Symbol in $Symbols) {
    Write-Host ""
    Write-Host "================================================" -ForegroundColor Green
    Write-Host "Processing $($Symbol.ToUpper())" -ForegroundColor Green
    Write-Host "================================================" -ForegroundColor Green
    
    for ($Month = $StartMonth; $Month -le $EndMonth; $Month++) {
        $CurrentDownload++
        
        # Calculate date range
        $MonthStr = $Month.ToString("00")
        $FromDate = "$Year-$MonthStr-01"
        
        # Get last day of month
        $LastDay = [DateTime]::DaysInMonth($Year, $Month)
        $ToDate = "$Year-$MonthStr-$LastDay"
        
        # Output filename
        $OutputFile = "$($Symbol.ToUpper())_TICKS_$Year`_$MonthStr.CSV"
        $TempFile = "$Symbol-$Year-$MonthStr-01-$Year-$MonthStr-$LastDay-tick.csv"
        
        Write-Host ""
        Write-Host "[$CurrentDownload/$TotalDownloads] Downloading $($Symbol.ToUpper()) $FromDate → $ToDate" -ForegroundColor Cyan
        
        # Run dukascopy-node
        try {
            dukascopy-node -i $Symbol -from $FromDate -to $ToDate -t tick -f csv --cache --batch-size $BatchSize --retries $Retries
            
            # Check if file was created
            if (Test-Path $TempFile) {
                # Rename to our format
                Move-Item -Path $TempFile -Destination $OutputFile -Force
                
                $FileSize = (Get-Item $OutputFile).Length / 1MB
                Write-Host "   ✅ Downloaded: $($FileSize.ToString('F2')) MB → $OutputFile" -ForegroundColor Green
                $SuccessCount++
            } else {
                Write-Host "   ⚠️  File not found: $TempFile" -ForegroundColor Yellow
                $FailCount++
            }
        } catch {
            Write-Host "   ❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
            $FailCount++
        }
        
        # Small delay to avoid rate limiting
        Start-Sleep -Milliseconds 500
    }
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "📊 Download Summary" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "✅ Successful: $SuccessCount" -ForegroundColor Green
Write-Host "❌ Failed: $FailCount" -ForegroundColor Red
Write-Host "📁 Output directory: $(Get-Location)" -ForegroundColor Yellow
Write-Host ""
Write-Host "✨ Done!" -ForegroundColor Green
