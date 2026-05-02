#!/usr/bin/env bash
# verify.sh — kanji-practice verification entrypoint.
#
# 役割:
#   build / lint / format / typecheck / test を一括で実行し、
#   人間 / Codex / CI どれが叩いても同じ結果が返るようにする。
#
# 使い方:
#   ./scripts/verify.sh           # 人間可読 (text)
#   ./scripts/verify.sh --json    # 構造化結果 (CI / Codex 用)
#
# 出力契約 (--json):
#   {"build":"pass|fail|n/a","lint":"...","format":"...","typecheck":"...","test":"...","failures":[{"step":"lint","exit":1}]}
#
# Exit code:
#   0  全 step pass / n/a
#   1  1 つ以上 fail
#   2  環境エラー (依存ツール不在で実行できない等)
#
# kanji-practice 固有のマッピング:
#   typecheck = tsc -b              (最初に走らせて早期失敗を可視化)
#   lint      = npm run check       (Biome 2: lint + format チェックを一括)
#   format    = n/a                 (Biome の check に format チェックが含まれるため)
#   build     = npm run build       (tsc -b && vite build。typecheck pass 後は tsc 部分は no-op)
#   test      = npm run test:unit   (Vitest. e2e は Playwright で別途)
#
# 失敗 step の出力は stderr に tail -n 200 でミラーするため、CI / Codex のコンソールに
# 原因が表示される。step ごとの log は mktemp -d で per-run の一時 dir に置き、終了時に削除する。
#
# SSOT: workspace docs/templates/verify-sh-template.sh (順序のみリポ事情で入れ替え)

set -euo pipefail

# ------------------------------------------------------------------
# 1. リポ別に書き換える領域 (ここから)
# ------------------------------------------------------------------

BUILD_CMD="npm run build"
LINT_CMD="npm run check"
FORMAT_CMD=""           # n/a — Biome check が format も兼ねる
TYPECHECK_CMD="npx tsc -b"
TEST_CMD="npm run test:unit"

# ------------------------------------------------------------------
# 1. リポ別に書き換える領域 (ここまで)
# ------------------------------------------------------------------

JSON_MODE=0
[[ "${1:-}" == "--json" ]] && JSON_MODE=1

# Per-run temp dir for step logs. mktemp avoids collisions in multi-user / parallel-CI envs
# (PR #32 review: do not reuse fixed /tmp/verify-*.log paths).
LOG_DIR="$(mktemp -d -t verify-sh-XXXXXX)"
trap 'rm -rf "$LOG_DIR"' EXIT

# Bash 3.2 (macOS default /bin/bash) でも動くよう個別変数で結果を保持。
RESULT_BUILD=""
RESULT_LINT=""
RESULT_FORMAT=""
RESULT_TYPECHECK=""
RESULT_TEST=""
FAILURES_JSON=""
ANY_FAIL=0

log_text() {
  if [[ $JSON_MODE -eq 0 ]]; then
    printf '%s\n' "$1"
  fi
}

# run_step <name> <result_var_name> <cmd>
run_step() {
  local name="$1" result_var="$2" cmd="$3"
  if [[ -z "$cmd" ]]; then
    printf -v "$result_var" '%s' "n/a"
    log_text "$(printf '  %-10s n/a' "$name")"
    return 0
  fi
  log_text "$(printf '  %-10s running: %s' "$name" "$cmd")"
  local log_path="$LOG_DIR/$name.log"
  local exit_code=0
  bash -c "$cmd" >"$log_path" 2>&1 || exit_code=$?
  if [[ $exit_code -eq 0 ]]; then
    printf -v "$result_var" '%s' "pass"
    log_text "$(printf '  %-10s OK pass' "$name")"
  else
    printf -v "$result_var" '%s' "fail"
    ANY_FAIL=1
    local sep=""
    [[ -n "$FAILURES_JSON" ]] && sep=","
    FAILURES_JSON+="${sep}{\"step\":\"$name\",\"exit\":$exit_code}"
    log_text "$(printf '  %-10s FAIL (exit=%d) — log:' "$name" "$exit_code")"
    # Mirror the failed step's log to stderr so CI / Codex consoles surface the cause
    # without needing to fetch a file inside the runner.
    {
      printf '\n----- verify.sh: %s failed (exit=%d) -----\n' "$name" "$exit_code"
      tail -n 200 "$log_path"
      printf '----- end %s -----\n\n' "$name"
    } >&2
  fi
}

log_text "verify.sh: starting (log_dir=$LOG_DIR)"

# Step order is intentionally typecheck → lint → format → build → test.
# Rationale (PR #32 review): typecheck and lint are cheap, fail fastest, and surface
# the most common errors. build runs tsc -b internally so a passing typecheck makes
# build's tsc phase a no-op; running build first would just delay feedback.
run_step typecheck RESULT_TYPECHECK "$TYPECHECK_CMD"
run_step lint      RESULT_LINT      "$LINT_CMD"
run_step format    RESULT_FORMAT    "$FORMAT_CMD"
run_step build     RESULT_BUILD     "$BUILD_CMD"
run_step test      RESULT_TEST      "$TEST_CMD"

if [[ $JSON_MODE -eq 1 ]]; then
  printf '{"build":"%s","lint":"%s","format":"%s","typecheck":"%s","test":"%s","failures":[%s]}\n' \
    "$RESULT_BUILD" "$RESULT_LINT" "$RESULT_FORMAT" "$RESULT_TYPECHECK" "$RESULT_TEST" \
    "$FAILURES_JSON"
fi

if [[ $ANY_FAIL -eq 1 ]]; then
  exit 1
fi
exit 0
