const state = {
    artista: "Todos los artistas",
    anios: "Todos los años",
    anios2: "Todos los años"
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

    const data2 = ruidosa[1];
    const stringCols2 = ["tipo banda", "tipo show"]
    const numberCols2 = data2.columns.filter(col => !stringCols2.includes(col));
    data2.forEach(datum => {
        numberCols2.forEach(col => {
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

    const filterData1 = (data) => {
        return data.filter(d => d.artistas === state.artista);
    }

    const nRows = 10;
    const circleSize = 46;

    const getDataToPlot1 = (filteredData, state) => {
        
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

    const updatePlot1 = (data, state, svg, label) => {

        const filteredData = filterData1(data);
        const dataToPlot = getDataToPlot1(filteredData, state);

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

    const addDropdown = (id, options, label, updatePlot, svg, data) => {
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
                updatePlot(data, state, svg, label);
            }
        })
    }

    /* VIZ 1 */
    updatePlot1(data1, state, svg);
    addDropdown("artist", artistas1, "artista", updatePlot1, svg, data1);
    addDropdown("anio", numberCols1, "anios", updatePlot1, svg, data1);

    /* VIZ 2 */

    const width2 = 800;
    const height2 = 390;
    const margin2 = {
        top: 10, bottom: 10, left: 330, right: 10
    };

    const svg2 = d3.select("#disparidad-geografica")
        .append("svg")
        .attr("width", width2)
        .attr("height", height2)
        .attr("viewBox", `0 0 ${width2} ${height2}`);

    const updatePlot2 = (data, state, svg, label) => {
        console.log('here')
        const colOrder = ["Norte Global", "Latinoamericanos", "Otro"];

        const series = d3.stack()
            .keys(d3.union(data.map(d => d["tipo show"]))) // distinct series keys, in input order
                .value(([, D], key) => D.get(key)[state[label]]) // get value for each series key and stack
                (d3.index(data, d => d["tipo banda"], d => d["tipo show"]));

        console.log(d3.max(series, d => d3.max(d, d => d[1])))

        const x = d3.scaleLinear()
            .domain([0, d3.max(series, d => d3.max(d, d => d[1]))])
            .range([margin2.left, width2 - margin2.right]);

        const y =  d3.scaleBand()
            .domain(plotOrder)
            .range([margin2.top, height2 - margin2.bottom])
            .padding(0.08);

        const color = d3.scaleOrdinal()
            .domain(colOrder)
            .range(["#E2F44F", "#9568F4", "#FFF"])
            .unknown("#ccc");


        const g = svg.selectAll("g")
            .data(series)
            .join("g")

        g.selectAll('.text-legend')
            .data(plotOrder)
            .join("text")
                .attr("class", "text-legend")
                .attr("x", 10)
                .attr("y", d => y(d) + y.bandwidth()/2 + 12)
                .text(d => d)

        g.selectAll("rect")
            .data(D => D.map(d => (d.key = D.key, d)))
            .join("rect")
                .attr("x", d => x(d[0]))
                .attr("y", d => y(d.data[0]))
                .attr("height", y.bandwidth())
                .attr("width", d => x(d[1]) - x(d[0]))
                .attr("fill", d => color(d.key))


    }

    updatePlot2(data2, state, svg2, "anios2")
    addDropdown("anio2", numberCols2, "anios2", updatePlot2, svg2, data2);

})