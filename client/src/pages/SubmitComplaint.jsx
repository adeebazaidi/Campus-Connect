import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';
import { CloseIcon } from '../components/Icons';

const CATEGORIES = [
  { value: 'infrastructure', label: 'Infrastructure' },
  { value: 'academics', label: 'Academics' },
  { value: 'hostel', label: 'Hostel' },
  { value: 'finance', label: 'Finance' },
  { value: 'other', label: 'Other' },
];

const MAX_TITLE = 120;
const MAX_DESC  = 1000;

const SubmitComplaint = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [form, setForm] = useState({ title: '', description: '', category: '' });
  const [attachments, setAttachments] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'title' && value.length > MAX_TITLE) return;
    if (name === 'description' && value.length > MAX_DESC) return;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFiles = (e) => {
    setAttachments(Array.from(e.target.files));
  };

  const handleRemoveFile = (idx) => {
    setAttachments((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.category) { setError('Please select a category.'); return; }
    setLoading(true);
    setError('');

    const payload = new FormData();
    Object.entries(form).forEach(([k, v]) => payload.append(k, v));
    attachments.forEach((f) => payload.append('attachments', f));

    try {
      await api.post('/api/complaints', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      addToast('Complaint submitted successfully!');
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit complaint. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl animate-fade-in">
      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        {/* Title */}
        <div>
          <label className="input-label" htmlFor="title">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            className="input-field"
            placeholder="Brief summary of your complaint"
          />
          <p className="text-[11px] text-slate-400 mt-1 text-right">
            {form.title.length}/{MAX_TITLE}
          </p>
        </div>

        {/* Category */}
        <div>
          <label className="input-label" htmlFor="category">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            id="category"
            name="category"
            value={form.category}
            onChange={handleChange}
            required
            className="input-field"
          >
            <option value="">Select category…</option>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="input-label" htmlFor="description">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            rows={6}
            value={form.description}
            onChange={handleChange}
            required
            className="input-field resize-none"
            placeholder="Describe the issue in as much detail as possible…"
          />
          <p className="text-[11px] text-slate-400 mt-1 text-right">
            {form.description.length}/{MAX_DESC}
          </p>
        </div>

        {/* Attachments */}
        <div>
          <label className="input-label">Attachments <span className="text-slate-400 font-normal">(optional)</span></label>
          <label
            htmlFor="file-upload"
            className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-slate-300 rounded-xl py-6 cursor-pointer hover:border-primary-400 hover:bg-primary-50/30 transition-colors"
          >
            <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <span className="text-xs text-slate-500">Click to upload files</span>
            <input
              id="file-upload"
              type="file"
              multiple
              className="sr-only"
              onChange={handleFiles}
            />
          </label>

          {attachments.length > 0 && (
            <ul className="mt-2 space-y-1">
              {attachments.map((f, idx) => (
                <li key={idx} className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 rounded-lg px-3 py-2">
                  <span className="truncate max-w-xs">{f.name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(idx)}
                    className="text-slate-400 hover:text-red-500 transition-colors ml-3 shrink-0 p-1 rounded"
                    aria-label="Remove attachment"
                  >
                    <CloseIcon className="w-3.5 h-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 pt-1">
          <button
            type="submit"
            disabled={loading || !form.title || !form.description || !form.category}
            className="btn-primary"
          >
            {loading ? (
              <>
                <span className="h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                Submitting…
              </>
            ) : (
              'Submit Complaint'
            )}
          </button>
          <button type="button" onClick={() => navigate('/')} className="btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default SubmitComplaint;
