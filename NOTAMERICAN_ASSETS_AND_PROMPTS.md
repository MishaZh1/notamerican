# 🎨 NOTAMERICAN Assets & Prompts

This document serves as the "Source of Truth" for the brand identity, visual style, and the AI engine powering NotAmerican content.

---

## 🤖 The Mascot: "Agent Marco" (The Enforcer)
**Character Description**:
A stern human border patrol officer in a high-contrast 2D noir style. Marco has an intimidating, focused gaze and no-nonsense attitude. He is the gatekeeper of universal knowledge, challenging you to prove your worth. No text or speech bubbles are used in his graphic.

### Personality Traits:
- **Tone**: Quirky, uplifting, and global.
- **Catchphrase**: "Welcome to the frontier of knowledge!"
- **Feedback**:
  - *Correct*: "Passport stamped! Continue your journey."
  - *Wrong*: "Wait, let's re-verify that. Try again, traveler!"

---

## 🎨 Visual Style Guide

### Color Palette (Vibrant & Premium)
- **Primary (Success)**: `#58CC02` (Duolingo Green)
- **Secondary (Action)**: `#1CB0F6` (Sky Blue)
- **Warning/Streak**: `#FF9600` (Flame Orange)
- **Error**: `#FF4B4B` (Rose Red)
- **Dark Mode Background**: `#0F172A` (Slate 900)
- **Glass Card**: `rgba(255, 255, 255, 0.05)` with `backdrop-blur`

### UI Elements
- **Typography**: The official font for NotAmerican is **Outfit** (Google Font). Use it for all headings and body text for a premium, clean, and modern look.
- **3D Buttons**: Use `box-shadow` to create a "pushed" effect (bottom border 4px darker than surface).
- **Animations**: `spring` physics for all transitions. Avoid linear easing.

---

## 📝 LLM Prompts

### 1. Trivia Question Generator
**Role**: Expert Quizmaster
**Prompt**:
> Generate 10 trivia questions for the category [CATEGORY] at difficulty level [1-5].
> Return ONLY a JSON array with the following schema:
> ```json
> [
>   {
>     "category": "string",
>     "difficulty": number,
>     "question_text": "string",
>     "answers": ["string", "string", "string", "string"],
>     "correct_index": number,
>     "explanation": "string (max 100 chars)"
>   }
> ]
> ```
> Ensure the "NotAmerican" flavor: focus on interesting facts from various cultures, avoid US-centric bias unless the category specifically calls for it.

### 2. Mascot Dialogue Generator
**Role**: "Globie" the NotAmerican Mascot
**Prompt**:
> Rewrite the following feedback message in your quirky, global, and encouraging personality.
> Current Message: "[MESSAGE]"
> User State: [SUCCESS/FAIL/STREAK_HIT]
> Keep it under 15 words.

---

## 🖼 Image Generation Prompts (Midjourney/DALL-E)

### Logo Identity
- **Concept**: Minimalist "nota merican" text paired with a simple green passport icon.
- **Typography**: Bold, rounded sans-serif (Duolingo-style).
- **Visual Style**: Ultraminimalist, flat vector, navy blue and green colors.

### Mascot Icon
> `Flat 2D vector character of a friendly human border patrol officer, Duolingo style, navy blue uniform, official cap, holding a passport and stamp, thick black outlines, bold flat colors, white background, high resolution`

### Official Logo Prompt
> `Ultraminimalist logo for 'nota merican', simple rounded green passport icon with a tiny star, bold rounded sans-serif text, Duolingo-style flat vector, navy blue and green colors, solid white background.`

### Category Icons
> `Isometric 3D icon of [SUBJECT], vibrant neon colors, frosted glass texture, soft shadows, minimalist design, high resolution`

---

## 🔊 Sound Effect (SFX) Ideas
- **Coin/XP Earned**: Light, high-pitched "bling".
- **Wrong Answer**: Soft, low-pitched "boop".
- **Level Up**: Short orchestral crescendo.
- **Streak Flame**: A subtle "whoosh" sound.

---

## 🛂 Passport Design System (New Proposal)
This is the new "Passport Edition" visual identity, designed for a more official yet gamified feel.

### Color Palette
- **Primary (Approved)**: `#2E7D32` (Deep Official Green) - Used for success, play buttons, and approved stamps.
- **Secondary (Authority)**: `#283593` (Border Patrol Blue) - Used for headers, uniforms, and official UI.
- **Accent (Visa)**: `#FBC02D` (Gold) - Used for stars, ranks, and premium highlights.
- **Destructive (Denied)**: `#D32F2F` (Red) - Used for "Denied" stamps and errors.
- **Background**: subtle off-white/blue tint to resemble official documents.

### Mascot: Agent Marco v2
- **Description**: Stern, no-nonsense border patrol officer.
- **Props**: Holds a massive red "DENIED" stamp and a green "APPROVED" stamp.
- **Vibe**: "Papers, Please" meets Duolingo.

### Logos
- **Main Logo (Default)**: Minimalist "Passport + Text" (v3).
- **Options**:
    - `logo-v2.png`: Circular Passport Stamp style.
    - `logo-v3.png`: Minimalist Passport Book + Text.
    - `logo-v4.png`: **Open Passport** showing a world map inside.
    - `logo-v5.png`: **Playful Passport** with a paper plane (Blue/Green Original).
    - `logo-v5-sunset.svg`: Sunset Orange/Gold Vector.
    - `logo-v5-neon.svg`: Neon Purple/Cyan Vector.
    - `logo-v5-teal.svg`: Teal/Coral Vector.
    - `logo-v6.png`: **Official Badge** style with gold accents and checkmark.
