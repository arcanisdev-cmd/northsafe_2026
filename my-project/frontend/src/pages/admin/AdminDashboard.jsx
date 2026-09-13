import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    BarChart3,
    CalendarDays,
    CheckCircle2,
    Clock3,
    FileText,
    History,
    MapPin,
    Pencil,
    Siren,
    User,
    Wrench,
} from 'lucide-react';
import api from '../../services/api';
import AdminLayout from '../../components/admin/AdminLayout';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [viewportWidth, setViewportWidth] = useState(() => window.innerWidth);
    const isMobile = viewportWidth < 768;
    const isTablet = viewportWidth >= 768 && viewportWidth < 1100;
    const [analytics, setAnalytics] = useState(null);
    const [recentReports, setRecentReports] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchData(); }, []);

    useEffect(() => {
        const handleResize = () => setViewportWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const fetchData = async () => {
        try {
            const [analyticsRes, reportsRes] = await Promise.all([
                api.get('/admin/analytics'),
                api.get('/admin/reports?page=1'),
            ]);
            setAnalytics(analyticsRes.data);
            setRecentReports(reportsRes.data.data?.slice(0, 5) || []);
        } catch (err) {
            console.error('Failed to fetch admin data:', err);
        } finally {
            setLoading(false);
        }
    };

    const statusColors = {
        pending:     { bg: '#FEF3C7', text: '#D97706' },
        verified:    { bg: '#DBEAFE', text: '#2563EB' },
        in_progress: { bg: '#EDE9FE', text: '#7C3AED' },
        resolved:    { bg: '#D1FAE5', text: '#059669' },
        rejected:    { bg: '#FEE2E2', text: '#DC2626' },
    };

    const severityColors = {
        low:      { bg: '#D1FAE5', text: '#059669' },
        medium:   { bg: '#FEF3C7', text: '#D97706' },
        high:     { bg: '#FFEDD5', text: '#EA580C' },
        critical: { bg: '#FEE2E2', text: '#DC2626' },
    };

    const getBadgeStyle = (map, key) => ({
        backgroundColor: map[key]?.bg || '#F3F4F6',
        color: map[key]?.text || '#6B7280',
        padding: '2px 10px',
        borderRadius: '999px',
        fontSize: '11px',
        fontWeight: 700,
    });

    return (
        <AdminLayout>
            <div style={{ padding: isMobile ? '72px 14px 22px' : (isTablet ? '26px 20px' : '36px 40px'), maxWidth: '100%' }}>

                {/* Page Header */}
                <div style={{ marginBottom: '28px' }}>
                    <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#F47820', margin: 0 }}>
                        Admin Dashboard
                    </h1>
                    <p style={{ color: '#92400E', fontSize: '14px', marginTop: '4px' }}>
                        Manage and monitor all hazard reports across North Caloocan
                    </p>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '80px 0', color: '#92400E' }}>
                        Loading dashboard...
                    </div>
                ) : (
                    <>
                        {/* Stats Cards */}
                        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, minmax(0, 1fr))' : (isTablet ? 'repeat(2, minmax(0, 1fr))' : 'repeat(4, minmax(0, 1fr))'), gap: '16px', marginBottom: '28px' }}>
                            {[
                                { label: 'Total Reports', value: analytics?.total_reports || 0, icon: FileText, bg: '#DBEAFE', color: '#2563EB' },
                                { label: 'Pending', value: analytics?.pending_reports || 0, icon: Clock3, bg: '#FEF3C7', color: '#D97706' },
                                { label: 'In Progress', value: analytics?.in_progress_reports || 0, icon: Wrench, bg: '#EDE9FE', color: '#7C3AED' },
                                { label: 'Resolved', value: analytics?.resolved_reports || 0, icon: CheckCircle2, bg: '#D1FAE5', color: '#059669' },
                            ].map((stat, i) => (
                                <div key={i} style={{ backgroundColor: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <stat.icon size={20} color={stat.color} />
                                        </div>
                                    </div>
                                    <p style={{ fontSize: '28px', fontWeight: 900, color: stat.color, margin: 0 }}>{stat.value}</p>
                                    <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>{stat.label}</p>
                                </div>
                            ))}
                        </div>

                        {/* Charts Row */}
                        <div style={{ display: 'grid', gridTemplateColumns: isMobile || isTablet ? '1fr' : '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                            {/* Reports by Category */}
                            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, color: '#1C1C1C', marginBottom: '16px', fontSize: '15px' }}>
                                    <BarChart3 size={16} color="#F47820" /> Reports by Category
                                </h3>
                                {!analytics?.reports_by_category?.length ? (
                                    <p style={{ color: '#9CA3AF', fontSize: '13px' }}>No data yet</p>
                                ) : analytics.reports_by_category.map((item, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                                        <span style={{ fontSize: '13px', color: '#4B5563', minWidth: '120px' }}>{item.category}</span>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                                            <div style={{ flex: 1, height: '8px', backgroundColor: '#F3F4F6', borderRadius: '999px', overflow: 'hidden' }}>
                                                <div style={{ width: `${(item.count / analytics.total_reports) * 100}%`, height: '100%', backgroundColor: '#F47820', borderRadius: '999px' }} />
                                            </div>
                                            <span style={{ fontSize: '12px', fontWeight: 700, color: '#374151', minWidth: '20px', textAlign: 'right' }}>{item.count}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Reports by Severity */}
                            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, color: '#1C1C1C', marginBottom: '16px', fontSize: '15px' }}>
                                    <Siren size={16} color="#F47820" /> Reports by Severity
                                </h3>
                                {analytics?.reports_by_severity?.map((item, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                                        <span style={{ ...getBadgeStyle(severityColors, item.severity) }}>
                                            {item.severity?.toUpperCase()}
                                        </span>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, marginLeft: '12px' }}>
                                            <div style={{ flex: 1, height: '8px', backgroundColor: '#F3F4F6', borderRadius: '999px', overflow: 'hidden' }}>
                                                <div style={{ width: `${(item.count / analytics.total_reports) * 100}%`, height: '100%', backgroundColor: severityColors[item.severity]?.text || '#9CA3AF', borderRadius: '999px' }} />
                                            </div>
                                            <span style={{ fontSize: '12px', fontWeight: 700, color: '#374151', minWidth: '20px', textAlign: 'right' }}>{item.count}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recent Reports */}
                        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: '24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, color: '#1C1C1C', fontSize: '15px', margin: 0 }}>
                                    <History size={16} color="#F47820" /> Recent Reports
                                </h3>
                                <button onClick={() => navigate('/admin/reports')} style={{ fontSize: '13px', fontWeight: 700, color: '#F47820', background: 'none', border: 'none', cursor: 'pointer' }}>
                                    View All →
                                </button>
                            </div>
                            {recentReports.length === 0 ? (
                                <p style={{ color: '#9CA3AF', fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>No reports yet</p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {recentReports.map(report => (
                                        <div key={report.id} style={{ display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', padding: '14px 16px', backgroundColor: '#FAFAFA', borderRadius: '12px', gap: isMobile ? '10px' : 0 }}>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
                                                    <span style={getBadgeStyle(statusColors, report.status)}>{report.status?.replace('_', ' ').toUpperCase()}</span>
                                                    <span style={getBadgeStyle(severityColors, report.severity)}>{report.severity?.toUpperCase()} Severity</span>
                                                </div>
                                                <p style={{ fontSize: '14px', fontWeight: 700, color: '#1C1C1C', margin: 0 }}>{report.title}</p>
                                                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px', fontSize: '12px', color: '#9CA3AF', marginTop: '2px' }}>
                                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                                        <User size={13} />
                                                        {report.user?.name}
                                                    </span>
                                                    <span style={{ color: '#D1D5DB' }}>•</span>
                                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                                        <MapPin size={13} />
                                                        {report.address}, {report.barangay}
                                                    </span>
                                                    <span style={{ color: '#D1D5DB' }}>•</span>
                                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                                        <CalendarDays size={13} />
                                                        {new Date(report.created_at).toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' })}
                                                    </span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => navigate('/admin/reports')}
                                                style={{ marginLeft: isMobile ? 0 : '16px', width: isMobile ? '100%' : 'auto', padding: '8px 18px', backgroundColor: '#1E3A5F', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}
                                            >
                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                                    <Pencil size={14} />
                                                    Update Status
                                                </span>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Top Barangays */}
                        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, color: '#1C1C1C', fontSize: '15px', marginBottom: '16px' }}>
                                <MapPin size={16} color="#F47820" /> Top Barangays with Reports
                            </h3>
                            {!analytics?.reports_by_barangay?.length ? (
                                <p style={{ color: '#9CA3AF', fontSize: '13px' }}>No data yet</p>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, minmax(0, 1fr))' : (isTablet ? 'repeat(3, minmax(0, 1fr))' : 'repeat(5, minmax(0, 1fr))'), gap: '12px' }}>
                                    {analytics.reports_by_barangay.map((item, i) => (
                                        <div key={i} style={{ backgroundColor: '#FFF7ED', borderRadius: '12px', padding: '14px', textAlign: 'center' }}>
                                            <p style={{ fontSize: '22px', fontWeight: 900, color: '#F47820', margin: 0 }}>{item.count}</p>
                                            <p style={{ fontSize: '11px', color: '#92400E', marginTop: '4px', lineHeight: 1.3 }}>{item.barangay}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminDashboard;