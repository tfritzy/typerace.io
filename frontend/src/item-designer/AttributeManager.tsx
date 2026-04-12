import { useState, useCallback } from "react";
import { type AttributeDefinition, type PowerCalculation, saveAttributeDefinitions, resolvePowerCalculation } from "./attributes";
import { AVAILABLE_ICONS, ATTRIBUTE_COLORS } from "./iconPicker";
import { LucideIcon } from "./LucideIcon";
import { Trash2, Plus, Check, X } from "lucide-react";

const CALC_OPTIONS: { value: PowerCalculation; label: string; hint: string }[] = [
  { value: "perCharge", label: "÷ Charges", hint: "value × weight is divided by charges — more charges = weaker per shot" },
  { value: "flat", label: "Flat", hint: "value × weight — unaffected by number of charges" },
  { value: "multiplier", label: "Multiplier", hint: "multiplies the total power from all other attributes" },
];

const CALC_COLORS: Record<PowerCalculation, string> = {
  perCharge: "#9ece6a",
  flat: "rgba(205,214,244,0.5)",
  multiplier: "#bb9af7",
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

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 10,
        fontWeight: 600,
        color: "rgba(205,214,244,0.3)",
        textTransform: "uppercase",
        letterSpacing: 1,
        marginBottom: 6,
      }}
    >
      {children}
    </div>
  );
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

  const inputStyle = {
    background: "rgba(205,214,244,0.06)",
    border: "1px solid rgba(205,214,244,0.12)",
    borderRadius: 4,
    color: "#cdd6f4",
    fontSize: 13,
    fontFamily: "'Inter', sans-serif",
    outline: "none",
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: compact ? 10 : 14,
        background: "rgba(205,214,244,0.03)",
        borderRadius: 8,
        padding: compact ? 12 : 16,
        border: "1px solid rgba(205,214,244,0.06)",
      }}
    >
      <div>
        <FieldLabel>Name</FieldLabel>
        <input
          value={form.name}
          onChange={(e) => onChange({ ...form, name: e.target.value })}
          onKeyDown={handleKeyDown}
          autoFocus={autoFocusName}
          placeholder="Attribute name..."
          style={{
            ...inputStyle,
            width: "100%",
            padding: "6px 10px",
            color: form.color,
            boxSizing: "border-box",
          }}
        />
      </div>

      <div>
        <FieldLabel>Icon</FieldLabel>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {AVAILABLE_ICONS.map((icon) => (
            <button
              key={icon}
              onClick={() => onChange({ ...form, icon })}
              title={icon}
              style={{
                width: 28,
                height: 28,
                borderRadius: 4,
                background: form.icon === icon ? "rgba(205,214,244,0.12)" : "transparent",
                border: form.icon === icon ? `2px solid ${form.color}` : "2px solid transparent",
                cursor: "pointer",
                padding: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <LucideIcon
                name={icon}
                size={16}
                color={form.icon === icon ? form.color : "rgba(205,214,244,0.35)"}
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <FieldLabel>Color</FieldLabel>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {ATTRIBUTE_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => onChange({ ...form, color: c })}
              style={{
                width: 20,
                height: 20,
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

      <div>
        <FieldLabel>Power Scaling</FieldLabel>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span
              style={{
                fontSize: 12,
                color: "rgba(205,214,244,0.4)",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Weight
            </span>
            <input
              type="number"
              step="any"
              value={form.powerRatio}
              onChange={(e) => onChange({ ...form, powerRatio: e.target.value })}
              onKeyDown={handleKeyDown}
              style={{
                ...inputStyle,
                width: 56,
                padding: "5px 6px",
                textAlign: "center",
              }}
            />
          </div>
          <div style={{ display: "flex", gap: 2 }}>
            {CALC_OPTIONS.map((opt) => {
              const active = form.powerCalc === opt.value;
              const color = CALC_COLORS[opt.value];
              return (
                <button
                  key={opt.value}
                  onClick={() => onChange({ ...form, powerCalc: opt.value })}
                  style={{
                    background: active ? `${color}18` : "rgba(205,214,244,0.04)",
                    border: active
                      ? `1px solid ${color}55`
                      : "1px solid rgba(205,214,244,0.1)",
                    borderRadius: 4,
                    color: active ? color : "rgba(205,214,244,0.35)",
                    padding: "5px 10px",
                    fontSize: 12,
                    fontFamily: "'Inter', sans-serif",
                    cursor: "pointer",
                    fontWeight: active ? 600 : 400,
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
        <div
          style={{
            marginTop: 6,
            fontSize: 11,
            color: CALC_COLORS[form.powerCalc],
            fontFamily: "'Inter', sans-serif",
            opacity: 0.7,
            lineHeight: 1.4,
          }}
        >
          {CALC_OPTIONS.find((o) => o.value === form.powerCalc)?.hint}
        </div>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
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
            padding: "7px 14px",
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
              display: "flex",
              alignItems: "center",
              gap: 4,
              background: "transparent",
              border: "1px solid rgba(205,214,244,0.12)",
              borderRadius: 6,
              color: "rgba(205,214,244,0.4)",
              padding: "7px 12px",
              fontSize: 13,
              fontFamily: "'Inter', sans-serif",
              cursor: "pointer",
            }}
          >
            <X size={14} />
            Cancel
          </button>
        )}
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
  const calcLabel = CALC_OPTIONS.find((o) => o.value === calc)?.label ?? "Flat";
  const calcColor = CALC_COLORS[calc];

  return (
    <div
      onClick={onEdit}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 12px",
        borderRadius: 6,
        cursor: "pointer",
        transition: "background 0.1s",
        background: "rgba(205,214,244,0.02)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(205,214,244,0.06)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "rgba(205,214,244,0.02)";
      }}
    >
      <LucideIcon name={def.icon} size={18} color={def.color} />
      <span
        style={{
          flex: 1,
          fontSize: 14,
          color: def.color,
          fontFamily: "'Inter', sans-serif",
          fontWeight: 500,
        }}
      >
        {def.name}
      </span>
      <span
        style={{
          fontSize: 11,
          color: calcColor,
          fontFamily: "'Inter', sans-serif",
          background: `${calcColor}12`,
          padding: "2px 8px",
          borderRadius: 4,
          whiteSpace: "nowrap",
        }}
      >
        {def.powerRatio ?? 1}× {calcLabel}
      </span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        style={{
          background: "transparent",
          border: "none",
          cursor: "pointer",
          color: "rgba(205,214,244,0.2)",
          padding: 4,
          display: "flex",
          flexShrink: 0,
        }}
      >
        <Trash2 size={14} />
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
  const [showAddForm, setShowAddForm] = useState(false);

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
    setShowAddForm(false);
  };

  const startEditing = (def: AttributeDefinition) => {
    setEditingId(def.id);
    setEditForm(formStateFromDef(def));
    setShowAddForm(false);
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
        overflow: "auto",
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
            flex: 1,
          }}
        >
          Attributes
        </h2>
        {!showAddForm && !editingId && (
          <button
            onClick={() => {
              setShowAddForm(true);
              setEditingId(null);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              background: "rgba(122,162,247,0.1)",
              border: "1px solid rgba(122,162,247,0.25)",
              borderRadius: 6,
              color: "#7aa2f7",
              padding: "6px 12px",
              fontSize: 12,
              fontWeight: 600,
              fontFamily: "'Inter', sans-serif",
              cursor: "pointer",
            }}
          >
            <Plus size={14} />
            New
          </button>
        )}
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

      {showAddForm && (
        <div style={{ marginBottom: 16 }}>
          <AttributeForm
            form={addForm}
            onChange={setAddForm}
            onSubmit={handleAdd}
            onCancel={() => {
              setShowAddForm(false);
              setAddForm(defaultFormState());
            }}
            submitLabel="Add Attribute"
            submitIcon={<Plus size={14} />}
            compact={compact}
            autoFocusName
          />
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {definitions.length === 0 && !showAddForm && (
          <div
            style={{
              color: "rgba(205,214,244,0.25)",
              fontSize: 13,
              padding: "32px 0",
              textAlign: "center",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            No attributes yet. Click <strong style={{ color: "#7aa2f7" }}>+ New</strong> to create one.
          </div>
        )}
        {definitions.map((def) =>
          editingId === def.id ? (
            <div key={def.id} style={{ marginBottom: 4 }}>
              <AttributeForm
                form={editForm}
                onChange={setEditForm}
                onSubmit={commitEdit}
                onCancel={() => setEditingId(null)}
                submitLabel="Save"
                submitIcon={<Check size={14} />}
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
