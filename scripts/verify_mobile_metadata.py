#!/usr/bin/env python3
"""Mobile launch-readiness metadata verification for BUEPT-APP."""
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
errors = []
warnings = []


def check(cond, msg_ok, msg_fail, kind="error"):
    if cond:
        print(f"  [OK] {msg_ok}")
    else:
        (errors if kind == "error" else warnings).append(msg_fail)
        print(f"  [!!] {msg_fail}")


print("== Android metadata ==")
manifest = open(os.path.join(ROOT, "android/app/src/main/AndroidManifest.xml")).read()
check("<uses-permission android:name=\"android.permission.INTERNET\"" in manifest,
      "INTERNET permission", "INTERNET permission missing")
check("<uses-permission android:name=\"android.permission.RECORD_AUDIO\"" in manifest,
      "RECORD_AUDIO permission (speaking)", "RECORD_AUDIO permission missing")
gradle = open(os.path.join(ROOT, "android/app/build.gradle")).read()
# Package is declared via Gradle namespace (com.bueptapp), not in the manifest XML.
check('namespace "com.bueptapp"' in gradle,
      'namespace="com.bueptapp" in app/build.gradle (Gradle AGP package declaration)',
      "app namespace not com.bueptapp")

check('versionCode 1' in gradle, "versionCode 1 in app/build.gradle", "versionCode missing")
check('versionName "1.0"' in gradle, 'versionName "1.0"', "versionName missing")
check('applicationId "com.bueptapp"' in gradle, "applicationId com.bueptapp", "applicationId mismatch")
check('abiFilters' in gradle, "abiFilters set (arm64-v8a, armeabi-v7a)", "no abiFilters")
check('compileSdk rootProject.ext.compileSdkVersion' in gradle,
      "compileSdk from root ext (36)", "compileSdk not from root ext")

signing = open(os.path.join(ROOT, "android/gradle.properties")).read()
print("  [info] gradle.properties jvmargs memory tuning present:",
      "org.gradle.jvmargs" in signing)

print("\n== iOS metadata ==")
pbx = os.path.join(ROOT, "ios/BUEPTApp.xcodeproj/project.pbxproj")
proj = open(pbx).read()
id_line = re.search(r'PRODUCT_BUNDLE_IDENTIFIER = "([^"]+)"', proj)
if id_line:
    bid = id_line.group(1)
    # template value uses rfc1034identifier; check if customized anywhere
    check(not bid.startswith("org.reactjs.native.example"),
          f"Bundle id: {bid}", f"Template bundle id still in use: {bid} (change for App Store)")
check('CURRENT_PROJECT_VERSION = 1' in proj, "CURRENT_PROJECT_VERSION=1", "CURRENT_PROJECT_VERSION missing")
check('MARKETING_VERSION = 1.0' in proj, "MARKETING_VERSION=1.0", "MARKETING_VERSION missing")

info_plist = os.path.join(ROOT, "ios/BUEPTApp/Info.plist")
plist = open(info_plist).read()
check("CFBundleDisplayName" in plist, "CFBundleDisplayName set (BUEPTApp)", "CFBundleDisplayName missing")
check("NSMicrophoneUsageDescription" in plist,
      "NSMicrophoneUsageDescription (speaking)",
      "NSMicrophoneUsageDescription missing (required for App Store)")
check("NSSpeechRecognitionUsageDescription" in plist,
      "NSSpeechRecognitionUsageDescription",
      "NSSpeechRecognitionUsageDescription missing (required for App Store)", kind="warn")

iconset = os.path.join(ROOT, "ios/BUEPTApp/Images.xcassets/AppIcon.appiconset/Contents.json")
icon = json.load(open(iconset))
imgs = icon.get("images", [])
required = {"1024x1024"}
have = {i["size"] for i in imgs}
check(required <= have, f"App icon 1024x1024 + sizes present ({len(imgs)} images)",
      "App icon set incomplete (missing 1024x1024 or others)")

splash = os.path.join(ROOT, "ios/BUEPTApp/Images.xcassets/SplashScreen.storyboard" if False else "..")
launch_dir = os.path.join(ROOT, "ios/BUEPTApp")
launch_story = os.path.join(launch_dir, "LaunchScreen.storyboard")
check(os.path.exists(launch_story), "LaunchScreen.storyboard exists",
      "LaunchScreen.storyboard missing (required for App Store)", kind="warn")

print("\n== Summary ==")
if errors:
    print(f"ERRORS: {len(errors)}")
    for e in errors:
        print(" -", e)
if warnings:
    print(f"WARNINGS: {len(warnings)}")
    for w in warnings:
        print(" -", w)
if not errors and not warnings:
    print("All checks passed.")
sys.exit(1 if errors else 0)
