
const archivo = document.getElementById("archivo");
const buscar = document.getElementById("buscar");
const numerosDiv = document.getElementById("numeros");
const cantidad = document.getElementById("cantidad");
const btnCopiar = document.getElementById("copiar");
const btnWhatsapp = document.getElementById("whatsapp");
const btnConfirmar = document.getElementById("confirmar");

let listaNumeros = [];
let seleccionados = new Set();
let vendidos = new Set(
    JSON.parse(localStorage.getItem("vendidos") || "[]")
);

// Generar automáticamente los 10,000 números (0000 al 9999) al iniciar la página
function inicializarNumeros() {
    listaNumeros = [];
    for (let i = 0; i < 10000; i++) {
        listaNumeros.push(String(i).padStart(4, "0"));
    }
    mostrarNumeros(listaNumeros);
}

// Opcional: Si aún quieres usar Excel de respaldo, se mantiene la función
if (archivo) {
    archivo.addEventListener("change", leerExcel);
}

function leerExcel(e) {
    const reader = new FileReader();
    reader.onload = function (evt) {
        const workbook = XLSX.read(evt.target.result, { type: 'binary' });
        const hoja = workbook.Sheets[workbook.SheetNames[0]];
        listaNumeros = XLSX.utils.sheet_to_json(hoja, { header: 1 })
            .flat()
            .filter(x => x !== "" && x != null)
            .map(x => String(x).padStart(4, "0"));
        mostrarNumeros(listaNumeros);
    }
    reader.readAsBinaryString(e.target.files[0]);
}

function mostrarNumeros(lista) {
    if (!numerosDiv) return;
    numerosDiv.innerHTML = "";

    // Limitamos la visualización inicial o filtrada para que el navegador y el celular no se pongan lentos
    const mostrarLimite = lista.length > 500 ? lista.slice(0, 500) : lista;

    mostrarLimite.forEach(numero => {
        const div = document.createElement("div");
        div.className = "numero";
        div.textContent = numero;

        if (vendidos.has(numero)) {
            div.classList.add("vendido");
        } else if (seleccionados.has(numero)) {
            div.classList.add("seleccionado");
        }

        div.onclick = function () {
            if (vendidos.has(numero)) {
                return;
            }

            if (seleccionados.has(numero)) {
                seleccionados.delete(numero);
                div.classList.remove("seleccionado");
            } else {
                seleccionados.add(numero);
                div.classList.add("seleccionado");
            }

            if (cantidad) cantidad.textContent = seleccionados.size;
        };

        numerosDiv.appendChild(div);
    });

    if (lista.length > 500 && buscar && !buscar.value) {
        // Aviso visual sutil si hay muchos números y se usa scroll o búsqueda
        console.log("Mostrando primeros 500 números para optimizar rendimiento. Usa el buscador para encontrar específicos.");
    }
}

if (buscar) {
    buscar.addEventListener("input", function () {
        let texto = this.value.trim();
        let resultado = listaNumeros.filter(n => n.includes(texto));
        mostrarNumeros(resultado);
    });
}

if (btnCopiar) {
    btnCopiar.onclick = function () {
        navigator.clipboard.writeText([...seleccionados].join("\n"));
        alert("Números copiados");
    };
}

if (btnWhatsapp) {
    btnWhatsapp.onclick = function () {
        let mensaje = [...seleccionados].join("\n");
        window.open(
            "https://wa.me/59167723609?text=" + encodeURIComponent(mensaje),
            "_blank"
        );
    };
}

if (btnConfirmar) {
    btnConfirmar.onclick = function () {
        seleccionados.forEach(numero => vendidos.add(numero));
        localStorage.setItem(
            "vendidos",
            JSON.stringify([...vendidos])
        );
        seleccionados.clear();
        if (cantidad) cantidad.textContent = 0;
        mostrarNumeros(listaNumeros);
        alert("Venta guardada correctamente.");
    };
}

// Ejecutar al cargar la página
window.onload = inicializarNumeros;