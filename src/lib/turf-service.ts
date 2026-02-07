'use client';

import { app } from './firebase';
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
} from 'firebase/firestore';
import type { Turf } from './types';
import { turfs as defaultTurfs } from './data';

const db = getFirestore(app);
const turfsCollection = collection(db, 'turfs');

export type TurfDocument = Omit<Turf, 'id'> & { id?: string };

export async function getTurfsFromFirestore(): Promise<Turf[]> {
  try {
    const q = query(turfsCollection, orderBy('name'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Turf));
  } catch (error) {
    console.error('Error fetching turfs:', error);
    return [];
  }
}

export async function getAllTurfs(): Promise<Turf[]> {
  const turfs = await getTurfsFromFirestore();
  return turfs.length > 0 ? turfs : defaultTurfs;
}

export async function addTurf(turf: TurfDocument): Promise<Turf> {
  const { id: _id, ...data } = turf;
  const docRef = await addDoc(turfsCollection, {
    name: data.name,
    location: data.location,
    price: data.price,
    amenities: data.amenities,
    imageId: data.imageId,
  });
  return { id: docRef.id, ...data } as Turf;
}

export async function deleteTurf(turfId: string): Promise<void> {
  const turfDoc = doc(db, 'turfs', turfId);
  await deleteDoc(turfDoc);
}

export async function seedDefaultTurfs(turfs: TurfDocument[]): Promise<void> {
  for (const turf of turfs) {
    const { id: _id, ...data } = turf;
    await addDoc(turfsCollection, data);
  }
}
