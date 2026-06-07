// Maps the backend platform keys to display labels and badge styling.

export const PLATFORMS = [
  { value: 'google', label: 'Google Ads', dot: '#5b8def' },
  { value: 'meta', label: 'Meta', dot: '#4f8cff' },
  { value: 'instagram', label: 'Instagram', dot: '#e1568f' },
  { value: 'tiktok', label: 'TikTok', dot: '#22d3c5' },
  { value: 'pinterest', label: 'Pinterest', dot: '#e8584e' },
]

const BY_VALUE = Object.fromEntries(PLATFORMS.map((p) => [p.value, p]))

export function platformMeta(value) {
  return BY_VALUE[value] || { value, label: value, dot: '#6b7280' }
}
