import React, { useState, useEffect } from 'react';
import { documentAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminDocuments() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const res = await documentAPI.getAll();
      setDocuments(res.data.data);
    } catch (err) {
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading-page"><div className="loading-spinner"></div></div>;

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <div className="card-title">Employee Documents</div>
          <div className="card-subtitle">View all documents uploaded by employees</div>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Employee Name</th>
              <th>Document Name</th>
              <th>Type</th>
              <th>Uploaded At</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {documents.map(doc => (
              <tr key={doc.id}>
                <td>{doc.employeeName || 'Unknown'}</td>
                <td>{doc.name}</td>
                <td>{doc.type}</td>
                <td>{new Date(doc.uploadedAt).toLocaleString()}</td>
                <td>
                  <a href={`http://localhost:5000${doc.fileUrl}`} target="_blank" rel="noreferrer" className="btn btn-sm">View</a>
                  <button className="btn btn-sm btn-primary" style={{ marginLeft: 6 }} onClick={() => {
                    const a = document.createElement('a');
                    a.href = `http://localhost:5000${doc.fileUrl}`;
                    a.download = doc.name;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                  }}>Download</button>
                </td>
              </tr>
            ))}
            {documents.length === 0 && (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: 40 }}>No documents uploaded</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
