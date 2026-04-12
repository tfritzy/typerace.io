import { db } from "./firestore";
import { doc, getDoc, setDoc, collection, getDocs } from "firebase/firestore";

export type PowerCalculation = "perCharge" | "flat" | "multiplier";

export interface AttributeDefinition {
  id: string;
  name: string;
  icon: string;
  color: string;
  powerRatio: number;
  perCharge: boolean;
  powerCalculation: PowerCalculation;
}

export interface ItemAttribute {
  attributeId: string;
  value: string;
}

const META_COLLECTION = "item-meta";
const ATTR_DEFS_DOC = "attribute-definitions";
const ITEM_ATTRS_COLLECTION = "item-attributes";

export async function loadAttributeDefinitions(): Promise<AttributeDefinition[]> {
  const ref = doc(db, META_COLLECTION, ATTR_DEFS_DOC);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    const data = snap.data() as { definitions?: AttributeDefinition[] };
    return data.definitions ?? [];
  }
  return [];
}

export async function saveAttributeDefinitions(
  defs: AttributeDefinition[]
): Promise<void> {
  try {
    const ref = doc(db, META_COLLECTION, ATTR_DEFS_DOC);
    await setDoc(ref, { definitions: defs });
  } catch (err) {
    console.error("Failed to save attribute definitions:", err);
    throw err;
  }
}

export async function loadItemAttributes(
  itemName: string
): Promise<ItemAttribute[]> {
  const ref = doc(db, ITEM_ATTRS_COLLECTION, itemName);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    const data = snap.data() as { attrs?: ItemAttribute[] };
    return data.attrs ?? [];
  }
  return [];
}

export async function saveItemAttributes(
  itemName: string,
  attrs: ItemAttribute[]
): Promise<void> {
  try {
    const ref = doc(db, ITEM_ATTRS_COLLECTION, itemName);
    await setDoc(ref, { attrs });
  } catch (err) {
    console.error(`Failed to save attributes for ${itemName}:`, err);
    throw err;
  }
}

export async function loadAllItemAttributes(): Promise<Record<string, ItemAttribute[]>> {
  const colRef = collection(db, ITEM_ATTRS_COLLECTION);
  const snap = await getDocs(colRef);
  const result: Record<string, ItemAttribute[]> = {};
  snap.forEach((docSnap) => {
    const data = docSnap.data() as { attrs?: ItemAttribute[] };
    result[docSnap.id] = data.attrs ?? [];
  });
  return result;
}

export function resolvePowerCalculation(def: AttributeDefinition): PowerCalculation {
  if (def.powerCalculation) return def.powerCalculation;
  return def.perCharge ? "perCharge" : "flat";
}

export function calculateItemPower(
  attributes: ItemAttribute[],
  definitions: AttributeDefinition[],
  charges: number
): number {
  const defMap = new Map(definitions.map((d) => [d.id, d]));
  let perChargePower = 0;
  let flatPower = 0;
  let multiplier = 1;
  for (const attr of attributes) {
    const def = defMap.get(attr.attributeId);
    if (!def) continue;
    const parsed = parseFloat(attr.value);
    const calc = resolvePowerCalculation(def);
    if (calc === "multiplier") {
      const mult = !isNaN(parsed) ? parsed : 1;
      multiplier *= mult;
    } else {
      const raw = !isNaN(parsed) ? parsed * def.powerRatio : def.powerRatio;
      if (calc === "perCharge") {
        perChargePower += raw;
      } else {
        flatPower += raw;
      }
    }
  }
  const divisor = Math.max(charges, 1);
  const total = (perChargePower / divisor + flatPower) * multiplier;
  return Math.round(total * 100) / 100;
}
