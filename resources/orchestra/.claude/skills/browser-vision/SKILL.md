---
name: browser-vision
description: Gives the AI "eyes" to see the real UI layout and elements via a headless browser and accessibility tree. Use this to verify UI instead of relying on hallucinated layouts or raw source code.
---

# Browser Vision (Accessibility Eyes)

## Why use this skill?
When you write UI code, you are blind to how it actually renders. You might create a text input where a dropdown is expected, or miss important layout relationships. Unit tests do not catch these visual or accessibility issues.

This skill allows you to run a headless browser against your local development server and dump the Accessibility Tree. The tree provides a clean, layout-noise-free structural view of exactly what a real user (or screen reader) experiences.

## How to use

1. Ensure the development server for the project is running (e.g., `npm run dev` or `npm start` in the background).
2. If `puppeteer` is not installed, install it temporarily or locally: `npm install --no-save puppeteer`.
3. Run the vision script against the target URL:
   `node .claude/skills/browser-vision/a11y.js http://localhost:3000`
4. Read the resulting Accessibility Tree to understand the real UI.

## What to look for
- Check if elements have the correct roles (e.g., `combobox`, `button`, `textbox`).
- Verify that interactive elements have accessible names.
- Ensure that the generated structure matches the user's intent (e.g., if a foreign key relation exists, the UI should ideally present a `combobox` or `listbox`, not just a raw `textbox`).

## Rules
- When you create or modify a UI component, use this skill to VERIFY how it renders before claiming it is complete.
- Do NOT assume the UI is correct just because it compiles and tests pass. Always "look" at it if you are in product/UI mode.
