# 🐠🐠🐠 Workquarium — Mobile

Workquarium is a virtual underwater social and coworking platform where users can focus, socialize, play games, and connect with others.

## Features

- Virtual coworking spaces
- Silent and group focus sessions
- Creature-based user statuses and presence
- Public and private rooms
- Tankmate/friend system
- Real-time chat and optional calls
- Multiplayer games and social activities
- Personal aquarium customization
- Points, achievements, and progression
- Language translation compatibility
- Light/Dark modes 

## Tech Stack

- React Native
- Expo
- TypeScript
- React Navigation
- Socket.IO Client

## Architecture

The Workquarium mobile application connects to a shared backend, authentication system, and database used by both the web and mobile applications.

## Run Mobile App

**Prerequisite:** Start the backend server before running the web application. The shared backend provides the API endpoints, authentication, and MongoDB database used by both the web and mobile applications.

1. Start the backend server: [**SWENG465_WorqServer_Koch-Frantz-Bakh**](https://github.com/moekoch/SWENG465_WorqServer_Koch-Frantz-Bakh).
2. In a separate terminal, navigate to the web application directory and run:

```bash
npx expo start -c
```

<br>

For API endpoint details and interactive Swagger/OpenAPI documentation, refer to the backend repository.

> **Expo ESLint & Prettier**
>
> - **ESLint:** Identifies potential errors and enforces code quality and consistency.
> - **Prettier:** Automatically formats code to maintain consistent styling and readability.
> - **Lint the project:** Run `npx expo lint`.
> - **Auto-fix issues:** Run `npx expo lint --fix` to automatically resolve supported linting and formatting issues.
> - **Configuration:** ESLint uses `eslint.config.js` (Expo SDK 53+) or a legacy configuration for older SDKs. Prettier settings can be customized in `.prettierrc`.
>
> See the [official Expo ESLint & Prettier guide](https://docs.expo.dev/guides/using-eslint/) for setup and configuration details.
