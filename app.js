// URL de publicación en la Web de tu Google Sheet (CSV)
const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTx3ofaEsx5VvKJyfc7m709ObhI1AHG8zEHC6ppxrIKyG0tHKgT5K17pytj-th9YmGtBA6eZK-DiHmX/pub?output=csv';

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
                
                if (numStr.toLowerCase() === 'numero' || numStr.toLowerCase() === 'número') {
                    return null;
                }

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
            // ROJO: Ya vendido y pagado
            btn.className = 'btn btn-danger m-1 disabled';
            btn.title = 'Vendido';
        } else if (estado === 'apartado' || estado === 'reservado' || estado === 'ocupado') {
            // NARANJA: Apartado previamente por otro usuario (no interactivo)
            btn.className = 'btn btn-warning m-1 disabled';
            btn.style.backgroundColor = '#ff9800';
            btn.style.borderColor = '#e68a00';
            btn.style.color = '#fff';
            btn.title = 'Apartado por otro usuario';
        } else if (seleccionados.includes(item.numero)) {
            // AZUL / VERDE LIMA: Seleccionado en este momento por el usuario actual
            btn.className = 'btn btn-success m-1 fw-bold';
            btn.style.backgroundColor = '#28a745';
            btn.style.color = '#fff';
        } else {
            // GRIS: Disponible
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
    const apartados = numerosData.filter(i => ['apartado', 'reservado', 'ocupado'].includes(i.estado.toLowerCase())).length;
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
        btnWsp = document.createElement('a');
        btnWsp.id = 'btnWhatsAppFloating';
        btnWsp.target = '_blank';
        btnWsp.style.position = 'fixed';
        btnWsp.style.bottom = '20px';
        btnWsp.style.right = '20px';
        btnWsp.style.backgroundColor = '#25D366';
        btnWsp.style.color = '#FFF';
        btnWsp.style.padding = '12px 20px';
        btnWsp.style.borderRadius = '30px';
        btnWsp.style.boxShadow = '0px 4px 10px rgba(0,0,0,0.3)';
        btnWsp.style.fontWeight = 'bold';
        btnWsp.style.fontSize = '16px';
        btnWsp.style.textDecoration = 'none';
        btnWsp.style.zIndex = '9999';
        btnWsp.style.display = 'none';
        document.body.appendChild(btnWsp);
    }
    actualizarBotonWhatsApp();
}

function actualizarBotonWhatsApp() {
    const btnWsp = document.getElementById('btnWhatsAppFloating');
    if (!btnWsp) return;

    if (seleccionados.length > 0) {
        const numerosTexto = seleccionados.join(', ');
        const mensaje = encodeURIComponent(`Hola, deseo apartar los siguientes números para el sorteo: ${numerosTexto}`);
        btnWsp.href = `https://wa.me/${TELEFONO_WHATSAPP}?text=${mensaje}`;
        btnWsp.innerHTML = `📲 Apartar (${seleccionados.length}) por WhatsApp`;
        btnWsp.style.display = 'block';
    } else {
        btnWsp.style.display = 'none';
    }
}