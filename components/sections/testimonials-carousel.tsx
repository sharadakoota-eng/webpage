"use client";

import { useEffect, useState } from "react";

type Testimonial = {
  quote: string;
  parent: string;
  child: string;
};

export function TestimonialsCarousel({ items }: { items: Testimonial[] }) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % items.length);
    }, 4200);

    return () => window.clearInterval(interval);
  }, [items.length]);

  return (
    <div className="mt-8 space-y-4">
      <div className="overflow-hidden rounded-[1.8rem]">
        <div
          className="flex transition-transform duration-700 ease-out"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {items.map((item) => (
            <div key={`${item.parent}-${item.child}`} className="min-w-full">
              <div className="rounded-[1.6rem] border border-navy/10 bg-cream p-6 shadow-card">
                <p className="text-base leading-8 text-navy/80">"{item.quote}"</p>
                <p className="mt-4 text-sm font-semibold text-gold">{item.parent}</p>
                <p className="text-sm text-navy/55">{item.child}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {items.map((item, index) => (
            <button
              key={`${item.parent}-dot`}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`View testimonial ${index + 1}`}
              className={`h-2.5 rounded-full transition-all ${activeIndex === index ? "w-8 bg-gold" : "w-2.5 bg-navy/20"}`}
            />
          ))}
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setActiveIndex((current) => (current - 1 + items.length) % items.length)}
            className="rounded-full border border-navy/10 bg-white px-4 py-2 text-sm font-semibold text-navy transition hover:border-gold/40"
          >
            Prev
          </button>
          <button
            type="button"
            onClick={() => setActiveIndex((current) => (current + 1) % items.length)}
            className="rounded-full border border-navy/10 bg-white px-4 py-2 text-sm font-semibold text-navy transition hover:border-gold/40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
