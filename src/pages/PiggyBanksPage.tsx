import { useCurrentAccount } from "@mysten/dapp-kit";
import { useNavigate } from "react-router-dom";
import { useEffect, lazy, Suspense } from "react";
import { LoadingSpinner } from "../LoadingSpinner";

const SBank = lazy(() => import("../SBank"));

export function PiggyBanksPage() {
  const currentAccount = useCurrentAccount();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentAccount) {
      navigate("/");
    }
  }, [currentAccount, navigate]);

  if (!currentAccount) {
    return null;
  }

  return (
    <Suspense fallback={
      <div className="min-h-[85vh] flex items-center justify-center">
        <LoadingSpinner size="lg" message="Loading piggy banks..." />
      </div>
    }>
      <SBank />
    </Suspense>
  );
}
