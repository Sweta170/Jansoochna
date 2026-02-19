import React, { useState } from 'react'
import api from '../services/api'
import LocationPicker from './common/LocationPicker'

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
      await api.post('/complaints', formData, {
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
        const res = await api.post('/ai/predict', { text });
        if (res.data.category && res.data.category.length > 0) {
          setSuggestion(res.data.category[0].label);
        }
      } catch (err) { console.error('AI Predict fail', err); }
    }
  };

  const handleTitleBlur = async () => {
    if (!title || title.length < 5) return;
    try {
      const res = await api.post('/ai/duplicates', {
        title,
        latitude: location?.lat,
        longitude: location?.lng
      });
      setDuplicates(res.data.duplicates);
    } catch (err) { console.error('Duplicate check fail', err); }
  };

  return (
    <form onSubmit={handleSubmit} className="card">
      <h3>New Complaint</h3>
      <input
        value={title}
        onChange={e => setTitle(e.target.value)}
        onBlur={handleTitleBlur}
        placeholder="Title (e.g. Broken Street Light)"
      />
      {duplicates.length > 0 && (
        <div style={{ background: '#fff3cd', padding: '0.5rem', marginBottom: '1rem', borderRadius: '4px', fontSize: '0.9rem' }}>
          <strong>Possible Duplicates Found:</strong>
          <ul style={{ margin: '0.5rem 0 0 1rem', padding: 0 }}>
            {duplicates.map(d => (
              <li key={d.id}>
                #{d.id} "{d.title}" - {d.similarity}% match {d.isGeoMatch ? '(Nearby)' : ''}
              </li>
            ))}
          </ul>
        </div>
      )}

      <textarea
        name="description"
        placeholder="Description"
        onChange={handleDescriptionChange}
      ></textarea>
      <div style={{ marginBottom: '1rem' }}>
        <input name="category" placeholder="Category (e.g. Roads)" defaultValue={suggestion || ''} />
        {suggestion && (
          <div style={{ fontSize: '0.8rem', color: 'var(--primary)', marginTop: '0.2rem' }}>
            🤖 AI Suggestion: <strong>{suggestion}</strong>
          </div>
        )}
      </div>

      <label style={{ display: 'block', marginBottom: '0.5rem' }}>Location</label>
      <LocationPicker onLocationSelect={setLocation} />

      <input type="file" name="image" accept="image/*" />

      <button type="submit">Submit Complaint</button>
    </form>
  )
}

