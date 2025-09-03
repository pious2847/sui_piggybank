import {
  useCurrentAccount,
  useSuiClientQuery,
} from "@mysten/dapp-kit";
import { Button, Flex, Heading, Text, Card } from "@radix-ui/themes";
import { useState } from "react";
import { CreatePiggyBank } from "./CreateCounter";
import { PiggyBankDisplay } from "./PiggyBankDisplay";
import { PiggyBankActions } from "./PiggyBank";

const SBank = () => {
  const currentAccount = useCurrentAccount();
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [selectedBankId, setSelectedBankId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  const { data, isPending, error, refetch } = useSuiClientQuery("getOwnedObjects", {
    owner: currentAccount?.address || "",
    options: { showType: true },
  });
  
  const piggyBanks = (data?.data || []).filter(
    (obj: any) => obj.data?.type?.endsWith("counter::PiggyBank")
  );

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header Section */}
      <div className="text-center mb-8">
        <Heading size="8" mb="3" style={{ color: "white" }}>
          My Piggy Banks 🏦
        </Heading>
        <Text size="5" style={{ color: "rgba(255, 255, 255, 0.7)" }}>
          Save smart, grow your SUI with time-locked goals
        </Text>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8" >
        <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6">
          <div className="text-center">
            <div className="text-3xl mb-2">🏛️</div>
            <Text size="2" style={{ color: "rgba(255, 255, 255, 0.7)" }}>
              Total Banks
            </Text>
            <Heading size="6" style={{ color: "white" }}>
              {piggyBanks.length}
            </Heading>
          </div>
        </Card>
        
        <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6">
          <div className="text-center">
            <div className="text-3xl mb-2">💰</div>
            <Text size="2" style={{ color: "rgba(255, 255, 255, 0.7)" }}>
              Active Savings
            </Text>
            <Heading size="6" style={{ color: "white" }}>
              {piggyBanks.length > 0 ? `${piggyBanks.length} Active` : "0 Active"}
            </Heading>
          </div>
        </Card>
        
        <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6">
          <div className="text-center">
            <div className="text-3xl mb-2">🎯</div>
            <Text size="2" style={{ color: "rgba(255, 255, 255, 0.7)" }}>
              Goals Set
            </Text>
            <Heading size="6" style={{ color: "white" }}>
              {piggyBanks.length}
            </Heading>
          </div>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Banks List */}
        <div className="lg:col-span-1">
          <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6">
            <Flex justify="between" align="center" mb="4">
              <Heading size="4" style={{ color: "white" }}>
                Your Banks
              </Heading>
              <Button
                onClick={() => setShowCreateForm(true)}
                style={{
                  background: "linear-gradient(45deg, #ff6b6b, #4ecdc4)",
                  border: "none",
                  borderRadius: "12px",
                  padding: "8px 16px",
                }}
              >
                + New Bank
              </Button>
            </Flex>

            {isPending ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin w-8 h-8 border-2 border-white/20 border-t-white rounded-full"></div>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <Text style={{ color: "#ff6b6b" }}>Error: {String(error)}</Text>
              </div>
            ) : piggyBanks.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">🐷</div>
                <Text style={{ color: "rgba(255, 255, 255, 0.7)" }}>
                  No piggy banks yet. Create your first one!
                </Text>
              </div>
            ) : (
              <Flex direction="column" gap="3">
                {piggyBanks.map((obj: any, index: number) => (
                  <div
                    key={obj.data.objectId}
                    className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                      selectedBankId === obj.data.objectId
                        ? 'bg-white/20 border-white/40 shadow-lg'
                        : 'bg-white/5 border-white/20 hover:bg-white/10 hover:border-white/30'
                    }`}
                    onClick={() => setSelectedBankId(obj.data.objectId)}
                  >
                    <Flex align="center" gap="3">
                      <div className="text-2xl">
                        {index === 0 ? '🐷' : index === 1 ? '🏦' : '💰'}
                      </div>
                      <div className="flex-1">
                        <Text weight="bold" style={{ color: "white" }}>
                          Bank #{index + 1}
                        </Text>
                        <Text size="2" style={{ color: "rgba(255, 255, 255, 0.6)" }}>
                          {obj.data.objectId.slice(0, 8)}...
                        </Text>
                      </div>
                      {selectedBankId === obj.data.objectId && (
                        <div className="w-3 h-3 bg-gradient-to-r from-pink-500 to-yellow-500 rounded-full"></div>
                      )}
                    </Flex>
                  </div>
                ))}
              </Flex>
            )}
          </Card>
        </div>

        {/* Right Column - Details & Actions */}
        <div className="lg:col-span-2">
          {showCreateForm ? (
            <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6">
              <Flex justify="between" align="center" mb="4">
                <Heading size="4" style={{ color: "white" }}>
                  Create New Piggy Bank
                </Heading>
                <Button
                  variant="ghost"
                  onClick={() => setShowCreateForm(false)}
                  style={{ color: "white" }}
                >
                  ✕
                </Button>
              </Flex>
              <CreatePiggyBank
                onCreated={(id) => {
                  setCreatedId(id);
                  setShowCreateForm(false);
                  setSelectedBankId(id);
                  refetch();
                }}
              />
            </Card>
          ) : (selectedBankId || createdId) ? (
            <div className="space-y-6">
              <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6">
                <Heading size="4" mb="4" style={{ color: "white" }}>
                  Bank Details
                </Heading>
                <PiggyBankDisplay bankId={selectedBankId || createdId!} />
              </Card>
              
              <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6">
                <Heading size="4" mb="4" style={{ color: "white" }}>
                  Actions
                </Heading>
                <PiggyBankActions bankId={selectedBankId || createdId!} onAction={refetch} />
              </Card>
            </div>
          ) : (
            <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6">
              <div className="text-center py-16">
                <div className="text-8xl mb-6">🐷</div>
                <Heading size="6" mb="3" style={{ color: "white" }}>
                  Select a Piggy Bank
                </Heading>
                <Text style={{ color: "rgba(255, 255, 255, 0.7)" }}>
                  Choose a piggy bank from the list to view details and perform actions, or create a new one.
                </Text>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default SBank;