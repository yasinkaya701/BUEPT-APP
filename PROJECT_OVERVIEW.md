# 🎓 BUEPT-APP: Comprehensive Project Overview

This document provides an exhaustive technical and functional breakdown of the BUEPT-APP project. It serves as the primary source of truth for maintainers and AI assistants.

---

## 🏗 System Architecture

BUEPT-APP is a high-performance, cross-platform ecosystem designed for Boğaziçi University English Proficiency Test (BUEPT) preparation.

### 1. Frontend Core
- **React Native**: Powers the mobile application (iOS & Android).
- **React Native for Web**: Transforms the mobile codebase into a responsive web application using a custom Webpack configuration (`web-rnw/`).
- **Navigation**: Managed via `@react-navigation/native` with a complex stack and tab-based architecture.

### 2. Backend & API Layer (`web-api-server.js`)
A unified Node.js server that acts as a:
- **Static File Server**: Serves the web-rnw build and native assets (APKs).
- **AI Gateway**: Interfaces with OpenAI (GPT-5 Mini), Hugging Face, and local Ollama instances.
- **Data Sync Bridge**: Handles user progress synchronization (`sync_bridge_store.json`).
- **Serverless Ready**: Exported as a request handler for Vercel and Netlify functions.

---

## 📂 Project Structure (Detailed)

### `/BUEPTApp/src`
- `screens/`: Contains 80+ screens covering all exam modules and AI features.
- `components/`: Reusable UI components (Cards, Inputs, Progress Bars).
- `context/`: State management (AppState, Auth, Theme).
- `hooks/`: Custom logic (useTts, useAIFeedback, useExamTimer).
- `theme/`: Design tokens (Colors, Spacing, Typography).
- `utils/`: Logic for grading, text processing, and AI prompt building.

### `/BUEPTApp/data`
The heart of the app's content, containing 60+ JSON files:
- `reading_tasks.json`, `listening_tasks.json`: Core exam content.
- `dictionary_core.json`: A massive academic dictionary (~10MB).
- `grammar_tasks_hard.json`: Specialized grammar training.
- `university_schedule_2025_fall.json`: Campus integration data.

### `/BUEPTApp/scripts`
Automation and expansion tools:
- `expand_*.py`: Python scripts that use LLMs to generate new exam tasks.
- `academic_density_boost.py`: Enhances existing text with more complex vocabulary.
- `run-ios-safe.sh`: Specialized script for building iOS while avoiding common build locks.

---

## 🧠 AI & Intelligent Features

The platform leverages "Unified Intelligence" to provide personalized feedback:
- **AI Speaking Partner**: Real-time voice interaction using TTS and STT.
- **Essay Evaluation**: Grades writing based on official BUEPT criteria (Task Response, Coherence, Lexical Resource, Grammatical Range).
- **AILessonVideoStudio**: Generates scripts and presentation structures for academic topics.
- **Mistake Coach**: Analyzes user errors across all modules and provides targeted recovery plans.

---

## 🎨 Design System

- **Aesthetic**: Premium "Glassmorphism" and "Academic Sleek".
- **Typography**: Uses modern sans-serif fonts with clear hierarchy for long-form reading.
- **Animations**: Subtle micro-interactions and transitions using `react-native-reanimated` or standard `Animated` API.

---

---

## 🔍 Module Deep Dive

### 📚 Reading & Listening
- **Shadowing Mode**: A specialized feature in `ListeningDetailScreen.js` that allows users to practice pronunciation by following the transcript in real-time.
- **Dynamic Questions**: Uses `buildSimilarQuestion.js` to generate variations of existing questions to prevent memorization.

### ✍️ Writing & Grammar
- **AI Grader**: `aiGrader.js` sends student essays to the backend with specific prompts to ensure grading consistency with Boğaziçi standards.
- **Grammar Section Exam**: Simulates the specific "Section 1" of BUEPT, focusing on sentence transformation and error identification.

### 🗣 AI Speaking Lab
- **Speaking Mock Interview**: A full simulation of the BUEPT speaking component, including prep time and recorded responses.

---

## ⚙️ Technical Gotchas & Maintenance

- **Xcode Script Sandboxing**: Must be disabled (`ENABLE_USER_SCRIPT_SANDBOXING = NO`) in Build Settings to allow React Native's bundling scripts to run correctly.
- **Large Data Files**: `dictionary_core.json` and `dictionary_subset.json` are critical for the app's offline features but should be handled carefully during Git operations to avoid bloat.
- **Web Build Path**: Always use `publicPath=/` for Vercel/Netlify root deployments, but `publicPath=/BUEPT-APP/` for subdirectory hosting.

---

## 🛠 Content Generation Pipeline

The project includes a robust Python-based pipeline for content creation:
1. **Raw Ingestion**: `scripts/cleanup_dictionary.py` cleans up external data.
2. **Expansion**: `BUEPTApp/data/expand_reading.py` uses LLMs to generate C1/C2 level academic passages.
3. **Normalization**: `scripts/sanitize_dictionary.py` ensures all generated content follows the app's schema.

---

## 🚀 Deployment & Build Pipeline

### Web Deployment
- **Vercel**: Primary host, uses `vercel.json` and `api/index.js`.
- **Netlify**: Secondary/Backup host, uses `netlify.toml` and `netlify/functions`.
- **Trigger**: Automatic deployment on push to `origin/main`.

### Mobile Deployment
- **Android**: Generated via `react-native run-android`. Release APKs are stored in the root for direct download.
- **iOS**: Built via Xcode. Requires `ENABLE_USER_SCRIPT_SANDBOXING=NO` and specific CocoaPods handling.

---

## 📝 Recent Technical Milestones
- **2026-05-01**: Resolved critical syntax error in `ListeningDetailScreen.js` that blocked web builds.
- **2026-05-01**: Integrated a persistent `PROJECT_OVERVIEW.md` to streamline context sharing.
- **Optimization**: Implemented text-chunking for Web Speech API to handle long academic transcripts without browser timeouts.

---
*This document is the "Source of Truth" for the BUEPT-APP workspace.*
