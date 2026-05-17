"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Camera, Heart, ImagePlus, Loader2, MapPin, NotebookText, Plus, Search, UploadCloud } from "lucide-react";
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
const gradients = [
  "linear-gradient(145deg, #9F6B42 0%, #5A321D 100%)",
  "linear-gradient(145deg, #8A9A8F 0%, #35463E 100%)",
  "linear-gradient(145deg, #B9896A 0%, #653827 100%)",
  "linear-gradient(145deg, #9B8A62 0%, #4A3C22 100%)",
];

type PhotoPreview = Record<string, string>;

type PersonView = {
  key: string;
  profile?: PersonProfile;
  personName: string;
  relationship: Relationship;
  country: string;
  language: Language;
  birthday?: string;
  notes?: string;
  photos: PersonPhoto[];
  memories: MemoryCard[];
};

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
  const [activeKey, setActiveKey] = useState("");
  const [query, setQuery] = useState("");
  const [form, setForm] = useState(emptyProfile);
  const [photoPreviews, setPhotoPreviews] = useState<PhotoPreview>({});
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([listProfiles(), listMemories()])
      .then(([nextProfiles, nextMemories]) => {
        setProfiles(nextProfiles);
        setMemories(nextMemories);
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

  const people = useMemo(() => buildPeople(profiles, memories), [profiles, memories]);
  const filteredPeople = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return people;
    return people.filter((person) =>
      `${person.personName} ${person.relationship} ${person.country} ${person.language}`.toLowerCase().includes(needle),
    );
  }, [people, query]);

  const activePerson = people.find((person) => person.key === activeKey) || filteredPeople[0] || people[0];
  const activePhotoUrl = activePerson ? photoUrlFor(activePerson, photoPreviews) : "";

  async function submitProfile(event: FormEvent) {
    event.preventDefault();
    setBusy("profile");
    setError("");

    try {
      const profile = await createProfile(form);
      setProfiles((current) => [profile, ...current.filter((item) => item.profileId !== profile.profileId)]);
      setActiveKey(profile.profileId);
      setForm(emptyProfile);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to create profile.");
    } finally {
      setBusy("");
    }
  }

  async function uploadPhoto(file: File | null) {
    if (!file || !activePerson?.profile) return;
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
      const nextProfile = await addProfilePhoto(activePerson.profile.profileId, photo);
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
      <main className="min-h-screen bg-[linear-gradient(180deg,#fff8f1,#f3e2d3)] px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 lg:grid-cols-[0.76fr_1.24fr] lg:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose-900">People</p>
              <h1
                className="mt-3 max-w-3xl text-5xl leading-tight text-stone-950 sm:text-6xl"
                style={{ fontFamily: "var(--font-lora), Georgia, serif", fontStyle: "italic" }}
              >
                Open the archive by person.
              </h1>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-stone-600">
                Create a profile, add photos, and keep every saved memory attached to the person it belongs to.
              </p>
            </div>
            <label className="relative block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="w-full rounded-full border border-stone-200 bg-white/85 py-4 pl-12 pr-5 text-stone-900 shadow-sm outline-none transition focus:border-rose-700 focus:ring-4 focus:ring-rose-100"
                placeholder="Search a person, country, or relationship"
              />
            </label>
          </div>

          {error ? <p className="mt-6 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-900">{error}</p> : null}

          <div className="mt-8 grid gap-6 lg:grid-cols-[0.36fr_0.64fr]">
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
                  <input
                    value={form.country}
                    onChange={(event) => setForm({ ...form, country: event.target.value })}
                    className="field"
                    placeholder="Country or hometown"
                  />
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
                {filteredPeople.map((person) => (
                  <button
                    key={person.key}
                    onClick={() => setActiveKey(person.key)}
                    className={`flex items-center gap-3 rounded-3xl border p-4 text-left transition ${
                      activePerson?.key === person.key
                        ? "border-rose-900/30 bg-white shadow-sm"
                        : "border-[#DFD0C0] bg-white/60 hover:bg-white"
                    }`}
                  >
                    <Portrait
                      name={person.personName}
                      src={photoUrlFor(person, photoPreviews)}
                      className="size-14 shrink-0"
                    />
                    <span>
                      <span className="block text-lg font-semibold text-stone-950">{person.personName}</span>
                      <span className="mt-1 block text-sm text-stone-500">{person.relationship} · {person.country || "No location yet"}</span>
                      <span className="mt-3 block text-xs font-semibold uppercase tracking-[0.16em] text-rose-900">
                        {person.memories.length} {person.memories.length === 1 ? "memory" : "memories"}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </section>

            <section className="overflow-hidden rounded-[2rem] bg-white shadow-sm ring-1 ring-stone-900/5">
              {activePerson ? (
                <>
                  <div className="grid md:grid-cols-[0.42fr_0.58fr]">
                    <div
                      className="relative min-h-80 overflow-hidden p-6 text-white"
                      style={{
                        background: activePhotoUrl
                          ? `linear-gradient(180deg, rgba(28,16,8,0.08), rgba(28,16,8,0.74)), url(${activePhotoUrl}) center / cover`
                          : gradients[people.indexOf(activePerson) % gradients.length],
                      }}
                    >
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.24),transparent_34%)]" />
                      <div className="relative flex h-full flex-col justify-between">
                        <div>
                          <Portrait
                            name={activePerson.personName}
                            src={activePhotoUrl}
                            className="mb-5 size-24 ring-4 ring-white/60"
                          />
                          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-white/75">{activePerson.relationship}</p>
                          <h2 className="mt-3 text-5xl font-semibold leading-tight">{activePerson.personName}</h2>
                          <p className="mt-3 flex items-center gap-2 text-white/82">
                            <MapPin size={17} /> {activePerson.country || "Location not set"}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <span className="rounded-full bg-white/18 px-3 py-1 text-sm font-semibold backdrop-blur-sm">
                            {activePerson.language}
                          </span>
                          {activePerson.birthday ? (
                            <span className="rounded-full bg-white/18 px-3 py-1 text-sm font-semibold backdrop-blur-sm">
                              {activePerson.birthday}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="flex flex-wrap gap-3">
                        <span className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-sm font-semibold text-rose-950">
                          <NotebookText size={16} /> {activePerson.memories.length} {activePerson.memories.length === 1 ? "memory" : "memories"}
                        </span>
                        <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-950">
                          <Camera size={16} /> {activePerson.photos.length} photos
                        </span>
                      </div>
                      {activePerson.notes ? <p className="mt-5 leading-7 text-stone-600">{activePerson.notes}</p> : null}
                      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                        <Link
                          href={activePerson.profile ? `/start?personId=${encodeURIComponent(activePerson.profile.profileId)}` : "/start"}
                          className="inline-flex items-center justify-center gap-2 rounded-full bg-rose-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-950"
                        >
                          Add memory <ArrowRight size={17} />
                        </Link>
                        {activePerson.profile ? (
                          <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-stone-800 ring-1 ring-stone-200 transition hover:bg-stone-50">
                            {busy === "photo" ? <Loader2 size={17} className="animate-spin" /> : <ImagePlus size={17} />}
                            Add photo
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(event) => uploadPhoto(event.target.files?.[0] || null)}
                            />
                          </label>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-6 border-t border-stone-900/10 p-6 xl:grid-cols-[0.45fr_0.55fr]">
                    <div>
                      <div className="mb-3 flex items-center justify-between">
                        <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-rose-900">
                          <Camera size={16} /> Pictures
                        </p>
                        <span className="text-sm text-stone-500">{activePerson.photos.length} uploaded</span>
                      </div>
                      {activePerson.photos.length ? (
                        <div className="grid gap-3 sm:grid-cols-2">
                          {activePerson.photos.slice(0, 4).map((photo) => (
                            <div key={photo.id} className="overflow-hidden rounded-2xl bg-[#fff8f1] ring-1 ring-rose-900/10">
                              {photoPreviews[photo.fileKey] ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={photoPreviews[photo.fileKey]} alt={photo.fileName} className="h-36 w-full object-cover" />
                              ) : (
                                <div className="grid h-36 place-items-center text-stone-500">
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
                          <p className="mt-3 font-semibold text-stone-900">Add the first photo for {activePerson.personName}.</p>
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="mb-3 flex items-center justify-between">
                        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-rose-900">Memories</p>
                        <span className="text-sm text-stone-500">{activePerson.memories.length} saved</span>
                      </div>
                      {activePerson.memories.length ? (
                        <div className="grid gap-3">
                          {activePerson.memories.map((memory) => (
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
                  </div>
                </>
              ) : (
                <div className="grid min-h-[28rem] place-items-center p-8 text-center">
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

function buildPeople(profiles: PersonProfile[], memories: MemoryCard[]): PersonView[] {
  const sortedMemories = [...memories].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const people: PersonView[] = profiles.map((profile) => ({
    key: profile.profileId,
    profile,
    personName: profile.personName,
    relationship: profile.relationship,
    country: profile.country,
    language: profile.language,
    birthday: profile.birthday,
    notes: profile.notes,
    photos: profile.photos,
    memories: sortedMemories.filter(
      (memory) =>
        memory.personId === profile.profileId ||
        (!memory.personId && memory.personName.toLowerCase() === profile.personName.toLowerCase()),
    ),
  }));

  for (const memory of sortedMemories) {
    const alreadyAttached = people.some(
      (person) =>
        memory.personId === person.profile?.profileId ||
        (!memory.personId && memory.personName.toLowerCase() === person.personName.toLowerCase()),
    );
    if (alreadyAttached) continue;

    people.push({
      key: `memory:${memory.personName.toLowerCase()}`,
      personName: memory.personName,
      relationship: memory.relationship,
      country: memory.country,
      language: memory.language,
      photos: [],
      memories: sortedMemories.filter((item) => item.personName.toLowerCase() === memory.personName.toLowerCase()),
    });
  }

  return people.sort((a, b) => {
    const newestA = a.memories[0]?.createdAt || a.profile?.createdAt || "";
    const newestB = b.memories[0]?.createdAt || b.profile?.createdAt || "";
    return newestB.localeCompare(newestA);
  });
}

function photoUrlFor(person: PersonView, previews: PhotoPreview) {
  const firstPhoto = person.photos[0];
  return firstPhoto ? previews[firstPhoto.fileKey] || "" : "";
}

function Portrait({ name, src, className }: { name: string; src: string; className?: string }) {
  return (
    <span
      className={`grid place-items-center overflow-hidden rounded-full bg-rose-100 text-lg font-semibold text-rose-950 ring-1 ring-white/30 ${className || ""}`}
      style={
        src
          ? {
              backgroundImage: `url(${src})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
          : undefined
      }
      aria-label={`${name} profile picture`}
    >
      {src ? null : initials(name)}
    </span>
  );
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "BF";
}
