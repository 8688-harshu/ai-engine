import { Issue, HygieneScore } from '../types';

export class Scoring {
    private static WEIGHTS = {
        functionality: 15,
        performance: 10,
        uiUx: 10,
        reliability: 10,
        content: 10,
        semantic: 25,
        accessibility: 20 // Major component of trust
    };

    private static DEDUCTIONS = {
        High: 15,
        Medium: 5,
        Low: 1
    };

    static calculate(issues: Issue[]): HygieneScore {
        let breakdown: any = {
            functionality: Scoring.WEIGHTS.functionality,
            performance: Scoring.WEIGHTS.performance,
            uiUx: Scoring.WEIGHTS.uiUx,
            reliability: Scoring.WEIGHTS.reliability,
            content: Scoring.WEIGHTS.content,
            semantic: Scoring.WEIGHTS.semantic,
            accessibility: Scoring.WEIGHTS.accessibility
        };

        for (const issue of issues) {
            const deduction = Scoring.DEDUCTIONS[issue.severity];
            switch (issue.category) {
                case 'Functional':
                    breakdown.functionality -= deduction;
                    break;
                case 'Performance':
                    breakdown.performance -= deduction;
                    break;
                case 'UI/UX':
                    breakdown.uiUx -= deduction;
                    break;
                case 'Network':
                    breakdown.reliability -= deduction;
                    break;
                case 'Content':
                    breakdown.content -= deduction;
                    break;
                case 'Semantic':
                case 'Trust':
                    breakdown.semantic -= deduction;
                    break;
                case 'Accessibility':
                    breakdown.accessibility -= deduction;
                    break;
            }
        }

        // Clamp values to 0
        Object.keys(breakdown).forEach(key => {
            if (breakdown[key] < 0) breakdown[key] = 0;
        });

        const total =
            breakdown.functionality +
            breakdown.performance +
            breakdown.uiUx +
            breakdown.reliability +
            breakdown.content +
            breakdown.semantic +
            breakdown.accessibility;

        return {
            total: Math.round(total),
            breakdown
        };
    }
}
