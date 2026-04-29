"use client";

import Image from "next/image";
import Link from "next/link";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ArrowRight, ChartLine, ChevronDown, Earth, FastForward, ImageIcon, LogIn, Mic, Moon, Shell, Speech, Sun, HandCoins, ChartScatter } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

const PLATFORM_OPTIONS = ["Instagram", "LinkedIn", "Twitter"] as const;
const STYLE_OPTIONS = ["Minimal", "Funny", "Aggressive", "Storytelling", "Curious"] as const;

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
    copy: "Your tone, your niche, your cadence. So every post feels personal.",
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
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [selectedPlatform, setSelectedPlatform] = useState<(typeof PLATFORM_OPTIONS)[number]>("Instagram");
  const [selectedStyle, setSelectedStyle] = useState<(typeof STYLE_OPTIONS)[number]>("Minimal");
  const [isPlatformMenuOpen, setIsPlatformMenuOpen] = useState(false);
  const [isStyleMenuOpen, setIsStyleMenuOpen] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const initialTheme = root.classList.contains("dark") ? "dark" : "light";
    setTheme(initialTheme);
  }, []);

  useEffect(() => {
    const root = document.documentElement;

    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;

      if (!target?.closest("[data-hero-menu-root='true']")) {
        setIsPlatformMenuOpen(false);
        setIsStyleMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, []);

  return (
    <section className="relative overflow-hidden bg-[#fff]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(232,242,236,0.95)_0%,_rgba(255,255,255,0.82)_34%,_rgba(255,255,255,1)_62%)]" />
      <div className="absolute inset-x-0 top-0 h-[26rem] bg-[radial-gradient(ellipse_at_top,_rgba(218,236,227,0.85)_0%,_rgba(236,244,240,0.54)_34%,_rgba(255,255,255,0)_74%)] blur-2xl" />
      <div className="absolute left-1/2 top-0 h-[22rem] w-[68rem] -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,_rgba(220,239,230,0.45)_0%,_rgba(255,255,255,0)_68%)] opacity-90 blur-3xl" />
      <div className="absolute inset-x-0 top-0 h-[18rem] opacity-[0.18] [background-image:radial-gradient(rgba(13, 13, 13, 0.22)_1px,transparent_1px)] [background-size:12px_12px] [mask-image:linear-gradient(to_bottom,black,transparent_88%)]" />

      <div className="absolute left-5 top-5 z-20 md:left-8 md:top-7">
        <Link
          href="/"
          aria-label="Capmax home"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            borderRadius: "999px",
            padding: "1.5px",
            background: "linear-gradient(145deg, rgba(255,255,255,0.96) 0%, rgba(255,255,255,0.28) 45%, rgba(255,255,255,0.62) 100%)",
            boxShadow: "0 4px 12px rgba(68,80,55,0.04), 0 1px 4px rgba(0,0,0,0.02), 0 1px 0 rgba(255,255,255,0.95) inset",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            textDecoration: "none",
            transition: "all 0.25s ease",
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              borderRadius: "999px",
              padding: "0 0.2rem 0 0",
              background: "linear-gradient(160deg, rgba(255,255,255,0.82) 0%, rgba(255,255,255,0.54) 50%, rgba(255,255,255,0.72) 100%)",
              boxShadow: "0 1px 0 rgba(255,255,255,0.95) inset, 0 -1px 0 rgba(255,255,255,0.38) inset, inset 0 8px 24px rgba(255,255,255,0.50)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <span
              style={{
                position: "absolute",
                top: 0,
                left: "8%",
                right: "8%",
                height: "1.5px",
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.95) 30%, rgba(255,255,255,1) 50%, rgba(255,255,255,0.95) 70%, transparent)",
                borderRadius: "0 0 50% 50%",
                pointerEvents: "none",
                zIndex: 10,
              }}
            />
            <span
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "55%",
                background: "linear-gradient(180deg, rgba(255,255,255,0.44) 0%, rgba(255,255,255,0) 100%)",
                borderRadius: "999px 999px 60% 60% / 20px 20px 0 0",
                pointerEvents: "none",
                zIndex: 9,
              }}
            />

            <Image
              src="/images/instruct/capmax-removebg-preview.png"
              alt="Capmax logo"
              width={56}
              height={56}
              className="relative z-10 h-[3.1rem] w-[3.1rem] object-contain"
            />
            <span
              className="relative z-10 hidden pr-3 sm:inline"
              style={{
                fontSize: "0.86rem",
                fontWeight: 500,
                letterSpacing: "-0.02em",
                color: "#18181b",
              }}
            >
              Capmax
            </span>
          </span>
        </Link>
      </div>

      <div className="absolute right-5 top-5 z-20 flex items-center gap-2 md:right-8 md:top-7 md:gap-3">
        <button
          type="button"
          aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
          onClick={() => setTheme((current) => (current === "light" ? "dark" : "light"))}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.55rem",
            borderRadius: "999px",
            padding: "1.5px",
            background: "linear-gradient(145deg, rgba(255,255,255,0.96) 0%, rgba(255,255,255,0.28) 45%, rgba(255,255,255,0.62) 100%)",
            boxShadow: "0 4px 12px rgba(68,80,55,0.04), 0 1px 4px rgba(0,0,0,0.02), 0 1px 0 rgba(255,255,255,0.95) inset",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            transition: "all 0.25s ease",
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              borderRadius: "999px",
              padding: "0.7rem 0.95rem",
              background: "linear-gradient(160deg, rgba(255,255,255,0.82) 0%, rgba(255,255,255,0.54) 50%, rgba(255,255,255,0.72) 100%)",
              boxShadow: "0 1px 0 rgba(255,255,255,0.95) inset, 0 -1px 0 rgba(255,255,255,0.38) inset, inset 0 8px 24px rgba(255,255,255,0.50)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              position: "relative",
              overflow: "hidden",
              color: "#18181b",
            }}
          >
            <span
              style={{
                position: "absolute",
                top: 0,
                left: "10%",
                right: "10%",
                height: "1.5px",
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.95) 30%, rgba(255,255,255,1) 50%, rgba(255,255,255,0.95) 70%, transparent)",
                borderRadius: "0 0 50% 50%",
                pointerEvents: "none",
              }}
            />
            {theme === "light" ? <Moon size={16} className="relative z-10" /> : <Sun size={16} className="relative z-10" />}
            <span className="relative z-10 hidden text-[0.84rem] font-medium sm:inline">
              {theme === "light" ? "Dark" : "Light"}
            </span>
          </span>
        </button>

        <Link
          href="/login"
          aria-label="Log in"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.55rem",
            borderRadius: "999px",
            padding: "1.5px",
            background: "linear-gradient(145deg, rgba(255,255,255,0.96) 0%, rgba(255,255,255,0.28) 45%, rgba(255,255,255,0.62) 100%)",
            boxShadow: "0 4px 12px rgba(68,80,55,0.04), 0 1px 4px rgba(0,0,0,0.02), 0 1px 0 rgba(255,255,255,0.95) inset",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            textDecoration: "none",
            transition: "all 0.25s ease",
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              borderRadius: "999px",
              padding: "0.7rem 0.95rem",
              background: "linear-gradient(160deg, rgba(255,255,255,0.82) 0%, rgba(255,255,255,0.54) 50%, rgba(255,255,255,0.72) 100%)",
              boxShadow: "0 1px 0 rgba(255,255,255,0.95) inset, 0 -1px 0 rgba(255,255,255,0.38) inset, inset 0 8px 24px rgba(255,255,255,0.50)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              position: "relative",
              overflow: "hidden",
              color: "#18181b",
            }}
          >
            <span
              style={{
                position: "absolute",
                top: 0,
                left: "10%",
                right: "10%",
                height: "1.5px",
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.95) 30%, rgba(255,255,255,1) 50%, rgba(255,255,255,0.95) 70%, transparent)",
                borderRadius: "0 0 50% 50%",
                pointerEvents: "none",
              }}
            />
            <LogIn size={16} className="relative z-10" />
            <span className="relative z-10 hidden text-[0.84rem] font-medium sm:inline">
              Login
            </span>
          </span>
        </Link>
      </div>
      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col items-center justify-center px-6 pb-10 pt-10 text-center md:px-10 md:pb-12 md:pt-12">
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

        <p className="mt-2 max-w-xl text-balance text-[0.8rem] font leading-none text-[#657985] md:text-[1.35rem]">
          Where viral posts are written
        </p>

        <div className="mt-5 w-full max-w-[48rem] md:mt-7">
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
          overflow: "visible",
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
          height: "5.25rem",
          paddingBottom: "2.7rem",
          paddingRight: "6rem",
        }}
        className="placeholder:text-[#b0b8bb]"
      />

      <div
        data-hero-menu-root="true"
        style={{
          position: "absolute",
          bottom: "1rem",
          left: "1rem",
          zIndex: 2,
          display: "flex",
          alignItems: "center",
          gap: "0.65rem",
          flexWrap: "wrap",
          maxWidth: "calc(100% - 8rem)",
        }}
      >
        <div style={{ position: "relative" }}>
          <button
            type="button"
            aria-haspopup="menu"
            aria-expanded={isPlatformMenuOpen}
            onClick={() => {
              setIsPlatformMenuOpen((current) => !current);
              setIsStyleMenuOpen(false);
            }}
            style={{
              minHeight: "2.4rem",
              borderRadius: "999px",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.55rem",
              padding: "0.55rem 0.9rem",
              background: "linear-gradient(145deg, rgba(255,255,255,0.7), rgba(255,255,255,0.3))",
              border: "1px solid rgba(255,255,255,0.8)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.06), 0 1px 0 rgba(255,255,255,0.9) inset",
              color: "#6a7478",
              cursor: "pointer",
              transition: "all 0.25s ease",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              fontSize: "0.92rem",
              fontWeight: 500,
            }}
          >
            <span>{selectedPlatform}</span>
            <ChevronDown size={15} style={{ transform: isPlatformMenuOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s ease" }} />
          </button>

          {isPlatformMenuOpen && (
            <div
              role="menu"
              style={{
                position: "absolute",
                left: 0,
                top: "calc(100% + 0.6rem)",
                minWidth: "12rem",
                padding: "0.45rem",
                borderRadius: "1rem",
                background: "linear-gradient(160deg, rgba(255,255,255,0.84) 0%, rgba(255,255,255,0.58) 55%, rgba(255,255,255,0.76) 100%)",
                border: "1px solid rgba(255,255,255,0.82)",
                boxShadow: "0 14px 30px rgba(100,120,110,0.12), 0 1px 0 rgba(255,255,255,0.95) inset",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
              }}
            >
              {PLATFORM_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setSelectedPlatform(option);
                    setIsPlatformMenuOpen(false);
                  }}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderRadius: "0.8rem",
                    padding: "0.7rem 0.8rem",
                    border: "none",
                    background: option === selectedPlatform ? "rgba(255,255,255,0.55)" : "transparent",
                    color: "#4e565d",
                    cursor: "pointer",
                    fontSize: "0.9rem",
                    fontWeight: option === selectedPlatform ? 600 : 500,
                    transition: "background 0.2s ease",
                  }}
                >
                  <span>{option}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div style={{ position: "relative" }}>
          <button
            type="button"
            aria-haspopup="menu"
            aria-expanded={isStyleMenuOpen}
            onClick={() => {
              setIsStyleMenuOpen((current) => !current);
              setIsPlatformMenuOpen(false);
            }}
            style={{
              minHeight: "2.4rem",
              borderRadius: "999px",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.55rem",
              padding: "0.55rem 0.9rem",
              background: "linear-gradient(145deg, rgba(255,255,255,0.7), rgba(255,255,255,0.3))",
              border: "1px solid rgba(255,255,255,0.8)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.06), 0 1px 0 rgba(255,255,255,0.9) inset",
              color: "#6a7478",
              cursor: "pointer",
              transition: "all 0.25s ease",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              fontSize: "0.92rem",
              fontWeight: 500,
            }}
          >
            <span>{selectedStyle}</span>
            <ChevronDown size={15} style={{ transform: isStyleMenuOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s ease" }} />
          </button>

          {isStyleMenuOpen && (
            <div
              role="menu"
              style={{
                position: "absolute",
                left: 0,
                top: "calc(100% + 0.6rem)",
                minWidth: "12rem",
                padding: "0.45rem",
                borderRadius: "1rem",
                background: "linear-gradient(160deg, rgba(255,255,255,0.84) 0%, rgba(255,255,255,0.58) 55%, rgba(255,255,255,0.76) 100%)",
                border: "1px solid rgba(255,255,255,0.82)",
                boxShadow: "0 14px 30px rgba(100,120,110,0.12), 0 1px 0 rgba(255,255,255,0.95) inset",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
              }}
            >
              {STYLE_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setSelectedStyle(option);
                    setIsStyleMenuOpen(false);
                  }}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderRadius: "0.8rem",
                    padding: "0.7rem 0.8rem",
                    border: "none",
                    background: option === selectedStyle ? "rgba(255,255,255,0.55)" : "transparent",
                    color: "#4e565d",
                    cursor: "pointer",
                    fontSize: "0.9rem",
                    fontWeight: option === selectedStyle ? 600 : 500,
                    transition: "background 0.2s ease",
                  }}
                >
                  <span>{option}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

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

        <div className="mt-4 flex flex-wrap justify-center gap-2.5 md:mt-5">
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
    <section className="bg-[#ffffff] px-6 pb-14 md:px-10 md:pb-16">
      <div className="mx-auto max-w-6xl rounded-[34px] border border-white/70 bg-white/72 p-6 shadow-[0_18px_56px_rgba(48,56,52,0.05)] backdrop-blur-xl md:p-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm uppercase tracking-[0.24em] text-[#8d9792]">Featured</p>
          <h2
            className="mt-3 text-[2rem] leading-tight tracking-[-0.04em] text-[#444a4b] md:text-[2.8rem]"
            style={{ fontFamily: "var(--font-editorial), serif", fontWeight: 500 }}
          >
          Everything <b>Capmax</b> is capable of  
          </h2>
          <p className="mt-3 text-sm leading-6 text-[#6f7778] md:text-base">
           Minimal where it should be, deep where it matters, sharp in every word.
          </p>
        </div>

        <div className="mt-7 grid gap-3.5 md:grid-cols-2">
          {featureCards.map((card) => {
            const Icon = card.icon;

            return (
              <article
                className={`instruct-feature-card is-${card.tone} min-h-[156px] rounded-[24px] border border-[rgba(20,24,28,0.06)] bg-white/88 p-5 md:p-6`}
                key={card.title}
              >
                <div className="relative z-10 max-w-[270px]">
                  <h3 className="text-[1.18rem] font-medium tracking-[-0.03em] text-[#2f3638] md:text-[1.28rem]">
                    {card.title}
                  </h3>
                  <p className="mt-2 text-[0.92rem] leading-6 text-[#697274]">{card.copy}</p>
                </div>
                <div className="instruct-card-visual">
                  <Icon size={22} />
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
    <section className="bg-[#ffffff] px-6 pb-16 pt-2 md:px-10 md:pb-20">
      <div className="mx-auto flex min-h-[250px] max-w-6xl flex-col items-center justify-center rounded-[34px] bg-[#eef2ee] px-6 py-10 text-center shadow-[0_18px_56px_rgba(48,56,52,0.06)] md:min-h-[270px] md:px-8">
        <h2
          className="max-w-3xl text-[2rem] leading-tight tracking-[-0.04em] text-[#404748] md:text-[2.7rem]"
          style={{ fontFamily: "var(--font-editorial), serif", fontWeight: 600 }}
        >
          The words behind every viral post
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#6f7778] md:text-base">
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
