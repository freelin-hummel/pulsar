import { ShaderProgram } from '../WebGLManager.js'
import vertexSrc from '../glsl/grid.vert?raw'
import fragmentSrc from '../glsl/grid.frag?raw'
import type { GridType } from '../../../shared/grid.js'

/**
 * GridShader — renders a square, hex, or gridless overlay.
 *
 * Updates every frame so pan/zoom changes are reflected instantly.
 * Set `gridType`, `cellSize`, `visible`, `offset`, and `zoom`
 * to control the grid appearance.
 */
export class GridShader extends ShaderProgram {
  private program: WebGLProgram | null = null
  private vao: WebGLVertexArrayObject | null = null
  private buffer: WebGLBuffer | null = null
  private uResolution: WebGLUniformLocation | null = null
  private uCellSize: WebGLUniformLocation | null = null
  private uOpacity: WebGLUniformLocation | null = null
  private uGridType: WebGLUniformLocation | null = null
  private uColor: WebGLUniformLocation | null = null
  private uOffset: WebGLUniformLocation | null = null
  private uZoom: WebGLUniformLocation | null = null

  // Public state — update these to control the grid
  gridType: GridType = 'square'
  cellSize = 40
  visible = true
  opacity = 0.15
  color: [number, number, number] = [1.0, 1.0, 1.0]
  offset: [number, number] = [0, 0]
  zoom = 1.0

  init(gl: WebGL2RenderingContext): void {
    const vert = this.compileShader(gl, gl.VERTEX_SHADER, vertexSrc)
    const frag = this.compileShader(gl, gl.FRAGMENT_SHADER, fragmentSrc)
    if (!vert || !frag) return

    this.program = this.linkProgram(gl, vert, frag)
    if (!this.program) return

    // Fullscreen quad
    this.vao = gl.createVertexArray()
    this.buffer = gl.createBuffer()
    gl.bindVertexArray(this.vao)
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    )
    const aPosition = gl.getAttribLocation(this.program, 'aPosition')
    gl.enableVertexAttribArray(aPosition)
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0)
    gl.bindVertexArray(null)

    // Uniform locations
    this.uResolution = gl.getUniformLocation(this.program, 'uResolution')
    this.uCellSize = gl.getUniformLocation(this.program, 'uCellSize')
    this.uOpacity = gl.getUniformLocation(this.program, 'uOpacity')
    this.uGridType = gl.getUniformLocation(this.program, 'uGridType')
    this.uColor = gl.getUniformLocation(this.program, 'uColor')
    this.uOffset = gl.getUniformLocation(this.program, 'uOffset')
    this.uZoom = gl.getUniformLocation(this.program, 'uZoom')

    gl.deleteShader(vert)
    gl.deleteShader(frag)
  }

  render(gl: WebGL2RenderingContext, _dt: number, _time: number): void {
    if (!this.program || !this.vao || !this.visible) return

    gl.useProgram(this.program)

    gl.uniform2f(this.uResolution, gl.canvas.width, gl.canvas.height)
    gl.uniform1f(this.uCellSize, this.cellSize)
    gl.uniform1f(this.uOpacity, this.opacity)
    gl.uniform1i(
      this.uGridType,
      this.gridType === 'square' ? 0 : this.gridType === 'hex' ? 1 : 2
    )
    gl.uniform3f(this.uColor, ...this.color)
    gl.uniform2f(this.uOffset, ...this.offset)
    gl.uniform1f(this.uZoom, this.zoom)

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
