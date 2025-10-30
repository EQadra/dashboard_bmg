

// FILE: src/utils/format.js
export function formatNumber(n) {
if (!isFinite(n)) return '0'
return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}