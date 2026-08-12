# Русский Мессенджер

Role: You are an experienced Lead Full-Stack Developer and System Architect.

​Task: Create a detailed technical specification and a step-by-step implementation plan for a consumer-focused web/mobile messenger targeting non-technical users.

​Key Requirements & Features:

​Target Audience & Interface Language: Designed for everyday users. The entire interface and user-facing communications must be strictly in Russian.

​Built-in Echo/Test Bot: On first launch/registration, a built-in system bot must be available so users can immediately test sending and receiving messages.

​Invite-Only Registration: Registration is closed. To sign up, a new user must enter a unique 6-digit code provided by an existing registered user. The code must be single-use and have an expiration period (e.g., 24 hours).

​Real-time Messaging: Instant chat capabilities using WebSockets / Socket.io.

​Voice Messages: Micro-recording functionality in the app/browser, file uploading to cloud storage/S3, and audio playback in chat with duration display.

​Required Output Structure:

​Tech Stack & Architecture: Recommended technologies for Frontend, Backend, Database (e.g., PostgreSQL), and Storage/Cache (S3/Redis).

​Database Schema: Table structures (Users, Messages, Invites, Bots) and their relationships.

​System Features & Integration:

​Invite Code Logic: API endpoints design for generating and validating 6-digit codes.

​Test Bot Logic: Architecture for the built-in auto-reply bot.

​Code Examples: Backend implementation logic for invite codes and the test bot (Node.js or Python).

​UI/UX Guidelines: Recommendations for a simple, intuitive Russian-language interface suitable for non-technical users.

​Development Roadmap: Phase-by-phase implementation plan from MVP to deployment.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://privet-chat-app.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/9c7dc6d3-7308-492b-ad0c-be4ca8bc8cdd).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
