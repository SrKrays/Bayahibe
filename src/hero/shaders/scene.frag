// ============================================================================
//  Bayahibe · shader único del hero
//
//  Capas (de atrás hacia adelante):
//    1. CIELO INFINITO  · textura de cielo "sin palmeras" que se desplaza sin fin
//    2. ESCENA          · foto con mar en movimiento y palmeras mecidas por la brisa
//    3. BASURA          · aparece en "time-lapse" (Acto 2)
//    4. PROPS           · tachos, cartel, manglares (Acto 4)
//    5. 2036            · disolución (Acto 3)
//    6. Color / luz
//
//  QUALITY (lo inyecta HeroScene según el equipo): 0 flojo · 1 medio · 2 alto
// ============================================================================
#ifndef QUALITY
#define QUALITY 2
#endif

#if QUALITY >= 2
#define OCTAVES 3
#else
#define OCTAVES 2
#endif

in vec2 vUV;
out vec4 finalColor;

uniform sampler2D uBase;   // fondo limpio (Actos 1, 2, 4)
uniform sampler2D uAlt;    // fondo 2036 (Acto 3)
uniform sampler2D uSky;    // cielo sin palmeras, en espejo (2 anchos de imagen)
uniform sampler2D uMask;   // R mar · G vegetación · B cielo
uniform sampler2D uZones;  // R zona basura · G zona props · B "día" de aparición de cada objeto de basura
uniform sampler2D uTrash;  // capas de basura (premultiplicadas)
uniform sampler2D uProps;  // props del Acto 4 (premultiplicados)
uniform sampler2D uPeople; // gente limpiando (Acto 3 → 4, premultiplicada)

uniform float uTime;          // tiempo de escena (se acelera en el time-lapse)
uniform vec3  uAmp;           // intensidad: mar · palmeras · cielo
uniform vec4  uCover;         // xy = escala, zw = offset (object-fit: cover)
uniform vec2  uTexel;         // 1 / tamaño de la imagen
uniform vec4  uSkyInfo;       // x = alto del cielo (fracción de la imagen) · y = horizonte · z = desplazamiento del cielo
uniform float uTrashAmount;        // 0..1 cuánta basura hay (escalonado: time-lapse)
uniform float uNight;         // 0..1 oscuridad de "noche" durante el time-lapse
uniform float uRewind;        // 0..1 efecto de cinta rebobinando (Acto 3 → 4)
uniform float uPeopleAmount;  // 0..1 gente limpiando
uniform float uFlash;         // 0..1 destello del "¡pum!" final
uniform vec4  uPropsReveal;   // manglares · tachos · estación · (libre)
uniform float uAltMix;        // 0 = limpio · 1 = 2036
uniform float uSun;           // 0..1 sol (sombras de nubes + rayos)
uniform vec4  uGrade;         // saturación · brillo · calidez · contraste

// ---------------------------------------------------------------- ruido -----
float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < OCTAVES; i++) {
    v += a * noise(p);
    p *= 2.03;
    a *= 0.5;
  }
  return v;
}

float zoneIndex(float encoded) {
  return floor(encoded * 255.0 / 32.0 + 0.5);
}

void main() {
  vec2 uv = vUV * uCover.xy + uCover.zw;

  // ---- REBOBINADO: la imagen "patina" en franjas horizontales, como una cinta VHS
  float tape = 0.0;
  if (uRewind > 0.001) {
    float band = floor(vUV.y * 48.0);
    float jitter = noise(vec2(band, uTime * 6.0)) - 0.5;
    uv.x += jitter * 0.012 * uRewind;
    // barra de tracking que sube
    tape = smoothstep(0.06, 0.0, abs(fract(vUV.y + uTime * 0.35) - 0.5)) * uRewind;
  }
  vec3 m = texture(uMask, uv).rgb;   // mar, vegetación, cielo
  float t = uTime;
  float life = 1.0 - uAltMix * 0.6;  // en 2036 el mundo se mueve menos
  vec2 duv = uv;

  // ======================= PALMERAS · brisa continua ========================
  // Sólo se mueven fuerte las copas que tienen cielo alrededor (no las casas).
  if (m.g > 0.01) {
    float skyAround = max(texture(uMask, uv + vec2(0.0, -0.025)).b,
                          max(texture(uMask, uv + vec2(0.02, 0.0)).b, texture(uMask, uv - vec2(0.02, 0.0)).b));
    float crown = smoothstep(0.66, 0.12, uv.y) * mix(0.25, 1.0, skyAround);
    // ráfagas que viajan de izquierda a derecha (cada palmera las recibe en su momento)
    float gust = 0.55 + 0.45 * noise(vec2(uv.x * 2.0 - t * 0.35, t * 0.12));
    float sway = sin(t * 1.1 - uv.x * 4.0) * 0.7 + sin(t * 2.4 - uv.x * 9.0) * 0.3;
    float leaves = noise(uv * vec2(14.0, 10.0) + vec2(t * 1.8, t * 0.7)) - 0.5;     // hojas temblando
    vec2 vegOff = vec2(sway * 0.009 * gust + leaves * 0.0035, (abs(sway) * 0.002 + leaves * 0.0015));
    duv += vegOff * m.g * crown * uAmp.y * life;
  }

  // ======================= MAR · agua que fluye sin parar ===================
  // Plano en perspectiva: olas chicas y rápidas al fondo, grandes y lentas cerca.
  float seaLight = 0.0;
  if (m.r > 0.01) {
    float horizon = uSkyInfo.y;
    float p = clamp((uv.y - horizon) / 0.2, 0.0, 1.0);          // 0 horizonte → 1 orilla
    vec2 q = vec2(uv.x / (0.12 + p) * 3.0, 1.6 / (0.08 + p));   // coordenadas del plano del mar
    vec2 w1 = q * vec2(1.0, 1.0) + vec2(t * 0.15, t * 0.9);      // oleaje hacia la costa
    vec2 w2 = q * vec2(1.7, 1.3) + vec2(-t * 0.22, t * 0.55);    // corriente cruzada
    float n1 = fbm(w1);
    float n2 = fbm(w2 + 9.0);
    vec2 seaOff = vec2(n1 - n2, (n1 + n2 - 1.0) * 0.6) * mix(0.0025, 0.009, p);
    duv += seaOff * m.r * uAmp.x * life;
    // brillo del sol que corre sobre las crestas
    float crest = 1.0 - abs(n1 + n2 - 1.0) * 2.0;
    seaLight = pow(clamp(crest, 0.0, 1.0), 6.0) * mix(0.35, 0.18, p);
  }

  // ======================= ESCENA + CIELO INFINITO ==========================
  vec3 scene = texture(uBase, duv).rgb;

#if QUALITY >= 2
  // enfoque suave (la foto ya viene escalada con IA: poco)
  vec3 blur = (texture(uBase, duv + vec2(uTexel.x, 0.0)).rgb + texture(uBase, duv - vec2(uTexel.x, 0.0)).rgb +
               texture(uBase, duv + vec2(0.0, uTexel.y)).rgb + texture(uBase, duv - vec2(0.0, uTexel.y)).rgb) * 0.25;
  scene += (scene - blur) * 0.25;
#endif

  vec3 col = scene;
  float skyHere = texture(uMask, duv).b;   // ¿lo que quedó en este pixel es cielo?
  if (skyHere > 0.01) {
    // el cielo avanza siempre hacia la derecha; la textura está en espejo así nunca se corta
    vec2 suv = vec2(fract((uv.x - uSkyInfo.z) * 0.5), uv.y / uSkyInfo.x);
    vec3 sky = texture(uSky, suv).rgb;
    col = mix(scene, sky, skyHere);
  }

  // ======================= LUZ SOBRE EL AGUA ================================
  if (m.r > 0.01) {
    col += vec3(1.0, 0.98, 0.92) * seaLight * m.r * (0.5 + uSun * 0.5) * uAmp.x / 1.5;
#if QUALITY >= 1
    // espuma rompiendo en la orilla, en ciclos
    float below = texture(uMask, uv + vec2(0.0, 0.014)).r;
    float shore = clamp(m.r - below, 0.0, 1.0);
    float waveCycle = 0.5 + 0.5 * sin(t * 1.6 - uv.x * 26.0 + noise(uv * 30.0) * 4.0);
    col = mix(col, vec3(0.97, 0.99, 1.0), shore * waveCycle * 0.7 * life);
#endif
  }

  // ======================= BASURA · time-lapse (Acto 2) =====================
  // Cada pieza tiene su "día" de aparición: con el escalonado del time-lapse,
  // van apareciendo de a tandas, de golpe, como fotos tomadas noche tras noche.
  if (uTrashAmount > 0.001) {
    vec4 trash = texture(uTrash, duv);
    if (uTrashAmount < 0.999) {
      // zones.b = "día" (0..1) de cada objeto, calculado por objeto en build-textures
      float piece = texture(uZones, duv).b;
      trash *= step(piece, uTrashAmount);
    }
    col = col * (1.0 - trash.a) + trash.rgb;
  }

  // ======================= GENTE LIMPIANDO (Acto 3 → 4) =====================
  // Aparecen subiendo desde abajo y se mueven como agachándose a juntar basura.
  if (uPeopleAmount > 0.001) {
    float bend = sin(t * 3.4 + uv.x * 26.0) * 0.0022;            // vaivén de agacharse
    float rise = (1.0 - smoothstep(0.0, 1.0, uPeopleAmount)) * 0.02; // entran desde abajo
    vec4 pp = texture(uPeople, duv + vec2(0.0, bend + rise));
    float k = smoothstep(0.0, 0.6, uPeopleAmount);
    col = col * (1.0 - pp.a * k) + pp.rgb * k;
  }

  // ======================= PROPS (Acto 4) ===================================
  if (dot(uPropsReveal, vec4(1.0)) > 0.001) {
    vec2 z = texture(uZones, uv).rg;
    vec4 props = texture(uProps, duv);
    float pi = zoneIndex(z.g);
    float pAmount = dot(vec4(equal(vec4(pi), vec4(1.0, 2.0, 3.0, 4.0))), uPropsReveal);
    float pk = smoothstep(0.0, 0.18, pAmount * 1.25 - noise(uv * 90.0));
    col = col * (1.0 - props.a * pk) + props.rgb * pk;
  }

#if QUALITY >= 1
  // ======================= SOMBRAS DE NUBES (viajan con el cielo) ===========
  if (uSun > 0.01) {
    float cs = smoothstep(0.5, 0.78, fbm(uv * vec2(2.2, 3.0) + vec2(-t * 0.06 * uAmp.z, t * 0.01)));
    col *= 1.0 - cs * 0.15 * uSun * (1.0 - m.b);
  }
#endif

#if QUALITY >= 2
  // ======================= RAYOS DE SOL ======================================
  if (uSun > 0.01) {
    vec2 dir = uv - vec2(0.86, -0.12);
    float ang = atan(dir.y, dir.x);
    float rays = noise(vec2(ang * 18.0, t * 0.15)) * noise(vec2(ang * 7.0 - t * 0.05, 3.0));
    col += vec3(1.0, 0.92, 0.75) * rays * smoothstep(1.1, 0.0, length(dir)) * 0.2 * uSun;
  }
#endif

  // ======================= 2036 (Acto 3) =====================================
  if (uAltMix > 0.001) {
    vec3 alt = texture(uAlt, uv).rgb;
    float wear = fbm(uv * 4.0) * 0.65 + (1.0 - uv.y) * 0.35;
    float ak = smoothstep(wear - 0.2, wear + 0.2, uAltMix * 1.4 - 0.2);
    col = mix(col, alt, ak);
  }

  // ======================= COLOR =============================================
  float lum = dot(col, vec3(0.2126, 0.7152, 0.0722));
  col = mix(vec3(lum), col, uGrade.x);
  col *= uGrade.y;
  col *= vec3(1.0 + uGrade.z * 0.09, 1.0 + uGrade.z * 0.02, 1.0 - uGrade.z * 0.12);
  col = (col - 0.5) * uGrade.w + 0.5;

  // noche del time-lapse: azul oscuro, como un día que pasa en un segundo
  col = mix(col, col * vec3(0.18, 0.24, 0.42), uNight);

  // rebobinado: líneas de barrido, barra de tracking y un leve corrimiento de color
  if (uRewind > 0.001) {
    float scan = 0.5 + 0.5 * sin(vUV.y * 900.0);
    col *= 1.0 - scan * 0.12 * uRewind;
    col += tape * 0.35;
    col = mix(col, col.brg * 0.15 + col * 0.85, 0.5 * uRewind);
  }

  vec2 v = vUV - 0.5;
  col *= 1.0 - dot(v, v) * 0.45;

  // "¡pum!": destello cálido que tapa el cambio al Bayahibe recuperado
  if (uFlash > 0.001) {
    float glow = 1.0 - length(v) * 0.9;
    col = mix(col, vec3(1.0, 0.98, 0.9), clamp(uFlash * (0.75 + glow * 0.35), 0.0, 1.0));
  }

  finalColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
