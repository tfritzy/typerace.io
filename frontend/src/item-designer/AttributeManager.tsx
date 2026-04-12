import { useState, useCallback } from "react";
import { type AttributeDefinition, type PowerCalculation, saveAttributeDefinitions, resolvePowerCalculation } from "./attributes";
import { AVAILABLE_ICONS, ATTRIBUTE_COLORS } from "./iconPicker";
import { LucideIcon } from "./LucideIcon";
import { Trash2, Plus, Pencil, Check } from "lucide-react";

const POWER_CALC_OPTIONS: { value: PowerCalculation; label: string; icon: string }[] = [
  { value: "perCharge", label: "/chg", icon: "⚡" },
  { value: "flat", label: "flat", icon: "―" },
  { value: "multiplier", label: "×mult", icon: "×" },
];

const POWER_CALC_COLORS: Record<PowerCalculation, string> = {
  perCharge: "rgba(158,206,106,0.5)",
  flat: "rgba(205,214,244,0.25)",
  multiplier: "rgba(187,154,247,0.5)",
};

const POWER_CALC_ACTIVE_COLORS: Record<PowerCalculation, { bg: string; border: string; text: string }> = {
  perCharge: { bg: "rgba(158,206,106,0.15)", border: "rgba(158,206,106,0.4)", text: "#9ece6a" },
  flat: { bg: "rgba(205,214,244,0.1)", border: "rgba(205,214,244,0.3)", text: "#cdd6f4" },
  multiplier: { bg: "rgba(187,154,247,0.15)", border: "rgba(187,154,247,0.4)", text: "#bb9af7" },
};

const POWER_CALC_TOOLTIPS: Record<PowerCalculation, string> = {
  perCharge: "Per charge (divides by charges)",
  flat: "Flat (not divided by charges)",
  multiplier: "Multiplier (multiplies total power)",
};

interface AttrFormState {
  name: string;
  icon: string;
  color: string;
  powerRatio: string;
  powerCalc: PowerCalculation;
}

function defaultFormState(): AttrFormState {
  return {
    name: "",
    icon: AVAILABLE_ICONS[0],
    color: ATTRIBUTE_COLORS[0] ?? "#f7768e",
    powerRatio: "1",
    powerCalc: "perCharge",
  };
}

function formStateFromDef(def: AttributeDefinition): AttrFormState {
  return {
    name: def.name,
    icon: def.icon,
    color: def.color,
    powerRatio: String(def.powerRatio ?? 1),
    powerCalc: resolvePowerCalculation(def),
  };
}

function formStateToDef(form: AttrFormState, id: string): AttributeDefinition {
  const parsed = parseFloat(form.powerRatio);
  return {
    id,
    name: form.name.trim(),
    icon: form.icon,
    color: form.color,
    powerRatio: isNaN(parsed) ? 1 : parsed,
    perCharge: form.powerCalc === "perCharge",
    powerCalculation: form.powerCalc,
  };
}

interface AttributeFormProps {
  form: AttrFormState;
  onChange: (form: AttrFormState) => void;
  onSubmit: () => void;
  onCancel?: () => void;
  submitLabel: string;
  submitIcon: React.ReactNode;
  compact?: boolean;
  autoFocusName?: boolean;
}

function AttributeForm({ form, onChange, onSubmit, onCancel, submitLabel, submitIcon, compact, autoFocusName }: AttributeFormProps) {
  const canSubmit = form.name.trim().length > 0;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && canSubmit) onSubmit();
    if (e.key === "Escape" && onCancel) onCancel();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div
        style={{
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <input
          value={form.name}
          onChange={(e) => onChange({ ...form, name: e.target.value })}
          onKeyDown={handleKeyDown}
          autoFocus={autoFocusName}
          placeholder="Attribute name..."
          style={{
            background: "rgba(205,214,244,0.06)",
            border: "1px solid rgba(205,214,244,0.15)",
            borderRadius: 6,
            color: form.color,
            padding: compact ? "6px 10px" : "8px 12px",
            fontSize: 14,
            fontFamily: "'Inter', sans-serif",
            outline: "none",
            flex: 1,
            minWidth: 120,
          }}
        />
        <select
          value={form.icon}
          onChange={(e) => onChange({ ...form, icon: e.target.value })}
          style={{
            background: "rgba(205,214,244,0.06)",
            border: "1px solid rgba(205,214,244,0.15)",
            borderRadius: 6,
            color: "#cdd6f4",
            padding: compact ? "6px 8px" : "8px 10px",
            fontSize: 13,
            fontFamily: "'Inter', sans-serif",
            outline: "none",
          }}
        >
          {AVAILABLE_ICONS.map((icon) => (
            <option key={icon} value={icon}>
              {icon}
            </option>
          ))}
        </select>
        <input
          type="number"
          step="any"
          value={form.powerRatio}
          onChange={(e) => onChange({ ...form, powerRatio: e.target.value })}
          onKeyDown={handleKeyDown}
          placeholder="Power ratio"
          title="Power ratio"
          style={{
            width: 80,
            background: "rgba(205,214,244,0.06)",
            border: "1px solid rgba(205,214,244,0.15)",
            borderRadius: 6,
            color: "#cdd6f4",
            padding: compact ? "6px 8px" : "8px 10px",
            fontSize: 13,
            fontFamily: "'Inter', sans-serif",
            outline: "none",
            textAlign: "center",
          }}
        />
        <div style={{ display: "flex", gap: 2 }}>
          {POWER_CALC_OPTIONS.map((opt) => {
            const isActive = form.powerCalc === opt.value;
            const colors = POWER_CALC_ACTIVE_COLORS[opt.value];
            return (
              <button
                key={opt.value}
                onClick={() => onChange({ ...form, powerCalc: opt.value })}
                title={POWER_CALC_TOOLTIPS[opt.value]}
                style={{
                  background: isActive ? colors.bg : "rgba(205,214,244,0.06)",
                  border: isActive
                    ? `1px solid ${colors.border}`
                    : "1px solid rgba(205,214,244,0.15)",
                  borderRadius: 6,
                  color: isActive ? colors.text : "rgba(205,214,244,0.5)",
                  padding: compact ? "6px 6px" : "8px 8px",
                  fontSize: 11,
                  fontFamily: "'Inter', sans-serif",
                  cursor: "pointer",
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                }}
              >
                {opt.icon} {opt.label}
              </button>
            );
          })}
        </div>
        <button
          onClick={onSubmit}
          disabled={!canSubmit}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "#7aa2f7",
            border: "none",
            borderRadius: 6,
            color: "#1a1b26",
            padding: compact ? "6px 10px" : "8px 14px",
            fontSize: 13,
            fontWeight: 600,
            cursor: canSubmit ? "pointer" : "not-allowed",
            opacity: canSubmit ? 1 : 0.4,
          }}
        >
          {submitIcon}
          {submitLabel}
        </button>
        {onCancel && (
          <button
            onClick={onCancel}
            style={{
              background: "transparent",
              border: "1px solid rgba(205,214,244,0.15)",
              borderRadius: 6,
              color: "rgba(205,214,244,0.5)",
              padding: compact ? "6px 10px" : "8px 14px",
              fontSize: 13,
              fontFamily: "'Inter', sans-serif",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        )}
      </div>
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
        {ATTRIBUTE_COLORS.map((c) => (
          <button
            key={c}
            onClick={() => onChange({ ...form, color: c })}
            style={{
              width: compact ? 22 : 24,
              height: compact ? 22 : 24,
              borderRadius: 4,
              background: c,
              border: form.color === c ? "2px solid #cdd6f4" : "2px solid transparent",
              cursor: "pointer",
              padding: 0,
            }}
          />
        ))}
      </div>
    </div>
  );
}

interface AttributeRowProps {
  def: AttributeDefinition;
  onEdit: () => void;
  onRemove: () => void;
}

function AttributeRow({ def, onEdit, onRemove }: AttributeRowProps) {
  const calc = resolvePowerCalculation(def);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 12px",
        borderBottom: "1px solid rgba(205,214,244,0.06)",
      }}
    >
      <LucideIcon name={def.icon} size={20} color={def.color} />
      <span
        style={{
          flex: 1,
          fontSize: 14,
          color: def.color,
          fontFamily: "'Inter', sans-serif",
        }}
      >
        {def.name}
      </span>
      <span
        style={{
          fontSize: 11,
          color: "rgba(205,214,244,0.35)",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        ×{def.powerRatio ?? 1}
      </span>
      <span
        style={{
          fontSize: 9,
          color: POWER_CALC_COLORS[calc],
          fontFamily: "'Inter', sans-serif",
        }}
      >
        {POWER_CALC_OPTIONS.find((o) => o.value === calc)?.label ?? "flat"}
      </span>
      <button
        onClick={onEdit}
        style={{
          background: "transparent",
          border: "none",
          cursor: "pointer",
          color: "rgba(205,214,244,0.3)",
          padding: 4,
          display: "flex",
        }}
      >
        <Pencil size={16} />
      </button>
      <button
        onClick={onRemove}
        style={{
          background: "transparent",
          border: "none",
          cursor: "pointer",
          color: "rgba(205,214,244,0.3)",
          padding: 4,
          display: "flex",
        }}
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}

interface AttributeManagerProps {
  definitions: AttributeDefinition[];
  onChange: (defs: AttributeDefinition[]) => void;
  onBack?: () => void;
  compact?: boolean;
}

export function AttributeManager({
  definitions,
  onChange,
  onBack,
  compact,
}: AttributeManagerProps) {
  const [addForm, setAddForm] = useState<AttrFormState>(defaultFormState);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<AttrFormState>(defaultFormState);
  const [saveError, setSaveError] = useState<string | null>(null);

  const persist = useCallback(
    (next: AttributeDefinition[]) => {
      onChange(next);
      setSaveError(null);
      saveAttributeDefinitions(next).catch((err) => {
        console.error("Failed to save attribute definitions:", err);
        setSaveError(String(err?.message || err));
      });
    },
    [onChange]
  );

  const handleAdd = () => {
    if (!addForm.name.trim()) return;
    const def = formStateToDef(addForm, crypto.randomUUID());
    persist([...definitions, def]);
    setAddForm(defaultFormState());
  };

  const startEditing = (def: AttributeDefinition) => {
    setEditingId(def.id);
    setEditForm(formStateFromDef(def));
  };

  const commitEdit = () => {
    if (!editingId || !editForm.name.trim()) {
      setEditingId(null);
      return;
    }
    persist(
      definitions.map((d) =>
        d.id === editingId ? formStateToDef(editForm, editingId) : d
      )
    );
    setEditingId(null);
  };

  const handleRemove = (id: string) => {
    if (editingId === id) setEditingId(null);
    persist(definitions.filter((d) => d.id !== id));
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        padding: compact ? 16 : 24,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: compact ? 16 : 20,
        }}
      >
        {onBack && (
          <button
            onClick={onBack}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "#7aa2f7",
              fontSize: 22,
              padding: "4px 8px 4px 0",
              flexShrink: 0,
            }}
          >
            ←
          </button>
        )}
        <h2
          style={{
            fontSize: compact ? 15 : 18,
            fontWeight: 600,
            margin: 0,
            color: "#cdd6f4",
          }}
        >
          Attribute Definitions
        </h2>
      </div>

      {saveError && (
        <div
          style={{
            background: "rgba(247,118,142,0.15)",
            border: "1px solid rgba(247,118,142,0.3)",
            borderRadius: 6,
            padding: "8px 12px",
            marginBottom: 12,
            fontSize: 12,
            color: "#f7768e",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          Save failed: {saveError}
        </div>
      )}

      <div style={{ marginBottom: 20 }}>
        <AttributeForm
          form={addForm}
          onChange={setAddForm}
          onSubmit={handleAdd}
          submitLabel="Add"
          submitIcon={<Plus size={16} />}
          compact={compact}
        />
      </div>

      <div style={{ flex: 1, overflowY: "auto" }}>
        {definitions.length === 0 && (
          <div
            style={{
              color: "rgba(205,214,244,0.3)",
              fontSize: 14,
              padding: "20px 0",
              textAlign: "center",
            }}
          >
            No attributes defined yet
          </div>
        )}
        {definitions.map((def) =>
          editingId === def.id ? (
            <div
              key={def.id}
              style={{
                padding: "10px 12px",
                borderBottom: "1px solid rgba(205,214,244,0.06)",
              }}
            >
              <AttributeForm
                form={editForm}
                onChange={setEditForm}
                onSubmit={commitEdit}
                onCancel={() => setEditingId(null)}
                submitLabel="Save"
                submitIcon={<Check size={16} />}
                compact={compact}
                autoFocusName
              />
            </div>
          ) : (
            <AttributeRow
              key={def.id}
              def={def}
              onEdit={() => startEditing(def)}
              onRemove={() => handleRemove(def.id)}
            />
          )
        )}
      </div>
    </div>
  );
}
