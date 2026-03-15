"use client";

import Link from "next/link";
import {
  FileText,
  Users,
  Zap,
  Shield,
  MessageSquare,
  BarChart3,
  ArrowRight,
  Check,
  Star,
  Layers,
  Globe,
  Lock,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white antialiased">
      {/* Navigation */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/80 backdrop-blur-xl border-b border-gray-200 shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                <Layers className="w-5 h-5 text-white" />
              </div>
              <span
                className={`text-xl font-bold tracking-tight ${
                  scrolled ? "text-gray-900" : "text-white"
                }`}
              >
                CollabPlatform
              </span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              {["Features", "How it Works", "Pricing"].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                  className={`text-sm font-medium transition-colors ${
                    scrolled
                      ? "text-gray-600 hover:text-gray-900"
                      : "text-white/80 hover:text-white"
                  }`}
                >
                  {item}
                </a>
              ))}
            </div>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <Link
                href="/login"
                className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors ${
                  scrolled
                    ? "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                    : "text-white/90 hover:text-white hover:bg-white/10"
                }`}
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40"
              >
                Get Started Free
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`md:hidden p-2 rounded-xl ${
                scrolled ? "text-gray-700" : "text-white"
              }`}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-gray-200 shadow-lg">
            <div className="px-4 py-4 space-y-3">
              {["Features", "How it Works", "Pricing"].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  {item}
                </a>
              ))}
              <div className="pt-3 border-t border-gray-100 flex flex-col gap-2">
                <Link
                  href="/login"
                  className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2.5 text-sm font-medium text-white text-center bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl"
                >
                  Get Started Free
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 pt-32 pb-20 lg:pt-44 lg:pb-32">
        {/* Background decorations */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(99,102,241,0.3),transparent_50%)]" />
        <div className="absolute top-0 left-0 right-0 h-full overflow-hidden">
          <svg
            className="absolute top-1/4 -right-20 w-[600px] h-[600px] opacity-10"
            viewBox="0 0 200 200"
          >
            <circle
              cx="100"
              cy="100"
              r="80"
              fill="none"
              stroke="white"
              strokeWidth="0.5"
            />
            <circle
              cx="100"
              cy="100"
              r="60"
              fill="none"
              stroke="white"
              strokeWidth="0.5"
            />
            <circle
              cx="100"
              cy="100"
              r="40"
              fill="none"
              stroke="white"
              strokeWidth="0.5"
            />
          </svg>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-lg rounded-full text-sm text-white/90 mb-8 border border-white/20 animate-fade-in">
              <Zap className="w-3.5 h-3.5" />
              <span>Now with real-time whiteboard collaboration</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white tracking-tight leading-[1.1] animate-slide-up">
              Collaborate on
              <br />
              <span className="bg-gradient-to-r from-white via-blue-100 to-indigo-200 bg-clip-text text-transparent">
                documents & ideas
              </span>
              <br />
              in real time
            </h1>

            <p className="mt-6 lg:mt-8 text-lg lg:text-xl text-blue-100/80 max-w-2xl mx-auto leading-relaxed animate-slide-up-delay">
              A modern workspace for teams to create, edit, and collaborate on
              documents and whiteboards together — all in one place.
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up-delay-2">
              <Link
                href="/signup"
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-blue-700 bg-white rounded-xl hover:bg-blue-50 transition-all shadow-xl shadow-black/10 hover:shadow-2xl hover:shadow-black/20 hover:-translate-y-0.5"
              >
                Start for free
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <a
                href="#how-it-works"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white border border-white/25 rounded-xl hover:bg-white/10 transition-all backdrop-blur-sm"
              >
                See how it works
              </a>
            </div>

            {/* Social proof */}
            <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-blue-100/60">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[
                    "bg-amber-400",
                    "bg-emerald-400",
                    "bg-rose-400",
                    "bg-sky-400",
                  ].map((color, i) => (
                    <div
                      key={i}
                      className={`w-8 h-8 rounded-full ${color} border-2 border-blue-700 flex items-center justify-center text-xs font-bold text-white`}
                    >
                      {["A", "S", "M", "K"][i]}
                    </div>
                  ))}
                </div>
                <span>2,000+ teams already onboard</span>
              </div>
              <div className="hidden sm:block w-px h-4 bg-blue-300/30" />
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 fill-amber-400 text-amber-400"
                  />
                ))}
                <span className="ml-1">4.9/5 average rating</span>
              </div>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="mt-16 lg:mt-20 relative max-w-5xl mx-auto animate-slide-up-delay-3">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-black/30 border border-white/10">
              <div className="bg-gradient-to-b from-gray-900 to-gray-800 p-1">
                {/* Browser chrome */}
                <div className="flex items-center gap-2 px-4 py-3 bg-gray-900 rounded-t-xl">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="px-4 py-1 bg-gray-800 rounded-lg text-xs text-gray-400 font-mono">
                      app.collabplatform.io/workspace
                    </div>
                  </div>
                </div>
                {/* App screenshot placeholder */}
                <div className="bg-gray-50 p-6 lg:p-8">
                  <div className="grid grid-cols-12 gap-4 h-64 lg:h-80">
                    {/* Sidebar */}
                    <div className="col-span-3 bg-white rounded-xl p-4 border border-gray-200 space-y-3">
                      <div className="h-3 bg-gray-200 rounded w-20" />
                      <div className="space-y-2 mt-4">
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className={`h-8 rounded-lg flex items-center gap-2 px-2 ${
                              i === 1
                                ? "bg-blue-50 border border-blue-200"
                                : "bg-gray-50"
                            }`}
                          >
                            <div
                              className={`w-4 h-4 rounded ${
                                i === 1 ? "bg-blue-400" : "bg-gray-300"
                              }`}
                            />
                            <div
                              className={`h-2 rounded w-16 ${
                                i === 1 ? "bg-blue-300" : "bg-gray-200"
                              }`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Main content */}
                    <div className="col-span-9 bg-white rounded-xl p-6 border border-gray-200">
                      <div className="h-4 bg-gray-900 rounded w-48 mb-4" />
                      <div className="space-y-2.5">
                        <div className="h-2.5 bg-gray-200 rounded w-full" />
                        <div className="h-2.5 bg-gray-200 rounded w-5/6" />
                        <div className="h-2.5 bg-gray-200 rounded w-4/6" />
                        <div className="h-2.5 bg-gray-100 rounded w-full mt-4" />
                        <div className="h-2.5 bg-gray-100 rounded w-3/4" />
                      </div>
                      {/* Cursor indicators */}
                      <div className="mt-6 flex items-center gap-3">
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 rounded text-xs text-emerald-600 font-medium border border-emerald-200">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Sarah editing
                        </div>
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-violet-50 rounded text-xs text-violet-600 font-medium border border-violet-200">
                          <div className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
                          Mike viewing
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Glow effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-purple-500/20 rounded-3xl blur-3xl -z-10" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-20">
            <p className="text-sm font-semibold text-blue-600 tracking-wide uppercase mb-3">
              Features
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight">
              Everything your team needs
            </h2>
            <p className="mt-4 text-lg text-gray-600 leading-relaxed">
              Powerful tools designed to keep your team aligned, productive, and
              creative.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                icon: FileText,
                title: "Rich Document Editor",
                description:
                  "Create beautiful documents with a block-based editor supporting rich text, embeds, and formatting.",
                color: "blue",
              },
              {
                icon: Users,
                title: "Real-time Collaboration",
                description:
                  "See teammates' cursors, edits, and presence in real time. No more conflicting changes.",
                color: "indigo",
              },
              {
                icon: Layers,
                title: "Whiteboard Canvas",
                description:
                  "Brainstorm visually with an infinite canvas. Draw, add sticky notes, and diagram together.",
                color: "violet",
              },
              {
                icon: MessageSquare,
                title: "Inline Comments",
                description:
                  "Leave contextual feedback directly on documents. Resolve threads and track discussions.",
                color: "emerald",
              },
              {
                icon: Shield,
                title: "Version History",
                description:
                  "Every change is tracked. Browse, compare, and restore any previous version instantly.",
                color: "amber",
              },
              {
                icon: BarChart3,
                title: "Analytics & Insights",
                description:
                  "Understand how your team works with engagement metrics and activity dashboards.",
                color: "rose",
              },
            ].map((feature) => {
              const colorMap: Record<string, string> = {
                blue: "bg-blue-50 text-blue-600 border-blue-100",
                indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
                violet: "bg-violet-50 text-violet-600 border-violet-100",
                emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
                amber: "bg-amber-50 text-amber-600 border-amber-100",
                rose: "bg-rose-50 text-rose-600 border-rose-100",
              };
              return (
                <div
                  key={feature.title}
                  className="group p-6 lg:p-8 rounded-2xl border border-gray-200 hover:border-gray-300 bg-white hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  <div
                    className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-5 ${colorMap[feature.color]}`}
                  >
                    <feature.icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-24 lg:py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-20">
            <p className="text-sm font-semibold text-blue-600 tracking-wide uppercase mb-3">
              How it works
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight">
              Up and running in minutes
            </h2>
            <p className="mt-4 text-lg text-gray-600 leading-relaxed">
              No complex setup. No steep learning curve. Just sign up and start
              collaborating.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {[
              {
                step: "01",
                title: "Create a workspace",
                description:
                  "Sign up and create your team workspace in seconds. Invite members via email or link.",
                icon: Globe,
              },
              {
                step: "02",
                title: "Start creating",
                description:
                  "Create documents or whiteboards. Use templates to get a head start on common formats.",
                icon: FileText,
              },
              {
                step: "03",
                title: "Collaborate live",
                description:
                  "Share with your team and edit together in real time. Comment, review, and ship faster.",
                icon: Users,
              },
            ].map((item, index) => (
              <div key={item.step} className="relative text-center">
                {/* Connector line */}
                {index < 2 && (
                  <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-px bg-gradient-to-r from-blue-300 to-transparent" />
                )}
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-white border border-gray-200 shadow-sm mb-6">
                  <item.icon className="w-10 h-10 text-blue-600" />
                </div>
                <div className="text-xs font-bold text-blue-600 tracking-widest uppercase mb-2">
                  Step {item.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600 leading-relaxed max-w-xs mx-auto">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="text-sm font-semibold text-blue-600 tracking-wide uppercase mb-3">
              Testimonials
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight">
              Loved by teams everywhere
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                quote:
                  "CollabPlatform replaced three tools for us. Docs, whiteboard, and comments — all in one place. Our team velocity has never been higher.",
                name: "Sarah Chen",
                role: "Engineering Lead, Acme Corp",
                avatar: "SC",
                avatarBg: "bg-blue-500",
              },
              {
                quote:
                  "The real-time collaboration is buttery smooth. We went from async-heavy workflows to live co-editing sessions that cut our review cycles in half.",
                name: "Marcus Rivera",
                role: "Product Manager, StartupXYZ",
                avatar: "MR",
                avatarBg: "bg-emerald-500",
              },
              {
                quote:
                  "Version history saved us multiple times. Being able to see exactly what changed and when gives us confidence to move fast without breaking things.",
                name: "Aisha Patel",
                role: "Design Director, DesignCo",
                avatar: "AP",
                avatarBg: "bg-violet-500",
              },
            ].map((testimonial) => (
              <div
                key={testimonial.name}
                className="p-6 lg:p-8 rounded-2xl bg-gray-50 border border-gray-100"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <p className="text-gray-700 leading-relaxed mb-6">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full ${testimonial.avatarBg} flex items-center justify-center text-white text-sm font-bold`}
                  >
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 lg:py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="text-sm font-semibold text-blue-600 tracking-wide uppercase mb-3">
              Pricing
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight">
              Simple, transparent pricing
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Start free. Upgrade when your team grows.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
            {[
              {
                name: "Free",
                price: "$0",
                description: "For individuals and small projects",
                features: [
                  "Up to 3 workspaces",
                  "5 documents per workspace",
                  "Basic whiteboard",
                  "7-day version history",
                  "Community support",
                ],
                cta: "Get Started",
                popular: false,
              },
              {
                name: "Pro",
                price: "$12",
                description: "For growing teams that need more",
                features: [
                  "Unlimited workspaces",
                  "Unlimited documents",
                  "Advanced whiteboard tools",
                  "30-day version history",
                  "Priority support",
                  "Analytics dashboard",
                  "Custom templates",
                ],
                cta: "Start Free Trial",
                popular: true,
              },
              {
                name: "Enterprise",
                price: "Custom",
                description: "For organizations with advanced needs",
                features: [
                  "Everything in Pro",
                  "SSO & SAML",
                  "Unlimited version history",
                  "Audit logs",
                  "Dedicated support",
                  "Custom integrations",
                  "SLA guarantee",
                ],
                cta: "Contact Sales",
                popular: false,
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`relative p-6 lg:p-8 rounded-2xl border transition-shadow ${
                  plan.popular
                    ? "bg-white border-blue-200 shadow-xl shadow-blue-600/10 ring-1 ring-blue-600/10 scale-[1.02]"
                    : "bg-white border-gray-200"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full text-xs font-semibold text-white shadow-lg">
                    Most Popular
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {plan.name}
                  </h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-gray-900">
                      {plan.price}
                    </span>
                    {plan.price !== "Custom" && (
                      <span className="text-gray-500 text-sm">/month</span>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    {plan.description}
                  </p>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-3 text-sm text-gray-700"
                    >
                      <Check className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className={`block w-full text-center py-3 px-4 rounded-xl font-medium text-sm transition-all ${
                    plan.popular
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-600/25"
                      : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 lg:py-32 overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_50%)]" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
            Ready to collaborate better?
          </h2>
          <p className="mt-4 text-lg text-blue-100/80 max-w-2xl mx-auto">
            Join thousands of teams already using CollabPlatform to create,
            collaborate, and ship faster.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-blue-700 bg-white rounded-xl hover:bg-blue-50 transition-all shadow-xl"
            >
              Get started for free
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-12 border-b border-gray-800">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                  <Layers className="w-4 h-4 text-white" />
                </div>
                <span className="text-white font-bold">CollabPlatform</span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                The modern collaboration platform for teams that move fast.
              </p>
            </div>

            {/* Links */}
            {[
              {
                title: "Product",
                links: ["Features", "Pricing", "Templates", "Integrations"],
              },
              {
                title: "Company",
                links: ["About", "Blog", "Careers", "Contact"],
              },
              {
                title: "Legal",
                links: ["Privacy", "Terms", "Security"],
              },
            ].map((group) => (
              <div key={group.title}>
                <h4 className="text-sm font-semibold text-white mb-4">
                  {group.title}
                </h4>
                <ul className="space-y-3">
                  {group.links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-sm text-gray-400 hover:text-white transition-colors"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between pt-8 gap-4">
            <p className="text-sm text-gray-500">
              &copy; 2026 CollabPlatform. All rights reserved.
            </p>
            <div className="flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-gray-500" />
              <span className="text-sm text-gray-500">
                SOC 2 Type II Certified
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* CSS Animations */}
      <style jsx global>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.6s ease-out;
        }
        .animate-slide-up-delay {
          animation: slide-up 0.6s ease-out 0.15s both;
        }
        .animate-slide-up-delay-2 {
          animation: slide-up 0.6s ease-out 0.3s both;
        }
        .animate-slide-up-delay-3 {
          animation: slide-up 0.8s ease-out 0.5s both;
        }
        html {
          scroll-behavior: smooth;
        }
      `}</style>
    </div>
  );
}
