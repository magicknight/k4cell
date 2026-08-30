#!/usr/bin/env python3
"""k4cell.com hero plate — deterministic concept art.  NOT AN OBSERVATION.

WHAT THIS IS
  A Zel'dovich (1970) first-order displacement of a uniform Lagrangian grid,
  seeded by a Gaussian random field with a scale-free spectrum P(k) ~ k^SLOPE
  and a Gaussian small-scale cut.  This is the textbook toy that produces the
  filament / node / void morphology of large-scale structure.

WHAT THIS IS NOT
  Not a cosmological simulation.  Not fitted to any survey.  No telescope data
  is used.  No quantity from the K4 Cell Framework enters it at any point.
  The image is a pure function of this file: same file -> same bytes.

USAGE
  python3 hero_plate_final.py OUTDIR
  writes OUTDIR/hero-web-land.webp  (1920x1080)  and
         OUTDIR/hero-web-port.webp  (1080x1440)
  and prints byte sizes plus the WCAG contrast gate.

  NOT run by `npm run build`.  Run once by hand; commit the two .webp files to
  src/assets/ and record the sha256 sums plus the versions printed below in
  provenance/.  Regenerating on a different numpy / Pillow may produce
  different bytes; the committed binaries are the artefact of record.
"""
import hashlib, os, sys
import numpy as np
from PIL import Image
import PIL

SEED  = 20260830
SLOPE = -1.0     # P(k) ~ k^SLOPE driver for the seeding Gaussian field
DGROW = 1.4      # Zel'dovich growth factor (displacement amplitude)
KCUT  = 0.25     # Gaussian small-scale cut on the seeding field

LAND = dict(NX=1920, NY=1080, npx=2880, npy=1620, mode="land", q=58,
            bandlo=0.09, bandx=0.34, bandw=0.44, footcut=0.90, footy=0.68, foots=0.26)
PORT = dict(NX=1080, NY=1440, npx=1620, npy=2160, mode="port", q=58,
            bandlo=0.05, bandx=0.42, bandw=0.26, footcut=0.30, footy=0.93, foots=0.07)

# ---------------------------------------------------------------- field ----
def zeldovich(NX, NY, npx, npy, seed, slope, D, kcut):
    rng = np.random.default_rng(seed)
    F = np.fft.rfft2(rng.standard_normal((npy, npx)))
    s = min(npx, npy)
    KX = (np.fft.rfftfreq(npx) * (npx / s))[None, :]
    KY = (np.fft.fftfreq(npy) * (npy / s))[:, None]
    k2 = KX**2 + KY**2; k2[0, 0] = 1.0
    k = np.sqrt(k2)
    amp = (k ** (slope / 2.0)) * np.exp(-0.5 * (k / kcut) ** 2); amp[0, 0] = 0.0
    dk = F * amp
    psix = np.fft.irfft2(-1j * KX / k2 * dk, s=(npy, npx))
    psiy = np.fft.irfft2(-1j * KY / k2 * dk, s=(npy, npx))
    n = np.hypot(psix.std(), psiy.std()); psix /= n; psiy /= n
    qx = (np.arange(npx) + 0.5) * (NX / npx); qy = (np.arange(npy) + 0.5) * (NY / npy)
    X = np.mod((qx[None, :] + D * psix * NX * 0.02).ravel(), NX)
    Y = np.mod((qy[:, None] + D * psiy * NX * 0.02).ravel(), NY)
    del psix, psiy
    i0 = np.floor(X - 0.5).astype(np.int64); j0 = np.floor(Y - 0.5).astype(np.int64)
    fx = X - 0.5 - i0; fy = Y - 0.5 - j0
    del X, Y
    grid = np.zeros(NX * NY)
    for di in (0, 1):
        for dj in (0, 1):
            wi = (1 - fx) if di == 0 else fx
            wj = (1 - fy) if dj == 0 else fy
            grid += np.bincount(np.mod(j0 + dj, NY) * NX + np.mod(i0 + di, NX),
                                weights=wi * wj, minlength=NX * NY)
    return grid.reshape(NY, NX) / (npx * npy / (NX * NY))

def blur(a, sig):
    ny, nx = a.shape
    k2 = np.fft.rfftfreq(nx)[None, :] ** 2 + np.fft.fftfreq(ny)[:, None] ** 2
    return np.fft.irfft2(np.fft.rfft2(a) * np.exp(-2 * np.pi**2 * sig**2 * k2), s=(ny, nx))

def ss(x):
    x = np.clip(x, 0, 1); return x * x * (3 - 2 * x)

# ---- palette ramp: ink -> deep indigo -> violet (--violet) -> mint (--mint) ----
def lut():
    stops = [(0.00, (0x05,0x07,0x0c)), (0.22,(0x0b,0x0e,0x1e)), (0.42,(0x22,0x1b,0x4c)),
             (0.60,(0x53,0x40,0xa8)), (0.76,(0xa9,0x8c,0xff)), (0.88,(0x69,0xe6,0xc7)),
             (1.00,(0xf1,0xfa,0xf6))]
    xs = np.array([s[0] for s in stops]); t = np.linspace(0, 1, 256); out = np.zeros((256, 3))
    for c in range(3):
        out[:, c] = np.interp(t, xs, (np.array([s[1][c] for s in stops]) / 255.0) ** 2.2)
    return out
LUT = lut()

def render(rho, path, mode, q, bandlo, bandx, bandw, footcut, footy, foots, soft=0.26):
    ny, nx = rho.shape; s = min(nx, ny)
    t = np.clip(np.log1p((rho + 0.02) / 0.35) / np.log1p(24.0), 0, 1)
    t = np.clip(t + soft * blur(t, s * 0.004), 0, 1)              # soft bloom
    X = np.linspace(0, 1, nx)[None, :]; Y = np.linspace(0, 1, ny)[:, None]
    if mode == "land":                                            # dark copy column at left
        band = bandlo + (1 - bandlo) * ss((X - bandx) / bandw) + 0 * Y
        vig  = np.clip(1.06 - 0.30 * ((2*X - 1)**2 + (2*Y - 1)**2), 0, 1)
    else:                                                         # dark copy band at top
        band = bandlo + (1 - bandlo) * ss((Y - bandx) / bandw) + 0 * X
        vig  = np.clip(1.06 - 0.26 * ((2*X - 1)**2 + (2*Y - 1)**2), 0, 1)
    foot = 1 - footcut * ss((Y - footy) / foots)                  # dark receipt rail
    t = np.clip(t * band * foot * vig, 0, 1)
    srgb = np.clip(LUT[np.clip((t * 255).astype(np.int32), 0, 255)], 0, 1) ** (1/2.2) * 255.0
    srgb += np.random.default_rng(7).uniform(-0.55, 0.55, srgb.shape)   # dither: no 8-bit banding
    Image.fromarray(np.clip(srgb, 0, 255).astype(np.uint8), "RGB").save(path, quality=q, method=6)
    return os.path.getsize(path)

# ------------------------------------------------- WCAG composite gate ----
# Models the CSS scrim that ships on top of the plate.  Keep these ramps in
# lockstep with .hero-band::after in src/assets/site.css.
def alpha(mode, X, Y):
    if mode == "land":
        u = np.clip(X + 0.08 * (Y - 0.5), 0, 1)
        a = np.interp(u, [0, 0.30, 0.52, 0.78, 1.0], [0.97, 0.94, 0.60, 0.16, 0.32])
        rail = np.interp(Y, [0, 0.74, 0.86, 1.0], [0, 0, 0.90, 0.96])
        return 1 - (1 - a) * (1 - rail)
    return np.interp(Y, [0, 0.40, 0.68, 1.0], [0.95, 0.88, 0.28, 0.60])

def _slum(c):
    c = np.array(c) / 255.0; c = np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)
    return 0.2126*c[0] + 0.7152*c[1] + 0.0722*c[2]
def _lum(a):
    c = a / 255.0; c = np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)
    return 0.2126*c[...,0] + 0.7152*c[...,1] + 0.0722*c[...,2]
PAL = {"paper":[244,240,229], "muted":[174,180,196], "dim":[127,135,152],
       "mint":[105,230,199], "amber":[255,194,108], "violet":[169,140,255]}
INK = _slum([5, 7, 12])
# region -> (slice, colours that must clear 4.5:1 there)
GATE = {
  "land": {"copy": ((0.04, 0.72, 0.00, 0.46), ("paper","muted","dim","mint","amber","violet")),
           "rail": ((0.80, 0.98, 0.00, 0.72), ("paper","muted","dim","mint","amber","violet"))},
  "port": {"copy": ((0.02, 0.55, 0.00, 1.00), ("paper","muted","mint","amber","violet"))},
}
def gate(path, mode):
    a = np.asarray(Image.open(path).convert("RGB"), float); ny, nx, _ = a.shape
    Y, X = np.mgrid[0:ny, 0:nx]; X = X / (nx - 1); Y = Y / (ny - 1)
    comp = _lum(a) * (1 - alpha(mode, X, Y)) + INK * alpha(mode, X, Y)
    ok = True
    for name, ((y0, y1, x0, x1), cols) in GATE[mode].items():
        g = float(comp[int(y0*ny):int(y1*ny), int(x0*nx):int(x1*nx)].max())
        line = []
        for k in cols:
            r = (max(_slum(PAL[k]), g) + 0.05) / (min(_slum(PAL[k]), g) + 0.05)
            line.append(f"{k} {r:.2f}")
            if r < 4.5: ok = False; line[-1] += " **FAIL**"
        print(f"    {name}: worst composite luminance {g:.4f} | " + "  ".join(line))
    return ok

if __name__ == "__main__":
    out = sys.argv[1] if len(sys.argv) > 1 else "."
    os.makedirs(out, exist_ok=True)
    print(f"numpy {np.__version__}  Pillow {PIL.__version__}  seed {SEED}")
    ok = True
    for cfg, name in ((LAND, "hero-web-land.webp"), (PORT, "hero-web-port.webp")):
        p = os.path.join(out, name)
        c = dict(cfg); NX, NY, npx, npy = c.pop("NX"), c.pop("NY"), c.pop("npx"), c.pop("npy")
        rho = zeldovich(NX, NY, npx, npy, SEED, SLOPE, DGROW, KCUT)
        b = render(rho, p, **c)
        print(f"  {name}  {NX}x{NY}  {b} bytes  sha256 {hashlib.sha256(open(p,'rb').read()).hexdigest()}")
        ok &= gate(p, cfg["mode"])
    print("CONTRAST GATE:", "PASS" if ok else "FAIL")
    sys.exit(0 if ok else 1)
