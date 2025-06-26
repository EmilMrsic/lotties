This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

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

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# Lottie-AI Builder

A local-only, no-login Lottie animation creation and editing tool powered by Next.js and Tailwind CSS. Built for personal use and small animations. All data is stored locally in the browser using IndexedDB via `localforage`.

---

## ✨ Features

- Drag-and-drop `.json` Lottie upload
- Live preview using `lottie-react`
- AI prompt input (generate/edit Lottie via OpenAI)
- Save, load, delete animations from local storage
- Export/import `.json` files
- Unload warning if unsaved changes exist
- Size slider and layer-specific color editing

---

## 🔧 App Behavior & Logic

1. **Start screen**
   - Loads sample animation if no Lotties are saved
   - Displays live preview and prompt input

2. **Prompt Input**
   - User types a generation or edit prompt
   - On “Generate” → POST to `/api/generate`
   - On “Edit” → POST to `/api/edit` with current JSON
   - Response is either full Lottie JSON or a JSON Merge Patch
   - Validates response with AJV and shows in preview

3. **Upload Handling**
   - Drag `.json` file or use Import button
   - Parses + validates file
   - If valid, shows preview and optionally saves it

4. **Preview**
   - Renders using `lottie-react` with autoplay + loop
   - Resize container adapts to animation bounds

5. **Save & Storage**
   - Saves named Lotties to IndexedDB using `localforage`
   - Lists saved items in sidebar
   - Allows Load, Delete, Export for each

6. **Export/Import**
   - Export → downloads current Lottie as `.json`
   - Export All → downloads all saved animations
   - Import → adds new Lottie to local state and preview

7. **Unload Warning**
   - Warns if user navigates away with unsaved changes
   - Uses `beforeunload` and a custom modal fallback

8. **Error Handling**
   - Displays validation or API errors inline
   - Uses toast or alert-style messaging

---

## 🛠️ Tech Stack

- **Framework**: Next.js (App Router, TypeScript)
- **Styling**: Tailwind CSS
- **Animation**: lottie-react
- **AI**: OpenAI API (GPT-4o, JSON mode)
- **Storage**: IndexedDB via localforage
- **Validation**: AJV + Lottie JSON schema

---

## 🚀 Getting Started

```bash
npm install
npm run dev
```

Set the `OPENAI_API_KEY` environment variable to enable AI features.

Visit `http://localhost:3000`

---

## 🧠 Codex Prompt

> “Build a drag-and-drop Lottie JSON upload area with validation and preview using lottie-react. Store and retrieve animations from IndexedDB using localforage. No auth, local-only.”

Use this to guide Codex in building or iterating on features.

---