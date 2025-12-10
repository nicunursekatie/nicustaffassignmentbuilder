import { 
  collection, 
  doc, 
  getDoc,
  setDoc,
  query,
  where,
  getDocs,
  orderBy
} from 'firebase/firestore';
import { db } from '../firebase';

const SHIFTS_COLLECTION = 'shifts';

/**
 * Save shift data (including baby assignments) to Firestore
 * @param {string} shiftDate - Date of the shift (YYYY-MM-DD)
 * @param {string} shiftTime - Shift time (e.g., '7P-7A')
 * @param {Object} shiftData - All shift data including roomBabies, roomAssignments, etc.
 * @returns {Promise<void>}
 */
export const saveShift = async (shiftDate, shiftTime, shiftData) => {
  try {
    const shiftId = `${shiftDate}_${shiftTime}`;
    const shiftRef = doc(db, SHIFTS_COLLECTION, shiftId);
    
    await setDoc(shiftRef, {
      shiftDate,
      shiftTime,
      ...shiftData,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    
    console.log(`Shift data saved for ${shiftDate} ${shiftTime}`);
  } catch (error) {
    console.error('Error saving shift:', error);
    throw error;
  }
};

/**
 * Load shift data from Firestore
 * @param {string} shiftDate - Date of the shift (YYYY-MM-DD)
 * @param {string} shiftTime - Shift time (e.g., '7P-7A')
 * @returns {Promise<Object|null>} Shift data or null if not found
 */
export const loadShift = async (shiftDate, shiftTime) => {
  try {
    const shiftId = `${shiftDate}_${shiftTime}`;
    const shiftRef = doc(db, SHIFTS_COLLECTION, shiftId);
    const shiftSnap = await getDoc(shiftRef);
    
    if (shiftSnap.exists()) {
      return shiftSnap.data();
    }
    return null;
  } catch (error) {
    console.error('Error loading shift:', error);
    throw error;
  }
};

/**
 * Save only baby assignments for a shift
 * @param {string} shiftDate - Date of the shift (YYYY-MM-DD)
 * @param {string} shiftTime - Shift time (e.g., '7P-7A')
 * @param {Object} roomBabies - Map of roomId to array of babies
 * @returns {Promise<void>}
 */
export const saveBabyAssignments = async (shiftDate, shiftTime, roomBabies) => {
  try {
    const shiftId = `${shiftDate}_${shiftTime}`;
    const shiftRef = doc(db, SHIFTS_COLLECTION, shiftId);
    
    await setDoc(shiftRef, {
      shiftDate,
      shiftTime,
      roomBabies,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    
    console.log(`Baby assignments saved for ${shiftDate} ${shiftTime}`);
  } catch (error) {
    console.error('Error saving baby assignments:', error);
    throw error;
  }
};

