const KEY = 'gitchess.games'

function read() {
  return JSON.parse(localStorage.getItem(KEY) || '{}')
}

function write(data) {
  localStorage.setItem(KEY, JSON.stringify(data))
}

export function listGames() {
  return Object.values(read())
}

export function createGame(id) {
  const db = read()
  db[id] = { id, players: [], moves: [], updatedAt: Date.now() }
  write(db)
  return db[id]
}

export function deleteGame(id) {
  const db = read()
  delete db[id]
  write(db)
}

export function joinGame(id, peerId) {
  const db = read()
  const g = db[id] || createGame(id)
  if (!g.players.includes(peerId)) g.players.push(peerId)
  g.updatedAt = Date.now()
  db[id] = g
  write(db)
  return g
}

export function leaveGame(id, peerId) {
  const db = read()
  const g = db[id]
  if (!g) return
  g.players = g.players.filter(p => p !== peerId)
  g.updatedAt = Date.now()
  db[id] = g
  write(db)
}

export function appendMove(id, move) {
  const db = read()
  const g = db[id]
  if (!g) return
  g.moves.push(move)
  g.updatedAt = Date.now()
  db[id] = g
  write(db)
}

export function getGame(id) {
  return read()[id] || null
} 