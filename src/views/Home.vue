<template>
  <div class="home-memory" :class="{ 'reduced-motion': reducedMotion }">
    <canvas ref="canvas" @click="onCanvasClick"></canvas>
    <div class="home-overlay">
      <div class="title-area">
        <h1 class="main-title">过去 · 现在 · 未来</h1>
        <p class="subtitle">那些照亮我的人们，如流星划过时间长河</p>
      </div>
      <router-link to="/blog" class="home-enter">进入博客</router-link>
      <div class="controls">
        <button class="toggle-btn" @click.stop="reducedMotion = !reducedMotion">
          {{ reducedMotion ? '开启动画' : '减弱动画' }}
        </button>
      </div>
      <p class="hint">移动鼠标产生视差 · 点击虚影暂停片刻</p>
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

// Memory figures configuration
const MEMORY_CONFIG = [
  {
    id: 'grandmother',
    name: '外婆',
    phrase: '掌心的温度，护我长大',
    color: '#e8983e',
    spawnInterval: 8,
    shape: 'grandmother'
  },
  {
    id: 'childhoodFriends',
    name: '小学玩伴',
    phrase: '围坐一圈，笑声如铃',
    color: '#f4d03f',
    spawnInterval: 10,
    shape: 'circleChildren'
  },
  {
    id: 'chineseTeacher',
    name: '初中语文老师',
    phrase: '期待的目光，落在我肩上',
    color: '#9b59b6',
    spawnInterval: 9,
    shape: 'teacher'
  },
  {
    id: 'middleFriends',
    name: '初中挚友',
    phrase: '并肩而行，许下的约定',
    color: '#1abc9c',
    spawnInterval: 11,
    shape: 'twoFriends'
  },
  {
    id: 'highSchoolFriend',
    name: '高中挚友',
    phrase: '后来的我们，依然同行',
    color: '#3498db',
    spawnInterval: 12,
    shape: 'singleFriend'
  },
  {
    id: 'luffy',
    name: '路飞',
    phrase: '永不熄灭的热血',
    color: '#e74c3c',
    spawnInterval: 13,
    shape: 'luffy'
  },
  {
    id: 'libai',
    name: '李白',
    phrase: '诗剑逍遥，潇洒人间',
    color: '#ecf0f1',
    spawnInterval: 14,
    shape: 'libai'
  },
  {
    id: 'headTeacher',
    name: '高中班主任',
    phrase: '严厉的光，照见前路',
    color: '#34495e',
    spawnInterval: 10,
    shape: 'sternTeacher'
  },
  {
    id: 'collegeFriend',
    name: '大学红颜',
    phrase: '擦肩而过的流星',
    color: '#e91e63',
    spawnInterval: 15,
    shape: 'departing'
  },
  {
    id: 'lover',
    name: '恋人',
    phrase: '相爱的背影，渐行渐远',
    color: '#c0392b',
    spawnInterval: 16,
    shape: 'loversBack'
  }
]

let activeFigures = []
let spawnTimers = {}
let stars = []
let nebulaClouds = []
let selfFigure = null
let clickedFigure = null

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
  activeFigures = []
  spawnTimers = {}
  stars = []
  nebulaClouds = []
  clickedFigure = null

  const starCount = isMobile.value || reducedMotion.value ? 60 : 150
  for (let i = 0; i < starCount; i++) {
    stars.push({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.5 + 0.3,
      twinkle: Math.random() * Math.PI * 2,
      layer: Math.random() * 0.8 + 0.2
    })
  }

  const nebulaCount = isMobile.value || reducedMotion.value ? 3 : 6
  for (let i = 0; i < nebulaCount; i++) {
    nebulaClouds.push({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 150 + 100,
      color: MEMORY_CONFIG[i % MEMORY_CONFIG.length].color,
      alpha: 0.04,
      vx: (Math.random() - 0.5) * 0.1,
      vy: (Math.random() - 0.5) * 0.1
    })
  }

  MEMORY_CONFIG.forEach((cfg, idx) => {
    spawnTimers[cfg.id] = idx * 2
  })

  selfFigure = createSelfFigure()
}

function createFigure(config) {
  const baseSize = Math.min(width * 0.12, 140)
  const particles = generateShape(config.shape, baseSize)
  const speed = reducedMotion.value ? 0.15 : 0.25 + Math.random() * 0.15

  return {
    config,
    x: width * 0.15 + Math.random() * width * 0.7,
    y: -baseSize * 1.5,
    baseSize,
    particles,
    speed,
    opacity: 0,
    targetOpacity: 0.75,
    phase: 0,
    textPhase: 0,
    clicked: false,
    clickTime: 0,
    driftOffset: Math.random() * Math.PI * 2
  }
}

function generateShape(shapeType, baseSize) {
  const particles = []
  const s = baseSize / 100

  switch (shapeType) {
    case 'grandmother':
      // Gentle, slightly hunched figure with reaching hand
      particles.push({ x: 0, y: -35 * s, r: 8 * s })
      particles.push({ x: 5 * s, y: -10 * s, r: 15 * s })
      particles.push({ x: -20 * s, y: 5 * s, r: 10 * s })
      particles.push({ x: -35 * s, y: 15 * s, r: 7 * s })
      particles.push({ x: 10 * s, y: 30 * s, r: 12 * s })
      particles.push({ x: -8 * s, y: 55 * s, r: 9 * s })
      particles.push({ x: 12 * s, y: 55 * s, r: 9 * s })
      break

    case 'circleChildren':
      // Three small figures in a circle
      for (let i = 0; i < 3; i++) {
        const angle = (i / 3) * Math.PI * 2
        const cx = Math.cos(angle) * 25 * s
        const cy = Math.sin(angle) * 15 * s
        particles.push({ x: cx, y: cy - 10 * s, r: 7 * s })
        particles.push({ x: cx, y: cy + 10 * s, r: 10 * s })
      }
      break

    case 'teacher':
      // Standing figure holding book
      particles.push({ x: 0, y: -40 * s, r: 8 * s })
      particles.push({ x: 0, y: -10 * s, r: 14 * s })
      particles.push({ x: -10 * s, y: 10 * s, r: 8 * s })
      particles.push({ x: 12 * s, y: -5 * s, r: 10 * s })
      particles.push({ x: -5 * s, y: 40 * s, r: 10 * s })
      particles.push({ x: 8 * s, y: 40 * s, r: 10 * s })
      break

    case 'twoFriends':
      // Two figures side by side
      for (let i = 0; i < 2; i++) {
        const dx = (i - 0.5) * 35 * s
        particles.push({ x: dx, y: -35 * s, r: 8 * s })
        particles.push({ x: dx, y: -5 * s, r: 13 * s })
        particles.push({ x: dx, y: 35 * s, r: 10 * s })
      }
      break

    case 'singleFriend':
      // Single figure with open arms
      particles.push({ x: 0, y: -38 * s, r: 8 * s })
      particles.push({ x: 0, y: -5 * s, r: 13 * s })
      particles.push({ x: -20 * s, y: -15 * s, r: 8 * s })
      particles.push({ x: 20 * s, y: -15 * s, r: 8 * s })
      particles.push({ x: -8 * s, y: 40 * s, r: 10 * s })
      particles.push({ x: 8 * s, y: 40 * s, r: 10 * s })
      break

    case 'luffy':
      // Figure with straw hat silhouette
      particles.push({ x: 0, y: -42 * s, r: 12 * s })
      particles.push({ x: 0, y: -15 * s, r: 10 * s })
      particles.push({ x: 0, y: 15 * s, r: 14 * s })
      particles.push({ x: -15 * s, y: 5 * s, r: 8 * s })
      particles.push({ x: 15 * s, y: 5 * s, r: 8 * s })
      particles.push({ x: -8 * s, y: 50 * s, r: 10 * s })
      particles.push({ x: 8 * s, y: 50 * s, r: 10 * s })
      break

    case 'libai':
      // Poet with flowing sleeves and sword
      particles.push({ x: 0, y: -38 * s, r: 8 * s })
      particles.push({ x: 0, y: -5 * s, r: 12 * s })
      particles.push({ x: -25 * s, y: 10 * s, r: 8 * s })
      particles.push({ x: 25 * s, y: 0 * s, r: 8 * s })
      particles.push({ x: 0, y: 40 * s, r: 10 * s })
      particles.push({ x: -10 * s, y: 70 * s, r: 8 * s })
      break

    case 'sternTeacher':
      // Upright, stern figure
      particles.push({ x: 0, y: -42 * s, r: 8 * s })
      particles.push({ x: 0, y: -10 * s, r: 15 * s })
      particles.push({ x: -12 * s, y: 0, r: 9 * s })
      particles.push({ x: 12 * s, y: 0, r: 9 * s })
      particles.push({ x: -8 * s, y: 45 * s, r: 10 * s })
      particles.push({ x: 8 * s, y: 45 * s, r: 10 * s })
      break

    case 'departing':
      // Figure walking away
      particles.push({ x: 0, y: -38 * s, r: 8 * s })
      particles.push({ x: 0, y: -5 * s, r: 12 * s })
      particles.push({ x: -5 * s, y: 35 * s, r: 10 * s })
      particles.push({ x: 8 * s, y: 40 * s, r: 10 * s })
      particles.push({ x: 20 * s, y: 15 * s, r: 7 * s })
      break

    case 'loversBack':
      // Two figures, one departing
      particles.push({ x: -8 * s, y: -35 * s, r: 8 * s })
      particles.push({ x: -8 * s, y: -5 * s, r: 12 * s })
      particles.push({ x: -8 * s, y: 40 * s, r: 10 * s })
      particles.push({ x: 25 * s, y: -35 * s, r: 7 * s })
      particles.push({ x: 30 * s, y: 0, r: 10 * s })
      particles.push({ x: 35 * s, y: 35 * s, r: 9 * s })
      break

    default:
      particles.push({ x: 0, y: -35 * s, r: 8 * s })
      particles.push({ x: 0, y: 0, r: 14 * s })
      particles.push({ x: 0, y: 45 * s, r: 10 * s })
  }

  return particles
}

function createSelfFigure() {
  const baseSize = Math.min(width * 0.08, 80)
  return {
    x: width / 2,
    y: height * 0.82,
    baseSize,
    opacity: 0,
    targetOpacity: 0.9,
    phase: 0
  }
}

function animate() {
  time += 0.016
  ctx.clearRect(0, 0, width, height)

  drawBackground()
  drawNebula()
  drawStars()
  drawRiver()

  if (!reducedMotion.value) {
    spawnFigures()
    updateFigures()
  }
  drawFigures()

  drawSelf()

  animationId = requestAnimationFrame(animate)
}

function drawBackground() {
  const gradient = ctx.createLinearGradient(0, 0, 0, height)
  gradient.addColorStop(0, '#0a0e1a')
  gradient.addColorStop(0.4, '#11162b')
  gradient.addColorStop(0.7, '#1a1f3c')
  gradient.addColorStop(1, '#0f1423')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)
}

function drawNebula() {
  for (const cloud of nebulaClouds) {
    if (!reducedMotion.value) {
      cloud.x += cloud.vx
      cloud.y += cloud.vy
      if (cloud.x < -cloud.r) cloud.x = width + cloud.r
      if (cloud.x > width + cloud.r) cloud.x = -cloud.r
      if (cloud.y < -cloud.r) cloud.y = height + cloud.r
      if (cloud.y > height + cloud.r) cloud.y = -cloud.r
    }

    const g = ctx.createRadialGradient(cloud.x, cloud.y, 0, cloud.x, cloud.y, cloud.r)
    g.addColorStop(0, hexToRgba(cloud.color, cloud.alpha))
    g.addColorStop(1, hexToRgba(cloud.color, 0))
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(cloud.x, cloud.y, cloud.r, 0, Math.PI * 2)
    ctx.fill()
  }
}

function drawStars() {
  for (const star of stars) {
    const parallaxX = mouse.x * 20 * star.layer
    const parallaxY = mouse.y * 15 * star.layer
    const x = star.x + parallaxX
    const y = star.y + parallaxY

    let twinkle = 1
    if (!reducedMotion.value) {
      twinkle = Math.sin(time * 2 + star.twinkle) * 0.5 + 0.5
    }

    ctx.fillStyle = '#ffffff'
    ctx.globalAlpha = twinkle * 0.8
    ctx.beginPath()
    ctx.arc(x, y, star.r, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1
}

function drawRiver() {
  const gradient = ctx.createLinearGradient(0, 0, 0, height)
  gradient.addColorStop(0, 'rgba(100, 150, 255, 0)')
  gradient.addColorStop(0.3, 'rgba(100, 150, 255, 0.03)')
  gradient.addColorStop(0.7, 'rgba(150, 120, 255, 0.05)')
  gradient.addColorStop(1, 'rgba(200, 180, 255, 0.08)')
  ctx.fillStyle = gradient
  ctx.fillRect(width * 0.2, 0, width * 0.6, height)

  // Flowing light particles in river
  if (!reducedMotion.value) {
    const flowCount = isMobile.value ? 15 : 30
    for (let i = 0; i < flowCount; i++) {
      const t = (time * 0.3 + i * 0.2) % 1
      const y = t * height
      const x = width * 0.5 + Math.sin(time + i) * width * 0.15
      const alpha = Math.sin(t * Math.PI) * 0.4
      ctx.fillStyle = `rgba(200, 210, 255, ${alpha})`
      ctx.beginPath()
      ctx.arc(x, y, 1.5, 0, Math.PI * 2)
      ctx.fill()
    }
  }
}

function spawnFigures() {
  MEMORY_CONFIG.forEach((config) => {
    spawnTimers[config.id] -= 0.016
    if (spawnTimers[config.id] <= 0) {
      activeFigures.push(createFigure(config))
      spawnTimers[config.id] = config.spawnInterval + Math.random() * 4
    }
  })
}

function updateFigures() {
  for (let i = activeFigures.length - 1; i >= 0; i--) {
    const fig = activeFigures[i]
    fig.y += fig.speed
    fig.phase += 0.02
    fig.textPhase += 0.015

    // Fade in then out
    const centerY = height * 0.35
    const dist = Math.abs(fig.y - centerY)
    const maxDist = height * 0.45
    fig.targetOpacity = Math.max(0, 1 - dist / maxDist) * 0.75

    if (fig.clicked) {
      fig.targetOpacity = 1
      fig.clickTime -= 0.016
      if (fig.clickTime <= 0) fig.clicked = false
    }

    fig.opacity += (fig.targetOpacity - fig.opacity) * 0.03

    if (fig.y > height + fig.baseSize * 2) {
      activeFigures.splice(i, 1)
    }
  }
}

function drawFigures() {
  for (const fig of activeFigures) {
    if (fig.opacity < 0.01) continue

    drawFigureParticles(fig)
    drawFigureText(fig)
  }
}

function drawFigureParticles(fig) {
  const px = fig.x + mouse.x * 15
  const py = fig.y + mouse.y * 10
  const drift = fig.clicked ? 0 : Math.sin(fig.phase + fig.driftOffset) * 3

  ctx.save()
  ctx.translate(px + drift, py)

  for (const p of fig.particles) {
    const wobble = fig.clicked ? 0 : Math.sin(time * 3 + p.x * 0.1) * 1.5

    ctx.save()
    ctx.globalAlpha = fig.opacity * 0.8
    ctx.shadowBlur = fig.clicked ? 25 : 15
    ctx.shadowColor = fig.config.color
    ctx.fillStyle = fig.config.color
    ctx.beginPath()
    ctx.arc(p.x + wobble, p.y, p.r, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }

  // Connection lines between particles for cohesion
  ctx.save()
  ctx.globalAlpha = fig.opacity * 0.2
  ctx.strokeStyle = fig.config.color
  ctx.lineWidth = 1
  for (let i = 0; i < fig.particles.length - 1; i++) {
    const a = fig.particles[i]
    const b = fig.particles[i + 1]
    ctx.beginPath()
    ctx.moveTo(a.x, a.y)
    ctx.lineTo(b.x, b.y)
    ctx.stroke()
  }
  ctx.restore()

  ctx.restore()
}

function drawFigureText(fig) {
  if (fig.opacity < 0.15) return

  const textOpacity = fig.clicked
    ? 1
    : Math.sin(fig.textPhase) * 0.3 + 0.5

  ctx.save()
  ctx.globalAlpha = Math.min(fig.opacity * 1.5, textOpacity)
  ctx.fillStyle = '#ffffff'
  ctx.font = '400 14px "Noto Serif SC", "Microsoft YaHei", serif'
  ctx.textAlign = 'center'
  ctx.shadowBlur = 10
  ctx.shadowColor = 'rgba(0,0,0,0.5)'
  ctx.fillText(fig.config.phrase, fig.x, fig.y - fig.baseSize * 1.3)

  ctx.font = '12px "Noto Serif SC", "Microsoft YaHei", serif'
  ctx.fillStyle = fig.config.color
  ctx.fillText(fig.config.name, fig.x, fig.y - fig.baseSize * 1.6)
  ctx.restore()
}

function drawSelf() {
  if (!selfFigure) return

  selfFigure.opacity += (selfFigure.targetOpacity - selfFigure.opacity) * 0.02
  selfFigure.phase += 0.02

  const px = selfFigure.x + mouse.x * 8
  const py = selfFigure.y + mouse.y * 5
  const s = selfFigure.baseSize / 100

  ctx.save()
  ctx.globalAlpha = selfFigure.opacity
  ctx.translate(px, py)

  // Self silhouette - small figure looking up
  const selfColor = '#a8d8ff'
  ctx.shadowBlur = 20
  ctx.shadowColor = selfColor
  ctx.fillStyle = selfColor

  // Head
  ctx.beginPath()
  ctx.arc(0, -45 * s, 10 * s, 0, Math.PI * 2)
  ctx.fill()

  // Body
  ctx.beginPath()
  ctx.ellipse(0, -5 * s, 15 * s, 30 * s, 0, 0, Math.PI * 2)
  ctx.fill()

  // Looking up head tilt
  ctx.save()
  ctx.rotate(-0.2)
  ctx.restore()

  // Glow star above head
  const starY = -85 * s + Math.sin(selfFigure.phase) * 3
  ctx.fillStyle = '#fff8dc'
  ctx.shadowBlur = 30
  ctx.shadowColor = 'rgba(255, 248, 220, 0.6)'
  ctx.beginPath()
  ctx.arc(0, starY, 6 * s, 0, Math.PI * 2)
  ctx.fill()

  ctx.restore()

  // Text: "最后，我仰望自己的星空"
  ctx.save()
  ctx.globalAlpha = selfFigure.opacity
  ctx.fillStyle = 'rgba(255,255,255,0.8)'
  ctx.font = 'italic 400 16px "Noto Serif SC", "Microsoft YaHei", serif'
  ctx.textAlign = 'center'
  ctx.shadowBlur = 8
  ctx.shadowColor = 'rgba(0,0,0,0.5)'
  ctx.fillText('最后，我仰望自己的星空', px, py + selfFigure.baseSize * 1.2)
  ctx.restore()
}

function onCanvasClick(e) {
  const rect = canvas.value.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top

  // Check if clicked on a figure
  for (const fig of activeFigures) {
    const dx = x - fig.x
    const dy = y - fig.y
    const dist = Math.sqrt(dx * dx + dy * dy)
    if (dist < fig.baseSize) {
      fig.clicked = true
      fig.clickTime = 3
      return
    }
  }

  // Check self figure
  if (selfFigure) {
    const dx = x - selfFigure.x
    const dy = y - selfFigure.y
    if (Math.sqrt(dx * dx + dy * dy) < selfFigure.baseSize) {
      selfFigure.phase += 1
    }
  }
}

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
</script>

<style scoped>
.home-memory {
  position: fixed;
  inset: 0;
  overflow: hidden;
  background: #0a0e1a;
}

.home-memory canvas {
  display: block;
  width: 100%;
  height: 100%;
}

.home-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 80px 20px 60px;
  z-index: 10;
  pointer-events: none;
}

.home-overlay > * {
  pointer-events: auto;
}

.title-area {
  text-align: center;
  margin-top: 5vh;
}

.main-title {
  font-family: "Noto Serif SC", "Microsoft YaHei", serif;
  font-size: 42px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.95);
  letter-spacing: 12px;
  text-shadow: 0 2px 30px rgba(100, 150, 255, 0.3);
  margin: 0 0 12px 0;
}

.subtitle {
  font-family: "Noto Serif SC", "Microsoft YaHei", serif;
  font-size: 15px;
  color: rgba(255, 255, 255, 0.5);
  letter-spacing: 3px;
  margin: 0;
}

.home-enter {
  font-size: 15px;
  color: #f0f4f8;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 14px 44px;
  border-radius: 30px;
  letter-spacing: 2px;
  transition: all 0.3s;
  text-decoration: none;
  backdrop-filter: blur(8px);
  box-shadow: 0 2px 20px rgba(100, 150, 255, 0.1);
  margin-bottom: 40px;
}

.home-enter:hover {
  background: rgba(107, 140, 206, 0.5);
  color: #fff;
  border-color: rgba(107, 140, 206, 0.6);
  text-decoration: none;
  transform: translateY(-2px);
  box-shadow: 0 4px 30px rgba(107, 140, 206, 0.3);
}

.controls {
  position: absolute;
  bottom: 20px;
  right: 20px;
}

.toggle-btn {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 6px 14px;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s;
  backdrop-filter: blur(8px);
}

.toggle-btn:hover {
  background: rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.85);
}

.hint {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.3);
  letter-spacing: 0.5px;
  margin: 0;
  position: absolute;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
}

/* Mobile adjustments */
@media (max-width: 768px) {
  .home-overlay {
    padding: 60px 16px 50px;
  }

  .main-title {
    font-size: 28px;
    letter-spacing: 8px;
  }

  .subtitle {
    font-size: 13px;
    letter-spacing: 2px;
  }

  .home-enter {
    font-size: 14px;
    padding: 12px 36px;
    margin-bottom: 60px;
  }

  .hint {
    font-size: 11px;
  }
}

@media (max-width: 375px) {
  .main-title {
    font-size: 24px;
    letter-spacing: 6px;
  }

  .subtitle {
    font-size: 12px;
  }

  .home-enter {
    font-size: 13px;
    padding: 10px 30px;
  }
}

.reduced-motion .home-enter:hover,
.reduced-motion .toggle-btn:hover {
  transform: none;
}
</style>
