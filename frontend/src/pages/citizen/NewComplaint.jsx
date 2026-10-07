import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createComplaint } from '../../services/complaintService';
import toast from 'react-hot-toast';
import { FiMapPin, FiUpload, FiX } from 'react-icons/fi';
import styles from './NewComplaint.module.css';

const NewComplaint = () => {
  const navigate = useNavigate();
  const fileRef = useRef();
  const [form, setForm] = useState({ title: '', description: '', lat: '', lng: '', address: '', ward: '', priority: 'medium' });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [locLoading, setLocLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return; }
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const detectLocation = () => {
    if (!navigator.geolocation) { toast.error('Geolocation not supported'); return; }
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setForm(f => ({ ...f, lat: latitude.toFixed(6), lng: longitude.toFixed(6) }));
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
          const data = await res.json();
          setForm(f => ({ ...f, address: data.display_name || '' }));
        } catch {}
        setLocLoading(false);
        toast.success('Location detected!');
      },
      () => { toast.error('Could not detect location'); setLocLoading(false); }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.lat || !form.lng) { toast.error('Please detect or enter your location'); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (image) fd.append('image', image);
      await createComplaint(fd);
      toast.success('Complaint submitted! +5 points earned 🎉');
      navigate('/citizen/complaints');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper animate-fadeIn">
      <div className="page-header">
        <h1>Report New Issue</h1>
        <p>Upload a photo and location to report a garbage issue in your area</p>
      </div>

      <div className={styles.grid}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className="card">
            <div className="card-header"><h3 className="card-title">Issue Details</h3></div>

            <div className="form-group">
              <label className="form-label">Issue Title *</label>
              <input className="form-input" name="title" placeholder="e.g. Overflowing dustbin near market" value={form.title} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label className="form-label">Description *</label>
              <textarea className="form-textarea" name="description" placeholder="Describe the issue in detail..." value={form.description} onChange={handleChange} required rows={4} />
            </div>

            <div className="form-group">
              <label className="form-label">Priority</label>
              <select className="form-select" name="priority" value={form.priority} onChange={handleChange}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Ward / Area</label>
              <input className="form-input" name="ward" placeholder="e.g. Ward 14, Andheri West" value={form.ward} onChange={handleChange} />
            </div>
          </div>

          <div className="card" style={{ marginTop: '20px' }}>
            <div className="card-header"><h3 className="card-title">Location</h3></div>

            <button type="button" className={`btn btn-ghost ${styles.locBtn}`} onClick={detectLocation} disabled={locLoading}>
              <FiMapPin /> {locLoading ? 'Detecting...' : 'Auto-detect My Location'}
            </button>

            <div className="grid-2" style={{ marginTop: '16px' }}>
              <div className="form-group">
                <label className="form-label">Latitude *</label>
                <input className="form-input" name="lat" placeholder="19.0760" value={form.lat} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Longitude *</label>
                <input className="form-input" name="lng" placeholder="72.8777" value={form.lng} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Address</label>
              <input className="form-input" name="address" placeholder="Full address (auto-filled on detect)" value={form.address} onChange={handleChange} />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '20px' }} disabled={loading}>
            {loading ? 'Submitting...' : '🚀 Submit Complaint (+5 pts)'}
          </button>
        </form>

        {/* Image Upload */}
        <div className={styles.uploadSection}>
          <div className="card">
            <div className="card-header"><h3 className="card-title">Upload Photo</h3></div>

            <div className={`${styles.dropzone} ${preview ? styles.hasImage : ''}`}
              onClick={() => fileRef.current?.click()}
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) { setImage(f); setPreview(URL.createObjectURL(f)); } }}>
              {preview ? (
                <>
                  <img src={preview} alt="Preview" className={styles.preview} />
                  <button type="button" className={styles.removeImg} onClick={(e) => { e.stopPropagation(); setImage(null); setPreview(null); }}>
                    <FiX />
                  </button>
                </>
              ) : (
                <div className={styles.uploadPlaceholder}>
                  <FiUpload className={styles.uploadIcon} />
                  <p>Click or drag to upload image</p>
                  <span>JPG, PNG, WEBP • Max 5MB</span>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} hidden />
          </div>

          <div className={styles.tipsCard}>
            <h4>📸 Tips for a good report</h4>
            <ul>
              <li>Take a clear photo showing the garbage issue</li>
              <li>Include surrounding area for context</li>
              <li>Ensure your location is accurate</li>
              <li>Add a detailed description</li>
              <li>Mark priority as High for urgent issues</li>
            </ul>
          </div>

          <div className={styles.rewardHint}>
            <span>🎁</span>
            <div>
              <strong>Earn Points!</strong>
              <p>+5 pts on submission · +20 pts when resolved</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewComplaint;
