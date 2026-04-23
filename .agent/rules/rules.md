---
trigger: always_on
---

# Project Rules & Context

## Environment: Windows 🪟
- **Shell**: PowerShell is the default shell.
- **Command Chaining**: Avoid using `&&` as it is not supported in standard Windows PowerShell (older versions). Use `;` or `if ($?) { ... }` for conditional execution, or `cmd /c "command1 && command2"` if necessary.
- **Paths**: Use Windows-style paths (backslashes `\`) where appropriate, though forward slashes `/` often work in tools. Be mindful of absolute paths.
- **Execution Policy**: Scripts might be restricted. Use `npm run ...` directly or generic commands.

## Project Purpose 🎯
- **Goal**: Develop and maintain a personal portfolio website hosted on GitHub Pages.
- **Theme**: "Electronic/Circuit" aesthetic. Dark mode, localized (English/Turkish), interactive 3D elements (Three.js/React-Three-Fiber).
- **Tech Stack**:
    - React (Vite)
    - TypeScript
    - Tailwind CSS
    - Three.js / R3F
    - GitHub Actions for deployment

## Coding Standards 📝
- **Components**: Functional components with TypeScript interfaces.
- **Styling**: Tailwind CSS for layout and utilities. Custom CSS for complex animations (circuit effects).
- **Linting**: Ensure `eslint` passes. No unused imports (`React` import often unnecessary in Vite/React 17+).

## Workflows 🔄
- **Deployment**: Automatic via GitHub Actions on push to `main`.
- **Pre-commit**: Check for lint errors and build success.

## Current State
- The project is deployed.
- We are in a "Maintenance & Polish" phase.
