// Calculadora de concreto: todo se calcula en el navegador, no se envía ningún dato.
(function () {
  "use strict";

  // Materiales por 1 m³ de concreto (tabla de referencia CAPECO, agregado de 3/4").
  // cemento en kg (bolsas de 42,5 kg × 42,5), arena y grava en m³, agua en litros.
  var DOSIFICACION = {
    "140": { cemento: 297.9, arena: 0.56, grava: 0.57, agua: 184 },
    "175": { cemento: 358.3, arena: 0.54, grava: 0.55, agua: 185 },
    "210": { cemento: 413.5, arena: 0.52, grava: 0.53, agua: 186 },
    "245": { cemento: 488.8, arena: 0.50, grava: 0.51, agua: 187 },
    "280": { cemento: 567.0, arena: 0.45, grava: 0.51, agua: 189 }
  };
  var BOTE_M3 = 0.019; // bote o cubeta de 19 litros

  var form = document.getElementById("calc-concreto");
  var out = {
    volumen: document.getElementById("r-volumen"),
    bolsas: document.getElementById("r-bolsas"),
    lista: document.getElementById("r-lista"),
    receta: document.getElementById("r-receta"),
    error: document.getElementById("r-error")
  };

  var fmt = function (n, dec) {
    return n.toLocaleString("es", { minimumFractionDigits: dec, maximumFractionDigits: dec });
  };
  var num = function (name) {
    var el = form.elements[name];
    if (!el || el.value === "") return NaN;
    return parseFloat(String(el.value).replace(",", "."));
  };

  function volumenElemento(tipo) {
    var cant;
    switch (tipo) {
      case "losa":
        return num("losa_largo") * num("losa_ancho") * (num("losa_espesor") / 100);
      case "prisma":
        cant = num("prisma_cant") || 1;
        return num("prisma_largo") * (num("prisma_ancho") / 100) * (num("prisma_alto") / 100) * cant;
      case "cilindro":
        cant = num("cil_cant") || 1;
        var r = num("cil_diam") / 200; // cm → radio en m
        return Math.PI * r * r * num("cil_alto") * cant;
      default:
        return num("vol_m3");
    }
  }

  function mostrarCampos(tipo) {
    var grupos = form.querySelectorAll("[data-tipo]");
    for (var i = 0; i < grupos.length; i++) {
      grupos[i].hidden = grupos[i].getAttribute("data-tipo") !== tipo;
    }
  }

  function calcular() {
    var tipo = form.elements.tipo.value;
    mostrarCampos(tipo);

    var v = volumenElemento(tipo);
    var desp = num("desperdicio");
    if (isNaN(desp) || desp < 0) desp = 0;
    var bolsaKg = parseFloat(form.elements.bolsa.value);
    var d = DOSIFICACION[form.elements.fc.value];

    if (!(v > 0)) {
      out.error.textContent = "Introduce todas las medidas (números mayores que 0).";
      out.volumen.textContent = "–";
      out.bolsas.textContent = "–";
      out.lista.innerHTML = "";
      out.receta.innerHTML = "";
      return;
    }
    out.error.textContent = "";

    var vt = v * (1 + desp / 100);
    var cementoKg = d.cemento * vt;
    var bolsas = cementoKg / bolsaKg;
    var arena = d.arena * vt;
    var grava = d.grava * vt;
    var agua = d.agua * vt;

    out.volumen.innerHTML = fmt(vt, 2) + " <small>m³ con " + fmt(desp, 0) + " % de desperdicio (" + fmt(v, 2) + " m³ netos)</small>";
    out.bolsas.innerHTML = Math.ceil(bolsas - 1e-9) + " <small>bolsas de " + fmt(bolsaKg, bolsaKg % 1 ? 1 : 0) + " kg</small>";

    out.lista.innerHTML =
      li("Cemento", fmt(cementoKg, 0) + " kg", fmt(bolsas, 2) + " bolsas exactas") +
      li("Arena", fmt(arena, 2) + " m³", fmt(arena / BOTE_M3, 0) + " botes de 19 L") +
      li("Grava (3/4\")", fmt(grava, 2) + " m³", fmt(grava / BOTE_M3, 0) + " botes de 19 L") +
      li("Agua", fmt(agua, 0) + " litros", fmt(agua / 19, 0) + " botes de 19 L");

    // Receta por bolsa: útil para mezclar a mano o con revolvedora.
    var bolsasM3 = d.cemento / bolsaKg;
    out.receta.innerHTML =
      li("Arena", fmt(d.arena / bolsasM3 / BOTE_M3, 1) + " botes") +
      li("Grava", fmt(d.grava / bolsasM3 / BOTE_M3, 1) + " botes") +
      li("Agua", fmt(d.agua / bolsasM3, 0) + " litros");
  }

  function li(nombre, valor, sub) {
    return "<li><span>" + nombre + "</span><span>" + valor +
      (sub ? '<span class="result-sub">' + sub + "</span>" : "") + "</span></li>";
  }

  form.addEventListener("input", calcular);
  form.addEventListener("change", calcular);
  form.addEventListener("submit", function (e) { e.preventDefault(); calcular(); });

  document.getElementById("btn-copiar").addEventListener("click", function () {
    if (!navigator.clipboard) return;
    var fc = form.elements.fc.value;
    var texto = "Concreto f'c " + fc + " kg/cm² — " + out.volumen.textContent + "\n" +
      "Cemento: " + out.bolsas.textContent + "\n";
    var items = out.lista.querySelectorAll("li");
    for (var i = 0; i < items.length; i++) {
      var s = items[i].querySelectorAll("span");
      texto += s[0].textContent + ": " + s[1].childNodes[0].textContent + "\n";
    }
    var btn = this;
    navigator.clipboard.writeText(texto).then(function () {
      btn.textContent = "¡Copiado!";
      setTimeout(function () { btn.textContent = "Copiar lista"; }, 1800);
    });
  });
  document.getElementById("btn-imprimir").addEventListener("click", function () { window.print(); });

  calcular();
})();
