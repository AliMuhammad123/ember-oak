"use client";

import { useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CalendarCheck, Clock, Loader2, MapPin, Phone } from "lucide-react";
import { hours } from "@/lib/data";
import { Reveal, SectionHeading, ease } from "./motion";

type Fields = { name: string; email: string; phone: string; date: string; time: string; guests: string; notes: string };
type Errors = Partial<Record<keyof Fields, string>>;

const times = ["17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30"];
const empty: Fields = { name: "", email: "", phone: "", date: "", time: "19:00", guests: "2", notes: "" };

function validate(f: Fields): Errors {
  const e: Errors = {};
  if (!f.name.trim()) e.name = "Please enter the name for the booking.";
  if (!f.email.trim()) e.email = "Please enter an email so we can confirm.";
  else if (!/^\S+@\S+\.\S+$/.test(f.email)) e.email = "That email doesn't look right — check for a typo.";
  if (f.phone && !/^[+\d][\d\s()-]{6,}$/.test(f.phone)) e.phone = "Use digits only, e.g. +1 555 010 2030.";
  if (!f.date) e.date = "Pick the date you'd like to visit.";
  else if (f.date < today()) e.date = "That date has passed — please choose an upcoming day.";
  else if (new Date(f.date + "T12:00").getDay() === 1) e.date = "We're closed on Mondays — please choose another day.";
  return e;
}

const today = () => new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD in local time

// Set on the client only, so server and client HTML match.
const setMinToToday = (el: HTMLInputElement | null) => {
  if (el) el.min = today();
};

export function Reservation() {
  const [fields, setFields] = useState<Fields>(empty);
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof Fields, boolean>>>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "done">("idle");
  const formRef = useRef<HTMLFormElement>(null);

  const set = (key: keyof Fields) => (e: { target: { value: string } }) => {
    const next = { ...fields, [key]: e.target.value };
    setFields(next);
    if (touched[key]) setErrors(validate(next));
  };

  const blur = (key: keyof Fields) => () => {
    setTouched((t) => ({ ...t, [key]: true }));
    setErrors(validate(fields));
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const found = validate(fields);
    setErrors(found);
    setTouched({ name: true, email: true, phone: true, date: true });
    const first = Object.keys(found)[0];
    if (first) {
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    setStatus("submitting");
    // Replace with a real booking API call.
    await new Promise((r) => setTimeout(r, 1200));
    setStatus("done");
  };

  const err = (key: keyof Fields) => (touched[key] ? errors[key] : undefined);

  const fieldProps = (key: keyof Fields) => ({
    id: key,
    name: key,
    value: fields[key],
    onChange: set(key),
    onBlur: blur(key),
    "aria-invalid": err(key) ? true : undefined,
    "aria-describedby": err(key) ? `${key}-error` : undefined,
    className: "field",
  });

  const errorText = (k: keyof Fields) =>
    err(k) ? (
      <p id={`${k}-error`} role="alert" className="mt-2 text-sm text-red-300">
        {err(k)}
      </p>
    ) : null;

  return (
    <section id="reserve" className="mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-36">
      <div className="grid gap-14 lg:grid-cols-5 lg:gap-20">
        <div className="lg:col-span-2">
          <SectionHeading eyebrow="Reservations" title="Save your seat by the fire.">
            Book up to 60 days ahead. For groups of 9 or more, or to hire the terrace, give us a call.
          </SectionHeading>

          <Reveal delay={0.1} className="mt-10 space-y-8">
            <div>
              <h3 className="flex items-center gap-2 font-semibold">
                <Clock aria-hidden className="size-4 text-gold" /> Opening hours
              </h3>
              <dl className="mt-4 space-y-2 text-stone">
                {hours.map((h) => (
                  <div key={h.days} className="flex justify-between gap-6 border-b border-line pb-2">
                    <dt>{h.days}</dt>
                    <dd className="tabular-nums text-cream">{h.time}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <p className="flex items-start gap-2 text-stone">
              <MapPin aria-hidden className="mt-1 size-4 shrink-0 text-gold" />
              48 Harbour Lane, Old Town
            </p>
            <p className="flex items-center gap-2 text-stone">
              <Phone aria-hidden className="size-4 text-gold" />
              <a href="tel:+15550102030" className="underline-offset-4 hover:text-cream hover:underline">
                +1 (555) 010-2030
              </a>
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.15} className="lg:col-span-3">
          <div className="relative overflow-hidden rounded-3xl border border-line bg-char p-6 sm:p-10">
            <div aria-live="polite">
              <AnimatePresence mode="wait" initial={false}>
                {status === "done" ? (
                  <motion.div
                    key="done"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, ease }}
                    className="flex min-h-[420px] flex-col items-center justify-center text-center"
                  >
                    <motion.div
                      initial={{ scale: 0, rotate: -20 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.1 }}
                      className="flex size-16 items-center justify-center rounded-full bg-ember/15"
                    >
                      <CalendarCheck aria-hidden className="size-8 text-ember" />
                    </motion.div>
                    <h3 className="mt-6 font-display text-3xl">Table requested</h3>
                    <p className="mt-3 max-w-sm text-stone">
                      Thanks, {fields.name.split(" ")[0]}. We&rsquo;ve noted {fields.guests}{" "}
                      {fields.guests === "1" ? "guest" : "guests"} on {fields.date} at {fields.time}, and
                      we&rsquo;ll confirm by email within the hour.
                    </p>
                    <button
                      type="button"
                      className="btn btn-ghost mt-8"
                      onClick={() => {
                        setFields(empty);
                        setTouched({});
                        setErrors({});
                        setStatus("idle");
                      }}
                    >
                      Make another booking
                    </button>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    ref={formRef}
                    onSubmit={onSubmit}
                    noValidate
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.15 } }}
                    className="grid gap-5 sm:grid-cols-2"
                  >
                    <div className="sm:col-span-2">
                      <label htmlFor="name" className="mb-2 block text-sm font-medium">
                        Full name <span aria-hidden className="text-ember">*</span>
                      </label>
                      <input {...fieldProps("name")} autoComplete="name" required />
                      {errorText("name")}
                    </div>
                    <div>
                      <label htmlFor="email" className="mb-2 block text-sm font-medium">
                        Email <span aria-hidden className="text-ember">*</span>
                      </label>
                      <input {...fieldProps("email")} type="email" autoComplete="email" inputMode="email" required />
                      {errorText("email")}
                    </div>
                    <div>
                      <label htmlFor="phone" className="mb-2 block text-sm font-medium">
                        Phone <span className="text-stone">(optional)</span>
                      </label>
                      <input {...fieldProps("phone")} type="tel" autoComplete="tel" inputMode="tel" />
                      {errorText("phone")}
                    </div>
                    <div>
                      <label htmlFor="date" className="mb-2 block text-sm font-medium">
                        Date <span aria-hidden className="text-ember">*</span>
                      </label>
                      <input {...fieldProps("date")} type="date" ref={setMinToToday} required />
                      {errorText("date")}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="time" className="mb-2 block text-sm font-medium">
                          Time
                        </label>
                        <select {...fieldProps("time")}>
                          {times.map((t) => (
                            <option key={t}>{t}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label htmlFor="guests" className="mb-2 block text-sm font-medium">
                          Guests
                        </label>
                        <select {...fieldProps("guests")}>
                          {Array.from({ length: 8 }, (_, i) => String(i + 1)).map((g) => (
                            <option key={g}>{g}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="notes" className="mb-2 block text-sm font-medium">
                        Anything we should know? <span className="text-stone">(optional)</span>
                      </label>
                      <textarea {...fieldProps("notes")} rows={3} placeholder="Allergies, celebrations, high chair…" />
                    </div>
                    <div className="flex flex-col gap-4 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm text-stone">
                        <span aria-hidden className="text-ember">*</span> Required
                      </p>
                      <button type="submit" className="btn btn-primary sm:min-w-48" disabled={status === "submitting"}>
                        {status === "submitting" ? (
                          <>
                            <Loader2 aria-hidden className="size-4 animate-spin" /> Booking…
                          </>
                        ) : (
                          "Request table"
                        )}
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
