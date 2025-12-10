import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  orderBy 
} from 'firebase/firestore';
import { db } from '../firebase';

const STAFF_COLLECTION = 'staff';

/**
 * Get all staff members from Firestore
 * @returns {Promise<Array>} Array of staff objects with Firestore IDs
 */
export const getAllStaff = async () => {
  try {
    const staffRef = collection(db, STAFF_COLLECTION);
    const q = query(staffRef, orderBy('lastName'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching staff:', error);
    throw error;
  }
};

/**
 * Add a new staff member
 * @param {Object} staffData - Staff member data
 * @param {string} staffData.lastName - Last name
 * @param {string} staffData.firstName - First name (optional)
 * @param {string} staffData.phone - Phone extension
 * @param {string} staffData.extension - Work extension number (optional)
 * @param {string} staffData.role - Role (default: 'RN')
 * @returns {Promise<string>} Document ID of the new staff member
 */
export const addStaff = async (staffData) => {
  try {
    const staffRef = collection(db, STAFF_COLLECTION);
    const docRef = await addDoc(staffRef, {
      lastName: staffData.lastName,
      firstName: staffData.firstName || '',
      phone: staffData.phone || '',
      extension: staffData.extension || '',
      role: staffData.role || 'RN',
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding staff:', error);
    throw error;
  }
};

/**
 * Update an existing staff member
 * @param {string} staffId - Firestore document ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<void>}
 */
export const updateStaff = async (staffId, updates) => {
  try {
    const staffRef = doc(db, STAFF_COLLECTION, staffId);
    await updateDoc(staffRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating staff:', error);
    throw error;
  }
};

/**
 * Delete a staff member
 * @param {string} staffId - Firestore document ID
 * @returns {Promise<void>}
 */
export const deleteStaff = async (staffId) => {
  try {
    const staffRef = doc(db, STAFF_COLLECTION, staffId);
    await deleteDoc(staffRef);
  } catch (error) {
    console.error('Error deleting staff:', error);
    throw error;
  }
};

/**
 * Migrate initial staff data to Firestore (one-time use)
 * @param {Array} initialStaff - Array of staff objects
 * @returns {Promise<void>}
 */
export const migrateInitialStaff = async (initialStaff) => {
  try {
    // Check if staff already exists
    const existingStaff = await getAllStaff();
    if (existingStaff.length > 0) {
      console.log('Staff already exists in database. Skipping migration.');
      return;
    }

    // Add all staff members
    const staffRef = collection(db, STAFF_COLLECTION);
    const promises = initialStaff.map(staff => 
      addDoc(staffRef, {
        lastName: staff.lastName,
        firstName: staff.firstName || '',
        phone: staff.phone || '',
        extension: '', // Extension field for future use
        role: staff.role || 'RN',
        createdAt: new Date().toISOString()
      })
    );

    await Promise.all(promises);
    console.log(`Successfully migrated ${initialStaff.length} staff members to Firestore.`);
  } catch (error) {
    console.error('Error migrating staff:', error);
    throw error;
  }
};

