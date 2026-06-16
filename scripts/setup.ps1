# ─────────────────────────────────────────────────────────────────────────────
# D1A Motion Editor — Full Setup Script (Windows PowerShell)
#
# One-liner install:
#   iex (iwr "https://raw.githubusercontent.com/vuthetruhub-star/remotion-editer/main/scripts/setup.ps1").Content
#
# Local run:
#   .\scripts\setup.ps1 [ProjectName]
# ─────────────────────────────────────────────────────────────────────────────

param([string]$ProjectName = "d1a-motion-editor")

$RepoUrl    = "https://github.com/vuthetruhub-star/remotion-editer.git"
$Downloads  = [Environment]::GetFolderPath("UserProfile") + "\Downloads"
$TargetPath = Join-Path $Downloads $ProjectName

$Failed = 0

function Pass($msg)  { Write-Host " OK  $msg" -ForegroundColor Green }
function Fail($msg)  { Write-Host " ERR $msg" -ForegroundColor Red; $script:Failed++ }
function Info($msg)  { Write-Host " >>  $msg" -ForegroundColor Cyan }
function Head($msg)  { Write-Host "`n$msg" -ForegroundColor White }

# ─────────────────────────────────────────────────────────────────────────────
Write-Host "`nD1A Motion Editor — Setup" -ForegroundColor Cyan
Write-Host "------------------------------------------------------------"

# ── 1. Pre-flight ─────────────────────────────────────────────────────────────
Head "1/4  Pre-flight"

if (-not (Get-Command git  -ErrorAction SilentlyContinue)) { Fail "git not found — install Git for Windows"; exit 1 }
if (-not (Get-Command node -ErrorAction SilentlyContinue)) { Fail "node not found — install Node.js 18+"; exit 1 }
Pass "git found"
Pass "node $(node --version)"

if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
  Info "pnpm not found — installing..."
  npm install -g pnpm
}
Pass "pnpm found"

if (Test-Path $TargetPath) {
  Write-Host " WARN  Folder already exists: $TargetPath" -ForegroundColor Yellow
  Write-Host "       Delete it first or use:  .\setup.ps1 OtherName" -ForegroundColor Yellow
  exit 1
}

# ── 2. Clone + install ────────────────────────────────────────────────────────
Head "2/4  Clone & Install"

Info "Cloning $RepoUrl"
git clone $RepoUrl $TargetPath --quiet
if (-not $?) { Fail "git clone failed"; exit 1 }
Pass "Cloned into $TargetPath"

Set-Location $TargetPath

Info "Running pnpm install..."
pnpm install --silent
Pass "Dependencies installed"

# ── 3. Zod schema tests ───────────────────────────────────────────────────────
Head "3/4  Zod Schema Tests"

$ZodUnit  = "src\scripts\test-zod-schema.mjs"
$ZodReuse = "src\scripts\test-zod-reuse.mjs"

$unitOut = node $ZodUnit 2>&1
if ($LASTEXITCODE -eq 0) {
  $unitPass = ($unitOut | Select-String "PASS: (\d+)").Matches.Groups[1].Value
  Pass "Unit tests: $unitPass/32 pass  (LayerSchema · TextStyle · parse · zOrder)"
} else {
  Fail "Unit tests failed — run: node $ZodUnit"
}

$reuseOut = node $ZodReuse 2>&1
if ($LASTEXITCODE -eq 0) {
  $reusePass = ($reuseOut | Select-String "PASS: (\d+)").Matches.Groups[1].Value
  Pass "Reuse tests: $reusePass/30 pass  (MotionScene · LogoBanner · StatsCard)"
} else {
  Fail "Reuse tests failed — run: node $ZodReuse"
}

# ── 4. Key file check ─────────────────────────────────────────────────────────
Head "4/4  Key Files"

function CheckFile($path, $label) {
  if (Test-Path $path) { Pass $label }
  else                  { Fail "MISSING: $path" }
}

CheckFile "src\brand.ts"                                                             "Brand tokens          src\brand.ts"
CheckFile "src\brand-docs\BRAND.md"                                                  "Brand guide           src\brand-docs\BRAND.md"
CheckFile "src\brand-docs\D1A-motion.md"                                             "Motion guide          src\brand-docs\D1A-motion.md"
CheckFile "src\brand-docs\EDITOR-integration.md"                                     "Editor integration    src\brand-docs\EDITOR-integration.md"
CheckFile "src\features\editor\player\items\schemas\_shared.ts"                      "Zod shared schema     src\schemas\_shared.ts"
CheckFile "src\features\editor\player\items\schemas\motion-scene.schema.ts"          "Zod asset schema      src\schemas\motion-scene.schema.ts"
CheckFile "src\features\editor\player\items\motion-scene.tsx"                        "Composition           src\player\items\motion-scene.tsx"
CheckFile "src\features\editor\control-item\basic-motion-scene.tsx"                  "Control panel         src\control-item\basic-motion-scene.tsx"
CheckFile "src\features\editor\utils\autosave.ts"                                    "Autosave utils        src\utils\autosave.ts"
CheckFile "src\scripts\remotion-render.mjs"                                          "Render script         src\scripts\remotion-render.mjs"
CheckFile "src\app\api\render-local\route.ts"                                        "Render API            src\app\api\render-local\route.ts"
CheckFile "src\app\edit\editor-client.tsx"                                           "Editor client (SSR)   src\app\edit\editor-client.tsx"

# ── Final report ──────────────────────────────────────────────────────────────
Write-Host "`n------------------------------------------------------------"

if ($Failed -eq 0) {
  Write-Host "  READY" -ForegroundColor Green
  Write-Host ""
  Write-Host "  Start:  cd $TargetPath" -ForegroundColor Cyan
  Write-Host "          pnpm dev" -ForegroundColor Cyan
  Write-Host "  Open:   http://localhost:3000/edit" -ForegroundColor Cyan
  Write-Host ""
  Write-Host "  -- File map for AI / new developer --"
  Write-Host "  Brand tokens      src\brand.ts"
  Write-Host "  Brand docs        src\brand-docs\BRAND.md"
  Write-Host "  Motion rules      src\brand-docs\D1A-motion.md"
  Write-Host "  Motion examples   src\brand-docs\D1A-motion-describe.md"
  Write-Host "  New asset guide   src\brand-docs\EDITOR-integration.md"
  Write-Host ""
  Write-Host "  Zod shared        src\features\editor\player\items\schemas\_shared.ts"
  Write-Host "  Zod MotionScene   src\features\editor\player\items\schemas\motion-scene.schema.ts"
  Write-Host "  Composition       src\features\editor\player\items\motion-scene.tsx"
  Write-Host "  Control panel     src\features\editor\control-item\basic-motion-scene.tsx"
  Write-Host ""
  Write-Host "  Render script     src\scripts\remotion-render.mjs"
  Write-Host "  Render API        src\app\api\render-local\route.ts"
  Write-Host "  Export store      src\features\editor\store\use-download-state.ts"
  Write-Host "  Autosave          src\features\editor\utils\autosave.ts"
  Write-Host ""
  Write-Host "  Zod unit tests    src\scripts\test-zod-schema.mjs"
  Write-Host "  Zod reuse tests   src\scripts\test-zod-reuse.mjs"
  Write-Host "------------------------------------------------------------"
} else {
  Write-Host "  NOT READY — $Failed check(s) failed above" -ForegroundColor Red
  Write-Host "  Fix the issues listed above then re-run this script."
  Write-Host "------------------------------------------------------------"
  exit 1
}
