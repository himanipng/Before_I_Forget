"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Camera, Heart, ImagePlus, Loader2, MapPin, Plus, UploadCloud } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import {
  addProfilePhoto,
  createProfile,
  getPhotoUrl,
  getUploadUrl,
  listMemories,
  listProfiles,
} from "@/lib/api";
import type { Language, MemoryCard, PersonPhoto, PersonProfile, Relationship } from "@/lib/types";

const relationships: Relationship[] = ["parent", "grandparent", "friend", "sibling", "teacher", "other"];
const languages: Language[] = ["English", "Hindi", "Spanish", "Mandarin", "Arabic", "Tagalog", "Vietnamese", "French", "other"];

type PhotoPreview = Record<string, string>;

const emptyProfile = {
  personName: "",
  relationship: "grandparent" as Relationship,
  country: "",
  language: "English" as Language,
  birthday: "",
  notes: "",
};

export default function PeoplePage() {
  const [profiles, setProfiles] = useState<PersonProfile[]>([]);
  const [memories, setMemories] = useState<MemoryCard[]>([]);
  const [activeId, setActiveId] = useState("");
  const [form, setForm] = useState(emptyProfile);
  const [photoPreviews, setPhotoPreviews] = useState<PhotoPreview>({});
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([listProfiles(), listMemories()])
      .then(([nextProfiles, nextMemories]) => {
        setProfiles(nextProfiles);
        setMemories(nextMemories);
        setActiveId((current) => current || nextProfiles[0]?.profileId || "");
      })
      .catch((caught) => setError(caught instanceof Error ? caught.message : "Unable to load people."));
  }, []);

  useEffect(() => {
    const missingKeys = profiles
      .flatMap((profile) => profile.photos)
      .filter((photo) => photo.fileKey && !photoPreviews[photo.fileKey])
      .map((photo) => photo.fileKey);

    if (!missingKeys.length) return;

    Promise.all(
      Array.from(new Set(missingKeys)).map(async (fileKey) => {
        const signed = await getPhotoUrl(fileKey);
        return [fileKey, signed.url] as const;
      }),
    )
      .then((entries) => {
        const next = Object.fromEntries(entries.filter(([, url]) => url));
        if (Object.keys(next).length) {
          setPhotoPreviews((current) => ({ ...current, ...next }));
        }
      })
      .catch(() => undefined);
  }, [photoPreviews, profiles]);

  const activeProfile = profiles.find((profile) => profile.profileId === activeId) || profiles[0];
  const profileMemories = useMemo(() => {
    if (!activeProfile) return [];
    return memories.filter(
      (memory) =>
        memory.personId === activeProfile.profileId ||
        (!memory.personId && memory.personName.toLowerCase() === activeProfile.personName.toLowerCase()),
    );
  }, [activeProfile, memories]);

  async function submitProfile(event: FormEvent) {
    event.preventDefault();
    setBusy("profile");
    setError("");

    try {
      const profile = await createProfile(form);
      setProfiles((current) => [profile, ...current.filter((item) => item.profileId !== profile.profileId)]);
      setActiveId(profile.profileId);
      setForm(emptyProfile);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to create profile.");
    } finally {
      setBusy("");
    }
  }

  async function uploadPhoto(file: File | null) {
    if (!file || !activeProfile) return;
    setBusy("photo");
    setError("");

    try {
      const upload = await getUploadUrl(file.name, file.type || "image/jpeg");
      if (!upload.uploadUrl.includes("mock-upload.before-i-forget.local")) {
        await fetch(upload.uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": file.type || "image/jpeg" },
          body: file,
        });
      }

      const photo: PersonPhoto = {
        id: `photo_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        fileName: file.name,
        fileKey: upload.fileKey,
        contentType: file.type || "image/jpeg",
        uploadedAt: new Date().toISOString(),
      };
      const nextProfile = await addProfilePhoto(activeProfile.profileId, photo);
      const localPreview = URL.createObjectURL(file);
      setPhotoPreviews((current) => ({ ...current, [photo.fileKey]: localPreview }));
      setProfiles((current) => current.map((item) => (item.profileId === nextProfile.profileId ? nextProfile : item)));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to upload photo.");
    } finally {
      setBusy("");
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[linear-gradient(180deg,#fff8f1,#f5e5d8)] px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-900">People</p>
              <h1
                className="mt-2 max-w-3xl text-5xl leading-tight text-stone-900 sm:text-6xl"
                style={{ fontFamily: "var(--font-lora), Georgia, serif", fontStyle: "italic" }}
              >
                Build a profile before the memories.
              </h1>
              <p className="mt-3 max-w-2xl leading-7 text-stone-600">
                Create a person, add photos that belong to them, then start memories that stay connected to their profile.
              </p>
            </div>
            {activeProfile ? (
              <Link
                href={`/start?personId=${encodeURIComponent(activeProfile.profileId)}`}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#881337] px-6 py-3 font-semibold text-white shadow-lg shadow-rose-950/15 transition hover:bg-[#4c0519]"
              >
                Add memory for {activeProfile.personName} <ArrowRight size={18} />
              </Link>
            ) : null}
          </div>

          {error ? <p className="mt-5 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-900">{error}</p> : null}

          <div className="mt-8 grid gap-6 lg:grid-cols-[0.42fr_0.58fr]">
            <section className="space-y-5">
              <form onSubmit={submitProfile} className="rounded-[2rem] border border-[#DFD0C0] bg-white/80 p-5 shadow-sm">
                <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-rose-900">
                  <Plus size={16} /> New profile
                </p>
                <div className="mt-5 grid gap-4">
                  <input
                    value={form.personName}
                    onChange={(event) => setForm({ ...form, personName: event.target.value })}
                    className="field"
                    placeholder="Name, like Nani"
                  />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <select
                      value={form.relationship}
                      onChange={(event) => setForm({ ...form, relationship: event.target.value as Relationship })}
                      className="field"
                    >
                      {relationships.map((relationship) => <option key={relationship}>{relationship}</option>)}
                    </select>
                    <select
                      value={form.language}
                      onChange={(event) => setForm({ ...form, language: event.target.value as Language })}
                      className="field"
                    >
                      {languages.map((language) => <option key={language}>{language}</option>)}
                    </select>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <input
                      value={form.country}
                      onChange={(event) => setForm({ ...form, country: event.target.value })}
                      className="field"
                      placeholder="Country or hometown"
                    />
                    <input
                      value={form.birthday}
                      onChange={(event) => setForm({ ...form, birthday: event.target.value })}
                      className="field"
                      placeholder="Birthday or reminder"
                    />
                  </div>
                  <textarea
                    value={form.notes}
                    onChange={(event) => setForm({ ...form, notes: event.target.value })}
                    className="field min-h-24 resize-none"
                    placeholder="Notes, favorite foods, family role, things to ask..."
                  />
                  <button disabled={busy === "profile"} className="action-button">
                    {busy === "profile" ? <Loader2 size={18} className="animate-spin" /> : <Heart size={18} />}
                    {busy === "profile" ? "Creating..." : "Create profile"}
                  </button>
                </div>
              </form>

              <div className="grid gap-3">
                {profiles.map((profile) => (
                  <button
                    key={profile.profileId}
                    onClick={() => setActiveId(profile.profileId)}
                    className={`rounded-2xl border p-4 text-left transition ${
                      activeProfile?.profileId === profile.profileId
                        ? "border-rose-900/30 bg-white shadow-sm"
                        : "border-[#DFD0C0] bg-white/60 hover:bg-white"
                    }`}
                  >
                    <p className="font-semibold text-stone-950">{profile.personName}</p>
                    <p className="mt-1 text-sm text-stone-500">{profile.relationship} · {profile.country || "No location yet"}</p>
                  </button>
                ))}
              </div>
            </section>

            <section className="rounded-[2rem] border border-[#DFD0C0] bg-white/80 p-5 shadow-sm">
              {activeProfile ? (
                <>
                  <div className="flex flex-col gap-4 border-b border-[#E7D8C7] pb-5 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-rose-900">
                        <MapPin size={16} /> {activeProfile.country || "Profile"}
                      </p>
                      <h2 className="mt-2 text-4xl font-semibold text-stone-950">{activeProfile.personName}</h2>
                      <p className="mt-2 text-stone-600">{activeProfile.relationship} · {activeProfile.language}</p>
                      {activeProfile.notes ? <p className="mt-4 max-w-2xl leading-7 text-stone-600">{activeProfile.notes}</p> : null}
                    </div>
                    <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-rose-900/15 bg-rose-50 px-5 py-3 font-semibold text-rose-950 transition hover:bg-rose-100">
                      {busy === "photo" ? <Loader2 size={18} className="animate-spin" /> : <ImagePlus size={18} />}
                      Upload picture
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(event) => uploadPhoto(event.target.files?.[0] || null)}
                      />
                    </label>
                  </div>

                  <div className="mt-6">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-rose-900">
                        <Camera size={16} /> Pictures
                      </p>
                      <span className="text-sm text-stone-500">{activeProfile.photos.length} uploaded</span>
                    </div>
                    {activeProfile.photos.length ? (
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {activeProfile.photos.map((photo) => (
                          <div key={photo.id} className="overflow-hidden rounded-2xl bg-[#fff8f1] ring-1 ring-rose-900/10">
                            {photoPreviews[photo.fileKey] ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={photoPreviews[photo.fileKey]} alt={photo.fileName} className="h-40 w-full object-cover" />
                            ) : (
                              <div className="grid h-40 place-items-center text-stone-500">
                                <UploadCloud size={28} />
                              </div>
                            )}
                            <p className="truncate px-3 py-2 text-sm font-medium text-stone-700">{photo.fileName}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-dashed border-[#D4C4B4] bg-white/60 p-8 text-center">
                        <Camera className="mx-auto text-rose-900" />
                        <p className="mt-3 font-semibold text-stone-900">Add the first photo for {activeProfile.personName}.</p>
                      </div>
                    )}
                  </div>

                  <div className="mt-8">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-rose-900">Memories</p>
                      <span className="text-sm text-stone-500">{profileMemories.length} saved</span>
                    </div>
                    {profileMemories.length ? (
                      <div className="grid gap-3">
                        {profileMemories.map((memory) => (
                          <Link
                            key={memory.memoryId}
                            href={`/memory/${memory.memoryId}`}
                            className="rounded-2xl bg-[#fff8f1] p-4 ring-1 ring-rose-900/10 transition hover:bg-rose-50"
                          >
                            <p className="font-semibold text-stone-950">{memory.title}</p>
                            <p className="mt-1 line-clamp-2 text-sm leading-6 text-stone-600">{memory.summary}</p>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-2xl bg-[#fff8f1] p-5 text-stone-700 ring-1 ring-rose-900/10">
                        No memories are attached yet. Start one from this profile to keep it organized.
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="grid min-h-[28rem] place-items-center text-center">
                  <div>
                    <Heart className="mx-auto text-rose-900" />
                    <h2 className="mt-4 text-2xl font-semibold text-stone-950">Create a profile to begin.</h2>
                    <p className="mt-2 text-stone-500">Profiles hold the person, their pictures, and all memories saved for them.</p>
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
