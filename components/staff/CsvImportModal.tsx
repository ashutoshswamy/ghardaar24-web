"use client";

import { useRef, useState } from "react";
import { Upload, FileSpreadsheet, CheckCircle } from "lucide-react";
import { motion } from "@/lib/motion";

interface Sheet {
  id: string;
  name: string;
}

interface Props {
  sheets: Sheet[];
  defaultSheetId: string | null;
  existingPhones: string[];
  canCreateSheet: boolean;
  createSheet: (name: string) => Promise<string>;
  insertClients: (rows: Record<string, string | null>[]) => Promise<number>;
  onClose: () => void;
  onDone: (sheetId: string, message: string) => void;
}

const FIELDS: [string, string][] = [
  ["client_name", "Client Name *"],
  ["customer_number", "Phone Number"],
  ["lead_stage", "Lead Stage"],
  ["lead_type", "Lead Type"],
  ["location_category", "Location"],
  ["calling_comment", "Calling Comment"],
  ["expected_visit_date", "Expected Visit Date"],
];

const normPhone = (p: string) => p.trim().replace(/\s+/g, "");

function parseCSV(text: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      if (quoted && text[i + 1] === '"') { cell += '"'; i++; }
      else quoted = !quoted;
    } else if (c === "," && !quoted) {
      row.push(cell.trim()); cell = "";
    } else if ((c === "\r" || c === "\n") && !quoted) {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(cell.trim()); rows.push(row); row = []; cell = "";
    } else cell += c;
  }
  if (cell !== "" || row.length) { row.push(cell.trim()); rows.push(row); }
  return rows;
}

function parseDate(s: string) {
  const d = new Date(s);
  if (!isNaN(d.getTime())) return d.toISOString().split("T")[0];
  const m = s.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  return m ? `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}` : null;
}

function autoMap(headers: string[]) {
  const map: Record<string, string> = {};
  headers.forEach((h, i) => {
    const l = h.toLowerCase();
    const has = (...w: string[]) => w.every((x) => l.includes(x));
    if (has("client", "name")) map[i] = "client_name";
    else if (l.includes("customer") || l.includes("number") || l.includes("phone")) map[i] = "customer_number";
    else if (has("lead", "stage")) map[i] = "lead_stage";
    else if (l.includes("comment") || l.includes("calling")) map[i] = "calling_comment";
    else if (has("lead", "type")) map[i] = "lead_type";
    else if (l.includes("location") || l.includes("category")) map[i] = "location_category";
    else if (l.includes("date") || l.includes("visit")) map[i] = "expected_visit_date";
  });
  return map;
}

export default function CsvImportModal({
  sheets, defaultSheetId, existingPhones, canCreateSheet, createSheet, insertClients, onClose, onDone,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [data, setData] = useState<string[][]>([]);
  const [fileName, setFileName] = useState("");
  const [hasHeaders, setHasHeaders] = useState(true);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [newSheetName, setNewSheetName] = useState("");
  const [existingSheet, setExistingSheet] = useState<string | null>(
    canCreateSheet ? null : defaultSheetId ?? sheets[0]?.id ?? null
  );
  const [importing, setImporting] = useState(false);

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".csv")) {
      alert("Please upload a CSV file only.");
      e.target.value = "";
      return;
    }
    setFileName(file.name);
    setNewSheetName(file.name.replace(/\.[^/.]+$/, ""));
    const reader = new FileReader();
    reader.onload = () => {
      const rows = parseCSV(reader.result as string);
      setData(rows);
      setMapping(autoMap(rows[0] || []));
    };
    reader.readAsText(file);
  };

  const reset = () => {
    setData([]);
    setMapping({});
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleImport = async () => {
    if (!existingSheet && !newSheetName.trim()) {
      alert("Please enter a sheet name or select an existing sheet.");
      return;
    }
    const rows = (hasHeaders ? data.slice(1) : data).filter((r) => r.some((c) => c.trim()));
    const clients: Record<string, string | null>[] = [];
    for (const row of rows) {
      const c: Record<string, string | null> = {
        client_name: "", customer_number: null, lead_stage: "follow_up_req", lead_type: "cold",
        location_category: null, calling_comment: null, expected_visit_date: null, deal_status: "open",
      };
      for (const [idx, field] of Object.entries(mapping)) {
        const v = row[+idx]?.trim();
        if (!v || !field) continue;
        const l = v.toLowerCase();
        if (field === "lead_stage") {
          if (l.includes("follow") || l.includes("req")) c.lead_stage = "follow_up_req";
          else if (l.includes("dnp")) c.lead_stage = "dnp";
          else if (l.includes("disqualified")) c.lead_stage = "disqualified";
          else if (l.includes("cb") || l.includes("callback") || l.includes("month")) c.lead_stage = "callback_required";
        } else if (field === "lead_type") {
          c.lead_type = l.includes("hot") ? "hot" : l.includes("warm") ? "warm" : "cold";
        } else if (field === "expected_visit_date") {
          c.expected_visit_date = parseDate(v);
        } else c[field] = v;
      }
      if (c.client_name) clients.push(c);
    }
    if (!clients.length) {
      alert("No valid clients found to import. Please ensure Client Name is mapped.");
      return;
    }

    // skip duplicate phones (already in sheet or repeated in file)
    const seen = new Set(existingPhones.map(normPhone));
    const unique = clients.filter((c) => {
      if (!c.customer_number) return true;
      const p = normPhone(c.customer_number);
      if (seen.has(p)) return false;
      seen.add(p);
      return true;
    });
    const skipped = clients.length - unique.length;
    if (!unique.length) {
      alert(`All ${clients.length} clients were skipped as duplicates (phone numbers already exist).`);
      return;
    }

    setImporting(true);
    try {
      const sheetId = existingSheet ?? (await createSheet(newSheetName.trim()));
      const count = await insertClients(unique.map((c) => ({ ...c, sheet_id: sheetId })));
      const name = sheets.find((s) => s.id === sheetId)?.name ?? newSheetName.trim();
      onDone(sheetId, `Successfully imported ${count} clients to "${name}"!${skipped ? ` (${skipped} duplicates skipped)` : ""}`);
    } catch (err) {
      alert(`Failed to import clients: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setImporting(false);
    }
  };

  const headers = data[0] || [];
  const preview = hasHeaders ? data.slice(1, 6) : data.slice(0, 5);
  const count = hasHeaders ? data.length - 1 : data.length;

  return (
    <motion.div
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="modal-content crm-modal crm-import-modal"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {!data.length ? (
          <div className="import-upload-area" onClick={() => fileRef.current?.click()}>
            <input ref={fileRef} type="file" accept=".csv" onChange={onFile} style={{ display: "none" }} />
            <div className="import-dropzone">
              <div className="import-dropzone-icon"><Upload className="w-10 h-10" /></div>
              <div className="import-dropzone-text">
                <span className="import-dropzone-title">Upload your CSV file</span>
                <span className="import-dropzone-subtitle">Click to browse</span>
              </div>
              <div className="import-dropzone-badge">
                <FileSpreadsheet className="w-4 h-4" />
                <span>CSV files only</span>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="import-file-info">
              <div>
                <div className="font-medium text-gray-900">{fileName}</div>
                <div className="text-sm text-gray-500">
                  {count} rows • {Object.keys(mapping).length} columns mapped
                </div>
              </div>
            </div>

            <div className="import-sheet-section">
              <div className="import-section-header">
                <span className="import-section-title">Import to Sheet</span>
              </div>
              <div className="import-sheet-options">
                {canCreateSheet && (
                  <div
                    className={`import-sheet-option ${!existingSheet ? "selected" : ""}`}
                    onClick={() => setExistingSheet(null)}
                  >
                    <div className="import-sheet-radio" />
                    <div className="import-sheet-content">
                      <div className="import-sheet-label">Create New Sheet</div>
                      <input
                        type="text"
                        className="import-sheet-input"
                        placeholder="e.g., January 2026 Leads"
                        value={newSheetName}
                        onChange={(e) => { setNewSheetName(e.target.value); setExistingSheet(null); }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                )}
                {sheets.length > 0 && (
                  <div
                    className={`import-sheet-option ${existingSheet ? "selected" : ""}`}
                    onClick={() => setExistingSheet(existingSheet ?? defaultSheetId ?? sheets[0].id)}
                  >
                    <div className="import-sheet-radio" />
                    <div className="import-sheet-content">
                      <div className="import-sheet-label">Add to Existing Sheet</div>
                      <select
                        className="import-sheet-select"
                        value={existingSheet || ""}
                        onChange={(e) => setExistingSheet(e.target.value || null)}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {canCreateSheet && <option value="">Select a sheet...</option>}
                        {sheets.map((s) => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="import-mapping-section">
              <div className="import-mapping-header">
                <div className="import-mapping-info">
                  <h3>Map Columns</h3>
                  <p>Map your CSV columns to CRM fields.</p>
                </div>
                <label className="import-header-toggle">
                  <input
                    type="checkbox"
                    checked={hasHeaders}
                    onChange={(e) => {
                      setHasHeaders(e.target.checked);
                      setMapping(e.target.checked ? autoMap(headers) : {});
                    }}
                  />
                  First row contains headers
                </label>
              </div>
              <div className="import-column-cards">
                {headers.map((_, i) => {
                  const label = hasHeaders ? headers[i] : `Column ${i + 1}`;
                  const sample = hasHeaders ? data[1]?.[i] || "" : headers[i];
                  const val = mapping[i] || "";
                  return (
                    <div key={i} className={`import-column-card ${val ? "mapped" : "skipped"}`}>
                      <div className="import-column-source">
                        <span className="import-column-name" title={label}>{label}</span>
                        <span className="import-column-sample">Sample: <span>{sample || "(empty)"}</span></span>
                      </div>
                      <div className="import-column-target">
                        <select value={val} onChange={(e) => setMapping((m) => ({ ...m, [i]: e.target.value }))}>
                          <option value="">-- Skip Column --</option>
                          {FIELDS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="import-preview-section">
              <div className="import-preview-header">
                <span className="import-preview-title"><FileSpreadsheet className="w-4 h-4" />Data Preview</span>
                <span className="import-preview-count">{count} records found</span>
              </div>
              <div className="import-preview-table-wrapper">
                <table className="import-preview-table">
                  <thead>
                    <tr>{headers.map((h, i) => <th key={i}>{hasHeaders ? h : `Col ${i + 1}`}</th>)}</tr>
                  </thead>
                  <tbody>
                    {preview.map((r, i) => (
                      <tr key={i}>{r.map((c, j) => <td key={j} title={c}>{c}</td>)}</tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="import-modal-actions">
              <button className="import-btn-secondary" onClick={reset}>Back to Upload</button>
              <button
                className="import-btn-primary"
                onClick={handleImport}
                disabled={importing || !Object.values(mapping).includes("client_name")}
              >
                <CheckCircle className="w-4 h-4" />
                {importing ? "Importing..." : "Import Clients"}
              </button>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
