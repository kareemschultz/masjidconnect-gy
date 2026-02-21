import { useState, useMemo, useId } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, RotateCcw, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const NISAB_GOLD_GRAMS = 85;
const NISAB_SILVER_GRAMS = 595;
const ZAKAT_RATE = 0.025;

const DEFAULT_GOLD_GYD_PER_GRAM = 8000;
const DEFAULT_SILVER_GYD_PER_GRAM = 95;

function fmt(value) {
  return new Intl.NumberFormat('en-GY', {
    style: 'currency',
    currency: 'GYD',
    maximumFractionDigits: 0,
  }).format(value);
}

function Field({ label, hint, value, onChange, prefix = '$', type = 'number' }) {
  const [showHint, setShowHint] = useState(false);
  const inputId = useId();
  const hintId = useId();

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <label htmlFor={inputId} className="text-sm font-medium text-gray-700 dark:text-gray-200">{label}</label>
        {hint && (
          <button
            type="button"
            onClick={() => setShowHint((prev) => !prev)}
            className="inline-flex min-h-8 min-w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:text-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            aria-expanded={showHint}
            aria-controls={hintId}
            aria-label={`Toggle hint for ${label}`}
          >
            <HelpCircle className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {showHint && hint && (
        <p
          id={hintId}
          className="rounded-lg border-l-2 border-emerald-400 bg-emerald-50 px-3 py-2 text-xs text-gray-600 dark:bg-emerald-900/20 dark:text-gray-300"
        >
          {hint}
        </p>
      )}

      <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5 transition-all focus-within:border-transparent focus-within:ring-2 focus-within:ring-emerald-400 dark:border-gray-700 dark:bg-gray-800">
        <span className="text-sm font-medium text-gray-400 dark:text-gray-500">{prefix}</span>
        <input
          id={inputId}
          type={type}
          min="0"
          step="any"
          value={value}
          onChange={(event) => onChange(event.target.value === '' ? '' : parseFloat(event.target.value) || 0)}
          className="min-w-0 flex-1 bg-transparent text-sm text-gray-900 outline-none dark:text-gray-100"
          placeholder="0"
        />
      </div>
    </div>
  );
}

function Section({ title, icon, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  const contentId = useId();

  return (
    <section className="worship-surface overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex min-h-11 w-full items-center justify-between px-4 py-3.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
        aria-expanded={open}
        aria-controls={contentId}
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-100">
          <span>{icon}</span>
          {title}
        </span>
        {open
          ? <ChevronUp className="h-4 w-4 text-gray-400" aria-hidden="true" />
          : <ChevronDown className="h-4 w-4 text-gray-400" aria-hidden="true" />}
      </button>
      {open && <div id={contentId} className="space-y-3.5 border-t border-emerald-100 px-4 pb-4 pt-3.5 dark:border-gray-700">{children}</div>}
    </section>
  );
}

export default function ZakatCalculator() {
  const [goldPrice, setGoldPrice] = useState(DEFAULT_GOLD_GYD_PER_GRAM);
  const [silverPrice, setSilverPrice] = useState(DEFAULT_SILVER_GYD_PER_GRAM);
  const [nisabMethod, setNisabMethod] = useState('gold');

  const [cash, setCash] = useState('');
  const [goldGrams, setGoldGrams] = useState('');
  const [silverGrams, setSilverGrams] = useState('');
  const [business, setBusiness] = useState('');
  const [investments, setInvestments] = useState('');
  const [receivables, setReceivables] = useState('');
  const [debts, setDebts] = useState('');

  const results = useMemo(() => {
    const g = Number(goldGrams) || 0;
    const s = Number(silverGrams) || 0;
    const gp = Number(goldPrice) || DEFAULT_GOLD_GYD_PER_GRAM;
    const sp = Number(silverPrice) || DEFAULT_SILVER_GYD_PER_GRAM;

    const goldValue = g * gp;
    const silverValue = s * sp;
    const cashValue = Number(cash) || 0;
    const businessValue = Number(business) || 0;
    const investmentsValue = Number(investments) || 0;
    const receivablesValue = Number(receivables) || 0;
    const debtValue = Number(debts) || 0;

    const totalAssets = cashValue + goldValue + silverValue + businessValue + investmentsValue + receivablesValue;
    const netWealth = Math.max(0, totalAssets - debtValue);

    const nisabGold = NISAB_GOLD_GRAMS * gp;
    const nisabSilver = NISAB_SILVER_GRAMS * sp;
    const nisabValue = nisabMethod === 'gold' ? nisabGold : nisabSilver;

    const nisabMet = netWealth >= nisabValue;
    const zakatDue = nisabMet ? netWealth * ZAKAT_RATE : 0;

    return {
      goldValue,
      silverValue,
      totalAssets,
      netWealth,
      nisabGold,
      nisabSilver,
      nisabValue,
      nisabMet,
      zakatDue,
      breakdown: { debtValue },
    };
  }, [business, cash, debts, goldGrams, goldPrice, investments, nisabMethod, receivables, silverGrams, silverPrice]);

  const reset = () => {
    setCash('');
    setGoldGrams('');
    setSilverGrams('');
    setBusiness('');
    setInvestments('');
    setReceivables('');
    setDebts('');
  };

  return (
    <div className="min-h-screen worship-canvas pb-24 page-enter">
      <header className="sticky top-0 z-20 px-4 pt-safe pb-3">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-700 via-emerald-800 to-emerald-950 text-white shadow-xl">
          <div className="absolute inset-0 islamic-pattern opacity-35" aria-hidden="true" />
          <div className="relative px-5 py-5">
            <div className="flex items-center gap-3">
              <Link
                to="/ramadan"
                className="-ml-2 rounded-full bg-white/10 p-2 transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
                aria-label="Back to home"
              >
                <ChevronLeft className="h-5 w-5" />
              </Link>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl font-bold font-display">Zakat Calculator</h1>
                <p className="text-xs text-emerald-100/85">2.5% on net wealth above Nisab</p>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs text-white/90">
              All amounts in Guyanese Dollars (GYD). This tool gives an estimate only.
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl space-y-3 px-4">
        <section className="worship-surface p-4">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">Nisab method</p>
          <div className="mt-2 grid grid-cols-2 gap-2" role="tablist" aria-label="Choose Nisab method">
            {[
              { key: 'gold', label: 'Gold (85g)', desc: `≈ ${fmt(85 * (Number(goldPrice) || DEFAULT_GOLD_GYD_PER_GRAM))}` },
              { key: 'silver', label: 'Silver (595g)', desc: `≈ ${fmt(595 * (Number(silverPrice) || DEFAULT_SILVER_GYD_PER_GRAM))}` },
            ].map((method) => (
              <button
                key={method.key}
                type="button"
                onClick={() => setNisabMethod(method.key)}
                className={`min-h-11 rounded-xl border-2 p-3 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                  nisabMethod === method.key
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30'
                    : 'border-gray-200 bg-white hover:border-emerald-300 dark:border-gray-700 dark:bg-gray-900/70'
                }`}
                role="tab"
                aria-selected={nisabMethod === method.key}
              >
                <p className={`text-xs font-semibold ${nisabMethod === method.key ? 'text-emerald-700 dark:text-emerald-300' : 'text-gray-700 dark:text-gray-300'}`}>
                  {method.label}
                </p>
                <p className={`mt-0.5 text-[10px] ${nisabMethod === method.key ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'}`}>
                  {method.desc}
                </p>
              </button>
            ))}
          </div>
        </section>

        <Section title="Current Market Prices" icon="📈" defaultOpen={false}>
          <p className="-mt-1 text-xs text-gray-500 dark:text-gray-400">Update with today&apos;s prices for more accurate Nisab values.</p>
          <Field
            label="Gold (GYD per gram)"
            value={goldPrice}
            onChange={setGoldPrice}
            hint="Gold is often around GYD 7,500 to 8,500 per gram in recent local pricing ranges."
          />
          <Field
            label="Silver (GYD per gram)"
            value={silverPrice}
            onChange={setSilverPrice}
            hint="Silver is often around GYD 85 to 105 per gram in recent local pricing ranges."
          />
        </Section>

        <Section title="Cash & Savings" icon="💵">
          <Field
            label="Cash, bank accounts, and savings"
            value={cash}
            onChange={setCash}
            hint="Include liquid cash and account balances held for a full lunar year (hawl)."
          />
        </Section>

        <Section title="Gold & Silver" icon="⚖️">
          <Field
            label="Gold owned"
            prefix="g"
            value={goldGrams}
            onChange={setGoldGrams}
            hint="Include bars, coins, and applicable jewellery based on your scholarly opinion."
          />
          <Field
            label="Silver owned"
            prefix="g"
            value={silverGrams}
            onChange={setSilverGrams}
            hint="Include silver jewellery, coins, and other silver holdings."
          />
          {(Number(goldGrams) > 0 || Number(silverGrams) > 0) && (
            <div className="rounded-lg bg-gray-50 p-2.5 text-xs dark:bg-gray-800">
              {Number(goldGrams) > 0 && <p className="text-gray-600 dark:text-gray-300">Gold value: <span className="font-semibold text-emerald-700 dark:text-emerald-300">{fmt(results.goldValue)}</span></p>}
              {Number(silverGrams) > 0 && <p className="text-gray-600 dark:text-gray-300">Silver value: <span className="font-semibold text-emerald-700 dark:text-emerald-300">{fmt(results.silverValue)}</span></p>}
            </div>
          )}
        </Section>

        <Section title="Business & Investments" icon="🏢" defaultOpen={false}>
          <Field
            label="Business inventory and stock"
            value={business}
            onChange={setBusiness}
            hint="Use the market value of goods intended for sale. Exclude fixed assets used by the business."
          />
          <Field
            label="Investments and shares"
            value={investments}
            onChange={setInvestments}
            hint="Use current market value of zakatable investments."
          />
          <Field
            label="Money owed to you (receivables)"
            value={receivables}
            onChange={setReceivables}
            hint="Include amounts likely to be repaid."
          />
        </Section>

        <Section title="Liabilities / Debts" icon="📋" defaultOpen={false}>
          <Field
            label="Short-term debts you owe"
            value={debts}
            onChange={setDebts}
            hint="Deduct liabilities due within the year such as near-term loans, cards, and bills."
          />
        </Section>

        <section className={`worship-surface border-2 p-5 ${results.nisabMet ? 'border-emerald-400 dark:border-emerald-600' : 'border-gray-200 dark:border-gray-700'}`}>
          <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100">Zakat summary</h2>
          <div className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between text-gray-600 dark:text-gray-300"><span>Total assets</span><span className="font-semibold">{fmt(results.totalAssets)}</span></div>
            <div className="flex justify-between text-gray-600 dark:text-gray-300"><span>Less debts</span><span className="font-semibold text-red-500">- {fmt(results.breakdown.debtValue)}</span></div>
            <div className="flex justify-between border-t border-gray-200 pt-2 font-bold text-gray-800 dark:border-gray-700 dark:text-gray-100"><span>Net wealth</span><span>{fmt(results.netWealth)}</span></div>
            <div className="flex justify-between text-gray-600 dark:text-gray-300"><span>Nisab ({nisabMethod === 'gold' ? 'gold' : 'silver'})</span><span className="font-semibold">{fmt(results.nisabValue)}</span></div>
          </div>

          <div className={`mt-4 rounded-xl p-4 text-center ${results.nisabMet ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'}`}>
            {results.nisabMet ? (
              <>
                <p className="text-xs font-medium opacity-80">Zakat due (2.5%)</p>
                <p className="text-3xl font-bold">{fmt(results.zakatDue)}</p>
                <p className="text-xs opacity-75">May Allah accept your Zakat.</p>
              </>
            ) : (
              <>
                <p className="text-sm font-semibold">Nisab not reached</p>
                <p className="text-xs">
                  {results.netWealth > 0
                    ? `${fmt(results.nisabValue - results.netWealth)} below threshold`
                    : 'Enter your wealth details above'}
                </p>
              </>
            )}
          </div>

          <p className="mt-3 text-center text-[10px] text-gray-500 dark:text-gray-400">
            This is an estimate. Consult a qualified scholar for personal rulings.
          </p>
        </section>

        <button
          type="button"
          onClick={reset}
          className="w-full min-h-11 rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-600 transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          <span className="inline-flex items-center gap-2">
            <RotateCcw className="h-4 w-4" />
            Reset calculator
          </span>
        </button>
      </main>
    </div>
  );
}
