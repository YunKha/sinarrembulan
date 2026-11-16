"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { supabase } from "@/lib/supabase/public";

// ---------- Status form (pengganti toast SweetAlert) ----------
type Status = { type: "idle" | "loading" | "success" | "error"; message?: string };

function Notice({ status }: { status: Status }) {
  if (status.type !== "success" && status.type !== "error") return null;
  const ok = status.type === "success";
  return (
    <p role="status" className={`mt-4 rounded-xl px-4 py-3 text-sm border ${
      ok ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-red-500/10 border-red-500/20 text-red-400"
    }`}>
      {status.message}
    </p>
  );
}

// FormData -> objek; string kosong jadi null agar kolom opsional tetap NULL di DB.
function fields(form: HTMLFormElement, names: string[]) {
  const fd = new FormData(form);
  return Object.fromEntries(names.map((n) => [n, String(fd.get(n) ?? "").trim() || null]));
}

function useSubmit(run: (form: HTMLFormElement) => Promise<string>) {
  const [status, setStatus] = useState<Status>({ type: "idle" });
  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    setStatus({ type: "loading" });
    try {
      setStatus({ type: "success", message: await run(form) });
      form.reset();
    } catch (err) {
      setStatus({ type: "error", message: err instanceof Error ? err.message : "Terjadi kesalahan. Coba lagi." });
    }
  };
  return { status, onSubmit, loading: status.type === "loading" };
}

const GENERIC_ERROR = "Gagal mengirim. Periksa isian Anda lalu coba lagi.";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-gray-400 text-sm mb-1 block">{label}</span>
      {children}
    </label>
  );
}

// ---------- Newsletter (footer) ----------
export function NewsletterForm() {
  const { status, onSubmit, loading } = useSubmit(async (form) => {
    const { email } = fields(form, ["email"]);
    const { error } = await supabase.from("newsletter_subscribers").insert({ email: email?.toLowerCase() });
    if (error?.code === "23505") throw new Error("Email ini sudah terdaftar.");
    if (error) throw new Error(GENERIC_ERROR);
    return "Terima kasih telah berlangganan newsletter kami!";
  });
  return (
    <div className="w-full lg:w-auto">
      <form onSubmit={onSubmit} className="flex w-full gap-3">
        <input type="email" name="email" required maxLength={255} placeholder="Enter your email" aria-label="Email"
          className="flex-1 min-w-0 lg:w-80 px-5 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-cyan-500/20 focus:ring-2 transition-all" />
        <button type="submit" disabled={loading} className="btn-primary px-6! whitespace-nowrap">
          {loading ? "..." : "Subscribe"}
        </button>
      </form>
      <Notice status={status} />
    </div>
  );
}

// ---------- Kontak ----------
export function ContactForm() {
  const { status, onSubmit, loading } = useSubmit(async (form) => {
    const data = fields(form, ["name", "email", "phone", "company", "subject", "message"]);
    const { error } = await supabase.from("contact_messages").insert(data);
    if (error) throw new Error(GENERIC_ERROR);
    return "Pesan Anda berhasil dikirim! Kami akan membalas segera.";
  });
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Name *"><input name="name" required maxLength={255} autoComplete="name" className="input" /></Field>
        <Field label="Email *"><input type="email" name="email" required maxLength={255} autoComplete="email" className="input" /></Field>
        <Field label="Phone"><input type="tel" name="phone" maxLength={20} autoComplete="tel" className="input" /></Field>
        <Field label="Company"><input name="company" maxLength={255} autoComplete="organization" className="input" /></Field>
      </div>
      <Field label="Subject *"><input name="subject" required maxLength={255} className="input" /></Field>
      <Field label="Message *"><textarea name="message" required maxLength={5000} rows={5} className="input" /></Field>
      <button type="submit" disabled={loading} className="btn-primary">{loading ? "Mengirim..." : "Send Message"}</button>
      <Notice status={status} />
    </form>
  );
}

// ---------- Lamaran kerja ----------
// CV di-upload langsung dari browser ke Supabase Storage (bucket privat 'cv'), sehingga file 5 MB
// tidak melewati server Next.js (batas body request Vercel 4.5 MB). Bucket menolak tipe/ukuran lain.
const CV_EXT = ["pdf", "doc", "docx"];

export function ApplyForm({ careerId }: { careerId: number }) {
  const { status, onSubmit, loading } = useSubmit(async (form) => {
    const file = (form.elements.namedItem("cv_file") as HTMLInputElement).files?.[0];
    const ext = file?.name.split(".").pop()?.toLowerCase() ?? "";
    if (!file || !CV_EXT.includes(ext)) throw new Error("CV harus berupa file PDF, DOC, atau DOCX.");
    if (file.size > 5 * 1024 * 1024) throw new Error("Ukuran CV maksimal 5 MB.");

    const path = `${careerId}/${crypto.randomUUID()}.${ext}`;
    const upload = await supabase.storage.from("cv").upload(path, file, { contentType: file.type });
    if (upload.error) throw new Error("Upload CV gagal. Coba lagi.");

    const data = fields(form, ["name", "email", "phone", "cover_letter", "linkedin_url", "portfolio_url"]);
    const { error } = await supabase.from("career_applications").insert({ ...data, career_id: careerId, cv_file: path });
    if (error) throw new Error(GENERIC_ERROR);
    return "Lamaran Anda berhasil dikirim! Kami akan menghubungi Anda segera.";
  });
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Full Name *"><input name="name" required maxLength={255} autoComplete="name" className="input" /></Field>
        <Field label="Email *"><input type="email" name="email" required maxLength={255} autoComplete="email" className="input" /></Field>
        <Field label="Phone *"><input type="tel" name="phone" required maxLength={20} autoComplete="tel" className="input" /></Field>
        <Field label="CV (PDF/DOC, maks. 5 MB) *">
          <input type="file" name="cv_file" required accept=".pdf,.doc,.docx"
            className="input py-2! file:mr-4 file:bg-cyan-500/20 file:text-cyan-400 file:border-0 file:rounded-lg file:px-4 file:py-2 file:cursor-pointer" />
        </Field>
        <Field label="LinkedIn URL"><input type="url" name="linkedin_url" maxLength={255} placeholder="https://linkedin.com/in/..." className="input" /></Field>
        <Field label="Portfolio URL"><input type="url" name="portfolio_url" maxLength={255} placeholder="https://..." className="input" /></Field>
      </div>
      <Field label="Cover Letter"><textarea name="cover_letter" maxLength={2000} rows={4} className="input" /></Field>
      <button type="submit" disabled={loading} className="btn-primary">{loading ? "Mengirim..." : "Submit Application"}</button>
      <Notice status={status} />
    </form>
  );
}

// ---------- Angka statistik yang menghitung naik saat terlihat ----------
// Server merender angka akhir (terbaca mesin pencari & tanpa JS); animasi hanya di browser.
export function Counter({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(value);

  useEffect(() => {
    const el = ref.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setShown(0);
    let frame = 0;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / 2000);
        setShown(Math.round(value * (1 - Math.pow(1 - t, 3))));
        if (t < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    }, { threshold: 0.5 });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(frame); };
  }, [value]);

  return <span ref={ref}>{shown}</span>;
}

// ---------- Penambah views blog ----------
// Halaman blog di-cache, jadi views dihitung dari browser (sekali per sesi per artikel).
export function ViewTracker({ blogId }: { blogId: number }) {
  useEffect(() => {
    const key = `viewed-blog-${blogId}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch { /* storage diblokir: tetap hitung */ }
    // Builder Supabase bersifat lazy: request baru dikirim saat .then() dipanggil.
    supabase.rpc("increment_blog_views", { blog_id: blogId }).then(() => {});
  }, [blogId]);
  return null;
}
