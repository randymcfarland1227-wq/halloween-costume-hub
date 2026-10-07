import type { TaskKind } from './types'

export interface Prompt { key: string; title: string; q: string; hint: string; task?: TaskKind }
export const PROMPTS: Prompt[] = [
  { key: 'character', title: 'Character', q: 'Who are you, in one sentence? What\'s their story tonight?', hint: 'A retired vampire who now runs a night bakery…' },
  { key: 'silhouette', title: 'Silhouette', q: 'What shape should people read from across a dark room?', hint: 'Tall + narrow, huge collar, cape that sweeps…' },
  { key: 'signature', title: 'Signature pieces', q: 'Which 2–3 pieces make it unmistakable?', hint: 'Crown of keys, cracked porcelain mask…', task: 'make' },
  { key: 'colors', title: 'Colors', q: 'What\'s the color story? Dominant, accent, and a surprise.', hint: 'Wine + bone, with one hit of pumpkin' },
  { key: 'materials', title: 'Materials', q: 'Which textures and materials sell it up close?', hint: 'Crushed velvet, aged lace, matte leather…', task: 'buy' },
  { key: 'makeup', title: 'Makeup & hair', q: 'What does the face and hair do?', hint: 'Hollow cheeks, gilded lips, slicked wet look' },
  { key: 'props', title: 'Props', q: 'What do you carry or interact with all night?', hint: 'Lantern, ledger, a single dead rose', task: 'make' },
  { key: 'twist', title: 'Group / couple twist', q: 'How could a partner or group riff on it?', hint: 'Partner is the ghost you\'re haunting…' },
  { key: 'comfort', title: 'Comfort & weather', q: 'Can you sit, eat, dance, and survive 45°F rain in it?', hint: 'Layer a thermal under; flats in a bag' },
  { key: 'budget', title: 'Budget level', q: 'Thrift-scrappy, mid, or go-all-out? What\'s worth the splurge?', hint: 'Splurge on the coat, thrift everything else' },
]

export const SPARKS: string[] = [
  'Make it Victorian.', 'Set it 300 years in the future.', 'Gender-swap the classic version.',
  'Make it a ghost of itself — all washed out.', 'Turn it into a wedding look.', 'Add a single glowing element.',
  'Do it entirely in one color.', 'What if it were a 1970s horror poster?', 'Combine it with a breakfast food.',
  'It\'s the villain\'s version.', 'Make it a noir detective case.', 'Add a prop that tells a joke.',
  'Ruin it: water damage, moss, dust.', 'Make it couture runway, not costume store.', 'Make it look hand-stitched by a witch.',
  'Bring a tiny sidekick (plush, puppet, pet).', 'Swap all fabric for paper or cardboard.', 'Add a mask that reveals a second face.',
  'Make it a retired version — 40 years later.', 'Mash it up with your actual job.', 'Theater-ize it: exaggerate proportions 30%.',
  'What would a medieval painting of it look like?', 'Add a backstory sign or name tag.', 'Use only thrift-store finds.',
  'Make it a cozy-knit version.', 'Add a working light-up candle or lantern.', 'Make it half-transformed.',
  'Turn it into a vintage circus act.', 'Make the hair the main event.', 'Add a scent (clove, smoke, roses).',
  'Pair it with a terrible pun.', 'Pretend it\'s a Wes Anderson film.', 'Make it botanical — vines, moss, mushrooms.',
  'Give it a skeleton underlayer.', 'Make it a royal portrait.', 'Pick one texture and overdo it.',
]

export const PALETTES: { name: string; colors: string[] }[] = [
  { name: 'Crypt', colors: ['#0b0a0f', '#3d1a2e', '#6b2d4a', '#e8dfd0', '#b08d57'] },
  { name: 'Harvest', colors: ['#2a1608', '#7a2e12', '#f07a3a', '#e3b04b', '#e8dfd0'] },
  { name: 'Blood moon', colors: ['#120607', '#4a0d14', '#9b1b2a', '#d9a28c', '#f2e4d3'] },
  { name: 'Witch hour', colors: ['#0d1013', '#233128', '#4b6b4f', '#a7b48a', '#e9e4d4'] },
  { name: 'Bone yard', colors: ['#1a1816', '#4a453e', '#8c8273', '#cfc4b0', '#f4efe4'] },
  { name: 'Toxic bog', colors: ['#0b0f0a', '#1f3b1a', '#5c8a2a', '#c6e04a', '#2b1a33'] },
]
