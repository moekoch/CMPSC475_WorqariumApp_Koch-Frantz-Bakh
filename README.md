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

## Run App
```bash
npx expo start -c
```

## Run Server
```bash
node server/server.js
```
<br>

> **Expo ESLint & Prettier**
>
> - **ESLint:** Identifies potential errors and enforces code quality and consistency.
> - **Prettier:** Automatically formats code to maintain consistent styling and readability.
> - **Lint the project:** Run `npx expo lint`.
> - **Auto-fix issues:** Run `npx expo lint --fix` to automatically resolve supported linting and formatting issues.
> - **Configuration:** ESLint uses `eslint.config.js` (Expo SDK 53+) or a legacy configuration for older SDKs. Prettier settings can be customized in `.prettierrc`.
>
> See the [official Expo ESLint & Prettier guide](https://docs.expo.dev/guides/using-eslint/) for setup and configuration details.