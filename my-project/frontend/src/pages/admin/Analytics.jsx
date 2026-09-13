import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { AlertTriangle, ChartColumn, CheckCircle2, Clock3, FileText, Sparkles, Users } from 'lucide-react';
import api from '../../services/api';
import AdminLayout from '../../components/admin/AdminLayout';

const CATEGORY_COLORS = ['#F47820', '#17ACDE', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#3B82F6', '#EC4899'];
const SEVERITY_COLORS = { low: '#10B981', medium: '#F59E0B', high: '#F97316', critical: '#EF4444' };

const EXTERNAL_API_BASE_URL = import.meta.env.VITE_EXTERNAL_API_BASE_URL || 'https://northsafe-api.ganbaruby23.xyz';
const AI_ANALYTICS_URL = `${EXTERNAL_API_BASE_URL.replace(/\/+$/, '')}${EXTERNAL_API_BASE_URL.includes('/api') ? '' : '/api'}/ai-analytics`;

const pickNumber = (source, keys) => {
    if (!source || typeof source !== 'object') return null;
    for (const key of keys) {
        const value = source[key];
        if (typeof value === 'number' && Number.isFinite(value)) return value;
        if (typeof value === 'string' && value.trim() !== '' && Number.isFinite(Number(value))) return Number(value);
    }
    return null;
};

const pickText = (source, keys) => {
    if (!source || typeof source !== 'object') return '';
    for (const key of keys) {
        const value = source[key];
        if (typeof value === 'string' && value.trim() !== '') return value.trim();
    }
    return '';
};

const pickArray = (source, keys) => {
    if (!source || typeof source !== 'object') return [];
    for (const key of keys) {
        const value = source[key];
        if (Array.isArray(value)) return value;
    }
    return [];
};

const Analytics = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [aiData, setAiData] = useState(null);
    const [aiLoading, setAiLoading] = useState(true);
    const [aiError, setAiError] = useState('');
    const [viewportWidth, setViewportWidth] = useState(() => window.innerWidth);
    const isMobile = viewportWidth < 768;
    const isTablet = viewportWidth >= 768 && viewportWidth < 1100;

    useEffect(() => {
        fetchAnalytics();
    }, []);

    useEffect(() => {
        const handleResize = () => setViewportWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const fetchAnalytics = async () => {
        try {
            const res = await api.get('/admin/analytics');
            setData(res.data);
            await fetchAiAnalytics(res.data);
        } catch (err) {
            console.error('Failed to fetch analytics:', err);
            setAiLoading(false);
        } finally {
            setLoading(false);
        }
    };

    const fetchAiAnalytics = async (analyticsPayload) => {
        try {
            setAiLoading(true);
            setAiError('');
            const token = localStorage.getItem('token');

            const res = await fetch(AI_ANALYTICS_URL, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({ analytics: analyticsPayload || {} }),
            });

            if (!res.ok) {
                throw new Error(`AI analytics request failed with status ${res.status}`);
            }

            const payload = await res.json();
            setAiData(payload?.data ?? payload ?? null);
            if (payload?.warning) {
                setAiError(payload.warning);
            }
        } catch (err) {
            console.error('Failed to fetch AI analytics:', err);
            setAiError('AI analytics is currently unavailable.');
            setAiData(null);
        } finally {
            setAiLoading(false);
        }
    };

    const severityData = data?.reports_by_severity?.map(s => ({
        name: s.severity?.charAt(0).toUpperCase() + s.severity?.slice(1),
        value: s.count,
        color: SEVERITY_COLORS[s.severity] || '#6B7280',
    })) || [];

    const categoryData = data?.reports_by_category?.map((c, i) => ({
        name: c.category,
        count: c.count,
        fill: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
    })) || [];

    const barangayData = data?.reports_by_barangay?.map(b => ({
        name: b.barangay?.length > 14 ? b.barangay.slice(0, 14) + '…' : b.barangay,
        fullName: b.barangay,
        count: b.count,
    })) || [];

    const aiSummary = pickText(aiData, ['summary', 'overview', 'narrative', 'insight_summary']);
    const aiConfidence = pickNumber(aiData, ['average_confidence', 'avg_confidence', 'confidence_score', 'mean_confidence']);
    const aiMetrics = [
        { label: 'Predicted High Risk', value: pickNumber(aiData, ['predicted_high_risk', 'high_risk_count', 'critical_risk_predictions']) },
        { label: 'Predicted Medium Risk', value: pickNumber(aiData, ['predicted_medium_risk', 'medium_risk_count']) },
        { label: 'Escalation Recommendations', value: pickNumber(aiData, ['escalation_recommendations', 'recommended_escalations']) },
        { label: 'Monitoring Alerts', value: pickNumber(aiData, ['monitoring_alerts', 'active_ai_alerts']) },
    ].filter((item) => item.value !== null);

    const aiInsights = pickArray(aiData, ['insights', 'recommendations', 'alerts', 'signals'])
        .map((item) => {
            if (typeof item === 'string') {
                return item;
            }
            if (item && typeof item === 'object') {
                return item.title || item.message || item.text || item.label || '';
            }
            return '';
        })
        .filter(Boolean)
        .slice(0, 5);

    const aiTopKeys = aiData && typeof aiData === 'object' && !Array.isArray(aiData)
        ? Object.keys(aiData).slice(0, 8)
        : [];

    return (
        <AdminLayout>
            <div style={{ padding: isMobile ? '72px 14px 22px' : (isTablet ? '26px 20px' : '36px 40px'), maxWidth: '100%' }}>

                {/* Header */}
                <div style={{ marginBottom: '28px' }}>
                    <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#F47820', margin: 0 }}>Analytics</h1>
                    <p style={{ color: '#92400E', fontSize: '14px', marginTop: '4px' }}>
                        Overview of hazard reports across North Caloocan City
                    </p>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '80px 0', color: '#92400E' }}>
                        <div style={{ marginBottom: '12px', display: 'inline-flex' }}>
                            <ChartColumn size={40} color="#C2410C" />
                        </div>
                        <p style={{ fontWeight: 700 }}>Loading analytics...</p>
                    </div>
                ) : (
                    <>
                        {/* Stats Cards */}
                        <div style={{ display: 'grid', gridTemplateColumns: isMobile || isTablet ? 'repeat(2, minmax(0, 1fr))' : 'repeat(4, minmax(0, 1fr))', gap: '16px', marginBottom: '28px' }}>
                            {[
                                { label: 'Total Reports', value: data?.total_reports, icon: FileText, bg: '#DBEAFE', color: '#2563EB' },
                                { label: 'Pending', value: data?.pending_reports, icon: Clock3, bg: '#FEF3C7', color: '#D97706' },
                                { label: 'Resolved', value: data?.resolved_reports, icon: CheckCircle2, bg: '#D1FAE5', color: '#059669' },
                                { label: 'Total Residents', value: data?.total_users, icon: Users, bg: '#EDE9FE', color: '#7C3AED' },
                            ].map((s, i) => (
                                <div key={i} style={{ backgroundColor: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                                        <s.icon size={20} color={s.color} />
                                    </div>
                                    <p style={{ fontSize: '28px', fontWeight: 900, color: s.color, margin: 0 }}>{s.value ?? 0}</p>
                                    <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>{s.label}</p>
                                </div>
                            ))}
                        </div>

                        {/* AI Analytics */}
                        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: isMobile ? '16px' : '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: '24px' }}>
                            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '10px' }}>
                                <div>
                                    <h2 style={{ fontWeight: 900, color: '#1C1C1C', fontSize: '15px', margin: '0 0 4px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                                        <Sparkles size={16} color="#F47820" />
                                        AI Analytics
                                    </h2>
                                    <p style={{ fontSize: '12px', color: '#9CA3AF', margin: 0 }}>
                                        Quick glance at AI-generated insights and predictions based on report data
                                    </p>
                                </div>
                                {aiConfidence !== null && (
                                    <span style={{ backgroundColor: '#FEF3C7', color: '#B45309', fontSize: '11px', fontWeight: 800, padding: '6px 10px', borderRadius: '999px', alignSelf: isMobile ? 'flex-start' : 'auto' }}>
                                        Avg confidence: {Math.round(aiConfidence)}%
                                    </span>
                                )}
                            </div>

                            {aiLoading ? (
                                <div style={{ textAlign: 'center', padding: '24px 0', color: '#9CA3AF', fontSize: '13px' }}>
                                    Loading AI analytics...
                                </div>
                            ) : aiError ? (
                                <div style={{ backgroundColor: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '10px', padding: '10px 12px', color: '#92400E', fontSize: '12px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                                    <AlertTriangle size={14} />
                                    {aiError}
                                </div>
                            ) : !aiData ? (
                                <div style={{ textAlign: 'center', padding: '24px 0', color: '#9CA3AF', fontSize: '13px' }}>
                                    No AI analytics data yet.
                                </div>
                            ) : (
                                <div>
                                    {aiSummary && (
                                        <div style={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '12px', marginBottom: '12px' }}>
                                            <p style={{ margin: 0, fontSize: '13px', color: '#374151', lineHeight: 1.6 }}>{aiSummary}</p>
                                        </div>
                                    )}

                                    {aiMetrics.length > 0 && (
                                        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : (isTablet ? 'repeat(2, minmax(0, 1fr))' : 'repeat(4, minmax(0, 1fr))'), gap: '10px', marginBottom: aiInsights.length > 0 ? '12px' : '0' }}>
                                            {aiMetrics.map((metric) => (
                                                <div key={metric.label} style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '12px' }}>
                                                    <p style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: 900, color: '#1E3A5F' }}>{metric.value}</p>
                                                    <p style={{ margin: 0, fontSize: '11px', color: '#64748B', fontWeight: 700 }}>{metric.label}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {aiInsights.length > 0 ? (
                                        <div>
                                            <p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: 800, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Top AI Insights</p>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                {aiInsights.map((insight, index) => (
                                                    <div key={`${insight}-${index}`} style={{ backgroundColor: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: '10px', padding: '10px 12px', color: '#9A3412', fontSize: '12px', fontWeight: 600 }}>
                                                        {insight}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div style={{ fontSize: '12px', color: '#6B7280' }}>
                                            AI payload received. Add endpoint-specific fields to show richer insights.
                                            {aiTopKeys.length > 0 && (
                                                <span style={{ display: 'block', marginTop: '6px' }}>
                                                    Available keys: {aiTopKeys.join(', ')}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Charts Row */}
                        <div style={{ display: 'grid', gridTemplateColumns: isMobile || isTablet ? '1fr' : '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                            {/* Bar Chart - Category */}
                            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: isMobile ? '16px' : '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                                <h2 style={{ fontWeight: 900, color: '#1C1C1C', fontSize: '15px', margin: '0 0 4px' }}>Reports by Category</h2>
                                <p style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '16px' }}>Number of reports per hazard type</p>
                                {categoryData.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '40px 0', color: '#9CA3AF' }}>No data yet</div>
                                ) : (
                                    <ResponsiveContainer width="100%" height={220}>
                                        <BarChart data={categoryData} margin={{ top: 5, right: 10, left: -20, bottom: 60 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                                            <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#6B7280' }} angle={-35} textAnchor="end" interval={0} />
                                            <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} allowDecimals={false} />
                                            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: '12px' }} />
                                            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                                                {categoryData.map((entry, index) => (
                                                    <Cell key={index} fill={entry.fill} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </div>

                            {/* Pie Chart - Severity */}
                                <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: isMobile ? '16px' : '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                                <h2 style={{ fontWeight: 900, color: '#1C1C1C', fontSize: '15px', margin: '0 0 4px' }}>Reports by Severity</h2>
                                <p style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '16px' }}>Distribution of hazard severity levels</p>
                                {severityData.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '40px 0', color: '#9CA3AF' }}>No data yet</div>
                                ) : (
                                    <ResponsiveContainer width="100%" height={220}>
                                        <PieChart>
                                            <Pie data={severityData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value"
                                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                                                {severityData.map((entry, index) => (
                                                    <Cell key={index} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: '12px' }} />
                                            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>

                        {/* Barangay Rankings */}
                        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: isMobile ? '16px' : '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                            <h2 style={{ fontWeight: 900, color: '#1C1C1C', fontSize: '15px', margin: '0 0 4px' }}>Top Barangays by Reports</h2>
                            <p style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '16px' }}>Which barangays have the most hazard reports</p>
                            {barangayData.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '40px 0', color: '#9CA3AF' }}>No data yet</div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {barangayData.map((b, i) => {
                                        const max = barangayData[0]?.count || 1;
                                        const pct = Math.round((b.count / max) * 100);
                                        const barColor = i === 0 ? '#EF4444' : i === 1 ? '#F97316' : '#F47820';
                                        return (
                                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#F47820', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: '10px', flexShrink: 0 }}>
                                                    {i + 1}
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#374151' }}>{b.fullName}</span>
                                                        <span style={{ fontSize: '13px', fontWeight: 900, color: '#374151' }}>{b.count}</span>
                                                    </div>
                                                    <div style={{ width: '100%', height: '8px', backgroundColor: '#F3F4F6', borderRadius: '999px', overflow: 'hidden' }}>
                                                        <div style={{ width: `${pct}%`, height: '100%', backgroundColor: barColor, borderRadius: '999px' }} />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </AdminLayout>
    );
};

export default Analytics;