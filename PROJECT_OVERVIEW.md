# BUEPT-APP Project Overview

This document provides a high-level summary of the BUEPT-APP project to maintain context across development sessions and track deployment status.

## 🎯 Project Goals
Industrializing the BUEPT (Boğaziçi University English Proficiency Test) preparation platform. The app supports Reading, Listening, Speaking, and Writing assessments with AI-powered feedback and modern UI/UX.

## 🛠 Tech Stack
- **Frontend**: React Native (Cross-platform Mobile)
- **Web**: React Native for Web (via Webpack in `web-rnw`)
- **Backend/API**: Node.js serverless functions (Vercel/Netlify)
- **Styling**: React Native StyleSheet (Flexbox)
- **Deployment**: GitHub (Source), Vercel/Netlify (Web Hosting), Native APKs/IPAs

## 📁 Key Directory Structure
- `/BUEPTApp/src`: Core application logic, hooks, and UI components.
- `/BUEPTApp/data`: JSON data stores for reading tasks, grammar exercises, and templates.
- `/BUEPTApp/web-rnw`: Web-specific configuration (webpack, public assets).
- `/BUEPTApp/api`: API endpoints for AI integrations and data handling.
- `/BUEPTApp/scripts`: Python and JS scripts for content generation and maintenance.
- `/BUEPTApp/ios` & `/BUEPTApp/android`: Native mobile project configurations.

## 🚀 Deployment Status
- **Web**: Deployed via Vercel and Netlify (triggered by GitHub pushes).
- **Mobile**: Manual builds for Android (APK) and iOS (IPA).

## 📝 Recent Changes & Context
- **2026-05-01**: Addressing deployment crashes. Previous builds failed due to Xcode lock issues and sandbox restrictions.
- **Project Structure**: The main React Native project is in the `BUEPTApp/` subdirectory. The root folder contains various auxiliary scripts and generated assets (APKs, IPAs).
- **Current Objective**: Ensuring stable web deployment and keeping project documentation updated via this file.

---
*This file is updated periodically to assist the AI assistant in maintaining project context.*
