import { ConnectButton } from "@mysten/dapp-kit";
import { Box, Flex, Heading } from "@radix-ui/themes";
import { Link } from "react-router-dom";

export function Header() {
  return (
    <header>
      <Flex
        position="sticky"
        px="4"
        py="3"
        justify="between"
        align="center"
        className="backdrop-blur-xl bg-slate-950/40 border-b border-white/10 shadow-2xl z-50 sm:px-6 md:px-10 lg:px-8 sm:py-4 md:py-5"
      >
        <Flex align="center" gap="2" className="sm:gap-3 md:gap-4">
          <Link to="/" className="flex items-center gap-2 sm:gap-3 md:gap-4">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity" />
              <div className="relative w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-gradient-to-br from-cyan-400 to-violet-500 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl shadow-xl transform group-hover:scale-105 transition-transform">
                🐷
              </div>
            </div>
            <div className="hidden sm:block">
              <Heading
                size="6"
                className="bg-gradient-to-r from-cyan-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent font-bold tracking-tight text-sm sm:text-base md:text-lg"
              >
                SuiVault
              </Heading>
              <p className="text-slate-400 text-xs hidden md:block">
                Smart Savings Platform
              </p>
            </div>
          </Link>
        </Flex>

        <Box>
          <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-1.5 shadow-xl hover:bg-white/10 transition-all">
            <ConnectButton />
          </div>
        </Box>
      </Flex>
    </header>
  );
}
