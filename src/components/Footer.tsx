import { Flame } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-line bg-char">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 md:grid-cols-4 md:px-8">
        <div className="md:col-span-2">
          <a href="#top" className="flex items-center gap-2 font-display text-2xl">
            <Flame aria-hidden className="size-5 text-ember" />
            Ember &amp; Oak
          </a>
          <p className="mt-4 max-w-sm text-stone">
            A wood-fired kitchen serving seasonal, local food since 2014.
          </p>
        </div>
        <div>
          <h2 className="eyebrow">Visit</h2>
          <address className="mt-4 not-italic text-stone">
            48 Harbour Lane
            <br />
            Old Town
            <br />
            <a href="mailto:hello@emberandoak.example" className="hover:text-cream">
              hello@emberandoak.example
            </a>
          </address>
        </div>
        <div>
          <h2 className="eyebrow">Follow</h2>
          <ul className="mt-4 space-y-2 text-stone">
            {["Instagram", "TikTok", "Google Maps"].map((s) => (
              <li key={s}>
                <a href="#" className="hover:text-cream">
                  {s}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-line">
        <p className="mx-auto max-w-7xl px-5 py-6 text-sm text-stone md:px-8">
          © 2026 Ember &amp; Oak. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
