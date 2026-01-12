import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const ScanStatus = () => {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '50vh',
            textAlign: 'center'
        }}>
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
                <Loader2 size={64} color="var(--accent-blue)" />
            </motion.div>

            <h2 style={{ marginTop: '2rem', fontWeight: 500 }}>Analyzing Target...</h2>

            <motion.div
                style={{ color: 'var(--text-secondary)', marginTop: '1rem', height: '20px' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
            >
                <TypingText />
            </motion.div>
        </div>
    );
};

const TypingText = () => {
    // Simple mock typewriter effect could go here, or just cycling text
    return (
        <motion.p
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
        >
            Running Heuristic & Semantic Analysis...
        </motion.p>
    );
}

export default ScanStatus;
