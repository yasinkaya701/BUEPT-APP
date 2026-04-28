# BUEPT-APP 🎓

**BUEPT-APP** is a comprehensive, cross-platform mobile and web application built with React Native. It is specifically designed to help students prepare for the **Boğaziçi University English Proficiency Test (BUEPT)**. 

The application offers a fully featured 1:1 UI across both Mobile (iOS/Android) and Web platforms, integrating state-of-the-art AI assistance to provide targeted, real-time feedback on student performance.

---

## 🌟 Key Features

*   **Multi-Platform Support:** Run flawlessly on iOS, Android, and Web using React Native Web.
*   **Comprehensive Test Modules:** Dedicated sections for **Reading, Listening, Writing, Speaking, and Grammar**.
*   **Intelligent Mistake Coach:** An AI-powered tutor that explains errors and provides study tips dynamically.
*   **Speaking & Writing Feedback:** Automated evaluations, band score estimations, and suggestions for academic tone.
*   **Photo OCR Integration:** Extract text from photos for instant vocabulary and grammar analysis.
*   **Offline / Hybrid AI Infrastructure:** Supports 100% local, privacy-first AI via **Ollama**, or cloud-based models via **OpenAI/Gemini**.

---

## 🚀 Getting Started

### Prerequisites
*   Node.js (v18+)
*   React Native development environment (Xcode for iOS, Android Studio for Android)
*   (Optional) Ollama for local AI features.

### Installation

Clone the repository and install the dependencies:

```bash
npm install
```

### Running the Mobile App (iOS / Android)

Start the Metro Bundler:

```bash
npm start
```

In a new terminal window, launch the application on your emulator or connected device:

```bash
npm run android
# or
npm run ios
```

---

## 🌐 Web Development (React Native Web)

BUEPT-APP is fully optimized for the browser with a 1:1 UI parity. 

**Start the development server:**
```bash
npm run web:rnw:start
```

**Build for Production:**
```bash
npm run web:rnw:build:root
```

**Start the Web UI with the Local AI Server (One-Click):**
```bash
./scripts/start-web-local-ai.sh
```

---

## 🤖 AI Configuration (Cloud & Local)

BUEPT-APP features a hybrid AI architecture. You can choose to use hosted cloud APIs (OpenAI / Gemini) or run the AI completely locally on your machine for zero-latency, offline, and privacy-first tutoring. The Mistake Coach, Chatbot, and Speaking Feedback modules all adapt to your selected configuration.

### Configuring via the App Settings
1. Navigate to the **"Settings"** or **"AI Config"** panel within the app.
2. Select your preferred **Provider**:
   *   **OpenAI or Gemini (BYOK):** Enter your API key (Bring Your Own Key). Requests are securely routed via our proxy backend.
   *   **Ollama (Local AI):** Enter your local machine's Ollama URL (default: `http://localhost:11434`) and the Model Name (e.g., `llama3.2:1b`).

### Setting Up Local AI (Ollama)
To run the AI completely offline on your computer:
1. Download and install [Ollama](https://ollama.com/).
2. Open your terminal and pull the desired model:
   ```bash
   ollama run llama3.2:1b
   ```
3. Once running, select **Ollama** in the app settings. All AI tutoring requests will now be processed directly on your local network—requiring no internet connection and ensuring your data never leaves your device.

---

## 📜 License

This project is developed for educational purposes targeting the Boğaziçi University English Proficiency Test.
