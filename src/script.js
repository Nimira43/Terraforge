import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js'
import { SUBTRACTION, Evaluator, Brush } from 'three-bvh-csg'
import CustomShaderMaterial from 'three-custom-shader-material/vanilla'
import GUI from 'lil-gui'
import terrainVertexShader from './shaders/terrain/vertex.glsl'
import terrainFragmentShader from './shaders/terrain/fragment.glsl'

const gui = new GUI({ width: 325 })
const debugObject = {}

const canvas = document.querySelector('canvas.webgl')
const scene = new THREE.Scene()

const rgbeLoader = new RGBELoader()
rgbeLoader.load('/spruit_sunrise.hdr', (environmentMap) => {
  environmentMap.mapping = THREE.EquirectangularReflectionMapping

  scene.background = environmentMap
  scene.backgroundBlurriness = 0.5
  scene.environment = environmentMap
})

const geometry = new THREE.PlaneGeometry(10, 10, 500, 500)
geometry.deleteAttribute('uv')
geometry.deleteAttribute('normal')
geometry.rotateX(- Math.PI * 0.5)

debugObject.colourWaterDeep = '#002b3d'
debugObject.colourWaterSurface = '#66a8ff'
debugObject.colourSand = '#e3c96b'
debugObject.colourGrass = '#6bb421'
debugObject.colourSnow = '#ffffff'
debugObject.colourRock = '#888650'

const uniforms = {
  uTime: new THREE.Uniform(0),
  uPositionFrequency: new THREE.Uniform(0.2),
  uStrength: new THREE.Uniform(2.0),
  uWarpFrequency: new THREE.Uniform(5),
  uWarpStrength: new THREE.Uniform(0.5),
  uColourWaterDeep: new THREE.Uniform(new THREE.Color(debugObject.colourWaterDeep)),
  uColourWaterSurface: new THREE.Uniform(new THREE.Color(debugObject.colourWaterSurface)),
  uColourSand: new THREE.Uniform(new THREE.Color(debugObject.colourSand)),
  uColourGrass: new THREE.Uniform(new THREE.Color(debugObject.colourGrass)),
  uColourSnow: new THREE.Uniform(new THREE.Color(debugObject.colourSnow)),
  uColourRock: new THREE.Uniform(new THREE.Color(debugObject.colourRock))
}

gui.add(uniforms.uPositionFrequency, 'value', 0, 1, 0.001).name('uPositionFrequency')
gui.add(uniforms.uStrength, 'value', 0, 10, 0.001).name('uStrength')
gui.add(uniforms.uWarpFrequency, 'value', 0, 10, 0.001).name('uWarpFrequency')
gui.add(uniforms.uWarpStrength, 'value', 0, 1, 0.001).name('uWarpStrength')
gui.addColor(debugObject, 'colourWaterDeep').onChange(() => uniforms.uColourWaterDeep.value.set(debugObject.colourWaterDeep))
gui.addColor(debugObject, 'colourWaterSurface').onChange(() => uniforms.uColourWaterSurface.value.set(debugObject.colourWaterSurface))
gui.addColor(debugObject, 'colourSand').onChange(() => uniforms.uColourSand.value.set(debugObject.colourSand))
gui.addColor(debugObject, 'colourGrass').onChange(() => uniforms.uColourGrass.value.set(debugObject.colourGrass))
gui.addColor(debugObject, 'colourSnow').onChange(() => uniforms.uColourSnow.value.set(debugObject.colourSnow))
gui.addColor(debugObject, 'colourRock').onChange(() => uniforms.uColourRock.value.set(debugObject.colourRock))

const material = new CustomShaderMaterial({
  baseMaterial: THREE.MeshStandardMaterial,
  vertexShader: terrainVertexShader,
  fragmentShader: terrainFragmentShader,
  uniforms: uniforms,
  silent: true,
  metalness: 0,
  roughness: 0.5,
  color: '#448206'
})

const depthMaterial = new CustomShaderMaterial({
  baseMaterial: THREE.MeshDepthMaterial,
  vertexShader: terrainVertexShader,
  uniforms: uniforms,
  silent: true,
  depthPacking:THREE.RGBADepthPacking
})

const terrain = new THREE.Mesh(geometry, material)
terrain.customDepthMaterial = depthMaterial
terrain.receiveShadow = true
terrain.castShadow = true
scene.add(terrain)

const boardFill = new Brush(new THREE.BoxGeometry(11, 2, 11))
const boardHole = new Brush(new THREE.BoxGeometry(10, 2.1, 10))

const evaluator = new Evaluator()
const board = evaluator.evaluate(
  boardFill,
  boardHole,
  SUBTRACTION
)
board.geometry.clearGroups()
board.material = new THREE.MeshStandardMaterial({
  color: '#87ceeb',
  metalness: 0,
  roughness: 0.3
})
board.castShadow = true
board.receiveShadow = true
scene.add(board)

const water = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 10, 1, 1),
  new THREE.MeshPhysicalMaterial({
    transmission: 1,
    roughness: 0.3
  })
)
water.rotation.x = -Math.PI * 0.5
water.position.y = -0.1
scene.add(water)

const directionalLight = new THREE.DirectionalLight('#ffffff', 2)
directionalLight.position.set(6.25, 3, 4)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.near = 0.1
directionalLight.shadow.camera.far = 30
directionalLight.shadow.camera.top = 8
directionalLight.shadow.camera.right = 8
directionalLight.shadow.camera.bottom = -8
directionalLight.shadow.camera.left = -8
scene.add(directionalLight)

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: Math.min(window.devicePixelRatio, 2)
}

window.addEventListener('resize', () => {
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight
  sizes.pixelRatio = Math.min(window.devicePixelRatio, 2)

  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(sizes.pixelRatio)
})

const camera = new THREE.PerspectiveCamera(
  35,
  sizes.width / sizes.height,
  0.1,
  100
)
camera.position.set(-10, 6, -2)
scene.add(camera)

const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true
})

renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(sizes.pixelRatio)

const clock = new THREE.Clock()

const tick = () => {
  const elapsedTime = clock.getElapsedTime()
  uniforms.uTime.value = elapsedTime
  controls.update()
  renderer.render(scene, camera)
  window.requestAnimationFrame(tick)
}

tick()