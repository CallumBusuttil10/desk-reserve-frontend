# DeskReserve - Frontend Interface

DeskReserve is an enterprise-grade desk and meeting room reservation system. This frontend application is built with React, TypeScript, and Vite, and connects to a secure Django REST Framework backend.

## 🚀 Tech Stack

* **Core:** React 18, TypeScript, Vite
* **Routing:** React Router v6
* **Styling & UI:** Material-UI (MUI v6), Emotion
* **State & Data Fetching:** React Hooks (`useState`, `useEffect`), Axios
* **Forms & Dates:** `@mui/x-date-pickers`, `dayjs` (UK Locale)
* **Security:** JSON Web Tokens (JWT), `jwt-decode`
* **Testing:** Vitest, React Testing Library, Happy-DOM

---

## 💻 Local Setup Guide

Follow these steps to get the frontend development environment running on your local machine.

### Prerequisites
1. Ensure you have [Node.js](https://nodejs.org/) installed.
2. Ensure the **DeskReserve Django Backend** is running locally on port `8000`.

## Installation
**Clone the repository and navigate into the directory:**
   ```bash
   git clone <your-repository-url>
   cd desk-reserve-frontend
```
### Install dependencies:

``` Bash
    npm install
```

### Start the development server:

```Bash
npm run dev
```
### View the app:
Open your browser and navigate to http://localhost:5173/.

(Note: You will be redirected to the login page if you are not authenticated).

## Running Tests
This project uses Vitest for lightning-fast unit and component testing, paired with React Testing Library and Happy-DOM for browser simulation.

### To run the test suite in watch mode:

```Bash
npx vitest
```
### To run the tests once (useful for CI/CD pipelines):

```Bash
npx vitest run
```