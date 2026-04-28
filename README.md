# BUEPT-APP 🎓

**BUEPT-APP** is a comprehensive, open-source, and fully offline-capable mobile and web application built with React Native. It is specifically designed to help university students prepare for the **Boğaziçi University English Proficiency Test (BUEPT)**. 

The application provides a seamless 1:1 UI parity across iOS, Android, and Web browsers, integrating state-of-the-art, **privacy-first AI features** to act as a 24/7 personal English tutor.

---

## 🌟 Comprehensive Feature Set

### 1. Test Preparation Modules
*   **📖 Reading:** Passages designed to mirror the exact lexical density and question types (Main Idea, Detail, Inference, Vocabulary in Context) of the actual BUEPT reading section.
*   **🎧 Listening:** Integrated audio player simulating academic lectures and interviews. Students practice note-taking and answering complex multiple-choice questions.
*   **✍️ Writing (Essay & Paragraph):** A full-featured text editor with live word counting, timed practice, and instant, AI-driven band score estimations and academic revisions.
*   **🗣️ Speaking:** Voice-recording capabilities for simulated exam interviews. Get instant feedback on fluency, coherence, lexical resource, and grammatical range.
*   **📝 Grammar & Vocabulary:** Targeted practice drills and flashcards for academic structures and high-frequency university vocabulary.

### 2. Intelligent, Serverless AI Tutors
*   **Mistake Coach:** An AI companion that analyzes exactly *why* you chose the wrong answer in a reading/listening test and provides a tailored explanation without giving away the correct answer immediately.
*   **Writing & Speaking Evaluator:** Submit your essay or spoken response to receive a detailed breakdown of your strengths, areas of improvement, and a corrected version of your text.
*   **Video Lesson & Presentation Generator:** Automatically generate academic presentation slides and lesson storyboards based on any given topic or weak point.
*   **Interactive Chatbot:** A general-purpose English tutor available on the home screen to answer quick questions or simulate casual conversations.

---

## 🔒 The 100% Serverless, Privacy-First AI Architecture

BUEPT-APP introduces a revolutionary, fully decentralized AI infrastructure. **You are in complete control of your data.**

By default, the application connects directly to the AI provider from your browser or device, **bypassing all centralized cloud backends**.

### How to Configure Your AI (Settings Menu)

Navigate to the **Settings** tab in the app and select your preferred AI provider:

1.  **Ollama (100% Offline & Free):** 
    *   Run AI models entirely on your own laptop. 
    *   No internet connection required. Zero data leaves your device.
    *   **Setup:** Download [Ollama](https://ollama.com/), run `ollama run llama3.2:1b` in your terminal, and enter `http://localhost:11434` as your URL in the app settings.

2.  **OpenAI (Direct BYOK):** 
    *   Select OpenAI and enter your own API key. 
    *   The app communicates *directly* with `api.openai.com`. No intermediate proxies, ensuring maximum privacy and no third-party rate limits.

3.  **Google Gemini (Direct BYOK):** 
    *   Select Gemini and enter your API key. 
    *   The app connects *directly* to Google's REST API (`generativelanguage.googleapis.com`).

*(Note: If you leave the API key blank, the app will safely fall back to a shared, rate-limited public cloud proxy.)*

---

## 🚀 Getting Started

### Prerequisites
*   Node.js (v18+)
*   React Native development environment (Xcode for iOS, Android Studio for Android)
*   *(Optional)* Ollama for local AI features.

### Installation

Clone the repository and install the dependencies:

```bash
npm install
```

### Running on Mobile (iOS / Android)

Start the React Native Metro Bundler:

```bash
npm start
```

In a new terminal window, launch the application on your emulator or connected physical device:

```bash
npm run android
# or
npm run ios
```

---

## 🌐 Web Development (React Native Web)

BUEPT-APP is meticulously optimized for the browser. It compiles React Native components into high-performance DOM elements, providing the exact same experience as the mobile app.

**Start the local development server:**
```bash
npm run web:rnw:start
```

**Build for Production (Vercel / Netlify):**
```bash
npm run web:rnw:build:root
```

**Start the Web UI alongside Local AI (One-Click script):**
```bash
./scripts/start-web-local-ai.sh
```

---

## 📦 Deployment

The project is pre-configured for automated deployment on Vercel or Netlify. 
Because the app relies on **Direct Client-to-Provider AI Fetching**, the compiled web bundle requires **NO backend Node.js server**. 

1. Push your code to the `main` branch.
2. Link the repository to your Vercel or Netlify account.
3. Set the build command to `npm run web:rnw:build:root` and the output directory to `dist` or `web-build`.
4. The site is instantly live and fully operational worldwide.

---

## 📜 License

This project is developed for educational purposes to assist students targeting the Boğaziçi University English Proficiency Test.
