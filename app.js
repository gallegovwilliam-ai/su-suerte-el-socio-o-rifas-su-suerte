// ID de tu Google Sheet
const SPREADSHEET_ID = '1lN2CFy7aPlprmtiufaXcOv_lAfZtFcpt4dFqmsZOt_g';
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json`;

let numerosData = [];
let seleccionados = [];

document.addEventListener('DOMContentLoaded', () => {
    cargarDatosDesdeGoogleSheets();
});

function cargarDatosDesdeGoogleSheets() {
    fetch(SHEET_URL)
        .then(response => response.text())
        .then(data => {
            const jsonString = data.substring(47, data.length - 2);
            const json = JSON.parse(jsonString);
            
            const filas = json.table.rows;
            numerosData = filas.map((row, index) => {
                let num = row.c[0] ? String(row.c[0].v) : String(index);
                let estado = row.c[1] ? String(row.c[1].v) : 'disponible';
                return {
                    numero: num.padStart(4, '0'),
                    estado: estado
                };
            });
            
            renderGrid(numerosData);
            actualizarContadores();
        })
        .catch(error => {
            console.error('Error al cargar Google Sheets:', error);
        });
}

function renderGrid(data) {
    const gridContainer = document.getElementById('grid') || document.querySelector('.row.g-2') || document.getElementById('gridContainer');
    if (!gridContainer) return;

    gridContainer.innerHTML = '';

    data.forEach(item => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn m-1 font-monospace';
        btn.style.width = '75px';
        btn.style.height = '45px';
        btn.innerText = item.numero;

        const estado = item.estado.toLowerCase();

        if (estado === 'vendido') {
            btn.classList.add('btn-danger', 'disabled');
        } else if (seleccionados.includes(item.numero)) {
            btn.classList.add('btn-warning');
        } else {
            btn.classList.add('btn-outline-secondary');
        }

        btn.addEventListener('click', () => toggleSeleccion(item.numero));
        gridContainer.appendChild(btn);
    });
}

function toggleSeleccion(numero) {
    const index = seleccionados.indexOf(numero);
    if (index === -1) {
        seleccionados.push(numero);
    } else {
        seleccionados.splice(index, 1);
    }
    renderGrid(numerosData);
    actualizarContadores();
}

function actualizarContadores() {
    const total = numerosData.length;
    const vendidos = numerosData.filter(i => i.estado.toLowerCase() === 'vendido').length;
    const seleccionadosCount = seleccionados.length;
    const disponibles = total - vendidos - seleccionadosCount;

    const elDisp = document.getElementById('disponibles') || document.querySelector('.card-body h3');
    const elSel = document.getElementById('seleccionados');
    const elVen = document.getElementById('vendidos');

    if (elDisp) elDisp.innerText = disponibles;
    if (elSel) elSel.innerText = seleccionadosCount;
    if (elVen) elVen.innerText = vendidos;
}