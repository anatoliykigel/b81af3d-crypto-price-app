const defaultPrecision = 4

const helper_numberToLocaleString = (value, precision = defaultPrecision) =>
  value.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: precision
  })

const helper_nFormatter = (value) => {
  if (value >= 1_000_000)
    return Number.parseFloat((value / 1_000_000).toFixed(1)).toLocaleString() + 'M'

  if (value >= 1_000) return Number.parseFloat((value / 1_000).toFixed(1)).toLocaleString() + 'K'
  console.log(value, typeof value)
  return helper_numberToLocaleString(value)
}

export { helper_nFormatter, helper_numberToLocaleString }
