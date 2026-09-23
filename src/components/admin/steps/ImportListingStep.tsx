import { useRef, useState } from "react";
import { FileText, Upload, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import type { Property } from "../../../types/property";
import { extractPdfText } from "../../../services/pdfExtract";
import { extractListingFromText, type ExtractedListing } from "../../../services/listingImport";

interface ImportListingStepProps {
  update: (patch: Partial<Property>) => void;
}

type Status = "idle" | "reading" | "analyzing" | "done" | "error";

function applyExtractedListing(extracted: ExtractedListing, update: (patch: Partial<Property>) => void) {
  const patch: Partial<Property> = {};

  if (extracted.address) patch.address = extracted.address;
  if (extracted.city) patch.city = extracted.city;
  if (extracted.province) patch.province = extracted.province;
  if (extracted.postalCode) patch.postalCode = extracted.postalCode;
  if (typeof extracted.price === "number") patch.price = extracted.price;
  if (typeof extracted.bedrooms === "number") patch.bedrooms = extracted.bedrooms;
  if (typeof extracted.bathrooms === "number") patch.bathrooms = extracted.bathrooms;
  if (typeof extracted.squareFeet === "number") patch.squareFeet = extracted.squareFeet;
  if (extracted.propertyType) patch.propertyType = extracted.propertyType;
  if (extracted.description) patch.description = extracted.description;

  if (typeof extracted.taxAmount === "number") {
    patch.taxes = { amount: extracted.taxAmount, year: extracted.taxYear ?? new Date().getFullYear() };
  }

  if (extracted.parkingType || typeof extracted.parkingSpaces === "number") {
    patch.parking = {
      type: extracted.parkingType ?? "Parking",
      spaces: extracted.parkingSpaces ?? 0,
    };
  }

  if (extracted.basementFinished !== null || extracted.basementSeparateEntrance !== null) {
    patch.basement = {
      finished: extracted.basementFinished ?? false,
      separateEntrance: extracted.basementSeparateEntrance ?? false,
    };
  }

  if (extracted.features.length > 0) {
    patch.features = [{ category: "Interior", items: extracted.features.map((title) => ({ title })) }];
  }

  update(patch);
}

export function ImportListingStep({ update }: ImportListingStepProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ExtractedListing | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    setResult(null);
    setFileName(file.name);

    try {
      setStatus("reading");
      const text = await extractPdfText(file);
      if (!text.trim()) {
        throw new Error("Couldn't find any text in that PDF — it may be a scanned image. Try entering details manually.");
      }

      setStatus("analyzing");
      const extracted = await extractListingFromText(text);
      applyExtractedListing(extracted, update);
      setResult(extracted);
      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong reading that file.");
      setStatus("error");
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const fieldsFound = result
    ? [
        result.address,
        result.city,
        result.price,
        result.bedrooms,
        result.bathrooms,
        result.squareFeet,
        result.propertyType,
        result.description,
      ].filter((v) => v !== null && v !== "").length
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-serif text-lg text-navy">Start from a listing PDF</h3>
        <p className="mt-1 text-sm text-text-secondary">
          Drop an MLS sheet or listing PDF and AI will pre-fill the property details below for you to review. Nothing
          is guessed — any fact not clearly stated in the PDF is left blank for you to fill in.
        </p>
      </div>

      <div className="rounded-xl border border-dashed border-navy/20 bg-offwhite p-8 text-center">
        {status === "reading" || status === "analyzing" ? (
          <div className="flex flex-col items-center gap-2 text-text-secondary">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="text-sm">{status === "reading" ? "Reading PDF…" : "Analyzing listing with AI…"}</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex flex-col items-center gap-2 text-text-secondary hover:text-navy"
          >
            <Upload className="h-6 w-6" strokeWidth={1.5} />
            <span className="text-sm font-medium">Click to upload a listing PDF</span>
            <span className="text-xs">PDF files only</span>
          </button>
        )}
      </div>

      {fileName && status !== "idle" && (
        <p className="flex items-center gap-1.5 text-xs text-text-secondary">
          <FileText className="h-3.5 w-3.5" /> {fileName}
        </p>
      )}

      {status === "error" && error && (
        <p className="flex items-center gap-1.5 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
        </p>
      )}

      {status === "done" && result && (
        <div className="rounded-xl bg-gold/10 p-4">
          <p className="flex items-center gap-1.5 text-sm font-semibold text-navy">
            <CheckCircle2 className="h-4 w-4 text-gold-dark" />
            Filled in {fieldsFound} field{fieldsFound === 1 ? "" : "s"} from the PDF
          </p>
          <p className="mt-1 text-xs text-text-secondary">
            Double-check everything on the next steps — AI extraction can miss or misread details.
          </p>
        </div>
      )}

      <p className="text-xs text-text-secondary">
        You can also skip this and fill in the details manually — just hit Continue below.
      </p>

      <input ref={inputRef} type="file" accept="application/pdf" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
    </div>
  );
}
