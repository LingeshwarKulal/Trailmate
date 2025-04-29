import { db } from '../config/firebase';
import { collection, addDoc, getDocs, query, where, doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { GearItem, GearChecklist, Review } from '../types';

// Gear Items
export const addGearItem = async (gearItem: Omit<GearItem, 'id'>) => {
  try {
    const docRef = await addDoc(collection(db, 'gear'), gearItem);
    return { ...gearItem, id: docRef.id };
  } catch (error) {
    console.error('Error adding gear item:', error);
    throw error;
  }
};

export const getGearItems = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'gear'));
    return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as GearItem[];
  } catch (error) {
    console.error('Error getting gear items:', error);
    throw error;
  }
};

export const getGearItemsByCategory = async (category: string) => {
  try {
    const q = query(collection(db, 'gear'), where('category', '==', category));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as GearItem[];
  } catch (error) {
    console.error('Error getting gear items by category:', error);
    throw error;
  }
};

// Checklists
export const addChecklist = async (checklist: Omit<GearChecklist, 'id'>) => {
  try {
    const docRef = await addDoc(collection(db, 'checklists'), checklist);
    return { ...checklist, id: docRef.id };
  } catch (error) {
    console.error('Error adding checklist:', error);
    throw error;
  }
};

export const getUserChecklists = async (userId: string) => {
  try {
    const q = query(collection(db, 'checklists'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as GearChecklist[];
  } catch (error) {
    console.error('Error getting user checklists:', error);
    throw error;
  }
};

export const getChecklistById = async (checklistId: string) => {
  try {
    const docRef = doc(db, 'checklists', checklistId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { ...docSnap.data(), id: docSnap.id } as GearChecklist;
    } else {
      throw new Error('Checklist not found');
    }
  } catch (error) {
    console.error('Error getting checklist by ID:', error);
    throw error;
  }
};

export const updateChecklist = async (checklistId: string, data: Partial<GearChecklist>) => {
  try {
    const docRef = doc(db, 'checklists', checklistId);
    await updateDoc(docRef, data);
  } catch (error) {
    console.error('Error updating checklist:', error);
    throw error;
  }
};

export const deleteChecklist = async (checklistId: string) => {
  try {
    const docRef = doc(db, 'checklists', checklistId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting checklist:', error);
    throw error;
  }
};

// Reviews
export const addReview = async (gearItemId: string, review: Omit<Review, 'id'>) => {
  try {
    const docRef = await addDoc(collection(db, 'gear', gearItemId, 'reviews'), review);
    return { ...review, id: docRef.id };
  } catch (error) {
    console.error('Error adding review:', error);
    throw error;
  }
};

export const getGearItemReviews = async (gearItemId: string) => {
  try {
    const querySnapshot = await getDocs(collection(db, 'gear', gearItemId, 'reviews'));
    return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Review[];
  } catch (error) {
    console.error('Error getting gear item reviews:', error);
    throw error;
  }
}; 