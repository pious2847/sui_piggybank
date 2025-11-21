export function Footer() {
  return (
    <footer className="backdrop-blur-xl bg-slate-950/40 border-t border-white/10 py-6 mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-slate-400 text-sm">
            © 2025 SuiVault. Built on Sui blockchain.
          </p>
          <div className="flex gap-6 text-sm text-slate-400">
            <a href="#" className="hover:text-cyan-400 transition-colors">
              Docs
            </a>
            <a href="#" className="hover:text-cyan-400 transition-colors">
              GitHub
            </a>
            <a href="#" className="hover:text-cyan-400 transition-colors">
              Discord
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
