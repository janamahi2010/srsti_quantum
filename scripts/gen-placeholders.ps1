Add-Type -AssemblyName System.Drawing

function New-PlaceholderPhoto {
    param(
        [string]$Path,
        [string]$Label,
        [string]$SubLabel,
        [int]$Width,
        [int]$Height
    )

    $bmp = [System.Drawing.Bitmap]::new($Width, $Height)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

    $navy = [System.Drawing.Color]::FromArgb(255, 10, 26, 77)
    $navyLight = [System.Drawing.Color]::FromArgb(255, 22, 41, 122)
    $rect = [System.Drawing.Rectangle]::new(0, 0, $Width, $Height)
    $brush = [System.Drawing.Drawing2D.LinearGradientBrush]::new($rect, $navy, $navyLight, 135.0)
    $g.FillRectangle($brush, $rect)

    # subtle diagonal accent stripes (kept clear of the bottom caption band)
    $stripeBottom = $Height - 40
    $accentPen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(28, 255, 255, 255), [Math]::Max(2, $Width / 120))
    $stripeStep = [Math]::Max(24, [int]($Width / 14))
    $clipRect = [System.Drawing.Rectangle]::new(0, 0, $Width, $stripeBottom)
    $g.SetClip($clipRect)
    for ($x = -$Height; $x -lt $Width; $x += $stripeStep) {
        $g.DrawLine($accentPen, $x, $Height, ($x + $Height), 0)
    }
    $g.ResetClip()

    # bottom accent bar (red -> orange)
    $barH = [Math]::Max(6, [int]($Height * 0.035))
    $barRect = [System.Drawing.Rectangle]::new(0, ($Height - $barH), $Width, $barH)
    $barBrush = [System.Drawing.Drawing2D.LinearGradientBrush]::new($barRect, [System.Drawing.Color]::FromArgb(255,226,35,26), [System.Drawing.Color]::FromArgb(255,245,133,31), 0.0)
    $g.FillRectangle($barBrush, $barRect)

    # center label
    $fontSize = [Math]::Max(14, [int]($Width / 14))
    $font = [System.Drawing.Font]::new("Segoe UI", $fontSize, [System.Drawing.FontStyle]::Bold)
    $whiteBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::White)
    $format = [System.Drawing.StringFormat]::new()
    $format.Alignment = [System.Drawing.StringAlignment]::Center
    $format.LineAlignment = [System.Drawing.StringAlignment]::Center

    $textRect = [System.Drawing.RectangleF]::new(24, 24, ($Width - 48), ($Height - 80))
    $g.DrawString($Label, $font, $whiteBrush, $textRect, $format)

    # sub label (small caption) near bottom
    $subFontSize = [Math]::Max(9, [int]($Width / 32))
    $subFont = [System.Drawing.Font]::new("Segoe UI", $subFontSize, [System.Drawing.FontStyle]::Regular)
    $orangeBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(255,245,133,31))
    $subRect = [System.Drawing.RectangleF]::new(16, ($Height - $barH - 34), ($Width - 32), 30)
    $subFormat = [System.Drawing.StringFormat]::new()
    $subFormat.Alignment = [System.Drawing.StringAlignment]::Center
    $subFormat.LineAlignment = [System.Drawing.StringAlignment]::Far
    $g.DrawString($SubLabel, $subFont, $orangeBrush, $subRect, $subFormat)

    $dir = Split-Path $Path -Parent
    if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }

    $jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
    $encParams = [System.Drawing.Imaging.EncoderParameters]::new(1)
    $encParams.Param[0] = [System.Drawing.Imaging.EncoderParameter]::new([System.Drawing.Imaging.Encoder]::Quality, 82L)
    $bmp.Save($Path, $jpegCodec, $encParams)

    $g.Dispose()
    $bmp.Dispose()
}

$root = "D:\My_projects\Srsti Quantum\sristi_quantum_2_Main_old\assets\img"

# Products - 4:3 landscape, matches .solution-card / new service-tile .card-img aspect-ratio
$products = [ordered]@{
    "processor.jpg"          = "Quantum Processor"
    "resonator.jpg"          = "Resonator"
    "test-chips.jpg"         = "Test Chips"
    "fabrication.jpg"        = "Fabrication"
    "characterization.jpg"   = "Characterization"
    "wafer-packaging.jpg"    = "Wafer Packaging"
    "wire-bonding.jpg"       = "Wire Bonding"
    "flip-chip.jpg"          = "Flip Chip"
    "packaged-device.jpg"    = "Packaged Device"
    "quantum-hardware.jpg"   = "Quantum Hardware"
}
foreach ($k in $products.Keys) {
    New-PlaceholderPhoto -Path (Join-Path "$root\products" $k) -Label $products[$k] -SubLabel "PLACEHOLDER - replace with real photo" -Width 800 -Height 600
}

# Process - 4:3 landscape
$process = [ordered]@{
    "fabrication.jpg"               = "1. Fabrication"
    "initial-characterization.jpg"  = "2. Initial Characterization"
    "dicing-packaging.jpg"          = "3. Dicing, Packaging & Wire Bonding"
    "testing.jpg"                   = "4. Testing & Characterization"
    "qa.jpg"                        = "5. Final Quality Assurance"
    "delivery.jpg"                  = "6. Delivery to Clients"
}
foreach ($k in $process.Keys) {
    New-PlaceholderPhoto -Path (Join-Path "$root\process" $k) -Label $process[$k] -SubLabel "PLACEHOLDER - replace with real photo" -Width 800 -Height 600
}

# Team - portrait 3:3.6, matches .flip-card aspect-ratio
$team = [ordered]@{
    "kumbhakar.jpg"  = "Dr. Prasanta Kumbhakar"
    "sangineni.jpg"  = "Dr. Mohan Sangineni"
}
foreach ($k in $team.Keys) {
    New-PlaceholderPhoto -Path (Join-Path $root $k) -Label $team[$k] -SubLabel "PLACEHOLDER - replace with real photo" -Width 600 -Height 720
}

Write-Host "Done."
