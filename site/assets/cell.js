(() => {
  "use strict";

  const svg = document.querySelector("#cell-svg");
  if (!svg) return;

  const faceLayer = document.querySelector("#faces");
  const edgeLayer = document.querySelector("#edges");
  const nodeLayer = document.querySelector("#nodes");
  const caption = document.querySelector("#cell-caption");
  const motionButton = document.querySelector("[data-motion]");
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const isChinese = document.documentElement.lang.toLowerCase().startsWith("zh");
  const ns = "http://www.w3.org/2000/svg";

  const vertices = [
    [1, 1, 1],
    [-1, -1, 1],
    [-1, 1, -1],
    [1, -1, -1],
  ].map((vertex) => vertex.map((value) => value / Math.sqrt(3)));
  const edges = [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]];
  const faces = [[0, 1, 2], [0, 1, 3], [0, 2, 3], [1, 2, 3]];
  const labels = ["A", "B", "C", "D"];

  let angleX = -0.36;
  let angleY = 0.68;
  let dragging = false;
  let lastPointer = null;
  let playing = !reduceMotion.matches;
  let visible = true;
  let mode = "sites";
  let lastFrame = performance.now();

  const make = (tag, attributes = {}) => {
    const element = document.createElementNS(ns, tag);
    for (const [key, value] of Object.entries(attributes)) {
      element.setAttribute(key, value);
    }
    return element;
  };

  const setCaption = (value) => {
    caption.textContent = value;
  };

  const describeNode = (index) => {
    const name = labels[index];
    setCaption(isChinese
      ? `站点 ${name} 与其余三个等价。名字只帮助我们指认，并不让它成为中心。`
      : `Site ${name} is equivalent to the other three. Its name helps us point; it does not make it the centre.`);
  };

  const nodeElements = labels.map((label, index) => {
    const group = make("g", {
      class: "node",
      tabindex: "0",
      role: "button",
      "aria-label": isChinese
        ? `站点 ${label}，四个等价站点之一`
        : `Site ${label}, one of four equivalent sites`,
    });
    group.append(
      make("circle", { class: "halo", r: "17" }),
      make("circle", { class: "core", r: "5" }),
    );
    const text = make("text", { x: "14", y: "-13" });
    text.textContent = label;
    group.append(text);
    group.addEventListener("click", () => describeNode(index));
    group.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        describeNode(index);
      }
    });
    nodeLayer.append(group);
    return group;
  });

  const rotate = ([x, y, z]) => {
    const cy = Math.cos(angleY);
    const sy = Math.sin(angleY);
    const cx = Math.cos(angleX);
    const sx = Math.sin(angleX);
    const x1 = x * cy + z * sy;
    const z1 = -x * sy + z * cy;
    return [x1, y * cx - z1 * sx, y * sx + z1 * cx];
  };

  const project = ([x, y, z]) => {
    const perspective = 4.1 / (4.1 - z);
    return {
      x: 320 + x * 190 * perspective,
      y: 318 - y * 190 * perspective,
      z,
      scale: perspective,
    };
  };

  const render = () => {
    const points = vertices.map((vertex) => project(rotate(vertex)));
    const faceData = faces
      .map((face, index) => ({
        face,
        index,
        z: face.reduce((sum, point) => sum + points[point].z, 0) / 3,
      }))
      .sort((left, right) => left.z - right.z);

    faceLayer.replaceChildren(...faceData.map(({ face, index, z }) => make("polygon", {
      class: "face",
      points: face.map((point) => `${points[point].x.toFixed(1)},${points[point].y.toFixed(1)}`).join(" "),
      fill: index % 2
        ? `rgba(169,140,255,${(0.025 + (z + 1) * 0.025).toFixed(3)})`
        : `rgba(105,230,199,${(0.025 + (z + 1) * 0.025).toFixed(3)})`,
    })));

    const edgeData = edges
      .map((pair) => ({ pair, z: (points[pair[0]].z + points[pair[1]].z) / 2 }))
      .sort((left, right) => left.z - right.z);

    edgeLayer.replaceChildren(...edgeData.map(({ pair, z }) => make("line", {
      x1: points[pair[0]].x.toFixed(1),
      y1: points[pair[0]].y.toFixed(1),
      x2: points[pair[1]].x.toFixed(1),
      y2: points[pair[1]].y.toFixed(1),
      class: z > -0.08 ? "edge-visible" : "edge-back",
      opacity: mode === "relations" ? "1" : mode === "sites" ? "0.68" : "0.85",
    })));

    [...points.keys()]
      .sort((left, right) => points[left].z - points[right].z)
      .forEach((index) => {
        const point = points[index];
        nodeElements[index].setAttribute(
          "transform",
          `translate(${point.x.toFixed(1)} ${point.y.toFixed(1)}) scale(${point.scale.toFixed(3)})`,
        );
        nodeElements[index].style.opacity = mode === "relations" ? "0.84" : "1";
        nodeLayer.append(nodeElements[index]);
      });
  };

  const setMode = (button) => {
    mode = button.dataset.mode;
    document.querySelectorAll("[data-mode]").forEach((candidate) => {
      candidate.setAttribute("aria-pressed", String(candidate === button));
    });
    setCaption(button.dataset.caption);
    render();
  };

  const updateMotionButton = () => {
    motionButton.setAttribute("aria-pressed", String(!playing));
    motionButton.querySelector("[data-motion-playing]").hidden = !playing;
    motionButton.querySelector("[data-motion-paused]").hidden = playing;
  };

  const toggleMotion = () => {
    playing = !playing;
    updateMotionButton();
  };

  const animate = (now) => {
    const elapsed = Math.min(40, now - lastFrame);
    lastFrame = now;
    if (playing && visible && !dragging) {
      angleY += elapsed * (mode === "symmetry" ? 0.00022 : 0.00009);
      render();
    }
    requestAnimationFrame(animate);
  };

  svg.addEventListener("pointerdown", (event) => {
    dragging = true;
    lastPointer = [event.clientX, event.clientY];
    svg.classList.add("dragging");
    svg.setPointerCapture(event.pointerId);
  });
  svg.addEventListener("pointermove", (event) => {
    if (!dragging) return;
    const dx = event.clientX - lastPointer[0];
    const dy = event.clientY - lastPointer[1];
    lastPointer = [event.clientX, event.clientY];
    angleY += dx * 0.008;
    angleX = Math.max(-1.35, Math.min(1.35, angleX + dy * 0.008));
    render();
  });

  const endDrag = (event) => {
    dragging = false;
    svg.classList.remove("dragging");
    if (event.pointerId !== undefined && svg.hasPointerCapture(event.pointerId)) {
      svg.releasePointerCapture(event.pointerId);
    }
  };
  svg.addEventListener("pointerup", endDrag);
  svg.addEventListener("pointercancel", endDrag);
  svg.addEventListener("keydown", (event) => {
    const step = 0.12;
    if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " "].includes(event.key)) {
      event.preventDefault();
    }
    if (event.key === "ArrowLeft") angleY -= step;
    if (event.key === "ArrowRight") angleY += step;
    if (event.key === "ArrowUp") angleX -= step;
    if (event.key === "ArrowDown") angleX += step;
    if (event.key === " ") toggleMotion();
    render();
  });

  document.querySelectorAll("[data-mode]").forEach((button) => {
    button.addEventListener("click", () => setMode(button));
  });
  motionButton.addEventListener("click", toggleMotion);

  if ("IntersectionObserver" in window) {
    new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting;
    }, { threshold: 0.05 }).observe(svg);
  }
  document.addEventListener("visibilitychange", () => {
    visible = !document.hidden;
  });
  reduceMotion.addEventListener?.("change", (event) => {
    if (event.matches) {
      playing = false;
      updateMotionButton();
    }
  });

  render();
  updateMotionButton();
  requestAnimationFrame(animate);
})();
