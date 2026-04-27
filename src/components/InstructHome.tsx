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
    const targetX = mouse.y * 0.50;
    const targetY = mouse.x * 0.50;

    
    group.rotation.x = THREE.MathUtils.lerp(group.rotation.x, targetX, 0.04);
    group.rotation.y = THREE.MathUtils.lerp(group.rotation.y, targetY, 0.04);

    core.rotation.y += 0.012;
    core.rotation.z = Math.sin(elapsed * 0.26) * 0.3;
    halo.rotation.y -= 0.007;
    halo.rotation.x = Math.cos(elapsed * 0.22) * 0.5;
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
          opacity={0.12}
          size={0.020}
          sizeAttenuation
          transparent
        />
      </points>
      <points ref={coreRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            array={coreParticles}
            count={coreParticles.length / 1}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          color="#000000"
          depthWrite={false}
          opacity={0.90}
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
      <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,_rgba(208,223,216,0.6)_0%,_rgba(255,255,255,0)_63%)] blur-3xl" />
      <div className="absolute inset-[20%] rounded-full border border-white/50 bg-white/[0.12] blur-2xl" />
      <div className="absolute inset-[30%] rounded-full bg-[radial-gradient(circle,_rgba(229,236,233,0.3)_0%,_rgba(255,255,255,0)_72%)] blur-xl" />
      <Canvas camera={{ fov: 40, position: [0, 0, 3.5] }} dpr={[1, 8]}>
        <ambientLight intensity={1.8} />
        <ParticleOrb />
      </Canvas>
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#fff]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(232,242,236,0.95)_0%,_rgba(255,255,255,0.82)_34%,_rgba(255,255,255,1)_62%)]" />
      <div className="absolute inset-x-0 top-0 h-[30rem] bg-[radial-gradient(ellipse_at_top,_rgba(218,236,227,0.85)_0%,_rgba(236,244,240,0.54)_34%,_rgba(255,255,255,0)_74%)] blur-2xl" />
      <div className="absolute left-1/2 top-0 h-[25rem] w-[72rem] -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,_rgba(220,239,230,0.45)_0%,_rgba(255,255,255,0)_68%)] opacity-90 blur-3xl" />
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

        <div className="mt-7 w-full max-w-[52rem] md:mt-10">
  {/* Outer glass shell */}
  <div
    style={{
      borderRadius: "2rem",
      padding: "1px",
      background:
        "linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.3) 40%, rgba(255,255,255,0.6) 100%)",
      boxShadow:
        "0 32px 64px rgba(68, 80, 55, 0.08), 0 8px 24px rgba(0,0,0,0.04), 0 2px 0 rgba(255,255,255,1) inset",
      backdropFilter: "blur(24px)",
      WebkitBackdropFilter: "blur(24px)",
    }}
  >
    {/* Inner glass surface */}
    <div
      style={{
        borderRadius: "calc(2rem - 1.5px)",
        background:
          "linear-gradient(160deg, rgba(255,255,255,0.82) 0%, rgba(255,255,255,0.54) 50%, rgba(255,255,255,0.72) 100%)",
        boxShadow:
          "0 1px 0 rgba(255,255,255,0.95) inset, 0 -1px 0 rgba(255,255,255,0.4) inset, inset 0 10px 30px rgba(255,255,255,0.5), 0 10px 30px rgba(104,116,110,0.04)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        position: "relative",
        overflow: "hidden",
        minHeight: "8.2rem",
        padding: "1.5rem 1.5rem 1.25rem 1.5rem",
      }}
    >
      {/* Specular highlight strip — top edge glint */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "8%",
          right: "8%",
          height: "1.5px",
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.95) 30%, rgba(255,255,255,1) 50%, rgba(255,255,255,0.95) 70%, transparent)",
          borderRadius: "0 0 50% 50%",
          pointerEvents: "none",
        }}
      />

      {/* Glossy upper sheen */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "45%",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.0) 100%)",
          borderRadius: "calc(2rem - 1.5px) calc(2rem - 1.5px) 60% 60% / 30px 30px 0 0",
          pointerEvents: "none",
        }}
      />

      {/* Inner glow — bottom shadow to give depth */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "40%",
          background:
            "linear-gradient(0deg, rgba(233, 233, 233, 0.12) 0%, transparent 100%)",
          borderRadius: "0 0 calc(2rem - 1.5px) calc(2rem - 1.5px)",
          pointerEvents: "none",
        }}
      />

      {/* Textarea */}
      <textarea
        placeholder="Where viral posts are written"
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          resize: "none",
          background: "transparent",
          border: "none",
          outline: "none",
          fontSize: "1.05rem",
          lineHeight: "1.3rem",
          color: "#1e1d1d",
          height: "4rem",
        }}
        className="placeholder:text-[#b0b8bb]"
      />

      {/* Action buttons */}
      <div
        style={{
          position: "absolute",
          bottom: "1.1rem",
          right: "1.1rem",
          zIndex: 2,
          display: "flex",
          alignItems: "center",
          gap: "0.6rem",
        }}
      >
        {/* Mic button — glass pill */}
        <button
          aria-label="Voice input"
          style={{
            width: "2.5rem",
            height: "2.5rem",
            borderRadius: "50%",
            display: "grid",
            placeItems: "center",
            background:
              "linear-gradient(145deg, rgba(255,255,255,0.7), rgba(255,255,255,0.3))",
            border: "1px solid rgba(255,255,255,0.8)",
            boxShadow:
              "0 4px 12px rgba(0,0,0,0.06), 0 1px 0 rgba(255,255,255,0.9) inset",
            color: "#9da5aa",
            cursor: "pointer",
            transition: "all 0.25s ease",
            backdropFilter: "blur(8px)",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.background =
              "linear-gradient(145deg, rgba(255,255,255,0.9), rgba(255,255,255,0.5))";
            (e.currentTarget as HTMLButtonElement).style.color = "#6a7478";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.background =
              "linear-gradient(145deg, rgba(255,255,255,0.7), rgba(255,255,255,0.3))";
            (e.currentTarget as HTMLButtonElement).style.color = "#9da5aa";
          }}
        >
          <Mic size={17} />
        </button>

        {/* Submit button — frosted glass pill with glow */}
        <button
          aria-label="Submit prompt"
          style={{
            width: "3rem",
            height: "3rem",
            borderRadius: "50%",
            display: "grid",
            placeItems: "center",
            background:
              "linear-gradient(145deg, rgba(255,255,255,0.85) 0%, rgba(230,236,233,0.7) 100%)",
            border: "1px solid rgba(255,255,255,0.9)",
            boxShadow:
              "0 8px 24px rgba(100,120,110,0.15), 0 2px 0 rgba(255,255,255,1) inset, 0 -1px 0 rgba(180,190,185,0.3) inset",
            color: "#7a8a8f",
            cursor: "pointer",
            transition: "all 0.28s cubic-bezier(0.34,1.56,0.64,1)",
            backdropFilter: "blur(12px)",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.06)";
            (e.currentTarget as HTMLButtonElement).style.boxShadow =
              "0 12px 32px rgba(100,120,110,0.22), 0 2px 0 rgba(255,255,255,1) inset, 0 -1px 0 rgba(180,190,185,0.3) inset";
            (e.currentTarget as HTMLButtonElement).style.color = "#4a5a60";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
            (e.currentTarget as HTMLButtonElement).style.boxShadow =
              "0 8px 24px rgba(100,120,110,0.15), 0 2px 0 rgba(255,255,255,1) inset, 0 -1px 0 rgba(180,190,185,0.3) inset";
            (e.currentTarget as HTMLButtonElement).style.color = "#7a8a8f";
          }}
        >
          <ArrowRight size={19} />
        </button>
      </div>
    </div>
  </div>
</div>

        <div className="mt-6 flex flex-wrap justify-center gap-3 md:mt-7">
          <button className="inline-flex items-center gap-2 rounded-full border border-dashed border-[#d7ddda] bg-white/68 px-5 py-1 text-[0.98rem] font-medium text-[#4e565d]">
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
    <section className="bg-[#ffffff] px-6 pb-24 md:px-10">
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
    <section className="bg-[#ffffff] px-6 pb-24 pt-6 md:px-10">
      <div className="mx-auto flex min-h-[320px] max-w-6xl flex-col items-center justify-center rounded-[40px] bg-[#eef2ee] px-8 text-center shadow-[0_20px_80px_rgba(48,56,52,0.07)]">
        <h2
          className="max-w-3xl text-4xl leading-tight tracking-[-0.04em] text-[#404748] md:text-5xl"
          style={{ fontFamily: "var(--font-editorial), serif", fontWeight: 600 }}
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
          <span>Capmax</span>
          <p>(c) 2026 Capmax AI</p>
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
        <Link href="">Terms</Link>
        <Link href="">Privacy Policy</Link>
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
