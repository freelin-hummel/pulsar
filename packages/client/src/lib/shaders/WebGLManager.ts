/**
 * WebGLManager - Base class for WebGL shader rendering on the canvas.
 *
 * Adapted from tldraw's shader-starter-kit pattern. Creates a WebGL2
 * canvas overlay that integrates with the tldraw canvas lifecycle.
 *
 * Subclass this to create custom shader effects:
 * - Override onInit() for setup
 * - Override onRender() for per-frame rendering
 * - Override onDispose() for cleanup
 */
export class WebGLManager {
  protected canvas: HTMLCanvasElement
  protected gl: WebGL2RenderingContext | null = null
  protected container: HTMLElement
  private _programs: Map<string, ShaderProgram> = new Map()
  private _animationFrame: number | null = null
  private _lastTime = 0
  private _running = false

  constructor(container: HTMLElement) {
    this.container = container

    // Create overlay canvas
    this.canvas = document.createElement('canvas')
    this.canvas.style.position = 'absolute'
    this.canvas.style.top = '0'
    this.canvas.style.left = '0'
    this.canvas.style.width = '100%'
    this.canvas.style.height = '100%'
    this.canvas.style.pointerEvents = 'none'
    this.canvas.style.zIndex = '999'
    container.appendChild(this.canvas)

    // Initialize WebGL2 context
    this.gl = this.canvas.getContext('webgl2', {
      alpha: true,
      premultipliedAlpha: true,
      antialias: true,
    })

    if (!this.gl) {
      console.warn('[pulsar] WebGL2 not supported, shader effects disabled')
    }

    // Handle resize
    this._handleResize()
    const observer = new ResizeObserver(() => this._handleResize())
    observer.observe(container)
  }

  /** Register a shader program */
  registerProgram(id: string, program: ShaderProgram): void {
    this._programs.set(id, program)
    if (this.gl) {
      program.init(this.gl)
    }
  }

  /** Remove a shader program */
  removeProgram(id: string): void {
    const program = this._programs.get(id)
    if (program && this.gl) {
      program.dispose(this.gl)
    }
    this._programs.delete(id)
  }

  /** Get a registered program */
  getProgram(id: string): ShaderProgram | undefined {
    return this._programs.get(id)
  }

  /** Start the render loop */
  start(): void {
    if (this._running) return
    this._running = true
    this._lastTime = performance.now()
    this._tick()
  }

  /** Stop the render loop */
  stop(): void {
    this._running = false
    if (this._animationFrame !== null) {
      cancelAnimationFrame(this._animationFrame)
      this._animationFrame = null
    }
  }

  /** Clean up all resources */
  dispose(): void {
    this.stop()
    if (this.gl) {
      for (const program of this._programs.values()) {
        program.dispose(this.gl)
      }
    }
    this._programs.clear()
    this.canvas.remove()
    this.gl = null
  }

  /** Get the WebGL context */
  getContext(): WebGL2RenderingContext | null {
    return this.gl
  }

  private _tick = (): void => {
    if (!this._running || !this.gl) return

    const now = performance.now()
    const dt = (now - this._lastTime) / 1000
    this._lastTime = now

    // Clear the overlay
    this.gl.clear(this.gl.COLOR_BUFFER_BIT)

    // Render all active programs
    for (const program of this._programs.values()) {
      if (program.enabled) {
        program.render(this.gl, dt, now / 1000)
      }
    }

    this._animationFrame = requestAnimationFrame(this._tick)
  }

  private _handleResize(): void {
    const rect = this.container.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    this.canvas.width = rect.width * dpr
    this.canvas.height = rect.height * dpr
    if (this.gl) {
      this.gl.viewport(0, 0, this.canvas.width, this.canvas.height)
    }
  }
}

/**
 * ShaderProgram - Base class for individual shader effects.
 *
 * Implement this interface to create reusable shader programs
 * that can be registered with the WebGLManager.
 */
export abstract class ShaderProgram {
  enabled = true
  uniforms: Record<string, number | number[]> = {}

  /** Compile and link the shader program */
  abstract init(gl: WebGL2RenderingContext): void

  /** Render one frame */
  abstract render(gl: WebGL2RenderingContext, dt: number, time: number): void

  /** Release GPU resources */
  abstract dispose(gl: WebGL2RenderingContext): void

  /** Helper: compile a shader */
  protected compileShader(
    gl: WebGL2RenderingContext,
    type: number,
    source: string
  ): WebGLShader | null {
    const shader = gl.createShader(type)
    if (!shader) return null

    gl.shaderSource(shader, source)
    gl.compileShader(shader)

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('[pulsar] Shader compile error:', gl.getShaderInfoLog(shader))
      gl.deleteShader(shader)
      return null
    }

    return shader
  }

  /** Helper: link a program */
  protected linkProgram(
    gl: WebGL2RenderingContext,
    vertexShader: WebGLShader,
    fragmentShader: WebGLShader
  ): WebGLProgram | null {
    const program = gl.createProgram()
    if (!program) return null

    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('[pulsar] Program link error:', gl.getProgramInfoLog(program))
      gl.deleteProgram(program)
      return null
    }

    return program
  }
}
