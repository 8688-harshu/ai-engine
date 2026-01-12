#!/usr/bin/env node
import { Command } from 'commander';
import { Coordinator } from './engine/Coordinator';
import { ReportGenerator } from './reporter/ReportGenerator';
import chalk from 'chalk';

const program = new Command();

program
    .name('web-trust-engine')
    .description('Autonomous AI Website Quality, Trust, and Hygiene Evaluation Engine')
    .version('1.0.0')
    .argument('<url>', 'Website URL to scan')
    .option('-h, --headless', 'Run in headless mode', true)
    .option('-o, --output <dir>', 'Output directory for reports', './reports')
    .action(async (url, options) => {
        console.log(chalk.blue(`Starting scan for: ${url}`));

        // Ensure URL has protocol
        if (!url.startsWith('http')) {
            url = 'https://' + url;
        }

        const coordinator = new Coordinator({
            startUrl: url,
            maxPages: 10, // Default limit
            headless: options.headless !== 'false', // commander weirdness with boolean flags sometimes
        });

        try {
            const report = await coordinator.run();

            console.log(chalk.green(`\nScan Complete!`));
            console.log(chalk.bold(`Hygiene Score: ${report.score.total}/100`));
            console.log(`Trust Summary: ${report.trustSummary}`);

            const reportPath = ReportGenerator.generateMarkdown(report, options.output);
            console.log(chalk.gray(`Report saved to: ${reportPath}`));

        } catch (error) {
            console.error(chalk.red('Fatal Error during scan:'), error);
            process.exit(1);
        }
    });

program.parse();
