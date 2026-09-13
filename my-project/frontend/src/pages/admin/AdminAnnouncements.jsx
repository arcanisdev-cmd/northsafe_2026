import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import AdminLayout from '../../components/admin/AdminLayout';

const typeOptions = ['general', 'weather', 'safety', 'service'];
const severityOptions = ['', 'low', 'medium', 'high', 'critical'];

const initialForm = {
    title: '',
    body: '',
    type: 'general',
    severity_level: '',
    starts_at: '',
    ends_at: '',
    related_hazard_id: '',
};

const AdminAnnouncements = () => {
    const [viewportWidth, setViewportWidth] = useState(() => window.innerWidth);
    const isMobile = viewportWidth < 768;
    const isTablet = viewportWidth >= 768 && viewportWidth < 1100;
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(initialForm);

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    useEffect(() => {
        const handleResize = () => setViewportWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const fetchAnnouncements = async () => {
        try {
            setLoading(true);
            const res = await api.get('/announcements');
            setAnnouncements(res.data?.data || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load announcements.');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setForm(initialForm);
        setEditingId(null);
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleReplacePinned = async () => {
        if (!form.title.trim() || !form.body.trim()) {
            setError('Title and body are required.');
            return;
        }

        try {
            setSaving(true);
            setError('');
            await api.post('/announcements/replace-pinned', {
                ...form,
                related_hazard_id: form.related_hazard_id ? Number(form.related_hazard_id) : null,
            });
            setSuccess('Pinned advisory updated.');
            resetForm();
            await fetchAnnouncements();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to replace pinned advisory.');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveDraft = async () => {
        if (!form.title.trim() || !form.body.trim()) {
            setError('Title and body are required.');
            return;
        }

        try {
            setSaving(true);
            setError('');
            if (editingId) {
                await api.put(`/announcements/${editingId}`, {
                    ...form,
                    related_hazard_id: form.related_hazard_id ? Number(form.related_hazard_id) : null,
                    is_active: true,
                });
                setSuccess('Announcement updated.');
            } else {
                await api.post('/announcements', {
                    ...form,
                    is_pinned: false,
                    is_active: true,
                    related_hazard_id: form.related_hazard_id ? Number(form.related_hazard_id) : null,
                });
                setSuccess('Announcement saved.');
            }
            resetForm();
            await fetchAnnouncements();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save announcement.');
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (item) => {
        setEditingId(item.id);
        setForm({
            title: item.title || '',
            body: item.body || '',
            type: item.type || 'general',
            severity_level: item.severity_level || '',
            starts_at: item.starts_at ? String(item.starts_at).slice(0, 16) : '',
            ends_at: item.ends_at ? String(item.ends_at).slice(0, 16) : '',
            related_hazard_id: item.related_hazard_id ? String(item.related_hazard_id) : '',
        });
        setSuccess('');
        setError('');
    };

    const handleReplace = async (item) => {
        try {
            setSaving(true);
            setError('');
            await api.put(`/announcements/${item.id}`, {
                title: item.title,
                body: item.body,
                type: item.type,
                severity_level: item.severity_level,
                is_active: true,
                is_pinned: true,
                starts_at: item.starts_at,
                ends_at: item.ends_at,
                related_hazard_id: item.related_hazard_id,
            });
            setSuccess('Announcement replaced.');
            await fetchAnnouncements();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to replace announcement.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (item) => {
        const confirmed = window.confirm(`Delete announcement "${item.title}"?`);
        if (!confirmed) {
            return;
        }

        try {
            setSaving(true);
            setError('');
            await api.delete(`/announcements/${item.id}`);
            setSuccess('Announcement deleted.');
            await fetchAnnouncements();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete announcement.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <AdminLayout>
            <div style={{ padding: isMobile ? '72px 14px 22px' : (isTablet ? '26px 20px 30px' : '28px 24px 40px'), maxWidth: '1100px', margin: '0 auto' }}>
                <h1 style={{ margin: '0 0 8px', fontSize: '24px', fontWeight: 900, color: '#1F2937' }}>Announcements</h1>
                <p style={{ margin: '0 0 20px', color: '#6B7280', fontSize: '13px' }}>
                    Post standalone advisories such as typhoon warnings. Replacing pinned advisory will automatically unpin the previous one.
                </p>

                {error && <div style={{ marginBottom: '12px', backgroundColor: '#FEF2F2', color: '#B91C1C', border: '1px solid #FECACA', padding: '10px 12px', borderRadius: '10px', fontSize: '12px', fontWeight: 600 }}>{error}</div>}
                {success && <div style={{ marginBottom: '12px', backgroundColor: '#ECFDF5', color: '#065F46', border: '1px solid #A7F3D0', padding: '10px 12px', borderRadius: '10px', fontSize: '12px', fontWeight: 600 }}>{success}</div>}

                <div style={{ backgroundColor: 'white', borderRadius: '14px', border: '1px solid #E5E7EB', padding: '18px', marginBottom: '18px' }}>
                    <h2 style={{ margin: '0 0 12px', fontSize: '16px', fontWeight: 800, color: '#1F2937' }}>{editingId ? 'Edit Announcement' : 'Create Announcement'}</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : (isTablet ? '1.5fr 1fr' : '2fr 1fr 1fr'), gap: '10px', marginBottom: '10px' }}>
                        <input name="title" value={form.title} onChange={handleChange} placeholder="Advisory title" style={inputStyle} />
                        <select name="type" value={form.type} onChange={handleChange} style={inputStyle}>{typeOptions.map((type) => <option key={type} value={type}>{type}</option>)}</select>
                        <select name="severity_level" value={form.severity_level} onChange={handleChange} style={inputStyle}>{severityOptions.map((level) => <option key={level || 'none'} value={level}>{level || 'none'}</option>)}</select>
                    </div>
                    <textarea name="body" value={form.body} onChange={handleChange} rows={4} placeholder="Write advisory details..." style={{ ...inputStyle, width: '100%', resize: 'vertical', marginBottom: '10px' }} />
                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : (isTablet ? '1fr 1fr' : '1fr 1fr 1fr'), gap: '10px', marginBottom: '12px' }}>
                        <input type="datetime-local" name="starts_at" value={form.starts_at} onChange={handleChange} style={inputStyle} />
                        <input type="datetime-local" name="ends_at" value={form.ends_at} onChange={handleChange} style={inputStyle} />
                        <input name="related_hazard_id" value={form.related_hazard_id} onChange={handleChange} placeholder="Optional hazard ID" style={inputStyle} />
                    </div>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <button onClick={handleReplacePinned} disabled={saving} style={primaryButton}>{saving ? 'Saving...' : 'Replace Pinned Advisory'}</button>
                        <button onClick={handleSaveDraft} disabled={saving} style={secondaryButton}>{editingId ? 'Update Announcement' : 'Save Non-Pinned Announcement'}</button>
                        {editingId && <button onClick={resetForm} disabled={saving} style={ghostButton}>Cancel Edit</button>}
                    </div>
                </div>

                <div style={{ backgroundColor: 'white', borderRadius: '14px', border: '1px solid #E5E7EB', padding: '16px' }}>
                    <h2 style={{ margin: '0 0 12px', fontSize: '16px', fontWeight: 800, color: '#1F2937' }}>Recent Announcements</h2>
                    {loading ? (
                        <p style={{ color: '#6B7280', fontSize: '13px' }}>Loading...</p>
                    ) : announcements.length === 0 ? (
                        <p style={{ color: '#9CA3AF', fontSize: '13px' }}>No announcements yet.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {announcements.map((item) => (
                                <div key={item.id} style={{ border: '1px solid #F3F4F6', borderRadius: '10px', padding: '12px' }}>
                                    <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', gap: '10px' }}>
                                        <div>
                                            <p style={{ margin: '0 0 4px', fontWeight: 800, color: '#1F2937', fontSize: '14px' }}>{item.title}</p>
                                            <p style={{ margin: '0 0 6px', color: '#6B7280', fontSize: '12px' }}>{item.body}</p>
                                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                                <span style={tagStyle}>{String(item.type || 'general').toUpperCase()}</span>
                                                {item.is_pinned && <span style={{ ...tagStyle, backgroundColor: '#FEF3C7', color: '#D97706' }}>PINNED</span>}
                                                {!item.is_active && <span style={{ ...tagStyle, backgroundColor: '#F3F4F6', color: '#6B7280' }}>INACTIVE</span>}
                                            </div>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(3, minmax(0, 1fr))' : '1fr', gap: '8px' }}>
                                            <button onClick={() => handleEdit(item)} style={{ ...ghostButton, width: '100%' }}>Edit</button>
                                            <button onClick={() => handleReplace(item)} disabled={saving} style={{ ...primaryButton, width: '100%' }}>Replace</button>
                                            <button onClick={() => handleDelete(item)} disabled={saving} style={{ ...dangerButton, width: '100%' }}>Delete</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

const inputStyle = {
    border: '1.5px solid #E5E7EB',
    borderRadius: '8px',
    padding: '8px 10px',
    fontSize: '13px',
    color: '#374151',
    backgroundColor: 'white',
    width: '100%',
    boxSizing: 'border-box',
};

const primaryButton = {
    border: 'none',
    borderRadius: '8px',
    padding: '9px 12px',
    backgroundColor: '#F47820',
    color: 'white',
    fontSize: '12px',
    fontWeight: 700,
    cursor: 'pointer',
};

const secondaryButton = {
    border: 'none',
    borderRadius: '8px',
    padding: '9px 12px',
    backgroundColor: '#1E3A5F',
    color: 'white',
    fontSize: '12px',
    fontWeight: 700,
    cursor: 'pointer',
};

const ghostButton = {
    border: '1px solid #D1D5DB',
    borderRadius: '8px',
    padding: '8px 10px',
    backgroundColor: 'white',
    color: '#374151',
    fontSize: '12px',
    fontWeight: 700,
    cursor: 'pointer',
};

const dangerButton = {
    border: 'none',
    borderRadius: '8px',
    padding: '8px 10px',
    backgroundColor: '#DC2626',
    color: 'white',
    fontSize: '12px',
    fontWeight: 700,
    cursor: 'pointer',
};

const tagStyle = {
    fontSize: '10px',
    fontWeight: 700,
    borderRadius: '999px',
    padding: '2px 8px',
    backgroundColor: '#DBEAFE',
    color: '#2563EB',
};

export default AdminAnnouncements;
