"use client";

import Image from "next/image";
import Link from "next/link";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ArrowRight, ChartLine, Earth, FastForward, ImageIcon, Mic, Shell, Speech, HandCoins, ChartScatter } from "lucide-react";
import { useMemo, useRef } from "react";
import * as THREE from "three";

const featureCards = [
  {
    title: "Drop. Generate. Viral.",
    copy: "Turn any raw idea into a post that breaks the feed.",
    tone: "rose",
    icon: ChartScatter,
  },
  {
    title: "One Idea. Every Platform.",
    copy: "Paste once and get it shaped for Instagram, LinkedIn, and X.",
    tone: "sage",
    icon: Earth,
  },
  {
    title: "Sounds Like You",
    copy: "Your tone, your niche, your cadence. Nothing generic slips through.",
    tone: "sky",
    icon: Speech,
  },
  {
    title: "We Remember You",
    copy: "Your style system sticks, so every new draft starts miles ahead.",
    tone: "violet",
    icon: HandCoins,
  },
];

function ParticleOrb() {
  const groupRef = useRef<THREE.Group>(null);
  const pointsRef = useRef<THREE.Points>(null);
  const { mouse } = useThree();

  const particles = useMemo(() => {
    const count = 1800;
    const positions = new Float32Array(count * 3);

    for (let index = 0; index < count; index += 1) {
      const radius = 0.88 + Math.random() * 0.22;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[index * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[index * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[index * 3 + 2] = radius * Math.cos(phi);
    }

    return positions;
  }, []);

  useFrame((state) => {
    const group = groupRef.current;
    const points = pointsRef.current;

    if (!group || !points) {
      return;
    }

    const elapsed = state.clock.elapsedTime;
    const targetX = mouse.y * 0.12;
    const targetY = mouse.x * 0.18;

    group.position.y = Math.sin(elapsed * 0.7) * 0.08;
    group.rotation.x = THREE.MathUtils.lerp(group.rotation.x, targetX, 0.045);
    group.rotation.y = THREE.MathUtils.lerp(group.rotation.y, targetY, 0.045);

    points.rotation.y += 0.0014;
    points.rotation.z = Math.sin(elapsed * 0.35) * 0.08;
  });

  return (
    <group ref={groupRef}>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            array={particles}
            count={particles.length / 3}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          color="#bcc9c0"
          depthWrite={false}
          opacity={0.68}
          size={0.016}
          sizeAttenuation
          transparent
        />
      </points>
    </group>
  );
}

function OrbScene() {
  return (
    <div className="relative h-[160px] w-[160px] md:h-[190px] md:w-[190px]">
      <div className="absolute inset-6 rounded-full bg-[radial-gradient(circle,_rgba(216,233,224,0.85)_0%,_rgba(248,248,246,0)_72%)] blur-2xl" />
      <div className="absolute inset-10 rounded-full border border-white/60 bg-white/30 blur-xl" />
      <Canvas camera={{ fov: 42, position: [0, 0, 3.3] }} dpr={[1, 1.8]}>
        <ambientLight intensity={1.2} />
        <ParticleOrb />
      </Canvas>
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#f7f7f4]">
      <div className="absolute inset-x-0 top-0 h-[380px] bg-[radial-gradient(circle_at_top,_rgba(224,239,229,0.95)_0%,_rgba(247,247,244,0)_68%)] opacity-90" />
      <div className="absolute left-1/2 top-24 h-56 w-56 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,_rgba(215,229,220,0.78)_0%,_rgba(247,247,244,0)_72%)] blur-3xl" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col items-center px-6 pb-20 pt-28 text-center md:px-10 md:pb-24 md:pt-36">
        <div className="mb-8 md:mb-10">
          <OrbScene />
        </div>

        <h1
          className="max-w-4xl text-[3rem] leading-[0.98] tracking-[-0.05em] text-[#454b4c] md:text-[5.5rem]"
          style={{ fontFamily: "var(--font-editorial), serif", fontWeight: 500 }}
        >
          Every viral post starts here
        </h1>

        <p className="mt-5 max-w-2xl text-balance text-lg text-[#727a7a] md:text-[1.65rem]">
          Where viral posts are written
        </p>

        <div className="mt-12 w-full max-w-4xl rounded-[32px] border border-white/80 bg-white/88 p-4 shadow-[0_18px_60px_rgba(51,62,56,0.08)] backdrop-blur-xl md:p-5">
          <div className="flex items-center gap-3 rounded-[24px] bg-[#fcfcfa] px-4 py-3 md:px-5 md:py-4">
            <Mic className="hidden text-[#a1a9a5] md:block" size={20} />
            <input
              type="text"
              placeholder="Where viral posts are written."
              className="w-full bg-transparent text-lg text-[#697172] outline-none placeholder:text-[#a6aeab] md:text-2xl"
            />
            <button
              aria-label="Submit prompt"
              className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#edf1ee] text-[#656d6d] transition duration-300 hover:scale-[1.03] hover:bg-[#e4ebe6]"
            >
              <ArrowRight size={20} />
            </button>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button className="inline-flex items-center gap-2 rounded-full border border-[#dfe5e1] bg-white/75 px-5 py-2.5 text-sm font-medium text-[#50595a] shadow-[0_4px_18px_rgba(48,56,52,0.04)]">
            <ChartLine size={15} />
            Viral
          </button>
          <button className="inline-flex items-center gap-2 rounded-full border border-[#e4e8e5] bg-white/70 px-5 py-2.5 text-sm font-medium text-[#5b6364]">
            <Shell size={15} />
            Bold
          </button>
          <button className="inline-flex items-center gap-2 rounded-full border border-[#e4e8e5] bg-white/70 px-5 py-2.5 text-sm font-medium text-[#5b6364]">
            <ImageIcon size={15} />
            Creative
          </button>
          <button className="inline-flex items-center gap-2 rounded-full border border-[#e4e8e5] bg-white/70 px-5 py-2.5 text-sm font-medium text-[#5b6364]">
            <FastForward size={15} />
            Instant
          </button>
        </div>
      </div>
    </section>
  );
}

function FeatureSection() {
  return (
    <section className="bg-[#f7f7f4] px-6 pb-24 md:px-10">
      <div className="mx-auto max-w-6xl rounded-[40px] border border-white/70 bg-white/72 p-8 shadow-[0_20px_80px_rgba(48,56,52,0.06)] backdrop-blur-xl md:p-10">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm uppercase tracking-[0.24em] text-[#8d9792]">Featured</p>
          <h2
            className="mt-4 text-4xl leading-tight tracking-[-0.04em] text-[#444a4b] md:text-5xl"
            style={{ fontFamily: "var(--font-editorial), serif", fontWeight: 500 }}
          >
            Quietly powerful tools for louder ideas
          </h2>
          <p className="mt-4 text-base leading-7 text-[#6f7778] md:text-lg">
            A minimal workflow up front, with enough depth underneath to keep the writing sharp.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {featureCards.map((card) => {
            const Icon = card.icon;

            return (
              <article
                className={`instruct-feature-card is-${card.tone} min-h-[180px] rounded-[28px] border border-[rgba(20,24,28,0.06)] bg-white/88 p-7`}
                key={card.title}
              >
                <div className="relative z-10 max-w-[270px]">
                  <h3 className="text-[1.4rem] font-medium tracking-[-0.03em] text-[#2f3638]">
                    {card.title}
                  </h3>
                  <p className="mt-3 text-[0.98rem] leading-7 text-[#697274]">{card.copy}</p>
                </div>
                <div className="instruct-card-visual">
                  <Icon size={24} />
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="bg-[#f7f7f4] px-6 pb-24 pt-6 md:px-10">
      <div className="mx-auto flex min-h-[320px] max-w-6xl flex-col items-center justify-center rounded-[40px] bg-[#eef2ee] px-8 text-center shadow-[0_20px_80px_rgba(48,56,52,0.07)]">
        <h2
          className="max-w-3xl text-4xl leading-tight tracking-[-0.04em] text-[#404748] md:text-5xl"
          style={{ fontFamily: "var(--font-editorial), serif", fontWeight: 500 }}
        >
          The words behind every viral post
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-7 text-[#6f7778] md:text-lg">
          Great ideas deserve great words. We make it bold, magnetic, and impossible to miss.
        </p>
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
          <p>(c) 2026 Instruct Technologies Inc.</p>
        </div>
        <div className="instruct-socials">
          <Link href="https://x.com/InstructHQ">
            <Image src="/images/instruct/social-twitter.svg" alt="X" width={24} height={24} />
          </Link>
          <Link href="https://www.linkedin.com/company/instructhq/posts">
            <Image src="/images/instruct/social-linkedin.svg" alt="LinkedIn" width={24} height={24} />
          </Link>
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
      <main className="instruct-page">
        <Hero />
        <FeatureSection />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
