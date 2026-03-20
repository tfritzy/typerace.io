import { useEffect, useRef, useState, useCallback } from "react";

const TERRAIN_WIDTH = 1920;
const TERRAIN_HEIGHT = 1080;
const DESTROY_RADIUS = 30;

export const WebGPUCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pixelDataRef = useRef<Uint8Array | null>(null);
  const gpuRef = useRef<{
    device: GPUDevice;
    context: GPUCanvasContext;
    pipeline: GPURenderPipeline;
    texture: GPUTexture;
    bindGroup: GPUBindGroup;
    vertexBuffer: GPUBuffer;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const destroyAt = useCallback((canvasX: number, canvasY: number) => {
    const pixels = pixelDataRef.current;
    const gpu = gpuRef.current;
    if (!pixels || !gpu) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const terrainX = Math.floor((canvasX / canvas.clientWidth) * TERRAIN_WIDTH);
    const terrainY = Math.floor((canvasY / canvas.clientHeight) * TERRAIN_HEIGHT);

    const minX = Math.max(0, terrainX - DESTROY_RADIUS);
    const maxX = Math.min(TERRAIN_WIDTH - 1, terrainX + DESTROY_RADIUS);
    const minY = Math.max(0, terrainY - DESTROY_RADIUS);
    const maxY = Math.min(TERRAIN_HEIGHT - 1, terrainY + DESTROY_RADIUS);
    const r2 = DESTROY_RADIUS * DESTROY_RADIUS;

    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        const dx = x - terrainX;
        const dy = y - terrainY;
        if (dx * dx + dy * dy <= r2) {
          const idx = (y * TERRAIN_WIDTH + x) * 4;
          pixels[idx] = 0;
          pixels[idx + 1] = 0;
          pixels[idx + 2] = 0;
          pixels[idx + 3] = 0;
        }
      }
    }

    gpu.device.queue.writeTexture(
      { texture: gpu.texture },
      pixels.buffer,
      { bytesPerRow: TERRAIN_WIDTH * 4, rowsPerImage: TERRAIN_HEIGHT },
      { width: TERRAIN_WIDTH, height: TERRAIN_HEIGHT }
    );

    const commandEncoder = gpu.device.createCommandEncoder();
    const textureView = gpu.context.getCurrentTexture().createView();
    const renderPass = commandEncoder.beginRenderPass({
      colorAttachments: [
        {
          view: textureView,
          clearValue: { r: 0, g: 0, b: 0, a: 1 },
          loadOp: "clear" as GPULoadOp,
          storeOp: "store" as GPUStoreOp,
        },
      ],
    });
    renderPass.setPipeline(gpu.pipeline);
    renderPass.setBindGroup(0, gpu.bindGroup);
    renderPass.setVertexBuffer(0, gpu.vertexBuffer);
    renderPass.draw(6);
    renderPass.end();
    gpu.device.queue.submit([commandEncoder.finish()]);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let destroyed = false;

    const init = async () => {
      if (!navigator.gpu) {
        setError("WebGPU is not supported in this browser.");
        return;
      }

      const adapter = await navigator.gpu.requestAdapter();
      if (!adapter) {
        setError("Failed to get GPU adapter.");
        return;
      }

      if (destroyed) return;

      const device = await adapter.requestDevice();
      if (destroyed) {
        device.destroy();
        return;
      }

      const context = canvas.getContext("webgpu");
      if (!context) {
        setError("Failed to get WebGPU context.");
        return;
      }

      canvas.width = TERRAIN_WIDTH;
      canvas.height = TERRAIN_HEIGHT;

      const format = navigator.gpu.getPreferredCanvasFormat();
      context.configure({ device, format, alphaMode: "opaque" });

      const accentColor = getComputedStyle(document.documentElement)
        .getPropertyValue("--accent-primary")
        .trim();
      const cr = parseInt(accentColor.slice(1, 3), 16);
      const cg = parseInt(accentColor.slice(3, 5), 16);
      const cb = parseInt(accentColor.slice(5, 7), 16);

      const pixels = new Uint8Array(TERRAIN_WIDTH * TERRAIN_HEIGHT * 4);
      for (let i = 0; i < TERRAIN_WIDTH * TERRAIN_HEIGHT; i++) {
        pixels[i * 4] = cr;
        pixels[i * 4 + 1] = cg;
        pixels[i * 4 + 2] = cb;
        pixels[i * 4 + 3] = 255;
      }
      pixelDataRef.current = pixels;

      const texture = device.createTexture({
        size: { width: TERRAIN_WIDTH, height: TERRAIN_HEIGHT },
        format: "rgba8unorm",
        usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
      });
      device.queue.writeTexture(
        { texture },
        pixels.buffer,
        { bytesPerRow: TERRAIN_WIDTH * 4, rowsPerImage: TERRAIN_HEIGHT },
        { width: TERRAIN_WIDTH, height: TERRAIN_HEIGHT }
      );

      const sampler = device.createSampler({
        magFilter: "linear",
        minFilter: "linear",
      });

      const shaderModule = device.createShaderModule({
        code: `
          struct VertexOutput {
            @builtin(position) position: vec4f,
            @location(0) uv: vec2f,
          }

          @vertex
          fn vs(@location(0) pos: vec2f, @location(1) uv: vec2f) -> VertexOutput {
            var out: VertexOutput;
            out.position = vec4f(pos, 0.0, 1.0);
            out.uv = uv;
            return out;
          }

          @group(0) @binding(0) var terrainSampler: sampler;
          @group(0) @binding(1) var terrainTexture: texture_2d<f32>;

          @fragment
          fn fs(@location(0) uv: vec2f) -> @location(0) vec4f {
            return textureSample(terrainTexture, terrainSampler, uv);
          }
        `,
      });

      const vertices = new Float32Array([
        -1, -1, 0, 1,
         1, -1, 1, 1,
         1,  1, 1, 0,
        -1, -1, 0, 1,
         1,  1, 1, 0,
        -1,  1, 0, 0,
      ]);

      const vertexBuffer = device.createBuffer({
        size: vertices.byteLength,
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
      });
      device.queue.writeBuffer(vertexBuffer, 0, vertices);

      const pipeline = device.createRenderPipeline({
        layout: "auto",
        vertex: {
          module: shaderModule,
          entryPoint: "vs",
          buffers: [
            {
              arrayStride: 16,
              attributes: [
                { shaderLocation: 0, offset: 0, format: "float32x2" as GPUVertexFormat },
                { shaderLocation: 1, offset: 8, format: "float32x2" as GPUVertexFormat },
              ],
            },
          ],
        },
        fragment: {
          module: shaderModule,
          entryPoint: "fs",
          targets: [{ format }],
        },
        primitive: { topology: "triangle-list" },
      });

      const bindGroup = device.createBindGroup({
        layout: pipeline.getBindGroupLayout(0),
        entries: [
          { binding: 0, resource: sampler },
          { binding: 1, resource: texture.createView() },
        ],
      });

      gpuRef.current = { device, context, pipeline, texture, bindGroup, vertexBuffer };

      const commandEncoder = device.createCommandEncoder();
      const textureView = context.getCurrentTexture().createView();
      const renderPass = commandEncoder.beginRenderPass({
        colorAttachments: [
          {
            view: textureView,
            clearValue: { r: 0, g: 0, b: 0, a: 1 },
            loadOp: "clear" as GPULoadOp,
            storeOp: "store" as GPUStoreOp,
          },
        ],
      });
      renderPass.setPipeline(pipeline);
      renderPass.setBindGroup(0, bindGroup);
      renderPass.setVertexBuffer(0, vertexBuffer);
      renderPass.draw(6);
      renderPass.end();
      device.queue.submit([commandEncoder.finish()]);
    };

    init();

    return () => {
      destroyed = true;
      gpuRef.current = null;
      pixelDataRef.current = null;
    };
  }, []);

  const handlePointerEvent = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (e.buttons === 0 && e.type !== "pointerdown") return;
      const rect = e.currentTarget.getBoundingClientRect();
      destroyAt(e.clientX - rect.left, e.clientY - rect.top);
    },
    [destroyAt]
  );

  if (error) {
    return (
      <div
        className="w-full rounded-lg overflow-hidden flex items-center justify-center bg-secondary text-muted-foreground"
        style={{ aspectRatio: "16/9" }}
      >
        {error}
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      className="w-full rounded-lg cursor-crosshair"
      style={{ aspectRatio: "16/9" }}
      onPointerDown={handlePointerEvent}
      onPointerMove={handlePointerEvent}
    />
  );
};
