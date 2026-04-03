import { ShaderProgram } from '../WebGLManager.js'
import vertexSrc from '../glsl/minimal.vert?raw'
import fragmentSrc from '../glsl/minimal.frag?raw'

/**
 * MinimalShader - A simple starter shader effect.
 *
 * Renders a subtle animated gradient overlay that demonstrates
 * the shader pipeline integration. Use this as a template
 * for creating custom visual effects.
 */
export class MinimalShader extends ShaderProgram {
  private program: WebGLProgram | null = null
  private vao: WebGLVertexArrayObject | null = null
  private buffer: WebGLBuffer | null = null
  private uTime: WebGLUniformLocation | null = null
  private uResolution: WebGLUniformLocation | null = null
  private uOpacity: WebGLUniformLocation | null = null
  private manager: { getContext: () => WebGL2RenderingContext | null }

  constructor(manager: { getContext: () => WebGL2RenderingContext | null }) {
    super()
    this.manager = manager
    this.enabled = false // Disabled by default, enable explicitly
  }

  init(gl: WebGL2RenderingContext): void {
    const vert = this.compileShader(gl, gl.VERTEX_SHADER, vertexSrc)
    const frag = this.compileShader(gl, gl.FRAGMENT_SHADER, fragmentSrc)
    if (!vert || !frag) return

    this.program = this.linkProgram(gl, vert, frag)
    if (!this.program) return

    // Set up fullscreen quad
    this.vao = gl.createVertexArray()
    this.buffer = gl.createBuffer()

    gl.bindVertexArray(this.vao)
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer)

    const vertices = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
       1,  1,
    ])
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)

    const aPosition = gl.getAttribLocation(this.program, 'aPosition')
    gl.enableVertexAttribArray(aPosition)
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0)

    gl.bindVertexArray(null)

    // Get uniform locations
    this.uTime = gl.getUniformLocation(this.program, 'uTime')
    this.uResolution = gl.getUniformLocation(this.program, 'uResolution')
    this.uOpacity = gl.getUniformLocation(this.program, 'uOpacity')

    // Clean up individual shaders
    gl.deleteShader(vert)
    gl.deleteShader(frag)
  }

  render(gl: WebGL2RenderingContext, dt: number, time: number): void {
    if (!this.program || !this.vao) return

    gl.useProgram(this.program)
    gl.uniform1f(this.uTime, time)
    gl.uniform2f(this.uResolution, gl.canvas.width, gl.canvas.height)
    gl.uniform1f(this.uOpacity, (this.uniforms.opacity as number) ?? 0.15)

    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

    gl.bindVertexArray(this.vao)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    gl.bindVertexArray(null)

    gl.disable(gl.BLEND)
  }

  dispose(gl: WebGL2RenderingContext): void {
    if (this.program) gl.deleteProgram(this.program)
    if (this.buffer) gl.deleteBuffer(this.buffer)
    if (this.vao) gl.deleteVertexArray(this.vao)
    this.program = null
    this.buffer = null
    this.vao = null
  }
}
