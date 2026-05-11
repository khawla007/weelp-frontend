import { includeIgnoreFile } from '@eslint/compat';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const gitignorePath = path.resolve(__dirname, '.gitignore');

// Import Next.js ESLint configs (ESLint 9 flat format)
import nextConfig from 'eslint-config-next';
import nextWebVitals from 'eslint-config-next/core-web-vitals';
import weelpRules from './eslint-rules/index.js';

// Surfaces cleared by Impeccable Cascade Phases 6–13.
// Lint guards run at error severity inside this glob set; new surfaces
// are added here as they are cascaded.
const CASCADED_SURFACES = [
  'src/app/(dashboard)/dashboard/**/*.{js,jsx,ts,tsx}',
  'src/app/components/Dashboard/**/*.{js,jsx,ts,tsx}',
  'src/app/components/Form/{AuthPageClient,LoginForm,RegisterForm,FormForgotPassword,FormResetPassword}.jsx',
  'src/app/components/Pages/FRONT_END/checkout/**/*.{js,jsx,ts,tsx}',
  'src/app/components/Pages/FRONT_END/creator-itinerary-form/**/*.{js,jsx,ts,tsx}',
  'src/app/components/Pages/FRONT_END/singleblog/**/*.{js,jsx,ts,tsx}',
  'src/app/components/Pages/FRONT_END/home/**/*.{js,jsx,ts,tsx}',
  'src/app/(frontend)/privacy/**/*.{js,jsx,ts,tsx}',
  'src/app/(frontend)/terms/**/*.{js,jsx,ts,tsx}',
  'src/app/(frontend)/cancellation/**/*.{js,jsx,ts,tsx}',
  'src/app/components/NotFound.jsx',
  'src/components/ui/**/*.{js,jsx,ts,tsx}',
  // Phase 13c — public product surfaces graduated under guard.
  'src/app/components/Pages/FRONT_END/singleproduct/**/*.{js,jsx,ts,tsx}',
  'src/app/components/Pages/FRONT_END/About/**/*.{js,jsx,ts,tsx}',
  'src/app/components/Pages/FRONT_END/shop/**/*.{js,jsx,ts,tsx}',
  'src/app/components/Pages/FRONT_END/tours/**/*.{js,jsx,ts,tsx}',
  'src/app/components/Pages/FRONT_END/transfer/**/*.{js,jsx,ts,tsx}',
  // Phase 14a — admin RSC builders (activity / package / itinerary forms).
  'src/app/components/Pages/DASHBOARD/admin/_rsc_pages/**/*.{js,jsx,ts,tsx}',
  // Phase 14b — public city / region / explore / holiday / special / shared / Global surfaces.
  'src/app/components/Pages/FRONT_END/city/**/*.{js,jsx,ts,tsx}',
  'src/app/components/Pages/FRONT_END/region/**/*.{js,jsx,ts,tsx}',
  'src/app/components/Pages/FRONT_END/explore/**/*.{js,jsx,ts,tsx}',
  'src/app/components/Pages/FRONT_END/shared/**/*.{js,jsx,ts,tsx}',
  'src/app/components/Pages/FRONT_END/holiday/**/*.{js,jsx,ts,tsx}',
  'src/app/components/Pages/FRONT_END/special/**/*.{js,jsx,ts,tsx}',
  'src/app/components/Pages/FRONT_END/Global/**/*.{js,jsx,ts,tsx}',
];

const eslintConfig = [
  includeIgnoreFile(gitignorePath),
  {
    ignores: ['src/types/gateway.ts', 'src/types/gateway.openapi.json', 'eslint-rules/__tests__/**'],
  },
  ...nextConfig,
  ...nextWebVitals,
  {
    rules: {
      '@next/next/no-img-element': 'off',
      'react-hooks/exhaustive-deps': 'off',
    },
  },
  // Phase 12 — Impeccable Cascade lint guards.
  {
    files: CASCADED_SURFACES,
    plugins: { weelp: weelpRules },
    rules: {
      'weelp/no-noncanonical-hex': 'error',
      'weelp/no-noncanonical-container': 'error',
      'weelp/no-inline-heading-font': 'error',
      'weelp/no-inline-style-hex': 'error',
      'weelp/no-semantic-gray': 'error',
      'weelp/no-noncanonical-fontsize': 'error',
    },
  },
  // Primitive Baseline Exception (DESIGN.md §5): shadcn primitives keep
  // their stock `neutral-*` / `gray-*` palette — perceptual delta below
  // noise floor, re-hexing 32 files for high blast / low signal.
  {
    files: ['src/components/ui/**/*.{js,jsx,ts,tsx}'],
    rules: {
      'weelp/no-semantic-gray': 'off',
    },
  },
  // Reading-Column Exception (DESIGN.md §7): legal pages keep max-w-4xl
  // inside container-page outer wrapper.
  {
    files: [
      'src/app/(frontend)/privacy/**/*.{js,jsx}',
      'src/app/(frontend)/terms/**/*.{js,jsx}',
      'src/app/(frontend)/cancellation/**/*.{js,jsx}',
      'src/app/components/Pages/FRONT_END/singleblog/**/*.{js,jsx}',
    ],
    rules: {
      'weelp/no-noncanonical-container': ['error', { allow: ['4xl'] }],
    },
  },
  // Dashboard-Surface Exception (DESIGN.md §7): settings layouts keep max-w-6xl.
  {
    files: ['src/app/(dashboard)/dashboard/**/settings/layout.{js,jsx,ts,tsx}'],
    rules: {
      'weelp/no-noncanonical-container': ['error', { allow: ['6xl'] }],
    },
  },
  // Reserved-Brand-Signal Exception (DESIGN.md §2): Trustpilot stars on
  // CheckoutCards retain the platform brand hex #00B67A.
  {
    files: ['src/app/components/Pages/FRONT_END/checkout/CheckoutCards.jsx'],
    rules: {
      'weelp/no-noncanonical-hex': ['error', { allowExtra: ['00b67a'] }],
    },
  },
  // Reserved-Brand-Signal Exception (DESIGN.md §2): rating-star gold
  // `#fed141` on review surfaces depends on third-party-style recognition
  // (Google / Trustpilot / app-store rating gold).
  {
    files: [
      'src/app/components/Pages/FRONT_END/singleproduct/BannerSection.jsx',
      'src/app/components/Pages/FRONT_END/singleproduct/SingleProductReview.jsx',
      'src/app/components/Pages/FRONT_END/shared/FilterSidebar.jsx',
    ],
    rules: {
      'weelp/no-noncanonical-hex': ['error', { allowExtra: ['fed141'] }],
    },
  },
];

export default eslintConfig;
