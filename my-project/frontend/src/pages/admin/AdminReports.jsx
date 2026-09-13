import React, { useState, useEffect } from 'react';
import {
    ArrowLeftCircle,
    CalendarDays,
    Camera,
    Check,
    CheckCircle2,
    CircleX,
    Inbox,
    MapPin,
    Pin,
    ThumbsDown,
    ThumbsUp,
    User,
    Wrench,
} from 'lucide-react';
import api from '../../services/api';
import AdminLayout from '../../components/admin/AdminLayout';

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

const badge = (map, key, extra = '') => ({
    backgroundColor: map[key]?.bg || '#F3F4F6',
    color: map[key]?.text || '#6B7280',
    padding: '3px 10px',
    borderRadius: '999px',
    fontSize: '11px',
    fontWeight: 700,
    display: 'inline-block',
    ...extra,
});

const getImageUrl = (report) => {
    if (report?.image_url) return report.image_url;
    if (!report?.image_path) return null;

    const apiBaseUrl = (import.meta.env.VITE_API_URL ?? '').replace(/\/+$/, '');
    const path = report.image_path.replace(/^\/?storage\//, '').replace(/^\//, '');
    return `${apiBaseUrl}/api/report-images/${path}`;
};

const AdminReports = () => {
    const [viewportWidth, setViewportWidth] = useState(() => window.innerWidth);
    const isMobile = viewportWidth < 768;
    const isTablet = viewportWidth >= 768 && viewportWidth < 1100;
    const stackDetailBelow = viewportWidth < 1200;
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(null);
    const [filterStatus, setFilterStatus] = useState('');
    const [filterSeverity, setFilterSeverity] = useState('');
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [selectedReport, setSelectedReport] = useState(null);
    const [successMsg, setSuccessMsg] = useState('');
    const [rejectModalReport, setRejectModalReport] = useState(null);
    const [actionModalReport, setActionModalReport] = useState(null);
    const [actionModalType, setActionModalType] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');
    const [rejectionError, setRejectionError] = useState('');

    useEffect(() => { fetchReports(1); }, [filterStatus, filterSeverity]);

    useEffect(() => {
        const handleResize = () => setViewportWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const fetchReports = async (pageNum) => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (filterStatus) params.append('status', filterStatus);
            if (filterSeverity) params.append('severity', filterSeverity);
            params.append('page', pageNum);
            const response = await api.get(`/admin/reports?${params}`);
            setReports(response.data.data);
            setPage(response.data.current_page);
            setLastPage(response.data.last_page);
        } catch (err) {
            console.error('Failed to fetch reports:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (reportId, newStatus, rejectionReason = '') => {
        try {
            setUpdating(reportId);
            const report = reports.find(r => r.id === reportId);
            await api.put(`/admin/hazards/${reportId}`, {
                status: newStatus,
                severity: report.severity,
                ...(newStatus === 'rejected' ? { rejection_reason: rejectionReason } : {}),
            });
            setReports(prev => prev.map(r => r.id === reportId ? {
                ...r,
                status: newStatus,
                rejection_reason: newStatus === 'rejected' ? rejectionReason : r.rejection_reason,
            } : r));
            if (selectedReport?.id === reportId) {
                setSelectedReport(prev => ({
                    ...prev,
                    status: newStatus,
                    rejection_reason: newStatus === 'rejected' ? rejectionReason : prev.rejection_reason,
                }));
            }
            setSuccessMsg(`Report marked as ${newStatus}!`);
            setTimeout(() => setSuccessMsg(''), 3000);
            return true;
        } catch (err) {
            console.error('Failed to update status:', err);
            return false;
        } finally {
            setUpdating(null);
        }
    };

    const hasCoordinates = (report) => {
        const latitude = Number(report?.latitude);
        const longitude = Number(report?.longitude);
        return Number.isFinite(latitude) && Number.isFinite(longitude);
    };

    const getMapEmbedUrl = (report) => {
        if (!hasCoordinates(report)) return '';
        const latitude = Number(report.latitude);
        const longitude = Number(report.longitude);
        const offset = 0.004;
        const minLon = encodeURIComponent((longitude - offset).toFixed(6));
        const minLat = encodeURIComponent((latitude - offset).toFixed(6));
        const maxLon = encodeURIComponent((longitude + offset).toFixed(6));
        const maxLat = encodeURIComponent((latitude + offset).toFixed(6));
        const markerLat = encodeURIComponent(latitude.toFixed(6));
        const markerLon = encodeURIComponent(longitude.toFixed(6));
        return `https://www.openstreetmap.org/export/embed.html?bbox=${minLon}%2C${minLat}%2C${maxLon}%2C${maxLat}&layer=mapnik&marker=${markerLat}%2C${markerLon}`;
    };

    const openRejectModal = (report) => {
        setRejectModalReport(report);
        setRejectionReason('');
        setRejectionError('');
    };

    const getActionModalMeta = (status) => {
        const metaByStatus = {
            verified: {
                title: 'Verify Report',
                confirmLabel: 'Confirm Verification',
                confirmBg: '#2563EB',
                headingColor: '#1D4ED8',
                helperText: 'Review the details and map before approving this report as verified.',
            },
            in_progress: {
                title: 'Mark Report In Progress',
                confirmLabel: 'Confirm In Progress',
                confirmBg: '#7C3AED',
                headingColor: '#6D28D9',
                helperText: 'Review the details and map before marking this report as in progress.',
            },
            resolved: {
                title: 'Resolve Report',
                confirmLabel: 'Confirm Resolution',
                confirmBg: '#059669',
                headingColor: '#047857',
                helperText: 'Review the details and map before marking this report as resolved.',
            },
        };

        return metaByStatus[status] || {
            title: 'Update Report',
            confirmLabel: 'Confirm Update',
            confirmBg: '#374151',
            headingColor: '#1F2937',
            helperText: 'Review report details before applying this status update.',
        };
    };

    const openActionModal = (report, status) => {
        setActionModalReport(report);
        setActionModalType(status);
    };

    const closeActionModal = () => {
        if (updating === actionModalReport?.id) return;
        setActionModalReport(null);
        setActionModalType('');
    };

    const submitActionModal = async () => {
        if (!actionModalReport || !actionModalType) return;
        const ok = await handleStatusUpdate(actionModalReport.id, actionModalType);
        if (ok) closeActionModal();
    };

    const closeRejectModal = () => {
        if (updating === rejectModalReport?.id) return;
        setRejectModalReport(null);
        setRejectionReason('');
        setRejectionError('');
    };

    const submitRejectModal = async () => {
        const trimmedReason = rejectionReason.trim();
        if (!rejectModalReport) return;
        if (!trimmedReason) {
            setRejectionError('Rejection reason is required.');
            return;
        }
        const ok = await handleStatusUpdate(rejectModalReport.id, 'rejected', trimmedReason);
        if (ok) closeRejectModal();
    };

    const handleSeverityUpdate = async (reportId, newSeverity) => {
        try {
            setUpdating(reportId);
            const report = reports.find(r => r.id === reportId);
            if (report?.status === 'rejected') return;
            await api.put(`/admin/hazards/${reportId}`, { severity: newSeverity, status: report.status });
            setReports(prev => prev.map(r => r.id === reportId ? { ...r, severity: newSeverity } : r));
            if (selectedReport?.id === reportId) setSelectedReport(prev => ({ ...prev, severity: newSeverity }));
        } catch (err) {
            console.error('Failed to update severity:', err);
        } finally {
            setUpdating(null);
        }
    };

    const handlePinToggle = async (reportId, shouldPin) => {
        try {
            setUpdating(reportId);
            await api.put(`/admin/hazards/${reportId}`, { is_pinned: shouldPin });
            setReports(prev => prev.map(r => r.id === reportId ? { ...r, is_pinned: shouldPin } : r));
            if (selectedReport?.id === reportId) {
                setSelectedReport(prev => ({ ...prev, is_pinned: shouldPin }));
            }
            setSuccessMsg(shouldPin ? 'Hazard pinned successfully.' : 'Hazard unpinned successfully.');
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (err) {
            console.error('Failed to toggle pin:', err);
        } finally {
            setUpdating(null);
        }
    };

    const selectStyle = {
        padding: '8px 14px',
        borderRadius: '10px',
        border: '1.5px solid #E5E7EB',
        backgroundColor: 'white',
        fontSize: '13px',
        color: '#374151',
        fontWeight: 600,
        outline: 'none',
        cursor: 'pointer',
    };

    return (
        <AdminLayout>
            <div style={{ padding: isMobile ? '72px 14px 22px' : (isTablet ? '26px 20px' : '36px 40px') }}>

                {/* Header */}
                <div style={{ marginBottom: '24px' }}>
                    <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#F47820', margin: 0 }}>Hazard Reports</h1>
                    <p style={{ color: '#92400E', fontSize: '14px', marginTop: '4px' }}>
                        Review, verify, and resolve hazard reports from the community
                    </p>
                </div>

                {successMsg && (
                    <div style={{ backgroundColor: '#D1FAE5', border: '1px solid #A7F3D0', color: '#065F46', padding: '12px 16px', borderRadius: '10px', marginBottom: '16px', fontSize: '13px', fontWeight: 600 }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <CheckCircle2 size={14} />
                            {successMsg}
                        </span>
                    </div>
                )}

                {/* Filters */}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
                    <select style={{ ...selectStyle, minWidth: isMobile ? '100%' : '170px' }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                        <option value="">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="verified">Verified</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="rejected">Rejected</option>
                    </select>
                    <select style={{ ...selectStyle, minWidth: isMobile ? '100%' : '170px' }} value={filterSeverity} onChange={e => setFilterSeverity(e.target.value)}>
                        <option value="">All Severities</option>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                    </select>
                    {(filterStatus || filterSeverity) && (
                        <button
                            onClick={() => {
                                setFilterStatus('');
                                setFilterSeverity('');
                            }}
                            style={{ ...selectStyle, minWidth: isMobile ? '100%' : 'auto', backgroundColor: '#FEF3C7', color: '#D97706', border: '1.5px solid #FDE68A' }}
                        >
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                <CircleX size={14} />
                                Clear Filters
                            </span>
                        </button>
                    )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: stackDetailBelow ? '1fr' : 'minmax(0, 1fr) 360px', gap: '20px', alignItems: 'flex-start' }}>
                    {/* Reports List */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '60px 0', color: '#92400E' }}>Loading reports...</div>
                        ) : reports.length === 0 ? (
                            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '60px', textAlign: 'center', color: '#9CA3AF' }}>
                                <div style={{ marginBottom: '12px', display: 'inline-flex' }}>
                                    <Inbox size={40} color="#9CA3AF" />
                                </div>
                                <p style={{ fontWeight: 700 }}>No reports found</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {reports.map(report => (
                                    <div
                                        key={report.id}
                                        onClick={() => setSelectedReport(report)}
                                        style={{
                                            backgroundColor: 'white',
                                            borderRadius: '14px',
                                            padding: isMobile ? '14px 16px' : '16px 20px',
                                            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                                            cursor: 'pointer',
                                            border: selectedReport?.id === report.id ? '2px solid #F47820' : '2px solid transparent',
                                            transition: 'border 0.15s ease',
                                        }}
                                    >
                                        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                            <span style={badge(statusColors, report.status)}>
                                                {report.status?.replace('_', ' ').toUpperCase()}
                                            </span>
                                            <span style={badge(severityColors, report.severity)}>
                                                {report.severity?.toUpperCase()} Severity
                                            </span>
                                        </div>
                                        <p style={{ fontSize: '15px', fontWeight: 800, color: '#1C1C1C', margin: '0 0 4px' }}>{report.title}</p>
                                        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px', fontSize: '12px', color: '#6B7280' }}>
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
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {lastPage > 1 && (
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginTop: '20px' }}>
                                <button onClick={() => fetchReports(page - 1)} disabled={page === 1}
                                    style={{ padding: '8px 18px', borderRadius: '10px', border: '1.5px solid #E5E7EB', backgroundColor: 'white', fontWeight: 700, fontSize: '13px', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.4 : 1 }}>
                                    ← Prev
                                </button>
                                <span style={{ fontSize: '13px', fontWeight: 700, color: '#374151' }}>Page {page} of {lastPage}</span>
                                <button onClick={() => fetchReports(page + 1)} disabled={page === lastPage}
                                    style={{ padding: '8px 18px', borderRadius: '10px', border: '1.5px solid #E5E7EB', backgroundColor: 'white', fontWeight: 700, fontSize: '13px', cursor: page === lastPage ? 'not-allowed' : 'pointer', opacity: page === lastPage ? 0.4 : 1 }}>
                                    Next →
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Detail Panel */}
                    {!isMobile && (
                        <div style={{ width: '360px', flexShrink: 0 }}>
                        {selectedReport ? (
                            <div style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 1px 8px rgba(0,0,0,0.08)', position: 'sticky', top: '24px', overflow: 'hidden' }}>
                                {getImageUrl(selectedReport) ? (
                                    <img src={getImageUrl(selectedReport)} alt="Hazard" style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
                                ) : (
                                    <div style={{ width: '100%', height: '180px', backgroundColor: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Camera size={48} color="#9CA3AF" />
                                    </div>
                                )}

                                <div style={{ padding: '20px' }}>
                                    <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                                        <span style={badge(statusColors, selectedReport.status)}>{selectedReport.status?.replace('_', ' ').toUpperCase()}</span>
                                        <span style={badge(severityColors, selectedReport.severity)}>{selectedReport.severity?.toUpperCase()}</span>
                                        {selectedReport.is_pinned && <span style={{ ...badge(statusColors, 'verified'), backgroundColor: '#FEF3C7', color: '#D97706' }}>PINNED</span>}
                                    </div>

                                    {selectedReport.status === 'rejected' && selectedReport.rejection_reason && (
                                        <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px', padding: '10px 12px', marginBottom: '12px' }}>
                                            <p style={{ margin: '0 0 4px', fontSize: '11px', fontWeight: 800, color: '#B91C1C', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                                                Rejection Reason
                                            </p>
                                            <p style={{ margin: 0, fontSize: '12px', color: '#7F1D1D', lineHeight: 1.5 }}>
                                                {selectedReport.rejection_reason}
                                            </p>
                                        </div>
                                    )}

                                    <h3 style={{ fontWeight: 900, fontSize: '16px', color: '#1C1C1C', margin: '0 0 8px' }}>{selectedReport.title}</h3>
                                    <p style={{ fontSize: '13px', color: '#6B7280', lineHeight: 1.6, marginBottom: '16px' }}>{selectedReport.description}</p>

                                    <div style={{ backgroundColor: '#F9FAFB', borderRadius: '10px', padding: '12px', marginBottom: '16px' }}>
                                        {[
                                            { icon: MapPin, label: `${selectedReport.address}, ${selectedReport.barangay}` },
                                            { icon: User, label: `Reported by ${selectedReport.user?.name}` },
                                            { icon: Wrench, label: selectedReport.category },
                                            { icon: CalendarDays, label: new Date(selectedReport.created_at).toLocaleString() },
                                        ].map((row, i) => (
                                            <div key={i} style={{ display: 'flex', gap: '8px', fontSize: '12px', color: '#4B5563', marginBottom: i < 4 ? '8px' : 0 }}>
                                                <span style={{ display: 'inline-flex' }}><row.icon size={14} /></span><span>{row.label}</span>
                                            </div>
                                        ))}
                                        <div style={{ display: 'flex', gap: '8px', fontSize: '12px', color: '#4B5563' }}>
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                                <ThumbsUp size={14} />
                                                {selectedReport.upvotes} upvotes
                                            </span>
                                            <span style={{ color: '#D1D5DB' }}>•</span>
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                                <ThumbsDown size={14} />
                                                {selectedReport.downvotes} downvotes
                                            </span>
                                        </div>
                                    </div>

                                    {/* Update Severity */}
                                    <p style={{ fontSize: '11px', fontWeight: 800, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Update Severity</p>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', marginBottom: '16px' }}>
                                        {['low', 'medium', 'high', 'critical'].map(sev => (
                                            <button key={sev} onClick={() => handleSeverityUpdate(selectedReport.id, sev)} disabled={updating === selectedReport.id || selectedReport.status === 'rejected'}
                                                style={{
                                                    padding: '8px 4px',
                                                    borderRadius: '8px',
                                                    border: selectedReport.severity === sev ? `2px solid ${severityColors[sev].text}` : '2px solid transparent',
                                                    backgroundColor: selectedReport.severity === sev ? severityColors[sev].bg : '#F3F4F6',
                                                    color: selectedReport.severity === sev ? severityColors[sev].text : '#6B7280',
                                                    fontSize: '11px', fontWeight: 700, cursor: selectedReport.status === 'rejected' ? 'not-allowed' : 'pointer',
                                                    opacity: selectedReport.status === 'rejected' ? 0.55 : 1,
                                                }}>
                                                {sev.charAt(0).toUpperCase() + sev.slice(1)}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Pin Hazard */}
                                    <p style={{ fontSize: '11px', fontWeight: 800, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', marginTop: '14px' }}>Pin Hazard</p>
                                    <button
                                        onClick={() => handlePinToggle(selectedReport.id, !selectedReport.is_pinned)}
                                        disabled={updating === selectedReport.id || selectedReport.status === 'rejected'}
                                        style={{
                                            width: '100%',
                                            padding: '10px',
                                            borderRadius: '10px',
                                            border: 'none',
                                            backgroundColor: selectedReport.is_pinned ? '#FEF3C7' : '#1E3A5F',
                                            color: selectedReport.is_pinned ? '#B45309' : 'white',
                                            fontSize: '13px',
                                            fontWeight: 700,
                                            cursor: (updating === selectedReport.id || selectedReport.status === 'rejected') ? 'not-allowed' : 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '6px',
                                            marginBottom: '16px',
                                            opacity: selectedReport.status === 'rejected' ? 0.55 : 1,
                                        }}
                                    >
                                        <Pin size={14} />
                                        {updating === selectedReport.id ? 'Updating...' : (selectedReport.is_pinned ? 'Unpin Hazard' : 'Pin Hazard')}
                                    </button>

                                    {/* Update Status */}
                                    <p style={{ fontSize: '11px', fontWeight: 800, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Update Status</p>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {[
                                            { status: 'verified', label: 'Verify Report', icon: CheckCircle2, bg: '#2563EB' },
                                            { status: 'in_progress', label: 'Mark In Progress', icon: Wrench, bg: '#7C3AED' },
                                            { status: 'resolved', label: 'Mark as Resolved', icon: Check, bg: '#059669' },
                                            { status: 'rejected', label: 'Reject Report', icon: CircleX, bg: '#DC2626' },
                                        ].map(action => (
                                            <button key={action.status}
                                                onClick={() => {
                                                    if (action.status === 'rejected') {
                                                        openRejectModal(selectedReport);
                                                        return;
                                                    }
                                                    openActionModal(selectedReport, action.status);
                                                }}
                                                disabled={updating === selectedReport.id || selectedReport.status === action.status || selectedReport.status === 'rejected'}
                                                style={{
                                                    padding: '10px',
                                                    borderRadius: '10px',
                                                    border: 'none',
                                                    backgroundColor: selectedReport.status === action.status ? '#E5E7EB' : action.bg,
                                                    color: selectedReport.status === action.status ? '#9CA3AF' : 'white',
                                                    fontSize: '13px', fontWeight: 700, cursor: (selectedReport.status === action.status || selectedReport.status === 'rejected') ? 'not-allowed' : 'pointer',
                                                    opacity: selectedReport.status === 'rejected' ? 0.55 : 1,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                                                }}>
                                                <span style={{ display: 'inline-flex' }}><action.icon size={14} /></span>
                                                <span>{updating === selectedReport.id ? 'Updating...' : action.label}</span>
                                            </button>
                                        ))}
                                    </div>

                                    {selectedReport.status === 'rejected' && (
                                        <p style={{ marginTop: '10px', fontSize: '11px', color: '#9CA3AF' }}>
                                            This report is locked after rejection and can no longer be edited.
                                        </p>
                                    )}

                                    <button onClick={() => setSelectedReport(null)}
                                        style={{ width: '100%', marginTop: '12px', padding: '10px', borderRadius: '10px', border: '1.5px solid #E5E7EB', backgroundColor: 'white', color: '#6B7280', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                                        Close Panel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '60px 24px', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', position: 'sticky', top: '24px' }}>
                                <div style={{ marginBottom: '12px', display: 'inline-flex' }}>
                                    <ArrowLeftCircle size={40} color="#9CA3AF" />
                                </div>
                                <p style={{ fontWeight: 700, color: '#374151' }}>Select a Report</p>
                                <p style={{ fontSize: '13px', color: '#9CA3AF', marginTop: '4px' }}>Click any report to view details and manage its status</p>
                            </div>
                        )}
                        </div>
                    )}
                </div>
            </div>

            {isMobile && selectedReport && (
                <div
                    onClick={() => setSelectedReport(null)}
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
                        <div style={{ padding: '14px 16px', borderBottom: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                            <div>
                                <p style={{ margin: 0, fontSize: '12px', fontWeight: 800, color: '#F47820', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Report Details</p>
                                <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#6B7280' }}>Swipe down or tap close to dismiss</p>
                            </div>
                            <button
                                onClick={() => setSelectedReport(null)}
                                style={{ border: 'none', background: '#F3F4F6', color: '#374151', width: '34px', height: '34px', borderRadius: '10px', fontWeight: 800, cursor: 'pointer' }}
                            >
                                ×
                            </button>
                        </div>

                        <div style={{ maxHeight: 'calc(90vh - 64px)', overflowY: 'auto' }}>
                            {getImageUrl(selectedReport) ? (
                                <img src={getImageUrl(selectedReport)} alt="Hazard" style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
                            ) : (
                                <div style={{ width: '100%', height: '180px', backgroundColor: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Camera size={48} color="#9CA3AF" />
                                </div>
                            )}

                            <div style={{ padding: '16px' }}>
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                                    <span style={badge(statusColors, selectedReport.status)}>{selectedReport.status?.replace('_', ' ').toUpperCase()}</span>
                                    <span style={badge(severityColors, selectedReport.severity)}>{selectedReport.severity?.toUpperCase()}</span>
                                    {selectedReport.is_pinned && <span style={{ ...badge(statusColors, 'verified'), backgroundColor: '#FEF3C7', color: '#D97706' }}>PINNED</span>}
                                </div>

                                {selectedReport.status === 'rejected' && selectedReport.rejection_reason && (
                                    <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px', padding: '10px 12px', marginBottom: '12px' }}>
                                        <p style={{ margin: '0 0 4px', fontSize: '11px', fontWeight: 800, color: '#B91C1C', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Rejection Reason</p>
                                        <p style={{ margin: 0, fontSize: '12px', color: '#7F1D1D', lineHeight: 1.5 }}>{selectedReport.rejection_reason}</p>
                                    </div>
                                )}

                                <h3 style={{ fontWeight: 900, fontSize: '16px', color: '#1C1C1C', margin: '0 0 8px' }}>{selectedReport.title}</h3>
                                <p style={{ fontSize: '13px', color: '#6B7280', lineHeight: 1.6, marginBottom: '16px' }}>{selectedReport.description}</p>

                                <div style={{ backgroundColor: '#F9FAFB', borderRadius: '10px', padding: '12px', marginBottom: '16px' }}>
                                    {[
                                        { icon: MapPin, label: `${selectedReport.address}, ${selectedReport.barangay}` },
                                        { icon: User, label: `Reported by ${selectedReport.user?.name || 'Unknown'}` },
                                        { icon: Wrench, label: selectedReport.category || 'N/A' },
                                        { icon: CalendarDays, label: new Date(selectedReport.created_at).toLocaleString() },
                                    ].map((row, i) => (
                                        <div key={i} style={{ display: 'flex', gap: '8px', fontSize: '12px', color: '#4B5563', marginBottom: i < 3 ? '8px' : 0 }}>
                                            <span style={{ display: 'inline-flex' }}><row.icon size={14} /></span><span>{row.label}</span>
                                        </div>
                                    ))}
                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', fontSize: '12px', color: '#4B5563', marginTop: '8px' }}>
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                            <ThumbsUp size={14} />
                                            {selectedReport.upvotes} upvotes
                                        </span>
                                        <span style={{ color: '#D1D5DB' }}>•</span>
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                            <ThumbsDown size={14} />
                                            {selectedReport.downvotes} downvotes
                                        </span>
                                    </div>
                                </div>

                                <p style={{ fontSize: '11px', fontWeight: 800, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Update Severity</p>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '6px', marginBottom: '16px' }}>
                                    {['low', 'medium', 'high', 'critical'].map(sev => (
                                        <button key={sev} onClick={() => handleSeverityUpdate(selectedReport.id, sev)} disabled={updating === selectedReport.id || selectedReport.status === 'rejected'}
                                            style={{
                                                padding: '8px 4px',
                                                borderRadius: '8px',
                                                border: selectedReport.severity === sev ? `2px solid ${severityColors[sev].text}` : '2px solid transparent',
                                                backgroundColor: selectedReport.severity === sev ? severityColors[sev].bg : '#F3F4F6',
                                                color: selectedReport.severity === sev ? severityColors[sev].text : '#6B7280',
                                                fontSize: '11px', fontWeight: 700, cursor: selectedReport.status === 'rejected' ? 'not-allowed' : 'pointer',
                                                opacity: selectedReport.status === 'rejected' ? 0.55 : 1,
                                            }}>
                                            {sev.charAt(0).toUpperCase() + sev.slice(1)}
                                        </button>
                                    ))}
                                </div>

                                <p style={{ fontSize: '11px', fontWeight: 800, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', marginTop: '14px' }}>Pin Hazard</p>
                                <button
                                    onClick={() => handlePinToggle(selectedReport.id, !selectedReport.is_pinned)}
                                    disabled={updating === selectedReport.id || selectedReport.status === 'rejected'}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        borderRadius: '10px',
                                        border: 'none',
                                        backgroundColor: selectedReport.is_pinned ? '#FEF3C7' : '#1E3A5F',
                                        color: selectedReport.is_pinned ? '#B45309' : 'white',
                                        fontSize: '13px',
                                        fontWeight: 700,
                                        cursor: (updating === selectedReport.id || selectedReport.status === 'rejected') ? 'not-allowed' : 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '6px',
                                        marginBottom: '16px',
                                        opacity: selectedReport.status === 'rejected' ? 0.55 : 1,
                                    }}
                                >
                                    <Pin size={14} />
                                    {updating === selectedReport.id ? 'Updating...' : (selectedReport.is_pinned ? 'Unpin Hazard' : 'Pin Hazard')}
                                </button>

                                <p style={{ fontSize: '11px', fontWeight: 800, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Update Status</p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {[
                                        { status: 'verified', label: 'Verify Report', icon: CheckCircle2, bg: '#2563EB' },
                                        { status: 'in_progress', label: 'Mark In Progress', icon: Wrench, bg: '#7C3AED' },
                                        { status: 'resolved', label: 'Mark as Resolved', icon: Check, bg: '#059669' },
                                        { status: 'rejected', label: 'Reject Report', icon: CircleX, bg: '#DC2626' },
                                    ].map(action => (
                                        <button key={action.status}
                                            onClick={() => {
                                                if (action.status === 'rejected') {
                                                    openRejectModal(selectedReport);
                                                    return;
                                                }
                                                openActionModal(selectedReport, action.status);
                                            }}
                                            disabled={updating === selectedReport.id || selectedReport.status === action.status || selectedReport.status === 'rejected'}
                                            style={{
                                                padding: '10px',
                                                borderRadius: '10px',
                                                border: 'none',
                                                backgroundColor: selectedReport.status === action.status ? '#E5E7EB' : action.bg,
                                                color: selectedReport.status === action.status ? '#9CA3AF' : 'white',
                                                fontSize: '13px', fontWeight: 700, cursor: (selectedReport.status === action.status || selectedReport.status === 'rejected') ? 'not-allowed' : 'pointer',
                                                opacity: selectedReport.status === 'rejected' ? 0.55 : 1,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                                            }}>
                                            <span style={{ display: 'inline-flex' }}><action.icon size={14} /></span>
                                            <span>{updating === selectedReport.id ? 'Updating...' : action.label}</span>
                                        </button>
                                    ))}
                                </div>

                                {selectedReport.status === 'rejected' && (
                                    <p style={{ marginTop: '10px', fontSize: '11px', color: '#9CA3AF' }}>
                                        This report is locked after rejection and can no longer be edited.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {actionModalReport && actionModalType && (
                <div
                    onClick={closeActionModal}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: 'rgba(17, 24, 39, 0.62)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '20px',
                        zIndex: 1000,
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            width: 'min(860px, 100%)',
                            maxHeight: '90vh',
                            overflowY: 'auto',
                            borderRadius: '16px',
                            backgroundColor: '#FFFFFF',
                            boxShadow: '0 20px 48px rgba(0, 0, 0, 0.25)',
                            padding: '20px',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                            <div>
                                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 900, color: getActionModalMeta(actionModalType).headingColor }}>
                                    {getActionModalMeta(actionModalType).title}
                                </h2>
                                <p style={{ margin: '5px 0 0', fontSize: '12px', color: '#6B7280' }}>
                                    {getActionModalMeta(actionModalType).helperText}
                                </p>
                            </div>
                            <button
                                onClick={closeActionModal}
                                disabled={updating === actionModalReport.id}
                                style={{ border: 'none', background: 'transparent', color: '#6B7280', fontWeight: 700, cursor: 'pointer' }}
                            >
                                Close
                            </button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
                            <div style={{ backgroundColor: '#F9FAFB', borderRadius: '12px', padding: '14px' }}>
                                <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                                    <span style={badge(statusColors, actionModalReport.status)}>{actionModalReport.status?.replace('_', ' ').toUpperCase()}</span>
                                    <span style={badge(severityColors, actionModalReport.severity)}>{actionModalReport.severity?.toUpperCase()}</span>
                                </div>
                                <h3 style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: 900, color: '#1F2937' }}>{actionModalReport.title}</h3>
                                <p style={{ margin: '0 0 10px', color: '#4B5563', fontSize: '13px', lineHeight: 1.6 }}>{actionModalReport.description}</p>
                                <div style={{ fontSize: '12px', color: '#374151', display: 'grid', gap: '6px' }}>
                                    <p style={{ margin: 0 }}><strong>Category:</strong> {actionModalReport.category || 'N/A'}</p>
                                    <p style={{ margin: 0 }}><strong>Reporter:</strong> {actionModalReport.user?.name || 'Unknown'}</p>
                                    <p style={{ margin: 0 }}><strong>Address:</strong> {actionModalReport.address}, {actionModalReport.barangay}</p>
                                    <p style={{ margin: 0 }}><strong>Submitted:</strong> {new Date(actionModalReport.created_at).toLocaleString()}</p>
                                    {hasCoordinates(actionModalReport) && (
                                        <p style={{ margin: 0 }}>
                                            <strong>Coordinates:</strong> {Number(actionModalReport.latitude).toFixed(6)}, {Number(actionModalReport.longitude).toFixed(6)}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #E5E7EB', height: '220px', marginBottom: '12px' }}>
                                    {hasCoordinates(actionModalReport) ? (
                                        <iframe
                                            title="Report location map"
                                            src={getMapEmbedUrl(actionModalReport)}
                                            width="100%"
                                            height="220"
                                            style={{ border: 0 }}
                                            loading="lazy"
                                            referrerPolicy="no-referrer-when-downgrade"
                                        />
                                    ) : (
                                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', fontSize: '13px' }}>
                                            No coordinates available for map preview.
                                        </div>
                                    )}
                                </div>

                                <div style={{ borderRadius: '10px', backgroundColor: '#FFFBEB', border: '1px solid #FDE68A', padding: '10px 12px', fontSize: '12px', color: '#92400E', lineHeight: 1.5 }}>
                                    Confirming this action will update the report status to <strong>{actionModalType.replace('_', ' ').toUpperCase()}</strong>.
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                            <button
                                onClick={closeActionModal}
                                disabled={updating === actionModalReport.id}
                                style={{ padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #E5E7EB', backgroundColor: '#FFFFFF', color: '#4B5563', fontWeight: 700, cursor: updating === actionModalReport.id ? 'not-allowed' : 'pointer' }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={submitActionModal}
                                disabled={updating === actionModalReport.id}
                                style={{
                                    padding: '10px 14px',
                                    borderRadius: '10px',
                                    border: 'none',
                                    backgroundColor: getActionModalMeta(actionModalType).confirmBg,
                                    color: '#FFFFFF',
                                    fontWeight: 800,
                                    cursor: updating === actionModalReport.id ? 'not-allowed' : 'pointer',
                                    opacity: updating === actionModalReport.id ? 0.7 : 1,
                                }}
                            >
                                {updating === actionModalReport.id ? 'Updating...' : getActionModalMeta(actionModalType).confirmLabel}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {rejectModalReport && (
                <div
                    onClick={closeRejectModal}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: 'rgba(17, 24, 39, 0.62)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '20px',
                        zIndex: 1000,
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            width: 'min(860px, 100%)',
                            maxHeight: '90vh',
                            overflowY: 'auto',
                            borderRadius: '16px',
                            backgroundColor: '#FFFFFF',
                            boxShadow: '0 20px 48px rgba(0, 0, 0, 0.25)',
                            padding: '20px',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 900, color: '#B91C1C' }}>Reject Report</h2>
                            <button
                                onClick={closeRejectModal}
                                disabled={updating === rejectModalReport.id}
                                style={{ border: 'none', background: 'transparent', color: '#6B7280', fontWeight: 700, cursor: 'pointer' }}
                            >
                                Close
                            </button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
                            <div style={{ backgroundColor: '#F9FAFB', borderRadius: '12px', padding: '14px' }}>
                                <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                                    <span style={badge(statusColors, rejectModalReport.status)}>{rejectModalReport.status?.replace('_', ' ').toUpperCase()}</span>
                                    <span style={badge(severityColors, rejectModalReport.severity)}>{rejectModalReport.severity?.toUpperCase()}</span>
                                </div>
                                <h3 style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: 900, color: '#1F2937' }}>{rejectModalReport.title}</h3>
                                <p style={{ margin: '0 0 10px', color: '#4B5563', fontSize: '13px', lineHeight: 1.6 }}>{rejectModalReport.description}</p>
                                <div style={{ fontSize: '12px', color: '#374151', display: 'grid', gap: '6px' }}>
                                    <p style={{ margin: 0 }}><strong>Category:</strong> {rejectModalReport.category || 'N/A'}</p>
                                    <p style={{ margin: 0 }}><strong>Reporter:</strong> {rejectModalReport.user?.name || 'Unknown'}</p>
                                    <p style={{ margin: 0 }}><strong>Address:</strong> {rejectModalReport.address}, {rejectModalReport.barangay}</p>
                                    <p style={{ margin: 0 }}><strong>Submitted:</strong> {new Date(rejectModalReport.created_at).toLocaleString()}</p>
                                    {hasCoordinates(rejectModalReport) && (
                                        <p style={{ margin: 0 }}>
                                            <strong>Coordinates:</strong> {Number(rejectModalReport.latitude).toFixed(6)}, {Number(rejectModalReport.longitude).toFixed(6)}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #E5E7EB', height: '220px', marginBottom: '12px' }}>
                                    {hasCoordinates(rejectModalReport) ? (
                                        <iframe
                                            title="Report location map"
                                            src={getMapEmbedUrl(rejectModalReport)}
                                            width="100%"
                                            height="220"
                                            style={{ border: 0 }}
                                            loading="lazy"
                                            referrerPolicy="no-referrer-when-downgrade"
                                        />
                                    ) : (
                                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', fontSize: '13px' }}>
                                            No coordinates available for map preview.
                                        </div>
                                    )}
                                </div>

                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#6B7280', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    Rejection Reason
                                </label>
                                <textarea
                                    value={rejectionReason}
                                    onChange={(e) => {
                                        setRejectionReason(e.target.value);
                                        if (rejectionError) setRejectionError('');
                                    }}
                                    placeholder="Explain clearly why this report is being rejected..."
                                    rows={4}
                                    style={{ width: '100%', resize: 'vertical', borderRadius: '10px', border: rejectionError ? '1.5px solid #DC2626' : '1.5px solid #E5E7EB', padding: '10px 12px', fontSize: '13px', color: '#374151', outline: 'none' }}
                                />
                                {rejectionError && (
                                    <p style={{ margin: '6px 0 0', color: '#DC2626', fontSize: '12px', fontWeight: 600 }}>{rejectionError}</p>
                                )}
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                            <button
                                onClick={closeRejectModal}
                                disabled={updating === rejectModalReport.id}
                                style={{ padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #E5E7EB', backgroundColor: '#FFFFFF', color: '#4B5563', fontWeight: 700, cursor: updating === rejectModalReport.id ? 'not-allowed' : 'pointer' }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={submitRejectModal}
                                disabled={updating === rejectModalReport.id}
                                style={{ padding: '10px 14px', borderRadius: '10px', border: 'none', backgroundColor: '#DC2626', color: '#FFFFFF', fontWeight: 800, cursor: updating === rejectModalReport.id ? 'not-allowed' : 'pointer', opacity: updating === rejectModalReport.id ? 0.7 : 1 }}
                            >
                                {updating === rejectModalReport.id ? 'Rejecting...' : 'Confirm Rejection'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminReports;