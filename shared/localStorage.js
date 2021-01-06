const KEYS = {
  SERVERS: 'DISCORD_SERVERS',
}

const setArray = (key, _arr) => {
  const arr = Array.isArray(_arr) ? _arr : []
  localStorage.setItem(key, JSON.stringify(arr))
}

const getArray = (key) => {
  let arr = []

  try {
    const val = localStorage.getItem(key)
    const _arr = JSON.parse(val)
    if (Array.isArray(_arr)) arr = _arr
  } catch (e) {}

  return arr
}

module.exports = {
  setArray,
  getArray,
  KEYS,
}
