# Fixes for Render build

This branch adds TypeScript module declarations to prevent build-time errors on CI (Render) where tsc complains about "Could not find a declaration file for module 'react-dom/client'" and side-effect CSS imports.

Files added:
- src/types/global.d.ts — declares modules for 'react-dom/client', '*.css', and common image types.

Why this helps
- Some CI environments run `tsc` with stricter resolution or without ambient types. Adding explicit module declarations avoids tsc failing on imports that are handled by bundlers (Vite) at build time.

Next steps
1. Trigger a new deploy on Render (deploy the branch you prefer, e.g., main or feature/touch-targets). The next build should progress past the previous TypeScript errors.
2. If other type errors appear, we can refine declarations or ensure devDependencies (type packages) install correctly during CI.
