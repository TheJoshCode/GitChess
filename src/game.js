import { createGame, deleteGame, joinGame, leaveGame, appendMove, getGame } from './git.js'

export function makeGame({ peerId, onStatus, onMoves, send }) {
  let gameId = null

  function refresh() {
    const g = gameId ? getGame(gameId) : null
    if (g) onMoves?.(g.moves)
  }

  return {
    create(id) {
      gameId = id
      createGame(id)
      joinGame(id, peerId)
      onStatus?.(`Created ${id}`)
      refresh()
    },
    join(id) {
      gameId = id
      joinGame(id, peerId)
      onStatus?.(`Joined ${id}`)
      refresh()
    },
    leave() {
      if (!gameId) return
      leaveGame(gameId, peerId)
      onStatus?.(`Left ${gameId}`)
      gameId = null
    },
    remove() {
      if (!gameId) return
      deleteGame(gameId)
      onStatus?.(`Deleted ${gameId}`)
      gameId = null
    },
    move(move) {
      if (!gameId) return
      const payload = { type: 'move', gameId, move, at: Date.now(), from: peerId }
      appendMove(gameId, payload)
      send?.(payload)
      refresh()
    },
    ingest(payload) {
      if (!payload || payload.type !== 'move') return
      if (payload.gameId !== gameId) return
      appendMove(gameId, payload)
      refresh()
    },
    sync() {
      refresh()
    }
  }
}