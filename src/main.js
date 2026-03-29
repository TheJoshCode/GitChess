import './styles.css'
import { createScene } from './render.js'
import { makePeer, createDataChannel, makeOffer, acceptOffer, acceptAnswer, send, closePeer } from './net.js'
import { makeGame } from './game.js'

async function boot() {
  const canvas = document.querySelector('#c')
  const statusEl = document.querySelector('#status')
  const movesEl = document.querySelector('#moves')
  const gameIdEl = document.querySelector('#gameId')

  const peerId = crypto.randomUUID().slice(0, 8)

  function setStatus(s) {
    statusEl.textContent = `${s} • peer ${peerId}`
  }

  function renderMoves(moves) {
    movesEl.textContent = moves.map(m => `${new Date(m.at).toLocaleTimeString()} ${m.move}`).join('\n')
  }

  await createScene(canvas)

  const game = makeGame({
    peerId,
    onStatus: setStatus,
    onMoves: renderMoves,
    send: msg => send(msg)
  })

  makePeer(
    msg => game.ingest(msg),
    state => setStatus(state)
  )

  document.querySelector('#createBtn').onclick = async () => {
    const id = gameIdEl.value.trim() || crypto.randomUUID().slice(0, 6)
    game.create(id)
    createDataChannel()
    const offer = await makeOffer()
    location.hash = `#game=${encodeURIComponent(id)}&offer=${encodeURIComponent(offer)}`
    setStatus(`Offer ready for ${id}`)
  }

  document.querySelector('#joinBtn').onclick = async () => {
    const id = gameIdEl.value.trim()
    const params = new URLSearchParams(location.hash.slice(1))
    const offer = params.get('offer')
    if (!id || !offer) return setStatus('Need game id and offer in hash')
    game.join(id)
    const answer = await acceptOffer(offer)
    location.hash = `#game=${encodeURIComponent(id)}&answer=${encodeURIComponent(answer)}`
    setStatus(`Answer ready for ${id}`)
  }

  document.querySelector('#leaveBtn').onclick = () => {
    game.leave()
    closePeer()
  }

  document.querySelector('#syncBtn').onclick = () => game.sync()

  window.addEventListener('hashchange', async () => {
    const params = new URLSearchParams(location.hash.slice(1))
    const answer = params.get('answer')
    if (answer) await acceptAnswer(answer)
  })

  setStatus('Ready')
}

boot().catch(err => {
  const statusEl = document.querySelector('#status')
  if (statusEl) statusEl.textContent = `Boot failed: ${err.message}`
  console.error(err)
})