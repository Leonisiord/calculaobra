# Despliegue de CalculaObra en Cloudflare Pages

La web entera está en la carpeta `site/`. No hay nada que compilar: se sube tal cual.

## Parte 1: publicar la web (15 min, gratis)

1. **Crea una cuenta** en https://dash.cloudflare.com/sign-up y confirma el email.
2. En el menú de la izquierda, entra en **Workers y Pages** (Compute → Workers & Pages).
3. Pulsa **Crear** (Create), elige la pestaña **Pages** y después **Subir recursos** (Upload assets / Drag and drop your files).
4. **Nombre del proyecto:** escribe `calculaobra`. Si está cogido, prueba otro (por ejemplo `calculaobra-mx`) y **apunta el nombre**.
5. **Arrastra la carpeta `site`** (la carpeta entera, no su contenido suelto) y pulsa **Implementar sitio** (Deploy site).
6. Abre la URL que te da, `https://NOMBRE.pages.dev`, y comprueba que funcionan las dos calculadoras.

## Parte 2: si tu nombre NO es "calculaobra"

Sáltate esta parte si conseguiste `calculaobra.pages.dev`.

7. En una terminal, dentro de la carpeta `web-herramientas`:
   ```
   python configurar.py
   ```
   En la primera pregunta escribe tu URL (`https://NOMBRE.pages.dev`). En las demás pulsa Intro.
8. **Vuelve a subir:** en Cloudflare, entra en tu proyecto → **Implementaciones** (Deployments) → **Crear implementación** (Create deployment) → arrastra otra vez `site`.

> Haz el paso 8 cada vez que cambies algo en la web.

## Parte 3: que Google la encuentre (10 min)

9. Entra en https://search.google.com/search-console → **Añadir propiedad** → tipo **Prefijo de URL** → pega tu URL.
10. En verificación, elige **Archivo HTML**. Descarga el archivo (`googleXXXX.html`), cópialo **dentro de `site/`** y vuelve a subir la carpeta (paso 8). Después pulsa **Verificar**.
11. En el menú izquierdo, entra en **Sitemaps**, escribe `sitemap.xml` y pulsa **Enviar**.
12. En **Inspección de URLs**, pega la URL de cada calculadora y pulsa **Solicitar indexación**.

Aquí la web ya está operativa y en camino de salir en Google. Lo que queda son los anuncios.

## Parte 4: dominio propio (necesario para AdSense, unos 10 €/año)

AdSense no acepta direcciones `.pages.dev`. Hazlo cuando tengas 6-8 calculadoras (ver `plan-crecimiento.md`):

13. En Cloudflare → **Registro de dominios** (Domain Registration) → **Registrar dominios**. Busca uno, por ejemplo `calculaobra.com`, y cómpralo. Cloudflare lo vende a precio de coste.
14. Entra en tu proyecto de Pages → **Dominios personalizados** (Custom domains) → **Configurar un dominio** → escribe el dominio. Como lo compraste en Cloudflare, el DNS se configura solo.
15. Ejecuta `python configurar.py` con la URL nueva (`https://calculaobra.com`) y vuelve a subir `site` (paso 8).
16. En Search Console, añade una **propiedad nueva** con el dominio nuevo y vuelve a enviar el sitemap.

## Parte 5: AdSense

17. Entra en https://adsense.google.com, regístrate con tu dominio propio y copia tu ID de editor (`ca-pub-…`).
18. Ejecuta `python configurar.py`: pulsa Intro en todo y pega el ID cuando te lo pida. Así se inserta el código en todas las páginas y se crea `ads.txt`. Vuelve a subir `site` (paso 8).
19. En AdSense, pulsa **Solicitar revisión**. Tarda de unos días a 2-3 semanas.
20. Mientras tanto, en AdSense → **Privacidad y mensajes** → **RGPD**, crea y publica el aviso de consentimiento. Es gratis y obligatorio para visitantes de Europa.
21. Cuando te aprueben, activa **Anuncios automáticos**.

> Recordatorio legal: cuando haya anuncios, la ley española (LSSI) pide NIF y una dirección en el aviso legal. Puedes usar una dirección de domiciliación o de gestoría en vez de la de tu casa.
