"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Aerospace3DCanvas } from "@/components/landing/Aerospace3DCanvas";
import { 
  Plane, 
  TrendingUp, 
  ShieldCheck, 
  Activity, 
  Database, 
  Layers, 
  ArrowRight, 
  Key, 
  BookOpen, 
  Radio, 
  Zap, 
  Cpu, 
  Compass, 
  Globe, 
  BarChart3, 
  Clock, 
  Sparkles,
  CheckCircle2
} from "lucide-react";
import Link from "next/link";

export default function HomeLandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const [activeSimRoute, setActiveSimRoute] = useState("DEL-BOM");

  useEffect(() => {
    // GSAP Hero Entrance Animations
    const ctx = gsap.context(() => {
      gsap.from(".hero-badge", {
        y: -30,
        opacity: 0,
        duration: 0.8,
        ease: "back.out(1.7)"
      });

      gsap.from(".hero-title", {
        y: 40,
        opacity: 0,
        duration: 1,
        delay: 0.2,
        ease: "power3.out"
      });

      gsap.from(".hero-subtitle", {
        y: 30,
        opacity: 0,
        duration: 1,
        delay: 0.4,
        ease: "power3.out"
      });

      gsap.from(".hero-cta", {
        scale: 0.9,
        opacity: 0,
        duration: 0.8,
        delay: 0.6,
        stagger: 0.15,
        ease: "back.out(1.4)"
      });

      gsap.from(".feature-card", {
        y: 50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.12,
        delay: 0.8,
        ease: "power2.out"
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={heroRef} className="min-h-screen bg-[#00121e] text-white font-sans overflow-x-hidden selection:bg-cyan-400 selection:text-[#00121e]">
      
      {/* Background Cyber Grid & Aerospace Nebula Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[140px] animate-pulse"></div>
        <div className="absolute top-1/3 right-10 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[140px]"></div>
        <div className="absolute bottom-10 left-1/3 w-[700px] h-[700px] bg-purple-600/10 rounded-full blur-[160px]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(#143159_1px,transparent_1px)] [background-size:32px_32px] opacity-25"></div>
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 max-w-[1600px] mx-auto px-6 lg:px-12 py-10 space-y-20">

        {/* --- SECTION 1: HERO & 3D AEROSPACE VISUALIZER --- */}
        <section className="space-y-10 pt-4">
          
          {/* Top Aerospace Headline */}
          <div className="text-center max-w-4xl mx-auto space-y-6">
            
            {/* Status Pill Badge */}
            <div className="hero-badge inline-flex items-center gap-2.5 px-4 py-2 rounded-full glass-panel border border-cyan-500/40 bg-cyan-950/40 font-mono text-xs text-cyan-300 shadow-[0_0_20px_rgba(0,243,255,0.2)]">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-bold tracking-wider uppercase">APIx ENGINE v2026 • REALTIME FLIGHT CPI</span>
              <span className="bg-cyan-500/20 text-cyan-200 px-2 py-0.5 rounded text-[10px]">DGCA & RBI WEIGHTED</span>
            </div>

            {/* Main Title */}
            <h1 className="hero-title text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight font-display leading-[1.1] bg-gradient-to-r from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent">
              National Airfare Price Index & 3D Telemetry Platform
            </h1>

            {/* Subtitle */}
            <p className="hero-subtitle text-base sm:text-xl text-slate-300 font-normal leading-relaxed max-w-3xl mx-auto">
              High-frequency CPI-style airfare intelligence engine processing intraday seat pricing across 5 major Indian carriers, 6 core flight corridors, and advance booking lead times with 2-pass IQR outlier calibration.
            </p>

            {/* Action Buttons */}
            <div className="hero-cta flex flex-wrap items-center justify-center gap-4 pt-2 font-mono">
              <Link
                href="/login"
                className="group relative px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-cyan-400 text-[#00121e] font-extrabold text-sm tracking-wider shadow-[0_0_30px_rgba(0,243,255,0.4)] hover:shadow-[0_0_45px_rgba(0,243,255,0.7)] hover:scale-105 transition-all duration-300 flex items-center gap-3"
              >
                <ShieldCheck className="w-5 h-5 text-[#00121e] group-hover:rotate-12 transition-transform" />
                <span>LAUNCH ANALYTICAL TERMINAL</span>
                <ArrowRight className="w-4 h-4 text-[#00121e] group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/dashboard"
                className="px-7 py-4 rounded-2xl glass-panel border border-cyan-500/40 text-cyan-300 hover:text-white hover:bg-cyan-500/10 font-bold text-sm tracking-wider transition-all flex items-center gap-2.5"
              >
                <Compass className="w-5 h-5 text-cyan-400" />
                <span>EXPLORE LIVE INDEX</span>
              </Link>
            </div>
          </div>

          {/* 3D Aeronautical WebGL GSAP Engine Canvas */}
          <div className="w-full">
            <Aerospace3DCanvas />
          </div>
        </section>

        {/* --- SECTION 2: GSAP ANIMATED STATS BAR --- */}
        <section ref={statsRef} className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
          {[
            { label: "TELEMETRY FARES ANALYZED", value: "2.4M+", icon: Database, color: "from-cyan-500 to-blue-500", badge: "24H CONTINUOUS" },
            { label: "OUTLIER CLEANSE ACCURACY", value: "99.8%", icon: ShieldCheck, color: "from-emerald-400 to-teal-600", badge: "2-PASS IQR" },
            { label: "LEAD-TIME BASKETS", value: "T+1 vs T+15", icon: Clock, color: "from-purple-500 to-indigo-600", badge: "DYNAMIC" },
            { label: "INTRADAY UPDATE FREQ", value: "15 Seconds", icon: Activity, color: "from-amber-400 to-orange-500", badge: "REALTIME SCRAPE" },
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className="feature-card p-6 rounded-2xl glass-panel border border-[rgba(135,214,235,0.25)] hover:border-cyan-400/60 bg-gradient-to-b from-[#001d2d]/80 to-[#00121e]/90 transition-all duration-300 hover:-translate-y-1 shadow-lg group"
              >
                <div className="flex items-center justify-between mb-3 font-mono">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${stat.color} flex items-center justify-center text-white shadow-lg`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-mono">
                    {stat.badge}
                  </span>
                </div>
                <div className="text-3xl font-extrabold text-white tracking-tight font-display group-hover:text-cyan-300 transition-colors">
                  {stat.value}
                </div>
                <div className="text-xs text-slate-400 font-mono font-medium mt-1">
                  {stat.label}
                </div>
              </div>
            );
          })}
        </section>

        {/* --- SECTION 3: CORE AEROSPACE CAPABILITIES MATRIX --- */}
        <section ref={featuresRef} className="space-y-12">
          
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-xs font-mono font-bold uppercase">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>KEY PLATFORM CAPABILITIES</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-display">
              Engineered for Macroeconomic Airfare CPI Precision
            </h2>
            <p className="text-sm text-slate-400 font-sans">
              Combining automated seat pricing scrapers with aeronautical telemetry and statistical CPI weighting algorithms.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Feature 1 */}
            <div className="feature-card p-8 rounded-3xl glass-panel border border-[#143159] hover:border-cyan-400/50 bg-[#001929]/80 space-y-4 hover:shadow-[0_0_30px_rgba(0,243,255,0.15)] transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300 group-hover:scale-110 transition-transform">
                <Radio className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white font-display group-hover:text-cyan-300 transition-colors">
                High-Frequency Scraper Engine
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Automated multi-carrier scraping bots continuously query IndiGo, Air India, Vistara, Akasa, and SpiceJet across 6 major national corridors (DEL, BOM, BLR, CCU, MAA, HYD).
              </p>
              <ul className="text-xs font-mono space-y-2 text-slate-300 pt-2 border-t border-[#143159]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>15-second intraday price capture</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>T+1 to T+30 booking horizon tracking</span>
                </li>
              </ul>
            </div>

            {/* Feature 2 */}
            <div className="feature-card p-8 rounded-3xl glass-panel border border-[#143159] hover:border-emerald-400/50 bg-[#001929]/80 space-y-4 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)] transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white font-display group-hover:text-emerald-300 transition-colors">
                2-Pass IQR Outlier Calibration
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Eliminates artificial price spikes caused by web scraper blockades, last-minute seat holds, and promo code anomalies using double Interquartile Range statistical filtering.
              </p>
              <ul className="text-xs font-mono space-y-2 text-slate-300 pt-2 border-t border-[#143159]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>IQR factor 1.5x boundary cutoff</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Log-normal distribution smooth</span>
                </li>
              </ul>
            </div>

            {/* Feature 3 */}
            <div className="feature-card p-8 rounded-3xl glass-panel border border-[#143159] hover:border-purple-400/50 bg-[#001929]/80 space-y-4 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)] transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300 group-hover:scale-110 transition-transform">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white font-display group-hover:text-purple-300 transition-colors">
                3D Aeronautical Telemetry CFD
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Visualizes active flight vectors, aircraft seating layout capacities, fuel burn rate correlations, and real-time flight position stream in WebGL 3D.
              </p>
              <ul className="text-xs font-mono space-y-2 text-slate-300 pt-2 border-t border-[#143159]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                  <span>Live vector position stream</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                  <span>Aerodynamic thrust & load factor</span>
                </li>
              </ul>
            </div>

            {/* Feature 4 */}
            <div className="feature-card p-8 rounded-3xl glass-panel border border-[#143159] hover:border-amber-400/50 bg-[#001929]/80 space-y-4 hover:shadow-[0_0_30px_rgba(245,158,11,0.15)] transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white font-display group-hover:text-amber-300 transition-colors">
                Lead-Time Booking Elasticity
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Decomposes airfare volatility into T+1 (emergency/last-minute travel) and T+15 (planned advance travel) to accurately reflect true consumer price basket behavior.
              </p>
              <ul className="text-xs font-mono space-y-2 text-slate-300 pt-2 border-t border-[#143159]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>T+1 vs T+15 price spread ratio</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Elasticity index curves</span>
                </li>
              </ul>
            </div>

            {/* Feature 5 */}
            <div className="feature-card p-8 rounded-3xl glass-panel border border-[#143159] hover:border-blue-400/50 bg-[#001929]/80 space-y-4 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300 group-hover:scale-110 transition-transform">
                <Key className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white font-display group-hover:text-blue-300 transition-colors">
                Institutional RBI & NSO API
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Provides secure API tokens, real-time webhooks, and automated CSV/JSON exports tailored for Reserve Bank of India analysts and MoSPI CPI statisticians.
              </p>
              <ul className="text-xs font-mono space-y-2 text-slate-300 pt-2 border-t border-[#143159]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                  <span>REST API v1.4 endpoint access</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                  <span>Rate limits & audit trails</span>
                </li>
              </ul>
            </div>

            {/* Feature 6 */}
            <div className="feature-card p-8 rounded-3xl glass-panel border border-[#143159] hover:border-rose-400/50 bg-[#001929]/80 space-y-4 hover:shadow-[0_0_30px_rgba(244,63,94,0.15)] transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-400/30 flex items-center justify-center text-rose-300 group-hover:scale-110 transition-transform">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white font-display group-hover:text-rose-300 transition-colors">
                Regional India Fare Heatmap
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Interactive spatial choropleth mapping average flight prices across Northern, Western, Southern, and Eastern airport hubs with real-time anomaly flags.
              </p>
              <ul className="text-xs font-mono space-y-2 text-slate-300 pt-2 border-t border-[#143159]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-rose-400" />
                  <span>Regional hub price indexes</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-rose-400" />
                  <span>Monsoon & holiday spike alerts</span>
                </li>
              </ul>
            </div>

          </div>
        </section>

        {/* --- SECTION 4: INTERACTIVE INDEX SIMULATOR PREVIEW --- */}
        <section className="p-8 md:p-12 rounded-3xl glass-panel border border-[rgba(135,214,235,0.3)] bg-gradient-to-br from-[#001d2d] via-[#001524] to-[#000d18] space-y-8 shadow-2xl">
          
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold uppercase">
                <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
                <span>INTERACTIVE FARE BASKET DEMO</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
                Real-Time Route Basket Telemetry
              </h3>
              <p className="text-xs text-slate-400">
                Select a flight corridor below to preview live index weights, carrier share breakdown, and intraday price ranges.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
              {["DEL-BOM", "BLR-DEL", "CCU-BOM", "MAA-DEL"].map((r) => (
                <button
                  key={r}
                  onClick={() => setActiveSimRoute(r)}
                  className={`px-4 py-2 rounded-xl font-bold transition-all border ${
                    activeSimRoute === r
                      ? "bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-md shadow-cyan-500/20"
                      : "bg-[#071529] text-slate-400 border-[#143159] hover:text-white"
                  }`}
                >
                  {r} CORRIDOR
                </button>
              ))}
            </div>
          </div>

          {/* Simulator Visual Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 rounded-2xl bg-[#041121] border border-[#143159] font-mono text-xs">
            <div className="space-y-2">
              <span className="text-slate-400">INDEX WEIGHT (DGCA TRAFFIC)</span>
              <div className="text-2xl font-bold text-cyan-400 font-display">28.4% SHARE</div>
              <p className="text-[11px] text-slate-500">Highest volume trunk route in India aviation network</p>
            </div>

            <div className="space-y-2">
              <span className="text-slate-400">CURRENT INTRADAY FARE (AVG)</span>
              <div className="text-2xl font-bold text-emerald-400 font-display">₹4,850 – ₹14,200</div>
              <p className="text-[11px] text-slate-500">Intraday dynamic swing range across 5 carriers</p>
            </div>

            <div className="space-y-2">
              <span className="text-slate-400">T+1 vs T+15 SPREAD</span>
              <div className="text-2xl font-bold text-purple-400 font-display">+184% SURGE</div>
              <p className="text-[11px] text-slate-500">Emergency travel premium vs advance booking</p>
            </div>
          </div>

        </section>

        {/* --- SECTION 5: CALL TO ACTION FOOTER BANNER --- */}
        <section className="relative p-10 sm:p-16 rounded-3xl glass-panel border border-[rgba(135,214,235,0.4)] bg-gradient-to-r from-cyan-950/60 via-[#002636] to-blue-950/60 text-center space-y-8 overflow-hidden shadow-[0_0_60px_rgba(0,180,255,0.2)]">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-400/10 rounded-full blur-[100px] pointer-events-none"></div>

          <div className="max-w-2xl mx-auto space-y-4 relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 mx-auto flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <Plane className="w-8 h-8 text-white" />
            </div>

            <h2 className="text-3xl sm:text-5xl font-extrabold text-white font-display tracking-tight">
              Ready to Access Realtime CPI Airfare Telemetry?
            </h2>

            <p className="text-sm text-slate-300 font-sans">
              Authenticate with your RBI, NSO, or institutional analyst credentials to access interactive charts, data exporter, raw scraper logs, and REST API access.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4 font-mono text-xs">
              <Link
                href="/login"
                className="px-8 py-4 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-[#00121e] font-extrabold text-sm tracking-wider shadow-lg shadow-cyan-400/30 transition-all flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>SIGN IN TO INSTITUTIONAL PORTAL</span>
              </Link>
            </div>

            <p className="text-[11px] text-cyan-400/80 font-mono pt-2">
              Demo Analyst Credentials: <span className="text-white font-bold">admin@apix.gov.in</span>
            </p>
          </div>
        </section>

      </div>

      {/* --- FOOTER --- */}
      <footer className="w-full border-t border-[#143159] bg-[#000a12] py-8 text-xs font-mono text-slate-400">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold">
              A
            </div>
            <span className="text-white font-bold font-display">APIx INDIA AIRFARE INDEX</span>
            <span className="text-slate-600">•</span>
            <span>SIH 2026 OFFICIAL ENTRY</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/methodology" className="hover:text-cyan-400 transition-colors">
              METHODOLOGY
            </Link>
            <Link href="/api-access" className="hover:text-cyan-400 transition-colors">
              REST API
            </Link>
            <Link href="/telemetry-3d" className="hover:text-cyan-400 transition-colors">
              3D CFD
            </Link>
            <Link href="/login" className="text-cyan-400 hover:text-cyan-300 font-bold">
              ANALYST LOGIN
            </Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
