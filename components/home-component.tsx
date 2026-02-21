import Link from "next/link";
import {
  Hotel,
  ArrowRight,
  Package,
  ClipboardList,
  Users,
  Store,
  BarChart3,
  ShieldCheck,
  ArrowUpRight,
  Activity,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const modules = [
  {
    icon: ClipboardList,
    title: "Procurement",
    desc: "Purchase orders, approvals, goods receive & credit notes",
    iconBg: "bg-info/10",
    iconColor: "text-info",
  },
  {
    icon: Package,
    title: "Inventory",
    desc: "Real-time stock tracking, adjustments & physical counts",
    iconBg: "bg-success/10",
    iconColor: "text-success",
  },
  {
    icon: Users,
    title: "Vendors",
    desc: "Supplier directory, price lists & request management",
    iconBg: "bg-warning/10",
    iconColor: "text-warning",
  },
  {
    icon: Store,
    title: "Store Ops",
    desc: "Requisitions, replenishment & wastage reporting",
    iconBg: "bg-info/10",
    iconColor: "text-info",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    desc: "Reports, insights & data-driven purchasing decisions",
    iconBg: "bg-success/10",
    iconColor: "text-success",
  },
  {
    icon: ShieldCheck,
    title: "Administration",
    desc: "Roles, workflows, documents & system configuration",
    iconBg: "bg-warning/10",
    iconColor: "text-warning",
  },
];

export default function HomeComponent() {
  return (
    <div className="relative min-h-svh">
      {/* Dot grid – full page */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 bg-invert backdrop-blur-lg">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary shadow-sm shadow-primary/20">
              <Hotel className="size-4 text-primary-foreground" />
            </div>
            <span className="text-[15px] font-bold tracking-tight text-invert-foreground">
              Carmen
            </span>
          </div>
          <Button asChild size="sm" variant={"secondary"}>
            <Link href="/login">
              Sign In <ArrowRight />
            </Link>
          </Button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-invert">
        {/* Ambient glow */}
        <div className="absolute left-1/2 top-0 size-175 -translate-x-1/2 -translate-y-1/2 rounded-full bg-info/8 blur-[150px]" />
        <div className="absolute -bottom-32 -right-20 size-125 rounded-full bg-success/[0.07] blur-[120px]" />

        <div className="relative z-10 mx-auto max-w-6xl px-6 pb-20 pt-20 md:pb-28 md:pt-28">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-invert-foreground/8 bg-invert-foreground/4 px-3.5 py-1.5 backdrop-blur-sm">
            <div className="size-1.5 rounded-full bg-success" />
            <span className="text-[11px] font-medium text-invert-foreground/50">
              Hotel Inventory ERP Platform
            </span>
          </div>

          <h1 className="max-w-2xl text-[clamp(32px,5vw,56px)] font-bold leading-[1.08] tracking-tight text-invert-foreground">
            Hotel inventory
            <br />
            management,{" "}
            <span className="bg-linear-to-r from-info to-success bg-clip-text text-transparent">
              reimagined.
            </span>
          </h1>

          <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-invert-foreground/40 md:text-base">
            Streamline procurement, track stock across every department, and
            make smarter purchasing decisions — all from a single platform built
            for modern hotels.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button
              asChild
              size="lg"
              className="bg-invert-foreground text-invert shadow-lg shadow-invert-foreground/10 hover:bg-invert-foreground/90"
            >
              <Link href="/login">
                Get Started <ArrowRight />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="ghost"
              className="text-invert-foreground/60 hover:bg-invert-foreground/6 hover:text-invert-foreground/80"
            >
              <a href="#features">
                Explore Features <ChevronRight />
              </a>
            </Button>
          </div>

          {/* Floating preview cards */}
          <div className="relative mt-16 hidden h-60 md:block">
            {/* Card: Overview */}
            <div className="absolute left-0 top-0 w-65 rounded-2xl border border-invert-foreground/6 bg-invert-foreground/3 p-5 shadow-2xl shadow-black/20 backdrop-blur-md">
              <div className="mb-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="size-2 rounded-full bg-success" />
                  <span className="text-[11px] font-medium text-invert-foreground/60">
                    Overview
                  </span>
                </div>
                <span className="text-[10px] text-invert-foreground/25">
                  Live
                </span>
              </div>
              <div className="space-y-3">
                {[
                  {
                    label: "Total Items",
                    val: "2,847",
                    pct: 78,
                    bar: "var(--info)",
                  },
                  {
                    label: "Low Stock",
                    val: "23",
                    pct: 12,
                    bar: "var(--warning)",
                  },
                  {
                    label: "On Order",
                    val: "156",
                    pct: 52,
                    bar: "var(--success)",
                  },
                ].map((r) => (
                  <div key={r.label}>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-[11px] text-invert-foreground/35">
                        {r.label}
                      </span>
                      <span className="text-[12px] font-semibold tabular-nums text-invert-foreground/75">
                        {r.val}
                      </span>
                    </div>
                    <div className="h-1 overflow-hidden rounded-full bg-invert-foreground/6">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${r.pct}%`,
                          backgroundColor: r.bar,
                          opacity: 0.55,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Card: Activity */}
            <div className="absolute left-72.5 top-4 w-60 rounded-2xl border border-invert-foreground/6 bg-invert-foreground/3 p-5 shadow-2xl shadow-black/20 backdrop-blur-md">
              <div className="mb-3.5 flex items-center gap-2">
                <Activity className="size-3.5 text-invert-foreground/35" />
                <span className="text-[11px] font-medium text-invert-foreground/60">
                  Recent Activity
                </span>
              </div>
              <div className="space-y-2.5">
                {[
                  {
                    text: "Linens restocked",
                    detail: "+240 units",
                    time: "2m ago",
                    color: "text-success",
                  },
                  {
                    text: "Minibar updated",
                    detail: "+85 units",
                    time: "15m ago",
                    color: "text-info",
                  },
                  {
                    text: "Kitchen supplies",
                    detail: "+120 units",
                    time: "1h ago",
                    color: "text-warning",
                  },
                ].map((item) => (
                  <div key={item.text} className="flex items-start gap-2">
                    <ArrowUpRight
                      className={`mt-0.5 size-3.5 shrink-0 ${item.color}`}
                    />
                    <div>
                      <p className="text-[12px] font-medium text-invert-foreground/65">
                        {item.text}
                      </p>
                      <p className="text-[10px] text-invert-foreground/25">
                        {item.detail} &middot; {item.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Card: Quick stat */}
            <div className="absolute right-0 top-8 w-50 rounded-2xl border border-invert-foreground/6 bg-invert-foreground/3 p-5 shadow-2xl shadow-black/20 backdrop-blur-md xl:right-16">
              <p className="text-[11px] font-medium text-invert-foreground/50">
                Monthly Savings
              </p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-invert-foreground">
                ฿284k
              </p>
              <p className="mt-1 text-[11px] text-success">
                +12.5% vs last month
              </p>
              <div className="mt-3 flex items-end gap-0.75">
                {[35, 48, 40, 55, 45, 60, 52, 68, 58, 72, 65, 78].map(
                  (h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-sm"
                      style={{
                        height: `${h}%`,
                        minHeight: `${h * 0.5}px`,
                        backgroundColor:
                          i >= 10 ? "var(--info)" : "rgba(255,255,255,0.08)",
                      }}
                    />
                  ),
                )}
              </div>
            </div>
          </div>

          {/* Stats strip */}
          <div className="mt-12 flex flex-wrap items-center gap-x-10 gap-y-4 border-t border-invert-foreground/6 pt-8 md:mt-8">
            {[
              { value: "12+", label: "Departments" },
              { value: "4,200+", label: "Items Tracked" },
              { value: "99.9%", label: "Uptime" },
              { value: "< 200ms", label: "Response Time" },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-lg font-bold tabular-nums text-invert-foreground">
                  {s.value}
                </p>
                <p className="text-[11px] text-invert-foreground/30">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="bg-invert py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-lg">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-invert-foreground/40">
              Modules
            </p>
            <h2 className="mt-2 text-[clamp(24px,3.5vw,36px)] font-bold leading-tight tracking-tight text-invert-foreground">
              Everything you need to
              <br />
              run your hotel inventory
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-invert-foreground/40">
              Six integrated modules covering end-to-end hotel inventory
              operations, from procurement to reporting.
            </p>
          </div>

          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {modules.map((m) => (
              <div
                key={m.title}
                className="group rounded-2xl border border-invert-foreground/6 bg-invert-foreground/3 p-6 transition-colors hover:border-invert-foreground/10 hover:bg-invert-foreground/6"
              >
                <div
                  className={`flex size-10 items-center justify-center rounded-xl ${m.iconBg}`}
                >
                  <m.icon className={`size-5 ${m.iconColor}`} />
                </div>
                <h3 className="mt-4 text-[15px] font-semibold text-invert-foreground">
                  {m.title}
                </h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-invert-foreground/40">
                  {m.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative overflow-hidden bg-invert">
        <div className="absolute left-1/2 top-1/2 size-125 -translate-x-1/2 -translate-y-1/2 rounded-full bg-info/6 blur-[120px]" />

        <div className="relative z-10 mx-auto max-w-6xl px-6 py-20 text-center md:py-28">
          <h2 className="text-[clamp(24px,3.5vw,36px)] font-bold tracking-tight text-invert-foreground">
            Ready to get started?
          </h2>
          <p className="mt-3 text-[15px] text-invert-foreground/40">
            Sign in to your account and start managing your hotel inventory
            today.
          </p>
          <Button
            asChild
            size="lg"
            className="mt-8 bg-invert-foreground text-invert shadow-lg shadow-invert-foreground/10 hover:bg-invert-foreground/90"
          >
            <Link href="/login">
              Sign In to Carmen <ArrowRight />
            </Link>
          </Button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-invert">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <div className="flex items-center gap-2">
            <div className="flex size-6 items-center justify-center rounded-md bg-primary">
              <Hotel className="size-3 text-primary-foreground" />
            </div>
            <span className="text-xs font-semibold text-invert-foreground">
              Carmen
            </span>
          </div>
          <p className="text-[11px] text-invert-foreground/30">
            Hotel Inventory ERP Platform
          </p>
        </div>
      </footer>
    </div>
  );
}
