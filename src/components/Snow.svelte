<script lang="ts">
    import {onDestroy, onMount} from "svelte";

    let canvas: HTMLCanvasElement;
    let context: CanvasRenderingContext2D;
    let animationFrameId: number;
    let snowflakeImg: HTMLImageElement;

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
        count: number;
        minRadius: number;
        maxRadius: number;
        minSpeed: number;
        maxSpeed: number;
        minAngleDeg: number;
        maxAngleDeg: number;
        flakes: Snowflake[];
    };

    const layers: SnowLayer[] = [
        { count: 67, minRadius: 0.25, maxRadius: 0.3, minSpeed: 0.6, maxSpeed: 0.7, minAngleDeg: 345, maxAngleDeg: 355, flakes: [] },
        { count: 67, minRadius: 0.25, maxRadius: 0.3, minSpeed: 0.6, maxSpeed: 0.7, minAngleDeg: 25, maxAngleDeg: 40, flakes: [] },
        { count: 100, minRadius: 0.45, maxRadius: 0.5, minSpeed: 0.8, maxSpeed: 0.9, minAngleDeg: 30, maxAngleDeg: 35, flakes: [] },
    ];

    const FADE_DURATION = 15000; // 10 seconds
    const SNOWPILE_HEIGHT = 0.2; // How much the snow pile rises

    let snowPile: number[] = [];
    let settledFlakes: Snowflake[] = [];

    function resizeCanvas() {
        const dpr = window.devicePixelRatio || 1;
        const width = window.innerWidth;
        const height = window.innerHeight;

        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        context.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function createSnowflake(layerIndex: number, startY = Math.random() * window.innerHeight): Snowflake {
        const layer = layers[layerIndex];
        const radius = layer.minRadius + Math.random() * (layer.maxRadius - layer.minRadius);
        const fallSpeed = layer.minSpeed + Math.random() * (layer.maxSpeed - layer.minSpeed);
        const angleDeg = layer.minAngleDeg + Math.random() * (layer.maxAngleDeg - layer.minAngleDeg);
        const angleRad = angleDeg * Math.PI / 180;
        const drift = Math.sin(angleRad) * fallSpeed;
        const verticalSpeed = Math.cos(angleRad) * fallSpeed;
        return { x: Math.random() * window.innerWidth, y: startY, radius, fallSpeed: verticalSpeed, drift, layer: layerIndex };
    }

    function initializeLayers() {
        for (let i = 0; i < layers.length; i++) {
            const layer = layers[i];
            layer.flakes = Array.from({ length: layer.count }, () => createSnowflake(i));
        }
    }

    function drawFrame(ts?: number) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        if (!snowPile.length || snowPile.length !== Math.ceil(window.innerWidth)) {
            snowPile = Array(Math.ceil(window.innerWidth)).fill(window.innerHeight);
        }
        // Draw snow pile
        context.save();
        context.fillStyle = 'rgba(255,255,255,0.7)';
        for (let x = 0; x < snowPile.length; x++) {
            const y = snowPile[x];
            if (y < window.innerHeight) {
                context.fillRect(x, y, 1, window.innerHeight - y);
            }
        }
        context.restore();

        // Draw and update settled flakes (fading out)
        settledFlakes = settledFlakes.filter(flake => {
            flake.fadeElapsed = (flake.fadeElapsed || 0) + (ts ? 16 : 16);
            let alpha = Math.max(0, 0.4 * (1 - (flake.fadeElapsed || 0) / FADE_DURATION));
            context.save();
            context.globalAlpha = alpha;
            context.translate(flake.x, flake.y);
            context.filter = 'brightness(0) invert(1)';
            context.drawImage(snowflakeImg, -flake.radius * 12, -flake.radius * 12, flake.radius * 24, flake.radius * 24);
            context.restore();
            return (flake.fadeElapsed || 0) < FADE_DURATION;
        });

        layers.forEach((layer) => {
            // Remove off-screen flakes
            layer.flakes = layer.flakes.filter(flake => flake.y < window.innerHeight + flake.radius * 24);
            // Add new flakes to maintain count
            while (layer.flakes.length < layer.count) {
                layer.flakes.push(createSnowflake(layer.flakes[0]?.layer ?? 0, -5));
            }
            // Animate/draw falling flakes
            layer.flakes.forEach((flake, i) => {
                context.save();
                context.globalAlpha = 0.4;
                context.translate(flake.x, flake.y);
                context.filter = 'brightness(0) invert(1)';
                context.drawImage(snowflakeImg, -flake.radius * 12, -flake.radius * 12, flake.radius * 24, flake.radius * 24);
                context.restore();

                flake.y += flake.fallSpeed;
                flake.x += flake.drift;

                // Pile up logic
                const pileX = Math.round(flake.x);
                if (pileX >= 0 && pileX < snowPile.length) {
                    if (flake.y + flake.radius * 12 >= snowPile[pileX]) {
                        // Move to settledFlakes for fading
                        settledFlakes.push({ ...flake, isSettled: true, fadeElapsed: 0 });
                        // Raise the pile based on flake size
                        for (let dx = -flake.radius * 6; dx <= flake.radius * 6; dx++) {
                            const px = pileX + dx;
                            if (px >= 0 && px < snowPile.length) {
                                snowPile[px] -= flake.radius * 2; // SNOWPILE_HEIGHT based on radius
                            }
                        }
                        // Remove from falling flakes
                        layer.flakes[i] = createSnowflake(layer.flakes[i].layer, -5);
                    }
                }

                // Wrap horizontal
                if (flake.x > window.innerWidth) flake.x = 0;
                if (flake.x < 0) flake.x = window.innerWidth;
            });
        });

        animationFrameId = window.requestAnimationFrame(drawFrame);
    }

    onMount(() => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        snowflakeImg = new window.Image();
        snowflakeImg.src = "/src/assets/snowflake.svg";
        snowflakeImg.onload = () => {
            context = canvas.getContext("2d")!;
            resizeCanvas();
            initializeLayers();
            drawFrame();
        };
        window.addEventListener("resize", resizeCanvas);
    });

    onDestroy(() => {
        if (animationFrameId) window.cancelAnimationFrame(animationFrameId);
        window.removeEventListener("resize", resizeCanvas);
    });
</script>

<canvas
        bind:this={canvas}
        class="fixed inset-0 pointer-events-none z-[999999]"
></canvas>
