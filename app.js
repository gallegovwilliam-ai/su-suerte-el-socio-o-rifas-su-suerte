// URL de publicación en la Web de tu Google Sheet (Lectura de datos)
const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTx3ofaEsx5VvKJyfc7m709ObhI1AHG8zEHC6ppxrIKyG0tHKgT5K17pytj-th9YmGtBA6eZK-DiHmX/pub?output=csv';

// URL de tu Google Apps Script (Escritura de datos)
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwjw-89xBPNckbtGHDQ8LUmN5hwdo4JDLM1OwIOl97d8zuD43Uk2GVuFcURXRZ8DnE/exec'; 

// Número de WhatsApp para recibir los pedidos (sin + ni espacios)
const TELEFONO_WHATSAPP = '59167723609';

let numerosData = [];
let seleccionados = [];

document.addEventListener('DOMContentLoaded', () => {
    cargarDatosDesdeGoogleSheets();
    crearBotonWhatsApp();
});

function cargarDatosDesdeGoogleSheets() {
    fetch(SHEET_URL)
        .then(response => response.text())
        .then(csvText => {
            const filas = csvText.split('\n');
            numerosData = filas.map((rowStr, index) => {
                if (!rowStr.trim()) return null;
                const columnas = rowStr.split(',');
                let numStr = columnas[0] ? columnas[0].replace(/"/g, '').trim() : String(index);
                let estadoStr = columnas[1] ? columnas[1].replace(/"/g, '').trim() : 'disponible';
                
                if (numStr.toLowerCase() === 'numero' || numStr.toLowerCase() === 'número') return null;
                if (!isNaN(numStr) && numStr.length < 4) numStr = numStr.padStart(4, '0');

                return { numero: numStr, estado: estadoStr };
            }).filter(item => item !== null);

            renderGrid(numerosData);
            actualizarContadores();
        })
        .catch(error => console.error('Error al cargar datos:', error));
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
            btn.title = 'Vendido';
        } else if (estado === 'apartado' || estado === 'reservado') {
            btn.className = 'btn btn-warning m-1 disabled';
            btn.style.backgroundColor = '#ff9800';
            btn.style.color = '#fff';
            btn.title = 'Apartado previa selección';
        } else if (seleccionados.includes(item.numero)) {
            btn.className = 'btn btn-success m-1 fw-bold';
            btn.style.backgroundColor = '#28a745';
            btn.style.color = '#fff';
        } else {
            btn.className = 'btn btn-outline-secondary m-1';
            btn.addEventListener('click', () => toggleSeleccion(item.numero));
        }

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
    actualizarBotonWhatsApp();
}

function actualizarContadores() {
    const total = numerosData.length;
    const vendidos = numerosData.filter(i => i.estado.toLowerCase() === 'vendido').length;
    const apartados = numerosData.filter(i => ['apartado', 'reservado'].includes(i.estado.toLowerCase())).length;
    const seleccionadosCount = seleccionados.length;
    const disponibles = total - vendidos - apartados - seleccionadosCount;

    const elDisp = document.getElementById('disponibles') || document.querySelector('.card-body h3');
    const elSel = document.getElementById('seleccionados');
    const elVen = document.getElementById('vendidos');

    if (elDisp) elDisp.innerText = disponibles;
    if (elSel) elSel.innerText = seleccionadosCount;
    if (elVen) elVen.innerText = vendidos;
}

function crearBotonWhatsApp() {
    let btnWsp = document.getElementById('btnWhatsAppFloating');
    if (!btnWsp) {
        btnWsp = document.createElement('button');
        btnWsp.id = 'btnWhatsAppFloating';
        btnWsp.style.position = 'fixed';
        btnWsp.style.bottom = '20px';
        btnWsp.style.right = '20px';
        btnWsp.style.backgroundColor = '#25D366';
        btnWsp.style.color = '#FFF';
        btnWsp.style.border = 'none';
        btnWsp.style.padding = '12px 20px';
        btnWsp.style.borderRadius = '30px';
        btnWsp.style.boxShadow = '0px 4px 10px rgba(0,0,0,0.3)';
        btnWsp.style.fontWeight = 'bold';
        btnWsp.style.fontSize = '16px';
        btnWsp.style.cursor = 'pointer';
        btnWsp.style.zIndex = '9999';
        btnWsp.style.display = 'none';
        btnWsp.addEventListener('click', enviarYGuardarEnGoogleSheets);
        document.body.appendChild(btnWsp);
    }
    actualizarBotonWhatsApp();
}

function actualizarBotonWhatsApp() {
    const btnWsp = document.getElementById('btnWhatsAppFloating');
    if (!btnWsp) return;

    if (seleccionados.length > 0) {
        btnWsp.innerHTML = `📲 Apartar (${seleccionados.length}) por WhatsApp`;
        btnWsp.style.display = 'block';
    } else {
        btnWsp.style.display = 'none';
    }
}

function enviarYGuardarEnGoogleSheets() {
    if (seleccionados.length === 0) return;

    const numerosTexto = seleccionados.join(', ');
    const mensaje = encodeURIComponent(`Hola, deseo apartar los siguientes números para el sorteo: ${numerosTexto}`);
    const whatsappUrl = `https://wa.me/${TELEFONO_WHATSAPP}?text=${mensaje}`;

    // 1. Guardar automáticamente el estado "vendido" en tu Google Sheet
    fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ numeros: seleccionados })
    }).catch(err => console.error('Error enviando datos:', err));

    // 2. Redirigir a WhatsApp
    window.open(whatsappUrl, '_blank');

    // 3. Limpiar selección y refrescar interfaz local
    seleccionados = [];
    actualizarBotonWhatsApp();
    setTimeout(cargarDatosDesdeGoogleSheets, 2500);
}