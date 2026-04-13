import { useState } from 'react';

interface Alert {
  id: string;
  symbol: string;
  price: number;
  condition: 'above' | 'below';
  enabled: boolean;
  triggered: boolean;
}

export function AlertPanel() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [showForm, setShowForm] = useState(false);

  const addAlert = (symbol: string, price: number, condition: 'above' | 'below') => {
    setAlerts([...alerts, {
      id: Date.now().toString(),
      symbol,
      price,
      condition,
      enabled: true,
      triggered: false
    }]);
    setShowForm(false);
  };

  const removeAlert = (id: string) => {
    setAlerts(alerts.filter(a => a.id !== id));
  };

  const toggleAlert = (id: string) => {
    setAlerts(alerts.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a));
  };

  return (
    <div className="w-64 bg-bg-panel border-l border-border flex flex-col">
      <div className="p-3 border-b border-border flex justify-between items-center">
        <span className="font-semibold text-sm">Alerts</span>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-2 py-1 text-xs bg-accent-info rounded"
        >
          +
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {alerts.map(alert => (
          <div key={alert.id} className="p-2 border-b border-border text-xs">
            <div className="flex justify-between items-center mb-1">
              <span className="font-semibold">{alert.symbol}</span>
              <button onClick={() => removeAlert(alert.id)} className="text-accent-bear">✕</button>
            </div>
            <div className="text-text-secondary">
              {alert.condition} {alert.price}
            </div>
            <label className="flex items-center gap-2 mt-1">
              <input
                type="checkbox"
                checked={alert.enabled}
                onChange={() => toggleAlert(alert.id)}
              />
              <span>Enabled</span>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
