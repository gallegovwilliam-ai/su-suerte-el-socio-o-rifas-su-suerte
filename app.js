
// URL de publicación en la Web de tu Google Sheet
const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTx3ofaEsx5VvKJyfc7m709ObhI1AHG8zEHC6ppxrIKyG0tHKgT5K17pytj-th9YmGtBA6eZK-DiHmX/pub?output=csv';

let numerosData = [];
let seleccionados = [];

document.addEventListener('DOMContentLoaded', () => {
    cargarDatosDesdeGoogleSheets();
});

function cargarDatosDesdeGoogleSheets() {
    fetch(SHEET_URL)
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al conectar con la hoja publicada');
            }
            return response.text();
        })
        .then(csvText => {
            const filas = csvText.split('\n');
            
            numerosData = filas.map((rowStr, index) => {
                if (!rowStr.trim()) return null;
                
                const columnas = rowStr.split(',');
                let numStr = columnas[0] ? columnas[0].replace(/"/g, '').trim() : String(index);
                let estadoStr = columnas[1] ? columnas[1].replace(/"/g, '').trim() : 'disponible';
                
                // Omitir la fila de encabezados (Numero, Estado)
                if (numStr.toLowerCase() === 'numero' || numStr.toLowerCase() === 'número') {
                    return null;
                }

                // Asegurar formato de 4 dígitos (completando ceros a la izquierda)
                if (!isNaN(numStr) && numStr.length < 4) {
                    numStr = numStr.padStart(4, '0');
                }

                return {
                    numero: numStr,
                    estado: estadoStr
                };
            }).filter(item => item !== null);

            renderGrid(numerosData);
            actualizarContadores();
        })
        .catch(error => {
            console.error('Error al cargar datos de Google Sheets:', error);
        });
}

function renderGrid(data) {
    let gridContainer = document.getElementById('grid') || 
                        document.getElementById('gridContainer') || 
                        document.querySelector('.row.g-2') || 
                        document.querySelector('.numbers-container') ||
                        document.querySelector('.container .row');

    if (!gridContainer) {
        gridContainer = document.createElement('div');
        gridContainer.id = 'gridContainer';
        gridContainer.className = 'd-flex flex-wrap justify-content-center';
        document.body.appendChild(gridContainer);
    }

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
            btn.className = 'btn btn-danger m-1 disabled';
        } else if (seleccionados.includes(item.numero)) {
            btn.className = 'btn btn-warning m-1';
        } else {
            btn.className = 'btn btn-outline-secondary m-1';
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