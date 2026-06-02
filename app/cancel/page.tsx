'use client';

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { FloatingNav } from "@/components/floating-nav";

const pageVariants: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.3 + i * 0.08, duration: 0.4, ease: [0.23, 1, 0.32, 1] },
  }),
};

export default function CancelPage() {
  return (
    <div className="flex-1 relative z-10">
      {/* Floating nav */}
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
      </FloatingNav>

      <div className="container max-w-2xl pt-24 md:pt-28 pb-12 md:pb-20">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={pageVariants}
          className="card p-8 md:p-12 text-center relative overflow-hidden"
        >
          <div
            className="absolute inset-0 -z-0"
            style={{
              background:
                "radial-gradient(ellipse 60% 50% at 50% 0%, var(--gold-glow) 0%, transparent 70%)",
            }}
            aria-hidden
          />

          <div className="relative">
            <motion.div
              variants={itemVariants}
              custom={0}
              className="flex justify-center mb-6"
            >
              <div className="relative">
                <motion.div
                  className="w-20 h-20 rounded-full bg-[var(--gold-soft)] flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                >
                  <svg
                    className="w-10 h-10 text-[var(--gold)]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 8v4M12 16h.01" />
                  </svg>
                </motion.div>
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-[var(--gold)]/30"
                  initial={{ scale: 1, opacity: 0.6 }}
                  animate={{ scale: 1.4, opacity: 0 }}
                  transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
                />
              </div>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              custom={1}
              className="text-2xl md:text-3xl font-bold tracking-tight mb-3"
            >
              Plata a fost anulată
            </motion.h1>
            <motion.p
              variants={itemVariants}
              custom={2}
              className="text-[var(--ink-muted)] max-w-md mx-auto mb-8"
            >
              Nicio sumă nu a fost reținută din contul tău. Poți încerca din nou oricând ești
              pregătit — datele completate anterior nu s-au pierdut.
            </motion.p>

            <motion.div
              variants={itemVariants}
              custom={3}
              className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto"
            >
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                <Link href="/genereaza" className="btn-accent text-sm py-3 w-full">
                  Încearcă din nou
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
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                <Link href="/" className="btn-secondary text-sm py-3 w-full block">
                  Pagina principală
                </Link>
              </motion.div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              custom={4}
              className="mt-10 pt-8 border-t border-[var(--border-soft)]"
            >
              <p className="text-sm text-[var(--ink-soft)] mb-4">
                Ai întrebări înainte să încerci?
              </p>
              <div className="grid sm:grid-cols-3 gap-4 text-left max-w-lg mx-auto">
                {[
                  { title: "Banii înapoi", desc: "În 24h, fără întrebări" },
                  { title: "Gata în 3 min", desc: "Documentul e rapid" },
                  { title: "Suport", desc: "contact@atestatapp.ro" },
                ].map(({ title, desc }, i) => (
                  <motion.div
                    key={title}
                    variants={itemVariants}
                    custom={5 + i}
                    className="text-center sm:text-left"
                  >
                    <div className="text-sm font-medium text-[var(--ink)]">{title}</div>
                    <div className="text-xs text-[var(--ink-soft)]">{desc}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
