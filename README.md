# AI Mock Interview Platform

An **AI-powered mock interview preparation application** designed to help developers practice technical interviews with real-time AI feedback. This platform simulates realistic interview scenarios and provides personalized coaching to improve interview performance.

## 🎯 Core Features

### Interview Types
- **Frontend Developer** - React, Next.js, JavaScript, CSS, TypeScript, System Design
- **Backend Developer** - Node.js, APIs, databases, server architecture
- **Full Stack Developer** - Combined frontend + backend topics
- **DevOps** - Infrastructure, deployment, containerization

### Key Functionality
- **Create Mock Interviews** - Start new interview sessions for chosen specialization
- **AI-Generated Questions** - Dynamic questions powered by Google Gemini 2.0 Flash API
- **Real-time Recording** - Record video/audio responses using React Webcam and Speech-to-Text
- **Instant Feedback** - AI analyzes answers and provides structured feedback on technical accuracy, communication clarity, completeness, and areas for improvement
- **Progress Tracking** - Monitor your performance over multiple sessions

### Interview Flow
1. **Dashboard** - Browse and manage interview sessions
2. **Create Interview** - Select role/specialty and configure difficulty
3. **Start Interview** - Receive AI-generated questions one by one
4. **Record Answer** - Speak/video record your response
5. **Get Feedback** - AI evaluates and provides detailed analysis
6. **Review Progress** - Track improvements over time

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16, React 18, TypeScript 5 |
| **Styling** | Tailwind CSS 4, Radix UI components |
| **Authentication** | Clerk 6.34 (user login/management) |
| **AI/ML** | Google Generative AI (Gemini 2.0 Flash) |
| **Database** | PostgreSQL with Drizzle ORM 0.44 |
| **Validation** | Zod runtime validation |
| **Media** | React Webcam & Speech-to-Text recording |
| **State Management** | React Hooks with custom hooks |
| **Icons** | Lucide React |
| **Notifications** | Sonner toasts |

## 📦 Development Stack

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

### Code Quality Features
- **TypeScript** - Strict type checking for type safety
- **Zod Validation** - Runtime schema validation for APIs and forms
- **Security** - Input sanitization, environment variables, error boundaries
- **Reusable Components** - 20+ shared UI components with composition pattern
- **API Utilities** - Centralized HTTP methods, caching, retry logic with exponential backoff
- **Custom Hooks** - Timer, form handling, localStorage, debouncing, and more

## 🚀 Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## 📁 Project Structure

```
app/
├── page.tsx                 # Landing page
├── layout.tsx              # Root layout
├── globals.css             # Global styles
├── (auth)/                 # Authentication routes
│   ├── sign-in/
│   └── sign-up/
├── api/                    # API routes
│   └── generate/
├── dashboard/              # Interview dashboard
│   ├── page.tsx
│   ├── layout.tsx
│   ├── interview/
│   │   └── [interviewId]/start/
│   └── _component/         # Dashboard components
├── hooks/                  # Custom React hooks
│   ├── useCustomHooks.ts   # 14+ reusable hooks
│   └── useFormValidation.ts
├── utils/                  # Utilities
│   ├── validation.schemas.ts  # Zod schemas
│   ├── api.helpers.ts         # API utilities
│   ├── db.tsx
│   └── GoogleGenAI.tsx
└── components/             # React components
    ├── SharedComponents.tsx # 20+ reusable UI components
    └── FormComponents.tsx   # Type-safe form components
```

## 🔧 Database Setup

Initialize and push database schema:

```bash
npm run db:push
```

View database in Drizzle Studio:

```bash
npm run db:studio
```

## 📚 Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [Next.js GitHub repository](https://github.com/vercel/next.js) - feedback and contributions welcome!

## 🚢 Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

Check out [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:push` - Sync database schema
- `npm run db:studio` - Open Drizzle Studio

## 🔐 Security

This application implements multiple security layers:
- Input validation with Zod schemas
- SQL injection prevention via parameterized queries
- XSS protection with React's built-in escaping
- CSRF protection through Clerk authentication
- Secure environment variables management
- Error boundaries for graceful error handling

## 📄 License

This project is private. All rights reserved.
"# ai-mock-interview-app" 
