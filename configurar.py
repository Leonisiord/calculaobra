"""Rellena tus datos y tu dominio en todas las páginas de la web.

Uso (desde la carpeta web-herramientas):
    python configurar.py

Puedes ejecutarlo más de una vez: cada vez sustituye los valores guardados en
configuracion.txt por los nuevos.
"""
import sys
from pathlib import Path

CARPETA = Path(__file__).parent
SITE = CARPETA / "site"
GUARDADO = CARPETA / "configuracion.txt"

# Marcador que aparece en las páginas -> pregunta que se hace
CAMPOS = {
    "https://calculaobra.pages.dev": "URL de tu web, sin barra final (ej. https://midominio.pages.dev)",
    "[NOMBRE Y APELLIDOS]": "Tu nombre y apellidos (titular de la web)",
    "[EMAIL DE CONTACTO]": "Email de contacto público",
    "[NOMBRE]": "Nombre que aparecerá en 'Sobre nosotros'",
}


def leer_guardado():
    """Devuelve los valores de la ejecución anterior (marcador -> valor)."""
    valores = {}
    if GUARDADO.exists():
        for linea in GUARDADO.read_text(encoding="utf-8").splitlines():
            if "\t" in linea:
                marcador, valor = linea.split("\t", 1)
                valores[marcador] = valor
    return valores


MARCA_ADSENSE = "<!-- ADSENSE: pega aquí el script de AdSense cuando te aprueben (ver DESPLIEGUE.md) -->"


def activar_adsense(pub):
    """Inserta el script de AdSense en el <head> de cada página y crea ads.txt."""
    if not pub.startswith("ca-pub-"):
        print("El ID debe empezar por ca-pub-. No se ha activado AdSense.")
        return
    script = (
        f'<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client={pub}" '
        'crossorigin="anonymous"></script>'
    )
    for archivo in SITE.rglob("*.html"):
        texto = archivo.read_text(encoding="utf-8")
        if MARCA_ADSENSE in texto:
            archivo.write_text(texto.replace(MARCA_ADSENSE, script), encoding="utf-8")
    numero = pub.replace("ca-", "")
    (SITE / "ads.txt").write_text(
        f"google.com, {numero}, DIRECT, f08c47fec0942fa0\n", encoding="utf-8"
    )
    print("AdSense activado: script insertado y ads.txt creado.")


def main():
    sys.stdin.reconfigure(encoding="utf-8")
    sys.stdout.reconfigure(encoding="utf-8")
    anteriores = leer_guardado()
    reemplazos = {}
    for marcador, pregunta in CAMPOS.items():
        actual = anteriores.get(marcador, marcador)
        nuevo = input(f"{pregunta}\n  [actual: {actual}] > ").strip().rstrip("/")
        if nuevo and nuevo != actual:
            reemplazos[actual] = nuevo
            anteriores[marcador] = nuevo

    pub = input(
        "ID de editor de AdSense (ca-pub-XXXXXXXXXXXXXXXX). Déjalo vacío si aún no te han aprobado\n  > "
    ).strip()
    if pub:
        activar_adsense(pub)

    if not reemplazos:
        print("No hay cambios de datos.")
        return

    cambiados = 0
    for archivo in SITE.rglob("*"):
        if archivo.suffix not in {".html", ".xml", ".txt"}:
            continue
        texto = archivo.read_text(encoding="utf-8")
        nuevo_texto = texto
        for viejo, nuevo in reemplazos.items():
            nuevo_texto = nuevo_texto.replace(viejo, nuevo)
        if nuevo_texto != texto:
            archivo.write_text(nuevo_texto, encoding="utf-8")
            cambiados += 1

    GUARDADO.write_text(
        "\n".join(f"{m}\t{v}" for m, v in anteriores.items()), encoding="utf-8"
    )
    print(f"Listo: {cambiados} archivos actualizados.")


if __name__ == "__main__":
    main()
