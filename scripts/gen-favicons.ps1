Add-Type -AssemblyName System.Drawing

$srcPath = Join-Path $PSScriptRoot "..\public\logo.jpg"
$publicDir = Join-Path $PSScriptRoot "..\public"

$img = [System.Drawing.Image]::FromFile($srcPath)

function Resize-Image($source, [int]$w, [int]$h, [string]$outPath) {
    $bmp = New-Object System.Drawing.Bitmap $w, $h
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $g.DrawImage($source, 0, 0, $w, $h)
    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
}

$fav32 = Join-Path $publicDir "favicon-32x32.png"
$fav16 = Join-Path $publicDir "favicon-16x16.png"
$fav48 = Join-Path $publicDir "favicon-48x48.png"
$fav180 = Join-Path $publicDir "apple-touch-icon.png"
$fav192 = Join-Path $publicDir "favicon.png"
$fav256 = Join-Path $publicDir "favicon-256x256.png"

Resize-Image $img 32 32 $fav32
Resize-Image $img 16 16 $fav16
Resize-Image $img 48 48 $fav48
Resize-Image $img 180 180 $fav180
Resize-Image $img 192 192 $fav192
Resize-Image $img 256 256 $fav256

$img.Dispose()
Write-Output "Generated PNG icons successfully"
