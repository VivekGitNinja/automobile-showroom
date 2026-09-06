const { chromium } = require('@playwright/test');
const { AxeBuilder } = require('@axe-core/playwright');

async function runAxeScan() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();

  const pagesToScan = [
    { name: 'Homepage', url: 'http://localhost:3000/' },
    { name: 'Inventory', url: 'http://localhost:3000/inventory' },
    { name: 'Vehicle Page', url: 'http://localhost:3000/inventory/porsche-911-2023' },
    { name: 'Contact', url: 'http://localhost:3000/contact' },
  ];

  console.log('================================================================');
  console.log('  APEX LUXURY AUTOMOBILES — REAL AXE-CORE ACCESSIBILITY SCAN');
  console.log('================================================================\n');

  const summary = {};
  let totalCritical = 0;
  let totalSerious = 0;
  let totalModerate = 0;
  let totalMinor = 0;

  for (const p of pagesToScan) {
    const page = await context.newPage();
    console.log(`Scanning ${p.name} (${p.url})...`);
    await page.goto(p.url, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000); // Allow animations & hydration to settle

    const axe = new AxeBuilder({ page });
    const results = await axe.analyze();

    const critical = results.violations.filter(v => v.impact === 'critical');
    const serious = results.violations.filter(v => v.impact === 'serious');
    const moderate = results.violations.filter(v => v.impact === 'moderate');
    const minor = results.violations.filter(v => v.impact === 'minor');

    totalCritical += critical.length;
    totalSerious += serious.length;
    totalModerate += moderate.length;
    totalMinor += minor.length;

    summary[p.name] = {
      critical: critical.length,
      serious: serious.length,
      moderate: moderate.length,
      minor: minor.length,
      total: results.violations.length,
      violations: results.violations.map(v => ({
        id: v.id,
        impact: v.impact,
        description: v.description,
        nodesCount: v.nodes.length,
        selectors: v.nodes.map(n => n.target).slice(0, 3)
      }))
    };

    console.log(`  -> Critical: ${critical.length}, Serious: ${serious.length}, Moderate: ${moderate.length}, Minor: ${minor.length} (Total: ${results.violations.length})`);
    if (results.violations.length > 0) {
      for (const v of results.violations) {
        console.log(`     [${v.impact.toUpperCase()}] ${v.id}: ${v.description} (${v.nodes.length} occurrences)`);
        v.nodes.slice(0, 2).forEach(n => console.log(`       Target: ${JSON.stringify(n.target)}`));
      }
    }
    console.log('');
    await page.close();
  }

  console.log('================================================================');
  console.log('  SCAN SUMMARY TOTALS:');
  console.log(`  Critical: ${totalCritical}`);
  console.log(`  Serious:  ${totalSerious}`);
  console.log(`  Moderate: ${totalModerate}`);
  console.log(`  Minor:    ${totalMinor}`);
  console.log('================================================================');

  await browser.close();
  return { totalCritical, totalSerious, totalModerate, totalMinor, summary };
}

runAxeScan().catch(err => {
  console.error('Fatal in axe scan:', err);
  process.exit(1);
});
