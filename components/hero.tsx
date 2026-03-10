import Link from "next/link";
import { Button } from "./ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-background via-background to-cyan-950/20 px-6 py-16 shadow-2xl shadow-cyan-950/10 sm:px-10 lg:px-14">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.18),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.16),_transparent_24%)]" />
      <div className="absolute right-8 top-8 hidden h-32 w-32 rounded-full border border-cyan-400/20 bg-cyan-400/10 blur-3xl lg:block" />

      <div className="relative flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl space-y-6">
          <div className="inline-flex items-center rounded-full border border-cyan-600/25 bg-cyan-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.3em] text-cyan-700 dark:border-cyan-400/30 dark:bg-cyan-400/10 dark:text-cyan-200">
            Adaptive Authentication Layer
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
              Secure every login path with Macrosatic.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              Macrosatic delivers modern authentication flows with real-time
              session intelligence, hardened identity checks, and frictionless
              access controls for high-trust products.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="bg-cyan-400 text-slate-950 hover:bg-cyan-300">
              <Link href="/auth/sign-up">Get started</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-cyan-400/30 bg-background/40">
              <Link href="/auth/login">Login</Link>
            </Button>
          </div>
        </div>

        <div className="relative grid gap-3 rounded-2xl border border-white/10 bg-slate-950/70 p-5 text-sm text-slate-100 backdrop-blur xl:min-w-[320px]">
          <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-cyan-300">
            <span>Threat Signal</span>
            <span>Live</span>
          </div>
          <div className="grid gap-3">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Session Integrity
              </p>
              <p className="mt-2 text-2xl font-semibold text-white">99.992%</p>
              <p className="mt-1 text-sm text-slate-400">
                Verified identities cleared through multi-signal risk analysis.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">
                  MFA Coverage
                </p>
                <p className="mt-2 text-lg font-semibold">Universal</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  Response Time
                </p>
                <p className="mt-2 text-xl font-semibold">&lt;120ms</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
