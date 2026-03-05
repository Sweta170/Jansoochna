import React, { useState } from 'react'
import { Bot, AlertCircle, Shield } from 'lucide-react'
import api from '../services/api'
import LocationPicker from './common/LocationPicker'
import VoiceInput from './common/VoiceInput'

export default function ComplaintForm() {
  const [title, setTitle] = useState('')
  const [location, setLocation] = useState(null);
  const [suggestion, setSuggestion] = useState(null);
  const [duplicates, setDuplicates] = useState([]);
  // description will now be an uncontrolled input, accessed via e.target.description.value

  async function handleSubmit(e) {
    e.preventDefault()

    const desc = e.target.description.value;
    const cat = e.target.category.value;
    const file = e.target.image.files[0];

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', desc);
    formData.append('category', cat);
    if (file) {
      formData.append('image', file);
    }
    if (location) {
      formData.append('latitude', location.lat);
      formData.append('longitude', location.lng);
    }

    try {
      await api.post('complaints', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setTitle(''); // Clear controlled input
      e.target.reset(); // Clear uncontrolled inputs
      alert('Complaint filed successfully!');
    } catch (err) {
      console.error(err)
      alert('Failed to file complaint.');
    }
  }


  const handleDescriptionChange = async (e) => {
    const text = e.target.value;
    if (text.length > 20 && text.length % 10 === 0) { // Check every 10 chars after 20
      try {
        const res = await api.post('ai/predict', { text });
        if (res.data.category && res.data.category.length > 0) {
          setSuggestion(res.data.category[0].label);
        }
      } catch (err) { console.error('AI Predict fail', err); }
    }
  };

  const handleTitleBlur = async () => {
    if (!title || title.length < 5) return;
    try {
      const res = await api.post('ai/duplicates', {
        title,
        latitude: location?.lat,
        longitude: location?.lng
      });
      setDuplicates(res.data.duplicates);
    } catch (err) { console.error('Duplicate check fail', err); }
  };

  const handleVoiceTranscription = async (transcript) => {
    setTitle(transcript);
    // Automatically trigger AI check for the spoken text
    if (transcript.length > 5) {
      try {
        const res = await api.post('ai/predict', { text: transcript });
        if (res.data.category && res.data.category.length > 0) {
          setSuggestion(res.data.category[0].label);
        }
      } catch (err) { console.error('Voice AI Predict fail', err); }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div className="swiss-form-group">
          <label className="swiss-label">Report Title</label>
          <div style={{ position: 'relative' }}>
            <input
              className="swiss-input"
              value={title}
              onChange={e => setTitle(e.target.value)}
              onBlur={handleTitleBlur}
              placeholder="e.g. Broken Street Light"
              style={{ paddingRight: '2.5rem' }}
              required
            />
            <div style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', display: 'flex' }}>
              <VoiceInput onTranscription={handleVoiceTranscription} iconOnly={true} />
            </div>
          </div>
          {duplicates.length > 0 && (
            <div style={{
              marginTop: '1rem',
              background: '#fffbeb',
              padding: '1rem',
              borderRadius: '0.375rem',
              border: '1px solid #fde68a',
              fontSize: '0.8125rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#92400e', fontWeight: 700, marginBottom: '0.5rem' }}>
                <AlertCircle size={16} /> Similar Recent Reports
              </div>
              <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#b45309', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {duplicates.slice(0, 2).map(d => (
                  <li key={d.id}>"{d.title}" — {d.similarity}% Match</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="swiss-form-group">
          <label className="swiss-label">Detailed Description</label>
          <div style={{ position: 'relative' }}>
            <textarea
              name="description"
              className="swiss-input"
              style={{ height: '120px', padding: '0.75rem', paddingRight: '2.5rem', resize: 'none' }}
              placeholder="Please provide specific details about the issue..."
              onChange={handleDescriptionChange}
              required
            ></textarea>
            <div style={{ position: 'absolute', right: '10px', top: '10px' }}>
              <VoiceInput onTranscription={(t) => {
                const textarea = document.getElementsByName('description')[0];
                if (textarea) {
                  textarea.value = t;
                  // Manually trigger the prediction check
                  handleDescriptionChange({ target: textarea });
                }
              }} iconOnly={true} />
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div className="swiss-form-group">
            <label className="swiss-label">Category</label>
            <div style={{ position: 'relative' }}>
              <input
                name="category"
                className="swiss-input"
                placeholder="Predicting..."
                defaultValue={suggestion || ''}
              />
              {suggestion && (
                <div style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: '#dcfce7',
                  color: '#166534',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  border: '1px solid #bbf7d0'
                }}>
                  AI SUGGESTED
                </div>
              )}
            </div>
          </div>
          <div className="swiss-form-group">
            <label className="swiss-label">Evidence (Photo)</label>
            <input
              type="file"
              name="image"
              accept="image/*"
              className="swiss-input"
              style={{ padding: '0.5rem' }}
            />
          </div>
        </div>

        <div className="swiss-form-group">
          <label className="swiss-label">Pinpoint Location</label>
          <div style={{ borderRadius: '0.375rem', overflow: 'hidden', border: '1px solid var(--swiss-border)', height: '250px' }}>
            <LocationPicker onLocationSelect={setLocation} />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '1.25rem', background: 'var(--swiss-surface)', borderRadius: '4px', border: '1px solid var(--swiss-border)' }}>
          <Shield size={18} style={{ color: 'var(--swiss-primary)' }} />
          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--swiss-text-muted)' }}>
            Digital transmission via 256-bit encrypted civic protocols. System-wide integrity verified.
          </p>
        </div>

        <button
          type="submit"
          className="swiss-btn"
          style={{ width: '100%', height: '56px', fontSize: '0.9rem' }}
        >
          EXECUTE OFFICIAL DISPATCH
        </button>
      </div>
    </form>
  )
}

