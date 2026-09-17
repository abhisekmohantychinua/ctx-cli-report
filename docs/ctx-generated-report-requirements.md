# CTX Generated Report Requirements

## Naming decision

Use:

```bash
ctx generate report
```

`report` is preferable to `snapshot` for CTX's audience and philosophy. A snapshot usually means a point-in-time copy of state. CTX's generated output is more than a copy: it interprets sessions, tasks, logs, and decisions, calculates metrics, shows timelines, and explains execution patterns. `report` also fits naturally beside `ctx generate instruction`:

- `ctx generate instruction` creates static guidance about how the project should be worked on.
- `ctx generate report` creates an interpreted account of how the project has been worked on.

The output is still generated from a fixed point in time, so “snapshot” may remain an internal implementation term, but `report` should be the public command.

## Purpose

The report is an experimental, on-demand, local HTML dashboard that explains the project's recorded execution history.

It should help answer:

- What work has happened?
- How much recorded time has been spent?
- How regularly has work occurred?
- What tasks were completed, blocked, or left pending?
- Where were issues and attempts concentrated?
- Which decisions were made and why?
- How has the project progressed over time?

The report describes recorded execution. It must not claim to measure absolute productivity, code quality, motivation, discipline, competence, or business value.

## Generation behavior

Primary command:

```bash
ctx generate report
```

Possible scoped commands:

```bash
ctx generate report sessions
ctx generate report tasks
ctx generate report logs
ctx generate report decisions
```

Generation must be:

- Explicit and on demand
- Local and offline-first
- Read-only with respect to `.ctxcli`
- Free of background processes
- Free of network or cloud dependencies
- Based only on data available at generation time

A typical output folder is:

```text
report/
├── index.html
├── sessions.html
├── tasks.html
├── logs.html
├── decisions.html
├── metrics.json
├── styles.css
└── script.js
```

The report should be self-contained and open locally without a server.

## Shared requirements

Every page should identify:

- Report generation time
- Data cutoff time
- Project name or root
- Relevant data range
- Whether values are raw or derived
- Whether a metric is unavailable because data is missing

All timestamps should follow CTX's UTC-storage and configured display-time rules.

---

# 1. Overview page — `index.html`

## Purpose

The overview answers:

> What is the current state of the project, and what does its recorded execution history look like?

## Project identity

Show:

- Project name, if available
- Project root
- Project creation time
- Report generation time
- Data cutoff time
- Report version, if supported

Calculation:

- Read project information from `metadata.json`.
- Capture one generation timestamp.
- Use that same timestamp as the report cutoff.

## High-level metrics

Show:

- Total sessions
- Total recorded work time
- Active days
- Total tasks
- Completed tasks
- In-progress tasks
- Blocked tasks
- Pending tasks
- Total logs
- Total decisions

Calculation:

- Count records in each collection.
- Group tasks by current status.
- Sum ended-session durations.
- For an active session, calculate duration up to the cutoff time.
- Count distinct local calendar dates containing session activity.

## Current execution state

Show:

- Active session, if any
- Active or most recently active task, if available
- Pending-task count
- Blocked-task count
- Most recent log
- Most recent decision

Calculation:

- Active session: session with active status or no `endedAt`.
- Active task: task marked in progress or identified as active by the task model.
- Recent records: sort by timestamp descending.

## Recent activity

Show a compact combined timeline of:

- Session starts and ends
- Task creation or completion
- Logs
- Decisions

Merge supported events, assign each an event type, and sort chronologically. Do not invent historical events that the data model does not preserve.

## Project timeline

Show the project from its first recorded activity to the report cutoff.

Include:

- First session
- Major task events
- Logs
- Decisions
- Latest activity

The timeline reconnects separate CTX files into one execution history.

---

# 2. Sessions page — `sessions.html`

## Purpose

Explain the project's recorded working-time structure.

## Session totals

Show:

- Total sessions
- Completed sessions
- Active sessions
- Total recorded duration
- Average duration
- Median duration
- Longest session
- Shortest session

For each session:

```text
duration = endedAt - createdAt
```

For an active session:

```text
duration = reportCutoffTime - createdAt
```

Recorded duration means the time for which a session was open. It does not prove continuous active work.

## Session duration distribution

Show a histogram or grouped distribution of session lengths.

The ranges must be documented and consistent. The distribution describes whether recorded work periods are mostly short, long, or mixed; it is not a judgment about work quality.

## Project time span

Show:

- First session start
- Latest session end or report cutoff
- Calendar span
- Active days
- Inactive days

Calculation:

- First start: minimum session start.
- Latest endpoint: maximum end time, or cutoff if an active session exists.
- Active days: distinct local dates with session activity.
- Inactive days: calendar days in the span minus active days.

## Sessions per day

Show:

- Average sessions per active day
- Average sessions per calendar day
- Maximum sessions in one day
- Daily session count

Calculation:

```text
sessions per active day = total sessions / active days
sessions per calendar day = total sessions / calendar days in span
```

## Work time per day

Show:

- Average recorded time per active day
- Average recorded time per calendar day
- Daily recorded duration
- Highest recorded-work day
- Lowest recorded-work day

Group session durations by local calendar date.

## Session gaps

A session gap is the period between one session ending and the next session starting.

Show:

- Average gap
- Median gap
- Longest gap
- Shortest gap
- Gap distribution

Calculation:

```text
gap = nextSession.createdAt - previousSession.endedAt
```

Only calculate gaps when the earlier session has an end time.

## Work continuity

Continuity describes how regularly sessions occur across the project span. It is not a measure of discipline or quality.

A simple possible formula is:

```text
continuity ratio = active calendar days / calendar days in project span
```

The formula must be displayed or documented.

## Session fragmentation

Fragmentation describes whether recorded time is divided into many short sessions or concentrated into fewer longer sessions.

A possible formula is:

```text
fragmentation index = sum(1 / sessionDuration)
```

A normalized form may be:

```text
normalized fragmentation = fragmentation index / session count
```

The implementation must define units, zero-duration handling, and whether the metric is comparable between projects.

## Temporal patterns

Show:

- Session starts by hour
- Session starts by day of week
- Average start time
- Peak start hour
- Session activity over time

Convert timestamps using CTX's configured display-time rules before grouping.

## Session records

Show:

- Session ID
- Notes
- Start time
- End time
- Duration
- Status
- Related task, if available
- Related log count, if calculable

---

# 3. Tasks page — `tasks.html`

## Purpose

Explain how work items were created, progressed, blocked, and completed.

## Task totals

Show:

- Total tasks
- Pending tasks
- In-progress tasks
- Blocked tasks
- Completed tasks
- Open tasks
- Completion rate

Calculation:

```text
completion rate = completed tasks / total tasks × 100
```

Define the zero-task behavior explicitly.

## Status distribution

Show counts and percentages for:

- Pending
- In progress
- Blocked
- Completed

```text
status percentage = tasks in status / total tasks × 100
```

Use only statuses supported by the task model.

## Task creation and completion over time

Show:

- Tasks created by date
- Tasks completed by date
- Completion timeline
- Open tasks over time, only if historical status data exists

Do not reconstruct historical status from current records if the data model does not preserve status history.

## Task completion duration

For completed tasks with valid timestamps, show:

- Average completion duration
- Median completion duration
- Longest duration
- Shortest duration

```text
completion duration = completedAt - createdAt
```

This is elapsed calendar time, not continuous work time.

## Blocked tasks

Show:

- Number of blocked tasks
- Blocked percentage
- Blocked task list
- Block reasons
- Related logs and decisions

Do not infer a reason when no reason was stored.

## Task hierarchy

Show:

- Root tasks
- Subtasks
- Maximum observed nesting depth
- Tree structure
- Orphan tasks

Calculation:

- Root task: no parent ID.
- Subtask: valid parent ID.
- Depth: traverse parent relationships.
- Orphan: parent ID does not resolve.

Detect cycles and show a data-integrity warning instead of entering an infinite traversal.

## Task activity

Show:

- Logs per task
- Decisions per task
- Last activity time
- Tasks with no recorded activity
- Tasks with many issues or attempts

Match records using stored task references. Activity volume must not be presented as task importance or success.

## Task records

Show:

- Task ID
- Title
- Description
- Status
- Parent task
- Created time
- Completed time
- Block reason
- Subtask count
- Log count
- Decision count
- Last activity

---

# 4. Logs page — `logs.html`

## Purpose

Explain the project's recorded execution activity.

Logs are short observations, ideas, issues, and attempts—not a continuous transcript of every action.

## Log totals

Show:

- Total logs
- Logs per session
- Logs per task
- Unlinked logs
- First log time
- Latest log time

## Tag distribution

Show counts and percentages for:

- NOTE
- IDEA
- ISSUE
- ATTEMPT

```text
tag percentage = logs with tag / total logs × 100
```

## Log activity over time

Show:

- Logs by day
- Logs by week or month for longer projects
- Logs by hour
- Activity peaks
- Activity gaps

The selected time granularity must be visible.

## Issues and attempts

Show:

- Total issue logs
- Total attempt logs
- Issues by task
- Attempts by task
- Tasks with repeated attempts
- Tasks with issues but no recorded attempts

Only show relationships supported by stored references. Do not assume an attempt resolved an issue.

## Log density

Log density describes recorded logs relative to another unit.

Possible metrics:

```text
logs per session = total logs / total sessions
logs per recorded hour = total logs / total recorded hours
```

The denominator must be stated. If it is zero, show the metric as unavailable.

## Log-to-task relationship

Show:

- Tasks with the most logs
- Tasks with no logs
- Average logs per task
- Logs grouped by task status
- Invalid task references

## Chronological log records

Show:

- Timestamp
- Message
- Tag
- Session reference
- Task reference

Preserve the original message text.

---

# 5. Decisions page — `decisions.html`

## Purpose

Preserve and explain the reasoning behind important project choices.

## Decision totals

Show:

- Total decisions
- Decisions per session
- Decisions per task
- Unlinked decisions
- First decision time
- Latest decision time

## Decisions over time

Show:

- Decisions by day
- Decisions by week or month
- Decision activity timeline
- Periods with high decision activity

A high decision count is not automatically positive or negative.

## Topics and tags

Show:

- Topics
- Topic frequency
- Tags
- Tag frequency
- Topics with repeated decisions

Missing values may be shown as `Uncategorized`, using one consistent convention.

Repeated topics should be described neutrally; repetition may indicate refinement rather than inconsistency.

## Decision references

Show:

- Decisions linked to tasks
- Decisions linked to sessions
- Unlinked decisions
- Tasks with decisions
- Sessions with decisions
- Invalid references

Match `referenceType` and `referenceId` to the relevant entity.

## Decision content

Show:

- Decision ID
- Topic
- Reasoning
- Tags
- Timestamp
- Reference type
- Reference ID

Preserve the original reasoning. Do not replace it with generated interpretation.

## Decision concentration

Decision concentration describes whether decisions are spread across many topics or concentrated in fewer topics.

A simple first metric is:

```text
top-topic share = decisions in the most frequent topic / total decisions
```

This is easier to understand than an entropy score and should be preferred initially.

---

# 6. Cross-domain analysis

Where references are valid, the report may show:

- Sessions associated with tasks
- Logs per task
- Decisions per task
- Decisions per session
- Issues and attempts within tasks
- Activity around important decisions
- Tasks with no associated logs or decisions
- Sessions with no associated task activity

Do not estimate task duration unless the data model explicitly supports it.

## Project momentum

Momentum may be added only if its formula is transparent.

It should describe recent recorded activity relative to earlier recorded activity, not predict project success.

A possible approach is to compare equal periods using a documented weighted count of:

- Sessions
- Completed tasks
- Logs
- Decisions

If the weighting cannot be justified clearly, omit momentum from the first version.

---

# 7. Derived metric rules

Every derived metric must:

1. Have a documented formula.
2. Be distinguishable from raw data.
3. Include its time range.
4. Follow CTX timezone/display rules.
5. Show `Unavailable` when data is insufficient.
6. Avoid implying causation from simple correlation.
7. Avoid judging the developer.
8. Explain unfamiliar terms in plain language.

The overview should contain only the clearest metrics. Complex metrics belong on detailed pages.

---

# 8. Empty and invalid data

Handle:

- No sessions
- No tasks
- No logs
- No decisions
- Only an active session
- Missing optional fields
- Invalid references
- Invalid timestamps
- Corrupted JSON
- Missing historical status information

Examples:

- No sessions: do not calculate average duration.
- No completed tasks: completion-duration metrics are unavailable.
- No task history: do not create historical status charts.
- Invalid parent: show an orphan-task warning.
- Invalid reference: preserve the record and show the invalid reference.
- Corrupted file: stop generation and identify the affected file.

---

# 9. Recommended first version

## Overview

- Project identity
- Generation and cutoff time
- Session, task, log, and decision totals
- Task status counts
- Total recorded duration
- Active days
- Current execution state
- Recent activity
- Project timeline

## Sessions

- Count and duration statistics
- Active days
- Sessions per day
- Daily duration
- Session gaps
- Session records

## Tasks

- Status distribution
- Completion rate
- Blocked tasks
- Task hierarchy
- Creation and completion activity
- Task activity counts
- Task records

## Logs

- Total logs
- Tag distribution
- Activity over time
- Issues and attempts
- Logs per session/task
- Chronological records

## Decisions

- Total decisions
- Decisions over time
- Topics and tags
- Task/session references
- Chronological records

Complex metrics such as fragmentation, continuity, entropy, and momentum should be introduced only after their formulas and interpretations are stable.

## Final definition

`ctx generate report` converts CTX's stored execution context into a local, self-contained report that explains not only what exists in the project, but how the project has been worked on over time.
