// --- simple deterministic pseudo-random based on a string seed ---
function createRngFromString(seed) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return function () {
    // xorshift32
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    return (h >>> 0) / 4294967295;
  };
}

function generateSnowflake(seed) {
  const canvas = document.getElementById("snowflakeCanvas");
  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;
  const cx = w / 2;
  const cy = h / 2;
  const radius = Math.min(w, h) * 0.42;

  const rng = createRngFromString(seed || "default-snowflake");

  // clear
  ctx.clearRect(0, 0, w, h);

  // background glow
  const bgGrad = ctx.createRadialGradient(cx, cy, radius * 0.05, cx, cy, radius * 1.1);
  bgGrad.addColorStop(0, "rgba(255,255,255,0.1)");
  bgGrad.addColorStop(0.4, "rgba(180,220,255,0.05)");
  bgGrad.addColorStop(1, "rgba(0,0,0,0.95)");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  // base style
  ctx.save();
  ctx.translate(cx, cy);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  const lineWidthBase = 1.4 + rng() * 0.8;
  const mainHue = 190 + rng() * 80; // blue / cyan / ice variations
  const mainColor = `hsla(${mainHue}, 80%, 80%, 0.95)`;
  const secondaryColor = `hsla(${(mainHue + 40) % 360}, 90%, 90%, 0.75)`;

  // number of "rings" of detail
  const layers = 5 + Math.floor(rng() * 4);

  function drawBranch() {
    ctx.strokeStyle = mainColor;
    ctx.lineWidth = lineWidthBase;

    // main spine
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -radius);
    ctx.stroke();

    // branch details
    for (let i = 1; i <= layers; i++) {
      const t = i / (layers + 1);
      const y = -radius * t;
      const branchLen = radius * 0.12 * (0.7 + rng() * 0.8);
      const angleSpread = (Math.PI / 5) * (0.7 + rng() * 0.6);

      ctx.strokeStyle = secondaryColor;
      ctx.lineWidth = lineWidthBase * (0.7 + rng() * 0.5);

      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(
        Math.cos(-angleSpread) * branchLen,
        y + Math.sin(-angleSpread) * branchLen
      );
      ctx.moveTo(0, y);
      ctx.lineTo(
        Math.cos(angleSpread) * branchLen,
        y + Math.sin(angleSpread) * branchLen
      );
      ctx.stroke();

      // tiny secondary twigs
      if (rng() > 0.4) {
        const twigLen = branchLen * (0.3 + rng() * 0.3);
        ctx.lineWidth = lineWidthBase * 0.6;
        ctx.beginPath();
        ctx.moveTo(
          Math.cos(-angleSpread) * (branchLen * 0.6),
          y + Math.sin(-angleSpread) * (branchLen * 0.6)
        );
        ctx.lineTo(
          Math.cos(-angleSpread * 1.15) * (branchLen * 0.6 + twigLen),
          y + Math.sin(-angleSpread * 1.15) * (branchLen * 0.6 + twigLen)
        );
        ctx.moveTo(
          Math.cos(angleSpread) * (branchLen * 0.6),
          y + Math.sin(angleSpread) * (branchLen * 0.6)
        );
        ctx.lineTo(
          Math.cos(angleSpread * 1.15) * (branchLen * 0.6 + twigLen),
          y + Math.sin(angleSpread * 1.15) * (branchLen * 0.6 + twigLen)
        );
        ctx.stroke();
      }
    }
  }

  // draw 6 mirrored branches
  const arms = 6;
  for (let i = 0; i < arms; i++) {
    const angle = (i * Math.PI * 2) / arms;
    ctx.save();
    ctx.rotate(angle);
    drawBranch();
    ctx.restore();
  }

  // soft center glow
  const cg = ctx.createRadialGradient(0, 0, 0, 0, 0, radius * 0.5);
  cg.addColorStop(0, "rgba(255,255,255,0.8)");
  cg.addColorStop(0.3, "rgba(210,235,255,0.4)");
  cg.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = cg;
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.6, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function setup() {
  const input = document.getElementById("seedInput");
  const generateBtn = document.getElementById("generateBtn");
  const downloadBtn = document.getElementById("downloadBtn");
  const canvas = document.getElementById("snowflakeCanvas");

  generateBtn.addEventListener("click", () => {
    const seed = input.value.trim() || "Captain-Christmas-2025";
    generateSnowflake(seed);
    downloadBtn.disabled = false;
  });

  downloadBtn.addEventListener("click", () => {
    const seed = (document.getElementById("seedInput").value || "snowflake")
      .trim()
      .replace(/\s+/g, "_");
    const link = document.createElement("a");
    link.download = `snowflake_${seed || "unique"}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  });

  // generate a default one on load
  generateSnowflake("Captain-Christmas-2025");
}

window.addEventListener("DOMContentLoaded", setup);
