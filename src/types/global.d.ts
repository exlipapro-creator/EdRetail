// Type declarations to satisfy TypeScript for non-code imports and react-dom client entry

declare module 'react-dom/client';

// Allow importing CSS files in TypeScript without type errors
declare module '*.css';

// Common static asset declarations
declare module '*.svg';
declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
