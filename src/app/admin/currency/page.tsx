"use client";

import { useLocalState } from "@/lib/useLocalState";
import { Card, Field, PageHead, SaveBar } from "../AdminUI";

type CurrencySettings = {
  defaultCurrency: "USD" | "MXN" | "EUR";
  rateUSD: number;
  rateEUR: number;
};

const DEFAULT: CurrencySettings = { defaultCurrency: "USD", rateUSD: 17, rateEUR: 19.5 };

export default function CurrencyAdmin() {
  const { value, setValue, save, savedAt } = useLocalState<CurrencySettings>("admin_currency", DEFAULT);

  return (
    <>
      <PageHead
        eyebrow="Commerce"
        title="Currency & Rates"
        desc="All prices are stored in Mexican Pesos (MXN). These rates convert MXN into the currency a visitor selects. Set how many pesos equal one unit of each currency."
      />

      <div className="space-y-5">
        <Card title="Default display currency">
          <p className="mb-3 text-[13px] text-sage">The currency shown to first-time visitors.</p>
          <div className="flex gap-2">
            {(["USD", "MXN", "EUR"] as const).map((c) => (
              <button
                key={c}
                onClick={() => setValue({ ...value, defaultCurrency: c })}
                className={`rounded-full border-[1.5px] px-5 py-2 text-[13px] font-semibold transition ${
                  value.defaultCurrency === c
                    ? "border-forest bg-forest text-white"
                    : "border-sand bg-white text-sage hover:border-forest"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </Card>

        <Card title="Conversion rates" desc="How many MXN equal 1 unit of the currency.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="1 USD ="
              type="number"
              value={value.rateUSD}
              suffix="MXN"
              onChange={(v) => setValue({ ...value, rateUSD: Number(v) || 0 })}
            />
            <Field
              label="1 EUR ="
              type="number"
              value={value.rateEUR}
              suffix="MXN"
              onChange={(v) => setValue({ ...value, rateEUR: Number(v) || 0 })}
            />
          </div>
          <p className="mt-3 text-[12px] text-sage">
            Example: a $4,600 MXN package shows as{" "}
            <strong className="text-ink">
              ${value.rateUSD ? Math.round(4600 / value.rateUSD).toLocaleString() : "—"} USD
            </strong>{" "}
            /{" "}
            <strong className="text-ink">
              €{value.rateEUR ? Math.round(4600 / value.rateEUR).toLocaleString() : "—"} EUR
            </strong>
            .
          </p>
        </Card>
      </div>

      <SaveBar onSave={save} savedAt={savedAt} />
    </>
  );
}
