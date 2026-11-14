'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Store,
  Upload,
  Loader2,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { InstagramIcon } from '@/components/common/Icons';
import { DEFAULT_INSTAGRAM_IMAGES } from '@/lib/constants';

const SLOT_COUNT = DEFAULT_INSTAGRAM_IMAGES.length;

function normalizeImages(value: unknown): string[] {
  if (Array.isArray(value)) {
    const cleaned = value.map((item) => String(item ?? '').trim());
    if (cleaned.length === SLOT_COUNT && cleaned.every(Boolean)) {
      return cleaned;
    }
  }
  return [...DEFAULT_INSTAGRAM_IMAGES];
}

interface InstagramFeedEditorProps {
  adminToken: string;
}

export default function InstagramFeedEditor({ adminToken }: InstagramFeedEditorProps) {
  const [images, setImages] = useState<string[]>([...DEFAULT_INSTAGRAM_IMAGES]);
  const [drafts, setDrafts] = useState<string[]>([...DEFAULT_INSTAGRAM_IMAGES]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadFeed = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/instagram-feed', { cache: 'no-store' });
        const data = res.ok ? await res.json() : null;
        if (!cancelled) {
          const list = normalizeImages(data?.images);
          setImages(list);
          setDrafts(list);
        }
      } catch {
        if (!cancelled) {
          setMessage({ type: 'error', text: 'Failed to load Instagram feed images.' });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadFeed();

    return () => {
      cancelled = true;
    };
  }, []);

  const commitDraft = (index: number) => {
    const value = drafts[index]?.trim();
    if (!value) return;

    setImages((prev) => prev.map((image, i) => (i === index ? value : image)));
    setDrafts((prev) => prev.map((draft, i) => (i === index ? value : draft)));
  };

  const handleUpload = async (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !adminToken) return;

    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please select an image file.' });
      return;
    }

    setUploadingIndex(index);
    setMessage(null);

    const form = new FormData();
    form.append('file', file);

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
        body: form,
      });
      const data = await res.json();

      if (res.ok && data.url) {
        setImages((prev) => prev.map((image, i) => (i === index ? data.url : image)));
        setDrafts((prev) => prev.map((draft, i) => (i === index ? data.url : draft)));
        setMessage({ type: 'success', text: `Image ${index + 1} uploaded. Save changes to publish.` });
      } else {
        setMessage({ type: 'error', text: data.error || 'Upload failed.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error during upload.' });
    } finally {
      setUploadingIndex(null);
    }
  };

  const moveImage = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= images.length) return;

    setImages((prev) => {
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
    setDrafts((prev) => {
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const restoreDefaults = () => {
    const defaults = [...DEFAULT_INSTAGRAM_IMAGES];
    setImages(defaults);
    setDrafts(defaults);
    setMessage({ type: 'success', text: 'Default images restored. Save changes to publish.' });
  };

  const handleSave = async () => {
    const resolved = images.map((image, index) => drafts[index]?.trim() || image);

    if (
      resolved.length !== SLOT_COUNT ||
      resolved.some((image) => !image) ||
      resolved.some((image) => !(image.startsWith('/') || /^https?:\/\//i.test(image)))
    ) {
      setMessage({ type: 'error', text: 'All 6 slots need a valid image path or URL.' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/instagram-feed', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ images: resolved }),
      });
      const data = await res.json();

      if (res.ok) {
        setImages(resolved);
        setDrafts(resolved);
        setMessage({ type: 'success', text: 'Instagram feed images updated on the homepage.' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to update images.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error while saving changes.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] tracking-widest font-bold uppercase text-pink-700 bg-pink-100 px-2.5 py-0.5 rounded">
              Homepage Content
            </span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-brand-charcoal">Instagram Feed</h1>
          <p className="text-xs text-gray-500 mt-1">
            Replace the 6 images shown in the homepage Instagram strip. Upload new images, paste
            paths/URLs, or reorder the slots.
          </p>
        </div>
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2.5 bg-white border border-gray-300 text-brand-charcoal text-xs font-bold rounded-xl shadow-xs hover:bg-gray-50 flex items-center gap-2 self-start"
        >
          <Store className="w-3.5 h-3.5" /> Preview Homepage
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-brand-charcoal" />
          <p className="text-xs text-gray-400 mt-2">Loading Instagram feed...</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-5">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-pink-50 text-pink-700 flex items-center justify-center">
                <InstagramIcon className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-brand-charcoal">Homepage Strip Images</h2>
                <p className="text-[11px] text-gray-500">
                  Exactly 6 images. Square or landscape photos work best.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={restoreDefaults}
              className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Defaults
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {images.map((image, index) => (
              <div
                key={index}
                className="rounded-2xl border border-gray-200 bg-gray-50 p-3 space-y-2"
              >
                <div className="relative h-36 rounded-xl overflow-hidden bg-white border border-gray-200">
                  {image ? (
                    <Image
                      src={image}
                      alt={`Instagram feed slot ${index + 1}`}
                      fill
                      unoptimized
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-gray-300">
                      <InstagramIcon className="w-8 h-8" />
                    </div>
                  )}
                  <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded bg-black/70 text-white">
                    #{index + 1}
                  </span>
                </div>

                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={drafts[index] ?? ''}
                    maxLength={1000}
                    placeholder="/uploads/image.jpg"
                    onChange={(event) =>
                      setDrafts((prev) =>
                        prev.map((draft, i) => (i === index ? event.target.value : draft))
                      )
                    }
                    onBlur={() => commitDraft(index)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        commitDraft(index);
                      }
                    }}
                    className="min-w-0 flex-1 text-[11px] p-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:border-brand-charcoal"
                  />
                  <label
                    className="px-2.5 py-2 bg-brand-charcoal hover:bg-black text-white rounded-lg cursor-pointer flex items-center justify-center"
                    title="Upload replacement image"
                  >
                    {uploadingIndex === index ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Upload className="w-3.5 h-3.5" />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploadingIndex !== null}
                      onChange={(event) => handleUpload(index, event)}
                    />
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-gray-500">
                    Slot {index + 1} of {SLOT_COUNT}
                  </span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => moveImage(index, -1)}
                      disabled={index === 0}
                      title="Move left"
                      className="p-1.5 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <ArrowLeft className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveImage(index, 1)}
                      disabled={index === SLOT_COUNT - 1}
                      title="Move right"
                      className="p-1.5 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {message && (
            <div
              className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              {message.text}
            </div>
          )}

          <div className="flex justify-end pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || uploadingIndex !== null}
              className="px-6 py-3 bg-brand-charcoal hover:bg-black text-white text-xs font-bold rounded-xl uppercase tracking-wider flex items-center gap-2 disabled:opacity-60"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Save Instagram Images</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
