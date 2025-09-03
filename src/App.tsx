import { ConnectButton, useCurrentAccount } from "@mysten/dapp-kit";
import { Box, Container, Flex, Heading } from "@radix-ui/themes";
import SBank from "./SBank";
import './index.css'

function App() {
  const currentAccount = useCurrentAccount();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <Flex
        position="sticky"
        px="6"
        py="4"
        justify="between"
        align="center"
        style={{
          background: "rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
          zIndex: 50,
        }}
      >
        <Box>
          <Flex align="center" gap="3">
            <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-yellow-500 rounded-full flex items-center justify-center">
              🐷
            </div>
            <Heading size="6" style={{ 
              background: "linear-gradient(45deg, #ff6b6b, #4ecdc4)", 
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontWeight: "bold"
            }}>
              Sui Piggy Bank
            </Heading>
          </Flex>
        </Box>

        <Box>
          <div style={{
            background: "rgba(255, 255, 255, 0.1)",
            borderRadius: "12px",
            padding: "4px",
            backdropFilter: "blur(10px)",
          }}>
            <ConnectButton />
          </div>
        </Box>
      </Flex>

      {/* Main Content */}
      <Container size="4" px="4">
        <div className="py-8">
          {currentAccount ? (
            <SBank />
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-12 border border-white/20 shadow-2xl max-w-md mx-auto">
                <div className="text-8xl mb-6">🐷</div>
                <Heading size="7" mb="4" style={{ color: "white" }}>
                  Welcome to Sui Piggy Bank
                </Heading>
                <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                  Save your SUI tokens with goals and time locks. 
                  Connect your wallet to start your savings journey!
                </p>
                <div className="bg-gradient-to-r from-pink-500 to-yellow-500 p-1 rounded-full">
                  <div className="bg-gray-900 rounded-full px-6 py-3">
                    <span className="text-white font-semibold">Connect Wallet to Begin</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}

export default App;