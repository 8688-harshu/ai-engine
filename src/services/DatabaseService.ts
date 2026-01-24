import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { FinalReport } from '../types';

dotenv.config();

export class DatabaseService {
    private supabase: SupabaseClient | null = null;
    private enabled: boolean = false;

    constructor() {
        const url = process.env.SUPABASE_URL;
        const key = process.env.SUPABASE_ANON_KEY;

        if (url && key && url !== 'your_supabase_url') {
            this.supabase = createClient(url, key);
            this.enabled = true;
            console.log('✅ Supabase Client Initialized');
        } else {
            console.warn('⚠️ Supabase credentials missing. caching disabled.');
        }
    }

    async getReport(url: string): Promise<FinalReport | null> {
        if (!this.enabled || !this.supabase) return null;

        try {
            console.log(`Checking cache for: ${url}`);

            // Normalize URL slightly to improve hit rate (trailing slash)
            const cleanUrl = url.endsWith('/') ? url.slice(0, -1) : url;

            const { data, error } = await this.supabase
                .from('reports')
                .select('*')
                .or(`url.eq.${cleanUrl},url.eq.${cleanUrl}/`)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (error) {
                // PGRST116 means no rows found, which is fine
                if (error.code !== 'PGRST116') {
                    console.error('Supabase Lookup Error:', error.message);
                }
                return null;
            }

            if (!data) return null;

            // Check if report is too old (e.g., > 24 hours)
            const reportDate = new Date(data.created_at);
            const now = new Date();
            const ageHours = (now.getTime() - reportDate.getTime()) / (1000 * 60 * 60);

            if (ageHours > 24) {
                console.log('Cache expired (>24h)');
                return null;
            }

            console.log('🎯 Cache HIT!');
            return data.report_json as FinalReport;

        } catch (e) {
            console.error('Database get error:', e);
            return null;
        }
    }

    async saveReport(url: string, report: FinalReport): Promise<void> {
        if (!this.enabled || !this.supabase) return;

        try {
            const { error } = await this.supabase
                .from('reports')
                .insert({
                    url: url,
                    report_json: report,
                    hygiene_score: report.score.total,
                    trust_summary: report.trustSummary
                });

            if (error) {
                console.error('Failed to save to Supabase:', error.message);
            } else {
                console.log('💾 Report saved to Database');
            }

        } catch (e) {
            console.error('Database save error:', e);
        }
    }
}
