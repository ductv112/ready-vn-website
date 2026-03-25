import * as THREE from 'three'
import type { EffectType, ImageAsset } from '@/types'

// ─── WebGL Shader Sources ──────────────────────────────────────────────────

const VERT_SHADER = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

/** Crossfade dissolve between two textures */
const FRAG_CROSSFADE = /* glsl */ `
  uniform sampler2D uTextureA;
  uniform sampler2D uTextureB;
  uniform float uProgress;  // 0.0 → 1.0
  varying vec2 vUv;

  void main() {
    vec4 colorA = texture2D(uTextureA, vUv);
    vec4 colorB = texture2D(uTextureB, vUv);
    gl_FragColor = mix(colorA, colorB, smoothstep(0.0, 1.0, uProgress));
  }
`

/** Infinite zoom — zooms into center while crossfading */
const FRAG_INFINITE_ZOOM = /* glsl */ `
  uniform sampler2D uTextureA;
  uniform sampler2D uTextureB;
  uniform float uProgress;
  uniform float uZoomIntensity;
  varying vec2 vUv;

  vec2 zoomUv(vec2 uv, float scale) {
    vec2 center = vec2(0.5);
    return (uv - center) / scale + center;
  }

  void main() {
    float p = smoothstep(0.0, 1.0, uProgress);
    float scaleA = 1.0 + p * uZoomIntensity;
    float scaleB = (1.0 - p) * uZoomIntensity + 1.0;

    vec2 uvA = zoomUv(vUv, scaleA);
    vec2 uvB = zoomUv(vUv, scaleB);

    vec4 colorA = texture2D(uTextureA, uvA);
    vec4 colorB = texture2D(uTextureB, uvB);

    gl_FragColor = mix(colorA, colorB, p);
  }
`

/** 3D distortion — ripple warp on transition */
const FRAG_DISTORTION = /* glsl */ `
  uniform sampler2D uTextureA;
  uniform sampler2D uTextureB;
  uniform float uProgress;
  uniform float uIntensity;
  varying vec2 vUv;

  void main() {
    float p = smoothstep(0.0, 1.0, uProgress);
    float wave = sin((vUv.x + vUv.y) * 10.0 - p * 6.28) * uIntensity * (1.0 - p) * p;

    vec2 distortedUv = vUv + vec2(wave);

    vec4 colorA = texture2D(uTextureA, distortedUv);
    vec4 colorB = texture2D(uTextureB, distortedUv);

    gl_FragColor = mix(colorA, colorB, p);
  }
`

// ─── CanvasRenderer Class ──────────────────────────────────────────────────

export class CanvasRenderer {
  private renderer: THREE.WebGLRenderer
  private scene: THREE.Scene
  private camera: THREE.OrthographicCamera
  private mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>
  private material: THREE.ShaderMaterial

  private textureA: THREE.Texture | null = null
  private textureB: THREE.Texture | null = null

  private rafId: number | null = null
  private isDisposed = false
  private currentEffectType: EffectType | null = null

  constructor(
    private canvas: HTMLCanvasElement,
    private renderWidth: number,
    private renderHeight: number,
  ) {
    // ── Renderer
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false })
    this.renderer.setSize(renderWidth, renderHeight, false)
    this.renderer.setPixelRatio(1) // always 1:1 for export accuracy

    // ── Camera (orthographic — 2D plane rendering)
    this.camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0.1, 10)
    this.camera.position.z = 1

    // ── Scene
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0x000000)

    // ── Full-screen quad geometry
    const geometry = new THREE.PlaneGeometry(1, 1)

    // ── Default material (crossfade)
    this.material = new THREE.ShaderMaterial({
      vertexShader: VERT_SHADER,
      fragmentShader: FRAG_CROSSFADE,
      uniforms: {
        uTextureA:     { value: null },
        uTextureB:     { value: null },
        uProgress:     { value: 0.0 },
        uZoomIntensity:{ value: 0.3 },
        uIntensity:    { value: 0.05 },
      },
    })

    this.mesh = new THREE.Mesh(geometry, this.material)
    this.scene.add(this.mesh)
  }

  // ── Set which shader + intensity to use
  // Only recompiles GLSL when type actually changes (shader recompile is expensive)
  applyEffect(type: EffectType, intensity: number) {
    if (type !== this.currentEffectType) {
      let frag = FRAG_CROSSFADE
      if (type === 'infinite-zoom') frag = FRAG_INFINITE_ZOOM
      if (type === '3d-distortion') frag = FRAG_DISTORTION
      this.material.fragmentShader = frag
      this.material.needsUpdate = true
      this.currentEffectType = type
    }
    this.material.uniforms.uZoomIntensity.value = intensity * 0.5
    this.material.uniforms.uIntensity.value = intensity * 0.08
  }

  // ── Load an image asset into a GPU texture
  async loadTexture(asset: ImageAsset): Promise<THREE.Texture> {
    return new Promise((resolve) => {
      const loader = new THREE.TextureLoader()
      loader.load(asset.objectUrl, (tex) => {
        tex.minFilter = THREE.LinearFilter
        tex.magFilter = THREE.LinearFilter
        tex.generateMipmaps = false
        resolve(tex)
      })
    })
  }

  // ── Set the two images for the current transition
  setTextures(a: THREE.Texture | null, b: THREE.Texture | null) {
    this.textureA = a
    this.textureB = b
    this.material.uniforms.uTextureA.value = a
    this.material.uniforms.uTextureB.value = b ?? a
  }

  // ── Set transition progress (0 = full A, 1 = full B)
  setProgress(p: number) {
    this.material.uniforms.uProgress.value = p
  }

  // ── Render a single frame (call from rAF or export loop)
  renderFrame() {
    if (!this.isDisposed) {
      this.renderer.render(this.scene, this.camera)
    }
  }

  // ── Start continuous render loop for preview
  startRenderLoop(onFrame?: () => void) {
    const loop = () => {
      if (this.isDisposed) return
      // onFrame phải chạy TRƯỚC renderFrame để uniforms được cập nhật
      // trước khi GPU draw — tránh lag 1 frame
      onFrame?.()
      this.renderFrame()
      this.rafId = requestAnimationFrame(loop)
    }
    this.rafId = requestAnimationFrame(loop)
  }

  stopRenderLoop() {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }
  }

  // ── Capture current canvas frame as Blob for FFmpeg
  captureFrame(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      this.canvas.toBlob((blob) => {
        if (blob) resolve(blob)
        else reject(new Error('Canvas toBlob failed'))
      }, 'image/png')
    })
  }

  // ── Resize canvas (e.g., when switching between preview and export mode)
  resize(width: number, height: number) {
    this.renderWidth = width
    this.renderHeight = height
    this.renderer.setSize(width, height, false)
  }

  dispose() {
    this.isDisposed = true
    this.stopRenderLoop()
    this.textureA?.dispose()
    this.textureB?.dispose()
    this.material.dispose()
    this.mesh.geometry.dispose()
    this.renderer.dispose()
  }
}
