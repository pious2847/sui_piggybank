import { useCurrentAccount } from "@mysten/dapp-kit";
import { lazy, Suspense } from "react";
import { LoadingSpinner } from "../LoadingSpinner";

const Dashboard = lazy(() => import("../components/dashboard/Dashboard").then(m => ({ default: m.Dashboard })));

export function DashboardPage() {
  const currentAccount = useCurrentAccount();

  if (!currentAccount) {
    return (
      <section className="flex flex-col items-center justify-center min-h-[85vh] px-4 sm:px-6 text-center animate-fade-in">
        {/* Hero Section */}
        <div className="mb-8 sm:mb-12 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-violet-500 to-fuchsia-500 blur-[100px] opacity-30 animate-pulse-slow" aria-hidden="true" />
          
          <h1 className="relative text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-black bg-gradient-to-r from-cyan-300 via-violet-300 to-fuchsia-300 bg-clip-text text-transparent mb-4 sm:mb-6 leading-[1.1] tracking-tight drop-shadow-2xl">
            Save Smarter.<br />Unlock Later.
          </h1>
        </div>
        
        <p className="text-slate-300 text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl max-w-3xl mb-8 sm:mb-12 md:mb-16 leading-relaxed font-light px-2 sm:px-4">
          Lock your SUI tokens in a secure Piggy Bank with customizable savings goals and time locks. 
          <span className="text-cyan-400 font-semibold"> Break the bank only when your target is reached.</span>
        </p>
        
        {/* CTA Button */}
        <div className="relative group mb-12 sm:mb-16 md:mb-24">
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-violet-500 to-fuchsia-500 rounded-full blur-xl opacity-60 group-hover:opacity-100 transition-all duration-500 animate-pulse-slow" aria-hidden="true" />
          
          <button 
            className="relative bg-gradient-to-r from-cyan-500 via-violet-500 to-fuchsia-500 rounded-full shadow-2xl transform transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-cyan-500/50 focus:ring-offset-2 focus:ring-offset-slate-950"
            aria-label="Connect wallet to begin using SuiVault"
          >
            <div className="bg-slate-950/90 backdrop-blur-sm rounded-full px-6 sm:px-8 md:px-12 py-3 sm:py-4 md:py-6 m-[2px] group-hover:bg-slate-900/80 transition-colors duration-300">
              <span className="font-bold text-sm sm:text-base md:text-lg bg-gradient-to-r from-cyan-300 to-violet-300 bg-clip-text text-transparent group-hover:from-cyan-200 group-hover:to-fuchsia-200 transition-all duration-300">
                Connect Wallet to Begin →
              </span>
            </div>
          </button>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-6xl w-full">
          <div className="group relative">
            <div className="absolute -inset-1 bg-gradient-to-br from-emerald-500/30 to-teal-500/30 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-500" aria-hidden="true" />
            
            <div className="relative backdrop-blur-xl bg-white/[0.07] border border-white/10 rounded-3xl p-5 sm:p-6 md:p-7 lg:p-8 shadow-2xl transition-all duration-300 hover:border-emerald-500/50 hover:bg-white/[0.1] transform hover:-translate-y-2 hover:scale-[1.02]">
              <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl mb-3 sm:mb-4 md:mb-5 lg:mb-6 transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" aria-hidden="true">💰</div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-3 md:mb-4 bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent">
                Smart Savings
              </h3>
              <p className="text-slate-400 leading-relaxed text-xs sm:text-sm md:text-base">
                Deposit your SUI tokens and keep them safe until your target date and goal amount are reached.
              </p>
            </div>
          </div>
          
          <div className="group relative">
            <div className="absolute -inset-1 bg-gradient-to-br from-violet-500/30 to-purple-500/30 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-500" aria-hidden="true" />
            
            <div className="relative backdrop-blur-xl bg-white/[0.07] border border-white/10 rounded-3xl p-5 sm:p-6 md:p-7 lg:p-8 shadow-2xl transition-all duration-300 hover:border-violet-500/50 hover:bg-white/[0.1] transform hover:-translate-y-2 hover:scale-[1.02]">
              <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl mb-3 sm:mb-4 md:mb-5 lg:mb-6 transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" aria-hidden="true">🔒</div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-3 md:mb-4 bg-gradient-to-r from-violet-300 to-purple-300 bg-clip-text text-transparent">
                Time Lock
              </h3>
              <p className="text-slate-400 leading-relaxed text-xs sm:text-sm md:text-base">
                Prevent early withdrawals with strict time locks for true savings discipline.
              </p>
            </div>
          </div>
          
          <div className="group relative">
            <div className="absolute -inset-1 bg-gradient-to-br from-cyan-500/30 to-blue-500/30 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-500" aria-hidden="true" />
            
            <div className="relative backdrop-blur-xl bg-white/[0.07] border border-white/10 rounded-3xl p-5 sm:p-6 md:p-7 lg:p-8 shadow-2xl transition-all duration-300 hover:border-cyan-500/50 hover:bg-white/[0.1] transform hover:-translate-y-2 hover:scale-[1.02] sm:col-span-2 lg:col-span-1">
              <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl mb-3 sm:mb-4 md:mb-5 lg:mb-6 transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" aria-hidden="true">📊</div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-3 md:mb-4 bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
                Track Progress
              </h3>
              <p className="text-slate-400 leading-relaxed text-xs sm:text-sm md:text-base">
                See your savings grow with real-time updates and progress tracking in your dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <Suspense fallback={
      <div className="min-h-[85vh] flex items-center justify-center">
        <LoadingSpinner size="lg" message="Loading dashboard..." />
      </div>
    }>
      <Dashboard />
    </Suspense>
  );
}
