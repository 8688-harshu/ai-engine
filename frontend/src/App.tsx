import { useState } from 'react';
import axios from 'axios';
import HeroInput from './components/HeroInput';
import ScanStatus from './components/ScanStatus';
import ReportView from './components/ReportView';
import { ShieldCheck } from 'lucide-react';

function App() {
  const [status, setStatus] = useState<'idle' | 'scanning' | 'complete' | 'error'>('idle');
  const [report, setReport] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleScan = async (url: string) => {
    setStatus('scanning');
    setErrorMsg('');
    setReport(null);
    try {
      const response = await axios.post('/api/scan', { url });
      setReport(response.data);
      setStatus('complete');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(
        (err.response?.data?.error || 'Failed to connect to scanner.') +
        (err.response?.data?.details ? `\nDetails: ${err.response.data.details}` : '')
      );
      setStatus('error');
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '4rem' }}>
        <ShieldCheck size={40} color="var(--accent-blue)" />
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', letterSpacing: '1px' }}>WEB TRUST ENGINE</h1>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>AI-Powered Security & Hygiene Analysis</span>
        </div>
      </header>

      <main>
        {status === 'idle' && (
          <HeroInput onScan={handleScan} />
        )}

        {status === 'scanning' && (
          <ScanStatus />
        )}

        {status === 'complete' && report && (
          <ReportView report={report} onReset={() => setStatus('idle')} />
        )}

        {status === 'error' && (
          <div style={{ textAlign: 'center', marginTop: '4rem' }}>
            <h2 style={{ color: 'var(--accent-red)' }}>Scan Failed</h2>
            <p>{errorMsg}</p>
            <button
              onClick={() => setStatus('idle')}
              style={{
                background: 'transparent',
                border: '1px solid var(--text-secondary)',
                color: 'var(--text-primary)',
                padding: '0.8rem 2rem',
                borderRadius: '8px',
                marginTop: '1rem'
              }}
            >
              Try Again
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
