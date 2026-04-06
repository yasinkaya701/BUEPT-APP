#!/bin/zsh
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
IOS_DIR="$ROOT_DIR/ios"
DERIVED_DATA_PATH="/tmp/BUEPTAppRun"
DEFAULT_DEVICE="iPad Air 11-inch (M3)"
DEVICE_NAME="${1:-$DEFAULT_DEVICE}"
BUNDLE_ID="org.reactjs.native.example.BUEPTApp"
APP_PATH="$DERIVED_DATA_PATH/Build/Products/Debug-iphonesimulator/BUEPTApp.app"
DEFAULT_DB="$HOME/Library/Developer/Xcode/DerivedData/BUEPTApp-alicmwyoeippqmfdwlhbnfjaunqu/Build/Intermediates.noindex/XCBuildData/build.db"
SAFE_DB="$DERIVED_DATA_PATH/Build/Intermediates.noindex/XCBuildData/build.db"

find_device_id() {
  xcrun simctl list devices available | grep -F "$DEVICE_NAME" | head -n 1 | sed -E 's/.*\(([0-9A-F-]+)\) \(.*/\1/'
}

ensure_metro() {
  local metro_pid metro_cwd
  metro_pid="$(lsof -ti tcp:8081 -sTCP:LISTEN | head -n 1 || true)"

  if [[ -n "$metro_pid" ]]; then
    metro_cwd="$(lsof -a -p "$metro_pid" -d cwd -Fn 2>/dev/null | sed -n 's/^n//p' | head -n 1 || true)"
    if [[ -n "$metro_cwd" && "$metro_cwd" == "$ROOT_DIR"* ]]; then
      return
    fi

    echo "Port 8081 is busy by another Metro process. Restarting Metro from this project..."
    kill "$metro_pid" >/dev/null 2>&1 || true
    sleep 1
  fi

  cd "$ROOT_DIR"
  nohup npm start -- --port 8081 --reset-cache >/tmp/buept-metro.log 2>&1 < /dev/null &

  local tries=0
  while ! lsof -ti tcp:8081 -sTCP:LISTEN >/dev/null 2>&1; do
    tries=$((tries + 1))
    if [[ $tries -ge 20 ]]; then
      echo "Metro did not start on 8081. Last logs:" >&2
      tail -n 80 /tmp/buept-metro.log >&2 || true
      exit 1
    fi
    sleep 1
  done
}

DEVICE_ID="$(find_device_id)"
if [[ -z "$DEVICE_ID" ]]; then
  echo "Simulator not found: $DEVICE_NAME" >&2
  exit 1
fi

pkill -f "xcodebuild .*BUEPTApp.xcworkspace" >/dev/null 2>&1 || true
rm -f "$DEFAULT_DB" >/dev/null 2>&1 || true
rm -f "$SAFE_DB" >/dev/null 2>&1 || true

open -a Simulator >/dev/null 2>&1 || true
xcrun simctl boot "$DEVICE_ID" >/dev/null 2>&1 || true
xcrun simctl bootstatus "$DEVICE_ID" -b

ensure_metro

xcodebuild \
  -workspace "$IOS_DIR/BUEPTApp.xcworkspace" \
  -scheme BUEPTApp \
  -configuration Debug \
  -destination "id=$DEVICE_ID" \
  -derivedDataPath "$DERIVED_DATA_PATH" \
  build

xcrun simctl install "$DEVICE_ID" "$APP_PATH"
xcrun simctl terminate "$DEVICE_ID" "$BUNDLE_ID" >/dev/null 2>&1 || true
xcrun simctl launch "$DEVICE_ID" "$BUNDLE_ID"
