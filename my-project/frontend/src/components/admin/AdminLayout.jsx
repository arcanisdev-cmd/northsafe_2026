import React, { useEffect, useState } from 'react';
import AdminSidebar from './AdminSidebar';

const SIDEBAR_WIDTH = 240;

const AdminLayout = ({ children }) => {
    const [viewportWidth, setViewportWidth] = useState(() => window.innerWidth);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const isMobile = viewportWidth < 768;

    useEffect(() => {
        const handleResize = () => setViewportWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (!isMobile) {
            setMobileSidebarOpen(false);
        }
    }, [isMobile]);

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#FEFAF0' }}>
            {/* Sidebar — fixed, always visible */}
            <AdminSidebar
                isMobile={isMobile}
                mobileOpen={mobileSidebarOpen}
                onCloseMobile={() => setMobileSidebarOpen(false)}
            />

            {isMobile && mobileSidebarOpen && (
                <button
                    type="button"
                    aria-label="Close admin navigation"
                    onClick={() => setMobileSidebarOpen(false)}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        border: 'none',
                        backgroundColor: 'rgba(15, 23, 42, 0.45)',
                        zIndex: 95,
                        cursor: 'pointer',
                    }}
                />
            )}

            {isMobile && !mobileSidebarOpen && (
                <button
                    type="button"
                    aria-label="Open admin navigation"
                    onClick={() => setMobileSidebarOpen(true)}
                    style={{
                        position: 'fixed',
                        top: '14px',
                        left: '14px',
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        border: 'none',
                        backgroundColor: '#F47820',
                        color: 'white',
                        fontSize: '20px',
                        fontWeight: 700,
                        zIndex: 90,
                        cursor: 'pointer',
                        boxShadow: '0 8px 20px rgba(0,0,0,0.22)',
                    }}
                >
                    ≡
                </button>
            )}

            {/* Main content — pushed right by sidebar width */}
            <main
                style={{
                    marginLeft: isMobile ? 0 : SIDEBAR_WIDTH,
                    flex: 1,
                    minHeight: '100vh',
                    backgroundColor: '#FEFAF0',
                    overflowX: 'hidden',
                }}
            >
                {children}
            </main>
        </div>
    );
};

export default AdminLayout;