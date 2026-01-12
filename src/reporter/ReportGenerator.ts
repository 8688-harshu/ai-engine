import { FinalReport } from '../types';
import * as fs from 'fs';
import * as path from 'path';

export class ReportGenerator {
    static generateMarkdown(report: FinalReport, outputDir: string) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `trust-report-${timestamp}.md`;
        const filepath = path.join(outputDir, filename);

        const content = `
# Website Trust & Hygiene Report

**Scan Date:** ${new Date().toLocaleString()}
**Hygiene Score:** ${report.score.total}/100
**Trust Level:** ${report.trustSummary}

## Score Breakdown
- **Functionality:** ${report.score.breakdown.functionality}/30
- **Performance:** ${report.score.breakdown.performance}/20
- **UI/UX:** ${report.score.breakdown.uiUx}/20
- **Reliability:** ${report.score.breakdown.reliability}/15
- **Content:** ${report.score.breakdown.content}/15

---

## Executive Summary
${report.closingInsight}

## Critical Trust-Breaking Issues
${report.criticalIssues.length > 0 ? report.criticalIssues.map(i => `- [HIGH] ${i.description} (${i.url})`).join('\n') : 'No critical issues detected.'}

## Detailed Issues
${report.issues.map(i => `### [${i.severity}] ${i.description}
- **Category:** ${i.category}
- **URL:** ${i.url}
- **User Impact:** ${i.userImpact}
- **Recommendation:** ${i.remediation}
`).join('\n')}

## Recommendations
### Immediate
${report.recommendations.immediate.map(r => `- ${r}`).join('\n')}

### Short-term
${report.recommendations.shortTerm.map(r => `- ${r}`).join('\n')}
    `;

        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        fs.writeFileSync(filepath, content);
        console.log(`Report generated: ${filepath}`);
        return filepath;
    }
}
