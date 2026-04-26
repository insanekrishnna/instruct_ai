"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, ChartLine, Shell, ImageIcon, Mail, Menu, Mic, Play, Search, FastForward, Workflow, Blend, ChartScatter, Speech, HandHeart, HandCoins, Earth } from "lucide-react";

const featureCards = [
  {
    title: "Drop. Generate. Go Viral.",
    copy: "Turn any raw idea into a post that breaks the feed",
    tone: "rose",
    icon: ChartScatter,
  },
  {
    title: "One Idea. Every Platform.",
    copy: "Paste once, Get written for Instagram, LinkedIn, Twitter",
    tone: "sage",
    icon: Earth,
  },
  {
    title: "Sounds Like You ",
    copy: "Your tone, your niche -- every post feels like you wrote it yourself",
    tone: "sky",
    icon: Speech,
  },
  {
    title: "We Remember You",
    copy: "Your niche, your tone, your style -- set once, applied forever",
    tone: "violet",
    icon: HandCoins,
  },
];

const taskCards = [
  {
    label: "Education",
    copy: "Read the lecture notes in this week's Drive folder. Generate a 10-question revision quiz based on the key themes and email it to me.",
  },
  {
    label: "Recruiting",
    copy: "Go through the last 50 inbound applications in Ashby. Filter for candidates with 4+ years of Python experience and add them to the Phone Screen shortlist.",
  },
  {
    label: "Sales",
    copy: "Monitor HubSpot for leads that haven't replied in a week and draft a concise follow-up using the last call notes.",
  },
];

function Header() {
  return (
    <nav className="instruct-header-wrap">
      <header className="instruct-header">
        <div className="instruct-nav-left">
          <Link href="/" aria-label="Instruct home" className="instruct-logo-link">
            <Image src="/images/instruct/avtar.png" alt="Instruct" width={30} height={30} priority />
          </Link>
          <div className="instruct-nav-links">
           
          </div>
        </div>
        <button className="instruct-menu" aria-label="Open menu">
          <Menu size={22} />
        </button>
        <div className="instruct-actions">
          
          <Link className="instruct-outline" href="/auth">Log in</Link>
          <Link className="instruct-dark" href="/auth/register">Sign up <ArrowRight size={16} /></Link>
        </div>
      </header>
    </nav>
  );
}

function Hero() {
  return (
    <section className="instruct-hero">
      <div className="instruct-hero-bg">
        <Image src="/images/instruct/background-main.webp" alt="" width={2048} height={598} priority />
      </div>
      <div className="instruct-hero-content">
        <Link href="/auth/register" className="instruct-free-pill">
          Get started for free <ArrowRight size={16} />
        </Link>
        <h1>Every viral post starts here</h1>
        <p>Where viral posts are written</p>
        <div className="instruct-prompt">
          <span>Where viral posts are written.</span>
          <div>
            <Mic size={20} />
            <button aria-label="Submit prompt">
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
        <div className="instruct-chips" aria-label="Task categories">
          <button><ChartLine size={15} /> Viral</button>
          <button><Shell size={15} /> Bold</button>
          <button><ImageIcon size={15} /> Creative</button>
          <button><FastForward size={15} /> Instant</button>
        </div>
        <div id="features" className="instruct-feature-section">
          <h2>Featured</h2>
          <p>Explore what Capmax can do</p>
          <div className="instruct-feature-grid">
            {featureCards.map((card) => {
              const Icon = card.icon;
              return (
                <article className={`instruct-feature-card is-${card.tone}`} key={card.title}>
                  <div>
                    <h3>{card.title}</h3>
                    <p>{card.copy}</p>
                  </div>
                  <div className="instruct-card-visual">
                    <Icon size={24} />
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
      <a href="#meet" className="instruct-learn">Learn more</a>
    </section>
  );
}

function MeetSection() {
  return (
    <section id="meet" className="instruct-meet">
      <h2>
        <span>Hire a digital employee,</span>
        <span>Integrated everywhere.</span>
      </h2>
      <div className="instruct-task-grid">
        {taskCards.map((card) => (
          <article key={card.label} className="instruct-task-card">
            <span>{card.label}</span>
            <p>{card.copy}</p>
            <div>
              <button aria-label="Add"><ChartLine size={18} /></button>
              <button aria-label="Run"><ArrowRight size={18} /></button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="instruct-cta">
      <h2>Get started for free today.</h2>
      <p>Sign up now and start automating your work in minutes with our free plan, or get in touch with our team to discuss your needs.</p>
      <div>
        <Link className="instruct-outline" href="https://cal.com/instruct">Talk to us</Link>
        <Link className="instruct-dark" href="/auth/register">Sign up <ArrowRight size={16} /></Link>
      </div>
    </section>
  );
}

function ViralToolsSection() {
  const tools = [
    {
      name: "✨ Caption Generator",
      desc: "Create viral captions with AI. Choose your style, add images, and get instant engagement scores.",
      href: "/generate",
    },
    {
      name: "🎣 Hook Generator",
      desc: "Generate 8 proven hook formats to stop the scroll on any platform.",
      href: "/hook",
    },
    {
      name: "♻️ Content Repurposer",
      desc: "Transform long-form content into platform-optimized posts instantly.",
      href: "/repurpose",
    },
    {
      name: "🧵 Thread & Carousel",
      desc: "Create compelling Twitter threads or Instagram carousel scripts.",
      href: "/thread",
    },
  ];

  return (
    <section id="tools" className="instruct-meet">
      <h2>
        <span>Viral Content Tools,</span>
        <span>Powered by AI.</span>
      </h2>
      <p style={{ textAlign: "center", marginBottom: "2rem", color: "var(--text-secondary)", fontSize: "1.1rem" }}>
        A complete suite of AI tools for creators and content marketers
      </p>
      <div className="instruct-task-grid">
        {tools.map((tool) => (
          <Link key={tool.href} href={tool.href}>
            <article className="instruct-task-card" style={{ textDecoration: "none" }}>
              <span>{tool.name}</span>
              <p>{tool.desc}</p>
              <div>
                <button onClick={(e) => { e.preventDefault(); }} aria-label="Explore"><ArrowRight size={18} /></button>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="instruct-footer">
      <div className="instruct-footer-main">
        <div>
          <Image src="/images/instruct/icon-dark.svg" alt="Instruct logo" width={24} height={24} />
          <span>Instruct</span>
          <p>© 2026 Instruct Technologies Inc.</p>
        </div>
        <div className="instruct-socials">
          <Link href="https://x.com/InstructHQ"><Image src="/images/instruct/social-twitter.svg" alt="X" width={24} height={24} /></Link>
          <Link href="https://www.linkedin.com/company/instructhq/posts"><Image src="/images/instruct/social-linkedin.svg" alt="LinkedIn" width={24} height={24} /></Link>
        </div>
      </div>
      <div className="instruct-footer-legal">
        <Link href="https://legal.instruct.ai/eula">Terms</Link>
        <Link href="https://legal.instruct.ai/privacy">Privacy Policy</Link>
      </div>
    </footer>
  );
}

export function InstructHome() {
  return (
    <>
      <Header />
      <main className="instruct-page">
        <Hero />
        <MeetSection />
        <ViralToolsSection />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
