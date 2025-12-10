import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  orderBy,
  writeBatch
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
 * @param {string} staffData.shift - Shift designation: 'Day', 'Night', or '' (optional)
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
      shift: staffData.shift || '',
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
 * Bulk update shift designation for multiple staff members
 * @param {Array<string>} staffIds - Array of Firestore document IDs
 * @param {string} shift - Shift designation: 'Day', 'Night', or ''
 * @returns {Promise<void>}
 */
export const bulkUpdateShift = async (staffIds, shift) => {
  try {
    if (!staffIds || staffIds.length === 0) {
      throw new Error('No staff IDs provided');
    }

    const batch = writeBatch(db);
    const BATCH_SIZE = 500; // Firestore batch limit
    let batchCount = 0;

    for (let i = 0; i < staffIds.length; i++) {
      const staffRef = doc(db, STAFF_COLLECTION, staffIds[i]);
      batch.update(staffRef, {
        shift: shift || '',
        updatedAt: new Date().toISOString()
      });

      batchCount++;

      // Commit batch if we've reached the limit
      if (batchCount >= BATCH_SIZE) {
        await batch.commit();
        batchCount = 0;
      }
    }

    // Commit remaining items
    if (batchCount > 0) {
      await batch.commit();
    }

    console.log(`Successfully updated shift for ${staffIds.length} staff members.`);
  } catch (error) {
    console.error('Error bulk updating shift:', error);
    throw error;
  }
};

/**
 * Clear all staff from Firestore
 * @returns {Promise<void>}
 */
export const clearAllStaff = async () => {
  try {
    const staffRef = collection(db, STAFF_COLLECTION);
    const querySnapshot = await getDocs(staffRef);
    
    // Use batch to delete all documents
    const batch = writeBatch(db);
    querySnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    console.log(`Successfully deleted ${querySnapshot.docs.length} staff members.`);
  } catch (error) {
    console.error('Error clearing staff:', error);
    throw error;
  }
};

/**
 * Import staff from plain text
 * Supports multiple formats:
 * - CSV: LastName,FirstName,Phone,Extension,Role
 * - Tab-separated: LastName\tFirstName\tPhone\tExtension\tRole
 * - Space-separated: LastName FirstName Phone Extension Role
 * - Minimal: LastName,Phone or LastName Phone
 * @param {string} text - Plain text to parse
 * @returns {Promise<{success: number, errors: Array}>}
 */
export const importStaffFromText = async (text) => {
  try {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    const staffRef = collection(db, STAFF_COLLECTION);
    const results = { success: 0, errors: [] };
    const batch = writeBatch(db);
    let batchCount = 0;
    const BATCH_SIZE = 500; // Firestore batch limit

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      let staffData;

      // Try to parse the line
      if (line.includes(',')) {
        // CSV format: LastName,FirstName,Phone,Extension,Role,Shift
        const parts = line.split(',').map(p => p.trim());
        staffData = {
          lastName: parts[0] || '',
          firstName: parts[1] || '',
          phone: parts[2] || '',
          extension: parts[3] || '',
          role: parts[4] || 'RN',
          shift: parts[5] || ''
        };
      } else if (line.includes('\t')) {
        // Tab-separated format
        const parts = line.split('\t').map(p => p.trim());
        staffData = {
          lastName: parts[0] || '',
          firstName: parts[1] || '',
          phone: parts[2] || '',
          extension: parts[3] || '',
          role: parts[4] || 'RN',
          shift: parts[5] || ''
        };
      } else {
        // Space-separated format: LastName FirstName Phone Extension Role Shift
        const parts = line.split(/\s+/).filter(p => p.length > 0);
        if (parts.length >= 2) {
          staffData = {
            lastName: parts[0] || '',
            firstName: parts[1] || '',
            phone: parts[2] || '',
            extension: parts[3] || '',
            role: parts[4] || 'RN',
            shift: parts[5] || ''
          };
        } else {
          results.errors.push(`Line ${i + 1}: Invalid format - "${line}"`);
          continue;
        }
      }

      // Validate required fields
      if (!staffData.lastName) {
        results.errors.push(`Line ${i + 1}: Missing last name - "${line}"`);
        continue;
      }

      // Add to batch
      const docRef = doc(staffRef);
      batch.set(docRef, {
        lastName: staffData.lastName,
        firstName: staffData.firstName || '',
        phone: staffData.phone || '',
        extension: staffData.extension || '',
        role: staffData.role || 'RN',
        shift: staffData.shift || '',
        createdAt: new Date().toISOString()
      });

      batchCount++;
      results.success++;

      // Commit batch if we've reached the limit
      if (batchCount >= BATCH_SIZE) {
        await batch.commit();
        batchCount = 0;
      }
    }

    // Commit remaining items
    if (batchCount > 0) {
      await batch.commit();
    }

    return results;
  } catch (error) {
    console.error('Error importing staff:', error);
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
        shift: '', // Shift designation (can be set later)
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

