# AtestatApp — Visual Redesign Specification

## 1. Visual Direction

### Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| `--green` | `#00FF87` | Primary CTA, highlights, active states |
| `--green-dim` | `#00CC6A` | Hover states, secondary accent |
| `--green-glow` | `rgba(0,255,135,0.18)` | Subtle glows, card highlights |
| `--green-glow-sm` | `rgba(0,255,135,0.08)` | Very subtle tints |
| `--dark` | `#0A0A0A` | Page background |
| `--dark-card` | `#141414` | Card backgrounds |
| `--dark-surface` | `#1A1A1A` | Input fields, elevated surfaces |
| `--dark-border` | `rgba(255,255,255,0.07)` | Card borders |
| `--dark-border-hover` | `rgba(0,255,135,0.25)` | Card hover borders |
| `--text-primary` | `#FFFFFF` | Primary text |
| `--text-secondary` | `#A0A0A0` | Secondary / muted text |
| `--text-tertiary` | `#666666` | Disabled / placeholder |
| `--red-error` | `#EF4444` | Validation errors |
| `--red-error-bg` | `rgba(239,68,68,0.08)` | Error field background |

**Key principle:** The green should feel like a "success/send" accent, not a dominant fill. Maximum 20% green per screen. Dark surfaces dominate.

### Typography

- **Primary font:** `Geist` (already in use) — keep it. It's clean and not overused.
- **Display:** `Geist` at `font-black` (weight 900), tight tracking (`tracking-tight`), large sizes.
- **Body:** `Geist` at weight 400–500, 14–16px, 1.6 line-height.
- **Labels / captions:** `Geist` at 12px, weight 500, letter-spacing `0.05em` uppercase for section labels.
- **No serif fonts** — the product is tech/utility, not editorial. Keep it consistent.
- **Avoid:** over-sized hero text (> 64px) and heavy shadow on text. Use size contrast for hierarchy instead.

### Spacing System

Base unit: `8px`. All spacing in multiples of 8.

| Token | Value |
|-------|-------|
| `--space-xs` | 8px |
| `--space-sm` | 16px |
| `--space-md` | 24px |
| `--space-lg` | 40px |
| `--space-xl` | 64px |
| `--space-2xl` | 96px |

### Background Treatments

**Never use:**
- Radial gradient over a grid pattern (AI slop signature)
- Full-page gradient overlays
- Animated gradient blobs

**Use instead:**
- Flat `#0A0A0A` for page backgrounds
- `#0D0D0D` for alternating section backgrounds (subtle, barely perceptible)
- Single, directional radial gradient at low opacity (`opacity-0.05`) as a "light source" effect — one per section, at top-center, max radius 60%
- No grid patterns anywhere

### Motion Philosophy

- **Entrance animations:** `opacity: 0 → 1` + `translateY(12px → 0)`, `400ms ease-out`, staggered `80ms` between items.
- **Hover transitions:** `200ms ease` for color/border changes. `150ms ease` for transforms.
- **Button hover:** `translateY(-1px)` + `box-shadow` lift — no scale transforms (feels cheap).
- **No continuous ambient animations** (pulsing, floating) except the live-status dot in the nav badge.
- **Page-level transitions:** None (Next.js handles navigation). Focus on micro-interactions.
- **Loading states:** Spinner only on the success page. No skeleton loaders (not needed for this app's flow).

### Polish / Details

- Custom scrollbar: `4px` wide, `rgba(0,255,135,0.2)` thumb, `#1a1a1a` track.
- `::selection`: green background with dark text.
- `scroll-behavior: smooth` on the html element.
- All interactive elements have `cursor: pointer`.
- No emoji in any UI — SVG icons only.
- Remove all flag emoji (`🇷🇴`) from trust bar.

---

## 2. Per-Page Specifications

---

### 2.1 Landing Page (`app/page.tsx`)

#### Hero Section

**Layout:** Full-width, centered content, `max-w-5xl`, padding `px-6`. Two-column on `lg:` — text left, document preview right. Single column on mobile.

**Background:** Flat `#0A0A0A`. NO grid. NO radial gradient over grid. One subtle radial at top-center: `radial-gradient(ellipse 60% 40% at 50% 0%, rgba(0,255,135,0.04) 0%, transparent 100%)`.

**Badge (above headline):**
```
"●  Peste 300 de liceeni au folosit platforma"
```
- Small pill, `bg-white/5`, border `white/10`, 12px font, gray text.
- The dot pulses (green) to indicate live activity — `animate-pulse` (keep this one).
- Replace any stats in the badge with real numbers if available.

**Headline:**
```
Atestatul complet,
generat de AI
in cateva minute.
```
- Size: `text-4xl md:text-5xl`, `font-black`, `leading-[1.08]`, `tracking-tight`.
- "generat de AI" in `--green`.
- No gradient text. No text shadow except `brand-green` subtle glow (`text-shadow: 0 0 24px rgba(0,255,135,0.5)`).

**Subheadline:**
- `text-lg text-gray-400 leading-relaxed max-w-md`.
- Keep the existing copy. Don't use words like "simplu", "fara surprize", "revoluționar".

**CTA Buttons:**
- Primary: `btn-green` (already defined), `px-7 py-3.5 text-sm font-bold`.
- Secondary: Ghost button, border `rgba(255,255,255,0.12)`, `hover:border-white/20`, no background.
- Gap: `gap-4`. On mobile: stack vertically.

**Trust micro-copy below buttons:**
- Keep the two checkmark items. Font: `text-sm text-gray-500`.

**Document Preview (right column, `hidden lg:block`):**
- The Word doc mockup should use a **generic fictional school name** — e.g., "Colegiul Economic Demo" instead of "Colegiul Economic Virgil Madgearu".
- Replace "Popescu Maria Ioana" with a clearly placeholder name that doesn't read as real — e.g., "Nume Prenume Elev" or "EXEMPLU ATESTAT".
- Add a watermark-style diagonal text across the preview: `"ATESTATAPP.RO — DOCUMENT DEMO"` rotated 45deg, `text-gray-700 text-xs font-mono opacity-30`.
- The green glow behind the doc (`.blur-3xl opacity-20`) is acceptable but reduce to `opacity-10`.

**Floating stat badges ("28 conturi", "16 anexe"):**
- **Remove these entirely.** They feel hand-crafted and undermine trust.
- Instead, integrate the stats organically into the copy below: "28+ inregistrari contabile · 16+ anexe" as small inline text under the CTA.

**Hero bottom copy:**
```
28+ înregistrări contabile · 16+ anexe · 55–60 pagini
```
- `text-xs text-gray-600`, centered below buttons.

---

#### Trust Bar

**Layout:** Horizontal flex, centered, `gap-8`, `py-5`.

**All items:**
- Icon (SVG, 16x16, `--text-tertiary`) + label (`text-sm text-gray-500`).
- No emoji anywhere — SVG icons only.
- Remove "Produs in Romania" flag emoji. Use a SVG pin icon instead.

```
SVG shield  "Date protejate"
SVG doc     "Format Word (.docx)"
SVG bolt    "Generare în 3–5 min"
SVG check   "Contabilitate verificată"
SVG pin     "Serviciu pentru România"
SVG lock    "Plată securizată"
```

**Separator:** `w-px h-4 bg-white/10` between groups.

---

#### Features Grid

**Layout:** `grid sm:grid-cols-2 lg:grid-cols-3 gap-4`, `p-6` per card, `dark-card`.

**Card:**
- `dark-card` base (already defined) — `bg-[#141414]`, border `rgba(255,255,255,0.07)`, `rounded-2xl`.
- On hover: border transitions to `--dark-border-hover`, transition `200ms ease`.
- Icon container: `w-10 h-10`, `rounded-xl`, `bg-green-glow-sm`, green icon.
- Title: `font-bold text-base`, white.
- Desc: `text-sm text-gray-400 leading-relaxed`.

**Animation on scroll:** Fade-in + translateY entrance animation. Use `IntersectionObserver` or a CSS animation triggered by adding a class. Stagger 80ms between cards.

---

#### How It Works

**Layout:** `grid md:grid-cols-3 gap-6`, `p-8` per card, `dark-card`.

**Cards — Remove watermark numbers:**
- Current: Large `text-5xl font-black` in `opacity-0.15` + small `opacity-0.10` at `top-7 right-7`.
- **New:** Replace with a styled step indicator:
  - A small `w-7 h-7 rounded-full` circle at top-left of each card.
  - Background: `bg-green-glow-sm`, border `border-green/20`.
  - Icon inside: SVG checkmark for step 1, SVG arrow-right for step 2, SVG download for step 3. `w-4 h-4`, green.
  - The step number `01`/`02`/`03` displayed as small text below the circle: `text-xs font-mono text-gray-600`.
- Title: `font-bold text-lg`, white.
- Description: `text-sm text-gray-400`.
- Tip line: Keep the left-border style tip box. `text-xs text-gray-500`, `bg-white/[0.02]`, `border-l-2 border-green/30`.

**Background section:** `#0D0D0D` (keep).

---

#### Testimonials

**Current problem:** Initials ("AM", "RD", "EP") look fabricated. No dates or platform attribution.

**Redesign:**
- Each testimonial card stays `dark-card p-6`.
- Replace initials avatar with a **real first-name + last-initial avatar** style:
  - Circle with gradient background (from `--green-glow-sm` to `transparent`), centered initial.
  - Or use the student's real school name as the "avatar" — a small school crest (SVG) or just the school initials in a circle.
- **Add platform attribution:** Add a small line: `Platforma AtestatApp · {year}` in `text-xs text-gray-600` below the school name.
- Keep star rating but make it smaller (`w-3 h-3`).
- The quote stays. It can be slightly shortened if overly promotional.
- Add a subtle quote-mark SVG decoration at top-left of each card: `opacity-10`, `text-green`.

**Example new attribution:**
```
Ana M. — Colegiul Economic Buzau
Platforma AtestatApp · 2024
```

---

#### Topics Section

**Current problem:** 16 flat tags, uniform layout, no hierarchy.

**Redesign:**
- Section title stays.
- **Pyramid layout** — create visual hierarchy:
  - Top row: 3 "hero" topics (most popular: Disponibilitati banesti, Aprovizionarea, Salarizarea) — larger tag style.
  - Below: 2 rows of 6 tags each in standard size.
  - "Alta tema" shown separately as a ghost button-style tag at end.
- **Hero tag style (top 3):**
  ```
  px-5 py-2.5 rounded-full
  bg-green-glow-sm border border-green/25
  text-sm font-semibold text-green
  hover:bg-green-glow hover:border-green/40 transition-all
  ```
- **Standard tag style:**
  ```
  px-4 py-1.5 rounded-full
  bg-white/[0.03] border border-white/[0.08]
  text-sm text-gray-400
  hover:border-white/15 hover:text-gray-200 transition-all
  ```
- Tags wrap with `flex-wrap justify-center gap-2.5`.
- Add a subtle entrance animation (stagger on scroll).

---

#### Pricing Section

**"Simplu. Fara surprize." heading:**
- Replace with: `"10 EUR. O singura plata."` — concrete, no filler.
- Remove "Fara surprize" entirely. It's generic SaaS filler.

**Refund copy:**
- Current: `"Daca documentul nu se genereaza corect, contactezi-ne si primesti banii inapoi in 24 de ore."`
- **New:** Split into two clear statements:
  1. Icon + `"Banii inapoi daca documentul nu se genereaza corect."`
  2. `"Contacteaza-ne in 24h la contact@atestatapp.ro."`
- Both in `text-sm text-gray-400`, with small SVG icons.

**Pricing card:**
- Keep the card layout. The green top-border accent is fine.
- `text-6xl font-black` for the price is appropriate.
- Make the feature list use the green checkmark (keep).
- Ensure the CTA button is prominent (already done with `btn-green`).

---

#### FAQ Section

- Keep the `<details>` accordion pattern — it works well.
- On hover of the summary: text color transitions from `text-gray-200` to `text-white`, `200ms ease`.
- Add a subtle `+` icon that rotates to `×` when open. Replace the chevron SVG.

---

#### CTA Section

**Background:** Flat `#0A0A0A` with the subtle radial glow (keep — it's minimal).

**Headline:**
- Keep "Gata sa termini atestatul?"
- "atestatul?" in `--green`.

**Sub-copy:**
- `"2 minute de completat. 3–5 minute de asteptat. Un atestat de nota 10."`
- `text-gray-400`.

**Button:** `btn-green`, `px-12 py-4`.

**Below button:**
```
10 EUR · fara abonament · banii inapoi in 24h
```
`text-xs text-gray-600`.

---

#### Footer

- Minimal. Logo + copyright + email link.
- Add: `"contact@atestatapp.ro"` as a link in `text-gray-500 hover:text-white`.

---

### 2.2 Form Page (`app/genereaza/page.tsx`)

**Overall:** Good structure. The main changes are cosmetic — remove the "Inngest" reference from the submit section, fix the progress bar connecting line, and add section hover highlights.

#### Nav Bar

- Keep exactly as is. The "Platesti doar 10 EUR" badge is fine.

#### Section Header

- Keep `pt-28 pb-8`.
- "Completeaza formularul" headline.
- Helper text: `"Campurile cu * sunt obligatorii. Ia-ti 2 minute."`

#### Progress Steps

**Current issue:** The connecting lines render outside the flex container or overlap incorrectly.

**Fix:** Wrap the progress steps in a relative container and position the lines absolutely between buttons:
```
<div className="relative">
  {/* Steps */}
  {SECTIONS.map(...)}
  {/* Line behind steps */}
  <div className="absolute top-5 left-0 right-0 h-px bg-white/5" />
</div>
```
- The line should sit BEHIND the buttons (z-index: -1), not between them.
- The "active" portion of the line should be green: add a second line overlay that grows from left based on active section index.

**Step button states (keep current logic, apply styles):**
- Active: `bg-green text-[#080808]`, no border.
- Completed: `bg-green-glow-sm border border-green/20 text-green`, checkmark icon.
- Inactive: `bg-white/5 border border-white/10 text-gray-600`.

#### Section Cards

- `dark-card p-8 space-y-5` (keep).
- Section header: small green number badge (`01`–`04`) + `font-bold text-base`.
- **Add:** On card hover, subtle border highlight: `hover:border-white/[0.10] transition-all`.

#### "AI cauta automat" Info Box

- Current: green-tinted box with star symbols `✦`.
- Keep the box, remove `✦` — use an SVG icon instead:
  ```
  SVG magnifier / search icon, 16x16, green
  ```
- Text stays.

#### Input Fields

- `input-dark` class (keep — already well-defined).
- Focus ring: `border-green box-shadow: 0 0 0 3px rgba(0,255,135,0.10)` (keep).
- Error state: `border-red-500/60 bg-red-error-bg`.

#### File Upload

- Keep dashed border style. On drag-over: `border-green/40 bg-green-glow-sm`.
- The green checkmark SVG when file is selected is fine.

#### Submit Card

**Critical change — remove Inngest reference:**
- Current: `<p className="text-gray-600 text-xs">Plata securizata · Inngest genereaza documentul in 3–5 minute</p>`
- **New:** `<p className="text-gray-600 text-xs">Plata securizata · Documentul se genereaza in 3–5 minute</p>`
- Also fix: `"banii inapoi daca documentul nu se genereaza corect"` → `"banii inapoi daca ceva nu functioneaza"` (less legal-sounding, more natural).

---

### 2.3 Success Page (`app/success/page.tsx`)

**Overall:** Solid structure. Main change is the progress bar (make it step-based, not time-based).

#### Progress Bar — Make It Step-Based

**Current:** Time-based estimation that stalls at 80%. Misleading.

**New:** Three discrete steps, each with a visual state:

```
[Step 1] ───────── [Step 2] ───────── [Step 3]
  ●○○              ○○○               ○○○
```

**Implementation:**
- Define 3 steps: `"Se cauta datele firmei"`, `"AI-ul scrie documentul"`, `"Se construieste fisierul Word"`.
- Each step has: icon circle (left) + label (right).
- Connecting line between circles: gray `bg-white/5` by default, green `bg-green` when that step is active/complete.
- The circle shows:
  - `○` (empty) when not started
  - Spinning circle when active
  - `✓` when complete
- Label color: `--green` when active/complete, `--text-tertiary` when not started.
- Remove the misleading percentage bar entirely. Replace with a step count: `"Pasul 1 din 3"` in small text.
- Add a text message below: `"Se cauta datele firmei..."` (changes as steps progress).

**Example states:**

*Step 1 — active:*
```
[○ spinner]  "Se cauta datele firmei..."
```
*Step 2 — pending:*
```
[○]          "AI-ul scrie documentul"
```
*Step 1 — done:*
```
[✓ green]    "Datele firmei au fost gasite"
```

#### Loading State Card

- Keep the card structure.
- Replace the progress bar with the step indicator above.
- The spinner stays but moves inside the step indicator.
- Sub-text: `"Nu inchide aceasta pagina — linkul de descarcare apare automat aici."` stays.

#### Done State Card

- Keep the green checkmark circle (it's good — authentic, not overdone).
- Keep the "Atestatul tau e gata!" headline.
- Keep the download button (`btn-green`).
- Below download: `"Fisierul va fi disponibil pentru descarcare 7 zile."` in `text-xs text-gray-600`.

#### Error State Card

- Keep. The red-tinted card is appropriate for error.
- Ensure the "contact@atestatapp.ro" email is a `mailto:` link.

---

## 3. Component Inventory

### Global Components

| Component | States | Notes |
|-----------|--------|-------|
| `btn-green` | default, hover, disabled, loading | Keep current CSS. Add `cursor-pointer` always. |
| `dark-card` | default, hover | Default: `#141414`, border `rgba(255,255,255,0.07)`. Hover: border `rgba(255,255,255,0.12)`. |
| `input-dark` | default, focus, error, disabled | Already defined. Add `disabled:opacity-40 disabled:cursor-not-allowed`. |
| `brand-green` | — | Text color + text-shadow glow. Keep. |
| Trust badge item | — | SVG icon + label, `text-sm text-gray-500`. |
| Step indicator | inactive, active, complete | Circle + optional spinner/check/text. |

### Landing Page Components

| Component | Notes |
|-----------|-------|
| NavBar | Fixed, `backdrop-blur-xl`, border `white/6`. Keep. |
| HeroBadge | Pill with pulsing green dot. Keep. |
| HeroHeadline | Large, multi-line, green accent. Keep (remove grid bg). |
| DocumentPreview | Mockup Word doc. Add demo watermark, fictional school name. |
| FeatureCard | `dark-card` + icon + title + desc. Add scroll animation. |
| HowItWorksCard | `dark-card` + step icon + title + desc + tip. Remove watermark numbers. |
| TestimonialCard | Stars + quote + name/school + platform attribution. |
| TopicTag | Two sizes: hero (green border) and standard (gray border). |
| PricingCard | Price + feature list + CTA. Refined copy. |
| FAQItem | Accordion `<details>`, hover highlight. Replace chevron with `+`/`×`. |
| CTABanner | Flat dark bg + radial glow + headline + button. |
| Footer | Minimal: logo, copyright, email. |

### Form Page Components

| Component | Notes |
|-----------|-------|
| FormNav | Same as landing nav. Keep. |
| ProgressSteps | Fixed: line behind buttons, z-index ordering. |
| SectionCard | `dark-card p-8`. Add hover border highlight. |
| SectionBadge | Green `01`–`04` number badge. Keep. |
| Field | Label + input + error message. Keep. |
| SelectField | Label + select. Keep. |
| TopicSelect | Large dropdown. Keep. |
| AIInfoBox | Green-tinted info box. SVG icon instead of `✦`. |
| FileUpload | Dashed border. Keep. |
| SubmitCard | Refined copy, remove "Inngest". |

### Success Page Components

| Component | Notes |
|-----------|-------|
| LoadingCard | Step indicator (3 steps), spinner, status message. |
| StepIndicator | `○`/`● spinner`/`✓` states + label + connecting line. |
| DoneCard | Green checkmark, download button, validity note. |
| ErrorCard | Red tint, error message, retry button, contact email (mailto:). |

---

## 4. Redesign Priorities (Top 5 by Conversion Impact)

### Priority 1: Hero Background — Remove AI Slop Aesthetic
**Impact: High — First impression**
The radial gradient over grid pattern is the #1 trust killer. It signals "generic AI-generated landing page" immediately. Replace with flat `#0A0A0A` + one subtle radial at top. This alone will make the page feel 2x more credible.

**File:** `app/page.tsx` — Hero section `div.absolute.inset-0`
**CSS:** Remove `backgroundImage: 'linear-gradient(...)'` grid. Keep only the radial glow, reduce opacity to `0.04`.

### Priority 2: Testimonials — Add Real Attribution
**Impact: High — Social proof credibility**
Initials "AM", "RD", "EP" read as fabricated. Replace with full first names and add `"Platforma AtestatApp · 2024"` as a footer line in each card. Real people = real trust.

**File:** `app/page.tsx` — `PROOF` array and testimonial card markup

### Priority 3: Pricing Copy — Remove Filler, Add Specific Refund Info
**Impact: High — Purchase anxiety reduction**
"Simplu. Fara surprize." is generic filler that raises suspicion rather than reducing it. Replace with concrete copy: `"Banii inapoi daca ceva nu functioneaza. Contacteaza-ne in 24h."` Specifics reduce anxiety; vagaries increase it.

**File:** `app/page.tsx` — Pricing section copy

### Priority 4: Document Preview — Remove Real-Looking Student Name
**Impact: Medium — Privacy / authenticity signal**
"Popescu Maria Ioana" in the document preview could be read as a real user's document. Replace with clearly-fictional placeholders: `"NUME ELEV"` and `"Colegiul Economic Demo"`. Add a diagonal demo watermark.

**File:** `app/page.tsx` — DocumentPreview section

### Priority 5: How-It-Works Cards — Remove Watermark Numbers
**Impact: Medium — Perceived quality**
Large `opacity-0.15` watermark numbers look cheap and like template stock. Replace with a small, well-designed step icon (circle with SVG). Makes the product feel more intentionally designed.

**File:** `app/page.tsx` — HowItWorks section card markup

---

## 5. CSS Changes (globals.css)

Add these tokens and overrides to `app/globals.css`:

```css
/* Section alternating background */
.section-alt {
  background: #0D0D0D;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 4px;
}
::-webkit-scrollbar-track {
  background: #1a1a1a;
}
::-webkit-scrollbar-thumb {
  background: rgba(0, 255, 135, 0.2);
  border-radius: 2px;
}

/* Selection color */
::selection {
  background: rgba(0, 255, 135, 0.25);
  color: #ffffff;
}

/* Tag styles */
.tag-hero {
  padding: 10px 20px;
  border-radius: 9999px;
  background: rgba(0, 255, 135, 0.06);
  border: 1px solid rgba(0, 255, 135, 0.25);
  color: rgba(0, 255, 135, 0.9);
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s ease;
}
.tag-hero:hover {
  background: rgba(0, 255, 135, 0.12);
  border-color: rgba(0, 255, 135, 0.4);
}

.tag-standard {
  padding: 6px 14px;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #888;
  font-size: 14px;
  font-weight: 400;
  transition: all 0.2s ease;
}
.tag-standard:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.15);
  color: #ccc;
}

/* Progress step connector line */
.progress-line {
  position: absolute;
  top: 20px;
  left: 0;
  right: 0;
  height: 1px;
  background: rgba(255, 255, 255, 0.05);
  z-index: 0;
}
.progress-line-active {
  position: absolute;
  top: 20px;
  left: 0;
  height: 1px;
  background: rgba(0, 255, 135, 0.3);
  z-index: 0;
  transition: width 0.3s ease;
}

/* Demo watermark for document preview */
.demo-watermark {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-45deg);
  font-size: 11px;
  font-family: monospace;
  color: rgba(255, 255, 255, 0.03);
  white-space: nowrap;
  pointer-events: none;
  user-select: none;
}

/* Step indicator circle */
.step-circle {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* Entrance animation */
@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fade-up {
  animation: fadeUp 0.4s ease-out forwards;
}
.animate-delay-1 { animation-delay: 80ms; }
.animate-delay-2 { animation-delay: 160ms; }
.animate-delay-3 { animation-delay: 240ms; }
.animate-delay-4 { animation-delay: 320ms; }
.animate-delay-5 { animation-delay: 400ms; }
```
