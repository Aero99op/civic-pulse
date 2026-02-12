"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useUserStore, User } from "@/lib/store";
import { loginAsRole } from "@/actions/auth";
import { Loader2, Shield, User as UserIcon, ArrowRight, Activity, Map, Zap } from "lucide-react";
import { HeroBackground } from "@/components/landing/HeroBackground";
import { CardContainer, CardBody, CardItem } from "@/components/ui/3d-card";
import { LiveFeed } from "@/components/landing/LiveFeed";
import { CyberDock } from "@/components/layout/CyberDock";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const { user, setUser } = useUserStore();
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  const handleLogin = async (role: "CITIZEN" | "DEPARTMENT") => {
    setIsLoading(true);
    try {
      const result = await loginAsRole(role);
      if (result.user) {
        setUser(result.user as unknown as User);
        router.push("/dashboard");
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (user) return null;

  return (
    <HeroBackground>
      <div className="fixed inset-0 pointer-events-none z-[1] scanlines" />
      <CyberDock />

      <div className="relative z-10 w-full min-h-screen flex flex-col items-center justify-center p-4 md:p-8 pb-32 md:pb-8">
        {/* Header Content */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-8 md:mb-16 relative w-full max-w-4xl mx-auto"
        >
          <div className="inline-block mb-4 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 backdrop-blur-md text-primary text-[10px] md:text-sm font-semibold tracking-wider uppercase animate-pulse-slow">
            System Online • v2.0.4
          </div>
          <h1
            className="text-fluid-h1 font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50 text-glow glitch-text"
            data-text="CivicPulse"
          >
            CivicPulse
          </h1>
          <p className="mt-4 md:mt-6 text-fluid-p text-slate-400 max-w-2xl mx-auto font-light px-4">
            The neural network of your city.
            <span className="text-primary font-medium"> Report</span>,
            <span className="text-secondary font-medium"> Verify</span>,
            <span className="text-accent-foreground font-medium"> Resolve</span>.
          </p>
        </motion.div>

        {/* Main Interaction Cards */}
        <div className="flex flex-col md:flex-row gap-8 md:gap-16 w-full max-w-6xl items-center justify-center">

          {/* Citizen Logic */}
          <CardContainer className="inter-var w-full max-w-md md:w-auto">
            <CardBody className="bg-slate-900/40 relative group/card border-slate-800/50 w-full md:w-[28rem] h-auto rounded-3xl p-6 md:p-8 border hover:border-primary/50 transition-colors duration-500 shadow-2xl backdrop-blur-sm">
              <CardItem
                translateZ="50"
                className="text-2xl md:text-3xl font-bold text-white mb-2"
              >
                Citizen Node
              </CardItem>
              <CardItem
                as="p"
                translateZ="60"
                className="text-slate-400 text-sm max-w-sm mt-2"
              >
                Connect to the grid. Report infrastructure anomalies and earn merit points for civic contributions.
              </CardItem>
              <CardItem
                translateZ="100"
                className="w-full mt-8 flex items-center justify-center"
              >
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center border border-primary/30 shadow-[0_0_30px_rgba(6,182,212,0.3)] group-hover/card:shadow-[0_0_50px_rgba(6,182,212,0.5)] transition-shadow duration-500">
                  <UserIcon size={56} className="text-primary md:w-16 md:h-16" />
                </div>
              </CardItem>
              <div className="flex justify-between items-center mt-10">
                <CardItem
                  translateZ={20}
                  as="div"
                  className="flex items-center gap-2 text-xs text-slate-500 font-mono"
                >
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Status: Active
                </CardItem>
                <CardItem
                  translateZ={20}
                  as="button"
                  onClick={() => handleLogin('CITIZEN')}
                  disabled={isLoading}
                  className="px-6 py-2 rounded-xl bg-white text-black text-sm font-bold shadow-lg hover:shadow-cyan-500/50 hover:bg-cyan-50 transition-all duration-300 flex items-center gap-2"
                >
                  Initialize <ArrowRight size={14} />
                </CardItem>
              </div>
            </CardBody>
          </CardContainer>

          {/* Official Logic */}
          <CardContainer className="inter-var w-full max-w-md md:w-auto">
            <CardBody className="bg-slate-900/40 relative group/card border-slate-800/50 w-full md:w-[28rem] h-auto rounded-3xl p-6 md:p-8 border hover:border-orange-500/50 transition-colors duration-500 shadow-2xl backdrop-blur-sm">
              <CardItem
                translateZ="50"
                className="text-2xl md:text-3xl font-bold text-white mb-2"
              >
                Command Center
              </CardItem>
              <CardItem
                as="p"
                translateZ="60"
                className="text-slate-400 text-sm max-w-sm mt-2"
              >
                Administrative access only. Manage deployment, resolve tickets, and oversee city metrics.
              </CardItem>
              <CardItem
                translateZ="100"
                className="w-full mt-8 flex items-center justify-center"
              >
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center border border-orange-500/30 shadow-[0_0_30px_rgba(249,115,22,0.3)] group-hover/card:shadow-[0_0_50px_rgba(249,115,22,0.5)] transition-shadow duration-500">
                  <Shield size={56} className="text-orange-500 md:w-16 md:h-16" />
                </div>
              </CardItem>
              <div className="flex justify-between items-center mt-10">
                <CardItem
                  translateZ={20}
                  as="div"
                  className="flex items-center gap-2 text-xs text-slate-500 font-mono"
                >
                  <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" /> Status: Restricted
                </CardItem>
                <CardItem
                  translateZ={20}
                  as="button"
                  onClick={() => handleLogin('DEPARTMENT')}
                  disabled={isLoading}
                  className="px-6 py-2 rounded-xl bg-orange-600 text-white text-sm font-bold shadow-lg hover:shadow-orange-500/50 hover:bg-orange-500 transition-all duration-300 flex items-center gap-2"
                >
                  Authenticate <ArrowRight size={14} />
                </CardItem>
              </div>
            </CardBody>
          </CardContainer>

        </div>

        {/* Floating Live Feed */}
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 md:bottom-8 md:left-8 md:translate-x-0 w-[90%] md:w-auto z-40">
          <LiveFeed />
        </div>

        {/* Feature Grid - Below Fold */}
        <div className="mt-20 md:mt-32 w-full max-w-7xl grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 pb-32 md:pb-20">
          <FeatureCard
            icon={<Map className="w-8 h-8 text-primary" />}
            title="Geospatial Tracking"
            description="Real-time issue mapping with sub-meter precision."
            delay={0.2}
          />
          <FeatureCard
            icon={<Activity className="w-8 h-8 text-secondary" />}
            title="Civic Analytics"
            description="Predictive modeling for urban maintenance needs."
            delay={0.4}
          />
          <FeatureCard
            icon={<Zap className="w-8 h-8 text-yellow-500" />}
            title="Gamified Rewards"
            description="Blockchain-verified karma points for verified reporting."
            delay={0.6}
          />
        </div>

        {isLoading && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-16 h-16 animate-spin text-primary" />
              <div className="text-primary font-mono text-sm tracking-widest animate-pulse">AUTHENTICATING...</div>
            </div>
          </div>
        )}

      </div>
    </HeroBackground>
  );
}

const FeatureCard = ({ icon, title, description, delay }: { icon: React.ReactNode, title: string, description: string, delay: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-primary/30 transition-all duration-300 group"
    >
      <div className="mb-4 p-3 rounded-lg bg-white/5 w-fit group-hover:scale-110 transition-transform duration-300">{icon}</div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-slate-400 leading-relaxed">{description}</p>
    </motion.div>
  )
}
