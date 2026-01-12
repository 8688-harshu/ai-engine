import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, ChevronDown, ShieldAlert } from 'lucide-react';
import { useState } from 'react';

interface Props {
    report: any;
    onReset: () => void;
}

const ReportView = ({ report, onReset }: Props) => {
    const scoreColor = report.score.total > 80 ? 'var(--accent-green)' : report.score.total > 50 ? 'orange' : 'var(--accent-red)';
    const trustLabel = report.trustSummary;

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <button onClick={onReset} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', marginBottom: '2rem', padding: 0 }}>
                &larr; Analyze another site
            </button>

            {/* Score Header */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 2fr',
                gap: '2rem',
                marginBottom: '3rem',
                background: 'var(--bg-card)',
                padding: '2rem',
                borderRadius: '24px',
                border: '1px solid rgba(255,255,255,0.05)'
            }}>
                <div style={{ textAlign: 'center', borderRight: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>HYGIENE SCORE</div>
                    <div style={{ fontSize: '5rem', fontWeight: 800, color: scoreColor, lineHeight: 1 }}>
                        {report.score.total}
                    </div>
                    <div style={{
                        marginTop: '1rem',
                        display: 'inline-block',
                        padding: '0.4rem 1rem',
                        borderRadius: '20px',
                        background: 'rgba(255,255,255,0.05)',
                        fontSize: '0.9rem',
                        color: scoreColor
                    }}>
                        {trustLabel}
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <h3 style={{ margin: '0 0 1.5rem 0' }}>Score Breakdown</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                        <Metric label="Functionality" value={report.score.breakdown.functionality} max={20} />
                        <Metric label="Semantic Analysis" value={report.score.breakdown.semantic} max={30} />
                        <Metric label="UI / UX" value={report.score.breakdown.uiUx} max={15} />
                        <Metric label="Reliability" value={report.score.breakdown.reliability} max={10} />
                        <Metric label="Content" value={report.score.breakdown.content} max={10} />
                        <Metric label="Performance" value={report.score.breakdown.performance} max={15} />
                    </div>
                </div>
            </div>

            {/* AI Insight */}
            <div style={{
                background: 'linear-gradient(145deg, rgba(66, 133, 244, 0.1), rgba(66, 133, 244, 0.0))',
                borderRadius: '16px',
                padding: '1.5rem',
                marginBottom: '3rem',
                border: '1px solid rgba(66, 133, 244, 0.2)'
            }}>
                <h3 style={{ color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 0 }}>
                    <ShieldAlert size={20} /> AI Analysis Summary
                </h3>
                <p style={{ lineHeight: '1.6', fontSize: '1.05rem', color: '#e0e0e0' }}>
                    {report.closingInsight}
                </p>
            </div>

            {/* Issues List */}
            <h3 style={{ marginBottom: '1.5rem' }}>Detected Issues</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {report.issues.length === 0 && (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', background: 'var(--bg-card)', borderRadius: '16px' }}>
                        <CheckCircle size={40} color="var(--accent-green)" style={{ marginBottom: '1rem' }} />
                        <p>No significant issues detected.</p>
                    </div>
                )}
                {report.issues.map((issue: any) => (
                    <IssueCard key={issue.id} issue={issue} />
                ))}
            </div>
        </motion.div>
    );
};

const Metric = ({ label, value, max }: { label: string, value: number, max: number }) => (
    <div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>{label}</div>
        <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{
                height: '100%',
                width: `${(value / max) * 100}%`,
                background: value === max ? 'var(--accent-green)' : 'var(--accent-blue)'
            }} />
        </div>
        <div style={{ fontSize: '0.8rem', marginTop: '0.3rem', textAlign: 'right' }}>{value}/{max}</div>
    </div>
);

const IssueCard = ({ issue }: { issue: any }) => {
    const [expanded, setExpanded] = useState(false);

    // Check if category is valid before accessing color map
    const categoryColors: Record<string, string> = {
        'Semantic': 'var(--accent-purple)',
        'Trust': 'var(--accent-red)',
        'Functional': 'orange',
        'UI/UX': 'var(--accent-blue)',
        'Content': 'white'
    };

    const color = categoryColors[issue.category as string] || 'gray';

    return (
        <div style={{
            background: 'var(--bg-card)',
            borderRadius: '12px',
            overflow: 'hidden',
            border: `1px solid ${issue.severity === 'High' ? 'rgba(255,51,102,0.3)' : 'rgba(255,255,255,0.05)'}`
        }}>
            <div
                onClick={() => setExpanded(!expanded)}
                style={{
                    padding: '1.2rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    cursor: 'pointer'
                }}
            >
                {issue.severity === 'High' ? <AlertTriangle color="var(--accent-red)" /> : <AlertTriangle color="orange" size={18} />}

                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.3rem' }}>
                        <span style={{
                            fontSize: '0.7rem',
                            textTransform: 'uppercase',
                            padding: '0.2rem 0.6rem',
                            borderRadius: '10px',
                            background: `${color}22`,
                            color: color,
                            fontWeight: 'bold'
                        }}>
                            {issue.category}
                        </span>
                        <span style={{ fontWeight: 500 }}>{issue.description.substring(0, 100)}{issue.description.length > 100 ? '...' : ''}</span>
                    </div>
                </div>

                <ChevronDown size={20} style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
            </div>

            {expanded && (
                <div style={{ padding: '0 1.2rem 1.2rem 4rem', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                    <p style={{ marginTop: 0 }}>{issue.description}</p>
                    <div style={{ marginTop: '1rem', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px' }}>
                        <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.5rem' }}>Remediation:</strong>
                        {issue.remediation}
                    </div>
                </div>
            )}
        </div>
    );
}

export default ReportView;
