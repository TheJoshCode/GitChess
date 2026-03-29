const CHANNEL = 'gitchess'
let pc = null
let dc = null

export function makePeer(onMessage, onState) {
  pc = new RTCPeerConnection({
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
  })

  pc.oniceconnectionstatechange = () => onState?.(pc.iceConnectionState)
  pc.ondatachannel = e => setupChannel(e.channel, onMessage)
  pc.onconnectionstatechange = () => onState?.(pc.connectionState)
  return pc
}

function setupChannel(channel, onMessage) {
  dc = channel
  dc.onopen = () => {}
  dc.onmessage = e => onMessage?.(JSON.parse(e.data))
}

export function createDataChannel() {
  const channel = pc.createDataChannel(CHANNEL)
  setupChannel(channel)
  return channel
}

export async function makeOffer() {
  const offer = await pc.createOffer()
  await pc.setLocalDescription(offer)
  return JSON.stringify(offer)
}

export async function acceptOffer(sdp) {
  await pc.setRemoteDescription(JSON.parse(sdp))
  const answer = await pc.createAnswer()
  await pc.setLocalDescription(answer)
  return JSON.stringify(answer)
}

export async function acceptAnswer(sdp) {
  await pc.setRemoteDescription(JSON.parse(sdp))
}

export async function addIce(candidate) {
  if (!candidate) return
  await pc.addIceCandidate(candidate)
}

export function send(msg) {
  if (dc && dc.readyState === 'open') dc.send(JSON.stringify(msg))
}

export function closePeer() {
  if (dc) dc.close()
  if (pc) pc.close()
  dc = null
  pc = null
}