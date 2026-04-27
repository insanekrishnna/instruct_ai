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
  const coreRef = useRef<THREE.Points>(null);
  const haloRef = useRef<THREE.Points>(null);
  const { mouse } = useThree();

  const coreParticles = useMemo(() => {
    const count = 2200;
    const positions = new Float32Array(count * 3);

    for (let index = 0; index < count; index += 1) {
      const radius = 0.78 + Math.random() * 0.26;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[index * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[index * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[index * 3 + 2] = radius * Math.cos(phi);
    }

    return positions;
  }, []);

  const haloParticles = useMemo(() => {
    const count = 1200;
    const positions = new Float32Array(count * 3);

    for (let index = 0; index < count; index += 1) {
      const radius = 1.02 + Math.random() * 0.18;
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
    const core = coreRef.current;
    const halo = haloRef.current;

    if (!group || !core || !halo) {
      return;
    }

    const elapsed = state.clock.elapsedTime;
    const targetX = mouse.y * 0.16;
    const targetY = mouse.x * 0.22;

    group.position.y = Math.sin(elapsed * 0.75) * 0.09;
    group.rotation.x = THREE.MathUtils.lerp(group.rotation.x, targetX, 0.04);
    group.rotation.y = THREE.MathUtils.lerp(group.rotation.y, targetY, 0.04);

    core.rotation.y += 0.0012;
    core.rotation.z = Math.sin(elapsed * 0.26) * 0.1;
    halo.rotation.y -= 0.0007;
    halo.rotation.x = Math.cos(elapsed * 0.22) * 0.08;
  });

  return (
    <group ref={groupRef}>
      <points ref={haloRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            array={haloParticles}
            count={haloParticles.length / 3}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          color="#000000"
          depthWrite={false}
          opacity={0.20}
          size={0.015}
          sizeAttenuation
          transparent
        />
      </points>
      <points ref={coreRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            array={coreParticles}
            count={coreParticles.length / 3}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          color="#000000"
          depthWrite={false}
          opacity={0.72}
          size={0.030}
          sizeAttenuation
          transparent
        />
      </points>
    </group>
  );
}

function OrbScene() {
  return (
    <div className="relative h-[140px] w-[140px] md:h-[176px] md:w-[176px]">
      <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,_rgba(208,223,216,0.6)_0%,_rgba(247,247,244,0)_63%)] blur-3xl" />
      <div className="absolute inset-[20%] rounded-full border border-white/50 bg-white/[0.12] blur-2xl" />
      <div className="absolute inset-[30%] rounded-full bg-[radial-gradient(circle,_rgba(229,236,233,0.3)_0%,_rgba(247,247,244,0)_72%)] blur-xl" />
      <Canvas camera={{ fov: 40, position: [0, 0, 3.7] }} dpr={[1, 2]}>
        <ambientLight intensity={1.3} />
        <ParticleOrb />
      </Canvas>
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#f7f7f4]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(232,242,236,0.95)_0%,_rgba(247,247,244,0.82)_34%,_rgba(247,247,244,1)_62%)]" />
      <div className="absolute inset-x-0 top-0 h-[30rem] bg-[radial-gradient(ellipse_at_top,_rgba(218,236,227,0.85)_0%,_rgba(236,244,240,0.54)_34%,_rgba(247,247,244,0)_74%)] blur-2xl" />
      <div className="absolute left-1/2 top-0 h-[25rem] w-[72rem] -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,_rgba(220,239,230,0.45)_0%,_rgba(247,247,244,0)_68%)] opacity-90 blur-3xl" />
      <div className="absolute inset-x-0 top-0 h-[21rem] opacity-[0.22] [background-image:radial-gradient(rgba(13, 13, 13, 0.22)_1px,transparent_1px)] [background-size:12px_12px] [mask-image:linear-gradient(to_bottom,black,transparent_88%)]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col items-center px-6 pb-18 pt-14 text-center md:px-10 md:pb-20 md:pt-16">
        <div className="mb-2 md:mb-3">
          <OrbScene />
        </div>

        <h1
          className="max-w-[20ch] text-[2rem] leading-[0.96] tracking-[-0.045em] text-[#000000] md:text-[5.15rem]"
          style={{
            fontFamily: "var(--font-editorial), serif",
            fontWeight: 550,
            textShadow: "0 1px 0 rgba(0, 0, 0, 0.72)",
          }}
        >
          Every viral post starts here
        </h1>

        <p className="mt-3 max-w-xl text-balance text-[0.8rem] font leading-none text-[#657985] md:text-[1.65rem]">
          Where viral posts are written
        </p>

        <div className="mt-7 w-full max-w-[52rem] rounded-[2rem] border border-white/100 bg-white/88 p shadow-[0_26px_80px_rgba(68,80,55,0.01),0_2px_0_rgba(255,255,255,0.9)_inset] backdrop-blur-2xl md:mt-10 md:rounded-[2.2rem]">
          <div className="relative min-h-[8.2rem] rounded-[1.7rem] bg-white/[0.72] px-6 pb-5 pt-6 text-left shadow-[0_10px_30px_rgba(104,116,110,0.05)] md:min-h-[8.8rem] md:px-7 md:pb-6 md:pt-7">
            <textarea
              placeholder="Where viral posts are written."
              className="h-16 w-full resize-none bg-transparent text-[1rem] leading-7 text-[#687073] outline-none placeholder:text-[#a0a8ab] md:h-20 md:text-[1.05rem]"
            />
            <div className="absolute bottom-4 right-4 flex items-center gap-2.5 md:bottom-5 md:right-5">
              <button
                aria-label="Voice input"
                className="grid h-10 w-10 place-items-center rounded-full text-[#9da5aa] transition duration-300 hover:bg-[#f4f5f3] hover:text-[#737b80]"
              >
                <Mic size={19} />
              </button>
              <button
                aria-label="Submit prompt"
                className="grid h-12 w-12 place-items-center rounded-full bg-[#eef1ef] text-[#91999f] shadow-[0_8px_18px_rgba(146,154,158,0.18)] transition duration-300 hover:scale-[1.03] hover:bg-[#e7ebea] hover:text-[#656d74]"
              >
                <ArrowRight size={21} />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-2.5 md:mt-7">
          <button className="inline-flex items-center gap-2 rounded-full border border-[#d9dfdc] bg-white/92 px-5 py-2.5 text-[0.98rem] font-medium text-[#474f56] shadow-[0_12px_24px_rgba(58,68,64,0.05)]">
            <ChartLine size={15} />
            Viral
          </button>
          <button className="inline-flex items-center gap-2 rounded-full border border-dashed border-[#d7ddda] bg-white/68 px-5 py-2.5 text-[0.98rem] font-medium text-[#4e565d]">
            <Shell size={15} />
            Bold
          </button>
          <button className="inline-flex items-center gap-2 rounded-full border border-dashed border-[#d7ddda] bg-white/68 px-5 py-2.5 text-[0.98rem] font-medium text-[#4e565d]">
            <ImageIcon size={15} />
            Creative
          </button>
          <button className="inline-flex items-center gap-2 rounded-full border border-dashed border-[#d7ddda] bg-white/68 px-5 py-2.5 text-[0.98rem] font-medium text-[#4e565d]">
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
