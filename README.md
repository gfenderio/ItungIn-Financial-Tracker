# ItungIn Financial Tracker

ItungIn is a modern, beautifully designed Personal Finance tracking web application built with React and styled with Tailwind CSS. This application offers a seamless experience for managing daily transactions, comprehensively tracking active debts, and evaluating your overall financial health.

## 🌟 Features

*   **Smart Dashboard**: A dynamic dashboard providing a bird's-eye view of your finances.
    *   **Interactive Donut Chart**: Proportional SVG-based donut charts visualizing your Income vs. Expenses, complete with smooth drawing animations.
    *   **Time Period Filtering**: Easily filter transactions by 'This Month', 'Last Month', 'Month to Date', or via a custom Date Range picker.
    *   **Hero Balance**: A bold, curved hero section immediately showing your Total Balance and percentage change from the previous month.
*   **Intuitive Transaction Logging**:
    *   Fast, modal-based transaction entry directly from the Dashboard.
    *   Categorize entries with visual icons separating Expenses (e.g., Food, Utilities, Shopping) and Income.
    *   Robust validation ensuring sub-zero entries are caught immediately via app-wide custom alert popups.
*   **Comprehensive Debt Management**:
    *   Track active obligations across Bank Loans, Personal Debts, and Credit Cards with distinct visual indicators.
    *   **Debt-To-Income (DTI) Tracker**: An integrated widget dynamically calculating your monthly debt obligations against your income, complete with color-coded health indicators (Good/Warning/Danger).
    *   **Debt Payment Engine**: Click on any active debt to view a detailed breakdown (Total Liability, Monthly Installment, Months Left) and execute a payment that automatically deducts from your debt balance and updates your main transaction ledger simultaneously.
    *   **Automated Reminders**: Unobtrusive application notifications warn you if a debt payment is due within 5 days and hasn't been paid this month.
*   **Cross-App Localization**: Instantly toggle the interface language between **English** and **Indonesian** directly from the AppContext.
*   **Dark Mode Ready**: A meticulously crafted dark theme (`dark:bg-slate-900`) for low-light environments, easily toggled from the global navigation bar.

## 🚀 Technology Stack

*   **Frontend Library**: React (Context API for State Management)
*   **Styling**: Tailwind CSS (Utility-first CSS framework with custom `font-display` configuration)
*   **Routing**: React Router DOM (v6)
*   **Icons**: Google Material Symbols
*   **Persistence**: LocalStorage (for persisting user settings, transactions, and debts across sessions)

## 💻 Getting Started

### Prerequisites
*   Node.js (v16+)
*   npm or yarn

### Installation
1.  Clone the repository:
    ```bash
    git clone https://github.com/yourusername/ItungIn-Financial-Tracker.git
    cd ItungIn-Financial-Tracker
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```
4.  Open your browser and navigate to the localhost port provided (usually `http://localhost:5173/`).

## 📁 Project Structure

*   `src/components/`: Reusable UI elements (Layout, Custom alerts, Modals).
*   `src/contexts/`: Centralized state management (`AppContext.jsx`) handling transactions, debts, notification dispatching, theme, and localization.
*   `src/pages/`: Core application views (Dashboard, Debt, Profile, Transactions).

## 🎨 Design Philosophy

ItungIn prioritizes aesthetics alongside functionality. The UI avoids generic blocks in favor of `rounded-3xl` cards, subtle drop shadows, blurred backdrops (`backdrop-blur-md`), micro-animations on hover states, and considered typography. The specific color palettes (e.g., Indigo for Debt, Emerald for Income, Red for Expenses) ensure information is parsed quickly and pleasantly.

---
*Built to make managing money intuitive and visually rewarding.*
