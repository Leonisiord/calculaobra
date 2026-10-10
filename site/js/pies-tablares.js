// Calculadora de pies tablares: todo se calcula en el navegador.
(function () {
  "use strict";

  var M3_POR_PT = 0.002359737; // 1 pie tablar = 144 pulgadas cúbicas
  var CM_POR_PULGADA = 2.54;
  var M_POR_PIE = 0.3048;

  var form = document.getElementById("calc-pies");
  var filas = document.getElementById("filas");
  var plantilla = document.getElementById("fila-plantilla");
  var out = {
    total: document.getElementById("r-total"),
    detalle: document.getElementById("r-detalle"),
    lista: document.getElementById("r-lista"),
    error: document.getElementById("r-error")
  };

  var fmt = function (n, dec) {
    return n.toLocaleString("es", { minimumFractionDigits: dec, maximumFractionDigits: dec });
  };
  var leer = function (el) {
    if (!el || el.value === "") return NaN;
    return parseFloat(String(el.value).replace(",", "."));
  };

  function renumerar() {
    var lista = filas.querySelectorAll(".pieza");
    for (var i = 0; i < lista.length; i++) {
      lista[i].querySelector(".pieza-num").textContent = "Pieza " + (i + 1);
      lista[i].querySelector(".quitar").hidden = lista.length === 1;
    }
  }

  function anadirFila(valores) {
    var nodo = plantilla.content.firstElementChild.cloneNode(true);
    var v = valores || {};
    ["cant", "grueso", "ancho", "largo"].forEach(function (k) {
      if (v[k] !== undefined) nodo.querySelector("[data-k='" + k + "']").value = v[k];
    });
    filas.appendChild(nodo);
    renumerar();
    calcular();
  }

  function calcular() {
    var enCm = form.elements.u_seccion.value === "cm";
    var enM = form.elements.u_largo.value === "m";
    var precio = leer(form.elements.precio);
    var total = 0, piezasTotal = 0, valido = true;
    var detalle = [];

    var lista = filas.querySelectorAll(".pieza");
    for (var i = 0; i < lista.length; i++) {
      var f = lista[i];
      var cant = leer(f.querySelector("[data-k='cant']"));
      var g = leer(f.querySelector("[data-k='grueso']"));
      var a = leer(f.querySelector("[data-k='ancho']"));
      var l = leer(f.querySelector("[data-k='largo']"));
      if (!(cant > 0 && g > 0 && a > 0 && l > 0)) {
        // Una fila recién añadida y sin medidas no es un error: simplemente aún no cuenta.
        if (!isNaN(g) || !isNaN(a) || !isNaN(l)) valido = false;
        continue;
      }
      var gPulg = enCm ? g / CM_POR_PULGADA : g;
      var aPulg = enCm ? a / CM_POR_PULGADA : a;
      var lPies = enM ? l / M_POR_PIE : l;
      var pt = (gPulg * aPulg * lPies) / 12 * cant;
      total += pt;
      piezasTotal += cant;
      detalle.push(
        "<li><span>" + fmt(cant, 0) + " × " + fmt(g, 2) + (enCm ? " cm" : "\"") + " × " + fmt(a, 2) + (enCm ? " cm" : "\"") +
        " × " + fmt(l, 2) + (enM ? " m" : " pies") + "</span><span>" + fmt(pt, 2) + " PT</span></li>"
      );
    }

    out.error.textContent = valido ? "" : "Hay piezas con medidas vacías o en cero: no se suman.";
    if (total <= 0) {
      out.total.innerHTML = "–";
      out.detalle.textContent = "";
      out.lista.innerHTML = "";
      return;
    }
    out.total.innerHTML = fmt(total, 2) + " <small>pies tablares</small>";
    out.detalle.textContent = fmt(piezasTotal, 0) + (piezasTotal === 1 ? " pieza" : " piezas") +
      " · " + fmt(total * M3_POR_PT, 4) + " m³ de madera";
    var resumen = detalle.join("");
    if (precio > 0) {
      resumen += '<li><span><strong>Coste estimado</strong><span class="result-sub">a ' + fmt(precio, 2) +
        " por pie tablar</span></span><span>" + fmt(total * precio, 2) + "</span></li>";
    }
    out.lista.innerHTML = resumen;
  }

  filas.addEventListener("click", function (e) {
    if (e.target.classList.contains("quitar")) {
      e.target.closest(".pieza").remove();
      renumerar();
      calcular();
    }
  });
  filas.addEventListener("change", function (e) {
    if (!e.target.classList.contains("medida-comun") || !e.target.value) return;
    var partes = e.target.value.split("x");
    var fila = e.target.closest(".pieza");
    form.elements.u_seccion.value = "pulg";
    fila.querySelector("[data-k='grueso']").value = partes[0];
    fila.querySelector("[data-k='ancho']").value = partes[1];
    e.target.value = "";
    calcular();
  });
  form.addEventListener("input", calcular);
  form.addEventListener("change", calcular);
  form.addEventListener("submit", function (e) { e.preventDefault(); calcular(); });
  document.getElementById("btn-anadir").addEventListener("click", function () { anadirFila({ cant: 1 }); });

  document.getElementById("btn-copiar").addEventListener("click", function () {
    if (!navigator.clipboard) return;
    var texto = "Total: " + out.total.textContent + " (" + out.detalle.textContent + ")\n";
    var items = out.lista.querySelectorAll("li");
    for (var i = 0; i < items.length; i++) texto += items[i].innerText.replace(/\n/g, " ") + "\n";
    var btn = this;
    navigator.clipboard.writeText(texto).then(function () {
      btn.textContent = "¡Copiado!";
      setTimeout(function () { btn.textContent = "Copiar lista"; }, 1800);
    });
  });
  document.getElementById("btn-imprimir").addEventListener("click", function () { window.print(); });

  anadirFila({ cant: 10, grueso: 2, ancho: 4, largo: 8 });
})();
