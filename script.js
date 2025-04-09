document.addEventListener('DOMContentLoaded', function() {
    const calcularBtn = document.getElementById('calcular-btn');
    calcularBtn.addEventListener('click', calcularDistribucion);
    
    // Mostrar/ocultar campos de dimensiones personalizadas según la selección
    const radioPalets = document.querySelectorAll('input[name="tipo-palet"]');
    const dimensionesPersonalizadas = document.getElementById('dimensiones-personalizadas');
    
    radioPalets.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'personalizado') {
                dimensionesPersonalizadas.classList.remove('hidden');
            } else {
                dimensionesPersonalizadas.classList.add('hidden');
            }
        });
    });

    function calcularDistribucion() {
        // Validar que todos los campos estén completos
        const inputs = ['caja-largo', 'caja-ancho', 'caja-alto', 'altura-maxima'];
        for (const inputId of inputs) {
            const input = document.getElementById(inputId);
            if (!input.value || isNaN(parseFloat(input.value)) || parseFloat(input.value) <= 0) {
                alert(`Por favor, ingrese un valor válido para ${input.placeholder.toLowerCase()}`);
                input.focus();
                return;
            }
        }

        // Obtener dimensiones de la caja
        const cajaLargo = parseFloat(document.getElementById('caja-largo').value);
        const cajaAncho = parseFloat(document.getElementById('caja-ancho').value);
        const cajaAlto = parseFloat(document.getElementById('caja-alto').value);
        
        // Obtener tipo de palet
        const tipoPalet = document.querySelector('input[name="tipo-palet"]:checked').value;
        
        // Dimensiones del palet según el tipo
        let paletLargo, paletAncho;
        if (tipoPalet === 'americano') {
            paletLargo = 120;
            paletAncho = 100;
        } else if (tipoPalet === 'europeo') {
            paletLargo = 120;
            paletAncho = 80;
        } else if (tipoPalet === 'personalizado') {
            // Validar los campos personalizados
            const inputsPalet = ['palet-largo', 'palet-ancho'];
            for (const inputId of inputsPalet) {
                const input = document.getElementById(inputId);
                if (!input.value || isNaN(parseFloat(input.value)) || parseFloat(input.value) <= 0) {
                    alert(`Por favor, ingrese un valor válido para ${input.placeholder.toLowerCase()}`);
                    input.focus();
                    return;
                }
            }
            
            paletLargo = parseFloat(document.getElementById('palet-largo').value);
            paletAncho = parseFloat(document.getElementById('palet-ancho').value);
        }
        
        // Altura máxima permitida
        const alturaMaxima = parseFloat(document.getElementById('altura-maxima').value);
        
        // Calcular las posibles combinaciones (6 en total) en orden específico
        const combinaciones = calcularTodasLasCombinaciones(
            cajaLargo, cajaAncho, cajaAlto,
            paletLargo, paletAncho, alturaMaxima
        );
        
        // Mostrar resultados
        mostrarResultados(combinaciones, tipoPalet, paletLargo, paletAncho);
    }
    
    function calcularTodasLasCombinaciones(cajaLargo, cajaAncho, cajaAlto, paletLargo, paletAncho, alturaMaxima) {
        const combinaciones = [];
        let mejorCombinacion = null;
        let maxCajas = 0;
        
        // Combinación 1: Alto original, largo y ancho en base (dimAlto = cajaAlto)
        const combo1 = calcularCombinacion(cajaLargo, cajaAncho, cajaAlto, paletLargo, paletAncho, alturaMaxima);
        combinaciones.push(combo1);
        if (combo1.totalCajas > maxCajas) {
            maxCajas = combo1.totalCajas;
            mejorCombinacion = 0;
        }
        
        // Combinación 2: Alto original, ancho y largo en base (intercambiados en la base) (dimAlto = cajaAlto)
        const combo2 = calcularCombinacion(cajaAncho, cajaLargo, cajaAlto, paletLargo, paletAncho, alturaMaxima);
        combinaciones.push(combo2);
        if (combo2.totalCajas > maxCajas) {
            maxCajas = combo2.totalCajas;
            mejorCombinacion = 1;
        }
        
        // Combinación 3: Alto como largo original, ancho y alto en base
        const combo3 = calcularCombinacion(cajaAncho, cajaAlto, cajaLargo, paletLargo, paletAncho, alturaMaxima);
        combinaciones.push(combo3);
        if (combo3.totalCajas > maxCajas) {
            maxCajas = combo3.totalCajas;
            mejorCombinacion = 2;
        }
        
        // Combinación 4: Alto como largo original, alto y ancho en base
        const combo4 = calcularCombinacion(cajaAlto, cajaAncho, cajaLargo, paletLargo, paletAncho, alturaMaxima);
        combinaciones.push(combo4);
        if (combo4.totalCajas > maxCajas) {
            maxCajas = combo4.totalCajas;
            mejorCombinacion = 3;
        }
        
        // Combinación 5: Alto como ancho original, largo y alto en base
        const combo5 = calcularCombinacion(cajaLargo, cajaAlto, cajaAncho, paletLargo, paletAncho, alturaMaxima);
        combinaciones.push(combo5);
        if (combo5.totalCajas > maxCajas) {
            maxCajas = combo5.totalCajas;
            mejorCombinacion = 4;
        }
        
        // Combinación 6: Alto como ancho original, alto y largo en base
        const combo6 = calcularCombinacion(cajaAlto, cajaLargo, cajaAncho, paletLargo, paletAncho, alturaMaxima);
        combinaciones.push(combo6);
        if (combo6.totalCajas > maxCajas) {
            maxCajas = combo6.totalCajas;
            mejorCombinacion = 5;
        }
        
        // Marcar la mejor combinación
        combinaciones.forEach((combo, index) => {
            combo.esMejor = (index === mejorCombinacion);
        });
        
        return combinaciones;
    }
    
    function calcularCombinacion(dimBase1, dimBase2, dimAlto, paletLargo, paletAncho, alturaMaxima) {
        // Calcular cuántas cajas caben en cada dirección
        const cajasLargo = Math.floor(paletLargo / dimBase1);
        const cajasAncho = Math.floor(paletAncho / dimBase2);
        const nivelAltura = Math.floor(alturaMaxima / dimAlto);
        
        const cajasPorNivel = cajasLargo * cajasAncho;
        const totalCajas = cajasPorNivel * nivelAltura;
        
        // Calcular eficiencia
        const areaPalet = paletLargo * paletAncho;
        const areaCajasNivel = cajasPorNivel * dimBase1 * dimBase2;
        const eficienciaNivel = (areaCajasNivel / areaPalet) * 100;
        const areaSinUsar = areaPalet - areaCajasNivel;
        
        return {
            orientacion: `${dimBase1} x ${dimBase2} x ${dimAlto}`,
            cajasLargo: cajasLargo,
            cajasAncho: cajasAncho,
            cajasPorNivel: cajasPorNivel,
            nivelAltura: nivelAltura,
            totalCajas: totalCajas,
            eficienciaNivel: eficienciaNivel,
            areaSinUsar: areaSinUsar,
            cargaAltura: dimAlto * nivelAltura,
            descripcion: `Base: ${dimBase1}x${dimBase2}, Alto: ${dimAlto}`,
            esMejor: false
        };
    }
    
    function mostrarResultados(combinaciones, tipoPalet, paletLargo, paletAncho) {
        const resultadosDiv = document.getElementById('resultados');
        
        // Información del palet
        let nombreTipoPalet = "";
        if (tipoPalet === 'americano') {
            nombreTipoPalet = 'Americano (120 x 100 cm)';
        } else if (tipoPalet === 'europeo') {
            nombreTipoPalet = 'Europeo (120 x 80 cm)';
        } else {
            nombreTipoPalet = `Personalizado (${paletLargo} x ${paletAncho} cm)`;
        }
        
        let html = `
            <p><strong>Tipo de palet:</strong> ${nombreTipoPalet}</p>
            <h3>Las 6 combinaciones posibles:</h3>
        `;
        
        // Encontrar la mejor combinación
        let mejorIndex = -1;
        let maxCajas = -1;
        
        combinaciones.forEach((combo, index) => {
            if (combo.totalCajas > maxCajas) {
                maxCajas = combo.totalCajas;
                mejorIndex = index;
            }
        });
        
        // Mostrar las combinaciones en el orden solicitado
        combinaciones.forEach((combo, index) => {
            // Etiquetas especiales para identificar los grupos
            let etiqueta = "";
            if (index < 2) {
                etiqueta = " (Manteniendo alto original)";
            } else if (index < 4) {
                etiqueta = " (Usando largo como alto)";
            } else {
                etiqueta = " (Usando ancho como alto)";
            }
            
            // Título para cada combinación
            html += `
                <div class="combinacion-title">Combinación ${index + 1}${etiqueta}: ${combo.descripcion}</div>
                <table>
                    <thead>
                        <tr>
                            <th>Orientación (cm)</th>
                            <th>Cajas a lo largo</th>
                            <th>Cajas a lo ancho</th>
                            <th>Cajas por nivel</th>
                            <th>Niveles</th>
                            <th>Total cajas</th>
                            <th>Eficiencia nivel (%)</th>
                            <th>Área sin usar (cm²)</th>
                            <th>Altura carga (cm)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr class="${combo.esMejor ? 'mejor-opcion' : ''}">
                            <td>${combo.orientacion}</td>
                            <td>${combo.cajasLargo}</td>
                            <td>${combo.cajasAncho}</td>
                            <td>${combo.cajasPorNivel}</td>
                            <td>${combo.nivelAltura}</td>
                            <td><strong>${combo.totalCajas}</strong></td>
                            <td>${combo.eficienciaNivel.toFixed(2)}%</td>
                            <td>${combo.areaSinUsar.toFixed(2)}</td>
                            <td>${combo.cargaAltura.toFixed(2)}</td>
                        </tr>
                    </tbody>
                </table>
            `;
        });
        
        // Añadir una conclusión sobre la mejor combinación
        if (mejorIndex >= 0) {
            const mejorOpcion = combinaciones[mejorIndex];
            html += `
                <div style="margin-top: 20px; padding: 15px; background-color: #d4edda; border-radius: 5px;">
                    <h3>Mejor combinación</h3>
                    <p>La combinación más eficiente es la <strong>Combinación ${mejorIndex + 1}</strong> 
                    con orientación <strong>${mejorOpcion.descripcion}</strong>, 
                    que permite apilar un total de <strong>${mejorOpcion.totalCajas} cajas</strong> 
                    con una eficiencia del <strong>${mejorOpcion.eficienciaNivel.toFixed(2)}%</strong> por nivel.</p>
                </div>
            `;
        }
        
        resultadosDiv.innerHTML = html;
    }
});