import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, GearItem, GearChecklist, QuizAnswers } from '../types';
import { auth, db } from '../config/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

interface AppContextType {
  user: User | null;
  currentChecklist: GearChecklist | null;
  recommendedGear: GearItem[];
  setCurrentChecklist: (checklist: GearChecklist | null) => void;
  setRecommendedGear: (gear: GearItem[]) => void;
  generateRecommendations: (answers: QuizAnswers) => Promise<void>;
  saveChecklist: (checklist: GearChecklist) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [currentChecklist, setCurrentChecklist] = useState<GearChecklist | null>(null);
  const [recommendedGear, setRecommendedGear] = useState<GearItem[]>([]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        setUser({
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || '',
          photoURL: firebaseUser.photoURL || undefined,
        });
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const generateRecommendations = async (answers: QuizAnswers) => {
    try {
      // Query Firestore for gear items matching the criteria
      const gearRef = collection(db, 'gear');
      const q = query(
        gearRef,
        where('activity', '==', answers.activity),
        where('season', '==', answers.season),
        where('experienceLevel', '==', answers.experienceLevel)
      );

      const querySnapshot = await getDocs(q);
      const gear: GearItem[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data() as GearItem;
        if (data.price <= answers.budget) {
          gear.push({ ...data, id: doc.id });
        }
      });

      setRecommendedGear(gear);
    } catch (error) {
      console.error('Error generating recommendations:', error);
    }
  };

  const saveChecklist = async (checklist: GearChecklist) => {
    try {
      // TODO: Implement saving checklist to Firestore
      console.log('Saving checklist:', checklist);
    } catch (error) {
      console.error('Error saving checklist:', error);
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        currentChecklist,
        recommendedGear,
        setCurrentChecklist,
        setRecommendedGear,
        generateRecommendations,
        saveChecklist,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}; 