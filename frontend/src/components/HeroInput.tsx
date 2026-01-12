import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Globe, ArrowRight } from 'lucide-react';

interface Props {
    onScan: (url: string) => void;
}

const HeroInput = ({ onScan }: Props) => {
    const [url, setUrl] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (url) onScan(url);
    };

    return (
        <section style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginTop: '8vh',
            textAlign: 'center'
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
                    marginBottom: '3rem'
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
                }}
            >
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
                        borderRadius: '16px',
                        color: 'white',
                        outline: 'none',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
                        backdropFilter: 'blur(5px)'
                    }}
                    onFocus={(e) => {
                        e.target.style.borderColor = 'var(--accent-blue)';
                        e.target.style.background = 'rgba(255,255,255,0.05)';
                    }}
                    onBlur={(e) => {
                        e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                        e.target.style.background = 'rgba(255,255,255,0.03)';
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
                        transition: 'transform 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-50%) scale(1.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(-50%) scale(1)'}
                >
                    Analyze <ArrowRight size={18} />
                </button>
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
