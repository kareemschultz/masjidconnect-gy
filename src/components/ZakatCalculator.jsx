import { useState, useMemo } from 'react';
import { DollarSign, HelpCircle, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';

// Nisab thresholds
const NISAB_GOLD_GRAMS   = 85;   // 85 grams of gold
const NISAB_SILVER_GRAMS = 595;  // 595 grams of silver
const ZAKAT_RATE         = 0.025; // 2.5%

// Default GYD prices (user can override)
const DEFAULT_GOLD_GYD_PER_GRAM   = 8000;  // ~$8,000 GYD/gram
const DEFAULT_SILVER_GYD_PER_GRAM = 95;    // ~$95 GYD/gram

function fmt(n) {
  return new Intl.NumberFormat('en-GY', { style: 'currency', currency: 'GYD', maximumFractionDigits: 0 }).format(n);
}

function Field({ label, hint, value, onChange, prefix = '$', type = 'number' }) {
  const [showHint, setShowHint] = useState(false);
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-200">{label}</label>
        {hint && (
          <button
            type="button"
            onClick={() => setShowHint(v => !v)}
            className="text-gray-400 hover:text-emerald-500 transition-colors"
            aria-label="Show hint"
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      {showHint && hint && (
        <p className="text-xs text-gray-500 dark:text-gray-400 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg px-3 py-2 border-l-2 border-emerald-400">
          {hint}
        </p>
      )}
      <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 focus-within:ring-2 focus-within:ring-emerald-400 focus-within:border-transparent transition-all">
        <span className="text-gray-400 dark:text-gray-500 text-sm font-medium">{prefix}</span>
        <input
          type={type}
          min="0"
          step="any"
          value={value}
          onChange={e => onChange(e.target.value === '' ? '' : parseFloat(e.target.value) || 0)}
          className="flex-1 bg-transparent text-gray-900 dark:text-gray-100 text-sm outline-none min-w-0"
          placeholder="0"
        />
      </div>
    </div>
  );
}

function Section({ title, icon, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3.5 text-left"
      >
        <span className="flex items-center gap-2 font-semibold text-gray-800 dark:text-gray-100 text-sm">
          <span>{icon}</span>
          {title}
        </span>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>
      {open && <div className="px-4 pb-4 space-y-3.5 border-t border-gray-100 dark:border-gray-700 pt-3.5">{children}</div>}
    </div>
  );
}

export default function ZakatCalculator() {
  // Gold/Silver prices (GYD per gram)
  const [goldPrice,   setGoldPrice]   = useState(DEFAULT_GOLD_GYD_PER_GRAM);
  const [silverPrice, setSilverPrice] = useState(DEFAULT_SILVER_GYD_PER_GRAM);

  // Nisab method
  const [nisabMethod, setNisabMethod] = useState('gold'); // 'gold' | 'silver'

  // Wealth fields (all in GYD unless otherwise noted)
  const [cash,        setCash]        = useState('');
  const [goldGrams,   setGoldGrams]   = useState('');
  const [silverGrams, setSilverGrams] = useState('');
  const [business,    setBusiness]    = useState('');
  const [investments, setInvestments] = useState('');
  const [receivables, setReceivables] = useState('');
  const [debts,       setDebts]       = useState('');

  const results = useMemo(() => {
    const g  = Number(goldGrams)   || 0;
    const s  = Number(silverGrams) || 0;
    const gp = Number(goldPrice)   || DEFAULT_GOLD_GYD_PER_GRAM;
    const sp = Number(silverPrice) || DEFAULT_SILVER_GYD_PER_GRAM;

    const goldValue   = g * gp;
    const silverValue = s * sp;
    const cashVal     = Number(cash)        || 0;
    const bizVal      = Number(business)    || 0;
    const invVal      = Number(investments) || 0;
    const recVal      = Number(receivables) || 0;
    const debtVal     = Number(debts)       || 0;

    const totalAssets = cashVal + goldValue + silverValue + bizVal + invVal + recVal;
    const netWealth   = Math.max(0, totalAssets - debtVal);

    const nisabGold   = NISAB_GOLD_GRAMS   * gp;
    const nisabSilver = NISAB_SILVER_GRAMS * sp;
    const nisabValue  = nisabMethod === 'gold' ? nisabGold : nisabSilver;

    const zakatDue   = netWealth >= nisabValue ? netWealth * ZAKAT_RATE : 0;
    const nisabMet   = netWealth >= nisabValue;

    return {
      goldValue, silverValue, totalAssets, netWealth,
      nisabValue, nisabGold, nisabSilver, nisabMet, zakatDue,
      breakdown: { cashVal, goldValue, silverValue, bizVal, invVal, recVal, debtVal },
    };
  }, [goldPrice, silverPrice, nisabMethod, cash, goldGrams, silverGrams, business, investments, receivables, debts]);

  const reset = () => {
    setCash(''); setGoldGrams(''); setSilverGrams('');
    setBusiness(''); setInvestments(''); setReceivables(''); setDebts('');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-4 pb-24">

      {/* Header */}
      <div className="text-center space-y-1 py-2">
        <p className="text-3xl">🕌</p>
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 font-cinzel">Zakat Calculator</h1>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Calculate your annual Zakat obligation · 2.5% on net wealth above Nisab
        </p>
        <p className="text-[10px] text-emerald-600/70 dark:text-emerald-400/70 italic">
          All amounts in Guyanese Dollars (GYD)
        </p>
      </div>

      {/* Nisab method selector */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 shadow-sm space-y-3">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">Nisab Method</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { key: 'gold',   label: '🥇 Gold (85g)', desc: `≈ ${fmt(85 * (Number(goldPrice) || DEFAULT_GOLD_GYD_PER_GRAM))}` },
            { key: 'silver', label: '🥈 Silver (595g)', desc: `≈ ${fmt(595 * (Number(silverPrice) || DEFAULT_SILVER_GYD_PER_GRAM))}` },
          ].map(m => (
            <button
              key={m.key}
              type="button"
              onClick={() => setNisabMethod(m.key)}
              className={`p-3 rounded-xl border-2 text-left transition-all ${
                nisabMethod === m.key
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30'
                  : 'border-gray-200 dark:border-gray-700 hover:border-emerald-300'
              }`}
            >
              <p className={`text-xs font-semibold ${nisabMethod === m.key ? 'text-emerald-700 dark:text-emerald-300' : 'text-gray-700 dark:text-gray-300'}`}>{m.label}</p>
              <p className={`text-[10px] mt-0.5 ${nisabMethod === m.key ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'}`}>{m.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Price reference */}
      <Section title="Current Market Prices" icon="📈" defaultOpen={false}>
        <p className="text-xs text-gray-500 dark:text-gray-400 -mt-1">Update with today's GYD prices for accurate nisab calculation.</p>
        <Field label="Gold (GYD per gram)" prefix="$" value={goldPrice} onChange={setGoldPrice}
          hint="Check xe.com or a local gold dealer. Gold is ~$7,500–8,500 GYD/gram as of early 2026." />
        <Field label="Silver (GYD per gram)" prefix="$" value={silverPrice} onChange={setSilverPrice}
          hint="Silver is typically ~$85–105 GYD/gram as of early 2026." />
      </Section>

      {/* Cash & Savings */}
      <Section title="Cash & Savings" icon="💵">
        <Field label="Cash, bank accounts & savings (GYD)" prefix="$" value={cash} onChange={setCash}
          hint="Include all cash on hand and money in bank accounts you have had for one full lunar year (hawl)." />
      </Section>

      {/* Gold & Silver */}
      <Section title="Gold & Silver" icon="⚖️">
        <Field label="Gold owned (grams)" prefix="g" value={goldGrams} onChange={setGoldGrams}
          hint="Include jewellery worn infrequently, gold bars, and coins. Jewellery worn daily is exempt according to some scholars." />
        <Field label="Silver owned (grams)" prefix="g" value={silverGrams} onChange={setSilverGrams}
          hint="Include silver jewellery, silverware, and coins." />
        {(Number(goldGrams) > 0 || Number(silverGrams) > 0) && (
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2.5 text-xs space-y-1">
            {Number(goldGrams) > 0 && <p className="text-gray-600 dark:text-gray-300">Gold value: <span className="font-semibold text-emerald-700 dark:text-emerald-300">{fmt(results.goldValue)}</span></p>}
            {Number(silverGrams) > 0 && <p className="text-gray-600 dark:text-gray-300">Silver value: <span className="font-semibold text-emerald-700 dark:text-emerald-300">{fmt(results.silverValue)}</span></p>}
          </div>
        )}
      </Section>

      {/* Business & Investments */}
      <Section title="Business & Investments" icon="🏢" defaultOpen={false}>
        <Field label="Business inventory & stock (GYD)" prefix="$" value={business} onChange={setBusiness}
          hint="Market value of goods you intend to sell. Exclude equipment and property used in business." />
        <Field label="Investments & shares (GYD)" prefix="$" value={investments} onChange={setInvestments}
          hint="Current market value of stocks, unit trusts, and investment accounts." />
        <Field label="Money owed to you / receivables (GYD)" prefix="$" value={receivables} onChange={setReceivables}
          hint="Money reliably expected to be repaid. Exclude debts unlikely to be recovered." />
      </Section>

      {/* Debts */}
      <Section title="Liabilities / Debts" icon="📋" defaultOpen={false}>
        <Field label="Short-term debts owed by you (GYD)" prefix="$" value={debts} onChange={setDebts}
          hint="Deduct debts due within the year — loans, credit cards, bills due. Long-term mortgages: only deduct one year's instalment." />
      </Section>

      {/* Results */}
      <div className={`rounded-2xl p-5 space-y-4 border-2 transition-all ${
        results.nisabMet
          ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-400 dark:border-emerald-600'
          : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
      }`}>
        <h2 className="font-bold text-gray-800 dark:text-gray-100 text-sm">📊 Your Zakat Summary</h2>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-gray-600 dark:text-gray-300">
            <span>Total assets</span>
            <span className="font-semibold">{fmt(results.totalAssets)}</span>
          </div>
          <div className="flex justify-between text-gray-600 dark:text-gray-300">
            <span>Less debts</span>
            <span className="font-semibold text-red-500">− {fmt(results.breakdown.debtVal)}</span>
          </div>
          <div className="flex justify-between text-gray-800 dark:text-gray-100 font-bold border-t border-gray-200 dark:border-gray-600 pt-2">
            <span>Net wealth</span>
            <span>{fmt(results.netWealth)}</span>
          </div>
          <div className="flex justify-between text-gray-600 dark:text-gray-300">
            <span>Nisab threshold ({nisabMethod === 'gold' ? 'gold 85g' : 'silver 595g'})</span>
            <span className="font-semibold">{fmt(results.nisabValue)}</span>
          </div>
        </div>

        <div className={`rounded-xl p-4 text-center space-y-1 ${
          results.nisabMet
            ? 'bg-emerald-600 text-white'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
        }`}>
          {results.nisabMet ? (
            <>
              <p className="text-xs font-medium opacity-80">Zakat Due (2.5%)</p>
              <p className="text-3xl font-bold">{fmt(results.zakatDue)}</p>
              <p className="text-xs opacity-70">SubhanAllah — may Allah accept your Zakat 🤲</p>
            </>
          ) : (
            <>
              <p className="text-sm font-semibold">Nisab not yet reached</p>
              <p className="text-xs">
                {results.netWealth > 0
                  ? `${fmt(results.nisabValue - results.netWealth)} below nisab threshold`
                  : 'Enter your wealth details above'}
              </p>
              <p className="text-xs opacity-70 mt-1">No Zakat is obligatory this year.</p>
            </>
          )}
        </div>

        {results.nisabMet && (
          <p className="text-[10px] text-gray-500 dark:text-gray-400 text-center leading-relaxed">
            This is an estimate. Consult a qualified Islamic scholar for your specific situation.
            Zakat is obligatory on wealth held for a full lunar year (hawl).
          </p>
        )}
      </div>

      {/* Reset */}
      <button
        type="button"
        onClick={reset}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      >
        <RotateCcw className="w-4 h-4" />
        Reset Calculator
      </button>

    </div>
  );
}
