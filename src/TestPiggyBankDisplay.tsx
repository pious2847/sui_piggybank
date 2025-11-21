import { PiggyBankDisplay } from './PiggyBankDisplay';
import { ErrorBoundary } from './ErrorBoundary';

// Test component to verify error handling
export function TestPiggyBankDisplay() {
  return (
    <div className="p-4">
      <h2 className="text-white text-xl mb-4">Testing PiggyBankDisplay Error Handling</h2>
      
      {/* Test with invalid bank ID */}
      <div className="mb-8">
        <h3 className="text-slate-300 text-lg mb-2">Test 1: Invalid Bank ID</h3>
        <ErrorBoundary>
          <PiggyBankDisplay bankId="invalid-bank-id-test" />
        </ErrorBoundary>
      </div>
      
      {/* Test with empty bank ID */}
      <div className="mb-8">
        <h3 className="text-slate-300 text-lg mb-2">Test 2: Empty Bank ID</h3>
        <ErrorBoundary>
          <PiggyBankDisplay bankId="" />
        </ErrorBoundary>
      </div>
    </div>
  );
}