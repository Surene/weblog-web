<template>
  <div class="home-canvas" :class="{ 'reduced-motion': reducedMotion }">
    <canvas ref="canvas" @click="onCanvasClick"></canvas>
    <div class="home-overlay">
      <div class="pet-names">
        <span class="cat-name" @click.stop="interactCat">太阳</span>
        <span class="and">&</span>
        <span class="dog-name" @click.stop="interactDog">麻花</span>
      </div>
      <router-link to="/blog" class="home-enter">进入博客</router-link>
      <div class="controls">
        <button class="toggle-btn" @click.stop="reducedMotion = !reducedMotion">
          {{ reducedMotion ? '开启动画' : '减弱动画' }}
        </button>
      </div>
      <p class="hint">轻抚宠物 · 移动鼠标产生视差</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const canvas = ref(null)
const reducedMotion = ref(false)

let ctx, width, height, dpr
let animationId
let mouse = { x: 0, y: 0 }
let time = 0

const isMobile = ref(false)

// Scene objects
let particles = []
let notes = []
let stars = []
let zzzs = []
let catState = { blink: 0, tail: 0, purr: 0 }
let dogState = { blink: 0, tail: 0, happy: 0 }
let controllerGlow = 0

onMounted(() => {
  isMobile.value = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    reducedMotion.value = true
  }
  initCanvas()
  window.addEventListener('resize', onResize)
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('touchmove', onTouchMove, { passive: true })
})

onUnmounted(() => {
  cancelAnimationFrame(animationId)
  window.removeEventListener('resize', onResize)
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('touchmove', onTouchMove)
})

function initCanvas() {
  const el = canvas.value
  ctx = el.getContext('2d')
  dpr = Math.min(window.devicePixelRatio || 1, isMobile.value ? 1 : 2)
  resize()
  resetScene()
  animate()
}

function resize() {
  width = window.innerWidth
  height = window.innerHeight
  const el = canvas.value
  el.width = width * dpr
  el.height = height * dpr
  el.style.width = width + 'px'
  el.style.height = height + 'px'
  ctx.scale(dpr, dpr)
}

function onResize() {
  resize()
  resetScene()
}

function onMouseMove(e) {
  mouse.x = (e.clientX / width - 0.5) * 2
  mouse.y = (e.clientY / height - 0.5) * 2
}

function onTouchMove(e) {
  if (e.touches.length) {
    mouse.x = (e.touches[0].clientX / width - 0.5) * 2
    mouse.y = (e.touches[0].clientY / height - 0.5) * 2
  }
}

function resetScene() {
  particles = []
  notes = []
  stars = []
  zzzs = []

  const particleCount = isMobile.value || reducedMotion.value ? 12 : 30
  for (let i = 0; i < particleCount; i++) {
    particles.push(createParticle())
  }

  const noteCount = isMobile.value || reducedMotion.value ? 2 : 5
  for (let i = 0; i < noteCount; i++) {
    notes.push(createNote())
  }

  const starCount = isMobile.value || reducedMotion.value ? 15 : 40
  for (let i = 0; i < starCount; i++) {
    stars.push(createStar())
  }
}

function createParticle() {
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    r: Math.random() * 2 + 0.5,
    vx: (Math.random() - 0.5) * 0.3,
    vy: (Math.random() - 0.5) * 0.3,
    alpha: Math.random() * 0.4 + 0.1
  }
}

function createNote() {
  return {
    x: Math.random() * width,
    y: height * 0.3 + Math.random() * height * 0.4,
    size: 12 + Math.random() * 10,
    vx: 0.2 + Math.random() * 0.4,
    vy: -0.3 - Math.random() * 0.3,
    alpha: 0,
    phase: Math.random() * Math.PI * 2
  }
}

function createStar() {
  return {
    x: Math.random() * width,
    y: Math.random() * height * 0.55,
    r: Math.random() * 1.5 + 0.3,
    twinkle: Math.random() * Math.PI * 2
  }
}

function createZzz(x, y) {
  zzzs.push({ x, y, size: 10, alpha: 1, vy: -0.5 })
}

function animate() {
  time += 0.016
  ctx.clearRect(0, 0, width, height)

  drawSky()
  drawRoom()
  drawWindow()
  drawDesk()
  drawMonitor()
  drawController()
  drawCat()
  drawDog()
  drawMusicNotes()
  drawParticles()
  drawZzzs()

  if (!reducedMotion.value) {
    updateNotes()
    updateParticles()
    updateZzzs()
    controllerGlow = Math.sin(time * 2) * 0.3 + 0.7
  } else {
    controllerGlow = 0.5
  }

  animationId = requestAnimationFrame(animate)
}

// ==================== DRAWING HELPERS ====================

function drawSky() {
  const gradient = ctx.createLinearGradient(0, 0, 0, height)
  gradient.addColorStop(0, '#1a1f3c')
  gradient.addColorStop(0.55, '#2d3455')
  gradient.addColorStop(0.55, '#3e4a6b')
  gradient.addColorStop(1, '#4a5a7a')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)

  // Moon
  const moonX = width * 0.82 + mouse.x * 8
  const moonY = height * 0.15 + mouse.y * 6
  ctx.save()
  ctx.shadowBlur = 30
  ctx.shadowColor = 'rgba(255, 248, 220, 0.4)'
  ctx.fillStyle = '#fff8dc'
  ctx.beginPath()
  ctx.arc(moonX, moonY, 28, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

function drawRoom() {
  // Floor
  const floorY = height * 0.55
  const floorGradient = ctx.createLinearGradient(0, floorY, 0, height)
  floorGradient.addColorStop(0, '#5c4a3d')
  floorGradient.addColorStop(1, '#3d2f27')
  ctx.fillStyle = floorGradient
  ctx.fillRect(0, floorY, width, height - floorY)

  // Floor boards
  ctx.strokeStyle = 'rgba(0,0,0,0.1)'
  ctx.lineWidth = 1
  for (let i = 0; i < width; i += 80) {
    ctx.beginPath()
    ctx.moveTo(i, floorY)
    ctx.lineTo(i + (width * 0.08), height)
    ctx.stroke()
  }

  // Back wall subtle parallax
  const px = mouse.x * 12
  const py = mouse.y * 8

  // Rug
  ctx.save()
  ctx.translate(width * 0.5 + px * 0.3, height * 0.78 + py * 0.2)
  ctx.fillStyle = '#7a9a8a'
  ctx.beginPath()
  ctx.ellipse(0, 0, width * 0.32, height * 0.12, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = 'rgba(255,255,255,0.15)'
  ctx.lineWidth = 3
  ctx.stroke()
  ctx.restore()
}

function drawWindow() {
  const px = mouse.x * 18
  const py = mouse.y * 12
  const wx = width * 0.15 + px
  const wy = height * 0.12 + py
  const ww = Math.min(width * 0.35, 320)
  const wh = Math.min(height * 0.38, 260)

  // Window frame
  ctx.save()
  ctx.fillStyle = '#1e2438'
  ctx.fillRect(wx - 8, wy - 8, ww + 16, wh + 16)

  // Night sky inside window
  const skyG = ctx.createLinearGradient(wx, wy, wx, wy + wh)
  skyG.addColorStop(0, '#0d1b2a')
  skyG.addColorStop(1, '#1b263b')
  ctx.fillStyle = skyG
  ctx.fillRect(wx, wy, ww, wh)

  // Stars in window
  ctx.fillStyle = '#ffffff'
  for (const s of stars) {
    const twinkle = Math.sin(time * 2 + s.twinkle) * 0.5 + 0.5
    ctx.globalAlpha = twinkle * 0.8
    ctx.beginPath()
    ctx.arc(wx + s.x * (ww / width), wy + s.y * (wh / (height * 0.55)), s.r, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1

  // Window crossbars
  ctx.strokeStyle = '#2a314a'
  ctx.lineWidth = 6
  ctx.beginPath()
  ctx.moveTo(wx + ww / 2, wy)
  ctx.lineTo(wx + ww / 2, wy + wh)
  ctx.moveTo(wx, wy + wh / 2)
  ctx.lineTo(wx + ww, wy + wh / 2)
  ctx.stroke()

  // Window sill
  ctx.fillStyle = '#3d455e'
  ctx.fillRect(wx - 12, wy + wh, ww + 24, 10)
  ctx.restore()
}

function drawDesk() {
  const px = mouse.x * 10
  const py = mouse.y * 6
  const dx = width * 0.62 + px
  const dy = height * 0.62 + py
  const dw = Math.min(width * 0.3, 280)
  const dh = height * 0.18

  // Desk legs
  ctx.fillStyle = '#4a3b2f'
  ctx.fillRect(dx - dw * 0.42, dy + dh * 0.3, 12, dh * 0.7)
  ctx.fillRect(dx + dw * 0.42 - 12, dy + dh * 0.3, 12, dh * 0.7)

  // Desk top
  ctx.fillStyle = '#6b5544'
  ctx.beginPath()
  ctx.moveTo(dx - dw / 2, dy)
  ctx.lineTo(dx + dw / 2, dy)
  ctx.lineTo(dx + dw / 2 - 10, dy + dh * 0.3)
  ctx.lineTo(dx - dw / 2 + 10, dy + dh * 0.3)
  ctx.closePath()
  ctx.fill()
}

function drawMonitor() {
  const px = mouse.x * 10
  const py = mouse.y * 6
  const mx = width * 0.62 + px
  const my = height * 0.52 + py
  const mw = Math.min(width * 0.16, 150)
  const mh = mw * 0.6

  // Stand
  ctx.fillStyle = '#2a2a2a'
  ctx.fillRect(mx - 6, my + mh, 12, 18)
  ctx.fillRect(mx - 20, my + mh + 16, 40, 6)

  // Screen bezel
  ctx.fillStyle = '#1a1a1a'
  ctx.fillRect(mx - mw / 2 - 4, my - 4, mw + 8, mh + 8)

  // Screen glow
  ctx.save()
  ctx.shadowBlur = 20
  ctx.shadowColor = 'rgba(100, 150, 255, 0.3)'
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(mx - mw / 2, my, mw, mh)
  ctx.restore()

  // Code lines on screen
  ctx.fillStyle = '#7dd3fc'
  for (let i = 0; i < 5; i++) {
    const lineWidth = mw * (0.5 + Math.random() * 0.4)
    ctx.fillRect(mx - mw / 2 + 8, my + 10 + i * 14, lineWidth, 3)
  }
}

function drawController() {
  const px = mouse.x * 10
  const py = mouse.y * 6
  const cx = width * 0.72 + px
  const cy = height * 0.6 + py
  const size = Math.min(width * 0.06, 50)

  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(0.2)

  // Glow
  if (!reducedMotion.value) {
    ctx.shadowBlur = 15 + controllerGlow * 10
    ctx.shadowColor = `rgba(255, 100, 150, ${0.2 + controllerGlow * 0.3})`
  }

  // Body
  ctx.fillStyle = '#2d2d3a'
  ctx.beginPath()
  ctx.roundRect(-size, -size * 0.35, size * 2, size * 0.7, size * 0.2)
  ctx.fill()

  // D-pad
  ctx.fillStyle = '#4a4a5c'
  ctx.fillRect(-size * 0.6, -size * 0.12, size * 0.35, size * 0.08)
  ctx.fillRect(-size * 0.46, -size * 0.22, size * 0.08, size * 0.28)

  // Buttons
  ctx.fillStyle = '#ff6b7a'
  ctx.beginPath()
  ctx.arc(size * 0.45, -size * 0.05, size * 0.08, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#6bc5ff'
  ctx.beginPath()
  ctx.arc(size * 0.3, -size * 0.18, size * 0.06, 0, Math.PI * 2)
  ctx.fill()

  ctx.restore()
}

function drawCat() {
  const px = mouse.x * 14
  const py = mouse.y * 10
  const cx = width * 0.35 + px
  const cy = height * 0.72 + py
  const scale = Math.min(width * 0.0005, 0.65)

  ctx.save()
  ctx.translate(cx, cy)
  ctx.scale(scale, scale)

  // Cat bed
  ctx.fillStyle = '#d4a373'
  ctx.beginPath()
  ctx.ellipse(0, 35, 90, 35, 0, 0, Math.PI * 2)
  ctx.fill()

  // Body (curled sleeping)
  ctx.fillStyle = '#e8983e'
  ctx.beginPath()
  ctx.ellipse(0, 0, 55, 40, 0, 0, Math.PI * 2)
  ctx.fill()

  // Belly
  ctx.fillStyle = '#fff5e6'
  ctx.beginPath()
  ctx.ellipse(5, 5, 35, 25, 0, 0, Math.PI * 2)
  ctx.fill()

  // Head
  ctx.fillStyle = '#e8983e'
  ctx.beginPath()
  ctx.arc(-35, -20, 32, 0, Math.PI * 2)
  ctx.fill()

  // Ears
  ctx.fillStyle = '#c87020'
  ctx.beginPath()
  ctx.moveTo(-55, -42)
  ctx.lineTo(-45, -75)
  ctx.lineTo(-25, -48)
  ctx.closePath()
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(-15, -48)
  ctx.lineTo(-5, -78)
  ctx.lineTo(5, -45)
  ctx.closePath()
  ctx.fill()

  // Eyes (closed or blink)
  ctx.strokeStyle = '#553311'
  ctx.lineWidth = 3
  ctx.lineCap = 'round'
  if (catState.blink > 0) {
    ctx.beginPath()
    ctx.arc(-45, -22, 4, 0, Math.PI * 2)
    ctx.arc(-25, -22, 4, 0, Math.PI * 2)
    ctx.fill()
  } else {
    ctx.beginPath()
    ctx.moveTo(-50, -22)
    ctx.quadraticCurveTo(-45, -16, -40, -22)
    ctx.moveTo(-30, -22)
    ctx.quadraticCurveTo(-25, -16, -20, -22)
    ctx.stroke()
  }

  // Nose
  ctx.fillStyle = '#ff9999'
  ctx.beginPath()
  ctx.arc(-35, -12, 4, 0, Math.PI * 2)
  ctx.fill()

  // Tail with subtle wag
  const tailAngle = Math.sin(time * 2 + catState.tail) * 0.15
  ctx.fillStyle = '#e8983e'
  ctx.beginPath()
  ctx.ellipse(55 + tailAngle * 20, 0, 25, 12, tailAngle, 0, Math.PI * 2)
  ctx.fill()

  ctx.restore()
}

function drawDog() {
  const px = mouse.x * 12
  const py = mouse.y * 8
  const cx = width * 0.58 + px
  const cy = height * 0.75 + py
  const scale = Math.min(width * 0.00055, 0.7)

  ctx.save()
  ctx.translate(cx, cy)
  ctx.scale(scale, scale)

  // Dog bed
  ctx.fillStyle = '#8fa8b8'
  ctx.beginPath()
  ctx.ellipse(0, 30, 95, 38, 0, 0, Math.PI * 2)
  ctx.fill()

  // Body (lying down)
  ctx.fillStyle = '#e8a850'
  ctx.beginPath()
  ctx.ellipse(0, 0, 60, 35, 0, 0, Math.PI * 2)
  ctx.fill()

  // Belly
  ctx.fillStyle = '#fdf5e6'
  ctx.beginPath()
  ctx.ellipse(0, 5, 40, 22, 0, 0, Math.PI * 2)
  ctx.fill()

  // Head
  ctx.fillStyle = '#e8a850'
  ctx.beginPath()
  ctx.arc(45, -20, 32, 0, Math.PI * 2)
  ctx.fill()

  // Ears
  ctx.fillStyle = '#c07830'
  ctx.beginPath()
  ctx.moveTo(25, -45)
  ctx.lineTo(35, -85)
  ctx.lineTo(55, -50)
  ctx.closePath()
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(60, -50)
  ctx.lineTo(75, -88)
  ctx.lineTo(85, -48)
  ctx.closePath()
  ctx.fill()

  // Snout
  ctx.fillStyle = '#fdf5e6'
  ctx.beginPath()
  ctx.ellipse(55, -5, 16, 12, 0, 0, Math.PI * 2)
  ctx.fill()

  // Nose
  ctx.fillStyle = '#222'
  ctx.beginPath()
  ctx.arc(62, -10, 5, 0, Math.PI * 2)
  ctx.fill()

  // Eyes
  ctx.fillStyle = '#553311'
  if (dogState.blink > 0) {
    ctx.beginPath()
    ctx.arc(40, -28, 4, 0, Math.PI * 2)
    ctx.arc(60, -28, 4, 0, Math.PI * 2)
    ctx.fill()
  } else {
    ctx.beginPath()
    ctx.arc(40, -30, 4, 0, Math.PI * 2)
    ctx.arc(60, -30, 4, 0, Math.PI * 2)
    ctx.fill()
  }

  // Tail
  const tailWag = Math.sin(time * 6 + dogState.tail) * 0.25
  ctx.fillStyle = '#c07830'
  ctx.save()
  ctx.translate(-65, -5)
  ctx.rotate(tailWag)
  ctx.beginPath()
  ctx.ellipse(-15, 0, 25, 10, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  ctx.restore()
}

function drawMusicNotes() {
  ctx.fillStyle = '#ffd166'
  ctx.strokeStyle = '#ffd166'
  ctx.lineWidth = 2
  ctx.lineCap = 'round'

  for (const note of notes) {
    ctx.globalAlpha = note.alpha
    ctx.save()
    ctx.translate(note.x, note.y)
    ctx.rotate(Math.sin(time + note.phase) * 0.2)

    // Note head
    ctx.beginPath()
    ctx.ellipse(0, 0, note.size * 0.25, note.size * 0.18, -0.3, 0, Math.PI * 2)
    ctx.fill()

    // Stem
    ctx.beginPath()
    ctx.moveTo(note.size * 0.2, -note.size * 0.1)
    ctx.lineTo(note.size * 0.2, -note.size)
    ctx.stroke()

    // Flag
    ctx.beginPath()
    ctx.moveTo(note.size * 0.2, -note.size)
    ctx.quadraticCurveTo(note.size * 0.55, -note.size * 0.75, note.size * 0.45, -note.size * 0.55)
    ctx.stroke()

    ctx.restore()
  }
  ctx.globalAlpha = 1
}

function drawParticles() {
  ctx.fillStyle = '#ffffff'
  for (const p of particles) {
    ctx.globalAlpha = p.alpha
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1
}

function drawZzzs() {
  ctx.fillStyle = '#a8dadc'
  ctx.font = 'bold 16px sans-serif'
  for (const z of zzzs) {
    ctx.globalAlpha = z.alpha
    ctx.fillText('Z', z.x, z.y)
  }
  ctx.globalAlpha = 1
}

// ==================== UPDATE HELPERS ====================

function updateNotes() {
  for (const note of notes) {
    note.x += note.vx + Math.sin(time + note.phase) * 0.2
    note.y += note.vy
    note.alpha = Math.min(1, (note.y / height) * 2 + 0.2)

    if (note.x > width + 50) note.x = -50
    if (note.y < -50) note.y = height + 50
  }
}

function updateParticles() {
  for (const p of particles) {
    p.x += p.vx + mouse.x * 0.1
    p.y += p.vy + mouse.y * 0.1
    if (p.x < 0) p.x = width
    if (p.x > width) p.x = 0
    if (p.y < 0) p.y = height
    if (p.y > height) p.y = 0
  }
}

function updateZzzs() {
  for (let i = zzzs.length - 1; i >= 0; i--) {
    const z = zzzs[i]
    z.y += z.vy
    z.x += Math.sin(time * 3 + i) * 0.5
    z.alpha -= 0.01
    z.size += 0.2
    if (z.alpha <= 0) zzzs.splice(i, 1)
  }

  // Randomly spawn Zzz from cat
  if (!reducedMotion.value && Math.random() < 0.01) {
    const px = mouse.x * 14
    const py = mouse.y * 10
    createZzz(width * 0.32 + px, height * 0.66 + py)
  }
}

// ==================== INTERACTIONS ====================

function interactCat() {
  catState.tail += 1
  catState.blink = 1
  const px = mouse.x * 14
  const py = mouse.y * 10
  createZzz(width * 0.32 + px, height * 0.66 + py)
  createZzz(width * 0.34 + px, height * 0.64 + py)
  setTimeout(() => { catState.blink = 0 }, 200)
}

function interactDog() {
  dogState.tail += 1
  dogState.blink = 1
  setTimeout(() => { dogState.blink = 0 }, 200)
}

function onCanvasClick(e) {
  const rect = canvas.value.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top

  // Check cat area
  const catX = width * 0.35 + mouse.x * 14
  const catY = height * 0.72 + mouse.y * 10
  const catSize = Math.min(width * 0.12, 120)
  if (x > catX - catSize && x < catX + catSize && y > catY - catSize && y < catY + catSize) {
    interactCat()
    return
  }

  // Check dog area
  const dogX = width * 0.58 + mouse.x * 12
  const dogY = height * 0.75 + mouse.y * 8
  const dogSize = Math.min(width * 0.14, 140)
  if (x > dogX - dogSize && x < dogX + dogSize && y > dogY - dogSize && y < dogY + dogSize) {
    interactDog()
  }
}
</script>

<style scoped>
.home-canvas {
  position: fixed;
  inset: 0;
  overflow: hidden;
  background: #1a1f3c;
}

.home-canvas canvas {
  display: block;
  width: 100%;
  height: 100%;
}

.home-overlay {
  position: absolute;
  bottom: 60px;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  z-index: 10;
  pointer-events: none;
}

.home-overlay > * {
  pointer-events: auto;
}

.pet-names {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 16px;
  font-family: Georgia, serif;
}

.cat-name,
.dog-name {
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.2s;
  padding: 6px 16px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(8px);
  letter-spacing: 1px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.cat-name:hover {
  color: #ffd166;
  background: rgba(255, 255, 255, 0.18);
}

.dog-name:hover {
  color: #e8a850;
  background: rgba(255, 255, 255, 0.18);
}

.and {
  color: rgba(255, 255, 255, 0.4);
}

.home-enter {
  font-size: 15px;
  color: #f0f4f8;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.15);
  padding: 12px 40px;
  border-radius: 30px;
  letter-spacing: 2px;
  transition: all 0.3s;
  text-decoration: none;
  backdrop-filter: blur(8px);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.home-enter:hover {
  background: #6b8cce;
  color: #fff;
  border-color: #6b8cce;
  text-decoration: none;
  transform: translateY(-1px);
  box-shadow: 0 4px 20px rgba(107, 140, 206, 0.3);
}

.controls {
  display: flex;
  gap: 12px;
}

.toggle-btn {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 6px 14px;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s;
  backdrop-filter: blur(8px);
}

.toggle-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.9);
}

.hint {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.35);
  letter-spacing: 0.5px;
  margin: 0;
}

/* Mobile adjustments */
@media (max-width: 768px) {
  .home-overlay {
    bottom: 40px;
    gap: 12px;
  }

  .pet-names {
    font-size: 14px;
    gap: 8px;
  }

  .cat-name,
  .dog-name {
    padding: 5px 12px;
  }

  .home-enter {
    font-size: 14px;
    padding: 10px 32px;
  }

  .hint {
    font-size: 11px;
  }
}

@media (max-width: 375px) {
  .home-overlay {
    bottom: 32px;
  }

  .pet-names {
    font-size: 13px;
  }

  .home-enter {
    font-size: 13px;
    padding: 8px 28px;
  }
}

.reduced-motion .home-enter:hover,
.reduced-motion .cat-name:hover,
.reduced-motion .dog-name:hover,
.reduced-motion .toggle-btn:hover {
  transform: none;
}
</style>
