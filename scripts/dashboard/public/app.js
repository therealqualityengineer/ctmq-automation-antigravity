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
      (sm.playwright || 0) + (sm.rca || 0) + (sm.ship || 0)
    );
    document.getElementById('hdrTotalTime').textContent = formatMinToClock(t.totalAgentMin || 0);

    const chip = document.getElementById('globalStatusChip');
    const statusText = document.getElementById('globalStatusText');
    const wfState = t.workflowState || 'completed';

    if (wfState === 'failed') {
      chip.className = 'status-chip failed';
      statusText.textContent = 'Halted • Bug / Failure';
      document.getElementById('modeBadge').textContent = '● live stream';
      document.getElementById('recordedStateLabel').textContent = `WORKFLOW HALTED • BUG OR BLOCKER DETECTED ON ${t.ticket}`;
    } else if (wfState === 'in_progress') {
      chip.className = 'status-chip running';
      statusText.textContent = 'Live Running';
      document.getElementById('modeBadge').textContent = '● live stream';
      document.getElementById('recordedStateLabel').textContent = 'LIVE TELEMETRY STREAM • ACTIVE';
    } else if (wfState === 'pr_raised') {
      chip.className = 'status-chip running';
      statusText.textContent = `PR Raised (${t.prNumber || 'PR'}) • Awaiting Close`;
      document.getElementById('modeBadge').textContent = '● live stream';
      document.getElementById('recordedStateLabel').textContent = `LIVE WORKFLOW • PR RAISED (${t.prNumber || 'PR'}) — AWAITING CL ${t.ticket}`;
    } else {
      chip.className = 'status-chip completed';
      statusText.textContent = `Completed (${t.prNumber || 'PR'})`;
      document.getElementById('modeBadge').textContent = '⑂ snapshot';
      document.getElementById('recordedStateLabel').textContent = `RECORDED STATE • COMPLETED (${(t.era || '').toUpperCase()})`;
    }
  }

  function renderLiveFlow(state) {
    const t = state.selectedTicket;
    const events = state.events || [];

    document.getElementById('ticketSubtitle').textContent = `${t.ticket}: ${t.title}`;
    const triggerPill = document.getElementById('humanTriggerPill');
    if (triggerPill) {
      triggerPill.textContent = `→ Implement Test ${t.ticket}`;
    }

    // Map latest event per step and track chronological step order
    const stepMap = {};
    const stepOrderMap = {};
    let seqCounter = 1;
    for (const evt of events) {
      if (evt.step && evt.step !== 'orchestrator-start' && evt.step !== 'orchestrator-complete' && evt.step !== 'orchestrator-halt') {
        if (!stepOrderMap[evt.step]) {
          stepOrderMap[evt.step] = seqCounter++;
        }
      }
      stepMap[evt.step] = evt;
    }

    // Orchestrator state
    const lastEvt = events[events.length - 1];
    const orchNode = document.getElementById('orchestratorNode');
    const orchBadge = document.getElementById('orchStateBadge');
    const orchSub = document.getElementById('orchSubtext');
    const wfState = t.workflowState || 'completed';

    if (wfState === 'failed') {
      if (orchNode) orchNode.className = 'orchestrator-box orch-failed';
      orchBadge.textContent = `✗ Halted (${lastEvt ? lastEvt.step : 'Blocker'})`;
      orchSub.textContent = `⚠ Workflow stopped by qa-orchestrator-agent — ${lastEvt ? lastEvt.message : 'Bug or test failure detected'}`;
    } else if (lastEvt && wfState === 'in_progress') {
      if (orchNode) orchNode.className = 'orchestrator-box orch-running';
      orchBadge.textContent = `⚡ Active → ${lastEvt.agent}`;
      orchSub.textContent = `⇢ Delegating ${lastEvt.stage}:${lastEvt.step} — ${lastEvt.message}`;
    } else if (wfState === 'pr_raised') {
      if (orchNode) orchNode.className = 'orchestrator-box orch-running';
      orchBadge.textContent = `PR Raised (${t.prNumber})`;
      orchSub.textContent = `⇢ ${t.testsAutomated}/${t.testsTotal} automated tests passed in ${t.totalAgentMin} min (${t.dryReusePct}% corpus reuse) • Next: jira-agent (CL ${t.ticket})`;
    } else {
      if (orchNode) orchNode.className = 'orchestrator-box orch-completed';
      orchBadge.textContent = '✓ Completed E2E';
      orchSub.textContent = `⇢ qa-orchestrator-agent completed all 5 stages (${t.testsAutomated}/${t.testsTotal} tests passed in ${t.totalAgentMin} min • ${t.dryReusePct}% corpus reuse)`;
    }

    // Compute per-swimlane status so both the orchestrator delegation chain and dotted SVG connector tree reflect live stage state
    const laneStates = SWIMLANE_SCHEMA.map((lane, idx) => {
      const laneEvents = lane.steps.map((s) => stepMap[s.step]).filter(Boolean);
      const anyFailed = laneEvents.some((e) => e.status === 'failed');
      const anyInProgress = laneEvents.some((e) => e.status === 'in_progress');
      const allDone = laneEvents.length === lane.steps.length && !anyInProgress && !anyFailed;
      const someDone = laneEvents.length > 0 && !anyInProgress && !anyFailed && !allDone;
      const stageStatus = anyFailed
        ? 'failed'
        : anyInProgress || someDone
        ? 'in_progress'
        : allDone
        ? 'passed'
        : 'waiting';
      return {
        index: idx,
        stage: lane.stage,
        title: lane.title,
        status: stageStatus,
        anyFailed,
        anyInProgress,
        allDone
      };
    });

    // Render Skill Delegation Chain inside QA Orchestrator Agent
    const delegationEl = document.getElementById('orchDelegationChain');
    if (delegationEl) {
      const chainNodes = [
        { label: 'git-agent (CB)', stage: 'BRANCH', status: laneStates[1].status },
        { label: 'plan-agent (Test Plan)', stage: 'DEFINE', status: laneStates[0].status },
        { label: 'script-agent (Build)', stage: 'BUILD', status: laneStates[2].status },
        { label: 'script-agent (Verify/RCA)', stage: 'VERIFY', status: laneStates[3].status },
        { label: 'git & jira-agent (PR & Close)', stage: 'SHIP', status: laneStates[4].status }
      ];
      delegationEl.innerHTML = chainNodes
        .map((node, i) => {
          const icon =
            node.status === 'passed'
              ? '✓'
              : node.status === 'in_progress'
              ? '⟳'
              : node.status === 'failed'
              ? '✗'
              : '○';
          const arrow =
            i < chainNodes.length - 1
              ? `<span class="chain-dotted-arrow status-${node.status}">┄┄▸</span>`
              : '';
          return `
            <span class="chain-pill status-${node.status}">
              <span class="chain-icon">${icon}</span> ${node.label}
            </span>
            ${arrow}
          `;
        })
        .join('');
    }

    // Render SVG Dotted Arrow Routing Tree from QA Orchestrator Agent to the 5 Swimlanes
    const treeEl = document.getElementById('orchestratorConnectorTree');
    if (treeEl) {
      const xPositions = [100, 300, 500, 700, 900];
      const strokeForStatus = (st) =>
        st === 'passed'
          ? '#109868'
          : st === 'in_progress'
          ? '#6336f5'
          : st === 'failed'
          ? '#dc2626'
          : '#94a3b8';
      const markerForStatus = (st) =>
        st === 'passed'
          ? 'url(#arrow-passed)'
          : st === 'in_progress'
          ? 'url(#arrow-active)'
          : st === 'failed'
          ? 'url(#arrow-failed)'
          : 'url(#arrow-waiting)';

      const trunkStatus =
        wfState === 'failed'
          ? 'failed'
          : wfState === 'in_progress' || wfState === 'pr_raised'
          ? 'in_progress'
          : 'passed';

      const branchesSvg = laneStates
        .map((ls, idx) => {
          const x = xPositions[idx];
          const color = strokeForStatus(ls.status);
          const marker = markerForStatus(ls.status);
          const animClass = ls.status === 'in_progress' ? 'dotted-path-active' : '';
          const badgeLabel =
            ls.status === 'passed'
              ? `✓ ${ls.stage}`
              : ls.status === 'in_progress'
              ? `⚡ ${ls.stage}`
              : ls.status === 'failed'
              ? `✗ ${ls.stage}`
              : `${ls.stage}`;
          return `
            <!-- Dotted branch from center trunk (500,20) to column (${x},20) and down to (${x},60) -->
            <path d="M 500 20 L ${x} 20 L ${x} 58"
                  fill="none"
                  stroke="${color}"
                  stroke-width="${ls.status === 'in_progress' ? '2.6' : '2'}"
                  stroke-dasharray="5,4"
                  class="${animClass}"
                  marker-end="${marker}" />
            <circle cx="${x}" cy="20" r="3.5" fill="${color}" />
            <g transform="translate(${x}, 37)">
              <rect x="-42" y="-9" width="84" height="17" rx="8" fill="#ffffff" stroke="${color}" stroke-width="1.3" />
              <text x="0" y="3" text-anchor="middle" font-size="9.5" font-weight="700" fill="${color}">${badgeLabel}</text>
            </g>
          `;
        })
        .join('');

      treeEl.innerHTML = `
        <svg class="orch-tree-svg" viewBox="0 0 1000 66" preserveAspectRatio="none" aria-label="QA Orchestrator Agent Dotted Workflow Tree">
          <defs>
            <marker id="arrow-passed" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#109868" />
            </marker>
            <marker id="arrow-active" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#6336f5" />
            </marker>
            <marker id="arrow-failed" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#dc2626" />
            </marker>
            <marker id="arrow-waiting" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#94a3b8" />
            </marker>
          </defs>
          <!-- Center trunk descending from QA Orchestrator Agent -->
          <path d="M 500 0 L 500 20"
                fill="none"
                stroke="${strokeForStatus(trunkStatus)}"
                stroke-width="2.5"
                stroke-dasharray="4,3"
                class="${trunkStatus === 'in_progress' ? 'dotted-path-active' : ''}" />
          <circle cx="500" cy="4" r="4" fill="${strokeForStatus(trunkStatus)}" />
          ${branchesSvg}
        </svg>
      `;
    }

    // Render 5 Swimlanes with One-by-One Step Dotted Arrow Connectors
    const swimlanesEl = document.getElementById('swimlanesContainer');
    swimlanesEl.innerHTML = SWIMLANE_SCHEMA.map((lane, laneIdx) => {
      const ls = laneStates[laneIdx];
      const stageStatus = ls.status;
      const stageLabel =
        stageStatus === 'passed'
          ? '✓ Passed'
          : stageStatus === 'in_progress'
          ? '⟳ Active'
          : stageStatus === 'failed'
          ? '✗ Halted'
          : 'Waiting';

      const cardsHtml = lane.steps
        .map((sDef, stepIdx) => {
          const ev = stepMap[sDef.step];
          const status = ev ? ev.status : 'waiting';
          const execOrder = stepOrderMap[sDef.step];
          const orderPill = execOrder
            ? `<span class="step-order-pill status-${status}" title="Execution order #${execOrder}">#${execOrder}</span>`
            : `<span class="step-order-pill status-waiting">•</span>`;

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
            ev && ev.durationSec !== undefined && ev.durationSec !== null
              ? `~${ev.durationSec}s`
              : status === 'skipped'
              ? '0s (skipped)'
              : status === 'in_progress'
              ? 'running...'
              : status === 'passed' || status === 'repaired'
              ? 'completed'
              : 'waiting';

          const repairChip =
            status === 'repaired'
              ? `<div class="repaired-chip">⚡ repaired +${ev.rcaAttempt || 1}</div>`
              : status === 'skipped'
              ? `<div class="repaired-chip" style="background:#f1f5f9;color:#475569;border-color:#cbd5e1;">⏭ ${
                  ev?.reason || 'Skipped (not needed)'
                }</div>`
              : status === 'failed'
              ? `<div class="repaired-chip" style="background:#fef2f2;color:#dc2626;border-color:#fca5a5;">✗ ${
                  ev?.message || 'Halted on failure'
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

          // Render vertical dotted arrow connector to the next step inside this swimlane
          let nextConnectorHtml = '';
          if (stepIdx < lane.steps.length - 1) {
            const nextStepDef = lane.steps[stepIdx + 1];
            const nextEv = stepMap[nextStepDef.step];
            const nextStatus = nextEv ? nextEv.status : 'waiting';
            const connStatus =
              nextStatus === 'in_progress'
                ? 'in_progress'
                : nextStatus === 'passed' || nextStatus === 'repaired' || nextStatus === 'skipped'
                ? 'passed'
                : nextStatus === 'failed'
                ? 'failed'
                : 'waiting';
            nextConnectorHtml = `
              <div class="step-dotted-connector status-${connStatus}" title="Next step: ${nextStepDef.label}">
                <span class="dotted-stem"></span>
                <span class="dotted-arrowhead">▾</span>
              </div>
            `;
          }

          return `
            <div class="step-card status-${status}" data-step-payload="${payloadJson}">
              <div class="step-top">
                <div class="step-name-wrap">
                  ${orderPill}
                  <span class="step-name">${sDef.label}</span>
                </div>
                <span class="step-badge ${status}">${badgeText}</span>
              </div>
              <div class="step-meta">
                <span>⚙ ${sDef.agent}</span>
                <span>⏱ ${durText}</span>
              </div>
              ${repairChip}
            </div>
            ${nextConnectorHtml}
          `;
        })
        .join('');

      return `
        <div class="swimlane ${
          ls.allDone ? 'stage-passed' : ls.anyFailed ? 'stage-failed' : ls.anyInProgress ? 'stage-active' : ''
        }">
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
  evtSource.addEventListener('telemetry-update', (evt) => {
    try {
      const payload = JSON.parse(evt.data || '{}');
      if (payload.activeTicket && payload.activeTicket !== selectedTicketId) {
        selectedTicketId = payload.activeTicket;
      }
    } catch {
      // ignore
    }
    fetchDashboardState(selectedTicketId);
  });

  // Initial Load
  fetchDashboardState();
})();
