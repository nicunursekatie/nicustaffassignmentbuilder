import React, { useState, useEffect } from 'react';
import { getAllStaff, addStaff, updateStaff, deleteStaff, clearAllStaff, importStaffFromText } from '../services/staffService';

export default function StaffManagement() {
  const [staff, setStaff] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');
  const [importResult, setImportResult] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const [formData, setFormData] = useState({
    lastName: '',
    firstName: '',
    phone: '',
    extension: '',
    role: 'RN'
  });

  useEffect(() => {
    loadStaff();
  }, []);

  const loadStaff = async () => {
    try {
      setIsLoading(true);
      const staffData = await getAllStaff();
      setStaff(staffData);
    } catch (error) {
      console.error('Error loading staff:', error);
      alert('Failed to load staff. Please refresh the page.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateStaff(editingId, formData);
      } else {
        await addStaff(formData);
      }
      setFormData({ lastName: '', firstName: '', phone: '', extension: '', role: 'RN' });
      setEditingId(null);
      setShowAddForm(false);
      await loadStaff();
    } catch (error) {
      console.error('Error saving staff:', error);
      alert('Failed to save staff member.');
    }
  };

  const handleEdit = (staffMember) => {
    setFormData({
      lastName: staffMember.lastName || '',
      firstName: staffMember.firstName || '',
      phone: staffMember.phone || '',
      extension: staffMember.extension || '',
      role: staffMember.role || 'RN'
    });
    setEditingId(staffMember.id);
    setShowAddForm(true);
  };

  const handleDelete = async (staffId, staffName) => {
    if (window.confirm(`Are you sure you want to delete ${staffName}?`)) {
      try {
        await deleteStaff(staffId);
        await loadStaff();
      } catch (error) {
        console.error('Error deleting staff:', error);
        alert('Failed to delete staff member.');
      }
    }
  };

  const handleClearAll = async () => {
    if (window.confirm(`Are you sure you want to delete ALL ${staff.length} staff members? This cannot be undone!`)) {
      try {
        await clearAllStaff();
        await loadStaff();
        alert('All staff members have been deleted.');
      } catch (error) {
        console.error('Error clearing staff:', error);
        alert('Failed to clear staff members.');
      }
    }
  };

  const handleImport = async () => {
    if (!importText.trim()) {
      alert('Please enter staff data to import.');
      return;
    }

    setIsImporting(true);
    setImportResult(null);
    
    try {
      const result = await importStaffFromText(importText);
      setImportResult(result);
      setImportText('');
      await loadStaff();
      
      if (result.errors.length > 0) {
        alert(`Imported ${result.success} staff members, but ${result.errors.length} errors occurred. Check the import results below.`);
      } else {
        alert(`Successfully imported ${result.success} staff members!`);
      }
    } catch (error) {
      console.error('Error importing staff:', error);
      alert('Failed to import staff. Please check the format and try again.');
    } finally {
      setIsImporting(false);
    }
  };

  const formatStaffName = (staff) => {
    return staff.firstName 
      ? `${staff.lastName}, ${staff.firstName}`
      : staff.lastName;
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Loading staff...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Staff Management</h1>
        <div className="flex gap-2">
          {staff.length > 0 && (
            <button
              onClick={handleClearAll}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Clear All Staff ({staff.length})
            </button>
          )}
          <button
            onClick={() => {
              setShowImport(!showImport);
              setShowAddForm(false);
              setImportResult(null);
            }}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            {showImport ? 'Cancel Import' : 'Import Staff'}
          </button>
          <button
            onClick={() => {
              setShowAddForm(!showAddForm);
              setShowImport(false);
              setEditingId(null);
              setFormData({ lastName: '', firstName: '', phone: '', extension: '', role: 'RN' });
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {showAddForm ? 'Cancel' : '+ Add Staff'}
          </button>
        </div>
      </div>

      {showImport && (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6">
          <h2 className="text-xl font-bold mb-4">Import Staff from Text</h2>
          <p className="text-sm text-gray-700 mb-4">
            Paste staff data below. Supports multiple formats:
          </p>
          <ul className="text-sm text-gray-600 mb-4 list-disc list-inside space-y-1">
            <li><strong>CSV:</strong> LastName,FirstName,Phone,Extension,Role</li>
            <li><strong>Tab-separated:</strong> LastName	FirstName	Phone	Extension	Role</li>
            <li><strong>Space-separated:</strong> LastName FirstName Phone Extension Role</li>
            <li><strong>Minimal:</strong> LastName,Phone (other fields optional)</li>
          </ul>
          <textarea
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder={`Hamathka,Zoey,78274,21124,RN
Parker,Paz,75284,21125,RN
Jones,A+B,78278,21126,RN`}
            className="w-full p-3 border rounded font-mono text-sm h-48 mb-4"
          />
          <div className="flex gap-2">
            <button
              onClick={handleImport}
              disabled={isImporting || !importText.trim()}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isImporting ? 'Importing...' : 'Import Staff'}
            </button>
          </div>
          {importResult && (
            <div className={`mt-4 p-3 rounded ${importResult.errors.length > 0 ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
              <p className="font-medium">
                Import Results: {importResult.success} staff members imported successfully
              </p>
              {importResult.errors.length > 0 && (
                <div className="mt-2">
                  <p className="font-medium text-red-700">Errors ({importResult.errors.length}):</p>
                  <ul className="text-sm text-red-600 mt-1 space-y-1">
                    {importResult.errors.map((error, idx) => (
                      <li key={idx}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-lg mb-6">
          <h2 className="text-xl font-bold mb-4">
            {editingId ? 'Edit Staff Member' : 'Add New Staff Member'}
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Last Name *</label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">First Name</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone Extension</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-2 border rounded"
                placeholder="e.g., 78274"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Work Extension #</label>
              <input
                type="text"
                value={formData.extension}
                onChange={(e) => setFormData({ ...formData, extension: e.target.value })}
                className="w-full p-2 border rounded"
                placeholder="e.g., 21124"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full p-2 border rounded"
              >
                <option value="RN">RN</option>
                <option value="RT">RT</option>
                <option value="MD">MD</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          <div className="mt-4">
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              {editingId ? 'Update' : 'Add'} Staff Member
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Phone Ext
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Work Ext
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {staff.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                  No staff members found. Add your first staff member above.
                </td>
              </tr>
            ) : (
              staff.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatStaffName(member)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {member.phone || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {member.extension || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {member.role || 'RN'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(member)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(member.id, formatStaffName(member))}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

