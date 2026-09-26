const archivo = document.getElementById("archivo");
const buscar = document.getElementById("buscar");
const numerosDiv = document.getElementById("numeros");
const cantidad = document.getElementById("cantidad");
const btnCopiar = document.getElementById("copiar");
const btnWhatsapp = document.getElementById("whatsapp");

let listaNumeros = [];
let seleccionados = new Set();
let vendidos = new Set(
    JSON.parse(localStorage.getItem("vendidos") || "[]")
);

const btnConfirmar = document.getElementById("confirmar");
archivo.addEventListener("change", leerExcel);

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

    numerosDiv.innerHTML = "";

lista.forEach(numero => {

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

        cantidad.textContent = seleccionados.size;
    };

    numerosDiv.appendChild(div);

});

}


buscar.addEventListener("input", function () {

    let texto = this.value;

    let resultado = listaNumeros.filter(n => n.includes(texto));

    mostrarNumeros(resultado);

});

btnCopiar.onclick = function () {

    navigator.clipboard.writeText([...seleccionados].join("\n"));

   alert("Números copiados");

};

btnWhatsapp.onclick = function () {

    let mensaje = [...seleccionados].join("\n");

    window.open(
        "https://wa.me/59167723609?text=" + encodeURIComponent(mensaje),
        "_blank"
    );

}btnConfirmar.onclick = function () {

    seleccionados.forEach(numero => vendidos.add(numero));

    localStorage.setItem(
        "vendidos",
        JSON.stringify([...vendidos])
    );

    seleccionados.clear();

    mostrarNumeros(listaNumeros);

    alert("Venta guardada correctamente.");}