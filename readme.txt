# 🌀 Generador d'Art Paralaxi

Eina web per generar i descarregar il·lusions òptiques matemàtiques basades en l'efecte paralaxi. Configura patrons geomètrics, colors i profunditat, previsualitza en temps real i exporta en SVG, PNG o PDF amb instruccions per crear-les a mà.

---

## ✨ Funcionalitats

- **6 patrons geomètrics:** Cercles, Espiral, Línies radials, Ones, Quadrícula, Hexàgons
- **Efecte paralaxi en temps real** movent el ratolí sobre la imatge
- **Configuració completa:** nombre de capes (2–10), profunditat, mida del patró
- **Colors personalitzables:** 5 presets (Oceà, Aurora, Foc, Bosc, Mono) + editor de color lliure
- **Exportació en 3 formats:**
  - `SVG` — vectorial, ideal per impressió
  - `PNG` — imatge rasteritzada 480×480px
  - `HTML → PDF` — inclou la imatge generada, paràmetres tècnics i instruccions pas a pas per crear-la a mà sobre paper

---

## 🚀 Instal·lació i ús

### Opció A — GitHub Pages

1. Crea un repositori nou a GitHub
2. Puja els fitxers `index.html`, `app.js` i `README.md`
3. Ves a **Settings → Pages → Branch: main → Save**
4. Accedeix a `https://<usuari>.github.io/<repositori>`

### Opció B — Local

1. Posa `index.html` i `app.js` a la mateixa carpeta
2. Obre `index.html` al navegador

> No cal cap servidor ni instal·lació de dependències. Tot funciona directament al navegador via CDN.

---

## 📄 Com generar el PDF

1. Configura el patró, colors i paràmetres desitjats
2. Clica **↓ PDF + Instruccions per imprimir**
3. Es descarregarà un fitxer `.html`
4. Obre'l al navegador
5. Clica el botó **🖨️ Imprimir / Desar com PDF**
6. Al diàleg d'impressió, tria **"Desar com a PDF"** com a destinació

El PDF inclou:
- La imatge generada
- Paràmetres tècnics usats (patró, capes, profunditat, mida, colors)
- Instruccions pas a pas per reproduir-la a mà sobre paper
- Consells generals de tècnica

---

## 🗂 Estructura del projecte

```
parallax-art/
├── index.html    # Pàgina principal amb React via CDN
├── app.js        # Lògica i interfície de l'aplicació
└── README.md     # Aquest fitxer
```

---

## 🛠 Tecnologies

- [React 18](https://react.dev/) via CDN (sense build step)
- [Babel Standalone](https://babeljs.io/docs/babel-standalone) per JSX al navegador
- Canvas API per renderitzat i exportació
- CSS-in-JS per tots els estils

---

## 📐 Sobre l'art paralaxi

L'art paralaxi és una forma d'il·lusió òptica basada en la superposició de capes geomètriques desplaçades progressivament. Quan l'observador o la imatge es mou, les capes es desplacen a velocitats diferents creant una sensació de profunditat i moviment tridimensional.

---

*Creat amb Claude · Bexperience 2026*
