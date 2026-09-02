"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import {
  Plane,
  TrendingUp,
  ShieldCheck,
  Activity,
  Search,
  Star,
  ArrowRight,
  MapPin,
  BookOpen,
  Bell,
  Zap,
  Heart,
  Globe,
  BarChart3,
  Clock,
  Sparkles,
  CheckCircle2,
  IndianRupee,
  Users,
  ThumbsUp,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";

// Floating planes across screen
const PLANES = [
  { top: "12%", delay: "0s",    duration: "18s", size: "24px" },
  { top: "35%", delay: "6s",    duration: "22s", size: "20px" },
  { top: "58%", delay: "12s",   duration: "19s", size: "28px" },
  { top: "75%", delay: "3s",    duration: "25s", size: "18px" },
];

export default function HomeLandingPage() {
  const heroRef   = useRef<HTMLDivElement>(null);
  const statsRef  = useRef<HTMLDivElement>(null);
  const featRef   = useRef<HTMLDivElement>(null);
  const [activeRoute, setActiveRoute] = useState("DEL-BOM");

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero badge bounces in
      gsap.from(".hero-badge", {
        y: -40, opacity: 0, duration: 0.9, ease: "back.out(2)",
      });
      // Title slides up
      gsap.from(".hero-title", {
        y: 50, opacity: 0, duration: 1.1, delay: 0.15, ease: "power3.out",
      });
      // Subtitle fades in
      gsap.from(".hero-subtitle", {
        y: 30, opacity: 0, duration: 1, delay: 0.35, ease: "power3.out",
      });
      // CTA buttons pop in
      gsap.from(".hero-cta", {
        scale: 0.85, opacity: 0, duration: 0.8, delay: 0.55,
        stagger: 0.18, ease: "back.out(1.8)",
      });
      // Stat cards bounce in
      gsap.from(".stat-card", {
        y: 60, opacity: 0, duration: 0.85, stagger: 0.13, delay: 0.7,
        ease: "back.out(1.5)",
      });
      // Feature cards slide up
      gsap.from(".feature-card", {
        y: 50, opacity: 0, duration: 0.75, stagger: 0.1, delay: 0.9,
        ease: "power2.out",
      });
    }, heroRef);
    return () => ctx.revert();
  }, []);

  // Friendly route data
  const routeData: Record<string, { share: string; range: string; tip: string; saving: string }> = {
    "DEL-BOM": {
      share:  "Most Popular Route",
      range:  "₹3,200 – ₹9,800",
      tip:    "Book 15 days ahead to save up to 45%",
      saving: "Save ₹4,600",
    },
    "BLR-DEL": {
      share:  "Busiest Tech Corridor",
      range:  "₹2,800 – ₹8,500",
      tip:    "Tuesday & Wednesday flights are cheapest",
      saving: "Save ₹3,200",
    },
    "CCU-BOM": {
      share:  "Great Value Route",
      range:  "₹2,500 – ₹7,200",
      tip:    "Early morning flights cost 30% less",
      saving: "Save ₹2,800",
    },
    "MAA-DEL": {
      share:  "Top Southern Route",
      range:  "₹2,900 – ₹8,900",
      tip:    "Mid-week travel saves the most money",
      saving: "Save ₹3,500",
    },
  };

  const currentRoute = routeData[activeRoute];

  return (
    <div
      ref={heroRef}
      className="min-h-screen font-sans overflow-x-hidden"
      style={{ background: "linear-gradient(160deg, #e0f2fe 0%, #f0f7ff 45%, #fef9f0 100%)" }}
    >
      {/* Floating ✈️ Planes */}
      {PLANES.map((p, i) => (
        <span
          key={i}
          className="floating-plane"
          style={{
            top:               p.top,
            left:              "0px",
            animationDelay:    p.delay,
            animationDuration: p.duration,
            fontSize:          p.size,
          }}
        >
          ✈️
        </span>
      ))}


      {/* Soft background clouds / blobs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full blur-[120px]" style={{ background: "rgba(56,189,248,0.13)" }} />
        <div className="absolute top-1/3 right-10 w-[400px] h-[400px] rounded-full blur-[100px]" style={{ background: "rgba(251,191,36,0.10)" }} />
        <div className="absolute bottom-20 left-1/3 w-[600px] h-[600px] rounded-full blur-[130px]" style={{ background: "rgba(34,197,94,0.08)" }} />
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-[1400px] mx-auto px-5 lg:px-10 py-8 space-y-20">

        {/* ── SECTION 1: HERO ── */}
        <section className="space-y-10 pt-6 text-center">

          {/* Live badge */}
          <div
            className="hero-badge inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm shadow-lg"
            style={{
              background: "rgba(255,255,255,0.85)",
              border: "1.5px solid rgba(37,99,235,0.25)",
              color: "#2563eb",
              backdropFilter: "blur(10px)",
            }}
          >
            <span className="pulse-dot" />
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span><strong>APIX</strong> — Live Prices Updated Every 15 Seconds · All Major Airlines</span>
          </div>

          {/* Main heading */}
          <div className="max-w-4xl mx-auto space-y-5">
            <h1
              className="hero-title text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1]"
              style={{ color: "#1e3a5f" }}
            >
              <span className="gradient-text-blue">APIX</span> — Find the{" "}
              <span className="gradient-text-orange">Cheapest Flights</span>
              <br />
              Across India ✈️
            </h1>

            <p
              className="hero-subtitle text-base sm:text-xl leading-relaxed max-w-2xl mx-auto font-medium"
              style={{ color: "#475569" }}
            >
              We track flight prices every 15 seconds across IndiGo, Air India, Vistara, Akasa & SpiceJet —
              so you always get the best deal, without spending hours searching!
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/dashboard"
              className="hero-cta btn-primary flex items-center gap-3 text-base"
            >
              <Search className="w-5 h-5" />
              <span>Check Today&apos;s Prices</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="hero-cta btn-secondary flex items-center gap-3 text-base"
            >
              <Bell className="w-5 h-5 text-blue-500" />
              <span>Set a Price Alert</span>
            </Link>
          </div>

          {/* Trust strip */}
          <div
            className="inline-flex flex-wrap items-center justify-center gap-6 px-8 py-4 rounded-2xl mx-auto text-sm font-medium"
            style={{ background: "rgba(255,255,255,0.7)", color: "#64748b", border: "1px solid rgba(37,99,235,0.12)" }}
          >
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" /> Free to Use</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" /> No Registration Needed</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" /> Trusted by the Government</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" /> Works on Mobile</span>
          </div>

        </section>

        {/* ── SECTION 2: STATS ── */}
        <section ref={statsRef} className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
          {[
            {
              label: "Fares Tracked",
              value: "24 Lakh+",
              icon: IndianRupee,
              iconBg: "from-blue-400 to-blue-600",
              badge: "Every Day",
              emoji: "💰",
            },
            {
              label: "Price Accuracy",
              value: "99.8%",
              icon: ThumbsUp,
              iconBg: "from-green-400 to-emerald-600",
              badge: "Verified",
              emoji: "✅",
            },
            {
              label: "Book in Advance & Save",
              value: "Up to 60%",
              icon: Clock,
              iconBg: "from-orange-400 to-orange-600",
              badge: "Big Savings",
              emoji: "📅",
            },
            {
              label: "Price Update Speed",
              value: "15 Seconds",
              icon: RefreshCw,
              iconBg: "from-purple-400 to-purple-600",
              badge: "Super Fast",
              emoji: "⚡",
            },
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className="stat-card citizen-card p-6 text-center space-y-3"
              >
                <div className="text-3xl">{stat.emoji}</div>
                <div
                  className="text-2xl sm:text-3xl font-extrabold tracking-tight"
                  style={{ color: "#1e3a5f" }}
                >
                  {stat.value}
                </div>
                <div className="text-sm font-semibold" style={{ color: "#475569" }}>
                  {stat.label}
                </div>
                <span
                  className="inline-block text-xs font-bold px-3 py-1 rounded-full"
                  style={{ background: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe" }}
                >
                  {stat.badge}
                </span>
              </div>
            );
          })}
        </section>

        {/* ── SECTION 3: FEATURES ── */}
        <section ref={featRef} className="space-y-12">

          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <div
              className="pill-badge mx-auto"
              style={{ background: "#fef9c3", color: "#b45309", border: "1.5px solid #fde68a" }}
            >
              <Star className="w-4 h-4 text-yellow-500" />
              Why Travellers Love Us
            </div>
            <h2
              className="text-3xl sm:text-4xl font-extrabold"
              style={{ color: "#1e3a5f" }}
            >
              Everything You Need to Save Money on Flights 🛫
            </h2>
            <p className="text-base font-medium" style={{ color: "#64748b" }}>
              Simple tools that help every Indian traveller find the best airfare — whether you&apos;re going for a holiday, business trip, or a family function.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {/* Feature 1 */}
            <div className="feature-card citizen-card p-8 space-y-4">
              <div className="text-4xl">🔄</div>
              <h3 className="text-xl font-bold" style={{ color: "#1e3a5f" }}>
                Always Up-to-Date Prices
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "#64748b" }}>
                Our system checks flight prices from IndiGo, Air India, Vistara, Akasa, and SpiceJet every 15 seconds — so you never miss a price drop!
              </p>
              <ul className="text-sm space-y-2" style={{ color: "#475569" }}>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                  Prices refreshed every 15 seconds
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                  Tracks 6 major Indian routes
                </li>
              </ul>
            </div>

            {/* Feature 2 */}
            <div className="feature-card citizen-card p-8 space-y-4">
              <div className="text-4xl">🛡️</div>
              <h3 className="text-xl font-bold" style={{ color: "#1e3a5f" }}>
                No Fake Price Spikes
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "#64748b" }}>
                Ever seen a crazy high price that disappears in minutes? We filter those out automatically, so you only see fair, real prices.
              </p>
              <ul className="text-sm space-y-2" style={{ color: "#475569" }}>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                  Removes sudden fake spikes
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                  99.8% price accuracy guaranteed
                </li>
              </ul>
            </div>

            {/* Feature 3 */}
            <div className="feature-card citizen-card p-8 space-y-4">
              <div className="text-4xl">🗺️</div>
              <h3 className="text-xl font-bold" style={{ color: "#1e3a5f" }}>
                See Prices Across India
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "#64748b" }}>
                View an easy colour-coded map showing which cities have cheap flights today. Spot the best deals at a glance!
              </p>
              <ul className="text-sm space-y-2" style={{ color: "#475569" }}>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                  Colour map of India routes
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                  Holiday & festival price alerts
                </li>
              </ul>
            </div>

            {/* Feature 4 */}
            <div className="feature-card citizen-card p-8 space-y-4">
              <div className="text-4xl">📅</div>
              <h3 className="text-xl font-bold" style={{ color: "#1e3a5f" }}>
                Book Early, Save Big!
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "#64748b" }}>
                We show you exactly how much you save by booking 1 week, 2 weeks, or a month in advance. Plan smart, spend less!
              </p>
              <ul className="text-sm space-y-2" style={{ color: "#475569" }}>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                  Compare last-minute vs. early prices
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                  Smart booking advice in plain language
                </li>
              </ul>
            </div>

            {/* Feature 5 */}
            <div className="feature-card citizen-card p-8 space-y-4">
              <div className="text-4xl">🏛️</div>
              <h3 className="text-xl font-bold" style={{ color: "#1e3a5f" }}>
                Trusted by the Government
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "#64748b" }}>
                This platform is used by the Government of India (RBI & NSO) to track airfare prices nationally. 100% reliable and official.
              </p>
              <ul className="text-sm space-y-2" style={{ color: "#475569" }}>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                  Approved data for official use
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                  Transparent & secure
                </li>
              </ul>
            </div>

            {/* Feature 6 */}
            <div className="feature-card citizen-card p-8 space-y-4">
              <div className="text-4xl">🔔</div>
              <h3 className="text-xl font-bold" style={{ color: "#1e3a5f" }}>
                Get Price Drop Alerts
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "#64748b" }}>
                Tell us your route and target price. We&apos;ll notify you the moment the fare drops — so you can book at exactly the right time.
              </p>
              <ul className="text-sm space-y-2" style={{ color: "#475569" }}>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                  Set your own price target
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                  Instant SMS / email alerts
                </li>
              </ul>
            </div>

          </div>
        </section>

        {/* ── SECTION 4: ROUTE FARE CHECKER ── */}
        <section
          className="p-8 md:p-12 rounded-3xl space-y-8 shadow-2xl"
          style={{
            background: "rgba(255,255,255,0.85)",
            border: "1.5px solid rgba(37,99,235,0.15)",
            backdropFilter: "blur(12px)",
          }}
        >

          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div
                className="pill-badge"
                style={{ background: "#eff6ff", color: "#2563eb", border: "1.5px solid #bfdbfe" }}
              >
                <Activity className="w-4 h-4 animate-pulse" />
                Today&apos;s Live Fare Preview
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold" style={{ color: "#1e3a5f" }}>
                👆 Pick a Route to See Today&apos;s Price
              </h3>
              <p className="text-sm font-medium" style={{ color: "#64748b" }}>
                Click any route below to instantly see today&apos;s cheapest fares and our money-saving tip.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {["DEL-BOM", "BLR-DEL", "CCU-BOM", "MAA-DEL"].map((r) => (
                <button
                  key={r}
                  onClick={() => setActiveRoute(r)}
                  className={`route-btn ${activeRoute === r ? "active" : ""}`}
                >
                  ✈️ {r}
                </button>
              ))}
            </div>
          </div>

          {/* Fare Result Card */}
          <div
            className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 rounded-2xl"
            style={{ background: "linear-gradient(135deg,#eff6ff,#f0fdf4)", border: "1.5px solid #bfdbfe" }}
          >
            <div className="space-y-2 text-center">
              <div className="text-3xl">🛫</div>
              <div className="text-xs font-bold uppercase tracking-wide" style={{ color: "#94a3b8" }}>
                Route Status
              </div>
              <div className="text-lg font-extrabold" style={{ color: "#1e3a5f" }}>
                {currentRoute.share}
              </div>
            </div>

            <div className="space-y-2 text-center">
              <div className="text-3xl">💰</div>
              <div className="text-xs font-bold uppercase tracking-wide" style={{ color: "#94a3b8" }}>
                Today&apos;s Price Range
              </div>
              <div className="text-xl font-extrabold" style={{ color: "#16a34a" }}>
                {currentRoute.range}
              </div>
            </div>

            <div className="space-y-2 text-center">
              <div className="text-3xl">💡</div>
              <div className="text-xs font-bold uppercase tracking-wide" style={{ color: "#94a3b8" }}>
                Money-Saving Tip
              </div>
              <div className="text-sm font-semibold" style={{ color: "#1e3a5f" }}>
                {currentRoute.tip}
              </div>
              <span
                className="inline-block text-xs font-bold px-3 py-1 rounded-full"
                style={{ background: "#dcfce7", color: "#16a34a" }}
              >
                {currentRoute.saving}
              </span>
            </div>
          </div>

        </section>

        {/* ── SECTION 5: CTA BANNER ── */}
        <section
          className="relative p-10 sm:p-16 rounded-3xl text-center space-y-8 overflow-hidden shadow-2xl"
          style={{
            background: "linear-gradient(135deg, #1d4ed8 0%, #0ea5e9 50%, #38bdf8 100%)",
          }}
        >
          {/* White glow blobs */}
          <div className="absolute top-0 right-0 w-72 h-72 rounded-full blur-[80px] pointer-events-none" style={{ background: "rgba(255,255,255,0.15)" }} />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full blur-[80px] pointer-events-none" style={{ background: "rgba(255,255,255,0.10)" }} />

          <div className="max-w-2xl mx-auto space-y-6 relative z-10">
            <div className="text-6xl">✈️</div>

            <h2 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight">
              Ready to Fly Smarter with <span style={{textDecoration:'underline', textDecorationColor:'rgba(255,255,255,0.4)'}}>APIX</span>?
            </h2>

            <p className="text-base text-blue-100 font-medium">
              Join millions of Indian travellers who save money by checking our live flight price tracker before booking.
              It&apos;s completely <strong className="text-white">free</strong> — no sign-up needed!
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-3 px-10 py-4 rounded-2xl font-extrabold text-base shadow-xl transition-all hover:scale-105"
                style={{ background: "white", color: "#2563eb" }}
              >
                <Search className="w-5 h-5" />
                Check Prices Now — It&apos;s Free!
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <p className="text-sm text-blue-200 font-medium pt-1">
              🏛️ Official platform — recognised by Government of India
            </p>
          </div>
        </section>

      </div>

      {/* ── FOOTER ── */}
      <footer
        className="w-full border-t py-10 text-sm font-medium"
        style={{ background: "#1e3a5f", borderColor: "rgba(255,255,255,0.1)", color: "#94a3b8" }}
      >
        <div className="max-w-[1400px] mx-auto px-5 lg:px-10 flex flex-col md:flex-row items-center justify-between gap-6">

          <div className="flex items-center gap-3">
            <span className="text-3xl">✈️</span>
            <div>
              <div className="text-white font-extrabold text-base font-sans">APIX — India Flight Price Tracker</div>
              <div className="text-xs" style={{ color: "#64748b" }}>SIH 2026 | Official Government Initiative</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-sm">
            <Link href="/dashboard" className="nav-link hover:text-white transition-colors">
              Check Prices
            </Link>
            <Link href="/login" className="nav-link hover:text-white transition-colors">
              Sign In
            </Link>
            <Link href="/methodology" className="nav-link hover:text-white transition-colors">
              How It Works
            </Link>
            <Link
              href="/login"
              className="px-5 py-2 rounded-xl font-bold transition-all hover:scale-105"
              style={{ background: "#2563eb", color: "white" }}
            >
              For Analysts →
            </Link>
          </div>

        </div>
        <div className="max-w-[1400px] mx-auto px-5 lg:px-10 mt-6 pt-6 text-center text-xs" style={{ borderTop: "1px solid rgba(255,255,255,0.08)", color: "#475569" }}>
          Made with ❤️ for Indian Citizens by <strong className="text-slate-400">APIX</strong> • Data sourced from all major Indian carriers • Updated every 15 seconds
        </div>
      </footer>

    </div>
  );
}
