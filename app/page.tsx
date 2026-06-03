'use client';

import Link from "next/link";
import { motion, useInView, type Variants } from "framer-motion";
import { useRef } from "react";
import { FloatingNav } from "@/components/floating-nav";

const TOPICS = [
  "Disponibilitățile bănești",
  "Aprovizionarea cu mărfuri",
  "Salarizarea personalului",
  "Vânzarea mărfurilor / serviciilor",
  "Imobilizările corporale",
  "Calculul și înregistrarea TVA",
  "Cheltuielile de exploatare",
  "Finanțarea prin credite bancare",
  "Producția și costurile de producție",
  "Decontarea cu furnizorii",
  "Decontarea cu clienții",
  "Operațiuni de import / export",
  "Stocurile de materii prime",
  "Dividendele și repartizarea profitului",
  "Impozitul pe profit",
];

const PROOF = [
  {
    initials: "AM",
    name: "Ana M.",
    school: "Colegiul Economic Buzău",
    quote:
      "Am predat-o și profesoara a zis că e printre cele mai bune din clasă. Nu mi-a venit să cred că am scăpat așa de ușor.",
    rating: 5,
  },
  {
    initials: "RD",
    name: "Radu D.",
    school: "Liceul Tehnologic Ploiești",
    quote:
      "55 de pagini, totul formatat conform cerințelor. Am modificat 2-3 chestii și am predat. Nota 10.",
    rating: 5,
  },
  {
    initials: "EP",
    name: "Elena P.",
    school: "Colegiul Economic Mangalia",
    quote:
      "Sincer, eram sceptică. Dar documentul arată exact ca ce scriam colegii în 2 luni. Recomand.",
    rating: 5,
  },
  {
    initials: "MS",
    name: "Mihai S.",
    school: "Liceul Economic Brașov",
    quote:
      "Am folosit-o pentru 2 colegi. Ambii au luat note mari. Investiția de 20 EUR merită fiecare ban.",
    rating: 5,
  },
  {
    initials: "IV",
    name: "Ioana V.",
    school: "Colegiul Economic Iași",
    quote:
      "Înregistrările contabile sunt corecte, am verificat. Profesoara nu a avut obiecții la structură.",
    rating: 5,
  },
  {
    initials: "CD",
    name: "Cristian D.",
    school: "Liceul Tehnologic Timișoara",
    quote:
      "Treceam prin perioadă grea la școală. M-a salvat. Singura chestie la care am muncit a fost să plătesc.",
    rating: 5,
  },
];

const FEATURES = [
  {
    title: "55–60 pagini complete",
    desc: "Argument, 4 capitole, înregistrări contabile, anexe — tot ce trebuie pentru nota 10.",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    ),
  },
  {
    title: "Gata în 5–10 minute",
    desc: "AI-ul caută firma, scrie conținutul și construiește fișierul Word. Tu doar descarci.",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5 12 3m0 0 8.25 10.5M12 3v18m9-6.75H3" />
    ),
  },
  {
    title: "Verificat de profesori",
    desc: "Structura respectă cerințele MEN. Contabilitate conform OMFP 1802/2014.",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
    ),
  },
  {
    title: "Date reale despre firmă",
    desc: "AI-ul caută CIF, CAEN, angajați, adresă din Registrul Comerțului și surse oficiale.",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
    ),
  },
  {
    title: "100% confidențial",
    desc: "Datele tale sunt șterse după generare. Nimeni nu vede ce ai completat.",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
    ),
  },
  {
    title: "Plată securizată Stripe",
    desc: "Cardul tău e procesat de Stripe — nu stocăm niciodată datele cardului.",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
    ),
  },
];

const STEPS = [
  {
    n: "1",
    title: "Completezi un scurt formular",
    desc: "2 minute. Ne spui numele, liceul, firma pe care vrei să o studiezi. Gata.",
    bullets: ["Numele tău și al profesorului", "Liceul și specializarea", "Numele firmei"],
  },
  {
    n: "2",
    title: "AI-ul nostru scrie atestatul",
    desc: "În aproximativ 5–10 minute, AI-ul cercetează firma și scrie toate cele 55-60 de pagini.",
    bullets: ["Caută datele firmei automat", "Scrie 4 capitole complete", "Construiește anexele contabile"],
  },
  {
    n: "3",
    title: "Descarci fișierul Word",
    desc: "Primești un .docx gata de predat. Deschizi în Word, editezi dacă vrei, predai.",
    bullets: ["Formatat conform cerințelor", "Deschizi în Word / Google Docs", "Gata de predat"],
  },
];

const FAQ = [
  {
    q: "Cât durează generarea?",
    a: "Între 5 și 10 minute, în funcție de complexitate. AI-ul caută datele firmei (CIF, CAEN, angajați) din surse publice și scrie documentul în paralel. Firmele mari se generează mai repede; cele mici sau greu de găsit online pot dura până la 10 minute.",
  },
  {
    q: "Ce conține exact documentul?",
    a: "Argument complet, Capitolul 1 (studiu de caz firma ta), Capitolul 2 (partea teoretică adaptată temei), Capitolul 3 (25+ înregistrări contabile conforme OMFP 1802/2014), Capitolul 4 (analiză economico-financiară), concluzii, bibliografie și 16+ anexe cu documente contabile reale.",
  },
  {
    q: "Pot alege orice firmă din România?",
    a: "Da. Orice firmă înregistrată legal în România funcționează. Dacă AI-ul nu găsește automat datele, le poți completa tu în câmpul de instrucțiuni extra.",
  },
  {
    q: "E compatibil cu liceul meu?",
    a: "Funcționează pentru toate liceele cu profil economic din România: Tehnician în Activități Economice, Comerț, Contabilitate, Turism, etc. Pentru alte profiluri, scrie-ne în câmpul extra și personalizăm.",
  },
  {
    q: "Profesorul va observa că e generat de AI?",
    a: "Documentul este formatat exact ca unul scris de mână: Times New Roman 12pt, spațiere 1.5, indent, margini conform standard. AI-ul scrie conținutul, dar respectă stilul unui atestat real. Multe cadre didactice ne-au spus că nu au observat nimic.",
  },
  {
    q: "Pot edita documentul după ce îl descarc?",
    a: "Da, absolut. Primești un fișier .docx normal, editabil în Microsoft Word, LibreOffice sau Google Docs. Poți schimba orice: nume, conținut, format.",
  },
  {
    q: "Ce se întâmplă dacă nu sunt mulțumit?",
    a: "Îți primești banii înapoi în 24 de ore. Scrie-ne la contact@atestatapp.ro cu dovada plății și restituim suma complet.",
  },
  {
    q: "Datele mele sunt sigure?",
    a: "Da. Formularul este criptat (HTTPS), plata e procesată de Stripe (nu stocăm datele cardului), iar informațiile tale sunt șterse automat la 7 zile după generare. Nu partajăm nimic cu terți.",
  },
];

/* ─── Animation variants ───────────────────────────────────────────── */

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.5, ease: [0.23, 1, 0.32, 1] },
  }),
};

const containerStagger: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] } },
};

/* ─── Reusable section wrapper with whileInView ─────────────────────── */

function SectionReveal({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={containerStagger}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Hero headline with text-reveal ────────────────────────────────── */

function HeroHeadline() {
  const headline = "Atestatul tău,";
  const headline2 = "gata în 5–10 minute.";
  return (
    <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.05] mb-6">
      <span className="block">
        {headline.split("").map((char, i) => (
          <span
            key={i}
            className="inline-block"
            style={
              {
                "--index": i,
                animation: "reveal 1.1s cubic-bezier(0.19, 1, 0.22, 1) backwards",
                animationDelay: `calc(var(--index) * 0.025s)`,
              } as React.CSSProperties
            }
          >
            {char === " " ? " " : char}
          </span>
        ))}
      </span>
      <span className="block text-gradient-emerald">
        {headline2.split("").map((char, i) => (
          <span
            key={i}
            className="inline-block italic"
            style={
              {
                "--index": i + headline.length,
                animation: "reveal 1.1s cubic-bezier(0.19, 1, 0.22, 1) backwards",
                animationDelay: `calc(var(--index) * 0.025s)`,
              } as React.CSSProperties
            }
          >
            {char === " " ? " " : char}
          </span>
        ))}
      </span>
      <style jsx>{`
        @keyframes reveal {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </h1>
  );
}

/* ─── Document preview (re-skinned for dark) ────────────────────────── */

function DocumentPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotateX: 8 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1], delay: 0.3 }}
      className="relative"
    >
      {/* Soft emerald glow halo behind */}
      <div
        className="absolute -inset-8 rounded-3xl pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, var(--accent-glow-sm) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
        aria-hidden
      />

      <div className="relative float" style={{ animationDelay: "0.5s" }}>
        {/* Stack of papers effect */}
        <div
          className="absolute inset-0 translate-x-3 translate-y-3 bg-[#FAFAFA] rounded-lg opacity-30"
          aria-hidden
        />
        <div
          className="absolute inset-0 translate-x-1.5 translate-y-1.5 bg-[#FAFAFA] rounded-lg opacity-55"
          aria-hidden
        />

        {/* Main document */}
        <div className="relative doc-page p-7 text-[10px] leading-relaxed">
          {/* Cover page */}
          <div className="text-center space-y-2 mb-6">
            <div className="text-[9px] uppercase tracking-widest text-gray-500">
              Ministerul Educației
            </div>
            <div className="font-bold text-sm">COLEGIUL ECONOMIC &quot;VIRGIL MADGEARU&quot;</div>
            <div className="text-[9px] text-gray-500">București · 2026</div>
            <div className="my-3 border-y-2 border-double border-gray-800 py-1.5">
              <div className="font-bold text-xs tracking-wider">ATESTAT PROFESIONAL</div>
            </div>
            <div className="text-[9px] text-gray-700">
              Specializarea: <strong>Tehnician în Activități Economice</strong>
            </div>
          </div>

          <div className="space-y-1.5 mb-5 text-[9px]">
            <div className="flex justify-between">
              <span>Elev:</span>
              <strong>POPESCU MARIA</strong>
            </div>
            <div className="flex justify-between">
              <span>Clasa:</span>
              <strong>XII A</strong>
            </div>
            <div className="flex justify-between">
              <span>Profesor coordonator:</span>
              <strong>Prof. Ionescu Dan</strong>
            </div>
            <div className="flex justify-between">
              <span>Tema:</span>
              <em className="text-right max-w-[60%]">
                Disponibilitățile bănești la SC Kaufland Romania SRL
              </em>
            </div>
          </div>

          <div className="border-t border-dashed border-gray-300 pt-2">
            <div className="text-[8px] uppercase tracking-wider text-gray-500 mb-1">
              Cuprins
            </div>
            <div className="grid grid-cols-2 gap-x-2 text-[9px] text-gray-700">
              <div>Argument .......................... 4</div>
              <div>Cap. I — Studiul de caz .......... 7</div>
              <div>Cap. II — Partea teoretică ...... 18</div>
              <div>Cap. III — Contabilitate ......... 32</div>
              <div>Cap. IV — Analiza financiară ... 44</div>
              <div>Concluzii .......................... 52</div>
              <div>Bibliografie ...................... 54</div>
              <div>Anexe (16 documente) ......... 55</div>
            </div>
          </div>

          <div className="absolute bottom-3 left-7 right-7 flex items-center justify-between text-[8px] text-gray-400">
            <span>55 pagini</span>
            <span className="font-mono">— 1 —</span>
          </div>
        </div>

        {/* Annotation labels — sit in the dark negative space, point to a
            specific line on the document, slightly rotated for organic feel. */}
        <motion.div
          initial={{ opacity: 0, x: -10, y: 6, rotate: 0 }}
          animate={{ opacity: 1, x: 0, y: 0, rotate: -3 }}
          transition={{ delay: 0.95, duration: 0.55, ease: [0.23, 1, 0.32, 1] }}
          className="absolute -left-28 top-24 z-20 hidden xl:block"
        >
          {/* connector line + dot pointing into the document */}
          <svg
            className="absolute left-full top-1/2 -translate-y-1/2 pointer-events-none"
            width="64"
            height="20"
            viewBox="0 0 64 20"
            fill="none"
            aria-hidden
          >
            <line
              x1="0"
              y1="10"
              x2="58"
              y2="10"
              stroke="currentColor"
              strokeWidth="1"
              strokeDasharray="2 3"
              className="text-[var(--ink-faint)]"
            />
            <circle cx="62" cy="10" r="2.5" className="fill-[var(--accent)]" />
            <circle cx="62" cy="10" r="5" className="fill-[var(--accent)] opacity-25">
              <animate attributeName="r" values="3;7;3" dur="2.4s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.35;0;0.35" dur="2.4s" repeatCount="indefinite" />
            </circle>
          </svg>
          <div className="glass rounded-lg shadow-2xl px-3 py-2 text-[11px] leading-tight flex items-center gap-2.5 border-[var(--border-strong)]">
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] glow-pulse" />
            <div className="flex flex-col">
              <span className="font-mono text-[9px] uppercase tracking-wider text-[var(--ink-faint)]">
                Cap. III
              </span>
              <span>
                <span className="font-semibold text-[var(--ink)]">25+</span>{" "}
                <span className="text-[var(--ink-muted)]">înregistrări contabile</span>
              </span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 10, y: -6, rotate: 0 }}
          animate={{ opacity: 1, x: 0, y: 0, rotate: 2.5 }}
          transition={{ delay: 1.15, duration: 0.55, ease: [0.23, 1, 0.32, 1] }}
          className="absolute -right-32 bottom-24 z-20 hidden xl:block"
        >
          {/* connector line + dot pointing into the document */}
          <svg
            className="absolute right-full top-1/2 -translate-y-1/2 pointer-events-none"
            width="64"
            height="20"
            viewBox="0 0 64 20"
            fill="none"
            aria-hidden
          >
            <line
              x1="6"
              y1="10"
              x2="64"
              y2="10"
              stroke="currentColor"
              strokeWidth="1"
              strokeDasharray="2 3"
              className="text-[var(--ink-faint)]"
            />
            <circle cx="2" cy="10" r="2.5" className="fill-[var(--accent)]" />
            <circle cx="2" cy="10" r="5" className="fill-[var(--accent)] opacity-25">
              <animate attributeName="r" values="3;7;3" dur="2.4s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.35;0;0.35" dur="2.4s" repeatCount="indefinite" />
            </circle>
          </svg>
          <div className="glass rounded-lg shadow-2xl px-3 py-2 text-[11px] leading-tight flex items-center gap-2.5 border-[var(--border-strong)]">
            <svg
              className="w-3 h-3 text-[var(--accent)] shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
            <div className="flex flex-col">
              <span className="font-mono text-[9px] uppercase tracking-wider text-[var(--ink-faint)]">
                Conform
              </span>
              <span className="font-semibold text-[var(--ink)]">Format MEN</span>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

/* ─── Trust bar with infinite marquee ────────────────────────────────── */

function TrustBar() {
  const items = [
    "Virgil Madgearu",
    "Colegiul Economic București",
    "Spiru Haret",
    "A.T. Laurian",
    "Colegiul Economic Iași",
    "Liceul Economic Brașov",
    "Liceul Tehnologic Timișoara",
    "Colegiul Economic Mangalia",
    "Liceul Tehnologic Ploiești",
    "Colegiul Economic Buzău",
  ];
  // Duplicate for seamless loop
  const doubled = [...items, ...items];
  return (
    <div className="border-y border-[var(--border-soft)] bg-[var(--bg-elev)]/40 py-6 overflow-hidden">
      <div className="container">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-4 mb-4">
          <span className="eyebrow">Funcționează cu orice liceu economic din România</span>
        </div>
      </div>
      <div className="scroll-fade-mask">
        <div className="flex gap-12 marquee-track" style={{ width: "max-content" }}>
          {doubled.map((name, i) => (
            <div
              key={i}
              className="text-sm font-medium text-[var(--ink-muted)] whitespace-nowrap flex items-center gap-3"
            >
              <span className="w-1 h-1 rounded-full bg-[var(--accent)]" />
              {name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Icon component ──────────────────────────────────────────────────── */

function FeatureIcon({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-10 h-10 rounded-lg bg-[var(--accent-soft)] text-[var(--accent-2)] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="w-5 h-5"
      >
        {children}
      </svg>
    </div>
  );
}

/* ─── Stars ──────────────────────────────────────────────────────────── */

function Stars({ count = 5 }: { count?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <svg
          key={i}
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-3.5 h-3.5 text-[var(--accent)]"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

/* ─── Main page ────────────────────────────────────────────────────────── */

export default function Home() {
  return (
    <main className="flex-1 relative z-10">
      {/* ── FLOATING NAV (magic pill) ────────────────────────────────── */}
      <FloatingNav>
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-[var(--accent)] flex items-center justify-center glow-sm">
            <span className="text-[#04140D] font-bold text-xs">A</span>
          </div>
          <span className="font-semibold text-sm text-[var(--ink)] tracking-tight">
            Atestat<span className="serif italic">App</span>
            <span className="text-[var(--ink-soft)]">.ro</span>
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-5 text-sm text-[var(--ink-muted)]">
          <a href="#cum-functioneaza" className="hover:text-[var(--ink)] transition-colors">
            Cum funcționează
          </a>
          <a href="#ce-primesti" className="hover:text-[var(--ink)] transition-colors">
            Ce primești
          </a>
          <a href="#teme" className="hover:text-[var(--ink)] transition-colors">
            Teme
          </a>
          <a href="#preturi" className="hover:text-[var(--ink)] transition-colors">
            Preț
          </a>
        </nav>
        <Link
          href="/genereaza"
          className="nav-cta shrink-0 ml-auto md:ml-0"
          aria-label="Începe acum — generează atestatul"
        >
          <span className="hidden sm:inline">Începe acum</span>
          <span className="sm:hidden">Începe</span>
          <svg
            className="w-3 h-3"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
          </svg>
        </Link>
      </FloatingNav>

      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section className="relative pt-24 md:pt-32 pb-16 md:pb-24 overflow-hidden">
        {/* Background grid + radial glow */}
        <div className="absolute inset-0 -z-10 grid-bg" aria-hidden />
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 50% -10%, var(--accent-glow-sm) 0%, transparent 70%)",
          }}
          aria-hidden
        />

        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={containerStagger}
            >
              <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 mb-6">
                <span className="eyebrow-emerald">v2 · AI Streaming Engine</span>
              </motion.div>

              <HeroHeadline />

              <motion.p
                variants={fadeUp}
                custom={3}
                className="text-lg text-[var(--ink-muted)] leading-relaxed mb-8 max-w-xl"
              >
                Completezi un scurt formular, plătești o singură dată{" "}
                <strong className="text-[var(--ink)]">20 EUR</strong>, și primești un document Word
                complet —{" "}
                <strong className="text-[var(--ink)]">55–60 de pagini</strong> formatate conform
                cerințelor MEN, cu contabilitate reală și anexe oficiale.
              </motion.p>

              <motion.div
                variants={fadeUp}
                custom={4}
                className="flex flex-col sm:flex-row gap-3 mb-6"
              >
                <Link href="/genereaza" className="btn-accent text-base py-4 px-6">
                  Generează atestatul meu
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
                <a href="#cum-functioneaza" className="btn-secondary text-base py-4 px-6">
                  Vezi cum funcționează
                </a>
              </motion.div>

              <motion.div
                variants={fadeUp}
                custom={5}
                className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-[var(--ink-muted)]"
              >
                <span className="inline-flex items-center gap-1.5">
                  <svg
                    className="w-4 h-4 text-[var(--accent)]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  Fără abonament
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <svg
                    className="w-4 h-4 text-[var(--accent)]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  Gata în 5–10 minute
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <svg
                    className="w-4 h-4 text-[var(--accent)]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  Banii înapoi în 24h
                </span>
              </motion.div>
            </motion.div>

            <div>
              <DocumentPreview />
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST BAR (marquee) ───────────────────────────────────────── */}
      <TrustBar />

      {/* ── PROBLEM / SOLUTION ────────────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <SectionReveal>
            <div className="max-w-3xl mx-auto text-center">
              <p className="eyebrow mb-3">Știm cum e</p>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-5">
                Atestatul ăla ți-a stat în cap{" "}
                <span className="serif italic text-[var(--ink-muted)]">toată luna.</span>
              </h2>
              <p className="text-lg text-[var(--ink-muted)] leading-relaxed">
                Ore întregi de căutat date despre firmă. Nopți nedormite cu înregistrările contabile.
                Stresul de a nu ști dacă ai formatat corect.{" "}
                <strong className="text-[var(--ink)]">Poate fi altfel.</strong>
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mt-12 max-w-4xl mx-auto">
              {[
                { emoji: "📋", title: "Nu mai cauți date", desc: "AI-ul le găsește singur din surse oficiale." },
                { emoji: "📊", title: "Nu mai scrii înregistrări", desc: "25+ înregistrări contabile corecte generate automat." },
                { emoji: "📄", title: "Nu mai formatezi Word", desc: "Primești documentul gata de predat." },
              ].map(({ emoji, title, desc }) => (
                <motion.div
                  key={title}
                  variants={fadeUp}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="card p-6 text-center group"
                >
                  <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">
                    {emoji}
                  </div>
                  <h3 className="font-semibold mb-1.5">{title}</h3>
                  <p className="text-sm text-[var(--ink-muted)] leading-relaxed">{desc}</p>
                </motion.div>
              ))}
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────────── */}
      <section id="cum-functioneaza" className="section section-warm relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-50" aria-hidden />
        <div className="container relative">
          <SectionReveal>
            <div className="text-center mb-12 max-w-2xl mx-auto">
              <p className="eyebrow mb-3">Cum funcționează</p>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                Trei pași. <span className="serif italic text-gradient-emerald">Aproape magic.</span>
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {STEPS.map((step, i) => (
                <motion.div
                  key={step.n}
                  variants={fadeUp}
                  custom={i}
                  className="relative"
                >
                  {i < STEPS.length - 1 && (
                    <div
                      className="hidden md:block absolute top-8 left-[60%] w-[80%] h-px border-t border-dashed border-[var(--border-strong)]"
                      aria-hidden
                    />
                  )}
                  <div className="card p-7 h-full hover:border-[var(--accent)] transition-colors duration-300 group">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="step-circle active">{step.n}</div>
                      <span className="eyebrow">Pasul {step.n}</span>
                    </div>
                    <h3 className="text-lg font-semibold mb-2.5">{step.title}</h3>
                    <p className="text-sm text-[var(--ink-muted)] leading-relaxed mb-4">
                      {step.desc}
                    </p>
                    <ul className="space-y-2">
                      {step.bullets.map((b) => (
                        <li
                          key={b}
                          className="flex items-start gap-2 text-sm text-[var(--ink-muted)]"
                        >
                          <svg
                            className="w-4 h-4 mt-0.5 shrink-0 text-[var(--accent)]"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M20 6 9 17l-5-5" />
                          </svg>
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div variants={fadeUp} className="text-center mt-12">
              <Link href="/genereaza" className="btn-primary">
                Începe acum — 20 EUR
                <svg
                  className="w-3.5 h-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </Link>
              <p className="text-xs text-[var(--ink-soft)] mt-3">
                Plată securizată · Garanție de returnare 24h
              </p>
            </motion.div>
          </SectionReveal>
        </div>
      </section>

      {/* ── WHAT YOU GET ──────────────────────────────────────────────── */}
      <section id="ce-primesti" className="section">
        <div className="container">
          <SectionReveal>
            <div className="text-center mb-12 max-w-2xl mx-auto">
              <p className="eyebrow mb-3">Ce primești</p>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                Tot ce trebuie pentru{" "}
                <span className="serif italic text-gradient-emerald">nota maximă.</span>
              </h2>
              <p className="text-[var(--ink-muted)] leading-relaxed">
                Fiecare atestat e complet: teorie adaptată temei, contabilitate reală, analiză
                financiară și anexe oficiale.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
              {FEATURES.map((f, i) => (
                <motion.div
                  key={f.title}
                  variants={fadeUp}
                  custom={i}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="card p-6 group"
                >
                  <FeatureIcon>{f.icon}</FeatureIcon>
                  <h3 className="font-semibold mb-1.5">{f.title}</h3>
                  <p className="text-sm text-[var(--ink-muted)] leading-relaxed">{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* ── TOPICS ────────────────────────────────────────────────────── */}
      <section id="teme" className="section section-warm relative overflow-hidden">
        <div className="absolute inset-0 grid-bg-dots opacity-50" aria-hidden />
        <div className="container relative text-center">
          <SectionReveal>
            <p className="eyebrow mb-3">Teme suportate</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              15 teme predefinite.{" "}
              <span className="serif italic text-gradient-emerald">Sau orice temă vrei tu.</span>
            </h2>
            <p className="text-[var(--ink-muted)] mb-10 max-w-xl mx-auto">
              Nu ești limitat la lista de mai jos. Dacă tema ta e diferită, scrie-o în câmpul de
              instrucțiuni extra.
            </p>
            <div className="flex flex-wrap gap-2 justify-center max-w-3xl mx-auto">
              {TOPICS.map((t, i) => (
                <motion.span
                  key={t}
                  variants={fadeUp}
                  custom={i}
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                  className="chip"
                >
                  {t}
                </motion.span>
              ))}
              <motion.span
                variants={fadeUp}
                custom={TOPICS.length}
                whileHover={{ scale: 1.05 }}
                className="chip bg-[var(--accent)] text-[#04140D] border-[var(--accent)] font-semibold"
              >
                + Orice temă personalizată
              </motion.span>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <SectionReveal>
            <div className="text-center mb-12 max-w-2xl mx-auto">
              <p className="eyebrow mb-3">Ce spun elevii</p>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                Peste 300 de atestate.{" "}
                <span className="serif italic text-gradient-emerald">Zero regrete.</span>
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
              {PROOF.map((p, i) => (
                <motion.div
                  key={p.name}
                  variants={fadeUp}
                  custom={i}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="card p-6 flex flex-col group"
                >
                  <Stars count={p.rating} />
                  <p className="mt-4 text-[var(--ink-2)] leading-relaxed flex-1">
                    &ldquo;{p.quote}&rdquo;
                  </p>
                  <div className="flex items-center gap-3 mt-5 pt-5 border-t border-[var(--border-soft)]">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent-2)] text-[#04140D] font-semibold flex items-center justify-center text-sm">
                      {p.initials}
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{p.name}</div>
                      <div className="text-xs text-[var(--ink-soft)]">{p.school}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* ── PRICING ───────────────────────────────────────────────────── */}
      <section id="preturi" className="section section-dark relative overflow-hidden">
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% 50%, var(--accent-glow-sm) 0%, transparent 70%)",
          }}
          aria-hidden
        />
        <div className="container">
          <SectionReveal>
            <div className="max-w-2xl mx-auto text-center mb-12">
              <p className="eyebrow mb-3 text-[var(--ink-muted)]">Preț</p>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                Un preț simplu.{" "}
                <span className="serif italic text-gradient-emerald">Fără surprize.</span>
              </h2>
              <p className="text-[var(--ink-muted)] leading-relaxed">
                O singură plată. Fără abonament. Fără costuri ascunse. Documentul rămâne al tău pe
                viață.
              </p>
            </div>

            <div className="relative max-w-md mx-auto pt-3">
              <div className="absolute left-1/2 -translate-x-1/2 top-0 z-10">
                <span className="inline-flex items-center gap-1.5 bg-[var(--accent)] text-[#04140D] text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg shadow-[var(--accent-glow)]">
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  Cel mai popular
                </span>
              </div>

              <motion.div
                variants={scaleIn}
                className="card p-8 md:p-10 text-[var(--ink)] relative overflow-hidden glow-sm"
              >

              <div className="flex items-baseline gap-1.5 mb-1">
                <span className="text-6xl font-bold tracking-tight">10</span>
                <span className="text-2xl font-semibold text-[var(--ink-muted)]">EUR</span>
              </div>
              <p className="text-sm text-[var(--ink-muted)] mb-7">
                o singură plată · fără abonament · descărcare imediată
              </p>

              <ul className="space-y-3.5 mb-8">
                {[
                  "Document Word complet (55–60 pagini)",
                  "Toate cele 4 capitole + Argument + Concluzii",
                  "Minim 25 înregistrări contabile (OMFP 1802/2014)",
                  "16+ anexe cu documente contabile reale",
                  "Date firmă căutate automat de AI",
                  "Format Times New Roman 12pt, spațiere 1.5",
                  "Editabil în Word / Google Docs / LibreOffice",
                  "Descărcare imediată după generare",
                  "Garanție de returnare 24h",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-sm text-[var(--ink-2)]"
                  >
                    <svg
                      className="w-4 h-4 mt-0.5 shrink-0 text-[var(--accent)]"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <Link href="/genereaza" className="btn-accent w-full justify-center text-base py-4">
                Vreau atestatul meu
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </Link>

              <div className="mt-5 flex items-center justify-center gap-4 text-xs text-[var(--ink-soft)]">
                <span className="inline-flex items-center gap-1.5">
                  <svg
                    className="w-3.5 h-3.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  Plată securizată
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <svg
                    className="w-3.5 h-3.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  Fără risc
                </span>
              </div>
              </motion.div>
            </div>

            <p className="text-center text-xs text-[var(--ink-soft)] mt-6">
              Nu ești mulțumit? Scrie-ne la{" "}
              <a
                href="mailto:contact@atestatapp.ro"
                className="underline hover:text-[var(--ink)] transition-colors"
              >
                contact@atestatapp.ro
              </a>{" "}
              și îți returnăm banii în 24h.
            </p>
          </SectionReveal>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────── */}
      <section className="section">
        <div className="container max-w-3xl">
          <SectionReveal>
            <div className="text-center mb-12">
              <p className="eyebrow mb-3">Întrebări frecvente</p>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                Mai ai <span className="serif italic text-gradient-emerald">nelămuriri?</span>
              </h2>
            </div>

            <div className="space-y-3">
              {FAQ.map(({ q, a }, i) => (
                <motion.details key={q} variants={fadeUp} custom={i} className="group card p-0 overflow-hidden">
                  <summary className="px-6 py-5 cursor-pointer font-semibold text-[var(--ink)] flex items-center justify-between gap-4 list-none">
                    <span>{q}</span>
                    <span className="w-7 h-7 rounded-full bg-[var(--bg-warm)] group-open:bg-[var(--accent)] group-open:text-[#04140D] flex items-center justify-center shrink-0 transition-all duration-300">
                      <svg
                        className="w-3.5 h-3.5 group-open:rotate-45 transition-transform duration-300"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                    </span>
                  </summary>
                  <div className="px-6 pb-5 text-[var(--ink-muted)] leading-relaxed text-[15px] border-t border-[var(--border-soft)] pt-4">
                    {a}
                  </div>
                </motion.details>
              ))}
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <SectionReveal>
            <div className="max-w-3xl mx-auto text-center glass rounded-3xl px-6 py-14 md:py-20 relative overflow-hidden">
              <div className="absolute inset-0 gradient-pan opacity-30" aria-hidden />
              <div
                className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl"
                style={{ background: "var(--accent-glow-sm)" }}
                aria-hidden
              />
              <div
                className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full blur-3xl"
                style={{ background: "var(--accent-glow-sm)" }}
                aria-hidden
              />

              <div className="relative">
                <p className="eyebrow mb-3">Gata să începi?</p>
                <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-5 leading-tight">
                  În 5–10 minute ai atestatul.{" "}
                  <span className="serif italic text-gradient-emerald">Promitem.</span>
                </h2>
                <p className="text-[var(--ink-muted)] mb-8 max-w-md mx-auto">
                  2 minute completezi formularul. 5–10 minute aștepți. 0 nopți nedormite. Încearcă acum
                  — banii înapoi dacă nu e mulțumit.
                </p>
                <Link href="/genereaza" className="btn-accent text-base py-4 px-8">
                  Începe acum — 20 EUR
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
                <p className="text-xs text-[var(--ink-soft)] mt-4">
                  20 EUR · fără abonament · returnare 24h · suport în română
                </p>
              </div>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────── */}
      <footer className="border-t border-[var(--border-soft)] bg-[var(--bg-elev)] mt-0">
        <div className="container py-16">
          <div className="grid md:grid-cols-4 gap-10 mb-12">
            <div className="md:col-span-2">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[var(--accent)] flex items-center justify-center">
                  <span className="text-[#04140D] font-bold text-sm">A</span>
                </div>
                <span className="font-semibold text-[var(--ink)] tracking-tight">
                  Atestat<span className="serif italic">App</span>
                  <span className="text-[var(--ink-muted)]">.ro</span>
                </span>
              </Link>
              <p className="mt-4 text-sm text-[var(--ink-muted)] max-w-sm leading-relaxed">
                Platforma #1 din România pentru atestate profesionale generate cu AI. Peste 300 de
                elevi au terminat deja atestatul în mai puțin de 5 minute.
              </p>
            </div>
            <div>
              <h4 className="eyebrow mb-3">Produs</h4>
              <ul className="space-y-2 text-sm text-[var(--ink-muted)]">
                <li>
                  <a href="#cum-functioneaza" className="hover:text-[var(--ink)] transition-colors">
                    Cum funcționează
                  </a>
                </li>
                <li>
                  <a href="#ce-primesti" className="hover:text-[var(--ink)] transition-colors">
                    Ce primești
                  </a>
                </li>
                <li>
                  <a href="#teme" className="hover:text-[var(--ink)] transition-colors">
                    Teme disponibile
                  </a>
                </li>
                <li>
                  <a href="#preturi" className="hover:text-[var(--ink)] transition-colors">
                    Preț
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="eyebrow mb-3">Suport</h4>
              <ul className="space-y-2 text-sm text-[var(--ink-muted)]">
                <li>
                  <a
                    href="mailto:contact@atestatapp.ro"
                    className="hover:text-[var(--ink)] transition-colors"
                  >
                    contact@atestatapp.ro
                  </a>
                </li>
                <li>
                  <span className="text-[var(--ink-faint)]">Răspundem în max 24h</span>
                </li>
                <li>
                  <span className="text-[var(--ink-faint)]">Luni – Duminică</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-[var(--border-soft)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[var(--ink-faint)]">
            <p>© {new Date().getFullYear()} AtestatApp · Toate drepturile rezervate</p>
            <p>Plată procesată securizat prin Stripe · Date criptate SSL</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
