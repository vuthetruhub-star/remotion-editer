#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# D1A Motion Editor — Full Setup Script (Mac / Linux)
#
# One-liner install:
#   curl -fsSL https://raw.githubusercontent.com/vuthetruhub-star/remotion-editer/main/scripts/setup.sh | bash
#
# Local run:
#   bash scripts/setup.sh [project-name]
# ─────────────────────────────────────────────────────────────────────────────

set -e

REPO_URL="https://github.com/vuthetruhub-star/remotion-editer.git"
PROJECT_NAME="${1:-d1a-motion-editor}"
TARGET_DIR="$HOME/Downloads/$PROJECT_NAME"

# ── colours ──────────────────────────────────────────────────────────────────
GRN="\033[0;32m"; RED="\033[0;31m"; YLW="\033[0;33m"
CYN="\033[0;36m"; BLD="\033[1m"; RST="\033[0m"

pass() { echo -e " ${GRN}✓${RST} $1"; }
fail() { echo -e " ${RED}✗${RST} $1"; FAILED=1; }
info() { echo -e " ${CYN}→${RST} $1"; }
head() { echo -e "\n${BLD}$1${RST}"; }

FAILED=0

# ─────────────────────────────────────────────────────────────────────────────
echo -e "\n${BLD}${CYN}D1A Motion Editor — Setup${RST}"
echo    "────────────────────────────────────────────────────────────"

# ── 1. Pre-flight checks ──────────────────────────────────────────────────────
head "1/4  Pre-flight"

command -v git  >/dev/null 2>&1 && pass "git found"      || { fail "git not found — install git first"; exit 1; }
command -v node >/dev/null 2>&1 && pass "node $(node -v)" || { fail "node not found — install Node.js 18+"; exit 1; }
command -v pnpm >/dev/null 2>&1 && pass "pnpm found"     || { info "pnpm not found — installing..."; npm install -g pnpm; }

if [ -d "$TARGET_DIR" ]; then
  echo -e " ${YLW}⚠${RST}  Folder already exists: $TARGET_DIR"
  echo    "    Delete it first or use: bash setup.sh my-other-name"
  exit 1
fi

# ── 2. Clone + install ────────────────────────────────────────────────────────
head "2/4  Clone & Install"

info "Cloning $REPO_URL"
git clone "$REPO_URL" "$TARGET_DIR" --quiet
pass "Cloned into $TARGET_DIR"

cd "$TARGET_DIR"

info "Running pnpm install..."
pnpm install --silent
pass "Dependencies installed"

# ── 3. Zod schema tests ───────────────────────────────────────────────────────
head "3/4  Zod Schema Tests"

ZOD_UNIT="src/scripts/test-zod-schema.mjs"
ZOD_REUSE="src/scripts/test-zod-reuse.mjs"

if node "$ZOD_UNIT" >/dev/null 2>&1; then
  UNIT_COUNT=$(node "$ZOD_UNIT" 2>/dev/null | grep -o "PASS: [0-9]*" | grep -o "[0-9]*")
  pass "Unit tests: ${UNIT_COUNT}/32 pass  (LayerSchema · TextStyle · parse · zOrder)"
else
  fail "Unit tests failed — run: node $ZOD_UNIT"
fi

if node "$ZOD_REUSE" >/dev/null 2>&1; then
  REUSE_COUNT=$(node "$ZOD_REUSE" 2>/dev/null | grep -o "PASS: [0-9]*" | grep -o "[0-9]*")
  pass "Reuse tests: ${REUSE_COUNT}/30 pass  (MotionScene · LogoBanner · StatsCard)"
else
  fail "Reuse tests failed — run: node $ZOD_REUSE"
fi

# ── 4. Key file check ─────────────────────────────────────────────────────────
head "4/4  Key Files"

check_file() {
  [ -f "$1" ] && pass "$2" || fail "MISSING: $1"
}

check_file "src/brand.ts"                                                    "Brand tokens          src/brand.ts"
check_file "src/brand-docs/BRAND.md"                                         "Brand guide           src/brand-docs/BRAND.md"
check_file "src/brand-docs/D1A-motion.md"                                    "Motion guide          src/brand-docs/D1A-motion.md"
check_file "src/brand-docs/EDITOR-integration.md"                            "Editor integration    src/brand-docs/EDITOR-integration.md"
check_file "src/features/editor/player/items/schemas/_shared.ts"             "Zod shared schema     src/schemas/_shared.ts"
check_file "src/features/editor/player/items/schemas/motion-scene.schema.ts" "Zod asset schema      src/schemas/motion-scene.schema.ts"
check_file "src/features/editor/player/items/motion-scene.tsx"               "Composition           src/player/items/motion-scene.tsx"
check_file "src/features/editor/control-item/basic-motion-scene.tsx"         "Control panel         src/control-item/basic-motion-scene.tsx"
check_file "src/features/editor/utils/autosave.ts"                           "Autosave utils        src/utils/autosave.ts"
check_file "src/scripts/remotion-render.mjs"                                 "Render script         src/scripts/remotion-render.mjs"
check_file "src/app/api/render-local/route.ts"                               "Render API            src/app/api/render-local/route.ts"
check_file "src/app/edit/editor-client.tsx"                                  "Editor client (SSR)   src/app/edit/editor-client.tsx"

# ── Final report ──────────────────────────────────────────────────────────────
echo ""
echo "────────────────────────────────────────────────────────────"

if [ "$FAILED" -eq 0 ]; then
  echo -e "${GRN}${BLD}  READY${RST}"
  echo ""
  echo -e "  Start:    ${CYN}cd $TARGET_DIR && pnpm dev${RST}"
  echo -e "  Open:     ${CYN}http://localhost:3000/edit${RST}"
  echo ""
  echo "  ── File map for AI / new developer ──────────────────────"
  echo "  Brand tokens      src/brand.ts"
  echo "  Brand docs        src/brand-docs/BRAND.md"
  echo "  Motion rules      src/brand-docs/D1A-motion.md"
  echo "  Motion examples   src/brand-docs/D1A-motion-describe.md"
  echo "  New asset guide   src/brand-docs/EDITOR-integration.md"
  echo ""
  echo "  Zod shared        src/features/editor/player/items/schemas/_shared.ts"
  echo "  Zod MotionScene   src/features/editor/player/items/schemas/motion-scene.schema.ts"
  echo "  Composition       src/features/editor/player/items/motion-scene.tsx"
  echo "  Control panel     src/features/editor/control-item/basic-motion-scene.tsx"
  echo ""
  echo "  Render script     src/scripts/remotion-render.mjs"
  echo "  Render API        src/app/api/render-local/route.ts"
  echo "  Export store      src/features/editor/store/use-download-state.ts"
  echo "  Autosave          src/features/editor/utils/autosave.ts"
  echo ""
  echo "  Zod unit tests    src/scripts/test-zod-schema.mjs"
  echo "  Zod reuse tests   src/scripts/test-zod-reuse.mjs"
  echo "────────────────────────────────────────────────────────────"
else
  echo -e "${RED}${BLD}  NOT READY — some checks failed above${RST}"
  echo "  Re-run after fixing the issues listed above."
  echo "────────────────────────────────────────────────────────────"
  exit 1
fi
