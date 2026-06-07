// Display helpers shared across the dashboard.

export function money(value, decimals = 0) {
  const n = Number(value) || 0
  return `$${n.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`
}

export function compactNumber(value) {
  const n = Number(value) || 0
  return n.toLocaleString('en-US')
}

export function percent(value) {
  const n = Number(value) || 0
  return `${n.toFixed(2)}%`
}

export function roasLabel(value) {
  const n = Number(value) || 0
  return `${n.toFixed(2)}×`
}

// ROAS colour tone for table badges: green / amber / red.
export function roasTone(value) {
  const n = Number(value) || 0
  if (n >= 3) return 'good'
  if (n >= 1.5) return 'warn'
  return 'bad'
}

// Bar colour for the chart: green for strong, violet for mid, red for weak.
export function roasBarColor(value) {
  const n = Number(value) || 0
  if (n >= 3) return '#34d399'
  if (n >= 1) return '#8b5cf6'
  return '#f06262'
}
