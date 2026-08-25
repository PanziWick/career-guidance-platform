import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const datasetConfigs = {
  universities: {
    title: 'Universities',
    endpoint: '/api/admin/universities',
    idField: 'universityId',
    columns: ['universityId', 'name', 'type', 'location'],
    formFields: [
      { name: 'universityId', label: 'University ID', type: 'text', required: true },
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'type', label: 'Type', type: 'select', options: ['State', 'Private'], required: true },
      { name: 'location', label: 'Location', type: 'text', required: true }
    ]
  },
  degrees: {
    title: 'Degree Programmes',
    endpoint: '/api/admin/degrees',
    idField: 'degreeId',
    columns: ['degreeId', 'name', 'universityId', 'type', 'category', 'minimumRequirement'],
    formFields: [
      { name: 'degreeId', label: 'Degree ID', type: 'text', required: true },
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'universityId', label: 'University ID (ref)', type: 'text', required: true },
      { name: 'type', label: 'Type', type: 'select', options: ['State', 'Private'], required: true },
      { name: 'category', label: 'Category', type: 'text' },
      { name: 'minimumRequirement', label: 'Minimum Requirement', type: 'text' }
    ]
  },
  careers: {
    title: 'Careers',
    endpoint: '/api/admin/careers',
    idField: 'careerId',
    columns: ['careerId', 'name', 'category'],
    formFields: [
      { name: 'careerId', label: 'Career ID', type: 'text', required: true },
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'category', label: 'Category', type: 'text' },
      { name: 'requiredSkills', label: 'Required Skills (comma separated)', type: 'text', isArray: true }
    ]
  },
  skills: {
    title: 'Skills',
    endpoint: '/api/admin/skills',
    idField: 'skillId',
    columns: ['skillId', 'name'],
    formFields: [
      { name: 'skillId', label: 'Skill ID', type: 'text', required: true },
      { name: 'name', label: 'Name', type: 'text', required: true }
    ]
  },
  'career-mappings': {
    title: 'Career Mappings',
    endpoint: '/api/admin/career-mappings',
    idField: '_id',
    columns: ['degreeId', 'careerId', 'notes'],
    formFields: [
      { name: 'degreeId', label: 'Degree ID', type: 'text', required: true },
      { name: 'careerId', label: 'Career ID', type: 'text', required: true },
      { name: 'notes', label: 'Notes', type: 'text' }
    ]
  },
  'learning-resources': {
    title: 'Learning Resources',
    endpoint: '/api/admin/learning-resources',
    idField: 'resourceId',
    columns: ['resourceId', 'title', 'provider', 'type', 'level'],
    formFields: [
      { name: 'resourceId', label: 'Resource ID', type: 'text', required: true },
      { name: 'skillId', label: 'Skill Object ID', type: 'text', required: true },
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'provider', label: 'Provider', type: 'text', required: true },
      { name: 'url', label: 'URL', type: 'text', required: true },
      { name: 'type', label: 'Type', type: 'text' },
      { name: 'level', label: 'Level', type: 'text' },
      { name: 'access', label: 'Access', type: 'text' },
      { name: 'duration', label: 'Duration', type: 'text' }
    ]
  },
  'recommendation-rules': {
    title: 'Recommendation Rules',
    endpoint: '/api/admin/recommendation-rules',
    idField: 'ruleId',
    columns: ['ruleId', 'subjects', 'interest', 'recommend'],
    formFields: [
      { name: 'ruleId', label: 'Rule ID', type: 'text', required: true },
      { name: 'subjects', label: 'Subjects', type: 'text', required: true },
      { name: 'interest', label: 'Interest', type: 'text', required: true },
      { name: 'recommend', label: 'Recommend', type: 'text', required: true }
    ]
  }
};

const AdminManagement = () => {
  const { dataset } = useParams();
  const config = datasetConfigs[dataset];

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [currentRecord, setCurrentRecord] = useState(null);
  const [formData, setFormData] = useState({});
  const [formError, setFormError] = useState('');

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);

  useEffect(() => {
    if (config) {
      fetchData();
    }
  }, [dataset, config]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000${config.endpoint}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setData(response.data.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (mode, record = null) => {
    setModalMode(mode);
    setCurrentRecord(record);
    setFormError('');
    if (mode === 'edit' && record) {
      const initialData = { ...record };
      // Handle array conversion for form if needed
      config.formFields.forEach(field => {
        if (field.isArray && initialData[field.name]) {
          initialData[field.name] = initialData[field.name].join(', ');
        }
      });
      // if skillId is populated
      if (dataset === 'learning-resources' && record.skillId && typeof record.skillId === 'object') {
        initialData.skillId = record.skillId._id;
      }
      setFormData(initialData);
    } else {
      setFormData({});
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentRecord(null);
    setFormData({});
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const submitData = { ...formData };
    // Handle array conversion
    config.formFields.forEach(field => {
      if (field.isArray && submitData[field.name]) {
        submitData[field.name] = submitData[field.name].split(',').map(s => s.trim()).filter(Boolean);
      }
    });

    try {
      if (modalMode === 'create') {
        await axios.post(`http://localhost:5000${config.endpoint}`, submitData, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
      } else {
        await axios.put(`http://localhost:5000${config.endpoint}/${currentRecord._id}`, submitData, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
      }
      handleCloseModal();
      fetchData();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Error saving record');
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`http://localhost:5000${config.endpoint}/${recordToDelete._id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setIsDeleteModalOpen(false);
      setRecordToDelete(null);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Error deleting record');
      setIsDeleteModalOpen(false);
    }
  };

  if (!config) return <div className="p-8">Dataset not found</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2>Manage {config.title}</h2>
          <p className="text-muted">View, create, edit, or delete {config.title.toLowerCase()} records in the system.</p>
        </div>
        <button
          onClick={() => handleOpenModal('create')}
          className="btn btn-primary"
        >
          Create New
        </button>
      </div>

      {error && (
        <div className="alert-error animate-fade-in">
          {error}
        </div>
      )}

      {loading ? (
        <div className="loading-spinner">Loading...</div>
      ) : (
        <div className="glass-panel admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                {config.columns.map(col => (
                  <th key={col}>{col}</th>
                ))}
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, idx) => (
                <tr key={row._id || idx}>
                  {config.columns.map(col => (
                    <td key={col}>
                      {typeof row[col] === 'object' && row[col] !== null ? (row[col].name || row[col].skillId || JSON.stringify(row[col])) : row[col]}
                    </td>
                  ))}
                  <td>
                    <div className="admin-table-actions">
                      <button
                        onClick={() => handleOpenModal('edit', row)}
                        className="btn btn-outline"
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => { setRecordToDelete(row); setIsDeleteModalOpen(true); }}
                        className="btn"
                        style={{ background: 'rgba(239, 68, 68, 0.15)', color: 'var(--color-danger)', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan={config.columns.length + 1} style={{ textAlign: 'center', padding: '2rem' }} className="text-muted">
                    No records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay animate-fade-in">
          <div className="modal-content">
            <form onSubmit={handleFormSubmit}>
              <div className="modal-header">
                <h3 style={{ marginBottom: 0 }}>
                  {modalMode === 'create' ? 'Create' : 'Edit'} {config.title}
                </h3>
              </div>
              
              <div className="modal-body">
                {formError && (
                  <div className="alert-error">
                    {formError}
                  </div>
                )}

                <div className="flex flex-col gap-4">
                  {config.formFields.map(field => (
                    <div key={field.name} className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">{field.label}</label>
                      {field.type === 'select' ? (
                        <select
                          name={field.name}
                          value={formData[field.name] || ''}
                          onChange={handleFormChange}
                          required={field.required}
                          className="form-select"
                        >
                          <option value="">Select an option</option>
                          {field.options.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={field.type}
                          name={field.name}
                          value={formData[field.name] || ''}
                          onChange={handleFormChange}
                          required={field.required}
                          className="form-input"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Save {config.title}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="modal-overlay animate-fade-in">
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3 style={{ marginBottom: 0, color: 'var(--color-danger)' }}>Confirm Deletion</h3>
            </div>
            <div className="modal-body">
              <p>
                Are you sure you want to delete this record? This action cannot be undone unless it is blocked by references.
              </p>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="btn"
                style={{ background: 'var(--color-danger)', color: 'white' }}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminManagement;
