# 💰 ItungIn Financial Tracker (v2.0)

[![React](https://img.shields.io/badge/React-20232a?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Capacitor](https://img.shields.io/badge/Capacitor-119EFF?style=for-the-badge&logo=Capacitor&logoColor=white)](https://capacitorjs.com/)

ItungIn is a premium, high-performance Personal Finance application designed for modern users. Re-engineered for mobile-first experiences with a focus on stunning aesthetics, robust debt management, and seamless onboarding flows.

---

## ✨ Key Features

### 🚀 Advanced Onboarding & Auth
- **Hybrid Auth Flow**: Choose between high-security **Google Sign-In** for cloud sync or **Guest Mode** for local-first privacy.
- **Dynamic Profile Management**: Smart profile UI that adapts based on authentication status. Google users enjoy cloud synchronization alerts, while Guests get focused local tracking.
- **Interactive App Tour**: A comprehensive, step-by-step interactive onboarding tour (powered by `driver.js`) that guides users through every core feature.

### 💎 ItungIn Plus (Premium Features)
- **Deep Analytics**: Visualize your financial trends over months or years with interactive cash-flow charts.
- **Goal-Based Savings**: Create and track multiple savings goals with automated balance deductions and progress tracking.
- **Advanced Budgeting**: Set category-specific limits with real-time visual warnings (Safe/Warning/Exceeded).

### 🏦 Core Financial Engine
- **Smart Dashboard**: Real-time balance updates, donut-chart visualizations, and quick-action transaction entries.
- **Robust Debt Tracker**: Comprehensive management for Bank Loans, Personal Debts, and more. Includes a **Debt-to-Income (DTI)** health indicator.
- **Recurring Bills**: Track subscriptions (Netflix, Spotify, etc.) with automatic monthly rolling and notification reminders.

---

## 📱 Mobile Migration

ItungIn is powered by **Capacitor**, enabling a native-like experience on Android:
- **Native UI/UX**: Optimized performance for smooth mobile interactions.
- **Local Storage Persistence**: Fast, reliable data access even without internet connectivity.
- **Responsive Layouts**: Meticulously crafted using Tailwind CSS v4 for perfect rendering on any screen size.

---

## 🛠 Technology Stack

- **Core**: React 19 + Vite 7 (Latest generation performance)
- **Styling**: Tailwind CSS v4.2 (Utility-first, highly customized)
- **Native Bridge**: Capacitor (Android Migration Path)
- **Animations**: CSS transitions + Custom SVG keyframes
- **State**: React Context API (Predictable global state)
- **Tutorials**: Driver.js (Customized for React Portals)

---

## 💻 Getting Started

### Prerequisites
- Node.js (v18+)
- Android Studio (for mobile build)

### Installation
1.  **Clone & Install**:
    ```bash
    git clone https://github.com/gfenderio/ItungIn-Financial-Tracker.git
    cd ItungIn-Financial-Tracker
    npm install
    ```
2.  **Web Development**:
    ```bash
    npm run dev
    ```
3.  **Android Sync**:
    ```bash
    npx cap sync android
    npx cap open android
    ```

---

## 📁 Project Structure

- `src/components/`: Modular UI components (Onboarding, Tour Overlays, Custom Modals).
- `src/contexts/`: Global state management (`AppContext.jsx`) handling transaction logic and auth state.
- `src/pages/`: Feature-rich views including the **Premium Hub**, **Analytics**, and **Debt Tracker**.
- `android/`: Native Android platform bridge and configuration.

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---
*Developed with ❤️ to empower your financial freedom.*
