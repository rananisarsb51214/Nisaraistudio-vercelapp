# Nisarai Studio 🚀

Nisarai Studio is a next-generation AI-powered full-stack website builder and digital creator platform. It combines AI automation tools, a visual drag-and-drop builder, responsive website generation, and a robust full-stack architecture to empower developers, creators, startups, businesses, affiliate marketers, and online entrepreneurs.

## 🏆 Project Badges

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)]() [![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)]() [![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)]() [![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=white)]() [![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white)]() [![Gemini AI](https://img.shields.io/badge/Gemini%20AI-4285F4?style=for-the-badge&logo=google-gemini&logoColor=white)]()

---

## 📝 Table of Contents

* [About The Project](#about-the-project)
* [Key Features](#key-features)
* [Tech Stack](#tech-stack)
* [Project Structure](#project-structure)
* [Installation](#installation)
* [Usage](#usage)
* [API Endpoints](#api-endpoints)
* [Contributing](#contributing)
* [License](#license)
* [Contact](#contact)

---

## 💡 About The Project 💡

Nisarai Studio is a sophisticated platform designed to streamline the process of creating and managing websites and digital content. Leveraging AI, it aims to provide a powerful yet user-friendly experience for building and deploying full-stack web applications. The platform integrates AI automation, a visual builder, and responsive design capabilities, catering to a wide audience from individual creators to established businesses.

---

## ✨ Key Features ✨

*   **AI-Powered Content Generation:** Utilizes AI models (like Gemini) to generate social media captions, blog post outlines, titles, and SEO descriptions.
*   **Visual Website Builder:** Implies a drag-and-drop interface for creating responsive websites (though specific UI components for this are not fully detailed in the provided code snippets).
*   **Full-Stack Architecture:** Built with Next.js for the frontend and Firebase for backend services (authentication, database, storage).
*   **Authentication:** Implements Google OAuth for user sign-in using Firebase Authentication.
*   **Dynamic Dashboard:** Provides a workspace dashboard with metrics, agent statuses, and job listings.
*   **Blog Factory:** A dedicated section for generating and managing blog content, including research, structuring, drafting, and publishing.
*   **AI Agent Simulation:** Demonstrates concepts of AI agents (Planner, Executor, Analyzer, Optimizer) with triggerable actions.
*   **Image Generation Placeholder:** Includes a placeholder for AI image generation, saving generated images to Firebase Storage.
*   **Modular UI Components:** Utilizes reusable components for cards, buttons, authentication, and layout.

---

## 🛠️ Tech Stack 🛠️

*   **Frontend:** Next.js (App Router), React, Tailwind CSS
*   **Backend:** Firebase (Firestore, Authentication, Storage), Node.js (for server-side logic)
*   **AI Integration:** Google Gemini API
*   **State Management:** React Hooks, `react-firebase-hooks`
*   **Styling:** Tailwind CSS, `shadcn/ui` components
*   **Utilities:** `clsx`, `tailwind-merge`, `class-variance-authority`, `framer-motion`

---

## 📂 Project Structure 📂

The project follows a standard Next.js application structure with a focus on componentization and service separation:

```
. 
├── app/ 
│   ├── api/ (API routes)
│   │   ├── ai/
│   │   │   ├── generate-image/route.ts
│   │   │   └── social-post/route.ts
│   │   └── ...
│   ├── blog-factory/
│   │   └── dashboard/page.tsx
│   ├── dashboard/
│   │   └── page.tsx
│   ├── layout.tsx (Root layout)
│   └── page.tsx (Landing page)
├── components/
│   ├── auth-provider.tsx
│   ├── blog-factory/
│   │   ├── analytics-grid.tsx
│   │   └── job-list.tsx
│   ├── dashboard-stats.tsx
│   ├── agent-panel.tsx
│   ├── glass-card.tsx
│   ├── header.tsx
│   ├── login-button.tsx
│   ├── neon-button.tsx
│   ├── particle-background.tsx
│   └── ui/ (UI components like Card, Button)
│       ├── card.tsx
│       └── button.tsx
├── hooks/ (Custom hooks)
│   └── use-mobile.ts
├── lib/
│   ├── agents/ (AI agent logic)
│   │   └── dataCleaner.ts
│   ├── blog-factory/ (Blog factory pipeline)
│   │   └── pipeline.ts
│   ├── firebase.ts (Firebase configuration and initialization)
│   ├── gemini.ts (Gemini API integration)
│   └── utils.ts (Utility functions)
├── .env.example
├── next.config.ts
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🚀 Installation 🚀

**Prerequisites:**

*   Node.js and npm/yarn installed
*   A Firebase project set up
*   Google Cloud project with Gemini API enabled

**Steps:**

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/rananisarsb51214-web/Nisaraistudio-vercelapp.git
    cd Nisaraistudio-vercelapp
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Configure Environment Variables:**
    *   Create a `.env.local` file in the root of the project.
    *   Copy the contents of `.env.example` to `.env.local` and fill in your specific API keys and URLs:
        ```dotenv
        GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
        APP_URL="https://console.cloud.google.com/iam-admin/serviceaccounts/details/116935465562908832954%3Bedit=true?previousPage=%2Fapis%2Fcredentials%3Fproject%3Dsuper-ai-toolbox&project=super-ai-toolbox"
        # For Firebase, ensure your firebase-applet-config.json is correctly configured
        # or set Firebase credentials here if not using the config file.
        NEXT_PUBLIC_FIREBASE_API_KEY="YOUR_FIREBASE_API_KEY"
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="YOUR_FIREBASE_AUTH_DOMAIN"
        NEXT_PUBLIC_FIREBASE_PROJECT_ID="YOUR_FIREBASE_PROJECT_ID"
        NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="YOUR_FIREBASE_STORAGE_BUCKET"
        NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="YOUR_FIREBASE_MESSAGING_SENDER_ID"
        NEXT_PUBLIC_FIREBASE_APP_ID="YOUR_FIREBASE_APP_ID"
        NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="YOUR_FIREBASE_MEASUREMENT_ID"
        NEXT_PUBLIC_FIRESTORE_DATABASE_ID="YOUR_FIRESTORE_DATABASE_ID"
        ```
    *   Ensure your `firebase-applet-config.json` is updated with your Firebase project details.

4.  **Set up Firebase:**
    *   Initialize Firebase in your project if you haven't already (`firebase init`).
    *   Deploy necessary Firebase services (Functions, Firestore, Storage) using the Firebase CLI.

5.  **Run the Development Server:**
    ```bash
    npm run dev
    # or
    yarn dev
    ```

6.  **Build and Deploy (for Vercel):**
    ```bash
    vercel --prod
    # or use the Vercel dashboard for deployment
    ```

---

## ▶️ Usage ▶️

Nisarai Studio is designed to be a comprehensive platform for creating and managing AI-driven web content and applications.

1.  **Landing Page:** Access the main landing page (`/`) to get an overview of the platform's capabilities. You can find options to launch the dashboard or join a waitlist.
2.  **Authentication:** Use the `Login with Google` button on the header to authenticate. This grants access to protected areas like the dashboard.
3.  **Workspace Dashboard (`/dashboard`):** This is the central hub where you can:
    *   View key metrics (Active Agents, Tasks Processed, Revenue, System Load).
    *   Monitor the status of various AI agents (Planner, Executor, Analyzer, Optimizer).
    *   Trigger actions for these agents.
4.  **Blog Factory (`/blog-factory/dashboard`):** This feature allows you to manage the blog creation pipeline:
    *   **Generate Content:** Use AI to research topics, structure outlines, draft content, and evolve drafts.
    *   **Publish Blogs:** The system can publish generated blogs, potentially to a connected CMS or platform.
    *   **View Jobs:** Monitor the status of active blog generation jobs.
5.  **AI API Endpoints:**
    *   **/api/ai/social-post:** Send a POST request with a `prompt` to generate social media content (caption, hashtags, CTA, title, description).
    *   **/api/ai/generate-image:** (Placeholder) Send a POST request with a `prompt` to generate an image. Currently, it returns a placeholder URL and uploads a dummy blob to Firebase Storage.
6.  **Billing (`/billing`):** Access the billing page to view upgrade options for unlocking advanced AI agents (this section is currently a placeholder).

**Real-world Use Cases:**

*   **Content Marketing Agencies:** Automate the creation of blog posts, social media updates, and marketing copy for clients.
*   **E-commerce Businesses:** Generate product descriptions, marketing slogans, and social media campaigns.
*   **Individual Creators:** Quickly generate content ideas, drafts, and social media posts to maintain an online presence.
*   **Startups:** Develop and launch websites rapidly with AI-assisted design and content generation.

---

## 📚 API Endpoints 📚

*   **POST `/api/ai/generate-image`**
    *   **Description:** Initiates AI image generation (currently a placeholder).
    *   **Request Body:**
        ```json
        {
          "prompt": "A futuristic cityscape at sunset"
        }
        ```
    *   **Response:**
        ```json
        {
          "imageUrl": "https://picsum.photos/seed/picsum/400/400"
        }
        ```

*   **POST `/api/ai/social-post`**
    *   **Description:** Generates various forms of social media and marketing content using Gemini AI.
    *   **Request Body:**
        ```json
        {
          "prompt": "Latest advancements in renewable energy"
        }
        ```
    *   **Response:**
        ```json
        {
          "text": "[Generated social media content]"
        }
        ```

---

## 🤝 Contributing 🤝

Contributions are welcome! Please follow these steps:

1.  **Fork the Project:** Create a fork of the repository.
2.  **Create a Feature Branch:** `git checkout -b feature/AmazingFeature`
3.  **Commit your Changes:** `git commit -m 'Add some AmazingFeature'`
4.  **Push to the Branch:** `git push origin feature/AmazingFeature`
5.  **Open a Pull Request:** Submit a pull request detailing your changes.

Please ensure your code adheres to the project's coding standards and includes relevant tests if applicable.

---

## 📄 License 📄

This project is not currently under any specified license. Please check the repository for any updates regarding licensing.

---

## 📞 Contact 📞

Ranānisārsb51214 - [rananisarsb51214@gmail.com](mailto:rananisarsb51214@gmail.com)

Project Link: [https://github.com/rananisarsb51214-web/Nisaraistudio-vercelapp](https://github.com/rananisarsb51214-web/Nisaraistudio-vercelapp)

you tube ---https://www.youtube.com/@nisaraistudio89

**© 2023 Nisaraistudio-vercelapp. All rights reserved.**

[⬆ Back to Top](#table-of-contents)


