import { useState, useCallback } from "react";
import { type AttributeDefinition, calculateItemPower, saveAttributeDefinitions } from "./attributes";
import { AVAILABLE_ICONS, ATTRIBUTE_COLORS } from "./iconPicker";
import { LucideIcon } from "./LucideIcon";
import { Trash2, Plus, Check, X } from "lucide-react";

interface AttrFormState {
  name: string;
  icon: string;
  color: string;
  powerRatio: string;
  divideByCharges: boolean;
  multiplier: boolean;
}

function defaultFormState(): AttrFormState {
  return {
    name: "",
    icon: AVAILABLE_ICONS[0],
    color: ATTRIBUTE_COLORS[0] ?? "#f7768e",
    powerRatio: "1",
    divideByCharges: true,
    multiplier: false,
  };
}

function formStateFromDef(def: AttributeDefinition): AttrFormState {
  return {
    name: def.name,
    icon: def.icon,
    color: def.color,
    powerRatio: String(def.powerRatio ?? 1),
    divideByCharges: def.perCharge !== false,
    multiplier: def.multiplier === true,
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
    perCharge: form.multiplier ? false : form.divideByCharges,
    multiplier: form.multiplier,
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
              {form.multiplier ? "Multiplier" : "Weight"}
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
          {!form.multiplier && (
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                cursor: "pointer",
                fontSize: 12,
                fontFamily: "'Inter', sans-serif",
                color: form.divideByCharges ? "#9ece6a" : "rgba(205,214,244,0.4)",
              }}
            >
              <input
                type="checkbox"
                checked={form.divideByCharges}
                onChange={(e) => onChange({ ...form, divideByCharges: e.target.checked })}
                style={{ accentColor: "#9ece6a" }}
              />
              ÷ Charges
            </label>
          )}
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              cursor: "pointer",
              fontSize: 12,
              fontFamily: "'Inter', sans-serif",
              color: form.multiplier ? "#bb9af7" : "rgba(205,214,244,0.4)",
            }}
          >
            <input
              type="checkbox"
              checked={form.multiplier}
              onChange={(e) => onChange({ ...form, multiplier: e.target.checked })}
              style={{ accentColor: "#bb9af7" }}
            />
            Multiplier
          </label>
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
  const badgeText = def.multiplier
    ? `×${def.powerRatio ?? 1} multiplier`
    : `${def.powerRatio ?? 1}×${def.perCharge !== false ? " ÷ charges" : ""}`;
  const badgeColor = def.multiplier ? "#bb9af7" : "rgba(205,214,244,0.4)";

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
          color: badgeColor,
          fontFamily: "'Inter', sans-serif",
          background: "rgba(205,214,244,0.06)",
          padding: "2px 8px",
          borderRadius: 4,
          whiteSpace: "nowrap",
        }}
      >
        {badgeText}
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

  const [calcCharges, setCalcCharges] = useState("4");
  const [calcValues, setCalcValues] = useState<Record<string, string>>({});

  const calcInputStyle = {
    background: "rgba(205,214,244,0.06)",
    border: "1px solid rgba(205,214,244,0.12)",
    borderRadius: 4,
    color: "#cdd6f4",
    fontSize: 12,
    fontFamily: "'Inter', sans-serif",
    outline: "none",
    width: 48,
    padding: "4px 6px",
    textAlign: "center" as const,
  };

  const calcAttrs = definitions.map((def) => ({
    attributeId: def.id,
    value: calcValues[def.id] ?? "1",
  }));
  const parsedCalcCharges = parseInt(calcCharges) || 1;
  const calcPower = definitions.length > 0
    ? calculateItemPower(calcAttrs, definitions, parsedCalcCharges)
    : 0;

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

      {definitions.length > 0 && (
        <div
          style={{
            marginTop: 24,
            padding: 16,
            background: "rgba(205,214,244,0.03)",
            borderRadius: 8,
            border: "1px solid rgba(205,214,244,0.06)",
          }}
        >
          <FieldLabel>Power Calculator</FieldLabel>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <span
              style={{
                fontSize: 12,
                color: "rgba(205,214,244,0.4)",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Charges
            </span>
            <input
              type="number"
              min="1"
              value={calcCharges}
              onChange={(e) => setCalcCharges(e.target.value)}
              style={calcInputStyle}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {definitions.map((def) => (
              <div
                key={def.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <LucideIcon name={def.icon} size={14} color={def.color} />
                <span
                  style={{
                    fontSize: 12,
                    color: def.color,
                    fontFamily: "'Inter', sans-serif",
                    minWidth: 80,
                  }}
                >
                  {def.name}
                </span>
                <input
                  type="number"
                  step="any"
                  value={calcValues[def.id] ?? "1"}
                  onChange={(e) =>
                    setCalcValues((prev) => ({ ...prev, [def.id]: e.target.value }))
                  }
                  style={calcInputStyle}
                />
              </div>
            ))}
          </div>
          <div
            style={{
              marginTop: 12,
              paddingTop: 10,
              borderTop: "1px solid rgba(205,214,244,0.08)",
              display: "flex",
              alignItems: "baseline",
              gap: 6,
            }}
          >
            <span
              style={{
                fontSize: 12,
                color: "rgba(205,214,244,0.4)",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Power =
            </span>
            <span
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: "#7aa2f7",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {calcPower}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
