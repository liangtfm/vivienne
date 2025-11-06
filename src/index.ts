import { Hono } from "hono";

const app = new Hono();

app.get("/", (c) => {
  return c.html(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vivienne Liang</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      overflow: hidden;
      font-family: 'Courier New', monospace;
      transition: background-color 0.3s ease, color 0.3s ease;
    }

    body.light-mode {
      background-color: #ffffff;
      color: #333333;
    }

    body.dark-mode {
      background-color: #1a1a1a;
      color: #e0e0e0;
    }

    #theme-toggle {
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 10px 20px;
      font-size: 16px;
      border: 2px solid currentColor;
      background: transparent;
      color: inherit;
      border-radius: 8px;
      cursor: pointer;
      font-family: inherit;
      transition: all 0.3s ease;
      z-index: 1000;
    }

    #theme-toggle:hover {
      transform: scale(1.05);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }

    #heart-container {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      display: inline-block;
      filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.3));
    }

    #heart {
      font-size: 14px;
      line-height: 14px;
      white-space: pre;
      font-family: monospace;
      letter-spacing: 0;
    }
  </style>
</head>
<body class="dark-mode">
  <button id="theme-toggle">🌙 Dark Mode</button>

  <div id="heart-container">
    <pre id="heart"></pre>
  </div>

  <script>
    // Theme toggle functionality
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;

    const savedTheme = localStorage.getItem('theme') || 'dark';
    body.className = savedTheme + '-mode';
    updateToggleButton();

    themeToggle.addEventListener('click', () => {
      const isLight = body.classList.contains('light-mode');
      body.className = isLight ? 'dark-mode' : 'light-mode';
      localStorage.setItem('theme', isLight ? 'dark' : 'light');
      updateToggleButton();
    });

    function updateToggleButton() {
      const isLight = body.classList.contains('light-mode');
      themeToggle.textContent = isLight ? '🌙' : '☀️';
    }

    // 3D Heart Renderer
    const container = document.getElementById('heart-container');
    const heartPre = document.getElementById('heart');

    let width, height;
    
    function updateDimensions() {
      const charWidth = 8;
      const charHeight = 14;
      const maxWidth = Math.floor((window.innerWidth * 0.9) / charWidth);
      const maxHeight = Math.floor((window.innerHeight * 0.8) / charHeight);
      
      width = Math.min(180, maxWidth);
      height = Math.min(120, maxHeight);
      
      // Adjust font size for mobile
      if (window.innerWidth < 768) {
        heartPre.style.fontSize = '8px';
        heartPre.style.lineHeight = '8px';
      } else {
        heartPre.style.fontSize = '14px';
        heartPre.style.lineHeight = '14px';
      }
    }
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    let A = Math.PI, B = 0;
    const chars = ' .:-=+*#%@♥';

    // Parametric heart surface function - creates filled heart volume
    // Creates a 3D heart by filling the interior
    function heartSurface(u, v, r) {
      // v: 0 to 2π (outline of heart shape)
      // u: 0 to π (depth layers from front to back)
      // r: 0 to 1 (radius from center to surface)

      // 2D heart curve
      const hx = Math.pow(Math.sin(v), 3);
      const hy = 0.8125 * Math.cos(v) - 0.3125 * Math.cos(2*v) - 0.125 * Math.cos(3*v) - 0.0625 * Math.cos(4*v);

      // Depth scaling - creates rounded 3D effect
      const depthScale = Math.sin(u) * 0.5;

      // Scale the 2D curve by depth to create 3D volume
      const scale = 1.0 - Math.pow(1.0 - Math.abs(depthScale) / 0.5, 2) * 0.3;

      // Apply radial scale to fill the volume (r from center outward)
      const x = hx * scale * r;
      const y = -hy * scale * r;
      const z = depthScale;

      return [x, y, z, r]; // Return r for luminance adjustment
    }

    // Heart surface normal (for lighting)
    function heartNormal(u, v, r) {
      const du = 0.01;
      const dv = 0.01;
      const [x0, y0, z0] = heartSurface(u, v, r);
      const [x1, y1, z1] = heartSurface(u + du, v, r);
      const [x2, y2, z2] = heartSurface(u, v + dv, r);

      // Cross product
      const dx1 = x1 - x0, dy1 = y1 - y0, dz1 = z1 - z0;
      const dx2 = x2 - x0, dy2 = y2 - y0, dz2 = z2 - z0;

      const nx = dy1 * dz2 - dz1 * dy2;
      const ny = dz1 * dx2 - dx1 * dz2;
      const nz = dx1 * dy2 - dy1 * dx2;

      const len = Math.sqrt(nx*nx + ny*ny + nz*nz) || 1;
      return [nx/len, ny/len, nz/len];
    }

    function render() {
      const output = new Array(height);
      const zbuffer = new Array(height);
      for (let i = 0; i < height; i++) {
        output[i] = new Array(width).fill(' ');
        zbuffer[i] = new Array(width).fill(-Infinity);
      }

      const cosA = Math.cos(A), sinA = Math.sin(A);
      const cosB = Math.cos(B), sinB = Math.sin(B);

      // Sample the heart volume (filled solid)
      for (let u = 0; u < Math.PI; u += 0.05) {
        for (let v = 0; v < Math.PI * 2; v += 0.05) {
          for (let r = 0.3; r <= 1.0; r += 0.15) {
            const [x, y, z, radius] = heartSurface(u, v, r);
            const [nx, ny, nz] = heartNormal(u, v, r);

            // Rotate around X axis (A)
            let x1 = x;
            let y1 = y * cosA - z * sinA;
            let z1 = y * sinA + z * cosA;

            // Rotate around Y axis (B)
            let x2 = x1 * cosB + z1 * sinB;
            let y2 = y1;
            let z2 = -x1 * sinB + z1 * cosB;

            // Rotate normal
            let nx1 = nx;
            let ny1 = ny * cosA - nz * sinA;
            let nz1 = ny * sinA + nz * cosA;

            let nx2 = nx1 * cosB + nz1 * sinB;
            let ny2 = ny1;
            let nz2 = -nx1 * sinB + nz1 * cosB;

            // Perspective projection
            const K1 = 200;
            const K2 = 5;
            const ooz = 1 / (z2 + K2);

            const xp = Math.floor(width/2 + K1 * ooz * x2);
            const yp = Math.floor(height/2 - K1 * ooz * y2 / 2);

            if (xp >= 0 && xp < width && yp >= 0 && yp < height) {
              if (ooz > zbuffer[yp][xp]) {
                zbuffer[yp][xp] = ooz;

                // Lighting calculation with ambient + diffuse
                const diffuse = nx2 * 0.3 + ny2 * 0.5 - nz2 * 0.8;
                const ambient = 0.25; // Minimum brightness
                const innerDarkening = 1.0 - (1.0 - radius) * 0.2; // Inner parts slightly darker
                const luminance = Math.max(0, Math.min(1, (ambient + diffuse * 0.7) * innerDarkening));
                const charIndex = Math.min(chars.length - 1, Math.floor(luminance * chars.length));

                output[yp][xp] = chars[charIndex];
              }
            }
          }
        }
      }

      // Convert to colored HTML
      let html = '';
      for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
          const char = output[i][j];
          if (char !== ' ') {
            const intensity = chars.indexOf(char) / (chars.length - 1);
            // Rose/coral base color #FF6B9D, modulated by intensity
            const r = Math.floor(200 + 55 * intensity);
            const g = Math.floor(80 + 27 * intensity);
            const b = Math.floor(120 + 37 * intensity);
            html += \`<span style="color: rgb(\${r}, \${g}, \${b})">\${char}</span>\`;
          } else {
            html += ' ';
          }
        }
        html += '\\n';
      }

      heartPre.innerHTML = html;
    }

    function animate() {
      // Update rotation (much slower speeds)
      A += 0.005;
      B += 0.0025;

      // Render 3D heart
      render();

      requestAnimationFrame(animate);
    }

    animate();
  </script>
</body>
</html>
  `);
});

export default app;
