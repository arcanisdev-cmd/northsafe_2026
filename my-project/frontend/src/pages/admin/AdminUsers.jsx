import React, { useState, useEffect } from 'react';
import { ArrowUpCircle, CheckCircle2, MapPin, Phone, Search, Star } from 'lucide-react';
import api from '../../services/api';
import AdminLayout from '../../components/admin/AdminLayout';

const roleConfig = {
    admin:    { bg: '#FEE2E2', text: '#EF4444', label: 'Admin' },
    employee: { bg: '#EDE9FE', text: '#8B5CF6', label: 'Employee' },
    user:     { bg: '#DBEAFE', text: '#3B82F6', label: 'User' },
};

const AdminUsers = () => {
    const [viewportWidth, setViewportWidth] = useState(() => window.innerWidth);
    const isMobile = viewportWidth < 768;
    const isTablet = viewportWidth >= 768 && viewportWidth < 1100;
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [editRole, setEditRole] = useState('');
    const [saving, setSaving] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);

    useEffect(() => { fetchUsers(); }, [page]);

    useEffect(() => {
        const handleResize = () => setViewportWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/admin/users?page=${page}`);
            setUsers(res.data.data);
            setLastPage(res.data.last_page);
        } catch (err) {
            console.error('Failed to fetch users:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectUser = (user) => {
        setSelectedUser(user);
        setEditRole(user.role);
        setSuccessMsg('');
    };

    const handleUpdateRole = async () => {
        if (!selectedUser || saving) return;
        setSaving(true);
        try {
            const res = await api.put(`/admin/users/${selectedUser.id}`, { role: editRole });
            setUsers(prev => prev.map(u => u.id === selectedUser.id ? res.data : u));
            setSelectedUser(res.data);
            setSuccessMsg('Role updated successfully!');
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (err) {
            console.error('Failed to update user:', err);
        } finally {
            setSaving(false);
        }
    };

    const filteredUsers = users.filter(u => {
        const matchSearch = u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase());
        const matchRole = roleFilter ? u.role === roleFilter : true;
        return matchSearch && matchRole;
    });

    const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' });

    const inputStyle = {
        padding: '9px 14px',
        borderRadius: '10px',
        border: '1.5px solid #E5E7EB',
        backgroundColor: 'white',
        fontSize: '13px',
        outline: 'none',
        color: '#374151',
    };

    return (
        <AdminLayout>
            <div style={{ padding: isMobile ? '72px 14px 22px' : (isTablet ? '26px 20px' : '36px 40px') }}>

                {/* Header */}
                <div style={{ marginBottom: '24px' }}>
                    <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#F47820', margin: 0 }}>User Management</h1>
                    <p style={{ color: '#92400E', fontSize: '14px', marginTop: '4px' }}>Manage user accounts and roles</p>
                </div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, minmax(0, 1fr))' : (isTablet ? 'repeat(2, minmax(0, 1fr))' : 'repeat(3, minmax(0, 1fr))'), gap: '16px', marginBottom: '24px' }}>
                    {[
                        { label: 'Regular Users', value: users.filter(u => u.role === 'user').length,     bg: '#DBEAFE', color: '#2563EB' },
                        { label: 'Employees',     value: users.filter(u => u.role === 'employee').length, bg: '#EDE9FE', color: '#7C3AED' },
                        { label: 'Admins',        value: users.filter(u => u.role === 'admin').length,    bg: '#FEE2E2', color: '#DC2626' },
                    ].map((s, i) => (
                        <div key={i} style={{ backgroundColor: 'white', borderRadius: '14px', padding: '18px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: s.bg, marginBottom: '10px' }} />
                            <p style={{ fontSize: '26px', fontWeight: 900, color: s.color, margin: 0 }}>{s.value}</p>
                            <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>{s.label}</p>
                        </div>
                    ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: isMobile || isTablet ? '1fr' : 'minmax(0, 1fr) 300px', gap: '20px', alignItems: 'flex-start' }}>
                    {/* User List */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                        {/* Search + Filter */}
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                style={{ ...inputStyle, flex: '1 1 220px', width: isMobile ? '100%' : 'auto' }}
                            />
                            <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} style={{ ...inputStyle, minWidth: isMobile ? '100%' : '170px' }}>
                                <option value="">All Roles</option>
                                <option value="user">User</option>
                                <option value="employee">Employee</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>

                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '60px 0', color: '#92400E' }}>Loading users...</div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {filteredUsers.map(user => {
                                    const rc = roleConfig[user.role] || roleConfig.user;
                                    const isSelected = selectedUser?.id === user.id;
                                    return (
                                        <div
                                            key={user.id}
                                            onClick={() => handleSelectUser(user)}
                                            style={{
                                                backgroundColor: 'white',
                                                borderRadius: '14px',
                                                padding: isMobile ? '14px 16px' : '14px 18px',
                                                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                                                cursor: 'pointer',
                                                border: isSelected ? '2px solid #F47820' : '2px solid transparent',
                                                display: 'flex',
                                                alignItems: isMobile ? 'flex-start' : 'center',
                                                flexDirection: isMobile ? 'column' : 'row',
                                                gap: '14px',
                                                transition: 'border 0.15s ease',
                                            }}
                                        >
                                            <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: rc.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: rc.text, fontWeight: 900, fontSize: '16px', flexShrink: 0 }}>
                                                {user.name?.[0]?.toUpperCase() || 'U'}
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                                                    <p style={{ fontWeight: 700, fontSize: '14px', color: '#1C1C1C', margin: 0 }}>{user.name}</p>
                                                    <span style={{ backgroundColor: rc.bg, color: rc.text, fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '999px' }}>{rc.label}</span>
                                                </div>
                                                <p style={{ fontSize: '12px', color: '#9CA3AF', margin: 0 }}>{user.email}</p>
                                                <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
                                                    {user.barangay && (
                                                        <span style={{ fontSize: '11px', color: '#9CA3AF', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                                            <MapPin size={12} />
                                                            {user.barangay}
                                                        </span>
                                                    )}
                                                    {user.phone && (
                                                        <span style={{ fontSize: '11px', color: '#9CA3AF', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                                            <Phone size={12} />
                                                            {user.phone}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div style={{ textAlign: isMobile ? 'left' : 'right', flexShrink: 0, width: isMobile ? '100%' : 'auto' }}>
                                                <p style={{ fontSize: '12px', fontWeight: 700, color: '#D97706', margin: 0, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                                    <Star size={12} fill="currentColor" />
                                                    {user.total_points || 0} pts
                                                </p>
                                                <p style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '2px' }}>{formatDate(user.created_at)}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                                {filteredUsers.length === 0 && (
                                    <div style={{ backgroundColor: 'white', borderRadius: '14px', padding: '60px', textAlign: 'center', color: '#9CA3AF' }}>
                                        <div style={{ marginBottom: '10px', display: 'inline-flex' }}>
                                            <Search size={36} color="#9CA3AF" />
                                        </div>
                                        <p style={{ fontWeight: 700 }}>No users found</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Pagination */}
                        {lastPage > 1 && (
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
                                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                                    style={{ padding: '8px 18px', borderRadius: '10px', border: '1.5px solid #E5E7EB', backgroundColor: 'white', fontWeight: 700, fontSize: '13px', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.4 : 1 }}>
                                    ← Prev
                                </button>
                                <span style={{ padding: '8px 18px', borderRadius: '10px', border: '1.5px solid #E5E7EB', backgroundColor: 'white', fontWeight: 700, fontSize: '13px' }}>
                                    {page} / {lastPage}
                                </span>
                                <button onClick={() => setPage(p => Math.min(lastPage, p + 1))} disabled={page === lastPage}
                                    style={{ padding: '8px 18px', borderRadius: '10px', border: '1.5px solid #E5E7EB', backgroundColor: 'white', fontWeight: 700, fontSize: '13px', cursor: page === lastPage ? 'not-allowed' : 'pointer', opacity: page === lastPage ? 0.4 : 1 }}>
                                    Next →
                                </button>
                            </div>
                        )}
                    </div>

                    {/* User Detail Panel */}
                    {!isMobile && (
                        <div style={{ width: '300px', flexShrink: 0 }}>
                        {selectedUser ? (
                            <div style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 1px 8px rgba(0,0,0,0.08)', overflow: 'hidden', position: 'sticky', top: '24px' }}>
                                <div style={{ backgroundColor: '#1C2B3A', padding: '24px', textAlign: 'center' }}>
                                    <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#F47820', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: '22px', margin: '0 auto 12px' }}>
                                        {selectedUser.name?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                    <p style={{ color: 'white', fontWeight: 900, fontSize: '16px', margin: 0 }}>{selectedUser.name}</p>
                                    <p style={{ color: '#94A3B8', fontSize: '12px', marginTop: '4px' }}>{selectedUser.email}</p>
                                    <p style={{ color: '#FCD34D', fontSize: '12px', marginTop: '4px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                        <Star size={12} fill="currentColor" />
                                        {selectedUser.total_points || 0} points
                                    </p>
                                </div>

                                <div style={{ padding: '20px' }}>
                                    {[
                                        { label: 'Phone',    value: selectedUser.phone || 'Not provided' },
                                        { label: 'Barangay', value: selectedUser.barangay || 'Not provided' },
                                        { label: 'Joined',   value: formatDate(selectedUser.created_at) },
                                    ].map((item, i) => (
                                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #F3F4F6' }}>
                                            <span style={{ fontSize: '12px', color: '#9CA3AF' }}>{item.label}</span>
                                            <span style={{ fontSize: '12px', fontWeight: 700, color: '#374151' }}>{item.value}</span>
                                        </div>
                                    ))}

                                    <p style={{ fontSize: '11px', fontWeight: 800, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '16px 0 10px' }}>Change Role</p>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px', marginBottom: '12px' }}>
                                        {['user', 'employee'].map(role => {
                                            const rc = roleConfig[role];
                                            const isSelected = editRole === role;
                                            return (
                                                <button key={role} onClick={() => setEditRole(role)}
                                                    style={{
                                                        padding: '9px 4px',
                                                        borderRadius: '10px',
                                                        border: `2px solid ${rc.text}`,
                                                        backgroundColor: isSelected ? rc.text : rc.bg,
                                                        color: isSelected ? 'white' : rc.text,
                                                        fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                                                    }}>
                                                    {rc.label}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {successMsg && (
                                        <div style={{ backgroundColor: '#D1FAE5', border: '1px solid #A7F3D0', color: '#065F46', fontSize: '12px', fontWeight: 700, padding: '10px', borderRadius: '8px', marginBottom: '10px', textAlign: 'center' }}>
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                                <CheckCircle2 size={14} />
                                                {successMsg}
                                            </span>
                                        </div>
                                    )}

                                    <button onClick={handleUpdateRole} disabled={saving || editRole === selectedUser.role}
                                        style={{
                                            width: '100%', padding: '11px', borderRadius: '10px', border: 'none',
                                            backgroundColor: editRole !== selectedUser.role ? '#F47820' : '#E5E7EB',
                                            color: editRole !== selectedUser.role ? 'white' : '#9CA3AF',
                                            fontWeight: 700, fontSize: '14px',
                                            cursor: editRole !== selectedUser.role ? 'pointer' : 'not-allowed',
                                        }}>
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '60px 24px', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', position: 'sticky', top: '24px' }}>
                                <div style={{ marginBottom: '12px', display: 'inline-flex' }}>
                                    <ArrowUpCircle size={40} color="#9CA3AF" />
                                </div>
                                <p style={{ fontWeight: 700, color: '#374151', fontSize: '14px' }}>Select a user to manage their account</p>
                            </div>
                        )}
                        </div>
                    )}
                </div>

                {isMobile && selectedUser && (
                    <div
                        onClick={() => setSelectedUser(null)}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            backgroundColor: 'rgba(17, 24, 39, 0.58)',
                            zIndex: 1000,
                            padding: '18px 14px',
                            display: 'flex',
                            alignItems: 'flex-end',
                        }}
                    >
                        <div
                            onClick={(event) => event.stopPropagation()}
                            style={{
                                width: '100%',
                                maxHeight: '90vh',
                                overflowY: 'auto',
                                borderRadius: '18px 18px 14px 14px',
                                backgroundColor: 'white',
                                boxShadow: '0 20px 48px rgba(0,0,0,0.25)',
                                overflow: 'hidden',
                            }}
                        >
                            <div style={{ backgroundColor: '#1C2B3A', padding: '20px 16px', textAlign: 'center', position: 'relative' }}>
                                <button
                                    onClick={() => setSelectedUser(null)}
                                    style={{ position: 'absolute', top: '12px', right: '12px', width: '34px', height: '34px', borderRadius: '10px', border: 'none', backgroundColor: 'rgba(255,255,255,0.14)', color: 'white', fontSize: '20px', fontWeight: 700, cursor: 'pointer' }}
                                >
                                    ×
                                </button>
                                <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#F47820', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: '20px', margin: '0 auto 10px' }}>
                                    {selectedUser.name?.[0]?.toUpperCase() || 'U'}
                                </div>
                                <p style={{ color: 'white', fontWeight: 900, fontSize: '16px', margin: 0 }}>{selectedUser.name}</p>
                                <p style={{ color: '#94A3B8', fontSize: '12px', marginTop: '4px' }}>{selectedUser.email}</p>
                                <p style={{ color: '#FCD34D', fontSize: '12px', marginTop: '4px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                    <Star size={12} fill="currentColor" />
                                    {selectedUser.total_points || 0} points
                                </p>
                            </div>

                            <div style={{ padding: '16px' }}>
                                {[
                                    { label: 'Phone', value: selectedUser.phone || 'Not provided' },
                                    { label: 'Barangay', value: selectedUser.barangay || 'Not provided' },
                                    { label: 'Joined', value: formatDate(selectedUser.created_at) },
                                ].map((item, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #F3F4F6' }}>
                                        <span style={{ fontSize: '12px', color: '#9CA3AF' }}>{item.label}</span>
                                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#374151', textAlign: 'right' }}>{item.value}</span>
                                    </div>
                                ))}

                                <p style={{ fontSize: '11px', fontWeight: 800, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '16px 0 10px' }}>Change Role</p>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '6px', marginBottom: '12px' }}>
                                    {['user', 'employee'].map(role => {
                                        const rc = roleConfig[role];
                                        const isSelected = editRole === role;
                                        return (
                                            <button key={role} onClick={() => setEditRole(role)}
                                                style={{
                                                    padding: '9px 4px',
                                                    borderRadius: '10px',
                                                    border: `2px solid ${rc.text}`,
                                                    backgroundColor: isSelected ? rc.text : rc.bg,
                                                    color: isSelected ? 'white' : rc.text,
                                                    fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                                                }}>
                                                {rc.label}
                                            </button>
                                        );
                                    })}
                                </div>

                                {successMsg && (
                                    <div style={{ backgroundColor: '#D1FAE5', border: '1px solid #A7F3D0', color: '#065F46', fontSize: '12px', fontWeight: 700, padding: '10px', borderRadius: '8px', marginBottom: '10px', textAlign: 'center' }}>
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                            <CheckCircle2 size={14} />
                                            {successMsg}
                                        </span>
                                    </div>
                                )}

                                <button onClick={handleUpdateRole} disabled={saving || editRole === selectedUser.role}
                                    style={{
                                        width: '100%', padding: '11px', borderRadius: '10px', border: 'none',
                                        backgroundColor: editRole !== selectedUser.role ? '#F47820' : '#E5E7EB',
                                        color: editRole !== selectedUser.role ? 'white' : '#9CA3AF',
                                        fontWeight: 700, fontSize: '14px',
                                        cursor: editRole !== selectedUser.role ? 'pointer' : 'not-allowed',
                                    }}>
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminUsers;