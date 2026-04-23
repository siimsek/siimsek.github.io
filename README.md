# PCB Portfolio - Muhammed Ali Simsek

3D PCB (Printed Circuit Board) temelli interaktif portfolyo web sitesi. Her bolum PCB uzerindeki bir bileseni temsil eder.

## Ozellikler

- **3D PCB Saha**: Three.js ile olusturulmus interaktif 3D devre karti
- **Bilesen Tabanli Bolumler**: Her portfolyo bolumu (Hakkimda, Yetenekler, Deneyim vb.) PCB uzerinde farkli bir elektronik bilesen olarak temsil edilir
- **Interaktif Navigasyon**: Orbit kontroller ile dondurme, yaklastirma ve kaydirma
- **Hover Efektleri**: Bilesenler uzerine gelindiginde parlama ve tooltip gosterimi
- **Modal Icerik**: Bilesenlere tiklandiginda detayli bilgi modal'i acilir
- **Sinyal Animasyonu**: PCB uzerinde akan veri paketleri ve sinyal izleri
- **Mobil Uyumlu**: Dokunmatik ekran destegi

## Bilesen Haritasi

| Bilesen | Tip | Bolum |
|---------|-----|-------|
| U1 | MCU (Microcontroller) | Hakkimda |
| VRM | Voltage Regulator Module | Yetenekler |
| Y1 | Oscillator | Egitim |
| U2 | Communication IC | Deneyim |
| U3 | Memory Chip | Projeler |
| D1-D3 | LEDs | Diller |
| P1 | UART Connector | Iletisim |
| J1 | SWD Debug Port | Hedefler |
| C1-C4 | Capacitors | Calisma Akisi |

## Teknolojiler

- React 18
- TypeScript
- Three.js + React Three Fiber
- Tailwind CSS
- Vite

## GitHub Pages'e Yayinlama

### 1. Repo Olusturma

GitHub'da yeni bir repository olusturun (ornegin: `pcb-portfolio`).

### 2. Yerel Projeyi Hazirlama

```bash
# Projeyi klonlayin (veya mevcut dizini kullanin)
cd pcb-portfolio

# Bagimliliklari yukleyin
npm install

# Uretim yapisi olusturun
npm run build
```

### 3. GitHub Pages Ayarlari

1. GitHub repo'nuzun **Settings** sekmesine gidin
2. Sol menuden **Pages** secenegini tiklayin
3. **Build and deployment** bolumunde:
   - **Source**: "Deploy from a branch" secin
   - **Branch**: "gh-pages" /root secin

### 4. Otomatik Yayinlama (GitHub Actions)

`.github/workflows/deploy.yml` dosyasi olusturun:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: 'pages'
  cancel-in-progress: true

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### 5. Manuel Yayinlama

```bash
# gh-pages paketini yukleyin
npm install --save-dev gh-pages

# package.json'a ekleme yapin:
{
  "scripts": {
    "deploy": "gh-pages -d dist"
  }
}

# Yayinlayin
npm run deploy
```

### 6. Vite Config Ayarlari

`vite.config.ts` dosyasinda `base` ayarini repo adiniza gore degistirin:

```typescript
export default defineConfig({
  base: '/pcb-portfolio/',  // Repo adiniz
  // ... diger ayarlar
});
```

## Gelistirme

```bash
# Gelistirme sunucusunu baslat
npm run dev

# TypeScript kontrolu
npm run type-check

# Lint
npm run lint
```

## Klasor Yapisi

```
src/
  components/
    three/
      PCBScene.tsx      # Ana 3D sahne
    ui/
      ComponentModal.tsx # Bilesen modal'i
  data/
    portfolioData.ts    # Portfolyo icerigi
  hooks/                # Custom React hooks
  App.tsx              # Ana uygulama
  index.css            # Global stiller
```

## Icerik Kaynaklari

Tum icerik asagidaki PDF dosyalarindan elde edilmistir:
- `00cv_en.pdf` (Ana CV)
- `aboutme.pdf` (Kisisel bilgiler)

## Lisans

MIT License

## Iletisim

- E-posta: malisimsek17@gmail.com
- LinkedIn: https://www.linkedin.com/in/muhammed-ali-simsek/
- GitHub: https://github.com/siimsek
