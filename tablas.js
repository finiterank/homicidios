// Varias funciones para generar y manipular tablas extraídas de un CSV. Algunas más genéricas que otras. 
// Autor: Javier Moreno (bluelephant@gmail.com)
// Febrero de 2014

// Gráficos 

var margin = {top: 20, right: 20, bottom: 30, left: 40};
var width = parseFloat(d3.select("#grafico").style("width")) - margin.left - margin.right;
var height = 180 - margin.top - margin.bottom;

console.log(width);

var x = d3.scale.ordinal()
    .rangeRoundBands([0, width], .1);

var y = d3.scale.linear()
    .range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var svg = d3.select("#grafico").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)

function click(d){
  generadorTablas(tabla, d.yr, 50);
}

function pintarGrafico(tabla){
	var data = new Array();

	var arreglohomicidios = conteoHomicidios(tabla, 1990, 2013);
	var arreglopoblacion = conteoPoblacion(tabla, 1990, 2013);

	var valores = calcularTasas(arreglohomicidios, arreglopoblacion);

	for(var yr = 1990; yr<= 2013; yr++){
  		data.push({'yr': yr, 'tasa': valores[yr-1990]});
  	}

	x.domain(data.map(function(d) { return d.yr.toString().slice(-2);}));
	y.domain([0, d3.max(data, function(d) { return d.tasa; })]);

  var xax = svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  var bars = svg.selectAll(".bar")
      .data(data)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function(d) { return x(d.yr.toString().slice(-2)); })
      .attr("yr", function(d){return d.yr;})
      .attr("width", x.rangeBand())
      .attr("y", function(d) { return y(d.tasa); })
      .attr("height", function(d) { return height - y(d.tasa); })
      .on("click", function(d){
      	generadorTablas(tabla, d.yr, 50);
      });

  var labels = svg.selectAll("text.lab-barras")
  				.data(data)
  				.enter().append("text")
  				.attr("class", "lab-barras")
  				.text(function(d){return d.tasa.toFixed(1);})
  				.attr("x", function(d) { return x(d.yr.toString().slice(-2)) + x.rangeBand() / 2 ; })
  				.attr("text-anchor", "middle")
  				.attr("y", function(d) { return y(d.tasa) + 15; })
  				.attr("font-size", "7.8px")
  				.attr("fill", "white");

d3.select(window).on('resize', resize); 


function resize(){
	// Reestablecer el ancho
	width = parseFloat(d3.select("#grafico").style("width")) - margin.left - margin.right;
	console.log(width);
	// Reestablecer la escala en el eje X.
	
	x.domain(data.map(function(d) { return d.yr.toString().slice(-2);}))
		.rangeRoundBands([0, width], 0.1);

	// Reestablecer el ancho del SVG
	d3.select("svg").attr("width", width);
	
	console.log("SVG: " + d3.select("svg").style("width"));
	// Reestablecer el ancho de las barras y su posición.
	xAxis.scale(x);

	xax.call(xAxis);

	bars
		.attr("x",  function(d) { return x(d.yr.toString().slice(-2)); })
		.attr("width", x.rangeBand());
	labels
		.attr("x", function(d) { return x(d.yr.toString().slice(-2)) + x.rangeBand() / 2 ; })
}

};




// Tablas


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

// Orden reverso (!) por índice index (¡columna numérica!)

function ordenarTabla(tab, index){
	var tablafiltrada = tab.filter(function f(e){return !(isNaN(e[index]));})
	return tablafiltrada.sort(function(x,y){return y[index]-x[index];});
}

function tablaHomTasPob(tab , yr){
	var homindex = 3 * (yr - 1989);
	var tasindex = 2 + (3 * (yr - 1989));
	var popindex = 1 + (3 * (yr - 1989));
	var columnas = [0,1,2];
	columnas.push(homindex);
	columnas.push(tasindex);
	columnas.push(popindex);
	return extraerColumnas(tab, columnas);
}

function ordenarTablaHom(tab , yr){
	var homindex = 3 * (yr - 1989);
	return ordenarTabla(tab, homindex);
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
            var claseCol = '';
			if(isNaN(tabla[j][k+1])){
                claseCol = '';
				v = tabla[j][k+1].replace(/"/g, '');
			}
			else{
                claseCol = 'numero';
				if(Number(tabla[j][k+1]) === parseInt(Number(tabla[j][k+1]))){v = Number(tabla[j][k+1]);}
				else{v = Number(tabla[j][k+1]).toFixed(2);}
			}
			output = output.concat('<td class="' + claseCol + '">').concat(v).concat('</td>');
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

function totalPoblacion(tabla, yr){
	var pobindex = 1+ (3 * (yr - 1989));
    var arrpobs = columnaTabla(tabla, pobindex).map(function(x){
    	if(isNaN(x)){return 0;}
    	else{return Number(x);}});
    return arrpobs.reduce(function(a,b){return a+b});
}

// ¿Cómo vuelvo estas cuatro funciones dos de una forma elegante? 

function conteoHomicidios(tabla, yr1, yr2){
	var output = new Array();
	for(var i = yr1; i<=yr2; i++){
		output.push(totalHomicidios(tabla, i));
	}
	return output;
}

function conteoPoblacion(tabla, yr1, yr2){
	var output = new Array();
	for(var i = yr1; i<=yr2; i++){
		output.push(totalPoblacion(tabla, i));
	}
	return output;
}

// Para ser serios habría que revisar que ambos arreglos tienen la misma longitud, supongo...

function calcularTasas(arrhoms, arrpobs){
	var output = new Array();
	for(var i = 0; i< arrhoms.length; i++){
		output.push(100000 * (arrhoms[i]/arrpobs[i]));
	}
	return output;
}

function generadorTablas(tabla, yr, n){
    var encabezado = ["Municipio", "Departamento", "Número de Homicidios", "Tasa de Homicidios", "Población"];

    var totalhom = totalHomicidios(tabla, yr); 
    var totalpob = totalPoblacion(tabla,yr);

    var izquierda = ordenarTablaHom(tabla, yr).slice(0,n);
    var totalhomizq = totalHomicidios(izquierda, yr);
    var totalpobizq = totalPoblacion(izquierda,yr);
    var indicesizquierda = columnaTabla(izquierda, 0);
    var izquierdaimpresa = tablaImpresa(tablaHomTasPob(izquierda, yr), encabezado, "hom");

 	var derecha =  ordenarTablaTas(tabla, yr).slice(0,n);
 	var totalhomder = totalHomicidios(derecha, yr);
 	var totalpobder = totalPoblacion(derecha,yr);
 	var indicesderecha = columnaTabla(derecha, 0);
 	var derechaimpresa = tablaImpresa(tablaHomTasPob(derecha, yr), encabezado, "tas");

 	var interseccionindices = interSection(indicesizquierda, indicesderecha);
 	var numeroviolentos = interseccionindices.length;

 	var porctoptas = 100 * totalhomder / totalhom;
 	var porctophom = 100 * totalhomizq / totalhom;
 	var porcpobtoptas = 100 * totalpobder / totalpob;
 	var porcpobtophom = 100 * totalpobizq / totalpob;

 	var viejoyr = $( ".selected-yr" ).text();
    var viejoyrnum = Number(viejoyr);
    d3.select('[yr="'+ viejoyrnum +'"]').classed("yr-activo", false);
 	$('.selected-yr').empty();
 	$('.selected-yr').append(yr);
 	d3.select('[yr="'+ yr +'"]').classed("yr-activo", true);
 	$('#tabla-izquierda').empty();
 	$('#tabla-derecha').empty();
 	$('.porc-pob-top-tas').empty();
 	$('.porc-pob-top-hom').empty();

 	$('.porc-top-tas').empty();
 	$('.porc-top-hom').empty();
 	$('.num-vio').empty();
 	$('.num-vio').append(numeroviolentos);
 	$('.selected-year').empty();
 	$('.selected-year').append(yr);
 	$('.porc-top-tas').append(porctoptas.toFixed(2));
 	$('.porc-top-hom').append(porctophom.toFixed(2));
 	$('.porc-pob-top-tas').append(porcpobtoptas.toFixed(2));
 	$('.porc-pob-top-hom').append(porcpobtophom.toFixed(2));
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
    pintarGrafico(tabla);
    generadorTablas(tabla, 1990, 50);
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
