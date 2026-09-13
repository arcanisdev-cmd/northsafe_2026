import React, { useEffect, useState } from 'react';
import { FolderSearch, Info, ScrollText, ShieldCheck, X } from 'lucide-react';
import api from '../../services/api';
import AdminLayout from '../../components/admin/AdminLayout';

const statusColors = {
	success: { bg: '#D1FAE5', text: '#059669' },
	failed: { bg: '#FEE2E2', text: '#DC2626' },
	warning: { bg: '#FEF3C7', text: '#D97706' },
	info: { bg: '#DBEAFE', text: '#2563EB' },
};

const badge = (map, key) => ({
	backgroundColor: map[key]?.bg || '#F3F4F6',
	color: map[key]?.text || '#6B7280',
	padding: '3px 10px',
	borderRadius: '999px',
	fontSize: '11px',
	fontWeight: 700,
	display: 'inline-block',
});

const normalizeStatus = (status) => {
	const value = (status || '').toString().toLowerCase();
	if (['ok', 'success', 'succeeded', 'completed'].includes(value)) return 'success';
	if (['error', 'failed', 'failure', 'denied'].includes(value)) return 'failed';
	if (['warn', 'warning'].includes(value)) return 'warning';
	if (['info', 'notice'].includes(value)) return 'info';
	return value || 'info';
};

const formatDate = (value) => {
	if (!value) return 'N/A';
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return 'N/A';
	return date.toLocaleString('en-PH', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	});
};

const safeText = (value, fallback = 'N/A') => (value ?? fallback);
const resolveUserName = (log) => log.user?.name || log.actor?.name || log.user_name || 'System';
const resolveAction = (log) => log.action || log.event || log.activity || 'N/A';
const resolveModelType = (log) => log.model_type || log.module || log.resource || log.entity_type || 'N/A';
const resolveModelId = (log) => log.model_id || log.entity_id || log.target_id || 'N/A';
const resolveDetails = (log) => log.details || log.description || log.target || log.entity || log.entity_name || 'N/A';
const resolveIpAddress = (log) => log.ip_address || log.ip || 'N/A';

const AuditLogs = () => {
	const [viewportWidth, setViewportWidth] = useState(() => window.innerWidth);
	const [logs, setLogs] = useState([]);
	const [loading, setLoading] = useState(true);
	const [page, setPage] = useState(1);
	const [lastPage, setLastPage] = useState(1);
	const [search, setSearch] = useState('');
	const [selectedLog, setSelectedLog] = useState(null);

	const isMobile = viewportWidth < 768;
	const isTablet = viewportWidth >= 768 && viewportWidth < 1100;

	useEffect(() => {
		fetchLogs(1);
	}, []);

	useEffect(() => {
		const handleResize = () => setViewportWidth(window.innerWidth);
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	useEffect(() => {
		if (!selectedLog) return undefined;
		const handleKeyDown = (event) => {
			if (event.key === 'Escape') setSelectedLog(null);
		};
		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [selectedLog]);

	const fetchLogs = async (pageNum) => {
		try {
			setLoading(true);
			const res = await api.get(`/admin/audit-logs?page=${pageNum}&per_page=15`);
			const payload = res.data || {};
			setLogs(payload.data || payload.logs || []);
			setPage(payload.current_page || payload.page || pageNum);
			setLastPage(payload.last_page || payload.total_pages || 1);
		} catch (err) {
			console.error('Failed to fetch audit logs:', err);
			setLogs([]);
			setPage(1);
			setLastPage(1);
		} finally {
			setLoading(false);
		}
	};

	const searchLower = search.toLowerCase();
	const filtered = search
		? logs.filter((log) => {
			const userName = resolveUserName(log);
			const action = resolveAction(log);
			const modelType = resolveModelType(log);
			const details = resolveDetails(log);
			return (
				userName.toLowerCase().includes(searchLower) ||
				action.toLowerCase().includes(searchLower) ||
				modelType.toLowerCase().includes(searchLower) ||
				details.toLowerCase().includes(searchLower)
			);
		})
		: logs;

	return (
		<AdminLayout>
			<div style={{ padding: isMobile ? '72px 14px 22px' : (isTablet ? '26px 20px' : '36px 40px'), maxWidth: '100%' }}>
				<div style={{ marginBottom: '28px' }}>
					<h1 style={{ fontSize: '28px', fontWeight: 900, color: '#F47820', margin: 0 }}>Audit Logs</h1>
					<p style={{ color: '#92400E', fontSize: '14px', marginTop: '4px' }}>Track admin and staff system activities for accountability and security</p>
				</div>

				<div style={{ backgroundColor: '#FFF7ED', border: '1.5px solid #FED7AA', borderRadius: '12px', padding: '14px 18px', marginBottom: '24px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
					<span style={{ flexShrink: 0, display: 'inline-flex' }}><ShieldCheck size={18} color="#9A3412" /></span>
					<div>
						<p style={{ fontWeight: 700, fontSize: '13px', color: '#9A3412', margin: '0 0 2px' }}>About Audit Logs</p>
						<p style={{ fontSize: '13px', color: '#C2410C', margin: 0, lineHeight: 1.5 }}>This page records important user activities such as report updates, account changes, and moderation actions to help maintain system transparency.</p>
					</div>
				</div>

				<div style={{ marginBottom: '16px' }}>
					<input type="text" placeholder="Search by user, action, model type, or details..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: '100%', maxWidth: isMobile ? '100%' : '420px', padding: '9px 14px', borderRadius: '10px', border: '1.5px solid #E5E7EB', fontSize: '13px', outline: 'none', backgroundColor: 'white' }} />
				</div>

				{loading ? (
					<div style={{ textAlign: 'center', padding: '60px 0', color: '#92400E' }}>
						<div style={{ marginBottom: '12px', display: 'inline-flex' }}><ScrollText size={36} color="#C2410C" /></div>
						<p style={{ fontWeight: 700 }}>Loading audit logs...</p>
					</div>
				) : filtered.length === 0 ? (
					<div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '60px', textAlign: 'center', color: '#9CA3AF', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
						<div style={{ marginBottom: '12px', display: 'inline-flex' }}><FolderSearch size={40} color="#9CA3AF" /></div>
						<p style={{ fontWeight: 700 }}>No audit logs found</p>
					</div>
				) : isMobile ? (
					<div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
						{filtered.map((log, index) => {
							const userName = resolveUserName(log);
							const action = resolveAction(log);
							const details = resolveDetails(log);
							const status = normalizeStatus(log.status || log.result || log.level);
							return (
								<button key={log.id || `${action || 'log'}-${index}`} type="button" onClick={() => setSelectedLog(log)} style={{ width: '100%', textAlign: 'left', backgroundColor: 'white', borderRadius: '14px', border: '1.5px solid #F0EAE0', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', padding: '12px', cursor: 'pointer' }}>
									<div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', alignItems: 'flex-start', marginBottom: '10px' }}>
										<div style={{ minWidth: 0, flex: 1 }}>
											<p style={{ margin: '0 0 3px', fontSize: '14px', fontWeight: 800, color: '#1C1C1C', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{safeText(userName, 'System')}</p>
											<p style={{ margin: 0, fontSize: '11px', color: '#9CA3AF' }}>{formatDate(log.created_at || log.timestamp || log.date)}</p>
										</div>
										<button type="button" onClick={(event) => { event.stopPropagation(); setSelectedLog(log); }} aria-label="View log details" style={{ width: '34px', height: '34px', borderRadius: '999px', border: '1px solid #DBEAFE', backgroundColor: '#EFF6FF', color: '#2563EB', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Info size={16} /></button>
									</div>
									<div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
										<span style={badge(statusColors, status)}>{normalizeStatus(log.status || log.result || log.level).toUpperCase()}</span>
										<span style={{ fontSize: '12px', fontWeight: 600, padding: '4px 10px', borderRadius: '6px', backgroundColor: '#F3F4F6', color: '#4B5563' }}>{safeText(action)}</span>
									</div>
									<p style={{ margin: '8px 0 0', fontSize: '12px', color: '#374151', lineHeight: 1.5 }}>{safeText(details)}</p>
								</button>
							);
						})}
					</div>
				) : (
					<div style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden', border: '1.5px solid #F0EAE0' }}>
						<div style={{ display: 'grid', gridTemplateColumns: '160px 160px 170px 1fr 64px', gap: 0, backgroundColor: '#1E3A5F', padding: '12px 20px' }}>
							{['Date & Time', 'User', 'Action', 'Details', 'Info'].map((header, index) => (
								<div key={index} style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '.06em' }}>{header}</div>
							))}
						</div>

						{filtered.map((log, index) => {
							const userName = resolveUserName(log);
							const action = resolveAction(log);
							const details = resolveDetails(log);
							return (
								<div key={log.id || `${action || 'log'}-${index}`} style={{ display: 'grid', gridTemplateColumns: '160px 160px 170px 1fr 64px', gap: 0, padding: '14px 20px', backgroundColor: index % 2 === 0 ? 'white' : '#FAFAFA', borderBottom: '1px solid #F3F4F6', alignItems: 'center' }}>
									<div style={{ fontSize: '11px', color: '#6B7280', fontWeight: 600 }}>{formatDate(log.created_at || log.timestamp || log.date)}</div>
									<div style={{ paddingRight: '8px', minWidth: 0 }}><p style={{ fontWeight: 700, fontSize: '13px', color: '#1C1C1C', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={safeText(userName, 'System')}>{safeText(userName, 'System')}</p></div>
									<div><span style={{ fontSize: '12px', fontWeight: 600, padding: '4px 10px', borderRadius: '6px', backgroundColor: '#F3F4F6', color: '#4B5563' }}>{safeText(action)}</span></div>
									<div style={{ paddingRight: '12px', minWidth: 0 }}><p style={{ fontSize: '12px', color: '#374151', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={safeText(details)}>{safeText(details)}</p></div>
									<div style={{ display: 'flex', justifyContent: 'flex-end' }}><button onClick={() => setSelectedLog(log)} title="View log details" style={{ width: '34px', height: '34px', borderRadius: '999px', border: '1px solid #DBEAFE', backgroundColor: '#EFF6FF', color: '#2563EB', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Info size={16} /></button></div>
								</div>
							);
						})}
					</div>
				)}

				{lastPage > 1 && (
					<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginTop: '20px', flexWrap: 'wrap' }}>
						<button onClick={() => fetchLogs(page - 1)} disabled={page === 1} style={{ padding: '8px 18px', borderRadius: '10px', border: '1.5px solid #E5E7EB', backgroundColor: 'white', fontWeight: 700, fontSize: '13px', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.4 : 1 }}>← Prev</button>
						<span style={{ fontSize: '13px', fontWeight: 700, color: '#374151' }}>Page {page} of {lastPage}</span>
						<button onClick={() => fetchLogs(page + 1)} disabled={page === lastPage} style={{ padding: '8px 18px', borderRadius: '10px', border: '1.5px solid #E5E7EB', backgroundColor: 'white', fontWeight: 700, fontSize: '13px', cursor: page === lastPage ? 'not-allowed' : 'pointer', opacity: page === lastPage ? 0.4 : 1 }}>Next →</button>
					</div>
				)}

				{selectedLog && (
					<div onClick={() => setSelectedLog(null)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(17, 24, 39, 0.62)', display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'center', padding: '20px', zIndex: 1000 }}>
						<div onClick={(event) => event.stopPropagation()} style={{ width: 'min(860px, 100%)', maxHeight: isMobile ? 'calc(100vh - 104px)' : '90vh', overflowY: 'auto', borderRadius: '16px', backgroundColor: '#FFFFFF', boxShadow: '0 20px 48px rgba(0, 0, 0, 0.25)', padding: isMobile ? '16px' : '20px', marginTop: isMobile ? '64px' : '0' }}>
							<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '16px' }}>
								<div>
									<h2 style={{ margin: 0, fontSize: '20px', fontWeight: 900, color: '#1F2937' }}>Audit Log Details</h2>
									<p style={{ margin: '4px 0 0', fontSize: '13px', color: '#6B7280' }}>Full record details for the selected log entry.</p>
								</div>
								<button onClick={() => setSelectedLog(null)} style={{ border: 'none', background: 'transparent', color: '#6B7280', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}><X size={16} />Close</button>
							</div>

							<div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
								<div style={{ backgroundColor: '#F9FAFB', borderRadius: '12px', padding: '14px' }}>
									<p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: 800, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Summary</p>
									<div style={{ display: 'grid', gap: '8px', fontSize: '13px', color: '#374151' }}>
										<p style={{ margin: 0 }}><strong>Date:</strong> {formatDate(selectedLog.created_at || selectedLog.timestamp || selectedLog.date)}</p>
										<p style={{ margin: 0 }}><strong>User:</strong> {resolveUserName(selectedLog)}</p>
										<p style={{ margin: 0 }}><strong>Action:</strong> {resolveAction(selectedLog)}</p>
										<p style={{ margin: 0 }}><strong>Status:</strong> {normalizeStatus(selectedLog.status || selectedLog.result || selectedLog.level).toUpperCase()}</p>
									</div>
								</div>

								<div style={{ backgroundColor: '#F9FAFB', borderRadius: '12px', padding: '14px' }}>
									<p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: 800, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Record</p>
									<div style={{ display: 'grid', gap: '8px', fontSize: '13px', color: '#374151' }}>
										<p style={{ margin: 0 }}><strong>Model Type:</strong> {resolveModelType(selectedLog)}</p>
										<p style={{ margin: 0 }}><strong>Model ID:</strong> {safeText(resolveModelId(selectedLog))}</p>
										<p style={{ margin: 0 }}><strong>IP Address:</strong> {safeText(resolveIpAddress(selectedLog))}</p>
										<p style={{ margin: 0 }}><strong>Updated:</strong> {formatDate(selectedLog.updated_at)}</p>
									</div>
								</div>
							</div>

							<div style={{ marginTop: '12px', backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '14px' }}>
								<p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: 800, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Details</p>
								<p style={{ margin: 0, fontSize: '14px', color: '#1F2937', lineHeight: 1.7, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{safeText(resolveDetails(selectedLog))}</p>
							</div>
						</div>
					</div>
				)}
			</div>
		</AdminLayout>
	);
};

export default AuditLogs;
