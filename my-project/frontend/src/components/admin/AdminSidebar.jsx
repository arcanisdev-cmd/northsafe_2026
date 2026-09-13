import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const navItems = [
    { label: 'Dashboard',              path: '/admin',               icon: '🏠' },
    { label: 'Hazard Reports',         path: '/admin/reports',       icon: '📋' },
    { label: 'User Management',        path: '/admin/users',         icon: '👥' },
    { label: 'Announcements',          path: '/admin/announcements', icon: '📢' },
    { label: 'Analytics',              path: '/admin/analytics',     icon: '📊' },
    { label: 'Audit logs',             path: '/admin/audit-logs',    icon: '🔍' },
];

const AdminSidebar = ({ isMobile = false, mobileOpen = false, onCloseMobile }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const storedUser = localStorage.getItem('northsafe_user') ?? sessionStorage.getItem('northsafe_user');
    let user = null;

    try {
        user = storedUser ? JSON.parse(storedUser) : null;
    } catch {
        user = null;
    }

    const isActive = (path) => {
        if (path === '/admin') return location.pathname === '/admin';
        return location.pathname.startsWith(path);
    };

    return (
        <aside
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                height: '100vh',
                width: '240px',
                backgroundColor: '#FEE9C7',
                display: 'flex',
                flexDirection: 'column',
                zIndex: 100,
                borderRight: '1px solid #F5D9A8',
                transform: isMobile ? (mobileOpen ? 'translateX(0)' : 'translateX(-100%)') : 'translateX(0)',
                transition: 'transform 0.2s ease',
            }}
        >
            {/* Logo / Brand */}
            <div
                style={{
                    backgroundColor: '#F47820',
                    padding: '20px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    minHeight: '64px',
                }}
            >
                <span style={{ color: 'white', fontWeight: 900, fontSize: '18px', letterSpacing: '1px' }}>
                    NORTHSAFE
                </span>
                {isMobile && (
                    <button
                        type="button"
                        onClick={() => {
                            if (typeof onCloseMobile === 'function') {
                                onCloseMobile();
                            }
                        }}
                        style={{
                            marginLeft: 'auto',
                            border: 'none',
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            color: 'white',
                            width: '28px',
                            height: '28px',
                            borderRadius: '8px',
                            fontSize: '18px',
                            lineHeight: 1,
                            cursor: 'pointer',
                        }}
                    >
                        ×
                    </button>
                )}
                <span
                    style={{
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        fontSize: '10px',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '999px',
                    }}
                >
                    Admin
                </span>
            </div>

            {/* Nav Links */}
            <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
                {navItems.map((item) => {
                    const active = isActive(item.path);
                    return (
                        <button
                            key={item.path}
                            onClick={() => {
                                navigate(item.path);
                                if (isMobile && typeof onCloseMobile === 'function') {
                                    onCloseMobile();
                                }
                            }}
                            style={{
                                display: 'block',
                                width: '100%',
                                textAlign: 'left',
                                padding: '12px 16px',
                                marginBottom: '4px',
                                borderRadius: '10px',
                                border: 'none',
                                cursor: 'pointer',
                                fontWeight: active ? 700 : 500,
                                fontSize: '14px',
                                color: active ? '#F47820' : '#92400E',
                                backgroundColor: active ? '#FDD9A0' : 'transparent',
                                transition: 'all 0.15s ease',
                            }}
                            onMouseEnter={e => {
                                if (!active) e.currentTarget.style.backgroundColor = '#FDECC8';
                            }}
                            onMouseLeave={e => {
                                if (!active) e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                        >
                            {item.label}
                        </button>
                    );
                })}
            </nav>

            {/* User + Logout at bottom */}
            <div
                style={{
                    padding: '16px 16px',
                    borderTop: '1px solid #F5D9A8',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                    <div
                        style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            backgroundColor: '#F47820',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 900,
                            fontSize: '14px',
                            flexShrink: 0,
                        }}
                    >
                        {user?.name?.[0]?.toUpperCase() || 'A'}
                    </div>
                    <div style={{ minWidth: 0 }}>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: '13px', color: '#1C1C1C', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {user?.name || 'Admin User'}
                        </p>
                        <p style={{ margin: 0, fontSize: '11px', color: '#92400E' }}>Administrator</p>
                    </div>
                </div>
                <button
                    onClick={async () => {
                        const token = localStorage.getItem('northsafe_token') ?? sessionStorage.getItem('northsafe_token');
                        try {
                            await fetch(`${import.meta.env.VITE_API_URL ?? ''}/api/logout`, {
                                method: 'POST',
                                headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
                            });
                        } catch { /* clear local auth even if the API is unavailable */ }
                        localStorage.removeItem('northsafe_token');
                        localStorage.removeItem('northsafe_user');
                        sessionStorage.removeItem('northsafe_token');
                        sessionStorage.removeItem('northsafe_user');
                        if (isMobile && typeof onCloseMobile === 'function') {
                            onCloseMobile();
                        }
                        navigate('/signin');
                    }}
                    style={{
                        width: '100%',
                        padding: '9px',
                        borderRadius: '8px',
                        border: '1.5px solid #F47820',
                        backgroundColor: 'transparent',
                        color: '#F47820',
                        fontWeight: 700,
                        fontSize: '13px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.backgroundColor = '#F47820';
                        e.currentTarget.style.color = 'white';
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = '#F47820';
                    }}
                >
                    Log Out
                </button>
            </div>
        </aside>
    );
};

export default AdminSidebar;