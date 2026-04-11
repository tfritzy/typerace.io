import { db } from "./firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

const COLLECTION = "item-notes";

export async function loadNote(itemName: string): Promise<string> {
  const ref = doc(db, COLLECTION, itemName);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    return (snap.data() as { text: string }).text;
  }
  return "";
}

export async function saveNote(itemName: string, text: string): Promise<void> {
  const ref = doc(db, COLLECTION, itemName);
  await setDoc(ref, { text }, { merge: true });
}
