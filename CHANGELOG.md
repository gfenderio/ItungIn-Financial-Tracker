# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2026-04-17

### Added
- **Authentication Flow**: New hybrid onboarding system supporting Google Sign-In and Guest Mode.
- **ItungIn Plus**: Premium feature hub including Budgets, Analytics, and Savings goals.
- **Mobile Migration**: Full Capacitor integration for Android support.
- **Interactive Tour**: Comprehensive application tour powered by Driver.js with robust pause/resume logic.
- **Guest Mode Logic**: Implementation of local-only storage for users without Google accounts.
- **Profile Customization**: Dynamic profile editing (Read-only email for Google users, name-only edit).

### Fixed
- **Tutorial Interactivity**: Resolved critical bug where tutorial confirmation modals were unclickable due to Driver.js interaction traps.
- **Z-Index Handling**: Standardized React Portal z-index for all global modals and alerts.
- **Transaction Validation**: Fixed edge cases in nominal entry limit (capped at 1 Trillion).
- **Tour Syntax**: fixed Babel compilation errors related to literal escape sequences in tour overlays.

### Changed
- **UI/UX Overhaul**: Transitioned to Tailwind CSS v4 for enhanced styling and performance.
- **Theme Engine**: Improved dark mode transitions and persistence across sessions.
- **State Management**: Refactored `AppContext` to handle complex auth and cloud/local logic splits.

---
*Created by gfenderio*
