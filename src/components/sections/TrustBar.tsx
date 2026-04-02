export default function TrustBar() {
  const pillars = [
    { label: 'Free Returns',        detail: '30-day hassle-free'   },
    { label: 'Secure Payment',      detail: 'SSL encrypted checkout'},
    { label: 'Fast Delivery',       detail: '2–5 business days'    },
    { label: 'Quality Guarantee',   detail: 'Curated & inspected'  },
  ];

  return (
    <div className="border-y border-border bg-stone">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 divide-x divide-border lg:grid-cols-4">
          {pillars.map((p) => (
            <div key={p.label} className="flex flex-col items-center py-6 px-4 text-center">
              <span className="text-xs font-medium tracking-widest uppercase text-ink">{p.label}</span>
              <span className="mt-1 text-xs text-mist">{p.detail}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
