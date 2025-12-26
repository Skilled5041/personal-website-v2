<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import snowflakeSvg from "/src/assets/snowflake.svg";
    let enabled: boolean = true;

    let canvas: HTMLCanvasElement;
    let context: CanvasRenderingContext2D;
    let animationFrameId: number;
    let snowflakeImg: HTMLImageElement;
    let snowflakeWhiteImg: HTMLCanvasElement | null = null;

    type Snowflake = {
        x: number;
        y: number;
        radius: number;
        fallSpeed: number;
        drift: number;
        layer: number;
        isSettled?: boolean;
        fadeElapsed?: number;
    };

    type SnowLayer = {
        // baseCount is the count intended for the reference resolution (BASE_AREA)
        baseCount: number;
        count: number;
        minRadius: number;
        maxRadius: number;
        minSpeed: number;
        maxSpeed: number;
        minAngleDeg: number;
        maxAngleDeg: number;
        flakes: Snowflake[];
        alpha: number;
    };

    // Base area: assume original design was for 1920x1080 (adjustable). If your original target was different,
    // change BASE_WIDTH / BASE_HEIGHT accordingly.
    const BASE_WIDTH = 1920;
    const BASE_HEIGHT = 1080;
    const BASE_AREA = BASE_WIDTH * BASE_HEIGHT;

    const layers: SnowLayer[] = [
        {
            baseCount: 67,
            count: 67,
            minRadius: 0.25,
            maxRadius: 0.3,
            minSpeed: 60, // scaled for time-based animation
            maxSpeed: 70,
            minAngleDeg: 345,
            maxAngleDeg: 355,
            flakes: [],
            alpha: 0.35,
        },
        {
            baseCount: 67,
            count: 67,
            minRadius: 0.25,
            maxRadius: 0.3,
            minSpeed: 60,
            maxSpeed: 70,
            minAngleDeg: 25,
            maxAngleDeg: 40,
            flakes: [],
            alpha: 0.35,
        },
        {
            baseCount: 100,
            count: 100,
            minRadius: 0.45,
            maxRadius: 0.5,
            minSpeed: 80,
            maxSpeed: 90,
            minAngleDeg: 30,
            maxAngleDeg: 35,
            flakes: [],
            alpha: 0.5,
        },
    ];

    const FADE_DURATION = 15000; // 15 seconds

    let snowPile: number[] = [];
    let settledFlakes: Snowflake[] = [];

    function getScaleFactor() {
        const area = window.innerWidth * window.innerHeight;
        // Scale factor relative to BASE_AREA. Clamp to a reasonable range so we don't create extreme counts.
        const raw = area / BASE_AREA;
        return Math.max(0.25, Math.min(raw, 3));
    }

    function updateCounts() {
        const sf = getScaleFactor();
        layers.forEach((layer) => {
            layer.count = Math.max(5, Math.round(layer.baseCount * sf));
        });
    }

    function adjustLayerFlakesForCount() {
        layers.forEach((layer, idx) => {
            if (!layer.flakes) layer.flakes = [];
            // Trim if too many
            if (layer.flakes.length > layer.count) {
                layer.flakes.length = layer.count;
            }
            // Add if too few
            while (layer.flakes.length < layer.count) {
                layer.flakes.push(createSnowflake(idx, -5));
            }
        });
    }

    function resizeCanvas() {
        const dpr = window.devicePixelRatio || 1;
        const width = window.innerWidth;
        const height = window.innerHeight;

        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        context.setTransform(dpr, 0, 0, dpr, 0, 0);

        // Always reset snowPile to match new width/height
        snowPile = Array(Math.ceil(window.innerWidth)).fill(window.innerHeight);
        // Clear settledFlakes so no flakes are stuck at the old height
        settledFlakes = [];

        // Update counts based on new size and adjust flakes arrays to match
        updateCounts();
        adjustLayerFlakesForCount();

        // Clear the canvas and force a redraw
        context.clearRect(0, 0, canvas.width, canvas.height);
    }

    function createSnowflake(
        layerIndex: number,
        startY = Math.random() * window.innerHeight,
    ): Snowflake {
        const layer = layers[layerIndex];
        const radius = layer.minRadius + Math.random() * (layer.maxRadius - layer.minRadius);
        const fallSpeed = layer.minSpeed + Math.random() * (layer.maxSpeed - layer.minSpeed);
        const angleDeg =
            layer.minAngleDeg + Math.random() * (layer.maxAngleDeg - layer.minAngleDeg);
        const angleRad = (angleDeg * Math.PI) / 180;
        const drift = Math.sin(angleRad) * fallSpeed;
        const verticalSpeed = Math.cos(angleRad) * fallSpeed;
        return {
            x: Math.random() * window.innerWidth,
            y: startY,
            radius,
            fallSpeed: verticalSpeed,
            drift,
            layer: layerIndex,
        };
    }

    function initializeLayers() {
        updateCounts();
        for (let i = 0; i < layers.length; i++) {
            const layer = layers[i];
            layer.flakes = Array.from({ length: layer.count }, () => createSnowflake(i));
        }
    }

    let lastTimestamp = performance.now();

    function drawFrame(ts?: number) {
        const now = ts ?? performance.now();
        const delta = Math.min((now - lastTimestamp) / 1000, 0.1); // seconds, clamp to avoid huge jumps
        lastTimestamp = now;

        context.clearRect(0, 0, canvas.width, canvas.height);
        if (!snowPile.length || snowPile.length !== Math.ceil(window.innerWidth)) {
            snowPile = Array(Math.ceil(window.innerWidth)).fill(window.innerHeight);
        }
        // Draw the snow pile
        context.save();
        context.fillStyle = "rgba(255,255,255,0.7)";
        for (let x = 0; x < snowPile.length; x++) {
            const y = snowPile[x];
            if (y < window.innerHeight) {
                context.fillRect(x, y, 1, window.innerHeight - y);
            }
        }
        context.restore();

        // Draw and update settled flakes (fading out)
        settledFlakes = settledFlakes.filter((flake) => {
            flake.fadeElapsed = (flake.fadeElapsed || 0) + (delta * 1000); // ms
            let alpha = Math.max(0, 0.4 * (1 - (flake.fadeElapsed || 0) / FADE_DURATION));
            if (snowflakeWhiteImg) {
                context.save();
                context.globalAlpha = alpha;
                context.translate(flake.x, flake.y);
                context.drawImage(
                    snowflakeWhiteImg,
                    -flake.radius * 12,
                    -flake.radius * 12,
                    flake.radius * 24,
                    flake.radius * 24,
                );
                context.restore();
            }
            return (flake.fadeElapsed || 0) < FADE_DURATION;
        });

        layers.forEach((layer) => {
            // Remove off-screen flakes
            layer.flakes = layer.flakes.filter(
                (flake) => flake.y < window.innerHeight + flake.radius * 24,
            );
            // Add new flakes to maintain count
            while (layer.flakes.length < layer.count) {
                layer.flakes.push(createSnowflake(layer.flakes[0]?.layer ?? 0, -5));
            }
            // Animate/draw falling flakes
            context.save();
            context.globalAlpha = layer.alpha;
            layer.flakes.forEach((flake, i) => {
                if (snowflakeWhiteImg) {
                    context.save();
                    context.translate(flake.x, flake.y);
                    context.drawImage(
                        snowflakeWhiteImg,
                        -flake.radius * 12,
                        -flake.radius * 12,
                        flake.radius * 24,
                        flake.radius * 24,
                    );
                    context.restore();
                }
                flake.y += flake.fallSpeed * delta;
                flake.x += flake.drift * delta;

                // Pile up logic
                const pileX = Math.round(flake.x);
                if (pileX >= 0 && pileX < snowPile.length) {
                    if (flake.y + flake.radius * 12 >= snowPile[pileX]) {
                        settledFlakes.push({ ...flake, isSettled: true, fadeElapsed: 0 });
                        for (let dx = -flake.radius * 6; dx <= flake.radius * 6; dx++) {
                            const px = pileX + dx;
                            if (px >= 0 && px < snowPile.length) {
                                snowPile[px] -= flake.radius * 2;
                            }
                        }
                        layer.flakes[i] = createSnowflake(layer.flakes[i].layer, -5);
                    }
                }
                if (flake.x > window.innerWidth) flake.x = 0;
                if (flake.x < 0) flake.x = window.innerWidth;
            });
            context.restore();
        });

        animationFrameId = window.requestAnimationFrame(drawFrame);
    }

    function makeWhiteSnowflakeImage() {
        // Create an offscreen canvas
        const size = 48; // px, large enough for all flake sizes
        const off = document.createElement('canvas');
        off.width = size;
        off.height = size;
        const ctx = off.getContext('2d')!;
        ctx.save();
        ctx.drawImage(snowflakeImg, 0, 0, size, size);
        ctx.restore();
        return off;
    }

    let initialized = false;

    function startSnow() {
        if (initialized || !canvas) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        context = canvas.getContext("2d")!;
        window.addEventListener("resize", resizeCanvas);

        snowflakeImg = new Image();
        snowflakeImg.src = snowflakeSvg.src;
        snowflakeImg.onload = () => {
            snowflakeWhiteImg = makeWhiteSnowflakeImage();
            resizeCanvas();
            initializeLayers();
            drawFrame();
        };
        initialized = true;
    }

    function stopSnow() {
        if (animationFrameId) {
            window.cancelAnimationFrame(animationFrameId);
            animationFrameId = 0;
        }
        window.removeEventListener("resize", resizeCanvas);
        initialized = false;
    }

    function handleSnowToggle(e: CustomEvent<{ enabled: boolean }>) {
        enabled = e.detail.enabled;
        if (enabled) {
            // Wait for next tick so canvas is mounted
            setTimeout(() => startSnow(), 0);
        } else {
            stopSnow();
        }
    }

    onMount(() => {
        // Read initial state from localStorage
        const stored = localStorage.getItem("snow-enabled");
        if (stored !== null) {
            enabled = stored === "true";
        }

        // Listen for toggle events
        window.addEventListener("snow-toggle", handleSnowToggle as EventListener);

        if (enabled) {
            startSnow();
        }
    });

    onDestroy(() => {
        stopSnow();
        window.removeEventListener("snow-toggle", handleSnowToggle as EventListener);
    });
</script>

{#if enabled}
    <canvas bind:this={canvas} class="fixed inset-0 pointer-events-none z-[999999]"></canvas>
{/if}
