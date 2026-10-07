import { v4 as uuid } from 'uuid'
import type { Costume } from './types'

const now = () => new Date().toISOString()

export function createSeedCostumes(): Costume[] {
  const t = now()
  return [
    {
      id: uuid(),
      name: 'Midnight Cryptkeeper',
      status: 'shopping',
      ideas:
        '• Victorian undertaker meets noir detective\n• Tall silhouette, bone-cream collar, plum-lined cape\n• Soft candlelight makeup — not gore\n• Carry a brass key ring and a sealed letter',
      inspiration: [
        {
          id: uuid(),
          title: 'Victorian mourning coat reference',
          url: 'https://www.pinterest.com/search/pins/?q=victorian%20mourning%20coat',
          notes: 'Look for high collar + asymmetrical buttons',
          createdAt: t,
        },
        {
          id: uuid(),
          title: 'Candlelit portrait mood',
          imageUrl:
            'https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=600&q=80',
          notes: 'Warm orange rim light against deep plum shadows',
          createdAt: t,
        },
      ],
      items: [
        {
          id: uuid(),
          label: 'Long black coat / cape',
          type: 'buy',
          notes: 'Thrift first — look for wool blend',
          done: true,
          createdAt: t,
        },
        {
          id: uuid(),
          label: 'Bone-cream ascot or collar',
          type: 'buy',
          done: false,
          createdAt: t,
        },
        {
          id: uuid(),
          label: 'Brass key prop cluster',
          type: 'make',
          notes: 'Hot-glue thrift keys onto a ring',
          done: false,
          createdAt: t,
        },
        {
          id: uuid(),
          label: 'Sealed wax letter',
          type: 'make',
          done: true,
          createdAt: t,
        },
      ],
      createdAt: t,
      updatedAt: t,
    },
    {
      id: uuid(),
      name: 'Pumpkin Patroness',
      status: 'planning',
      ideas:
        '• Elegant harvest spirit, not cartoon jack-o’-lantern\n• Burnt orange silk + deep wine velvet\n• Crown of dried leaves and tiny gourds\n• Soft glow from a hidden LED under the collar',
      inspiration: [
        {
          id: uuid(),
          title: 'Harvest editorial lookbook',
          url: 'https://www.pinterest.com/search/pins/?q=halloween%20editorial%20fashion',
          notes: 'Editorial, theatrical — skip the plastic pumpkin',
          createdAt: t,
        },
      ],
      items: [
        {
          id: uuid(),
          label: 'Wine velvet wrap or dress',
          type: 'buy',
          done: false,
          createdAt: t,
        },
        {
          id: uuid(),
          label: 'Dried leaf crown',
          type: 'make',
          notes: 'Wire base + florist tape',
          done: false,
          createdAt: t,
        },
        {
          id: uuid(),
          label: 'Warm LED collar glow',
          type: 'make',
          done: false,
          createdAt: t,
        },
      ],
      createdAt: t,
      updatedAt: t,
    },
  ]
}
