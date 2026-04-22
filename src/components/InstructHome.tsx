"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, BarChart2, Heart, ImageIcon, Mail, Menu, Mic, Play, Search, Sparkles, Workflow } from "lucide-react";

const featureCards = [
  {
    title: "Research & Summarize",
    copy: "Condenses a research topic into an engaging document",
    tone: "rose",
    icon: Search,
  },
  {
    title: "Generate Podcast",
    copy: "Creates a podcast episode on your chosen topic",
    tone: "sage",
    icon: Play,
  },
  {
    title: "Inbox cleaner",
    copy: "Finds marketing spam in your inbox and unsubscribes",
    tone: "sky",
    icon: Mail,
  },
  {
    title: "Meeting prep",
    copy: "Researches attendees before your next meeting",
    tone: "violet",
    icon: Workflow,
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
            <Image src="/images/instruct/dark-icon.svg" alt="Instruct" width={100} height={32} priority />
          </Link>
          <div className="instruct-nav-links">
            <Link href="#features">Features</Link>
            <Link href="/blog">Blog</Link>
          </div>
        </div>
        <button className="instruct-menu" aria-label="Open menu">
          <Menu size={22} />
        </button>
        <div className="instruct-actions">
          <Link href="https://cal.com/instruct">Talk to us</Link>
          <Link className="instruct-outline" href="/auth">Log in</Link>
          <Link className="instruct-dark" href="/auth/register">Get started</Link>
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
        <h1>AI that works for you</h1>
        <p>Automate your work across apps, just by asking.</p>
        <div className="instruct-prompt">
          <span>Delegate a task or ask a question...</span>
          <div>
            <Mic size={20} />
            <button aria-label="Submit prompt">
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
        <div className="instruct-chips" aria-label="Task categories">
          <button><Sparkles size={15} /> Featured</button>
          <button><BarChart2 size={15} /> Productivity</button>
          <button><ImageIcon size={15} /> Creative</button>
          <button><Heart size={15} /> Lifestyle</button>
        </div>
        <div id="features" className="instruct-feature-section">
          <h2>Featured</h2>
          <p>Explore what Instruct can do</p>
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
              <button aria-label="Add"><Sparkles size={18} /></button>
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

function CookieBox() {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;
  return (
    <aside className="instruct-cookie">
      <h2>Cookie Settings</h2>
      <p>We use cookies to enhance your experience, analyze site traffic and deliver personalized content. Read our Privacy Policy</p>
      <div>
        <button onClick={() => setVisible(false)}>Reject</button>
        <button onClick={() => setVisible(false)}>Accept</button>
      </div>
    </aside>
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
        <FinalCta />
      </main>
      <Footer />
      <CookieBox />
    </>
  );
}
