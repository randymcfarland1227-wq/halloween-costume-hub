import type { Costume } from './types'
import { addDays, halloween, nowIso, todayStr } from './util'

export function seedCostumes(): Costume[] {
  const t = nowIso(), H = halloween(), today = todayStr()
  const d = (n: number) => { const v = addDays(today, n); return v > H ? H : v }
  return [
    {
      id: 'seed-cryptkeeper', name: 'Midnight Cryptkeeper', status: 'shopping', demo: true,
      eventName: 'Halloween night', eventDate: H, budget: 180,
      palette: ['#0b0a0f', '#3d1a2e', '#6b2d4a', '#e8dfd0', '#b08d57'],
      coverSrc: 'https://images.unsplash.com/photo-1508361001413-7a9dca21d08a?w=900&q=70',
      elements: [
        { id: 'e1', kind: 'image', x: 60, y: 60, w: 340, h: 420, z: 1, src: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=900&q=70' },
        { id: 'e2', kind: 'image', x: 430, y: 90, w: 300, h: 220, z: 2, src: 'https://images.unsplash.com/photo-1508361001413-7a9dca21d08a?w=900&q=70' },
        { id: 'e3', kind: 'note', x: 430, y: 340, w: 260, h: 170, z: 3, color: '#e8dfd0', text: 'Victorian undertaker meets noir detective. Tall, narrow, unhurried.' },
        { id: 'e4', kind: 'note', x: 760, y: 90, w: 220, h: 150, z: 4, color: '#f07a3a', text: 'Signature: ring of brass keys + sealed wax letter' },
        { id: 'e5', kind: 'swatch', x: 760, y: 280, w: 110, h: 110, z: 5, color: '#3d1a2e' },
        { id: 'e6', kind: 'swatch', x: 880, y: 280, w: 110, h: 110, z: 6, color: '#b08d57' },
      ],
      tasks: [
        { id: 't1', title: 'Long black wool coat', kind: 'buy', column: 'done', priority: 'high', due: d(-2), est: 60, actual: 48, link: 'https://www.ebay.com/sch/i.html?_nkw=victorian+coat', createdAt: t },
        { id: 't2', title: 'Bone-cream ascot', kind: 'buy', column: 'todo', priority: 'med', due: d(3), est: 18, createdAt: t },
        { id: 't3', title: 'Brass key cluster prop', kind: 'make', column: 'doing', priority: 'high', due: d(6), est: 12, actual: 7, notes: 'Thrift keys + jump rings', createdAt: t },
        { id: 't4', title: 'Wax-sealed letter', kind: 'make', column: 'todo', priority: 'low', due: d(12), est: 8, createdAt: t },
        { id: 't5', title: 'Makeup trial: hollow cheeks', kind: 'make', column: 'todo', priority: 'med', due: d(20), createdAt: t },
      ],
      brainstorm: { character: 'Keeper of the town\'s forgotten keys, polite and very tired.' },
      createdAt: t, updatedAt: t,
    },
    {
      id: 'seed-patroness', name: 'Pumpkin Patroness', status: 'planning', demo: true,
      eventName: 'Costume party', eventDate: d(18), budget: 120,
      palette: ['#2a1608', '#7a2e12', '#f07a3a', '#e3b04b', '#e8dfd0'],
      elements: [
        { id: 'p1', kind: 'image', x: 80, y: 80, w: 320, h: 400, z: 1, src: 'https://images.unsplash.com/photo-1506917728037-b6af01a7d403?w=900&q=70' },
        { id: 'p2', kind: 'note', x: 430, y: 80, w: 260, h: 160, z: 2, color: '#e3b04b', text: 'Harvest spirit — elegant, not cartoon. Crown of dried leaves.' },
        { id: 'p3', kind: 'swatch', x: 430, y: 270, w: 110, h: 110, z: 3, color: '#7a2e12' },
        { id: 'p4', kind: 'swatch', x: 550, y: 270, w: 110, h: 110, z: 4, color: '#f07a3a' },
      ],
      tasks: [
        { id: 'q1', title: 'Wine velvet wrap dress', kind: 'buy', column: 'todo', priority: 'high', due: d(4), est: 55, createdAt: t },
        { id: 'q2', title: 'Dried leaf crown', kind: 'make', column: 'todo', priority: 'med', due: d(10), est: 15, createdAt: t },
        { id: 'q3', title: 'Warm LED collar glow', kind: 'make', column: 'todo', priority: 'low', est: 20, createdAt: t },
      ],
      brainstorm: {}, createdAt: t, updatedAt: t,
    },
  ]
}
