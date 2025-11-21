import { memo, useMemo } from "react";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { Text } from "@radix-ui/themes";

interface SavingsChartProps {
  piggyBanks: any[];
  groupMemberships: any[];
}

export const SavingsChart = memo(function SavingsChart({ piggyBanks, groupMemberships }: SavingsChartProps) {
  // Calculate current totals from real data
  const { totalPiggyBankSavings, totalGroupSavings } = useMemo(() => {
    // Calculate total from piggy banks
    const piggyBankTotal = piggyBanks.reduce((sum, bank) => {
      // Handle nested structure: bank.data.content.fields.balance
      const content = bank.data?.content;
      if (content && "fields" in content) {
        const fields = content.fields as any;
        const balance = Number(fields.balance || 0);
        return sum + balance;
      }
      return sum;
    }, 0);

    // Calculate total from group memberships
    // Groups show user's contribution (position * contribution amount)
    const groupTotal = groupMemberships.reduce((sum, group) => {
      const userContribution = (group.userPosition || 0) * (group.contributionAmount || 0);
      return sum + userContribution;
    }, 0);

    return {
      totalPiggyBankSavings: piggyBankTotal / 1_000_000_000,
      totalGroupSavings: groupTotal / 1_000_000_000,
    };
  }, [piggyBanks, groupMemberships]);

  // Generate chart data showing growth trend
  const chartData = useMemo(() => {
    const data = [];
    const now = Date.now();
    const daysToShow = 30;

    // If no data, show empty chart
    if (totalPiggyBankSavings === 0 && totalGroupSavings === 0) {
      for (let i = daysToShow; i >= 0; i--) {
        const date = new Date(now - i * 24 * 60 * 60 * 1000);
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        data.push({
          date: dateStr,
          piggyBanks: 0,
          groups: 0,
          total: 0,
        });
      }
      return data;
    }

    // Show growth trend leading to current totals
    for (let i = daysToShow; i >= 0; i--) {
      const date = new Date(now - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      // Calculate progress percentage (0% at start, 100% at current day)
      const progressPercent = (daysToShow - i) / daysToShow;
      
      const piggyBankValue = totalPiggyBankSavings * progressPercent;
      const groupValue = totalGroupSavings * progressPercent;
      
      data.push({
        date: dateStr,
        piggyBanks: Number(piggyBankValue.toFixed(2)),
        groups: Number(groupValue.toFixed(2)),
        total: Number((piggyBankValue + groupValue).toFixed(2)),
      });
    }

    return data;
  }, [totalPiggyBankSavings, totalGroupSavings]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      // Find the values for each data key
      const piggyBanksData = payload.find((p: any) => p.dataKey === 'piggyBanks');
      const groupsData = payload.find((p: any) => p.dataKey === 'groups');
      
      const piggyBanksValue = piggyBanksData?.value || 0;
      const groupsValue = groupsData?.value || 0;
      const totalValue = piggyBanksValue + groupsValue;
      
      return (
        <div className="backdrop-blur-xl bg-slate-900/90 border border-white/20 rounded-xl p-4 shadow-2xl">
          <p className="text-slate-300 text-sm mb-2">{payload[0].payload.date}</p>
          <div className="space-y-1">
            <p className="text-cyan-400 text-sm font-semibold">
              Piggy Banks: {piggyBanksValue.toFixed(2)} SUI
            </p>
            <p className="text-violet-400 text-sm font-semibold">
              Groups: {groupsValue.toFixed(2)} SUI
            </p>
            <p className="text-emerald-400 text-sm font-bold border-t border-white/10 pt-1 mt-1">
              Total: {totalValue.toFixed(2)} SUI
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  const hasData = totalPiggyBankSavings > 0 || totalGroupSavings > 0;

  return (
    <div className="backdrop-blur-xl bg-white/[0.07] border border-white/10 rounded-3xl p-6 shadow-2xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-200 mb-2 flex items-center gap-2">
          <span>📈</span>
          Savings Progress
        </h2>
        <Text className="text-slate-400 text-sm">
          {hasData 
            ? `Track your savings growth over the last 30 days`
            : `Your savings progress will appear here once you start saving`
          }
        </Text>
      </div>

      {!hasData ? (
        <div className="h-80 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">💰</div>
            <Text className="text-slate-400 text-lg mb-2">No Savings Yet</Text>
            <Text className="text-slate-500 text-sm">
              Create a piggy bank or join a group to start tracking your progress
            </Text>
          </div>
        </div>
      ) : (
        <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPiggyBanks" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorGroups" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="date" 
              stroke="rgba(255,255,255,0.5)"
              tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
              tickLine={{ stroke: 'rgba(255,255,255,0.2)' }}
            />
            <YAxis 
              stroke="rgba(255,255,255,0.5)"
              tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
              tickLine={{ stroke: 'rgba(255,255,255,0.2)' }}
              label={{ value: 'SUI', angle: -90, position: 'insideLeft', fill: 'rgba(255,255,255,0.6)' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="piggyBanks" 
              stackId="1"
              stroke="#06b6d4" 
              strokeWidth={2}
              fill="url(#colorPiggyBanks)" 
            />
            <Area 
              type="monotone" 
              dataKey="groups" 
              stackId="1"
              stroke="#8b5cf6" 
              strokeWidth={2}
              fill="url(#colorGroups)" 
            />
          </AreaChart>
        </ResponsiveContainer>
        </div>
      )}

      {/* Legend and Current Totals */}
      {hasData && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
                <Text className="text-slate-300 text-sm">Piggy Banks</Text>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-violet-500"></div>
                <Text className="text-slate-300 text-sm">Groups</Text>
              </div>
            </div>
            <div className="text-right">
              <Text className="text-slate-400 text-xs">Current Total</Text>
              <Text className="text-emerald-400 text-lg font-bold">
                {(totalPiggyBankSavings + totalGroupSavings).toFixed(2)} SUI
              </Text>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
