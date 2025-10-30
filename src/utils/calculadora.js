

// FILE: src/utils/calculadora.js
export function calcularValores(inputs) {
const pricePerOz = Number(inputs.pricePerOz) || 0
const exchangeRate = Number(inputs.exchangeRate) || 0
const purity = Number(inputs.purity) || 0
const grams = Number(inputs.grams) || 0
const discount = Number(inputs.discountPercentage) || 0


const GRAMS_PER_OUNCE = 31.1034768


let pricePerGramUSD = 0
if (inputs.tipoVenta === '1' && pricePerOz > 0 && purity > 0) {
pricePerGramUSD = (pricePerOz * purity) / GRAMS_PER_OUNCE
} else if (pricePerOz > 0) {
pricePerGramUSD = pricePerOz / GRAMS_PER_OUNCE
}


if (discount > 0) {
pricePerGramUSD = pricePerGramUSD * (1 - discount / 100)
}


const pricePerGramPEN = pricePerGramUSD * (exchangeRate || 1)
const totalUSD = pricePerGramUSD * grams
const totalPEN = pricePerGramPEN * grams
const valido = pricePerGramUSD > 0 && grams > 0


return { pricePerGramUSD, pricePerGramPEN, totalUSD, totalPEN, valido }
}