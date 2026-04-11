import { db } from "./firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

const NOTES_COLLECTION = "item-notes";
const EXCLUDED_DOC = "item-exclusions";
const META_COLLECTION = "item-meta";

export async function loadNote(itemName: string): Promise<string> {
  const ref = doc(db, NOTES_COLLECTION, itemName);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    return (snap.data() as { text: string }).text;
  }
  return "";
}

export async function saveNote(itemName: string, text: string): Promise<void> {
  const ref = doc(db, NOTES_COLLECTION, itemName);
  await setDoc(ref, { text }, { merge: true });
}

export async function loadExcluded(): Promise<Set<string>> {
  const ref = doc(db, META_COLLECTION, EXCLUDED_DOC);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    const data = snap.data() as { items?: string[] };
    return new Set(data.items ?? []);
  }
  return new Set();
}

export async function saveExcluded(excluded: Set<string>): Promise<void> {
  const ref = doc(db, META_COLLECTION, EXCLUDED_DOC);
  await setDoc(ref, { items: [...excluded] });
}
