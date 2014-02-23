// Varias funciones para generar y manipular tablas extraídas de un CSV. Algunas más genéricas que otras. 
// Autor: Javier Moreno (bluelephant@gmail.com)

function isElementOf(x, array){ return array.indexOf(x) != -1;}

function interSection(a, b){return a.filter(function i(e){return isElementOf(e,b);})}

function subArregloPorIndices(arr, indexes){
	var output = new Array();
	for(var i = 0; i< indexes.length; i++){
		output.push(arr[indexes[i]]);
	}
	return output;
}

function extraerColumnas(tab, indexes){
	var output = new Array();
	for(var i = 0 ; i <tab.length; i++){
		output.push(subArregloPorIndices(tab[i], indexes));
	}
	return output;
}

function columnaTabla(tab, index){
	var output = new Array();
	for(var i=0;i<tab.length;i++){
		output.push(tab[i][index]);
	}
	return output;
}

// Orden reverso (!) por índice index

function ordenarTabla(tab, index){
	var tablafiltrada = tab.filter(function f(e){return !(isNaN(e[index]));})
	return tablafiltrada.sort(function(x,y){return y[index]-x[index];});
}

function tablaHomicidios(tab , yr){
	var homindex = 3 * (yr - 1989);
	var columnas = [0,1,2];
	columnas.push(homindex);
	return extraerColumnas(tab, columnas);
}

function ordenarTablaHom(tab , yr){
	var homindex = 3 * (yr - 1989);
	return ordenarTabla(tab, homindex);
}

function tablaTasas(tab , yr){
	var tasindex = 2 + (3 * (yr - 1989));
	var columnas = [0,1,2];
	columnas.push(tasindex);
	return extraerColumnas(tab, columnas);
}

function ordenarTablaTas(tab , yr){
	var tasindex = 2+ (3 * (yr - 1989));
	return ordenarTabla(tab, tasindex);
}


// La primera columna de la tabla es usada como parte de la clase de la fila y no es impresa.

function tablaImpresa(tabla, encabezados, clase){
	var output='<table class="table table-condensed">';
	var n = encabezados.length;
	var v;
	output = output.concat('<thead><tr>');
    output = output.concat('<th></th>');
	for(var i=0;i<n;i++){
		output = output.concat('<th>').concat(encabezados[i]).concat('</th>');
	}
	output = output.concat('</tr></thead>');
	output = output.concat('<tbody>');
	for(var j=0;j<tabla.length;j++){
		output = output.concat('<tr class="' + clase + ' fila_' + tabla[j][0].replace(/"/g, '') + '">');
        output = output.concat('<td>').concat(j+1).concat('</td>');
		for(var k=0;k<n;k++){
			if(isNaN(tabla[j][k+1])){
				v = tabla[j][k+1].replace(/"/g, '');
			}
			else{
				if(Number(tabla[j][k+1]) === parseInt(Number(tabla[j][k+1]))){v = Number(tabla[j][k+1]);}
				else{v = Number(tabla[j][k+1]).toFixed(2);}
			}
			output = output.concat('<td>').concat(v).concat('</td>');
		}
		output = output.concat('</tr>');
	}
	output = output.concat('</tbody></table>');
	return output;
}

function totalHomicidios(tabla, yr){
	var homindex = 3 * (yr - 1989);
    var arrhoms = columnaTabla(tabla, homindex).map(function(x){
    	if(isNaN(x)){return 0;}
    	else{return Number(x);}});
    return arrhoms.reduce(function(a,b){return a+b});
}

function generadorTablas(tabla, yr, n){
    var encabezadohom = ["Municipio", "Departamento", "Número de Homicidios"];
    var encabezadotas = ["Municipio", "Departamento", "Tasa de Homicidios"];

	var totalhom = totalHomicidios(tabla, yr); 

    var izquierda = ordenarTablaHom(tabla, yr).slice(0,n);
    var totalhomizq = totalHomicidios(izquierda, yr);
    var indicesizquierda = columnaTabla(izquierda, 0);
    var izquierdaimpresa = tablaImpresa(tablaHomicidios(izquierda, yr), encabezadohom, "hom");

 	var derecha =  ordenarTablaTas(tabla, yr).slice(0,n);
 	var totalhomder = totalHomicidios(derecha, yr);
 	var indicesderecha = columnaTabla(derecha, 0);
 	var derechaimpresa = tablaImpresa(tablaTasas(derecha, yr), encabezadotas, "tas");

 	var interseccionindices = interSection(indicesizquierda, indicesderecha);

 	var porctoptas = 100 * totalhomder / totalhom;
 	var porctophom = 100 * totalhomizq / totalhom;

 	$('#tabla-izquierda').empty();
 	$('#tabla-derecha').empty();
 	$('.porc-top-tas').empty();
 	$('.porc-top-hom').empty();
 	$('.selected-year').empty();
 	$('.selected-year').append(yr);
 	$('.porc-top-tas').append(porctoptas.toFixed(2));
 	$('.porc-top-hom').append(porctophom.toFixed(2));
 	$('#tabla-izquierda').append(izquierdaimpresa);
 	$('#tabla-derecha').append(derechaimpresa);
 	for(var i=0; i<interseccionindices.length;i++){
 		var clase = 'fila_' + interseccionindices[i];
 		$('.' + clase).addClass("warning");
 	}
}

function procesarTabla(archivo) {
	var tabla = new Array();
    var lineas = archivo.split(/\r\n|\n/);
    var encabezado = lineas[0].split(',');

    for (var i=1; i<lineas.length; i++) {
        var linea = lineas[i].split(',');
        if (linea.length == encabezado.length) {
            var linearreglo = [];
            for (var j=0; j<encabezado.length; j++) {
                linearreglo.push(linea[j]);
            }
            tabla.push(linearreglo);
        }
    }
    generadorTablas(tabla, 1990, 50);
    $('#years').change(function(){
    	var agno = Number(this.value);
    	generadorTablas(tabla, agno, 50);
    });
}

function imprimirAgnos(num){
	var output = '';
	for(var i=1990; i <= num; i++){
		output = output + '<option value="' + i + '">' + i + '</option>';
	}
	return output;
}

$(document).ready(function() {
	var agnosimpresos = imprimirAgnos(2013);
	$('#years').append(agnosimpresos);
    $.ajax({
        type: "GET",
        url: "homicidios.1990.a.2013.csv",
        dataType: "text",
        success: function(archivo) {procesarTabla(archivo);}
     });
});