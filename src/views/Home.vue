<template>
  <div class="home-3d" @click="onSceneClick">
    <canvas ref="canvas"></canvas>
    <div class="home-overlay">
      <div class="pet-names">
        <span class="cat-name" @click.stop="interactCat">???</span>
        <span class="and">&</span>
        <span class="dog-name" @click.stop="interactDog">??</span>
      </div>
      <router-link to="/blog" class="home-enter">进入博客</router-link>
      <p class="hint">click pets &middot; drag to rotate &middot; scroll to zoom</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const canvas = ref(null)
let renderer, scene, camera, controls, animationId
let cat, dog, raycaster, mouse
let catTail, dogTail, dogTongue
let actionTimers = {}

onMounted(() => initThree())
onUnmounted(() => {
  if (animationId) cancelAnimationFrame(animationId)
  renderer?.dispose()
  Object.values(actionTimers).forEach(clearTimeout)
})

function initThree() {
  const el = canvas.value
  const w = window.innerWidth
  const h = window.innerHeight

  renderer = new THREE.WebGLRenderer({ canvas: el, antialias: true, alpha: true })
  renderer.setSize(w, h)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.shadowMap.enabled = true

  scene = new THREE.Scene()
  scene.background = new THREE.Color(0xe8f0f8)
  scene.fog = new THREE.Fog(0xe8f0f8, 8, 30)

  camera = new THREE.PerspectiveCamera(50, w/h, 0.1, 50)
  camera.position.set(0, 3, 8)
  camera.lookAt(0, 0, 0)

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.08
  controls.target.set(0, 0.5, 0)
  controls.minDistance = 3.5
  controls.maxDistance = 14
  controls.maxPolarAngle = Math.PI * 0.7
  controls.update()

  raycaster = new THREE.Raycaster()
  mouse = new THREE.Vector2()

  // Lighting
  scene.add(new THREE.AmbientLight(0xfff5ee, 2.5))
  const sun = new THREE.DirectionalLight(0xfffdf5, 6)
  sun.position.set(8, 12, 4)
  sun.castShadow = true
  sun.shadow.mapSize.set(512, 512)
  sun.shadow.camera.near = 0.5; sun.shadow.camera.far = 30
  sun.shadow.camera.left = -10; sun.shadow.camera.right = 10
  sun.shadow.camera.top = 10; sun.shadow.camera.bottom = -10
  scene.add(sun)
  const fill = new THREE.DirectionalLight(0xaaccff, 2)
  fill.position.set(-4, 2, -2)
  scene.add(fill)

  // Ground
  const groundGeo = new THREE.CircleGeometry(6, 64)
  const groundMat = new THREE.MeshStandardMaterial({ color: 0xd4e8c0, roughness: 0.9 })
  const ground = new THREE.Mesh(groundGeo, groundMat)
  ground.rotation.x = -Math.PI/2; ground.position.y = -2.2
  ground.receiveShadow = true
  scene.add(ground)

  // Shadow disc
  const shadowGeo = new THREE.CircleGeometry(0.7, 32)
  const shadowMat = new THREE.MeshBasicMaterial({ color: 0, transparent: true, opacity: 0.12, depthWrite: false })
  const makeShadow = (x, z) => {
    const s = new THREE.Mesh(shadowGeo, shadowMat)
    s.rotation.x = -Math.PI/2; s.position.set(x, -2.18, z); scene.add(s); return s
  }

  // ===== CAT: ??? =====
  cat = createCatTaiYang()
  cat.position.set(-1.2, -1.8, 0)
  cat.scale.set(1, 1, 1)
  cat.userData = { shadow: makeShadow(-1.2, 0), animPhase: 0, bounce: 0, bounceVel: 0, currentAction: null }
  scene.add(cat)

  // ===== DOG: ?? =====
  dog = createDogMaHua()
  dog.position.set(1.2, -1.8, 0)
  dog.scale.set(1, 1, 1)
  dog.userData = { shadow: makeShadow(1.2, 0), animPhase: 1, bounce: 0, bounceVel: 0, currentAction: null, tailWagSpeed: 7 }
  scene.add(dog)

  // Flowers
  for (let i = 0; i < 20; i++) {
    const stemGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.3 + Math.random()*0.4)
    const stem = new THREE.Mesh(stemGeo, new THREE.MeshStandardMaterial({ color: 0x77aa55 }))
    const a = Math.random()*Math.PI*2; const r = 3 + Math.random()*3
    stem.position.set(Math.cos(a)*r, -1.9, Math.sin(a)*r)
    scene.add(stem)
    if (Math.random() > 0.3) {
      const petal = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8),
        new THREE.MeshStandardMaterial({ color: new THREE.Color().setHSL(Math.random()*0.15+0.05, 0.7, 0.6+Math.random()*0.3) }))
      petal.position.copy(stem.position); petal.position.y += 0.15
      scene.add(petal)
    }
  }

  window.addEventListener('resize', onResize)
  animate()
}

// ============ CAT: ??? (Orange Tabby) ============
function createCatTaiYang() {
  const group = new THREE.Group()
  const cream = 0xfdf0d5
  const orange = 0xe8983e
  const darkOrange = 0xc87020
  const whiteBelly = 0xfff8ee
  const nosePink = 0xff9999
  const eyeGreen = 0x66aa44

  const matCream = new THREE.MeshStandardMaterial({ color: cream, roughness: 0.6 })
  const matOrange = new THREE.MeshStandardMaterial({ color: orange, roughness: 0.6 })
  const matDark = new THREE.MeshStandardMaterial({ color: darkOrange, roughness: 0.5 })
  const matBelly = new THREE.MeshStandardMaterial({ color: whiteBelly, roughness: 0.5 })
  const matNose = new THREE.MeshStandardMaterial({ color: nosePink, roughness: 0.3 })
  const matEye = new THREE.MeshStandardMaterial({ color: eyeGreen, roughness: 0.1 })
  const matPupil = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.1 })

  // Body - round and chubby
  group.add(mesh(new THREE.SphereGeometry(0.55, 1.1, 0.55, 32, 24), matCream, 0, 0.65, 0))
  // Orange stripes on back
  for (let i = -2; i <= 2; i++) {
    group.add(mesh(new THREE.TorusGeometry(0.3, 0.04, 8, 16, Math.PI*0.4), matOrange, 0, 0.85, 0, Math.PI/2, 0, i*0.5))
  }
  // Belly
  group.add(mesh(new THREE.SphereGeometry(0.38, 32, 24), matBelly, 0, 0.55, 0.25))

  // Head - round
  group.add(mesh(new THREE.SphereGeometry(0.42, 32, 24), matCream, 0, 1.25, 0.05))
  // Orange cap on head
  group.add(mesh(new THREE.SphereGeometry(0.35, 1, 0.15, 16, 16), matOrange, 0, 1.5, 0, Math.PI, 0, 0))
  // Cheeks - chubby
  group.add(mesh(new THREE.SphereGeometry(0.15, 16, 16), matBelly, -0.22, 1.18, 0.3))
  group.add(mesh(new THREE.SphereGeometry(0.15, 16, 16), matBelly, 0.22, 1.18, 0.3))

  // Ears
  group.add(mesh(new THREE.ConeGeometry(0.14, 0.35, 8), matOrange, -0.16, 1.65, -0.12))
  group.add(mesh(new THREE.ConeGeometry(0.14, 0.35, 8), matOrange, 0.16, 1.65, -0.12))
  group.add(mesh(new THREE.ConeGeometry(0.09, 0.22, 8), new THREE.MeshStandardMaterial({ color: 0xffcccc, roughness: 0.5 }), -0.16, 1.68, -0.12))
  group.add(mesh(new THREE.ConeGeometry(0.09, 0.22, 8), new THREE.MeshStandardMaterial({ color: 0xffcccc, roughness: 0.5 }), 0.16, 1.68, -0.12))

  // Eyes - big and round
  group.add(mesh(new THREE.SphereGeometry(0.1, 16, 16), matEye, -0.12, 1.35, 0.34))
  group.add(mesh(new THREE.SphereGeometry(0.1, 16, 16), matEye, 0.12, 1.35, 0.34))
  group.add(mesh(new THREE.SphereGeometry(0.05, 16, 16), matPupil, -0.12, 1.35, 0.43))
  group.add(mesh(new THREE.SphereGeometry(0.05, 16, 16), matPupil, 0.12, 1.35, 0.43))

  // Nose
  group.add(mesh(new THREE.SphereGeometry(0.05, 16, 16), matNose, 0, 1.22, 0.4))
  // Mouth
  const mouthMat = new THREE.MeshStandardMaterial({ color: 0x996666, roughness: 0.5 })
  group.add(mesh(new THREE.TorusGeometry(0.04, 0.01, 8, 8), mouthMat, 0.04, 1.17, 0.38, 0, 0, 0.3))
  group.add(mesh(new THREE.TorusGeometry(0.04, 0.01, 8, 8), mouthMat, -0.04, 1.17, 0.38, 0, 0, -0.3))

  // Tail
  const tailPts = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0.25, -0.2), new THREE.Vector3(0, 0.5, -0.1), new THREE.Vector3(0, 0.8, 0.15)]
  const tailGeo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(tailPts), 16, 0.06, 8, false)
  const tailMesh = new THREE.Mesh(tailGeo, matOrange)
  tailMesh.position.set(0, 0.25, -0.5)
  group.add(tailMesh)
  catTail = tailMesh

  // Paws
  for (const [x, z] of [[-0.3, -0.3], [0.3, -0.3], [-0.28, 0.35], [0.28, 0.35]]) {
    group.add(mesh(new THREE.SphereGeometry(0.12, 16, 12), matBelly, x, 0.05, z))
    group.add(mesh(new THREE.SphereGeometry(0.04, 8, 8), matNose, x, 0, z + 0.08))
    group.add(mesh(new THREE.SphereGeometry(0.04, 8, 8), matNose, x - 0.05, 0, z + 0.08))
    group.add(mesh(new THREE.SphereGeometry(0.04, 8, 8), matNose, x + 0.05, 0, z + 0.08))
  }

  return group
}

// ============ DOG: ?? (Shiba/Golden) ============
function createDogMaHua() {
  const group = new THREE.Group()
  const golden = 0xe8a850
  const darkGolden = 0xc07830
  const cream2 = 0xfdf5e6
  const black = 0x222222
  const tonguePink = 0xff7777

  const matFur = new THREE.MeshStandardMaterial({ color: golden, roughness: 0.5 })
  const matDark = new THREE.MeshStandardMaterial({ color: darkGolden, roughness: 0.5 })
  const matCream = new THREE.MeshStandardMaterial({ color: cream2, roughness: 0.4 })
  const matBlack = new THREE.MeshStandardMaterial({ color: black, roughness: 0.2 })
  const matTongue = new THREE.MeshStandardMaterial({ color: tonguePink, roughness: 0.3 })
  const matEye2 = new THREE.MeshStandardMaterial({ color: 0x553311, roughness: 0.1 })

  // Body
  group.add(mesh(new THREE.SphereGeometry(0.48, 1, 0.55, 32, 24), matFur, 0, 0.55, 0))
  // Belly
  group.add(mesh(new THREE.SphereGeometry(0.33, 32, 24), matCream, 0, 0.5, 0.22))
  // Head - fox-like
  group.add(mesh(new THREE.SphereGeometry(0.35, 32, 24), matFur, 0, 1.15, 0.05))
  // Face cream
  group.add(mesh(new THREE.SphereGeometry(0.22, 1, 0.15, 16, 16), matCream, 0, 1.05, 0.28))
  // Snout
  group.add(mesh(new THREE.SphereGeometry(0.16, 1, 0.12, 16, 16), matCream, 0, 1.02, 0.38))
  // Nose
  group.add(mesh(new THREE.SphereGeometry(0.06, 16, 16), matBlack, 0, 1.05, 0.48))
  // Eyes
  group.add(mesh(new THREE.SphereGeometry(0.07, 16, 16), matEye2, -0.13, 1.2, 0.3))
  group.add(mesh(new THREE.SphereGeometry(0.07, 16, 16), matEye2, 0.13, 1.2, 0.3))
  group.add(mesh(new THREE.SphereGeometry(0.03, 8, 8), matBlack, -0.13, 1.2, 0.36))
  group.add(mesh(new THREE.SphereGeometry(0.03, 8, 8), matBlack, 0.13, 1.2, 0.36))
  // Tongue
  const tongue = new THREE.Mesh(new THREE.SphereGeometry(0.04, 1, 0.07, 8, 8), matTongue)
  tongue.position.set(0, 0.96, 0.38)
  group.add(tongue)
  dogTongue = tongue

  // Ears - pointed
  group.add(mesh(new THREE.ConeGeometry(0.12, 0.32, 8), matDark, -0.15, 1.5, -0.05, 0, 0, -0.2))
  group.add(mesh(new THREE.ConeGeometry(0.12, 0.32, 8), matDark, 0.15, 1.5, -0.05, 0, 0, 0.2))

  // Tail - curled
  const tailPts2 = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.1, 0.3, -0.2), new THREE.Vector3(0.05, 0.5, -0.35), new THREE.Vector3(-0.05, 0.55, -0.3)]
  const tailGeo2 = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(tailPts2), 12, 0.05, 6, false)
  const tailMesh2 = new THREE.Mesh(tailGeo2, matDark)
  tailMesh2.position.set(0, 0.4, -0.48)
  group.add(tailMesh2)
  dogTail = tailMesh2

  // Paws
  for (const [x, z] of [[-0.28, -0.35], [0.28, -0.35], [-0.26, 0.4], [0.26, 0.4]]) {
    group.add(mesh(new THREE.SphereGeometry(0.1, 16, 12), matCream, x, 0, z))
  }

  return group
}

function mesh(geo, mat, x, y, z, rx, ry, rz) {
  const m = new THREE.Mesh(geo, mat)
  m.position.set(x||0, y||0, z||0)
  if (rx) m.rotation.x = rx; if (ry) m.rotation.y = ry; if (rz) m.rotation.z = rz
  return m
}

// ============ INTERACTIONS ============
function interactCat(e) {
  e?.stopPropagation?.()
  const actions = ['stretch', 'cute', 'roll', 'blink', 'purr']
  const action = actions[Math.floor(Math.random() * actions.length)]
  triggerCatAction(action)
}

function interactDog(e) {
  e?.stopPropagation?.()
  const actions = ['circleCat', 'cuteTongue', 'spin', 'bark', 'wag']
  const action = actions[Math.floor(Math.random() * actions.length)]
  triggerDogAction(action)
}

function triggerCatAction(action) {
  if (cat.userData.currentAction) return
  cat.userData.currentAction = action

  switch (action) {
    case 'stretch':
      cat.userData.bounceVel = 0.2
      cat.userData.targetScale = { x: 1, y: 1.4, z: 1, t: 0 }
      actionTimers.stretch = setTimeout(() => { cat.userData.currentAction = null }, 2000)
      break
    case 'cute':
      cat.userData.bounceVel = 0.12
      cat.userData.headTilt = 0.3
      actionTimers.cute = setTimeout(() => { cat.userData.currentAction = null; cat.userData.headTilt = 0 }, 1800)
      break
    case 'roll':
      cat.userData.rollAngle = Math.PI * 2
      cat.userData.bounceVel = 0.15
      actionTimers.roll = setTimeout(() => { cat.userData.currentAction = null; cat.userData.rollAngle = 0 }, 1500)
      break
    case 'blink':
      cat.userData.eyeScale = 0.1
      actionTimers.blink1 = setTimeout(() => { cat.userData.eyeScale = 1 }, 200)
      actionTimers.blink2 = setTimeout(() => { cat.userData.eyeScale = 0.1 }, 500)
      actionTimers.blink3 = setTimeout(() => { cat.userData.eyeScale = 1; cat.userData.currentAction = null }, 700)
      break
    case 'purr':
      cat.userData.bounceVel = 0.06
      cat.userData.purrVibrate = true
      actionTimers.purr = setTimeout(() => { cat.userData.currentAction = null; cat.userData.purrVibrate = false }, 2500)
      break
  }
}

function triggerDogAction(action) {
  if (dog.userData.currentAction) return
  dog.userData.currentAction = action

  switch (action) {
    case 'circleCat':
      dog.userData.circleAngle = 0
      dog.userData.circleTarget = true
      dog.userData.tailWagSpeed = 15
      actionTimers.circle = setTimeout(() => { dog.userData.currentAction = null; dog.userData.circleTarget = false; dog.userData.tailWagSpeed = 7 }, 3000)
      break
    case 'cuteTongue':
      dog.userData.tongueOut = 0.1
      dog.userData.bounceVel = 0.1
      dog.userData.tailWagSpeed = 20
      actionTimers.tongue = setTimeout(() => { dog.userData.currentAction = null; dog.userData.tongueOut = 0; dog.userData.tailWagSpeed = 7 }, 2000)
      break
    case 'spin':
      dog.userData.spinAngle = Math.PI * 3
      dog.userData.bounceVel = 0.1
      actionTimers.spin = setTimeout(() => { dog.userData.currentAction = null; dog.userData.spinAngle = 0 }, 1500)
      break
    case 'bark':
      dog.userData.bounceVel = 0.18
      dog.userData.tailWagSpeed = 25
      actionTimers.bark = setTimeout(() => { dog.userData.currentAction = null; dog.userData.tailWagSpeed = 7 }, 1200)
      break
    case 'wag':
      dog.userData.tailWagSpeed = 30
      dog.userData.bounceVel = 0.08
      actionTimers.wag = setTimeout(() => { dog.userData.currentAction = null; dog.userData.tailWagSpeed = 7 }, 2500)
      break
  }
}

// ============ ANIMATION LOOP ============
function animate() {
  animationId = requestAnimationFrame(animate)
  controls.update()
  const t = performance.now() * 0.001

  // Cat animation
  if (cat) {
    cat.userData.bounceVel -= 0.005
    cat.userData.bounce += cat.userData.bounceVel
    if (cat.userData.bounce < 0) { cat.userData.bounce = 0; cat.userData.bounceVel = 0 }
    cat.position.y = -1.8 + cat.userData.bounce
    cat.scale.y = 1 + Math.sin(t*3 + cat.userData.animPhase)*0.02
    if (cat.userData.purrVibrate) {
      cat.position.x = -1.2 + Math.sin(t*30)*0.03
    } else {
      cat.position.x = -1.2 + (cat.userData.rollAngle ? 0 : 0)
    }
    if (cat.userData.headTilt) {
      cat.rotation.z = Math.sin(t*4) * cat.userData.headTilt
    } else if (!cat.userData.rollAngle) {
      cat.rotation.z *= 0.9
    }
    if (cat.userData.rollAngle) {
      cat.rotation.z += 0.15
      cat.userData.rollAngle -= 0.15
    }
  }

  // Dog animation
  if (dog) {
    dog.userData.bounceVel -= 0.005
    dog.userData.bounce += dog.userData.bounceVel
    if (dog.userData.bounce < 0) { dog.userData.bounce = 0; dog.userData.bounceVel = 0 }
    dog.position.y = -1.8 + dog.userData.bounce
    dog.scale.y = 1 + Math.sin(t*3.5 + dog.userData.animPhase)*0.02

    // Circle cat
    if (dog.userData.circleTarget && cat) {
      dog.userData.circleAngle += 0.04
      const r = 1.8
      dog.position.x = cat.position.x + Math.cos(dog.userData.circleAngle) * r
      dog.position.z = Math.sin(dog.userData.circleAngle) * r
      dog.rotation.y = -dog.userData.circleAngle + Math.PI/2
    } else {
      if (!dog.userData.circleTarget) {
        dog.position.x += (1.2 - dog.position.x) * 0.1
        dog.position.z *= 0.9
        dog.rotation.y *= 0.9
      }
    }

    // Spin
    if (dog.userData.spinAngle) {
      dog.rotation.y += 0.2
      dog.userData.spinAngle -= 0.2
    }

    // Tongue
    if (dog.userData.tongueOut !== undefined && dogTongue) {
      dogTongue.scale.y = 1 + dog.userData.tongueOut * 3
      dog.userData.tongueOut *= 0.9
      if (dog.userData.tongueOut < 0.001) dog.userData.tongueOut = 0
    }
  }

  // Tail wagging
  if (catTail && cat) {
    const speed = cat.userData.purrVibrate ? 12 : 4
    catTail.rotation.z = Math.sin(t * speed) * 0.4
  }
  if (dogTail && dog) {
    dogTail.rotation.z = Math.sin(t * dog.userData.tailWagSpeed) * 0.5
  }

  renderer.render(scene, camera)
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}

function onSceneClick(e) {
  mouse.x = (e.clientX / window.innerWidth)*2 - 1
  mouse.y = -(e.clientY / window.innerHeight)*2 + 1
  raycaster.setFromCamera(mouse, camera)
  const targets = [cat, dog]
  for (const t of targets) {
    const hits = raycaster.intersectObject(t, true)
    if (hits.length) {
      if (t === cat) interactCat()
      else interactDog()
      break
    }
  }
}
</script>

<style scoped>
.home-3d { position:fixed; inset:0; overflow:hidden; }
.home-3d canvas { display:block; }
.home-overlay { position:absolute; bottom:60px; left:0; right:0; display:flex; flex-direction:column; align-items:center; gap:20px; z-index:10; }
.pet-names { display:flex; align-items:center; gap:12px; font-size:16px; font-family:Georgia,serif; }
.cat-name, .dog-name { color:rgba(0,0,0,.5); cursor:pointer; transition:all .2s; padding:4px 14px; border-radius:20px; background:rgba(255,255,255,.7); backdrop-filter:blur(4px); letter-spacing:1px; }
.cat-name:hover { color:#e8983e; background:rgba(255,255,255,.9); }
.dog-name:hover { color:#c07830; background:rgba(255,255,255,.9); }
.and { color:rgba(0,0,0,.3); }
.home-enter { font-size:15px; color:#555; background:rgba(255,255,255,.85); border:1px solid rgba(0,0,0,.1); padding:12px 40px; border-radius:30px; letter-spacing:2px; transition:all .3s; text-decoration:none; backdrop-filter:blur(8px); box-shadow:0 2px 12px rgba(0,0,0,.06); }
.home-enter:hover { background:#5566cc; color:#fff; border-color:#5566cc; text-decoration:none; transform:translateY(-1px); box-shadow:0 4px 20px rgba(85,102,204,.25); }
.hint { font-size:12px; color:rgba(0,0,0,.3); letter-spacing:.5px; }
</style>
