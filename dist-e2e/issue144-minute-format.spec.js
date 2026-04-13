"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * E2E tests for issue #144: Needs Minutes (time) for task start and end time.
 *
 * Feature request: a 'minute' format so batch jobs with hh:mm:ss start/end
 * times can be visualised at minute-level granularity (columns = minutes).
 *
 * Currently valid formats are: hour day week month quarter.
 * This spec verifies whether 'minute' format support exists and whether
 * sub-hour tasks positioned at specific minutes render proportionally in
 * the existing 'hour' format.
 *
 * Run against the demo server:
 *   JSGANTT_E2E_BASE_URL=http://test.counbo.com/jsgantt-improved \
 *     npx playwright test --config=playwright.e2e.config.js issue144
 */
const test_1 = require("@playwright/test");
async function gotoDemo(page) {
    var _a;
    const baseURL = (_a = process.env.JSGANTT_E2E_BASE_URL) !== null && _a !== void 0 ? _a : 'http://localhost:8080';
    const url = baseURL.replace(/\/$/, '') + '/demo.html';
    await page.goto(url, { waitUntil: 'load' });
    await page.waitForFunction(() => typeof window.JSGantt !== 'undefined', { timeout: 15000 });
}
test_1.test.describe('Issue #144 — minute-level format support', () => {
    /**
     * PRIMARY: verify that 'minute' is accepted as a valid format.
     *
     * Expected (once implemented): the chart renders with minute-labeled columns
     * and bars that span the correct number of minute-width units.
     *
     * Current result: Draw() hangs because 'minute' falls through all
     * `if (this.vFormat == ...)` branches, leaving vColWidth undefined and
     * producing an infinite header-building loop.
     */
    (0, test_1.test)('minute format renders chart with minute-labeled column headers', async ({ page }) => {
        await gotoDemo(page);
        const result = await page.evaluate(() => {
            const container = document.getElementById('embedded-Gantt');
            container.innerHTML = '';
            const g = new window.JSGantt.GanttChart(container, 'minute');
            g.setOptions({ vFormat: 'minute', vShowDeps: 0, vLang: 'en' });
            const T = window.JSGantt.TaskItem;
            g.AddTaskItem(new T(1, 'Batch Job A', '2024-01-01 08:00', '2024-01-01 08:30', 'gtaskblue', '', 0, '', 0, 0, 0, 1, '', '', '', g));
            g.AddTaskItem(new T(2, 'Batch Job B', '2024-01-01 08:45', '2024-01-01 09:15', 'gtaskgreen', '', 0, '', 0, 0, 0, 1, '', '', '', g));
            g.Draw();
            const chartTable = document.querySelector('.gcharttable');
            const headerRows = document.querySelectorAll('.gcharttableh tr');
            const bars = document.querySelectorAll('[id*="bardiv_"]');
            const lastHeaderRow = headerRows[headerRows.length - 1];
            const headerCells = lastHeaderRow
                ? Array.from(lastHeaderRow.querySelectorAll('td')).map(td => td.innerText.trim())
                : [];
            return {
                chartRendered: !!chartTable,
                barCount: bars.length,
                minorHeaderSample: headerCells.slice(0, 6),
            };
        });
        (0, test_1.expect)(result.chartRendered, 'chart table should be present').toBe(true);
        (0, test_1.expect)(result.barCount, 'should render at least 2 task bars').toBeGreaterThanOrEqual(2);
        // Minor header cells should contain minute values (e.g. "00", "15", "30", "45")
        const minutePattern = /^\d{1,2}$/;
        const hasMinuteLabels = result.minorHeaderSample.some(label => minutePattern.test(label));
        (0, test_1.expect)(hasMinuteLabels, `Minor header cells should show minute values. Got: ${JSON.stringify(result.minorHeaderSample)}`).toBe(true);
    });
    /**
     * SECONDARY: sub-hour tasks render proportionally in 'hour' format.
     *
     * Two adjacent 30-minute tasks should produce equal-width bars, and the
     * second bar's left edge should meet the first bar's right edge.
     *
     * This is a pre-condition / baseline for the minute-format feature.
     */
    (0, test_1.test)('two adjacent 30-min tasks in hour format have equal width and abut', async ({ page }) => {
        await gotoDemo(page);
        const result = await page.evaluate(() => {
            const container = document.getElementById('embedded-Gantt');
            container.innerHTML = '';
            const g = new window.JSGantt.GanttChart(container, 'hour');
            g.setOptions({ vFormat: 'hour', vShowDeps: 0, vLang: 'en' });
            const T = window.JSGantt.TaskItem;
            g.AddTaskItem(new T(1, 'First Half', '2024-01-01 08:00', '2024-01-01 08:30', 'gtaskblue', '', 0, '', 0, 0, 0, 1, '', '', '', g));
            g.AddTaskItem(new T(2, 'Second Half', '2024-01-01 08:30', '2024-01-01 09:00', 'gtaskgreen', '', 0, '', 0, 0, 0, 1, '', '', '', g));
            g.Draw();
            const bars = Array.from(document.querySelectorAll('[id*="bardiv_"]'));
            return bars.map(bar => ({
                id: bar.id,
                left: parseInt(bar.style.left || '0', 10),
                width: parseInt(bar.style.width || '0', 10),
            }));
        });
        (0, test_1.expect)(result.length, 'should render 2 bars').toBe(2);
        const [bar1, bar2] = result;
        (0, test_1.expect)(Math.abs(bar1.width - bar2.width), `Both 30-min tasks should have equal bar width. Got: ${bar1.width}px and ${bar2.width}px`).toBeLessThanOrEqual(1);
        (0, test_1.expect)(Math.abs((bar1.left + bar1.width) - bar2.left), `Second bar (left=${bar2.left}) should start where first ends (right=${bar1.left + bar1.width})`).toBeLessThanOrEqual(1);
    });
});
//# sourceMappingURL=issue144-minute-format.spec.js.map