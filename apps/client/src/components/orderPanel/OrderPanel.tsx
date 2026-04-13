import { OrderForm } from './OrderForm';
import { PositionTable } from './PositionTable';
import { useOrderStore } from '../../stores/orderStore';
import { formatPnL } from '../../utils/formatters';

export function OrderPanel() {
  const { balance, positions } = useOrderStore();
  const equity = balance + positions.reduce((sum, p) => sum + p.pnl, 0);

  return (
    <div className="w-[280px] bg-bg-panel border-l border-border flex flex-col">
      <div className="p-3 border-b border-border">
        <div className="text-xs text-text-secondary mb-1">Account</div>
        <div className="font-mono text-sm">
          <div>Balance: ${balance.toFixed(2)}</div>
          <div>Equity: ${equity.toFixed(2)}</div>
        </div>
      </div>
      <OrderForm />
      <PositionTable />
    </div>
  );
}
