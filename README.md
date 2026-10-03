# Gemini Quiz Generator

Paste your lecture or seminar notes and get an 8-question multiple-choice quiz with instant feedback. Built with Gemini in Google AI Studio as part of my **Build Club** project: a Gemini campus club concept at Minerva University where students learn to build real projects with Gemini.

> Unofficial student project. Not affiliated with or endorsed by Google.

## What it does

- Turns pasted notes into 8 multiple-choice questions using Gemini
- Shows one question at a time with a progress bar and running score
- Tells you right away if you were right or wrong, with a one-sentence explanation
- Ends with a final score and a "Try again" button, plus an option to paste new notes
- Includes a "Paste sample notes" button for quick testing
- Handles loading and errors with a spinner and friendly error messages

## Why I built it

I wanted a concrete example of what my club would teach: take a small, real problem (studying from notes) and ship a working tool in a weekend using Gemini. I tested it on my own notes from [SUBJECT / SEMINAR TOPIC].

## How I built it

1. **Scoped the idea** with a project-planning tool I built (Build Club), which breaks a vague idea into a finishable version and a step-by-step build path.
2. **Built the interface** in Google AI Studio's Build tool with a first prompt describing the notes box and quiz flow.
3. **Made it work** with a second prompt asking Gemini to generate questions from the notes, show one at a time, explain answers, score the quiz, and handle loading and errors.
4. **Checked the output** against real notes and fixed problems before publishing the code here.

## What I learned

- Being specific about the exact behavior (one question at a time, an explanation after each answer, error states) gave much better results than a vague first prompt.
- AI-generated prompts can contain placeholders and outdated model names, so I had to read them and correct them instead of pasting them blindly.
- [ONE THING GEMINI GOT WRONG AND HOW YOU FIXED IT]

## Run it locally

Requires Node.js and a free Gemini API key from [Google AI Studio](https://aistudio.google.com).

1. Clone the repo and install dependencies: `npm install`
2. Copy `.env.example` to `.env` and add your own key (never commit a real key)
3. Start the app: `npm run dev` (check the `scripts` section of `package.json` if this command differs)

## What's next

- [YOUR IDEA, e.g. save quizzes, support PDF uploads, run it with a real group of students at a club event]

## Tech

Google AI Studio (Build), Gemini API, TypeScript.
