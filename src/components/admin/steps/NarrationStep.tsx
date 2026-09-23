import { useState } from "react";
import { Sparkles, Play, Square } from "lucide-react";
import type { Property } from "../../../types/property";
import { textareaClass, labelClass } from "../formStyles";
import { generateRoomNarration } from "../../../services/ai";
import * as speechService from "../../../services/speech";

interface StepProps {
  draft: Property;
  update: (patch: Partial<Property>) => void;
}

export function NarrationStep({ draft, update }: StepProps) {
  const [playingId, setPlayingId] = useState<string | undefined>();

  function setNarration(roomId: string, narration: string) {
    update({ rooms: draft.rooms.map((r) => (r.id === roomId ? { ...r, narration } : r)) });
  }

  function togglePlay(roomId: string, text: string) {
    if (playingId === roomId) {
      speechService.stop();
      setPlayingId(undefined);
      return;
    }
    speechService.speak(text, () => setPlayingId(undefined));
    setPlayingId(roomId);
  }

  if (draft.rooms.length === 0) {
    return <p className="text-sm text-text-secondary">Add rooms in the previous step before writing narration.</p>;
  }

  return (
    <div className="space-y-6">
      {draft.rooms.map((room) => (
        <div key={room.id} className="rounded-xl border border-navy/10 p-4">
          <div className="mb-2 flex items-center justify-between">
            <h4 className="font-serif text-base text-navy">{room.name}</h4>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setNarration(
                    room.id,
                    generateRoomNarration({ name: room.name, features: room.features, description: room.description })
                  )
                }
                className="flex items-center gap-1.5 rounded-full bg-gold/15 px-3 py-1.5 text-xs font-semibold text-gold-dark hover:bg-gold/25"
              >
                <Sparkles className="h-3.5 w-3.5" /> Generate
              </button>
              <button
                type="button"
                disabled={!room.narration.trim()}
                onClick={() => togglePlay(room.id, room.narration)}
                className="flex items-center gap-1.5 rounded-full bg-navy/5 px-3 py-1.5 text-xs font-semibold text-navy hover:bg-navy/10 disabled:opacity-30"
              >
                {playingId === room.id ? <Square className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                {playingId === room.id ? "Stop" : "Preview"}
              </button>
            </div>
          </div>
          <label className={labelClass} htmlFor={`narration-${room.id}`}>
            Narration (aim for 20–45 seconds spoken)
          </label>
          <textarea
            id={`narration-${room.id}`}
            className={textareaClass}
            value={room.narration}
            onChange={(e) => setNarration(room.id, e.target.value)}
          />
        </div>
      ))}
    </div>
  );
}
