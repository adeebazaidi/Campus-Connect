import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FileUploader from '../components/FileUploader';
import api from '../utils/api';

const SubmitComplaint = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
  });
  const [attachments, setAttachments] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFiles = (e) => {
    setAttachments(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const payload = new FormData();
    Object.entries(form).forEach(([key, value]) => payload.append(key, value));
    attachments.forEach((file) => payload.append('attachments', file));

    try {
      await api.post('/api/complaints', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit complaint');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Submit complaint</h1>
        <p className="text-sm text-slate-500">
          Provide as many details as possible to help resolve the issue quickly.
        </p>
      </div>

      <form className="card space-y-5" onSubmit={handleSubmit}>
        <div>
          <label className="text-sm font-semibold text-slate-700 mb-2 block" htmlFor="title">
            Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            className="input-field"
            placeholder="Enter complaint title"
          />
        </div>
        <div>
          <label
            className="text-sm font-semibold text-slate-700 mb-2 block"
            htmlFor="category"
          >
            Category
          </label>
          <select
            id="category"
            name="category"
            value={form.category}
            onChange={handleChange}
            required
            className="input-field"
          >
            <option value="">Select category</option>
            <option value="infrastructure">Infrastructure</option>
            <option value="academics">Academics</option>
            <option value="hostel">Hostel</option>
            <option value="finance">Finance</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label
            className="text-sm font-semibold text-slate-700 mb-2 block"
            htmlFor="description"
          >
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={6}
            value={form.description}
            onChange={handleChange}
            required
            className="input-field resize-none"
            placeholder="Describe your complaint in detail..."
          />
        </div>
        <FileUploader onChange={handleFiles} />
        {attachments.length > 0 && (
          <p className="text-xs text-slate-500">
            {attachments.length} file(s) selected
          </p>
        )}
        {error && (
          <div className="rounded-xl bg-red-50 border-2 border-red-200 p-3">
            <p className="text-sm text-red-700 font-medium">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
              Submitting...
            </span>
          ) : (
            'Submit complaint'
          )}
        </button>
      </form>
    </div>
  );
};

export default SubmitComplaint;


