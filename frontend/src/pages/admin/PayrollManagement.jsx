import React, { useState, useEffect } from 'react';
import { payrollAPI, employeeAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function PayrollManagement() {
  const [runs, setRuns] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [editSalary, setEditSalary] = useState(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [runsRes, empRes] = await Promise.all([
        payrollAPI.getRuns(),
        employeeAPI.getAll({ limit: 100 })
      ]);
      setRuns(runsRes.data.data);
      setEmployees(empRes.data.data || []);
    } catch (err) { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  const handleProcessAll = async () => {
    if (!window.confirm(`Process payroll for all employees for ${month}/${year}?`)) return;
    setProcessing(true);
    try {
      const res = await payrollAPI.process({ month, year });
      toast.success(`Payroll processed! Net pay: ₹${res.data.data.totals?.net?.toLocaleString() || 'N/A'}`);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to process');
    } finally {
      setProcessing(false);
    }
  };

  const handleGenerateSelected = async () => {
    if (selectedEmployees.length === 0) {
      toast.error('Please select at least one employee');
      return;
    }
    setShowGenerateModal(false);
    setProcessing(true);
    try {
      const res = await payrollAPI.generate({ month, year, employeeIds: selectedEmployees });
      toast.success(`Payslips generated for ${selectedEmployees.length} employees`);
      setSelectedEmployees([]);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate');
    } finally {
      setProcessing(false);
    }
  };

  const handleUpdateSalary = async () => {
    if (!editSalary) return;
    try {
      await payrollAPI.updateSalary(editSalary.id, {
        baseSalaryMonthly: editSalary.baseSalaryMonthly,
        deductionsMonthly: editSalary.deductionsMonthly,
        bonusesMonthly: editSalary.bonusesMonthly,
        taxPercentage: editSalary.taxPercentage
      });
      toast.success('Salary updated');
      setEditSalary(null);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    }
  };

  const toggleSelectAll = () => {
    if (selectedEmployees.length === employees.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(employees.map(e => e.id));
    }
  };

  const toggleEmployee = (id) => {
    setSelectedEmployees(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const months = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  if (loading) return <div className="loading-page"><div className="loading-spinner"></div></div>;

  return (
    <div>
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <div className="card-title">Payroll Processing</div>
          <div className="card-subtitle">Set salary components and generate payslips</div>
        </div>
      </div>

      <div className="toolbar">
        <div className="toolbar-left">
          <select className="form-select" value={month} onChange={e => setMonth(Number(e.target.value))} style={{ width: 120 }}>
            {months.map((m, i) => <option key={i} value={i}>{m}</option>)}
          </select>
          <input type="number" className="form-input" value={year} onChange={e => setYear(Number(e.target.value))} style={{ width: 100 }} />
          <button className="btn btn-primary" onClick={handleProcessAll} disabled={processing}>
            {processing ? 'Processing...' : 'Process All'}
          </button>
          <button className="btn" onClick={() => setShowGenerateModal(true)} disabled={processing || selectedEmployees.length === 0}>
            Generate Selected ({selectedEmployees.length})
          </button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <div className="card-title">Employees</div>
          <div className="card-subtitle">Set bonus, deductions, and tax percentage for each employee</div>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th style={{ width: 40 }}>
                <input type="checkbox" checked={selectedEmployees.length === employees.length && employees.length > 0} onChange={toggleSelectAll} />
              </th>
              <th>Employee</th>
              <th>Department</th>
              <th>Basic Salary</th>
              <th>Bonus</th>
              <th>Deductions</th>
              <th>Tax %</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map(emp => (
              <tr key={emp.id}>
                <td>
                  <input type="checkbox" checked={selectedEmployees.includes(emp.id)} onChange={() => toggleEmployee(emp.id)} />
                </td>
                <td><strong>{emp.name}</strong><br/><span style={{ fontSize: 12, color: '#64748b' }}>{emp.employee_id}</span></td>
                <td>{emp.department || '-'}</td>
                <td>₹{(emp.baseSalaryMonthly || 0).toLocaleString()}</td>
                <td>₹{(emp.bonusesMonthly || 0).toLocaleString()}</td>
                <td>₹{(emp.deductionsMonthly || 0).toLocaleString()}</td>
                <td>{emp.taxPercentage || 0}%</td>
                <td>
                  <button className="btn btn-sm" onClick={() => setEditSalary({
                    id: emp.id,
                    baseSalaryMonthly: emp.baseSalaryMonthly || 0,
                    deductionsMonthly: emp.deductionsMonthly || 0,
                    bonusesMonthly: emp.bonusesMonthly || 0,
                    taxPercentage: emp.taxPercentage || 0
                  })}>Edit</button>
                </td>
              </tr>
            ))}
            {employees.length === 0 && (
              <tr><td colSpan="8" style={{ textAlign: 'center', padding: 40 }}>No employees found. Add employees first.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="card" style={{ marginTop: 24, marginBottom: 24 }}>
        <div className="card-header">
          <div className="card-title">Payroll History</div>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead><tr><th>Period</th><th>Employees</th><th>Gross Pay</th><th>Deductions</th><th>Tax</th><th>Net Pay</th><th>Status</th><th>Processed At</th></tr></thead>
          <tbody>
            {runs.map(r => (
              <tr key={r.runId}>
                <td><strong>{months[r.month]} {r.year}</strong></td>
                <td>{r.total_employees}</td>
                <td>₹{parseFloat(r.total_gross_pay || 0).toLocaleString()}</td>
                <td>₹{parseFloat(r.total_deductions || 0).toLocaleString()}</td>
                <td>₹{parseFloat((r.totals?.tax || 0)).toLocaleString()}</td>
                <td><strong>₹{parseFloat(r.total_net_pay || 0).toLocaleString()}</strong></td>
                <td><span className={`badge ${r.status === 'PROCESSED' ? 'badge-success' : r.status === 'PENDING' ? 'badge-warning' : 'badge-gray'}`}>{r.status}</span></td>
                <td>{r.processed_at ? new Date(r.processed_at).toLocaleString() : '-'}</td>
              </tr>
            ))}
            {runs.length === 0 && (
              <tr><td colSpan="8" style={{ textAlign: 'center', padding: 40 }}>No payroll runs yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showGenerateModal && (
        <div className="modal-overlay" onClick={() => setShowGenerateModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Generate Payslips</div>
              <button className="btn btn-sm" onClick={() => setShowGenerateModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <p>Generate payslips for <strong>{selectedEmployees.length}</strong> selected employees for <strong>{months[month]} {year}</strong>?</p>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn" onClick={() => setShowGenerateModal(false)}>Cancel</button>
              <button type="button" className="btn btn-primary" onClick={handleGenerateSelected} disabled={processing}>
                {processing ? 'Generating...' : 'Generate Payslips'}
              </button>
            </div>
          </div>
        </div>
      )}

      {editSalary && (
        <div className="modal-overlay" onClick={() => setEditSalary(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Edit Salary Components</div>
              <button className="btn btn-sm" onClick={() => setEditSalary(null)}>✕</button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleUpdateSalary(); }}>
              <div className="modal-body">
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Basic Salary (₹)</label>
                    <input type="number" className="form-input" value={editSalary.baseSalaryMonthly} onChange={e => setEditSalary({...editSalary, baseSalaryMonthly: Number(e.target.value)})} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Bonus (₹)</label>
                    <input type="number" className="form-input" value={editSalary.bonusesMonthly} onChange={e => setEditSalary({...editSalary, bonusesMonthly: Number(e.target.value)})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Deductions (₹)</label>
                    <input type="number" className="form-input" value={editSalary.deductionsMonthly} onChange={e => setEditSalary({...editSalary, deductionsMonthly: Number(e.target.value)})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tax Percentage (%)</label>
                    <input type="number" className="form-input" value={editSalary.taxPercentage} onChange={e => setEditSalary({...editSalary, taxPercentage: Number(e.target.value)})} min="0" max="100" />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn" onClick={() => setEditSalary(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Update</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
