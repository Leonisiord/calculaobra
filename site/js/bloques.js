// Calculadora de bloques y mortero: todo se calcula en el navegador.
(function () {
  "use strict";

  // Medidas reales de la pieza en cm: largo, alto, espesor (grosor del muro) y junta habitual.
  var PIEZAS = {
    "block15": { largo: 40, alto: 20, espesor: 15, junta: 1 },
    "block12": { largo: 40, alto: 20, espesor: 12, junta: 1 },
    "modular20": { largo: 39, alto: 19, espesor: 19, junta: 1 },
    "tabique": { largo: 28, alto: 7, espesor: 14, junta: 1.5 },
    "kingkong": { largo: 24, alto: 9, espesor: 13, junta: 1.5 },
    "hueco": { largo: 24, alto: 7, espesor: 11.5, junta: 1 }
  };

  // Materiales por 1 m³ de mortero cemento-arena (referencia CAPECO, bolsa de 42,5 kg).
  var MORTERO = {
    "1:3": { cemento: 446, arena: 0.95 },
    "1:4": { cemento: 378, arena: 1.00 },
    "1:5": { cemento: 319, arena: 1.05 },
    "1:6": { cemento: 268, arena: 1.07 }
  };
  var BOTE_M3 = 0.019;

  var form = document.getElementById("calc-bloques");
  var out = {
    piezas: document.getElementById("r-piezas"),
    area: document.getElementById("r-area"),
    lista: document.getElementById("r-lista"),
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

  function aplicarPreset() {
    var p = PIEZAS[form.elements.pieza.value];
    var editable = !p;
    ["p_largo", "p_alto", "p_espesor", "p_junta"].forEach(function (n) {
      form.elements[n].readOnly = !editable;
    });
    if (!p) return;
    form.elements.p_largo.value = p.largo;
    form.elements.p_alto.value = p.alto;
    form.elements.p_espesor.value = p.espesor;
    form.elements.p_junta.value = p.junta;
  }

  function calcular() {
    var area = num("m_largo") * num("m_alto") - (num("m_huecos") || 0);
    var L = num("p_largo") / 100, H = num("p_alto") / 100, E = num("p_espesor") / 100, J = num("p_junta") / 100;
    var despP = num("desp_piezas"); if (isNaN(despP) || despP < 0) despP = 0;
    var despM = num("desp_mortero"); if (isNaN(despM) || despM < 0) despM = 0;
    var bolsaKg = parseFloat(form.elements.bolsa.value);
    var m = MORTERO[form.elements.proporcion.value];

    if (!(area > 0) || !(L > 0) || !(H > 0) || !(E > 0) || !(J >= 0)) {
      out.error.textContent = area <= 0 ? "Los huecos no pueden ser mayores que el muro." : "Introduce todas las medidas (números mayores que 0).";
      out.piezas.textContent = "–";
      out.area.textContent = "–";
      out.lista.innerHTML = "";
      return;
    }
    out.error.textContent = "";

    // Cada pieza ocupa su tamaño más media junta por cada lado.
    var modulo = (L + J) * (H + J);
    var porM2 = 1 / modulo;
    var piezas = area * porM2 * (1 + despP / 100);

    // Mortero = volumen del muro menos el volumen de las piezas.
    var morteroM2 = E * (1 - (L * H) / modulo);
    var mortero = morteroM2 * area * (1 + despM / 100);
    var cementoKg = mortero * m.cemento;
    var arena = mortero * m.arena;

    out.piezas.innerHTML = fmt(Math.ceil(piezas - 1e-9), 0) + " <small>piezas (con " + fmt(despP, 0) + " % extra)</small>";
    out.area.textContent = fmt(area, 2) + " m² de muro · " + fmt(porM2, 1) + " piezas por m²";
    out.lista.innerHTML =
      li("Mortero", fmt(mortero, 3) + " m³", fmt(morteroM2 * 1000, 1) + " litros por m² de muro") +
      li("Cemento", Math.ceil(cementoKg / bolsaKg - 1e-9) + " bolsas de " + fmt(bolsaKg, bolsaKg % 1 ? 1 : 0) + " kg", fmt(cementoKg, 0) + " kg") +
      li("Arena", fmt(arena, 2) + " m³", fmt(arena / BOTE_M3, 0) + " botes de 19 L");
  }

  function li(nombre, valor, sub) {
    return "<li><span>" + nombre + "</span><span>" + valor +
      (sub ? '<span class="result-sub">' + sub + "</span>" : "") + "</span></li>";
  }

  form.addEventListener("input", calcular);
  form.elements.pieza.addEventListener("change", function () { aplicarPreset(); calcular(); });
  form.addEventListener("change", calcular);
  form.addEventListener("submit", function (e) { e.preventDefault(); calcular(); });

  document.getElementById("btn-copiar").addEventListener("click", function () {
    if (!navigator.clipboard) return;
    var texto = "Muro: " + out.area.textContent + "\nPiezas: " + out.piezas.textContent + "\n";
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

  aplicarPreset();
  calcular();
})();
