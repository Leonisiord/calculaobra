# CalculaObra · Calculadoras de materiales de construcción

Web estática con calculadoras gratuitas de materiales de obra.

## Calculadoras
- Concreto: volumen y materiales.
- Bloques: unidades necesarias para un muro.
- Pies tablares: cubicaje de madera.

## Tecnología
- HTML, CSS y JavaScript sin frameworks; cada calculadora tiene su propio script en `site/js/`.
- SEO técnico: `sitemap.xml`, `robots.txt`, páginas legales y de contacto, página 404.
- Desplegada en Cloudflare Pages.

## Estructura
```
site/            la web completa (es lo que se publica)
configurar.py    script que adapta la URL y los datos de contacto en todas las páginas
DESPLIEGUE.md    guía paso a paso para publicarla
```

## Desplegar
En Cloudflare Pages: framework *None*, comando de build vacío y directorio de salida `site`.
