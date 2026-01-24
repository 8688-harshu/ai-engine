import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Globe, ArrowRight } from 'lucide-react';

interface Props {
    onScan: (url: string, authConfig?: any) => void;
}

const HeroInput = ({ onScan }: Props) => {
    const [url, setUrl] = useState('');
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [authType, setAuthType] = useState<'none' | 'basic' | 'cookies'>('none');

    // Basic Auth State
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loginUrl, setLoginUrl] = useState('');

    // Cookie Auth State
    const [cookieJson, setCookieJson] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!url) return;

        let authConfig = undefined;

        if (authType === 'basic' && username && password && loginUrl) {
            authConfig = {
                type: 'basic',
                username,
                password,
                loginUrl
            };
        } else if (authType === 'cookies' && cookieJson) {
            try {
                const parsed = JSON.parse(cookieJson);
                authConfig = {
                    type: 'cookies',
                    cookies: Array.isArray(parsed) ? parsed : [parsed]
                };
            } catch (e) {
                alert('Invalid Cookie JSON format');
                return;
            }
        }

        onScan(url, authConfig);
    };

    return (
        <section style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginTop: '8vh',
            textAlign: 'center',
            width: '100%'
        }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                <h2 style={{
                    fontSize: '4rem',
                    fontWeight: 800,
                    marginBottom: '1.5rem',
                    background: 'linear-gradient(90deg, #fff, var(--text-secondary))',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}>
                    Is that site <span style={{ color: 'var(--accent-blue)', WebkitTextFillColor: 'initial' }}>Safe?</span>
                </h2>
                <p style={{
                    color: 'var(--text-secondary)',
                    fontSize: '1.2rem',
                    maxWidth: '600px',
                    lineHeight: '1.6',
                    marginBottom: '3rem',
                    marginLeft: 'auto',
                    marginRight: 'auto'
                }}>
                    Our AI-powered engine analyzes millions of data points, visual signals, and semantic content to detect scams, fraud, and low-quality websites.
                </p>
            </motion.div>

            <motion.form
                onSubmit={handleSubmit}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                style={{
                    position: 'relative',
                    width: '100%',
                    maxWidth: '700px',
                    marginBottom: '2rem'
                }}
            >
                <div style={{ position: 'relative' }}>
                    <div style={{
                        position: 'absolute',
                        left: '20px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--text-secondary)'
                    }}>
                        <Globe size={20} />
                    </div>

                    <input
                        type="text"
                        placeholder="Enter website URL (e.g. example.com)"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '1.2rem 1.2rem 1.2rem 3.5rem',
                            fontSize: '1.1rem',
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: showAdvanced ? '16px 16px 16px 16px' : '16px',
                            color: 'white',
                            outline: 'none',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
                            backdropFilter: 'blur(5px)'
                        }}
                    />

                    <button
                        type="submit"
                        style={{
                            position: 'absolute',
                            right: '10px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'var(--accent-blue)',
                            color: '#000',
                            border: 'none',
                            borderRadius: '10px',
                            padding: '0.8rem 1.5rem',
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            transition: 'transform 0.2s',
                            cursor: 'pointer'
                        }}
                    >
                        Analyze <ArrowRight size={18} />
                    </button>
                </div>

                <div style={{ textAlign: 'right', marginTop: '0.5rem' }}>
                    <button
                        type="button"
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.9rem', textDecoration: 'underline' }}
                    >
                        {showAdvanced ? 'Hide Advanced Options' : 'Advanced Options (Auth)'}
                    </button>
                </div>

                {showAdvanced && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        style={{
                            background: 'rgba(255,255,255,0.02)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '16px',
                            padding: '1.5rem',
                            marginTop: '1rem',
                            textAlign: 'left'
                        }}
                    >
                        <h3 style={{ marginTop: 0, fontSize: '1rem', color: 'var(--text-primary)' }}>Authentication Method</h3>
                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                            <label style={{ cursor: 'pointer', color: authType === 'none' ? 'var(--accent-blue)' : 'var(--text-secondary)' }}>
                                <input type="radio" checked={authType === 'none'} onChange={() => setAuthType('none')} style={{ marginRight: '0.5rem' }} />
                                None
                            </label>
                            <label style={{ cursor: 'pointer', color: authType === 'basic' ? 'var(--accent-blue)' : 'var(--text-secondary)' }}>
                                <input type="radio" checked={authType === 'basic'} onChange={() => setAuthType('basic')} style={{ marginRight: '0.5rem' }} />
                                Basic Login Form
                            </label>
                            <label style={{ cursor: 'pointer', color: authType === 'cookies' ? 'var(--accent-blue)' : 'var(--text-secondary)' }}>
                                <input type="radio" checked={authType === 'cookies'} onChange={() => setAuthType('cookies')} style={{ marginRight: '0.5rem' }} />
                                Session Cookies
                            </label>
                        </div>

                        {authType === 'basic' && (
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                <input
                                    className="advanced-input"
                                    type="text"
                                    placeholder="Login Page URL (e.g. /login)"
                                    value={loginUrl}
                                    onChange={e => setLoginUrl(e.target.value)}
                                    style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
                                />
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <input
                                        type="text"
                                        placeholder="Username / Email"
                                        value={username}
                                        onChange={e => setUsername(e.target.value)}
                                        style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
                                    />
                                    <input
                                        type="password"
                                        placeholder="Password"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
                                    />
                                </div>
                            </div>
                        )}

                        {authType === 'cookies' && (
                            <div>
                                <textarea
                                    placeholder='Paste JSON cookies here (from EditThisCookie or similar)... [{"name": "session", "value": "..."}]'
                                    value={cookieJson}
                                    onChange={e => setCookieJson(e.target.value)}
                                    style={{
                                        width: '100%',
                                        height: '100px',
                                        padding: '0.8rem',
                                        borderRadius: '8px',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        background: 'rgba(0,0,0,0.2)',
                                        color: 'white',
                                        fontFamily: 'monospace',
                                        fontSize: '0.85rem'
                                    }}
                                />
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                                    Tip: Use an extension like "EditThisCookie" to export cookies as JSON.
                                </p>
                            </div>
                        )}
                    </motion.div>
                )}
            </motion.form>

            <div style={{ marginTop: '2rem', display: 'flex', gap: '2rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Search size={14} /> AI Analysis
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Search size={14} /> Visual Inspection
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Search size={14} /> Network Traffic
                </span>
            </div>
        </section>
    );
};

export default HeroInput;
