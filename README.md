# VoteIQ — India Election Process Guide

## 📌 Chosen Vertical
**Civic Engagement & Education (EdTech / Public Service)**

## 💡 Approach and Logic
VoteIQ was built with the primary goal of demystifying the complex Indian electoral process for first-time voters, students, and the general public. 

The application is engineered as a lightweight, performant single-page application (SPA) using vanilla web technologies (HTML, CSS, JavaScript). By avoiding heavy frontend frameworks, we achieved a minimal footprint, exceptionally fast load times, and a highly maintainable codebase.

The logic revolves around progressive disclosure of information:
1. **High-Level Overview**: Introducing the three main phases of elections.
2. **Detailed Timelines**: Step-by-step breakdown from announcement to government formation.
3. **Interactive Learning**: Integrating a Quiz and a dynamic Countdown tracker to keep users engaged.
4. **Data Visualization**: Utilizing Google Charts to present historical voter turnout data clearly.
5. **Analytics**: Integrating Google Analytics 4 (GA4) with custom event tracking to understand user engagement across different sections.

## 🚀 How the Solution Works
The application consists of several interconnected modules:
*   **Navigation & Layout**: A sticky, responsive navigation bar ensures quick access to any section. A mobile-friendly hamburger menu caters to smaller screens.
*   **Interactive Components**:
    *   **Phase Explorer & Timeline**: Users can click on specific phases or timeline steps to reveal detailed information dynamically.
    *   **Voter Checklist**: An interactive task list that tracks the user's progress in becoming "election-ready."
    *   **Quiz Engine**: A custom-built, stateful quiz system that tracks scores, provides instant feedback, and offers detailed explanations for correct/incorrect answers.
    *   **Countdown Timer**: A live countdown utility where users can track upcoming state or national elections. It uses `setInterval` for real-time updates and manages multiple saved dates.
*   **Google Services Integration**:
    *   **Google Analytics 4**: Implemented via `gtag.js` to track user behavior (e.g., quiz answers, timeline exploration, feature usage).
    *   **Google Charts**: Used to render an interactive, responsive bar chart visualizing Lok Sabha voter turnout trends from 2004 to 2024.
*   **Accessibility & Testing**: The app is built with semantic HTML5, extensive ARIA attributes (`aria-expanded`, `aria-live`, `aria-pressed`, etc.), screen-reader-only elements, and keyboard navigation support. All interactive elements feature `data-testid` attributes to facilitate automated end-to-end (E2E) testing.

## 🧐 Assumptions Made
*   **Target Audience**: The primary users are citizens of India, specifically targeting the youth and first-time voters who need a streamlined, jargon-free guide to elections.
*   **Environment**: Users are accessing the platform via modern web browsers (supporting CSS Variables, Grid/Flexbox, and ES6+ JavaScript).
*   **Connectivity**: While lightweight, the integration of Google Fonts, Google Analytics, and Google Charts assumes the user has a reasonable internet connection.
*   **Data Accuracy**: The historical data, quiz answers, and procedural steps reflect the Election Commission of India (ECI) guidelines as of 2024.
