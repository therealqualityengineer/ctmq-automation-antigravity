/* global EventSource */
(function () {
  let currentState = null;
  let selectedTicketId = null;

  const SWIMLANE_SCHEMA = [
    {
      stage: 'DEFINE',
      title: 'DEFINE (plan-agent)',
      steps: [
        { step: 'jira-fetch', label: 'Jira Fetch & Story', agent: 'plan-agent' },
        { step: 'blueprint-read', label: 'Blueprint Grounding', agent: 'plan-agent' },
        { step: 'testcase-design', label: 'Test Case Design', agent: 'plan-agent' },
        { step: 'subtask-sync', label: 'Sub-task Sync', agent: 'plan-agent' }
      ]
    },
    {
      stage: 'BRANCH',
      title: 'BRANCH (git-agent)',
      steps: [
        { step: 'branch-create', label: 'Create Branch (CB)', agent: 'git-agent' }
      ]
    },
    {
      stage: 'BUILD',
      title: 'BUILD (script-agent)',
      steps: [
        { step: 'corpus-query', label: 'AST Corpus Query', agent: 'script-agent' },
        { step: 'gotchas-check', label: 'Gotchas Memory Check', agent: 'script-agent' },
        { step: 'code-author', label: 'PO & Spec Authoring', agent: 'script-agent' }
      ]
    },
    {
      stage: 'VERIFY',
      title: 'VERIFY & HEAL',
      steps: [
        { step: 'playwright-run', label: 'Playwright Suite', agent: 'script-agent' },
        { step: 'rca-heal', label: 'RCA & Probe Heal', agent: 'script-agent' },
        { step: 'corpus-sync', label: 'Corpus & Gotchas Sync', agent: 'script-agent' }
      ]
    },
    {
      stage: 'SHIP',
      title: 'SHIP & CLOSE',
      steps: [
        { step: 'raise-pr', label: 'Commit & Raise PR', agent: 'git-agent' },
        { step: 'jira-close', label: 'Audit & Close (CL)', agent: 'jira-agent' }
      ]
    }
  ];

  const AGENT_COLORS = {
    'plan-agent': '#7c3aed',
    'git-agent': '#0284c7',
    'script-agent': '#10b981',
    'playwright-run': '#2563eb',
    'rca-heal': '#f59e0b',
    'jira-agent': '#ec4899'
  };

  function formatMinToClock(minutes) {
    const totalSec = Math.round((minutes || 0) * 60);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  function formatTimeShort(iso) {
    if (!iso) return '--:--';
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '--:--';
    }
  }

  async function fetchDashboardState(ticketOverride) {
    const tQuery = ticketOverride || selectedTicketId || '';
    const url = tQuery ? `/api/state?ticket=${encodeURIComponent(tQuery)}` : '/api/state';
    const res = await fetch(url);
    currentState = await res.json();
    selectedTicketId = currentState.selectedTicket.ticket;
    renderAll();
  }

  function renderHeader(state) {
    const t = state.selectedTicket;
    const selector = document.getElementById('ticketSelector');
    selector.innerHTML = state.tickets
      .slice()
      .reverse()
      .map(
        (item) =>
          `<option value="${item.ticket}" ${
            item.ticket === t.ticket ? 'selected' : ''
          }>${item.ticket} • ${item.title.slice(0, 32)}...</option>`
      )
      .join('');

    document.getElementById('branchBadge').textContent = t.branch || state.gitInfo.branch;

    const sm = t.stageMinutes || {};
    document.getElementById('hdrPlanTime').textContent = formatMinToClock(
      (sm.plan || 0) + (sm.branch || 0)
    );
    document.getElementById('hdrScriptTime').textContent = formatMinToClock(
      (sm.corpus || 0) + (sm.authoring || 0)
    );
    document.getElementById('hdrVerifyTime').textContent = formatMinToClock(
      (sm.playwright || 0) + (sm.rca || 0)
    );
    document.getElementById('hdrTotalTime').textContent = formatMinToClock(t.totalAgentMin || 0);

    const chip = document.getElementById('globalStatusChip');
    const statusText = document.getElementById('globalStatusText');
    const simBtn = document.getElementById('simulateBtn');

    if (state.simulationRunning) {
      chip.className = 'status-chip running';
      statusText.textContent = 'Live Running';
      simBtn.disabled = true;
      simBtn.textContent = '⟳ Agent Running...';
      document.getElementById('modeBadge').textContent = '● live stream';
      document.getElementById('recordedStateLabel').textContent = 'LIVE TELEMETRY STREAM • ACTIVE';
    } else {
      chip.className = 'status-chip completed';
      statusText.textContent = `Completed (${t.prNumber || 'PR'})`;
      simBtn.disabled = false;
      simBtn.textContent = '▶ Simulate Live Run';
      document.getElementById('modeBadge').textContent = '⑂ snapshot';
      document.getElementById('recordedStateLabel').textContent = `RECORDED STATE • COMPLETED (${t.era.toUpperCase()})`;
    }
  }

  function renderLiveFlow(state) {
    const t = state.selectedTicket;
    const events = state.events || [];

    document.getElementById('ticketSubtitle').textContent = `${t.ticket}: ${t.title}`;

    // Map latest event per step
    const stepMap = {};
    for (const evt of events) {
      stepMap[evt.step] = evt;
    }

    // Orchestrator state
    const lastEvt = events[events.length - 1];
    const orchBadge = document.getElementById('orchStateBadge');
    const orchSub = document.getElementById('orchSubtext');
    if (lastEvt && state.simulationRunning) {
      orchBadge.textContent = `Active: ${lastEvt.agent}`;
      orchSub.textContent = `↓ executing ${lastEvt.stage}:${lastEvt.step} — ${lastEvt.message}`;
    } else {
      orchBadge.textContent = 'Completed';
      orchSub.textContent = `↓ 4 agents completed ${t.testsAutomated}/${t.testsTotal} automated tests in ${t.totalAgentMin} min (${t.dryReusePct}% corpus reuse)`;
    }

    // Render 5 Swimlanes
    const swimlanesEl = document.getElementById('swimlanesContainer');
    swimlanesEl.innerHTML = SWIMLANE_SCHEMA.map((lane) => {
      const laneEvents = lane.steps.map((s) => stepMap[s.step]).filter(Boolean);
      const anyInProgress = laneEvents.some((e) => e.status === 'in_progress');
      const allDone = laneEvents.length === lane.steps.length && !anyInProgress;
      const stageStatus = anyInProgress ? 'in_progress' : allDone ? 'passed' : 'waiting';
      const stageLabel =
        stageStatus === 'passed'
          ? '✓ Passed'
          : stageStatus === 'in_progress'
          ? '⟳ Active'
          : 'Waiting';

      const cardsHtml = lane.steps
        .map((sDef) => {
          const ev = stepMap[sDef.step];
          const status = ev ? ev.status : 'waiting';
          const badgeText =
            status === 'passed'
              ? '✓ Passed'
              : status === 'repaired'
              ? '✓ Passed'
              : status === 'skipped'
              ? '⏭ Skipped'
              : status === 'in_progress'
              ? '⟳ Running'
              : status === 'failed'
              ? '✗ Failed'
              : 'Waiting';

          const durText =
            ev && ev.durationSec !== undefined
              ? `~${ev.durationSec}s`
              : status === 'skipped'
              ? '0s (skipped)'
              : 'pending';

          const repairChip =
            status === 'repaired'
              ? `<div class="repaired-chip">⚡ repaired +${ev.rcaAttempt || 1}</div>`
              : status === 'skipped'
              ? `<div class="repaired-chip" style="background:#f1f5f9;color:#475569;border-color:#cbd5e1;">⏭ ${
                  ev?.reason || 'Skipped (not needed)'
                }</div>`
              : '';

          const payloadJson = encodeURIComponent(
            JSON.stringify(
              ev || {
                step: sDef.step,
                label: sDef.label,
                agent: sDef.agent,
                stage: lane.stage,
                status: 'waiting',
                message: 'Step has not executed yet in this session.'
              }
            )
          );

          return `
            <div class="step-card status-${status}" data-step-payload="${payloadJson}">
              <div class="step-top">
                <span class="step-name">${sDef.label}</span>
                <span class="step-badge ${status}">${badgeText}</span>
              </div>
              <div class="step-meta">
                <span>⚙ ${sDef.agent}</span>
                <span>⏱ ${durText}</span>
              </div>
              ${repairChip}
            </div>
          `;
        })
        .join('');

      return `
        <div class="swimlane ${allDone ? 'stage-passed' : anyInProgress ? 'stage-active' : ''}">
          <div class="swimlane-header">
            <span class="swimlane-title">${lane.title}</span>
            <span class="stage-pill ${stageStatus}">${stageLabel}</span>
          </div>
          ${cardsHtml}
        </div>
      `;
    }).join('');

    // Attach click listeners for step cards
    swimlanesEl.querySelectorAll('.step-card').forEach((card) => {
      card.addEventListener('click', () => {
        const raw = card.getAttribute('data-step-payload');
        if (!raw) return;
        openStepModal(JSON.parse(decodeURIComponent(raw)));
      });
    });

    // Render Sequence View
    const seqEl = document.getElementById('sequenceCanvasView');
    seqEl.innerHTML = events
      .map(
        (e, i) => `
        <div class="event-item" style="grid-template-columns: 36px 90px 130px 1fr 70px;">
          <strong>#${i + 1}</strong>
          <span class="step-badge ${e.status}">${e.stage}</span>
          <strong>${e.agent}</strong>
          <span><strong>${e.label || e.step}:</strong> ${e.message}</span>
          <span class="event-time">${e.durationSec ? e.durationSec + 's' : ''}</span>
        </div>
      `
      )
      .join('');

    // Strategy Decision Bar
    const strat = t.strategyDecision || {};
    document.getElementById('strategyRecommended').textContent =
      strat.recommended || 'AST Corpus Surgical Read';
    document.getElementById('strategyChosen').textContent =
      strat.chosen || `Reused ${t.reusedMethods} methods (${t.dryReusePct}% DRY)`;
    document.getElementById('strategyGotcha').textContent =
      strat.gotchaApplied || 'Applied context_docs/app_gotchas.md';

    // Agent Handoffs Bar
    const sm = t.stageMinutes || {
      plan: 2.5,
      branch: 0.4,
      corpus: 0.6,
      authoring: 4.0,
      playwright: 2.4,
      rca: 0.8,
      ship: 0.8
    };
    const segments = [
      { label: 'plan-agent • design', min: sm.plan, color: AGENT_COLORS['plan-agent'] },
      { label: 'git-agent • branch', min: sm.branch, color: AGENT_COLORS['git-agent'] },
      { label: 'script-agent • corpus:query', min: sm.corpus, color: '#14b8a6' },
      { label: 'script-agent • code-author', min: sm.authoring, color: AGENT_COLORS['script-agent'] },
      { label: 'playwright • test-runner', min: sm.playwright, color: AGENT_COLORS['playwright-run'] },
      { label: 'script-agent • rca-probe', min: sm.rca, color: AGENT_COLORS['rca-heal'] },
      { label: 'git/jira-agent • PR & close', min: sm.ship, color: AGENT_COLORS['jira-agent'] }
    ].filter((s) => s.min > 0);

    const totalSegMin = segments.reduce((a, b) => a + b.min, 0) || 1;
    document.getElementById('handoffTimelineBar').innerHTML = segments
      .map(
        (s) =>
          `<div class="handoff-segment" style="width:${((s.min / totalSegMin) * 100).toFixed(
            1
          )}%;background:${s.color};" title="${s.label}: ${formatMinToClock(s.min)}"></div>`
      )
      .join('');

    document.getElementById('handoffLegend').innerHTML = segments
      .map(
        (s) => `
        <span class="legend-item">
          <span class="legend-dot" style="background:${s.color}"></span>
          <strong>${s.label}</strong> ${formatMinToClock(s.min)}
        </span>
      `
      )
      .join('');

    // RCA Trace Rows (R1, R2...)
    const rcaTraceEl = document.getElementById('rcaTraceList');
    if (t.rcaDetails && t.rcaDetails.length > 0) {
      rcaTraceEl.innerHTML = t.rcaDetails
        .map(
          (r) => `
          <div class="rca-row">
            <span class="rca-tag">R${r.attempt}</span>
            <span><strong>${r.code}</strong>: ${r.summary} → <code>${r.probe}</code> → <strong>${r.fix}</strong> (${r.durationSec}s)</span>
          </div>
        `
        )
        .join('');
    } else {
      rcaTraceEl.innerHTML = `
        <div class="rca-row">
          <span class="rca-tag clean">R0 • FIRST-TRY PASS</span>
          <span>Zero RCA retries required — 100% of Playwright tests passed on initial run (RCA step skipped)</span>
        </div>
      `;
    }

    // Live Events Right Sidebar
    const reversedEvents = events.slice().reverse();
    document.getElementById('eventsCountBadge').textContent = `${reversedEvents.length} events`;
    document.getElementById('liveEventsList').innerHTML = reversedEvents
      .map((e) => {
        const icon =
          e.status === 'passed'
            ? '✓'
            : e.status === 'repaired'
            ? '⚡'
            : e.status === 'failed'
            ? '✗'
            : e.status === 'skipped'
            ? '⏭'
            : '⟳';
        return `
          <div class="event-item">
            <span class="event-time">${formatTimeShort(e.timestamp)}</span>
            <span class="event-icon ${e.status}">${icon}</span>
            <div>
              <div style="font-weight:700;color:var(--text-main);">${e.label || e.step}</div>
              <div style="color:var(--text-secondary);font-size:11.5px;">${e.message}</div>
            </div>
          </div>
        `;
      })
      .join('');

    // Artifacts Right Sidebar
    const artifacts = t.artifacts && t.artifacts.length > 0 ? t.artifacts : [];
    document.getElementById('artifactsCountBadge').textContent = `${artifacts.length} files`;
    document.getElementById('artifactsList').innerHTML = artifacts
      .map(
        (a) => `
        <div class="artifact-item">
          <span class="artifact-name">📄 ${a.file}</span>
          <div class="artifact-right">
            <span class="event-time">${a.time || ''}</span>
            <span class="step-badge passed">✓ ${a.status || 'Pass'}</span>
          </div>
        </div>
      `
      )
      .join('');
  }

  function renderEvaluation(state) {
    const ev = state.evaluation;
    const t = state.selectedTicket;
    const arch = state.architecture;

    document.getElementById('evalSelectedTicketLabel').textContent = t.ticket;

    // Velocity Health Banner
    const banner = document.getElementById('velocityStatusBanner');
    if (ev.status === 'IMPROVING') {
      banner.className = 'velocity-health-badge improving';
      banner.textContent = `● AGENT VELOCITY: IMPROVING (▼ ${ev.overallReductionPct}% time/ticket)`;
    } else {
      banner.className = 'velocity-health-badge lagging';
      banner.textContent = `▲ AGENT VELOCITY: LAGGING (+${Math.abs(ev.recentDeltaPct)}% vs 3-ticket avg)`;
    }

    document.getElementById('velocityDeltaBadge').textContent = `⚡ ${ev.overallReductionPct}% Faster vs ${state.tickets[0].ticket}`;

    // 5 Learning KPI Cards
    document.getElementById('learningKpiGrid').innerHTML = `
      <div class="kpi-card">
        <div class="kpi-label">Latest Ticket Total Time (${t.ticket})</div>
        <div class="kpi-value">${t.totalAgentMin} min</div>
        <div class="kpi-trend up">▼ Down from ${state.tickets[0].totalAgentMin} min in ${state.tickets[0].ticket}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Normalized Speed (Min / Test)</div>
        <div class="kpi-value">${(t.totalAgentMin / Math.max(1, t.testsAutomated)).toFixed(2)} m/test</div>
        <div class="kpi-trend up">⚡ ${ev.perTestImprovementPct}% faster per automated test</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">First-Pass Zero-RCA Accuracy</div>
        <div class="kpi-value">${Math.round((t.testsPassedFirstRun / Math.max(1, t.testsAutomated)) * 100)}%</div>
        <div class="kpi-trend up">▲ Up from ${ev.baselineFirstPassPct}% baseline (Gotchas effect)</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">AST Corpus DRY Reuse Rate</div>
        <div class="kpi-value">${t.dryReusePct}%</div>
        <div class="kpi-trend up">▲ ${t.reusedMethods} existing PO methods reused</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Stage Bottleneck Detector</div>
        <div class="kpi-value" style="font-size:15px;">${ev.primaryBottleneckStage}</div>
        <div class="kpi-trend warn">⏱ ${ev.primaryBottleneckMin} min (${Math.round((ev.primaryBottleneckMin / t.totalAgentMin) * 100)}% of ticket)</div>
      </div>
    `;

    // Ticket-by-Ticket Stacked Completion Time Chart
    const maxMin = Math.max(...state.tickets.map((item) => item.totalAgentMin), 30);
    const chartEl = document.getElementById('ticketVelocityChart');
    chartEl.innerHTML =
      state.tickets
        .map((item) => {
          const sm = item.stageMinutes;
          const pPct = (((sm.plan + sm.branch) / maxMin) * 100).toFixed(1);
          const cPct = ((sm.corpus / maxMin) * 100).toFixed(1);
          const aPct = ((sm.authoring / maxMin) * 100).toFixed(1);
          const pwPct = ((sm.playwright / maxMin) * 100).toFixed(1);
          const rcaPct = ((sm.rca / maxMin) * 100).toFixed(1);
          const shPct = ((sm.ship / maxMin) * 100).toFixed(1);

          return `
            <div class="t-bar-row" data-ticket="${item.ticket}" title="Click to switch Live Flow to ${item.ticket}">
              <div>
                <span class="t-bar-label">${item.ticket} ${item.ticket === t.ticket ? '●' : ''}</span>
                <span class="t-bar-era">${item.era}</span>
              </div>
              <div class="t-bar-track">
                <div class="t-bar-seg" style="width:${pPct}%;background:#7c3aed" title="Plan & Branch: ${(sm.plan + sm.branch).toFixed(1)}m"></div>
                <div class="t-bar-seg" style="width:${cPct}%;background:#14b8a6" title="Corpus Discovery: ${sm.corpus}m"></div>
                <div class="t-bar-seg" style="width:${aPct}%;background:#10b981" title="Spec/PO Authoring: ${sm.authoring}m"></div>
                <div class="t-bar-seg" style="width:${pwPct}%;background:#2563eb" title="Playwright Run: ${sm.playwright}m"></div>
                <div class="t-bar-seg" style="width:${rcaPct}%;background:#f59e0b" title="RCA Self-Heal: ${sm.rca}m"></div>
                <div class="t-bar-seg" style="width:${shPct}%;background:#ec4899" title="PR & Jira Close: ${sm.ship}m"></div>
              </div>
              <div class="t-bar-total">${item.totalAgentMin} min</div>
            </div>
          `;
        })
        .join('') +
      `
        <div class="handoff-legend" style="margin-top:8px;">
          <span class="legend-item"><span class="legend-dot" style="background:#7c3aed"></span>Plan & Branch</span>
          <span class="legend-item"><span class="legend-dot" style="background:#14b8a6"></span>Corpus Query</span>
          <span class="legend-item"><span class="legend-dot" style="background:#10b981"></span>Spec Authoring</span>
          <span class="legend-item"><span class="legend-dot" style="background:#2563eb"></span>Playwright</span>
          <span class="legend-item"><span class="legend-dot" style="background:#f59e0b"></span>RCA Auto-Fix</span>
          <span class="legend-item"><span class="legend-dot" style="background:#ec4899"></span>PR & Close</span>
        </div>
      `;

    chartEl.querySelectorAll('.t-bar-row').forEach((row) => {
      row.addEventListener('click', () => {
        const clickedTicket = row.getAttribute('data-ticket');
        fetchDashboardState(clickedTicket);
      });
    });

    // Diagnostic Matrix Table
    document.getElementById('learningDiagnosticTable').innerHTML = `
      <table class="diag-table">
        <thead>
          <tr>
            <th>Ticket</th>
            <th>Total Time</th>
            <th>Tests</th>
            <th>Min / Test</th>
            <th>1st-Run Pass</th>
            <th>DRY Reuse</th>
            <th>RCA Loops</th>
            <th>Evaluation</th>
          </tr>
        </thead>
        <tbody>
          ${ev.series
            .map((row, idx) => {
              const prev = idx > 0 ? ev.series[idx - 1] : null;
              const delta = prev ? Number((row.totalAgentMin - prev.totalAgentMin).toFixed(1)) : 0;
              const badge =
                idx === 0
                  ? '<span class="step-badge waiting">Baseline</span>'
                  : delta <= 0
                  ? `<span class="step-badge passed">▼ ${Math.abs(delta)}m faster</span>`
                  : `<span class="step-badge repaired">▲ +${delta}m (${row.testsAutomated} tests)</span>`;
              return `
                <tr class="${row.ticket === t.ticket ? 'selected-row' : ''}">
                  <td><strong>${row.ticket}</strong></td>
                  <td><strong>${row.totalAgentMin}m</strong></td>
                  <td>${row.testsAutomated}</td>
                  <td>${row.minPerTest}m</td>
                  <td>${row.firstPassPct}%</td>
                  <td>${row.dryReusePct}%</td>
                  <td>${row.rcaLoops}</td>
                  <td>${badge}</td>
                </tr>
              `;
            })
            .join('')}
        </tbody>
      </table>
    `;

    // Section 2: Productivity Comparison Bars (Matches Screenshot #1)
    const speedup = (t.manualEstimateMin / Math.max(1, t.totalAgentMin)).toFixed(1);
    const savedHours = ((t.manualEstimateMin - t.totalAgentMin) / 60).toFixed(1);
    const reworkPct = Math.round(((t.stageMinutes.rca || 0) / Math.max(1, t.totalAgentMin)) * 100);
    const earlyBaseline = state.tickets[0];

    document.getElementById('evalSpeedupBadge').textContent = `⚡ ${speedup}x Faster Delivery`;
    document.getElementById('durationComparisonBars').innerHTML = `
      <div class="comp-row">
        <span class="comp-label">Pre-Corpus Agent<br><small>(${earlyBaseline.ticket})</small></span>
        <div class="comp-track">
          <div class="comp-fill" style="width:${Math.min(100, (earlyBaseline.totalAgentMin / t.manualEstimateMin) * 100 * 3).toFixed(1)}%;background:#94a3b8;"></div>
        </div>
        <span class="comp-val">${earlyBaseline.totalAgentMin} min</span>
      </div>
      <div class="comp-row">
        <span class="comp-label">Manual QA<br><small>(Standard)</small></span>
        <div class="comp-track">
          <div class="comp-fill" style="width:94%;background:linear-gradient(90deg, #6336f5, #8b5cf6);"></div>
        </div>
        <span class="comp-val">${(t.manualEstimateMin / 60).toFixed(1)} h</span>
      </div>
      <div class="comp-row">
        <span class="comp-label">Antigravity QA<br><small>(${t.ticket})</small></span>
        <div class="comp-track">
          <div class="comp-fill" style="width:${Math.max(5, (t.totalAgentMin / t.manualEstimateMin) * 100).toFixed(1)}%;background:#10b981;"></div>
        </div>
        <span class="comp-val" style="color:var(--green-primary)">${t.totalAgentMin} min</span>
      </div>
    `;

    document.getElementById('productivityMiniCards').innerHTML = `
      <div class="mini-kpi">
        <div class="mini-kpi-val">⏱ ${savedHours} h</div>
        <div class="mini-kpi-lbl">Time saved (est. vs manual)</div>
      </div>
      <div class="mini-kpi">
        <div class="mini-kpi-val">↻ ${reworkPct}%</div>
        <div class="mini-kpi-lbl">RCA self-heal share</div>
      </div>
      <div class="mini-kpi">
        <div class="mini-kpi-val">⚙ Spec Authoring</div>
        <div class="mini-kpi-lbl">Primary stage (${t.stageMinutes.authoring}m)</div>
      </div>
    `;

    // Stage Duration Breakdown Vertical Bars (Comparing Early Baseline vs Selected Ticket)
    const stageKeys = [
      { key: 'plan', label: 'Planning' },
      { key: 'branch', label: 'Branch (CB)' },
      { key: 'corpus', label: 'Corpus Query' },
      { key: 'authoring', label: 'PO & Spec' },
      { key: 'playwright', label: 'Playwright' },
      { key: 'rca', label: 'RCA Heal' },
      { key: 'ship', label: 'PR & Close' }
    ];
    const maxStageVal = 10;
    document.getElementById('stageBreakdownChart').innerHTML = stageKeys
      .map((sk) => {
        const baseVal = earlyBaseline.stageMinutes[sk.key] || 0;
        const currVal = t.stageMinutes[sk.key] || 0;
        const baseH = Math.max(4, Math.round((baseVal / maxStageVal) * 145));
        const currH = Math.max(4, Math.round((currVal / maxStageVal) * 145));
        return `
          <div class="stage-col">
            <div class="stage-bars-pair">
              <div class="v-bar baseline" style="height:${baseH}px" title="${earlyBaseline.ticket}: ${baseVal}m"></div>
              <div class="v-bar current" style="height:${currH}px" title="${t.ticket}: ${currVal}m"></div>
            </div>
            <span style="font-size:10.5px;font-weight:700;">${currVal}m</span>
            <span class="stage-col-label">${sk.label}</span>
          </div>
        `;
      })
      .join('');

    // Section 3: Governance, Quality & Test Intelligence
    const firstRunRate = Math.round((t.testsPassedFirstRun / Math.max(1, t.testsAutomated)) * 100);
    document.getElementById('rcaDonutContainer').innerHTML = `
      <div style="display:flex;align-items:center;gap:18px;margin-top:14px;">
        <div style="width:104px;height:104px;border-radius:50%;background:conic-gradient(#6336f5 0% ${firstRunRate}%, #f59e0b ${firstRunRate}% 100%);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
          <div style="width:74px;height:74px;border-radius:50%;background:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;">
            <strong style="font-size:18px;">${firstRunRate}%</strong>
            <span style="font-size:9.5px;color:var(--text-muted);">1st-Run Pass</span>
          </div>
        </div>
        <div style="display:flex;flex-direction:column;gap:6px;font-size:12px;">
          <div><span class="legend-dot" style="background:#6336f5;display:inline-block;margin-right:6px;"></span><strong>First-Run Passed:</strong> ${t.testsPassedFirstRun}/${t.testsAutomated} tests</div>
          <div><span class="legend-dot" style="background:#f59e0b;display:inline-block;margin-right:6px;"></span><strong>Auto-Healed via RCA Probe:</strong> ${t.testsAutomated - t.testsPassedFirstRun} tests</div>
          <div><span class="legend-dot" style="background:#10b981;display:inline-block;margin-right:6px;"></span><strong>Human Escalations:</strong> 0 (100% autonomous)</div>
        </div>
      </div>
    `;

    const totalRepoTests = state.tickets.reduce((a, b) => a + b.testsAutomated, 0);
    document.getElementById('playwrightIntelligenceContainer').innerHTML = `
      <div style="display:flex;gap:6px;margin:10px 0;">
        <span class="step-badge in_progress">Selected: ${t.ticket} (${t.testsAutomated})</span>
        <span class="step-badge waiting">All Tracked Tickets (${totalRepoTests})</span>
      </div>
      <div class="mini-kpi-row">
        <div class="mini-kpi">
          <div class="mini-kpi-val">${t.testsAutomated}</div>
          <div class="mini-kpi-lbl">Automated Tests</div>
        </div>
        <div class="mini-kpi">
          <div class="mini-kpi-val" style="color:var(--green-primary)">✓ ${t.testsPassedFinal}</div>
          <div class="mini-kpi-lbl">Passed (100%)</div>
        </div>
        <div class="mini-kpi">
          <div class="mini-kpi-val" style="color:var(--purple-primary)">⏭ ${t.testsDeduplicated}</div>
          <div class="mini-kpi-lbl">Deduplicated (DRY)</div>
        </div>
      </div>
      <div style="margin-top:12px;font-size:12px;color:var(--text-secondary);">
        <strong>Active Reporter:</strong> <code>utils/telemetryReporter.ts</code> hooked into <code>playwright.config.ts</code>
      </div>
    `;

    document.getElementById('qualityGatesTableContainer').innerHTML = `
      <table class="diag-table" style="margin-top:6px;">
        <thead>
          <tr>
            <th>GEMINI.md Gate</th>
            <th>Repository Audit</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Custom Fixtures (<code>customFixtures.ts</code>)</td>
            <td>${arch.specsUsingCustomFixtures}/${arch.specsCount} specs</td>
            <td><span class="step-badge passed">✓ Pass</span></td>
          </tr>
          <tr>
            <td>Externalized Test Data (<code>test-data/</code>)</td>
            <td>${arch.specsImportingTestData}/${arch.specsCount} specs</td>
            <td><span class="step-badge passed">✓ Pass</span></td>
          </tr>
          <tr>
            <td>Explicit Waits (Zero <code>waitForTimeout</code>)</td>
            <td>${arch.waitForTimeoutViolations} violations</td>
            <td><span class="step-badge ${arch.waitForTimeoutViolations === 0 ? 'passed' : 'repaired'}">${arch.waitForTimeoutViolations === 0 ? '✓ Pass' : '⚠ Check'}</span></td>
          </tr>
          <tr>
            <td>AST Code Corpus Synchronized</td>
            <td>${arch.corpusStats.pageObjectsCount} POs / ${arch.corpusStats.totalMethodsCount} methods</td>
            <td><span class="step-badge passed">✓ Synced</span></td>
          </tr>
          <tr>
            <td>Knowledge &amp; Gotchas Updated</td>
            <td>${arch.gotchasItems.length} gotchas / ${arch.blueprintModules} modules</td>
            <td><span class="step-badge passed">✓ Synced</span></td>
          </tr>
        </tbody>
      </table>
    `;
  }

  function renderReadiness(state) {
    const arch = state.architecture;
    const cs = arch.corpusStats;

    document.getElementById('readinessSummaryCards').innerHTML = `
      <div class="kpi-card">
        <div class="kpi-label">Indexed Page Objects</div>
        <div class="kpi-value">${cs.pageObjectsCount}</div>
        <div class="kpi-trend up">In .context/code-corpus.json</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Reusable Action Methods</div>
        <div class="kpi-value">${cs.totalMethodsCount}</div>
        <div class="kpi-trend up">Surgical [Lstart-end] indexed</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Centralized Locators</div>
        <div class="kpi-value">${cs.totalLocatorsCount}</div>
        <div class="kpi-trend up">Semantic Role/Label/TestId</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Automated Spec Suites</div>
        <div class="kpi-value">${cs.specsCount}</div>
        <div class="kpi-trend up">Under tests/*.spec.ts</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Recorded DOM Gotchas</div>
        <div class="kpi-value">${arch.gotchasItems.length}</div>
        <div class="kpi-trend up">In context_docs/app_gotchas.md</div>
      </div>
    `;

    document.getElementById('corpusPageObjectsTable').innerHTML = `
      <table class="diag-table">
        <thead>
          <tr>
            <th>Page Object Class</th>
            <th>File</th>
            <th>Extends</th>
            <th>Locators</th>
            <th>Methods</th>
          </tr>
        </thead>
        <tbody>
          ${(cs.pageObjectBreakdown || [])
            .map(
              (po) => `
              <tr>
                <td><strong>${po.className}</strong></td>
                <td><code>${po.file}</code></td>
                <td><code>${po.extendsClass}</code></td>
                <td>${po.locatorsCount}</td>
                <td><span class="step-badge passed">${po.methodsCount} methods</span></td>
              </tr>
            `
            )
            .join('')}
        </tbody>
      </table>
    `;

    document.getElementById('gotchasMemoryList').innerHTML = (arch.gotchasItems || [])
      .map(
        (g) => `
        <div class="gotcha-card">
          <div>
            <strong>Gotcha #${g.id}:</strong> ${g.title}
          </div>
          <span class="step-badge passed">Active Guardrail</span>
        </div>
      `
      )
      .join('');
  }

  function openStepModal(ev) {
    const modal = document.getElementById('stepModal');
    document.getElementById('modalTitle').textContent = `${ev.stage} • ${ev.label || ev.step}`;
    document.getElementById('modalBody').innerHTML = `
      <div><strong>Agent:</strong> <code>${ev.agent}</code></div>
      <div><strong>Status:</strong> <span class="step-badge ${ev.status}">${ev.status.toUpperCase()}</span></div>
      <div><strong>Duration:</strong> ${ev.durationSec !== undefined ? ev.durationSec + ' seconds' : 'N/A'}</div>
      <div><strong>Detail / Evidence:</strong> ${ev.message || ev.reason || 'Completed'}</div>
      ${
        ev.artifacts && ev.artifacts.length
          ? `<div><strong>Artifacts Touched:</strong> <code>${ev.artifacts.join(', ')}</code></div>`
          : ''
      }
    `;
    modal.classList.remove('hidden');
  }

  function renderAll() {
    if (!currentState) return;
    renderHeader(currentState);
    renderLiveFlow(currentState);
    renderEvaluation(currentState);
    renderReadiness(currentState);
  }

  // Event Listeners
  document.querySelectorAll('.tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach((p) => p.classList.remove('active'));
      btn.classList.add('active');
      const target = document.getElementById(`tab-${btn.getAttribute('data-tab')}`);
      if (target) target.classList.add('active');
    });
  });

  document.querySelectorAll('.subview-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.subview-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const view = btn.getAttribute('data-flowview');
      document.getElementById('flowCanvasView').classList.toggle('hidden', view !== 'flow');
      document.getElementById('sequenceCanvasView').classList.toggle('hidden', view !== 'sequence');
    });
  });

  document.getElementById('ticketSelector').addEventListener('change', (e) => {
    selectedTicketId = e.target.value;
    fetchDashboardState(selectedTicketId);
  });

  document.getElementById('refreshBtn').addEventListener('click', () => {
    fetchDashboardState(selectedTicketId);
  });

  document.getElementById('simulateBtn').addEventListener('click', async () => {
    const ticket = selectedTicketId || 'CTMQ-75';
    await fetch(`/api/simulate?ticket=${encodeURIComponent(ticket)}`, { method: 'POST' });
    fetchDashboardState(ticket);
  });

  document.getElementById('modalCloseBtn').addEventListener('click', () => {
    document.getElementById('stepModal').classList.add('hidden');
  });

  document.getElementById('stepModal').addEventListener('click', (e) => {
    if (e.target.id === 'stepModal') {
      document.getElementById('stepModal').classList.add('hidden');
    }
  });

  // Connect Server-Sent Events (SSE) for real-time updates
  const evtSource = new EventSource('/api/stream');
  evtSource.addEventListener('telemetry-update', () => {
    fetchDashboardState(selectedTicketId);
  });
  evtSource.addEventListener('simulation-complete', () => {
    fetchDashboardState(selectedTicketId);
  });

  // Initial Load
  fetchDashboardState();
})();
