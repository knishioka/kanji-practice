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
#   build     = npm run build       (tsc -b && vite build)
#   lint      = npm run check       (Biome 2: lint + format チェックを一括)
#   format    = n/a                 (Biome の check に format チェックが含まれるため)
#   typecheck = tsc -b              (build より早期に失敗を可視化)
#   test      = npm run test:unit   (Vitest. e2e は Playwright で別途)
#
# SSOT: workspace docs/templates/verify-sh-template.sh

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
  local exit_code=0
  bash -c "$cmd" >/tmp/verify-"$name".log 2>&1 || exit_code=$?
  if [[ $exit_code -eq 0 ]]; then
    printf -v "$result_var" '%s' "pass"
    log_text "$(printf '  %-10s OK pass' "$name")"
  else
    printf -v "$result_var" '%s' "fail"
    ANY_FAIL=1
    local sep=""
    [[ -n "$FAILURES_JSON" ]] && sep=","
    FAILURES_JSON+="${sep}{\"step\":\"$name\",\"exit\":$exit_code}"
    log_text "$(printf '  %-10s FAIL (exit=%d) — see /tmp/verify-%s.log' "$name" "$exit_code" "$name")"
  fi
}

log_text "verify.sh: starting"

run_step build     RESULT_BUILD     "$BUILD_CMD"
run_step lint      RESULT_LINT      "$LINT_CMD"
run_step format    RESULT_FORMAT    "$FORMAT_CMD"
run_step typecheck RESULT_TYPECHECK "$TYPECHECK_CMD"
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
