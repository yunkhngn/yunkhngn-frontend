# Dashboard Performance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Increase the responsiveness of the dashboard loading state.

**Architecture:** Consolidate 6+ parallel requests into a single database-level query aggregation layer.

**Tech Stack:** Prisma, NestJS, React.

---

### Task 1: Consolidate Endpoint Logic in Backend
Reduce frontend queries to a single entry payload.

**Files:**
- Create: `yunkhngn-be/src/modules/system/dashboard.controller.ts`
- Create: `yunkhngn-be/src/modules/system/dashboard.service.ts`

- [ ] **Step 1: Code `dashboard.service.ts`**
Run Prisma client metrics.

- [ ] **Step 2: Connect routes to `system.module.ts`**

- [ ] **Step 3: Commit**
```bash
git add yunkhngn-be/
git commit -m "perf: backend dashboard-stats aggregation"
```
