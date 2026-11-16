"use client";

/* eslint-disable @next/next/no-img-element -- preview upload admin: <img> biasa cukup, tidak perlu optimasi. */
import { Fragment, useRef, useState, useTransition, type FormEvent, type ReactNode } from "react";
import { createClient } from "@/lib/supabase/browser";
import { mediaUrl } from "@/lib/site";
import type { Field } from "./resources";
import type { Result } from "./actions";

export function Alert({ tone, children }: { tone: "ok" | "error"; children: ReactNode }) {
  return (
    <div role="status" className={`px-4 py-3 rounded-xl text-sm border ${
      tone === "ok" ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-red-500/10 border-red-500/20 text-red-400"
    }`}>{children}</div>
  );
}

// Form yang memanggil server action tanpa mereset isian saat gagal validasi
// (form action bawaan React 19 mengosongkan form setelah submit).
export function ActionForm({ action, children, className, resetOnSuccess }: {
  action: (fd: FormData) => Promise<Result>; children: ReactNode; className?: string; resetOnSuccess?: boolean;
}) {
  const [state, setState] = useState<Result>();
  const [pending, start] = useTransition();
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (form.querySelector("[data-uploading]")) return setState({ error: "Tunggu upload gambar selesai." });
    const fd = new FormData(form);
    start(async () => {
      const res = await action(fd);
      setState(res);
      if (res?.ok && resetOnSuccess) form.reset();
    });
  };
  return (
    <form onSubmit={onSubmit} className={className} aria-busy={pending}>
      <fieldset disabled={pending} className="contents">{children}</fieldset>
      {state?.error && <div className="mt-4"><Alert tone="error">{state.error}</Alert></div>}
      {state?.ok && <div className="mt-4"><Alert tone="ok">{state.ok}</Alert></div>}
    </form>
  );
}

// ---------- Upload gambar langsung ke Supabase Storage (bucket 'media') ----------
const MAX_IMAGE = 2 * 1024 * 1024;

async function uploadImage(file: File, folder: string) {
  if (!file.type.startsWith("image/")) throw new Error("File harus berupa gambar.");
  if (file.size > MAX_IMAGE) throw new Error("Ukuran gambar maksimal 2 MB.");
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await createClient().storage.from("media").upload(path, file, { contentType: file.type });
  if (error) throw new Error(`Upload gagal: ${error.message}`);
  return path;
}

const fileClass =
  "max-w-full text-sm text-gray-400 file:mr-3 file:bg-cyan-500/20 file:text-cyan-400 file:border-0 file:rounded-lg file:px-4 file:py-2 file:cursor-pointer";

function ImageField({ field, value }: { field: Field; value: string | null }) {
  const [path, setPath] = useState(value ?? "");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const url = mediaUrl(path);

  const onPick = async (file?: File) => {
    if (!file) return;
    setBusy(true); setErr("");
    try { setPath(await uploadImage(file, field.folder ?? "uploads")); }
    catch (e) { setErr((e as Error).message); }
    finally { setBusy(false); if (input.current) input.current.value = ""; }
  };

  return (
    <div className="flex flex-wrap items-start gap-4">
      <input type="hidden" name={field.name} value={path} />
      {busy && <span data-uploading hidden />}
      <div className="w-28 h-20 shrink-0 rounded-xl bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center">
        {url ? <img src={url} alt="" className="w-full h-full object-cover" /> : <span className="text-gray-600 text-xs">No image</span>}
      </div>
      <div className="space-y-2 min-w-0">
        <input ref={input} type="file" accept="image/*" onChange={(e) => onPick(e.target.files?.[0])} className={fileClass} />
        <div className="flex gap-3 text-xs">
          {busy && <span className="text-cyan-400">Mengupload...</span>}
          {path && !busy && <button type="button" onClick={() => setPath("")} className="text-red-400 hover:text-red-300">Hapus gambar</button>}
        </div>
        {err && <p className="text-red-400 text-xs">{err}</p>}
      </div>
    </div>
  );
}

function GalleryField({ field, images }: { field: Field; images: { id: number; image: string }[] }) {
  const [added, setAdded] = useState<string[]>([]);
  const [removed, setRemoved] = useState<number[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const onPick = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true); setErr("");
    try {
      const paths = await Promise.all([...files].map((f) => uploadImage(f, field.folder ?? "gallery")));
      setAdded((a) => [...a, ...paths]);
    } catch (e) { setErr((e as Error).message); }
    finally { setBusy(false); }
  };

  const Thumb = ({ src, onRemove, faded }: { src: string; onRemove: () => void; faded?: boolean }) => (
    <div className={`relative w-28 h-20 rounded-xl overflow-hidden border border-white/10 ${faded ? "opacity-30" : ""}`}>
      <img src={mediaUrl(src)!} alt="" className="w-full h-full object-cover" />
      <button type="button" onClick={onRemove} aria-label="Hapus"
        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/70 text-white text-xs hover:bg-red-500">×</button>
    </div>
  );

  return (
    <div className="space-y-3">
      {busy && <span data-uploading hidden />}
      {added.map((p) => <input key={p} type="hidden" name="gallery" value={p} />)}
      {removed.map((id) => <input key={id} type="hidden" name="gallery_remove" value={id} />)}
      <div className="flex flex-wrap gap-3">
        {images.map((img) => (
          <Thumb key={img.id} src={img.image} faded={removed.includes(img.id)}
            onRemove={() => setRemoved((r) => (r.includes(img.id) ? r.filter((x) => x !== img.id) : [...r, img.id]))} />
        ))}
        {added.map((p) => <Thumb key={p} src={p} onRemove={() => setAdded((a) => a.filter((x) => x !== p))} />)}
      </div>
      <input type="file" accept="image/*" multiple onChange={(e) => { onPick(e.target.files); e.target.value = ""; }} className={fileClass} />
      {busy && <p className="text-cyan-400 text-xs">Mengupload...</p>}
      {err && <p className="text-red-400 text-xs">{err}</p>}
      {removed.length > 0 && <p className="text-yellow-400 text-xs">{removed.length} gambar akan dihapus saat disimpan (klik × lagi untuk batal).</p>}
    </div>
  );
}

// ---------- Satu field form sesuai tipenya ----------
type Value = string | number | boolean | string[] | null | undefined;

function asText(v: Value, sep = ", ") {
  if (Array.isArray(v)) return v.join(sep);
  return v == null ? "" : String(v);
}

function FieldInput({ field: f, value, options, gallery }: {
  field: Field; value: Value; options?: [string, string][]; gallery?: { id: number; image: string }[];
}) {
  const common = { name: f.name, required: f.required, maxLength: f.max, placeholder: f.placeholder, className: "input", id: f.name };
  switch (f.type) {
    case "textarea": return <textarea {...common} rows={4} defaultValue={asText(value)} />;
    case "html": return <textarea {...common} rows={14} defaultValue={asText(value)} className="input font-mono text-sm" />;
    case "list": return f.sep === "\n"
      ? <textarea {...common} rows={4} defaultValue={asText(value, "\n")} maxLength={undefined} />
      : <input {...common} defaultValue={asText(value)} maxLength={undefined} />;
    case "number": return <input {...common} type="number" defaultValue={asText(value)} />;
    case "url": return <input {...common} type="url" defaultValue={asText(value)} />;
    case "email": return <input {...common} type="email" defaultValue={asText(value)} />;
    case "date": return <input {...common} type="date" defaultValue={asText(value).slice(0, 10)} />;
    case "select": return (
      <select {...common} defaultValue={asText(value)}>
        {!f.required && <option value="">-</option>}
        {f.required && !value && <option value="" disabled>Pilih...</option>}
        {(options ?? f.options ?? []).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    );
    case "image": return <ImageField field={f} value={value as string | null} />;
    case "gallery": return <GalleryField field={f} images={gallery ?? []} />;
    default: return <input {...common} defaultValue={asText(value)} />;
  }
}

const WIDE = new Set(["textarea", "html", "image", "gallery"]);

// Form generik untuk semua resource: field pendek 2 kolom, teks panjang & gambar selebar penuh,
// checkbox dikumpulkan di bawah (seperti form Laravel).
export function ResourceForm({ fields, values, options, gallery, action, cancelHref, submitLabel = "Save Changes" }: {
  fields: Field[]; values: Record<string, Value>; options: Record<string, [string, string][]>;
  gallery?: { id: number; image: string }[]; action: (fd: FormData) => Promise<Result>; cancelHref?: string; submitLabel?: string;
}) {
  const inputs = fields.filter((f) => f.type !== "checkbox");
  const checks = fields.filter((f) => f.type === "checkbox");
  return (
    <ActionForm action={action}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-5">
        {inputs.map((f) => (
          <Fragment key={f.name}>
            {f.section && <h3 className="sm:col-span-2 text-white font-heading font-semibold text-lg mt-4 first:mt-0">{f.section}</h3>}
            <div className={WIDE.has(f.type) || (f.type === "list" && f.sep === "\n") ? "sm:col-span-2" : ""}>
              <label htmlFor={f.name} className="text-gray-400 text-sm mb-1 block">{f.label}{f.required && " *"}</label>
              <FieldInput field={f} value={values[f.name] ?? f.default as Value} options={options[f.name]} gallery={gallery} />
              {f.help && <p className="text-gray-500 text-xs mt-1">{f.help}</p>}
            </div>
          </Fragment>
        ))}
      </div>
      {checks.length > 0 && (
        <div className="flex flex-wrap gap-6 mt-6">
          {checks.map((f) => (
            <label key={f.name} className="flex items-center gap-2 text-gray-400 text-sm cursor-pointer">
              <input type="checkbox" name={f.name} defaultChecked={Boolean(values[f.name] ?? f.default)} className="w-4 h-4 rounded" /> {f.label}
            </label>
          ))}
        </div>
      )}
      <div className="flex gap-3 mt-8">
        <button type="submit" className="btn-primary">{submitLabel}</button>
        {cancelHref && <a href={cancelHref} className="btn-ghost">Cancel</a>}
      </div>
    </ActionForm>
  );
}

// ---------- Tombol aksi dengan konfirmasi ----------
export function ActionButton({ action, confirm: question, children, className = "text-red-400 hover:text-red-300 text-xs" }: {
  action: () => Promise<Result>; confirm?: string; children: ReactNode; className?: string;
}) {
  const [pending, start] = useTransition();
  return (
    <button type="button" disabled={pending} className={`${className} disabled:opacity-50`}
      onClick={() => {
        if (question && !window.confirm(question)) return;
        start(async () => { const res = await action(); if (res?.error) alert(res.error); });
      }}>
      {children}
    </button>
  );
}

export function StatusSelect({ value, options, action }: {
  value: string; options: [string, string][]; action: (status: string) => Promise<Result>;
}) {
  const [pending, start] = useTransition();
  const [current, setCurrent] = useState(value);
  return (
    <select value={current} disabled={pending} aria-label="Status lamaran"
      className="bg-white/5 border border-white/10 rounded-lg text-xs text-white px-2 py-1.5 focus:outline-none focus:border-cyan-500"
      onChange={(e) => {
        const next = e.target.value;
        setCurrent(next);
        start(async () => { const res = await action(next); if (res?.error) { alert(res.error); setCurrent(value); } });
      }}>
      {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
    </select>
  );
}
