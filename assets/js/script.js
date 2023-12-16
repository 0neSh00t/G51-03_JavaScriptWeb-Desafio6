const htmlValorCambio = document.getElementById("valor-cambio");
const htmlPesosChileno = document.getElementById("pesos-chileno");
const htmlSelectMoneda = document.getElementById("select-moneda");
const htmlBtnCambio = document.getElementById("btn-cambio");
const htmlMsgError = document.getElementById("msgError");
const htmlChart = document.getElementById("myChart");
const apiURL = "https://mindicador.cl/api";
let myChart;

//Llamada a la API
const obtenerValoresMoneda = async (moneda) => {
  try {
    const valores = await fetch(apiURL + `/${moneda}`);
    if (!valores.ok) {
      throw new Error(`HTTP Error status: ${valores.status}`);
    }
    const valoresMoneda = await valores.json();
    return valoresMoneda;
  } catch (error) {
    htmlMsgError.innerHTML = `Unexpected Error | Message Error: ${error.message}`;
  }
};

//Funcion que calcula el valor en la moneda que el usuario eligio
const calcularCambioEnMoneda = async (valorCLP, moneda) => {
  try {
    const valorMoneda = await obtenerValoresMoneda(moneda);
    const valorDelCambio = valorCLP / valorMoneda.serie[0].valor;
    return valorDelCambio.toFixed(2);
  } catch (error) {
    htmlMsgError.innerHTML = `Unexpected Error | Message Error: ${error.message}`;
  }
};

//Funcion que permite destruir el grafico anterior
const destruirGraficoAnterior = () => {
  if (myChart) {
    myChart.clear();
    myChart.destroy();
  }
};

//Permite generar el grafico
const mostrarGrafico = async (moneda) => {
  const valoresMonedas = await obtenerValoresMoneda(moneda);
  valoresMonedas.serie.reverse();
  const fechasMoneda = obtenerFechas(valoresMonedas.serie);
  const valorMoneda = obtenerValores(valoresMonedas.serie);
  const configGrafico = renderGrafico(fechasMoneda, valorMoneda);

  htmlChart.style.backgroundColor = "#EAFAF1";
  myChart = new Chart(htmlChart, configGrafico);
};

//Funcion que permite obtener las fechas de los datos para poder mostrarlas en el grafico del eje X (horizontal)
const obtenerFechas = (datos) => {
  const fechasValorMoneda = datos.map((moneda) => {
    return new Date(moneda.fecha).toLocaleDateString();
  });
  return fechasValorMoneda;
};

//Permite obtener los valores para poder mostrarlas en el grafico en el eje Y (vertical)
const obtenerValores = (datos) => {
  const valores = datos.map((moneda) => moneda.valor);
  return valores;
};

//Funcion que me permite mostrar el grafico en pantalla
const renderGrafico = (datos, valor) => {
  const tipoGrafica = "line";
  const titulo = "Indicador de Valores";
  const colorLinea = "red";

  const config = {
    type: tipoGrafica,
    data: {
      labels: datos,
      datasets: [
        {
          label: titulo,
          backgroudcolor: colorLinea,
          data: valor,
        },
      ],
    },
  };

  return config;
};

htmlBtnCambio.addEventListener("click", async (event) => {
  const pesosChileno = htmlPesosChileno.value;
  const monedaDeCambio = htmlSelectMoneda.value;

  if (!pesosChileno.trim()) {
    alert("Ingresar la cantidad a convertir");
    return;
  }
  if (!monedaDeCambio) {
    alert("Selecciona el tipo de cambio");
    return;
  }

  const valorDelTipoCambio = await calcularCambioEnMoneda(
    pesosChileno,
    monedaDeCambio
  );
  htmlValorCambio.innerHTML = `$${valorDelTipoCambio}`;

  destruirGraficoAnterior();
  mostrarGrafico(monedaDeCambio);
});
