import { useState } from "react";
import { Plus, Trash2, Sparkles, X, ScanEye, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import type { Property, Room, RoomType } from "../../../types/property";
import { inputClass, labelClass, textareaClass } from "../formStyles";
import { ImageUploader } from "../ImageUploader";
import { generateRoomNarration } from "../../../services/ai";
import { analyzeRoomPhoto } from "../../../services/roomPhotoAnalysis";

interface StepProps {
  draft: Property;
  update: (patch: Partial<Property>) => void;
}

const ROOM_TYPES: { value: RoomType; label: string }[] = [
  { value: "kitchen", label: "Kitchen" },
  { value: "living-room", label: "Living Room" },
  { value: "dining-room", label: "Dining Room" },
  { value: "primary-bedroom", label: "Primary Bedroom" },
  { value: "bedroom", label: "Bedroom" },
  { value: "bathroom", label: "Bathroom" },
  { value: "office", label: "Office" },
  { value: "basement", label: "Basement" },
  { value: "backyard", label: "Backyard" },
  { value: "exterior", label: "Exterior" },
  { value: "other", label: "Other" },
];

function newRoom(order: number): Room {
  return {
    id: crypto.randomUUID(),
    name: "New Room",
    type: "other",
    image: "",
    order,
    description: "",
    narration: "",
    features: [],
  };
}

export function RoomsStep({ draft, update }: StepProps) {
  const [selectedId, setSelectedId] = useState<string | undefined>(draft.rooms[0]?.id);
  const [featureInput, setFeatureInput] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [analyzeNote, setAnalyzeNote] = useState<string | null>(null);
  const [analyzedForId, setAnalyzedForId] = useState<string | undefined>(selectedId);

  if (selectedId !== analyzedForId) {
    setAnalyzedForId(selectedId);
    setAnalyzeError(null);
    setAnalyzeNote(null);
  }

  const selectedRoom = draft.rooms.find((r) => r.id === selectedId);

  const libraryPhotos = Array.from(
    new Set(
      [draft.exteriorImage, ...draft.gallery, ...draft.rooms.map((r) => r.image)].filter(
        (url): url is string => Boolean(url)
      )
    )
  );

  function patchRoom(id: string, patch: Partial<Room>) {
    update({ rooms: draft.rooms.map((r) => (r.id === id ? { ...r, ...patch } : r)) });
  }

  function addRoom() {
    const room = newRoom(draft.rooms.length + 1);
    update({ rooms: [...draft.rooms, room] });
    setSelectedId(room.id);
  }

  function removeRoom(id: string) {
    const remaining = draft.rooms.filter((r) => r.id !== id).map((r, i) => ({ ...r, order: i + 1 }));
    update({ rooms: remaining });
    if (selectedId === id) setSelectedId(remaining[0]?.id);
  }

  function addFeature() {
    if (!selectedRoom || !featureInput.trim()) return;
    patchRoom(selectedRoom.id, { features: [...selectedRoom.features, { title: featureInput.trim() }] });
    setFeatureInput("");
  }

  function removeFeature(index: number) {
    if (!selectedRoom) return;
    patchRoom(selectedRoom.id, { features: selectedRoom.features.filter((_, i) => i !== index) });
  }

  async function handleAnalyzePhoto() {
    if (!selectedRoom || !selectedRoom.image) return;
    setAnalyzing(true);
    setAnalyzeError(null);
    setAnalyzeNote(null);
    try {
      const result = await analyzeRoomPhoto(selectedRoom.image);
      const existingTitles = new Set(selectedRoom.features.map((f) => f.title.toLowerCase()));
      const newFeatures = result.features.filter((title) => !existingTitles.has(title.toLowerCase()));

      patchRoom(selectedRoom.id, {
        description: selectedRoom.description.trim() ? selectedRoom.description : result.description,
        features: [...selectedRoom.features, ...newFeatures.map((title) => ({ title }))],
      });
      setAnalyzeNote(`Added ${newFeatures.length} feature${newFeatures.length === 1 ? "" : "s"} from the photo.`);
    } catch (err) {
      setAnalyzeError(err instanceof Error ? err.message : "Couldn't analyze that photo.");
    } finally {
      setAnalyzing(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_1fr]">
      <div className="space-y-2">
        {draft.rooms.map((room) => (
          <button
            key={room.id}
            type="button"
            onClick={() => setSelectedId(room.id)}
            className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
              room.id === selectedId ? "bg-navy text-white" : "bg-offwhite text-text-dark hover:bg-navy/10"
            }`}
          >
            <span className="truncate">{room.name}</span>
          </button>
        ))}
        <button
          type="button"
          onClick={addRoom}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-navy/25 px-3 py-2.5 text-sm font-medium text-navy hover:bg-navy/5"
        >
          <Plus className="h-4 w-4" /> Add Room
        </button>
      </div>

      <div>
        {!selectedRoom ? (
          <div className="flex h-full min-h-[200px] items-center justify-center text-sm text-text-secondary">
            Add a room to get started.
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Room Title</label>
                  <input
                    className={inputClass}
                    value={selectedRoom.name}
                    onChange={(e) => patchRoom(selectedRoom.id, { name: e.target.value })}
                  />
                </div>
                <div>
                  <label className={labelClass}>Room Type</label>
                  <select
                    className={inputClass}
                    value={selectedRoom.type}
                    onChange={(e) => patchRoom(selectedRoom.id, { type: e.target.value as RoomType })}
                  >
                    {ROOM_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeRoom(selectedRoom.id)}
                aria-label="Delete room"
                className="mt-6 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-red-500 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            <div className="max-w-sm">
              <ImageUploader
                label="Room Photo"
                value={selectedRoom.image || undefined}
                onChange={(url) => patchRoom(selectedRoom.id, { image: url ?? "" })}
                libraryPhotos={libraryPhotos}
              />
              {selectedRoom.image && (
                <button
                  type="button"
                  onClick={handleAnalyzePhoto}
                  disabled={analyzing}
                  className="mt-2 flex items-center gap-1.5 rounded-full bg-gold/15 px-3 py-1.5 text-xs font-semibold text-gold-dark hover:bg-gold/25 disabled:opacity-60"
                >
                  {analyzing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ScanEye className="h-3.5 w-3.5" />}
                  {analyzing ? "Analyzing photo…" : "Detect Features from Photo"}
                </button>
              )}
              {analyzeNote && (
                <p className="mt-1.5 flex items-center gap-1.5 text-xs text-navy">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-gold-dark" /> {analyzeNote}
                </p>
              )}
              {analyzeError && (
                <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-600">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {analyzeError}
                </p>
              )}
            </div>

            <div>
              <label className={labelClass}>Description</label>
              <textarea
                className={textareaClass}
                value={selectedRoom.description}
                onChange={(e) => patchRoom(selectedRoom.id, { description: e.target.value })}
                placeholder="A short factual description of this room."
              />
            </div>

            <div>
              <span className={labelClass}>Key Features</span>
              <div className="mb-2 flex flex-wrap gap-2">
                {selectedRoom.features.map((feature, index) => (
                  <span key={`${feature.title}-${index}`} className="flex items-center gap-1.5 rounded-full bg-offwhite px-3 py-1.5 text-xs text-navy">
                    {feature.title}
                    <button type="button" onClick={() => removeFeature(index)} aria-label={`Remove ${feature.title}`}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  className={`${inputClass} max-w-xs`}
                  placeholder="e.g. Quartz Countertops"
                  value={featureInput}
                  onChange={(e) => setFeatureInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addFeature())}
                />
                <button type="button" onClick={addFeature} className="flex items-center gap-1 rounded-lg bg-navy px-3 py-2 text-sm text-white hover:bg-navy-light">
                  <Plus className="h-3.5 w-3.5" /> Add
                </button>
              </div>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <span className={labelClass}>Narration Script</span>
                <button
                  type="button"
                  onClick={() =>
                    patchRoom(selectedRoom.id, {
                      narration: generateRoomNarration({
                        name: selectedRoom.name,
                        features: selectedRoom.features,
                        description: selectedRoom.description,
                      }),
                    })
                  }
                  className="flex items-center gap-1.5 rounded-full bg-gold/15 px-3 py-1.5 text-xs font-semibold text-gold-dark hover:bg-gold/25"
                >
                  <Sparkles className="h-3.5 w-3.5" /> Generate Narration
                </button>
              </div>
              <textarea
                className={textareaClass}
                value={selectedRoom.narration}
                onChange={(e) => patchRoom(selectedRoom.id, { narration: e.target.value })}
                placeholder="What the Home Guide will say when this room opens."
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
