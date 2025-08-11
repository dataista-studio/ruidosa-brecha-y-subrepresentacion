const state = {
    artista: "Todos los artistas",
    anios: "Todos los años"
}

Promise.all([
    d3.csv('datos/arriba del escenario.csv'),
    d3.csv('datos/disparidad geografica.csv')
]).then(function (ruidosa) {
    const data1 = ruidosa[0];
    const stringCols1 = ["tipo banda", "artistas"]
    const numberCols1 = data1.columns.filter(col => !stringCols1.includes(col));
    data1.forEach(datum => {
        numberCols1.forEach(col => {
            datum[col] = +datum[col];
        })
    });

    const artistas1 = Array.from(new Set(data1.map(d => d['artistas'])));

    const width = 800;
    const height = 500;
    const margin = {
        top: 10, bottom: 10, left: 10, right: 10
    };

    const svg = d3.select("#arriba-del-escenario")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", `0 0 ${width} ${height}`);

    const legend = d3.select("#arriba-del-escenario-legend");

    const plotOrder = ["Bandas de mujeres", "Solista mujer", "Bandas mixtas",
        "Bandas de hombres", "Solista hombre", "Solista no binarie"
    ];

    const filterData = (data) => {
        return data.filter(d => d.artistas === state.artista);
    }

    const nRows = 10;
    const circleSize = 46;

    const getDataToPlot = (filteredData, state) => {
        
        const outputData = [];
        let idx = 0;

        plotOrder.forEach(category => {
            const nData = filteredData.find(d => d["tipo banda"] === category)[state.anios];
            d3.range(0, nData).forEach(i => {
                const obj = {};
                obj.x = circleSize/2 + Math.floor(idx % nRows) * circleSize;
                obj.y = circleSize/2 + Math.floor(idx / nRows) * circleSize;
                obj.img = `${category}.svg`;
                outputData.push(obj);
                idx++;
            })
        });

        return outputData;
    }

    const updatePlot1 = (data, state, svg) => {

        const filteredData = filterData(data);
        const dataToPlot = getDataToPlot(filteredData, state);

        const groups = svg.selectAll(".circle-group")
            .data(dataToPlot)
            .join("g")
                .attr("class", "circle-group");

        groups.selectAll("image")
            .data(d => [d])
            .join("svg:image")
                .attr("x", d => d.x)
                .attr("y", d => d.y)
                .attr("width", circleSize)
                .attr("height", circleSize)
                .attr("xlink:href", d => `images/viz1/${d.img}`);

        const legends = legend.selectAll('.legend')
            .data(plotOrder)
            .join("div")
                .attr("class", "legend")
                .style("background-image", d => `url("../images/viz1/${d} - background.png")`)
                .html(d => {
                    const datum = filteredData.find(dat => dat["tipo banda"] === d);
                    return `${datum[state.anios]}% ${d}`
                })
    }

    const updateDropdownHtml = (id, label) => {
        d3.select(id).select(".dropbtn").html(label);
    }

    const addDropdown = (id, options, label, updatePlot) => {
        let opts = addOptions(`content-${id}`, options, options);
        d3.select(`#dropdown-${id}`)
            .on("click", function(d){
                document.getElementById(`content-${id}`).classList.toggle("show");
            });
        updateDropdownHtml(`#dropdown-${id}`, state[label]);
        opts.selectAll("a").on("click", function(event, d){
            if (d !== state.artista) {
                state[label] = d;
                updateDropdownHtml(`#dropdown-${id}`, state[label]);
                updatePlot(data1, state, svg);
            }
        })
    }

    /* VIZ 1 */
    updatePlot1(data1, state, svg);
    addDropdown("artist", artistas1, "artista", updatePlot1);
    addDropdown("anio", numberCols1, "anios", updatePlot1);

    /* VIZ 2 */

})