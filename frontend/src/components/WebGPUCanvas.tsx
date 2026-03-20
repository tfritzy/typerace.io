import { useEffect, useRef, useState } from "react";

export const WebGPUCanvas = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

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

      const device = await adapter.requestDevice();
      const context = canvas.getContext("webgpu");
      if (!context) {
        setError("Failed to get WebGPU context.");
        return;
      }

      const dpr = window.devicePixelRatio || 1;
      canvas.width = container.clientWidth * dpr;
      canvas.height = container.clientHeight * dpr;

      const format = navigator.gpu.getPreferredCanvasFormat();
      context.configure({ device, format, alphaMode: "premultiplied" });

      const accentColor = getComputedStyle(document.documentElement)
        .getPropertyValue("--accent-primary")
        .trim();
      const r = parseInt(accentColor.slice(1, 3), 16) / 255;
      const g = parseInt(accentColor.slice(3, 5), 16) / 255;
      const b = parseInt(accentColor.slice(5, 7), 16) / 255;

      const vertices = new Float32Array([
        -0.3, -0.2, r, g, b, 1,
         0.3, -0.2, r, g, b, 1,
         0.3,  0.2, r, g, b, 1,
        -0.3, -0.2, r, g, b, 1,
         0.3,  0.2, r, g, b, 1,
        -0.3,  0.2, r, g, b, 1,
      ]);

      const vertexBuffer = device.createBuffer({
        size: vertices.byteLength,
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
      });
      device.queue.writeBuffer(vertexBuffer, 0, vertices);

      const shaderModule = device.createShaderModule({
        code: `
          struct VertexOutput {
            @builtin(position) position: vec4f,
            @location(0) color: vec4f,
          }

          @vertex
          fn vs(@location(0) pos: vec2f, @location(1) color: vec4f) -> VertexOutput {
            var out: VertexOutput;
            out.position = vec4f(pos, 0.0, 1.0);
            out.color = color;
            return out;
          }

          @fragment
          fn fs(@location(0) color: vec4f) -> @location(0) vec4f {
            return color;
          }
        `,
      });

      const pipeline = device.createRenderPipeline({
        layout: "auto",
        vertex: {
          module: shaderModule,
          entryPoint: "vs",
          buffers: [
            {
              arrayStride: 24,
              attributes: [
                { shaderLocation: 0, offset: 0, format: "float32x2" as GPUVertexFormat },
                { shaderLocation: 1, offset: 8, format: "float32x4" as GPUVertexFormat },
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

      const render = () => {
        if (destroyed) return;

        const commandEncoder = device.createCommandEncoder();
        const textureView = context.getCurrentTexture().createView();
        const renderPass = commandEncoder.beginRenderPass({
          colorAttachments: [
            {
              view: textureView,
              clearValue: { r: 0, g: 0, b: 0, a: 0 },
              loadOp: "clear" as GPULoadOp,
              storeOp: "store" as GPUStoreOp,
            },
          ],
        });

        renderPass.setPipeline(pipeline);
        renderPass.setVertexBuffer(0, vertexBuffer);
        renderPass.draw(6);
        renderPass.end();
        device.queue.submit([commandEncoder.finish()]);
      };

      render();
    };

    init();

    return () => {
      destroyed = true;
    };
  }, []);

  if (error) {
    return (
      <div className="w-full rounded-lg overflow-hidden flex items-center justify-center bg-secondary text-muted-foreground" style={{ height: "400px" }}>
        {error}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full rounded-lg overflow-hidden" style={{ height: "400px" }}>
      <canvas
        ref={canvasRef}
        className="w-full h-full"
      />
    </div>
  );
};
