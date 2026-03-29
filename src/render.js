import * as THREE from 'three'
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js'

export async function createScene(canvas) {
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x0b0f14)

  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000)
  camera.position.set(0, 10, 12)
  camera.lookAt(0, 0, 0)

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
  renderer.setPixelRatio(devicePixelRatio)

  const hemi = new THREE.HemisphereLight(0xffffff, 0x202020, 1.8)
  scene.add(hemi)

  const dir = new THREE.DirectionalLight(0xffffff, 2)
  dir.position.set(5, 10, 6)
  scene.add(dir)

  const loader = new FBXLoader()
  const load = url => new Promise((resolve, reject) => loader.load(url, resolve, undefined, reject))

  const board = await load('./chessboard.fbx')
  board.scale.setScalar(0.01)
  scene.add(board)

  const sky = await loadTexture('./studio_skybox.jpg')
  scene.environment = sky

  const piecesRoot = await load('./chesspieces.fbx').catch(() => null)
  if (piecesRoot) {
    piecesRoot.scale.setScalar(0.01)
    scene.add(piecesRoot)
  }

  for (const file of ['king.fbx', 'queen.fbx', 'rook.fbx', 'bishop.fbx', 'knight.fbx', 'pawn.fbx']) {
    const mesh = await load(`./${file}`).catch(() => null)
    if (mesh) {
      mesh.scale.setScalar(0.01)
      mesh.position.y = 0.02
      scene.add(mesh)
    }
  }

  function resize() {
    const w = canvas.clientWidth || window.innerWidth
    const h = canvas.clientHeight || window.innerHeight
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
  }

  window.addEventListener('resize', resize)
  resize()

  function tick() {
    renderer.render(scene, camera)
    requestAnimationFrame(tick)
  }
  tick()

  return { scene, camera, renderer }
}

async function loadTexture(url) {
  const img = new Image()
  img.src = url
  await img.decode()
  const tex = new THREE.Texture(img)
  tex.needsUpdate = true
  return tex
}