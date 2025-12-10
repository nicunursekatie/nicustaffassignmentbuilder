import React, { useState, useEffect } from 'react';
import { getAllStaff, migrateInitialStaff } from '../services/staffService';
import { saveBabyAssignments, loadShift } from '../services/shiftService';

// Sample staff roster - this would eventually be editable/persistent
const INITIAL_ROSTER = [
  { id: 1, lastName: 'Hamathka', firstName: 'Zoey', phone: '78274', role: 'RN' },
  { id: 2, lastName: 'Parker', firstName: 'Paz', phone: '75284', role: 'RN' },
  { id: 3, lastName: 'Jones', firstName: 'A+B', phone: '78278', role: 'RN' },
  { id: 4, lastName: 'Hollis', firstName: '', phone: '78229', role: 'RN' },
  { id: 5, lastName: 'Buchanan', firstName: 'Hannah', phone: '78274', role: 'RN' },
  { id: 6, lastName: 'Horace', firstName: 'Oreggia', phone: '78287', role: 'RN' },
  { id: 7, lastName: 'Marcelin', firstName: 'Brooke', phone: '73571', role: 'RN' },
  { id: 8, lastName: 'Lamothe', firstName: '', phone: '78287', role: 'RN' },
  { id: 9, lastName: 'Paz', firstName: 'Taylor', phone: '75284', role: 'RN' },
  { id: 10, lastName: 'Druhot', firstName: 'Trica', phone: '78283', role: 'RN' },
  { id: 11, lastName: 'Gruner', firstName: '', phone: '72027', role: 'RN' },
  { id: 12, lastName: 'Corry', firstName: 'Karla', phone: '73665', role: 'RN' },
  { id: 13, lastName: 'Cassie', firstName: '', phone: '78270', role: 'RN' },
  { id: 14, lastName: 'Madison', firstName: '', phone: '78287', role: 'RN' },
  { id: 15, lastName: 'Cindy', firstName: '', phone: '78278', role: 'RN' },
  { id: 16, lastName: 'Shelton', firstName: 'Mosley', phone: '75410', role: 'RN' },
  { id: 17, lastName: 'Arwood', firstName: 'Laudel', phone: '80153', role: 'RN' },
  { id: 18, lastName: 'Chatman', firstName: '', phone: '6444', role: 'RN' },
  { id: 19, lastName: 'Asuman', firstName: '', phone: 'A3029', role: 'RN' },
  { id: 20, lastName: 'Smith', firstName: '', phone: '1804', role: 'RN' },
  { id: 21, lastName: 'Lusung', firstName: '', phone: '6727', role: 'RN' },
  { id: 22, lastName: 'Young', firstName: '', phone: '7879', role: 'RN' },
  { id: 23, lastName: 'Ford', firstName: '', phone: '5896', role: 'RN' },
  { id: 24, lastName: 'Powell', firstName: '', phone: '3777', role: 'RN' },
  { id: 25, lastName: 'Azor', firstName: 'Nola', phone: '0759', role: 'RN' },
  { id: 26, lastName: 'Piercy', firstName: '', phone: '6362', role: 'RN' },
  { id: 27, lastName: 'Hulsey', firstName: '', phone: '6192', role: 'RN' },
  { id: 28, lastName: 'OConnor', firstName: 'Meredith', phone: '1633', role: 'RN' },
  { id: 29, lastName: 'Thompson', firstName: '', phone: '6443', role: 'RN' },
  { id: 30, lastName: 'Dye', firstName: '', phone: '4899', role: 'RN' },
  { id: 31, lastName: 'Clemans', firstName: 'Samantha', phone: '73676', role: 'RN' },
  { id: 32, lastName: 'Kelsey', firstName: '', phone: '78277', role: 'RN' },
  { id: 33, lastName: 'Rachel', firstName: '', phone: '78243', role: 'RN' },
  { id: 34, lastName: 'Lise', firstName: '', phone: '79961', role: 'RN' },
  { id: 35, lastName: 'Jerica', firstName: '', phone: '75289', role: 'RN' },
  { id: 36, lastName: 'Catrina', firstName: '', phone: '78288', role: 'RN' },
  { id: 37, lastName: 'MedinaPerez', firstName: '', phone: '29038', role: 'RN' },
  { id: 38, lastName: 'Anna', firstName: '', phone: '78268', role: 'RN' },
];

const ROOMS = [
  { id: 'room1', name: 'Room 1', ext: '21124' },
  { id: 'room2', name: 'Room 2', ext: '21124' },
  { id: 'room3', name: 'Room 3', ext: '21128' },
  { id: 'room4', name: 'Room 4', ext: '21125' },
  { id: 'room5', name: 'Room 5', ext: '21125' },
  { id: 'room6', name: 'Room 6', ext: '21126' },
  { id: 'room7', name: 'Room 7', ext: '21126' },
  { id: 'room8', name: 'Room 8', ext: '21126' },
  { id: 'procedure', name: 'Procedure Room', ext: '' },
  { id: 'intermediate1', name: 'Intermediate 1', ext: '21130' },
  { id: 'intermediate2', name: 'Intermediate 2', ext: '21130' },
  { id: 'intermediate3', name: 'Intermediate 3', ext: '21129' },
  { id: 'nest', name: 'Nest', ext: '36036' },
  { id: 'loft', name: 'Loft', ext: '36036' },
  { id: 'specialcare5', name: 'Special Care 5', ext: '38558' },
];

const STEPS = [
  'Shift Info',
  'Baby Assignments',
  'Who\'s Working',
  'Key Roles',
  'Room Assignments',
  'Special Notes',
  'Generate'
];

export default function NICUStaffingWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [roster, setRoster] = useState([]);
  const [isLoadingStaff, setIsLoadingStaff] = useState(true);
  const [staffError, setStaffError] = useState(null);
  
  // Shift info
  const [shiftDate, setShiftDate] = useState(new Date().toISOString().split('T')[0]);
  const [shiftTime, setShiftTime] = useState('7P-7A');
  const [census, setCensus] = useState('');
  
  // Staff working tonight
  const [workingStaff, setWorkingStaff] = useState([]);
  
  // Key roles
  const [charge, setCharge] = useState(null);
  const [resource, setResource] = useState(null);
  const [ladRN, setLadRN] = useState(null);
  const [nicuRT, setNicuRT] = useState('');
  const [nicuRTPhone, setNicuRTPhone] = useState('76695');
  const [md, setMD] = useState(null); // Changed to staff ID
  const [mdPhone, setMDPhone] = useState('');
  const [np, setNP] = useState(null); // NP staff ID
  const [npPhone, setNPPhone] = useState('');
  
  // Room assignments - map of roomId to array of staff ids
  const [roomAssignments, setRoomAssignments] = useState({});
  
  // Babies/patients in each room - map of roomId to array of baby names/info
  const [roomBabies, setRoomBabies] = useState({});
  
  // Special notes
  const [isolationPatients, setIsolationPatients] = useState('');
  const [medicalUpdates, setMedicalUpdates] = useState('');
  const [sickFlexed, setSickFlexed] = useState('');
  const [nameAlert, setNameAlert] = useState('');
  const [roomingIn, setRoomingIn] = useState('');
  
  // Current room index for assignment step
  const [currentRoomIndex, setCurrentRoomIndex] = useState(0);
  
  // Search filter for staff selection
  const [staffSearch, setStaffSearch] = useState('');
  
  // Baby name and code input for current room
  const [newBabyName, setNewBabyName] = useState('');
  const [newBabyCode, setNewBabyCode] = useState('');
  
  // Special Care 5 open/closed status
  const [specialCare5Open, setSpecialCare5Open] = useState(false);

  // Load staff from Firestore on component mount
  useEffect(() => {
    const loadStaff = async () => {
      try {
        setIsLoadingStaff(true);
        setStaffError(null);
        const staffData = await getAllStaff();
        
        // If no staff exists, offer to migrate initial data
        if (staffData.length === 0) {
          console.log('No staff found in database. You can migrate initial data.');
          // Optionally auto-migrate, or show a button to migrate
          try {
            await migrateInitialStaff(INITIAL_ROSTER);
            const migratedStaff = await getAllStaff();
            setRoster(migratedStaff);
          } catch (migrateError) {
            console.error('Migration error:', migrateError);
            setStaffError('Failed to load staff. Please refresh the page.');
          }
        } else {
          setRoster(staffData);
        }
      } catch (error) {
        console.error('Error loading staff:', error);
        setStaffError('Failed to load staff roster. Please refresh the page.');
        // Fallback to initial roster if Firestore fails
        setRoster(INITIAL_ROSTER);
      } finally {
        setIsLoadingStaff(false);
      }
    };

    loadStaff();
  }, []);

  // Load baby assignments when shift date/time changes
  useEffect(() => {
    const loadBabyAssignments = async () => {
      if (!shiftDate || !shiftTime) return;
      
      try {
        const shiftData = await loadShift(shiftDate, shiftTime);
        if (shiftData && shiftData.roomBabies) {
          setRoomBabies(shiftData.roomBabies);
        }
      } catch (error) {
        console.error('Error loading baby assignments:', error);
        // Don't show error to user, just log it
      }
    };

    loadBabyAssignments();
  }, [shiftDate, shiftTime]);

  // Auto-save baby assignments when they change (debounced)
  useEffect(() => {
    if (!shiftDate || !shiftTime) return;
    
    const timeoutId = setTimeout(async () => {
      try {
        await saveBabyAssignments(shiftDate, shiftTime, roomBabies);
      } catch (error) {
        console.error('Error auto-saving baby assignments:', error);
      }
    }, 1000); // Debounce: save 1 second after last change

    return () => clearTimeout(timeoutId);
  }, [roomBabies, shiftDate, shiftTime]);

  const toggleStaffWorking = (staffId) => {
    const staff = getStaffById(staffId);
    const isAdding = !workingStaff.includes(staffId);
    
    setWorkingStaff(prev => 
      prev.includes(staffId) 
        ? prev.filter(id => id !== staffId)
        : [...prev, staffId]
    );
    
    // If adding a full-time charge nurse and no charge is set, auto-set them as charge
    if (isAdding && staff?.isChargeNurse && !charge) {
      setCharge(staffId);
    }
    
    // If removing the current charge nurse who is a full-time charge, clear charge
    if (!isAdding && staff?.isChargeNurse && charge === staffId) {
      setCharge(null);
    }
  };

  const getStaffById = (id) => roster.find(s => s.id === id);
  
  const getAvailableStaff = () => {
    const assignedStaff = Object.values(roomAssignments).flat();
    return workingStaff.filter(id => !assignedStaff.includes(id));
  };

  const assignToRoom = (roomId, staffId) => {
    setRoomAssignments(prev => ({
      ...prev,
      [roomId]: [...(prev[roomId] || []), staffId]
    }));
  };

  const removeFromRoom = (roomId, staffId) => {
    setRoomAssignments(prev => ({
      ...prev,
      [roomId]: (prev[roomId] || []).filter(id => id !== staffId)
    }));
  };

  const addBabyToRoom = (roomId, babyName, babyCode = '') => {
    if (!babyName.trim()) return;
    setRoomBabies(prev => ({
      ...prev,
      [roomId]: [...(prev[roomId] || []), {
        name: babyName.trim(),
        code: babyCode.trim()
      }]
    }));
  };

  const removeBabyFromRoom = (roomId, babyIndex) => {
    setRoomBabies(prev => ({
      ...prev,
      [roomId]: (prev[roomId] || []).filter((_, index) => index !== babyIndex)
    }));
  };

  const moveBabyToRoom = (fromRoomId, babyIndex, toRoomId) => {
    const baby = roomBabies[fromRoomId]?.[babyIndex];
    if (!baby) return;
    
    setRoomBabies(prev => ({
      ...prev,
      [fromRoomId]: (prev[fromRoomId] || []).filter((_, index) => index !== babyIndex),
      [toRoomId]: [...(prev[toRoomId] || []), baby]
    }));
  };

  const formatStaffName = (staff) => {
    if (!staff) return '';
    return staff.firstName 
      ? `${staff.lastName}, ${staff.firstName}`
      : staff.lastName;
  };

  const formatStaffForSheet = (staff) => {
    if (!staff) return '';
    const name = staff.firstName 
      ? `${staff.lastName}${staff.phone} ${staff.firstName}`
      : `${staff.lastName}${staff.phone}`;
    return name;
  };

  const nextStep = () => {
    // Reset room index when moving to baby assignments (step 1) or room assignments (step 4)
    if (currentStep === 0 || currentStep === 3) {
      setCurrentRoomIndex(0);
    }
    setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
  };
  const prevStep = () => {
    // Reset room index when moving to baby assignments (step 1) or room assignments (step 4)
    if (currentStep === 2 || currentStep === 5) {
      setCurrentRoomIndex(0);
    }
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const renderStepIndicator = () => (
    <div className="flex justify-between mb-8">
      {STEPS.map((step, index) => (
        <div 
          key={step}
          className={`flex flex-col items-center ${index <= currentStep ? 'text-blue-600' : 'text-gray-400'}`}
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mb-1
            ${index < currentStep ? 'bg-blue-600 text-white' : 
              index === currentStep ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
            {index < currentStep ? '✓' : index + 1}
          </div>
          <span className="text-xs text-center hidden sm:block">{step}</span>
        </div>
      ))}
    </div>
  );

  const renderShiftInfo = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-bold mb-4">Shift Information</h2>
      
      <div>
        <label className="block text-sm font-medium mb-1">Date</label>
        <input 
          type="date" 
          value={shiftDate}
          onChange={(e) => setShiftDate(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Shift</label>
        <select 
          value={shiftTime}
          onChange={(e) => setShiftTime(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="7P-7A">7P - 7A (Night)</option>
          <option value="7A-7P">7A - 7P (Day)</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Census</label>
        <input 
          type="number" 
          value={census}
          onChange={(e) => setCensus(e.target.value)}
          placeholder="Number of patients"
          className="w-full p-2 border rounded"
        />
      </div>
    </div>
  );

  const renderWorkingStaff = () => {
    if (isLoadingStaff) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-600">Loading staff roster...</p>
        </div>
      );
    }

    if (staffError) {
      return (
        <div className="text-center py-8">
          <p className="text-red-600 mb-2">{staffError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Refresh Page
          </button>
        </div>
      );
    }

    // Filter staff based on search term
    const filteredRoster = roster.filter(staff => {
      if (!staffSearch.trim()) return true;
      const searchLower = staffSearch.toLowerCase();
      const fullName = formatStaffName(staff).toLowerCase();
      const lastName = (staff.lastName || '').toLowerCase();
      const firstName = (staff.firstName || '').toLowerCase();
      return fullName.includes(searchLower) || 
             lastName.includes(searchLower) || 
             firstName.includes(searchLower);
    });

    // Sort staff: matching shift first, then opposite shift at bottom
    const isNightShift = shiftTime === '7P-7A';
    const sortedRoster = [...filteredRoster].sort((a, b) => {
      const aShift = a.shift || '';
      const bShift = b.shift || '';
      
      // Determine if staff matches current shift
      const aMatches = (isNightShift && aShift === 'Night') || (!isNightShift && aShift === 'Day');
      const bMatches = (isNightShift && bShift === 'Night') || (!isNightShift && bShift === 'Day');
      
      // Determine if staff is opposite shift
      const aOpposite = (isNightShift && aShift === 'Day') || (!isNightShift && aShift === 'Night');
      const bOpposite = (isNightShift && bShift === 'Day') || (!isNightShift && bShift === 'Night');
      
      // Matching shift first
      if (aMatches && !bMatches) return -1;
      if (!aMatches && bMatches) return 1;
      
      // Opposite shift last
      if (aOpposite && !bOpposite) return 1;
      if (!aOpposite && bOpposite) return -1;
      
      // Otherwise, sort alphabetically by last name
      const aName = (a.lastName || '').toLowerCase();
      const bName = (b.lastName || '').toLowerCase();
      return aName.localeCompare(bName);
    });

    return (
      <div>
        <h2 className="text-xl font-bold mb-4">Who's Working Tonight?</h2>
        <p className="text-sm text-gray-600 mb-4">Select all staff on shift</p>
        
        {roster.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">No staff members found in database.</p>
            <button
              onClick={async () => {
                try {
                  await migrateInitialStaff(INITIAL_ROSTER);
                  const staffData = await getAllStaff();
                  setRoster(staffData);
                } catch (error) {
                  setStaffError('Failed to migrate staff data.');
                }
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Load Initial Staff Roster
            </button>
          </div>
        ) : (
          <>
            {/* Search Bar */}
            <div className="mb-4">
              <input
                type="text"
                value={staffSearch}
                onChange={(e) => setStaffSearch(e.target.value)}
                placeholder="Search by name... (start typing)"
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                autoFocus
              />
              {staffSearch && (
                <button
                  onClick={() => setStaffSearch('')}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                >
                  Clear search
                </button>
              )}
            </div>

            {/* Staff Grid */}
            {sortedRoster.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No staff members found matching "{staffSearch}"</p>
                <button
                  onClick={() => setStaffSearch('')}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                >
                  Clear search to see all staff
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-96 overflow-y-auto">
                  {sortedRoster.map(staff => {
                    const isSelected = workingStaff.includes(staff.id);
                    return (
                      <button
                        key={staff.id}
                        onClick={() => {
                          toggleStaffWorking(staff.id);
                          // Clear search after selection for quick multiple selections
                          if (!isSelected) {
                            setStaffSearch('');
                          }
                        }}
                        className={`p-2 text-left text-sm rounded border transition-colors
                          ${isSelected
                            ? 'bg-blue-100 border-blue-500 text-blue-800' 
                            : 'bg-white border-gray-300 hover:border-blue-300 hover:bg-blue-50'}`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span>{formatStaffName(staff)}</span>
                          <div className="flex gap-1">
                            {staff.isChargeNurse && (
                              <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700">
                                Charge
                              </span>
                            )}
                            {(staff.role === 'MD' || staff.role === 'NP') && (
                              <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                                staff.role === 'MD' 
                                  ? 'bg-red-100 text-red-700' 
                                  : 'bg-pink-100 text-pink-700'
                              }`}>
                                {staff.role}
                              </span>
                            )}
                            {staff.shift && (
                              <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                                staff.shift === 'Day' 
                                  ? 'bg-yellow-100 text-yellow-700' 
                                  : 'bg-indigo-100 text-indigo-700'
                              }`}>
                                {staff.shift}
                              </span>
                            )}
                            {staff.isPreceptee && (
                              <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
                                Preceptee
                              </span>
                            )}
                            {staff.isTraveler && (
                              <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-700">
                                Traveler
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
                
                <div className="mt-4 flex justify-between items-center">
                  <p className="text-sm text-gray-600">
                    {workingStaff.length} staff selected
                    {staffSearch && (
                      <span className="ml-2 text-gray-400">
                        ({sortedRoster.length} matching)
                      </span>
                    )}
                  </p>
                  {staffSearch && sortedRoster.length > 0 && (
                    <button
                      onClick={() => {
                        // Select all filtered results
                        sortedRoster.forEach(staff => {
                          if (!workingStaff.includes(staff.id)) {
                            toggleStaffWorking(staff.id);
                          }
                        });
                        setStaffSearch('');
                      }}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Select all {sortedRoster.length} shown
                    </button>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>
    );
  };

  const renderKeyRoles = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-bold mb-4">Key Roles</h2>
      
      <div>
        <label className="block text-sm font-medium mb-1">Charge Nurse</label>
        <select 
          value={charge || ''}
          onChange={(e) => setCharge(e.target.value || null)}
          className="w-full p-2 border rounded"
        >
          <option value="">Select charge nurse...</option>
          {workingStaff.map(id => {
            const staff = getStaffById(id);
            if (!staff) return null;
            return <option key={id} value={id}>{formatStaffName(staff)}</option>;
          })}
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Resource Nurse</label>
        <select 
          value={resource || ''}
          onChange={(e) => setResource(e.target.value || null)}
          className="w-full p-2 border rounded"
        >
          <option value="">Select resource nurse...</option>
          {workingStaff.map(id => {
            const staff = getStaffById(id);
            if (!staff) return null;
            return <option key={id} value={id}>{formatStaffName(staff)}</option>;
          })}
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">L&D RN</label>
        <select 
          value={ladRN || ''}
          onChange={(e) => setLadRN(e.target.value || null)}
          className="w-full p-2 border rounded"
        >
          <option value="">Select L&D RN...</option>
          {workingStaff.map(id => {
            const staff = getStaffById(id);
            if (!staff) return null;
            return <option key={id} value={id}>{formatStaffName(staff)}</option>;
          })}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">NICU RT</label>
          <input 
            type="text"
            value={nicuRT}
            onChange={(e) => setNicuRT(e.target.value)}
            placeholder="RT name"
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">RT Phone</label>
          <input 
            type="text"
            value={nicuRTPhone}
            onChange={(e) => setNicuRTPhone(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">MD</label>
        <select 
          value={md && typeof md === 'string' && workingStaff.some(id => id === md) ? md : ''}
          onChange={(e) => {
            const selectedId = e.target.value || null;
            setMD(selectedId);
            if (selectedId) {
              const selectedStaff = getStaffById(selectedId);
              setMDPhone(selectedStaff?.phone || '');
            } else {
              setMDPhone('');
            }
          }}
          className="w-full p-2 border rounded mb-2"
        >
          <option value="">Select MD or enter manually...</option>
          {workingStaff
            .map(id => getStaffById(id))
            .filter(staff => staff && (staff.role === 'MD'))
            .map(staff => (
              <option key={staff.id} value={staff.id}>
                {formatStaffName(staff)}
              </option>
            ))}
        </select>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">MD Name (if not in list)</label>
            <input 
              type="text"
              value={md && typeof md === 'string' && !workingStaff.some(id => id === md) ? md : ''}
              onChange={(e) => {
                setMD(e.target.value);
                if (!e.target.value) setMDPhone('');
              }}
              placeholder="Enter MD name manually"
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">MD Phone</label>
            <input 
              type="text"
              value={mdPhone}
              onChange={(e) => setMDPhone(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">NP (Nurse Practitioner)</label>
        <select 
          value={np && typeof np === 'string' && workingStaff.some(id => id === np) ? np : ''}
          onChange={(e) => {
            const selectedId = e.target.value || null;
            setNP(selectedId);
            if (selectedId) {
              const selectedStaff = getStaffById(selectedId);
              setNPPhone(selectedStaff?.phone || '');
            } else {
              setNPPhone('');
            }
          }}
          className="w-full p-2 border rounded mb-2"
        >
          <option value="">Select NP or enter manually...</option>
          {workingStaff
            .map(id => getStaffById(id))
            .filter(staff => staff && (staff.role === 'NP'))
            .map(staff => (
              <option key={staff.id} value={staff.id}>
                {formatStaffName(staff)}
              </option>
            ))}
        </select>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">NP Name (if not in list)</label>
            <input 
              type="text"
              value={np && typeof np === 'string' && !workingStaff.some(id => id === np) ? np : ''}
              onChange={(e) => {
                setNP(e.target.value);
                if (!e.target.value) setNPPhone('');
              }}
              placeholder="Enter NP name manually"
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">NP Phone</label>
            <input 
              type="text"
              value={npPhone}
              onChange={(e) => setNPPhone(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderBabyAssignments = () => {
    // Filter out Special Care 5 if it's not open
    const availableRooms = ROOMS.filter(room => {
      if (room.id === 'specialcare5' && !specialCare5Open) {
        return false;
      }
      return true;
    });
    
    const currentRoom = availableRooms[currentRoomIndex];
    const babiesInRoom = roomBabies[currentRoom.id] || [];
    
    return (
      <div>
        <h2 className="text-xl font-bold mb-2">Baby/Patient Room Assignments</h2>
        <p className="text-sm text-gray-600 mb-4">
          Room {currentRoomIndex + 1} of {availableRooms.length} - Assign babies/patients to rooms
        </p>
        
        {/* Special Care 5 toggle */}
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={specialCare5Open}
              onChange={(e) => setSpecialCare5Open(e.target.checked)}
              className="mr-2 rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
            />
            <span className="text-sm font-medium">Special Care 5 is open (holds 4 babies)</span>
          </label>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg mb-4">
          <h3 className="font-bold text-lg">{currentRoom.name}</h3>
          {currentRoom.ext && <p className="text-sm text-gray-600">Ext: {currentRoom.ext}</p>}
          {(currentRoom.id === 'intermediate1' || currentRoom.id === 'intermediate2' || currentRoom.id === 'intermediate3') && (
            <p className="text-xs text-gray-500 mt-1">Part of Intermediate area (9 babies total across 3 rooms)</p>
          )}
          {currentRoom.id === 'specialcare5' && (
            <p className="text-xs text-gray-500 mt-1">Holds up to 4 babies</p>
          )}
        </div>

        {/* Babies/Patients in Room */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Babies/Patients in this room:</label>
          <div className="grid grid-cols-3 gap-2 mb-2">
            <input
              type="text"
              value={newBabyName}
              onChange={(e) => setNewBabyName(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addBabyToRoom(currentRoom.id, newBabyName, newBabyCode);
                  setNewBabyName('');
                  setNewBabyCode('');
                }
              }}
              placeholder="Baby/Patient name..."
              className="col-span-2 p-2 border rounded"
            />
            <input
              type="text"
              value={newBabyCode}
              onChange={(e) => setNewBabyCode(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addBabyToRoom(currentRoom.id, newBabyName, newBabyCode);
                  setNewBabyName('');
                  setNewBabyCode('');
                }
              }}
              placeholder="Parent code..."
              className="p-2 border rounded"
            />
          </div>
          <button
            onClick={() => {
              addBabyToRoom(currentRoom.id, newBabyName, newBabyCode);
              setNewBabyName('');
              setNewBabyCode('');
            }}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 mb-2"
          >
            Add Baby
          </button>
          {babiesInRoom.length > 0 && (
            <div className="flex flex-wrap gap-2 min-h-12 p-2 bg-gray-50 rounded mb-2">
              {babiesInRoom.map((baby, index) => {
                const babyName = typeof baby === 'string' ? baby : baby.name;
                const babyCode = typeof baby === 'string' ? '' : baby.code;
                return (
                  <span
                    key={index}
                    className="bg-white border border-gray-300 px-3 py-1 rounded text-sm flex items-center gap-2"
                  >
                    <span>
                      {babyName}
                      {babyCode && <span className="text-gray-500 ml-1">({babyCode})</span>}
                    </span>
                    <button
                      onClick={() => removeBabyFromRoom(currentRoom.id, index)}
                      className="text-red-600 hover:text-red-800 font-bold"
                      title="Remove from room"
                    >
                      ×
                    </button>
                  </span>
                );
              })}
            </div>
          )}
          
          {/* Move babies from other rooms */}
          {Object.keys(roomBabies).some(roomId => {
            const babies = roomBabies[roomId] || [];
            return roomId !== currentRoom.id && babies.length > 0;
          }) && (
            <div className="mt-4">
              <label className="block text-sm font-medium mb-2">Move babies from other rooms:</label>
              <div className="space-y-2">
                {ROOMS.map(room => {
                  const otherBabies = roomBabies[room.id] || [];
                  if (room.id === currentRoom.id || otherBabies.length === 0) return null;
                  
                  return (
                    <div key={room.id} className="border rounded p-2">
                      <div className="text-xs font-medium text-gray-600 mb-1">{room.name}:</div>
                      <div className="flex flex-wrap gap-1">
                        {otherBabies.map((baby, index) => {
                          const babyName = typeof baby === 'string' ? baby : baby.name;
                          const babyCode = typeof baby === 'string' ? '' : baby.code;
                          return (
                            <button
                              key={index}
                              onClick={() => moveBabyToRoom(room.id, index, currentRoom.id)}
                              className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs hover:bg-blue-200"
                              title={`Move ${babyName} to ${currentRoom.name}`}
                            >
                              {babyName}{babyCode && ` (${babyCode})`} →
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between mt-6">
          <button
            onClick={() => {
              setCurrentRoomIndex(prev => Math.max(0, prev - 1));
              setNewBabyName('');
              setNewBabyCode('');
            }}
            disabled={currentRoomIndex === 0}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            ← Previous Room
          </button>
          
          {currentRoomIndex < availableRooms.length - 1 ? (
            <button
              onClick={() => {
                setCurrentRoomIndex(prev => prev + 1);
                setNewBabyName('');
                setNewBabyCode('');
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Next Room →
            </button>
          ) : (
            <button
              onClick={nextStep}
              className="px-4 py-2 bg-green-600 text-white rounded"
            >
              Done with Babies ✓
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderRoomAssignments = () => {
    // Filter out Special Care 5 if it's not open
    const availableRooms = ROOMS.filter(room => {
      if (room.id === 'specialcare5' && !specialCare5Open) {
        return false;
      }
      return true;
    });
    
    const currentRoom = availableRooms[currentRoomIndex];
    const assignedToThisRoom = roomAssignments[currentRoom.id] || [];
    const availableStaff = getAvailableStaff();
    const babiesInRoom = roomBabies[currentRoom.id] || [];
    
    return (
      <div>
        <h2 className="text-xl font-bold mb-2">Room Assignments</h2>
        <p className="text-sm text-gray-600 mb-4">
          Room {currentRoomIndex + 1} of {availableRooms.length}
        </p>
        
        <div className="bg-blue-50 p-4 rounded-lg mb-4">
          <h3 className="font-bold text-lg">{currentRoom.name}</h3>
          {currentRoom.ext && <p className="text-sm text-gray-600">Ext: {currentRoom.ext}</p>}
          {babiesInRoom.length > 0 && (
            <div className="mt-2 text-sm">
              <span className="font-medium">Babies:</span>{' '}
              {babiesInRoom.map((baby, idx) => {
                const babyName = typeof baby === 'string' ? baby : baby.name;
                const babyCode = typeof baby === 'string' ? '' : baby.code;
                return (
                  <span key={idx}>
                    {babyName}{babyCode && ` (${babyCode})`}
                    {idx < babiesInRoom.length - 1 && ', '}
                  </span>
                );
              })}
            </div>
          )}
        </div>

        <div className="mb-4">
          <p className="text-sm font-medium mb-2">Assigned to this room:</p>
          <div className="flex flex-wrap gap-2 min-h-12 p-2 bg-gray-50 rounded">
            {assignedToThisRoom.length === 0 ? (
              <span className="text-gray-400 text-sm">No one assigned yet</span>
            ) : (
              assignedToThisRoom.map(id => {
                const staff = getStaffById(id);
                return (
                  <span 
                    key={id}
                    onClick={() => removeFromRoom(currentRoom.id, id)}
                    className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm cursor-pointer hover:bg-red-100 hover:text-red-800"
                  >
                    {formatStaffName(staff)} ✕
                  </span>
                );
              })
            )}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium mb-2">Available staff (click to assign):</p>
          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
            {availableStaff.map(id => {
              const staff = getStaffById(id);
              return (
                <button
                  key={id}
                  onClick={() => assignToRoom(currentRoom.id, id)}
                  className="p-2 text-left text-sm rounded border bg-white hover:bg-blue-50"
                >
                  {formatStaffName(staff)}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex justify-between mt-6">
          <button
            onClick={() => {
              setCurrentRoomIndex(prev => Math.max(0, prev - 1));
            }}
            disabled={currentRoomIndex === 0}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            ← Previous Room
          </button>
          
          {currentRoomIndex < availableRooms.length - 1 ? (
            <button
              onClick={() => {
                setCurrentRoomIndex(prev => prev + 1);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Next Room →
            </button>
          ) : (
            <button
              onClick={nextStep}
              className="px-4 py-2 bg-green-600 text-white rounded"
            >
              Done with Rooms ✓
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderSpecialNotes = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-bold mb-4">Special Notes</h2>
      
      <div>
        <label className="block text-sm font-medium mb-1">Isolation Patients</label>
        <textarea
          value={isolationPatients}
          onChange={(e) => setIsolationPatients(e.target.value)}
          placeholder="List isolation patients..."
          className="w-full p-2 border rounded h-20"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Medical Updates / Potential Admissions</label>
        <textarea
          value={medicalUpdates}
          onChange={(e) => setMedicalUpdates(e.target.value)}
          placeholder="Any updates or expected admissions..."
          className="w-full p-2 border rounded h-20"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Staff Sick / Flexed Off</label>
        <textarea
          value={sickFlexed}
          onChange={(e) => setSickFlexed(e.target.value)}
          placeholder="List staff who called out or were flexed..."
          className="w-full p-2 border rounded h-20"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Name Alert</label>
        <textarea
          value={nameAlert}
          onChange={(e) => setNameAlert(e.target.value)}
          placeholder="Any name alerts..."
          className="w-full p-2 border rounded h-16"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Rooming In</label>
        <textarea
          value={roomingIn}
          onChange={(e) => setRoomingIn(e.target.value)}
          placeholder="Parents rooming in..."
          className="w-full p-2 border rounded h-16"
        />
      </div>
    </div>
  );

  const renderGeneratedSheet = () => {
    const formatDate = (dateStr) => {
      const d = new Date(dateStr);
      return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear().toString().slice(2)}`;
    };

    const chargeStaff = getStaffById(charge);
    const ladRNStaff = getStaffById(ladRN);
    const resourceStaff = getStaffById(resource);
    const mdStaff = typeof md === 'number' ? getStaffById(md) : null;
    const npStaff = typeof np === 'number' ? getStaffById(np) : null;

    return (
      <div>
        <h2 className="text-xl font-bold mb-4">Generated Staffing Sheet</h2>
        
        <div className="bg-white border-2 border-gray-300 p-4 text-sm font-mono overflow-x-auto">
          {/* Header */}
          <div className="text-center font-bold mb-4">
            <p>NICU STAFFING SHEET: {formatDate(shiftDate)} SHIFT: {shiftTime} CENSUS: {census} CHARGE: {chargeStaff ? formatStaffName(chargeStaff).toUpperCase() : ''} ({chargeStaff?.phone || ''})</p>
            <p>L&D RN: {ladRNStaff ? formatStaffName(ladRNStaff).toUpperCase() : ''} ({ladRNStaff?.phone || ''}) NICU RT: {nicuRTPhone} L&D RT: 76696 MD: {mdStaff ? formatStaffName(mdStaff).toUpperCase() : (md || '')} ({mdPhone}) NP: {npStaff ? formatStaffName(npStaff).toUpperCase() : (np || '')} ({npPhone})</p>
          </div>

          {/* Room Grid */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {ROOMS.slice(0, 9).map(room => {
              const assigned = roomAssignments[room.id] || [];
              const babies = roomBabies[room.id] || [];
              return (
                <div key={room.id} className="border p-2">
                  <div className="font-bold text-xs">{room.name} {room.ext && `ext. ${room.ext}`}</div>
                  {babies.length > 0 && (
                    <div className="text-xs text-gray-600 mb-1">
                      {babies.map((baby, idx) => {
                        const babyName = typeof baby === 'string' ? baby : baby.name;
                        const babyCode = typeof baby === 'string' ? '' : baby.code;
                        return (
                          <span key={idx}>
                            {babyName}{babyCode && ` (${babyCode})`}
                            {idx < babies.length - 1 && ', '}
                          </span>
                        );
                      })}
                    </div>
                  )}
                  {assigned.map(id => {
                    const staff = getStaffById(id);
                    return <div key={id}>{formatStaffForSheet(staff)}</div>;
                  })}
                </div>
              );
            })}
          </div>

          {/* Intermediate and other areas */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {ROOMS.slice(9).filter(room => {
              // Only show Special Care 5 if it's open
              if (room.id === 'specialcare5' && !specialCare5Open) {
                return false;
              }
              return true;
            }).map(room => {
              const assigned = roomAssignments[room.id] || [];
              const babies = roomBabies[room.id] || [];
              return (
                <div key={room.id} className="border p-2">
                  <div className="font-bold text-xs">{room.name} {room.ext && `ext. ${room.ext}`}</div>
                  {babies.length > 0 && (
                    <div className="text-xs text-gray-600 mb-1">
                      {babies.map((baby, idx) => {
                        const babyName = typeof baby === 'string' ? baby : baby.name;
                        const babyCode = typeof baby === 'string' ? '' : baby.code;
                        return (
                          <span key={idx}>
                            {babyName}{babyCode && ` (${babyCode})`}
                            {idx < babies.length - 1 && ', '}
                          </span>
                        );
                      })}
                    </div>
                  )}
                  {assigned.map(id => {
                    const staff = getStaffById(id);
                    return <div key={id}>{formatStaffForSheet(staff)}</div>;
                  })}
                </div>
              );
            })}
            
            <div className="border p-2">
              <div className="font-bold text-xs">RESOURCE:</div>
              {resourceStaff && <div>{formatStaffForSheet(resourceStaff)}</div>}
            </div>
          </div>

          {/* Footer sections */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="border p-2">
              <div className="font-bold text-xs">NAME ALERT:</div>
              <div>{nameAlert}</div>
            </div>
            <div className="border p-2">
              <div className="font-bold text-xs">ROOMING IN:</div>
              <div>{roomingIn}</div>
            </div>
          </div>

          {isolationPatients && (
            <div className="border p-2 mb-2">
              <div className="font-bold text-xs">ISOLATION:</div>
              <div>{isolationPatients}</div>
            </div>
          )}

          {sickFlexed && (
            <div className="border p-2 mb-2">
              <div className="font-bold text-xs">SICK/FLEXED:</div>
              <div>{sickFlexed}</div>
            </div>
          )}
        </div>

        <div className="mt-4 flex gap-2">
          <button 
            onClick={() => window.print()}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Print Sheet
          </button>
          <button
            onClick={() => {
              // Copy to clipboard logic would go here
              const text = document.querySelector('.font-mono').innerText;
              navigator.clipboard.writeText(text);
            }}
            className="px-4 py-2 bg-gray-200 rounded"
          >
            Copy to Clipboard
          </button>
        </div>
      </div>
    );
  };

  const renderCurrentStep = () => {
    switch(currentStep) {
      case 0: return renderShiftInfo();
      case 1: return renderBabyAssignments();
      case 2: return renderWorkingStaff();
      case 3: return renderKeyRoles();
      case 4: return renderRoomAssignments();
      case 5: return renderSpecialNotes();
      case 6: return renderGeneratedSheet();
      default: return null;
    }
  };

  return (
    <div className="bg-gray-100 p-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-center mb-6">NICU Staffing Sheet</h1>
        
        {renderStepIndicator()}
        
        <div className="mb-8">
          {renderCurrentStep()}
        </div>
        
        {/* Navigation - don't show for baby assignments (step 1), room assignments (step 4) (has its own) or final step (step 6) */}
        {currentStep !== 1 && currentStep !== 4 && currentStep !== 6 && (
          <div className="flex justify-between">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className="px-6 py-2 bg-gray-200 rounded disabled:opacity-50"
            >
              ← Back
            </button>
            <button
              onClick={nextStep}
              className="px-6 py-2 bg-blue-600 text-white rounded"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
