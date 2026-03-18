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
  if lsof -ti tcp:8081 >/dev/null 2>&1; then
    return
  fi

  cd "$ROOT_DIR"
  nohup npm start -- --port 8081 >/tmp/buept-metro.log 2>&1 < /dev/null &
  sleep 4
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
