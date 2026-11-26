/**
 * HeroScene
 * ------------------------------------------------------------
 * Toda la parte Pixi del hero, aislada de React.
 * React sólo crea/destruye la escena y GSAP anima los valores de `state`;
 * el ticker los traduce a uniforms del shader en cada frame.
 *
 * Rendimiento:
 *  - Perfil de calidad según el equipo (quality.ts) → define el shader y la resolución.
 *  - Monitor de FPS: si el equipo no llega, baja la resolución sola (hasta 2 veces)
 *    y como último recurso limita a 30 fps.
 *  - Aves como sprites (3 texturas pre-dibujadas), sin redibujar geometría por frame.
 *  - Render pausado cuando el hero no está en pantalla.
 *
 * Carga escalonada:
 *   1. create()      → base + mask + zones   (lo justo para el Acto 1)
 *   2. loadRest()    → trash, alt, props, people (mientras se lee la intro;
 *                      people es opcional: si no existe, la limpieza se ve sin gente)
 */
import {
  Application,
  Assets,
  Container,
  GlProgram,
  Graphics,
  Mesh,
  MeshGeometry,
  Shader,
  Sprite,
  Texture,
  type TextureSource,
} from 'pixi.js';
import vertex from './shaders/scene.vert?raw';
import fragmentSrc from './shaders/scene.frag?raw';
import {
  GRADES,
  LAPSE,
  MOTION,
  SKY,
  PORTRAIT,
  QUALITY_PROFILES,
  TEXTURE_SIZES,
  TEXTURES,
  TEXTURE_EXT,
  type Grade,
  type QualityTier,
} from './config';
import { detectQuality, supportsAvif } from './quality';

/** Valores "lógicos" que anima GSAP. */
export interface SceneState {
  /** Acto 1 → 2 (color) */
  intro: number;
  /** Time-lapse de la basura: 0 = limpio · 1 = pasaron los "días" y la basura quedó */
  lapse: number;
  /** Time-lapse de años: 0 = 2026 · 1 = 2036 */
  decade: number;
  /** Rebobinado de años: 0 = 2036 · 1 = de vuelta a hoy (todavía sucio) */
  rewind: number;
  /** Aparición de la gente limpiando (0..1) */
  people: number;
  /** Limpieza: 0 = toda la basura · 1 = levantada (desaparece por tandas) */
  cleanup: number;
  /** Destello del "¡pum!" antes de que aparezca el Bayahibe recuperado (0..1) */
  flash: number;
  /** Acto 4: tono de atardecer + props */
  toHope: number;
  propsMangroves: number;
  propsBins: number;
  propsStation: number;
}

type TexKey = keyof typeof TEXTURES;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerpGrade = (a: Grade, b: Grade, t: number): Grade => ({
  saturation: lerp(a.saturation, b.saturation, t),
  brightness: lerp(a.brightness, b.brightness, t),
  warmth: lerp(a.warmth, b.warmth, t),
  contrast: lerp(a.contrast, b.contrast, t),
});

interface Bird {
  sprite: Sprite;
  x: number; // 0..1 ancho
  y: number; // 0..1 alto
  speed: number;
  size: number;
  phase: number;
  flap: number;
}

export class HeroScene {
  readonly state: SceneState = {
    intro: 0,
    lapse: 0,
    decade: 0,
    rewind: 0,
    people: 0,
    cleanup: 0,
    flash: 0,
    toHope: 0,
    propsMangroves: 0,
    propsBins: 0,
    propsStation: 0,
  };

  readonly tier: QualityTier;
  private app: Application;
  private mesh!: Mesh<MeshGeometry, Shader>;
  private shader!: Shader;
  private birdLayer = new Container();
  private birds: Bird[] = [];
  private birdFrames: Texture[] = [];
  private imageSize = { w: 16, h: 9 };
  private suffix: string;
  private motion: number;
  private skyDrift = 0;
  private panTime = 0;
  /** pixeles de pantalla por pixel de imagen (para escalar las aves igual en cualquier pantalla) */
  private coverScale = 1;
  private loaded = new Set<TexKey>();
  private destroyed = false;
  private visibilityObserver?: IntersectionObserver;
  private fps = { elapsed: 0, frames: 0, downgrades: 0, warmup: 1.2 };

  private avif = false;

  private constructor(app: Application, tier: QualityTier, suffix: string, reducedMotion: boolean) {
    this.app = app;
    this.tier = tier;
    this.suffix = suffix;
    // con "reducir movimiento" del sistema la escena sigue viva, pero más calma
    this.motion = reducedMotion ? 0.45 : 1;
  }

  /** Crea la escena dentro de `container`. Rechaza si no hay WebGL. */
  static async create(container: HTMLElement): Promise<HeroScene> {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const tier = detectQuality();
    const profile = QUALITY_PROFILES[tier];
    const { resolution, suffix } = pickRender(container, tier);
    const avif = await supportsAvif();

    const app = new Application();
    await app.init({
      resizeTo: container,
      preference: 'webgl', // el shader está en GLSL
      antialias: false, // quad a pantalla completa + aves en textura: no hace falta
      backgroundAlpha: 0,
      resolution,
      autoDensity: true,
      powerPreference: tier === 2 ? 'high-performance' : undefined,
    });
    app.ticker.maxFPS = profile.maxFPS;

    const scene = new HeroScene(app, tier, suffix, reducedMotion);
    scene.avif = avif;
    await scene.setup();
    container.appendChild(app.canvas);
    scene.observeVisibility(container);
    if (import.meta.env.DEV)
      console.info(
        `[Hero] calidad ${tier} · resolución ${resolution.toFixed(2)} · texturas ${suffix || 'full'} · ${avif ? 'avif' : 'webp'}`,
      );
    return scene;
  }

  // ------------------------------------------------------------------ texturas
  private url(key: TexKey) {
    // las fotos tienen versión AVIF (mitad de peso, más calidad); datos (mask/zones) no
    const ext = this.avif && TEXTURE_EXT[key] === 'webp' && key !== 'mask' ? 'avif' : TEXTURE_EXT[key];
    // máscaras y zonas son datos suaves: con 1920 alcanza (ahorra ~20 MB de memoria de GPU)
    const suffix = (key === 'mask' || key === 'zones') && this.suffix === '' ? '-md' : this.suffix;
    return `/textures/${TEXTURES[key]}${suffix}.${ext}`;
  }

  private async loadTextures(keys: TexKey[]) {
    const pending = keys.filter((k) => !this.loaded.has(k));
    if (!pending.length) return;
    const textures = await Promise.all(pending.map((k) => Assets.load<Texture>(this.url(k))));
    if (this.destroyed) return;
    pending.forEach((key, i) => {
      const tex = textures[i];
      tex.source.style.addressMode = 'clamp-to-edge';
      tex.source.style.scaleMode = 'linear';
      this.setTexture(key, tex.source);
      this.loaded.add(key);
      if (key === 'base') {
        this.imageSize = { w: tex.width, h: tex.height };
        const u = this.shader.resources.sceneUniforms.uniforms;
        u.uTexel[0] = 1 / tex.source.pixelWidth;
        u.uTexel[1] = 1 / tex.source.pixelHeight;
      }
    });
  }

  private setTexture(key: TexKey, source: TextureSource) {
    const uniformName = {
      base: 'uBase',
      alt: 'uAlt',
      sky: 'uSky',
      mask: 'uMask',
      zones: 'uZones',
      trash: 'uTrash',
      props: 'uProps',
      people: 'uPeople',
    }[key];
    this.shader.resources[uniformName] = source;
  }

  /** Basura, 2036 y props. Llamar apenas arranca (bajan mientras se lee la intro). */
  loadRest() {
    // la capa de gente es opcional: si todavía no está generada, no rompe nada
    this.loadTextures(['people']).catch(() => {
      if (import.meta.env.DEV) console.info('[Hero] sin capa de gente (people): la limpieza se ve sin personas');
    });
    return this.loadTextures(['trash', 'alt', 'props']);
  }

  // --------------------------------------------------------------------- setup
  private async setup() {
    const empty = Texture.EMPTY.source;
    const fragment = `#define QUALITY ${this.tier}\n${fragmentSrc}`;
    const amount = MOTION.amount;

    this.shader = new Shader({
      glProgram: GlProgram.from({
        vertex,
        fragment,
        name: `bayahibe-hero-q${this.tier}`,
        preferredFragmentPrecision: 'highp', // mediump rompe el ruido (puntos blancos) en muchos celulares
      }),
      resources: {
        uBase: empty,
        uAlt: empty,
        uSky: empty,
        uMask: empty,
        uZones: empty,
        uTrash: empty,
        uProps: empty,
        uPeople: empty,
        sceneUniforms: {
          uTime: { value: 0, type: 'f32' },
          uAmp: { value: new Float32Array([amount.sea, amount.palms, amount.sky]), type: 'vec3<f32>' },
          uCover: { value: new Float32Array([1, 1, 0, 0]), type: 'vec4<f32>' },
          uTexel: { value: new Float32Array([1 / 1672, 1 / 941]), type: 'vec2<f32>' },
          uSkyInfo: { value: new Float32Array([SKY.plateHeight, SKY.horizon, 0, 0]), type: 'vec4<f32>' },
          uTrashAmount: { value: 0, type: 'f32' },
          uNight: { value: 0, type: 'f32' },
          uRewind: { value: 0, type: 'f32' },
          uPeopleAmount: { value: 0, type: 'f32' },
          uFlash: { value: 0, type: 'f32' },
          uPropsReveal: { value: new Float32Array(4), type: 'vec4<f32>' },
          uAltMix: { value: 0, type: 'f32' },
          uSun: { value: 1, type: 'f32' },
          uGrade: { value: new Float32Array([1, 1, 0, 1]), type: 'vec4<f32>' },
        },
      },
    });

    const geometry = new MeshGeometry({
      positions: new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]),
      uvs: new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]),
      indices: new Uint32Array([0, 1, 2, 0, 2, 3]),
    });
    this.mesh = new Mesh({ geometry, shader: this.shader });
    this.app.stage.addChild(this.mesh, this.birdLayer);
    this.createBirds();

    // Acto 1: sólo lo indispensable
    await this.loadTextures(['base', 'mask', 'zones', 'sky']);
    this.app.ticker.add(this.update);
  }

  /** 3 poses de ala dibujadas una sola vez y convertidas en textura. */
  private createBirds() {
    const poses = [-1, 0, 1];
    this.birdFrames = poses.map((wing) => {
      const s = 24;
      const g = new Graphics()
        .moveTo(-s, -wing * s * 0.55)
        .quadraticCurveTo(-s * 0.45, -s * 0.35 - wing * s * 0.2, 0, 0)
        .quadraticCurveTo(s * 0.45, -s * 0.35 - wing * s * 0.2, s, -wing * s * 0.55)
        .stroke({ width: 3.4, color: 0x1d2629, cap: 'round', join: 'round' });
      const tex = this.app.renderer.generateTexture({ target: g, resolution: 2, antialias: true });
      g.destroy();
      return tex;
    });

    const count = QUALITY_PROFILES[this.tier].birds;
    for (let i = 0; i < count; i++) {
      const sprite = new Sprite(this.birdFrames[1]);
      sprite.anchor.set(0.5);
      sprite.alpha = 0.78;
      this.birdLayer.addChild(sprite);
      this.birds.push({
        sprite,
        x: Math.random(),
        y: 0.06 + Math.random() * 0.22,
        speed: 0.014 + Math.random() * 0.02,
        size: 0.3 + Math.random() * 0.35,
        phase: Math.random() * Math.PI * 2,
        flap: 5 + Math.random() * 3,
      });
    }
  }

  private updateBirds(dt: number, time: number, W: number, H: number, alpha: number) {
    this.birdLayer.visible = alpha > 0.01;
    if (!this.birdLayer.visible) return;
    this.birdLayer.alpha = alpha;
    // tamaño relativo a la foto (en vertical la foto se ve grande: las aves también)
    const k = (this.coverScale * this.imageSize.w) / 1440;
    for (const b of this.birds) {
      b.x += b.speed * dt;
      if (b.x > 1.08) {
        b.x = -0.08;
        b.y = 0.06 + Math.random() * 0.22;
      } else if (b.x < -0.1) {
        b.x = 1.06; // rebobinando: vuelan hacia atrás
      }
      const glide = Math.sin(time * 0.6 + b.phase) > 0.3;
      const wing = glide ? 0 : Math.sin(time * b.flap + b.phase);
      b.sprite.texture = this.birdFrames[wing < -0.35 ? 0 : wing > 0.35 ? 2 : 1];
      b.sprite.position.set(b.x * W, (b.y + Math.sin(time * 0.8 + b.phase) * 0.012) * H);
      b.sprite.scale.set(b.size * k);
    }
  }

  // -------------------------------------------------------------------- frame
  private update = () => {
    const u = this.shader.resources.sceneUniforms.uniforms;
    const { width: W, height: H } = this.app.screen;
    const s = this.state;
    const dt = this.app.ticker.deltaMS / 1000;

    this.watchPerformance(dt);

    // ---- encuadre cover
    const scale = Math.max(W / this.imageSize.w, H / this.imageSize.h);
    const sx = W / (this.imageSize.w * scale);
    const sy = H / (this.imageSize.h * scale);
    u.uCover[0] = sx;
    u.uCover[1] = sy;
    // horizontal: centrado. Vertical (celular): la cámara recorre el pueblo despacio.
    let focus = 0.5;
    if (sx < 0.8) {
      this.panTime += dt * this.motion;
      const swing = Math.sin((this.panTime / PORTRAIT.panPeriod) * Math.PI * 2);
      focus = PORTRAIT.focus + swing * PORTRAIT.pan;
    }
    u.uCover[2] = Math.min(1 - sx, Math.max(0, focus - sx / 2));
    u.uCover[3] = (1 - sy) / 2;
    this.coverScale = scale;
    this.mesh.scale.set(W, H);

    // ================= TIME-LAPSES =================
    // Tres "corridas" con el mismo lenguaje: días (1→2), años (2→3), rebobinado (3→4).
    const L = LAPSE;
    const running = (v: number) => v > 0 && v < 1;
    const bell = (v: number) => (running(v) ? Math.sin(Math.PI * v) : 0); // 0 → 1 → 0
    const pulse = (phase: number, depth: number) => Math.pow(0.5 - 0.5 * Math.cos(phase * Math.PI * 2), 3) * depth;
    const steps = (v: number, n: number) => Math.min(1, Math.floor(v * n + 0.5) / n);
    const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

    // rebobinado: deshace los años (2036 → hoy). La basura de hoy la levanta la gente.
    const rYears = clamp01(s.rewind);

    // tiempo de escena: se acelera en los time-lapses y va HACIA ATRÁS al rebobinar
    const warp =
      1 +
      L.timeWarp * (bell(s.lapse) + bell(s.decade)) -
      (1 + L.timeWarp) * 1.4 * bell(s.rewind) +
      L.cleanupWarp * bell(s.cleanup); // la limpieza va "en cámara rápida
    u.uTime += dt * this.motion * warp;
    // cielo: deriva continua + cada corrida da UNA vuelta entera (2 anchos = un ciclo del
    // espejo) → al terminar, las nubes están donde estaban. Al rebobinar, la vuelta es hacia atrás.
    this.skyDrift += dt * this.motion * 0.006 * MOTION.amount.sky;
    u.uSkyInfo[2] = (((this.skyDrift + 2 * (s.lapse + s.decade - s.rewind)) % 2) + 2) % 2;

    // noches (días) · estaciones (años) · y las mismas al revés en el rebobinado
    let night = 0;
    if (running(s.lapse)) night = pulse(s.lapse * L.days, L.nightDepth);
    else if (running(s.decade)) night = pulse(s.decade * L.years, L.yearDepth);
    else if (rYears > 0 && rYears < 1) night = pulse(rYears * L.years, L.yearDepth);
    u.uNight = night;

    // 2036: sube por escalones con los años, baja por escalones al rebobinar
    const hasAlt = this.loaded.has('alt') ? 1 : 0;
    const altMix = hasAlt * (s.decade >= 1 ? 1 - steps(rYears, L.years) : steps(s.decade, L.years));
    u.uAltMix = altMix;

    // basura: aparece por tandas (días) y desaparece por tandas al rebobinar
    const hasTrash = this.loaded.has('trash') ? 1 : 0;
    const trashIn = s.lapse >= 1 ? 1 : steps(s.lapse, L.days);
    const trashOut = s.cleanup > 0 ? 1 - steps(s.cleanup, L.cleanupSteps) : 1;
    u.uTrashAmount = hasTrash * trashIn * trashOut;

    // efecto "cinta rebobinando"
    u.uRewind = bell(s.rewind);

    // gente limpiando + destello final
    u.uPeopleAmount = this.loaded.has('people') ? s.people : 0;
    u.uFlash = s.flash;

    // ---- color: 1 → 2 (días) → 3 (años) → vuelta atrás → 4 (atardecer)
    const dirty = s.intro * trashOut;
    let g = lerpGrade(GRADES[1], GRADES[2], dirty);
    g = lerpGrade(g, GRADES[3], altMix);
    g = lerpGrade(g, GRADES[4], s.toHope);
    u.uGrade[0] = g.saturation;
    u.uGrade[1] = g.brightness;
    u.uGrade[2] = g.warmth;
    u.uGrade[3] = g.contrast;

    // ---- props del Acto 4
    const hasProps = this.loaded.has('props') ? 1 : 0;
    u.uPropsReveal[0] = s.propsMangroves * hasProps;
    u.uPropsReveal[1] = s.propsBins * hasProps;
    u.uPropsReveal[2] = s.propsStation * hasProps;

    // ---- sol: pleno en Actos 1 y 4, apagado en 2036
    u.uSun = Math.max(lerp(1, 0.6, dirty) * (1 - altMix), s.toHope);

    // ---- aves: se van en 2036
    this.updateBirds(dt * this.motion * warp, u.uTime, W, H, 1 - altMix);
  };

  /**
   * Mide los FPS reales cada 2 s. Si no llega a ~45, baja la resolución del canvas
   * (la foto sigue viéndose bien) y, como último recurso, limita a 30 fps.
   */
  private watchPerformance(dt: number) {
    const f = this.fps;
    if (f.warmup > 0) {
      f.warmup -= dt;
      return;
    }
    f.elapsed += dt;
    f.frames++;
    if (f.elapsed < 2) return;
    const avg = f.frames / f.elapsed;
    f.elapsed = 0;
    f.frames = 0;

    const target = this.app.ticker.maxFPS || 60;
    if (avg >= target * 0.75) return;

    const renderer = this.app.renderer;
    if (f.downgrades < 2 && renderer.resolution > 0.55) {
      f.downgrades++;
      const next = Math.max(0.5, renderer.resolution * 0.75);
      renderer.resize(this.app.screen.width, this.app.screen.height, next);
      if (import.meta.env.DEV) console.info(`[Hero] ${avg.toFixed(0)} fps → resolución ${next.toFixed(2)}`);
    } else if (this.app.ticker.maxFPS !== 30) {
      this.app.ticker.maxFPS = 30;
      if (import.meta.env.DEV) console.info('[Hero] limitado a 30 fps');
    }
  }

  /** Pausa el render cuando el hero no está en pantalla (ahorra GPU y batería). */
  private observeVisibility(el: HTMLElement) {
    this.visibilityObserver = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) this.app.ticker.start();
      else this.app.ticker.stop();
    });
    this.visibilityObserver.observe(el);
  }

  destroy() {
    this.destroyed = true;
    this.visibilityObserver?.disconnect();
    this.app.ticker.remove(this.update);
    this.birdFrames.forEach((t) => t.destroy(true));
    this.app.destroy(true, { children: true, texture: false });
  }
}

/**
 * Elige resolución del canvas y tamaño de textura según lo que la foto
 * REALMENTE ocupa en pantalla (en vertical se ve mucho más grande).
 */
function pickRender(container: HTMLElement, tier: QualityTier) {
  const profile = QUALITY_PROFILES[tier];
  const w = Math.max(1, container.clientWidth || window.innerWidth);
  const h = Math.max(1, container.clientHeight || window.innerHeight);
  const dpr = window.devicePixelRatio || 1;

  // resolución: lo más nítida posible sin pasar el presupuesto de pixeles del perfil
  const byBudget = Math.sqrt(profile.pixelBudget / (w * h));
  const resolution = Math.max(0.6, Math.min(dpr, profile.maxDpr, byBudget));

  // ancho con el que se dibuja la foto (cover 16:9) en pixeles reales
  const imageAspect = 16 / 9;
  const drawnWidth = Math.max(w, h * imageAspect) * resolution;
  // celulares en vertical con memoria suficiente: la foto se ve MUY ampliada → textura grande
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
  const maxTexture = tier >= 1 && h > w && memory >= 4 ? 2560 : profile.maxTexture;
  const fit = TEXTURE_SIZES.find((t) => t.width >= drawnWidth * 0.9 && t.width <= maxTexture);
  const capped = [...TEXTURE_SIZES].reverse().find((t) => t.width <= maxTexture)!;
  return { resolution, suffix: (fit ?? capped).suffix };
}
