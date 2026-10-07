# Halloween Costume Hub

Randy's visual costume studio: moodboards + project management for multiple Halloween costumes.

**Live:** https://halloween-costume-hub.vercel.app

## Features
- **Dashboard**: live countdown to Oct 31, collage costume cards with progress rings, what's due this week, next actions, total spent vs budget
- **Moodboard canvas** per costume: drag/drop, paste or link images (compressed into IndexedDB), sticky notes, color swatches; move, resize, multi-select, group, set cover
- **Brainstorm**: 10 guided prompts, each answer becomes a board note or tasks in one click; Spark deck of curated twists (no AI); palette picker with presets
- **Tasks & budget**: Kanban (To do / In progress / Done) for buy + make items with due date, est/actual cost, shop link, priority; budget tracker
- **Timeline**: backwards plan from each costume's event date (order by, build by, test fit…), overdue highlighting, auto-schedule
- Export/Import JSON (includes images). Data: localStorage `halloween-costume-hub-v2` (auto-migrates v1) + IndexedDB `halloween-costume-hub-images`

## Local
```bash
npm install && npm run dev
```
