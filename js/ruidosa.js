const pymChild = new pym.Child({});

function IS_MOBILE() {
    return d3.select("#mobile").style("display") === "block";
}

const windowWidth = IS_MOBILE() ? d3.select("#mobile").node().getBoundingClientRect().width : 0;

const state = {
    artista: "Todos los artistas",
    anios: "Todos los años",
    artista2: "Todos los artistas",
    anios2: "Todos los años",
    hovered3: 'Argentina',
    anios3: "2024"
}

let language = 'spanish';

Promise.all([
    d3.csv('datos/arriba del escenario.csv'),
    d3.csv('datos/disparidad geografica.csv'),
    d3.csv('datos/brecha paises.csv'),
    d3.csv('datos/detras del escenario.csv'),
    d3.csv('datos/toma de decisiones.csv')
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
    const stringCols2 = ["tipo banda", "tipo show", "artistas"]
    const numberCols2 = data2.columns.filter(col => !stringCols2.includes(col));
    data2.forEach(datum => {
        numberCols2.forEach(col => {
            datum[col] = +datum[col];
        })
    });

    const data3 = ruidosa[2];
    const stringCols3 = ["tipo banda", "pais"]
    const numberCols3 = data3.columns.filter(col => !stringCols3.includes(col));
    data3.forEach(datum => {
        numberCols3.forEach(col => {
            datum[col] = +datum[col];
        })
    });

    const data4 = ruidosa[3];
    data4.forEach(d => {
        d.Valor = +d.Valor;
    });

    const data5 = ruidosa[4];
    data5.forEach(d => {
        d.Mujer = +d.Mujer;
    });

    const artistas1 = Array.from(new Set(data1.map(d => d['artistas'])));
    const artistas2 = Array.from(new Set(data2.map(d => d['artistas'])));

    const nRows = 10;
    const circleSize = IS_MOBILE() ? windowWidth / 12 :  46;

    const width = 800;
    const height = circleSize * 11;
    const margin = {
        top: 10, bottom: 10, left: 10, right: 10
    };

    const svg = d3.select("#arriba-del-escenario")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", `0 0 ${width} ${height}`);

    const plotOrder = ["Bandas de mujeres", "Solista mujer", "Bandas mixtas",
        "Bandas de hombres", "Solista hombre", "Solista no binarie"
    ];

    const filterData1 = (data) => {
        return data.filter(d => d.artistas === state.artista);
    }

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

        d3.select("#arriba-del-escenario-legend")
            .selectAll('.legend')
            .data(plotOrder)
            .join("div")
                .attr("class", "legend")
                .style("background-image", 
                    d =>`url("images/viz1/${d} - background${IS_MOBILE() ? ' mobile' : ''}.png")`
                )
                .html(d => {
                    const datum = filteredData.find(dat => dat["tipo banda"] === d);
                    return `${datum[state.anios]}% ${language === 'spanish' ? d : vizLabels[d]}`
                })
    }

    const updateDropdownHtml = (id, label) => {
        d3.select(id).select(".dropbtn").html(label);
    }

    const addDropdown = (id, options, label, updatePlot, svg, data) => {
        const labels = language === 'spanish' ? options : options.map(d => vizLabels[d] || d);
        let opts = addOptions(`content-${id}`, options, labels);
        d3.select(`#dropdown-${id}`)
            .on("click", function(d){
                document.getElementById(`content-${id}`).classList.toggle("show");
            });
        updateDropdownHtml(`#dropdown-${id}`, 
            language === 'spanish' 
            ? state[label] 
            : (vizLabels[state[label]] || state[label])
        );
        opts.selectAll("a").on("click", function(event, d){
            if (d !== state[label]) {
                state[label] = d;
                updateDropdownHtml(`#dropdown-${id}`, 
                    language === 'spanish' 
                    ? state[label] 
                    : (vizLabels[state[label]] || state[label])
                );
                updatePlot(data, state, svg, label);
            }
        })
    }

    /* VIZ 1 */
    updatePlot1(data1, state, svg);
    addDropdown("artist", artistas1, "artista", updatePlot1, svg, data1);
    addDropdown("anio", numberCols1, "anios", updatePlot1, svg, data1);

    /* VIZ 2 */

    const width2 = IS_MOBILE() ? windowWidth : 800;
    const height2 = 390;
    const margin2 = {
        top: 10, bottom: 10, left: IS_MOBILE() ? 0 : 330, right: IS_MOBILE() ? 20 : 10
    };
    const padding2 = IS_MOBILE() ? 0.4 : 0.08;

    const svg2 = d3.select("#disparidad-geografica")
        .append("svg")
        .attr("width", width2)
        .attr("height", height2)
        .attr("viewBox", `0 0 ${width2} ${height2}`);

    const updatePlot2 = (data, state, svg, label) => {
        const colOrder = ["Norte Global", "Latinoamericanos", "Otro"];

        const filteredData = data.filter(d => d.artistas === state.artista2);

        const series = d3.stack()
            .keys(d3.union(filteredData.map(d => d["tipo show"]))) // distinct series keys, in input order
            .value(([, D], key) => D.get(key)[state.anios2]) // get value for each series key and stack
                (d3.index(filteredData, d => d["tipo banda"], d => d["tipo show"]));

        const x = d3.scaleLinear()
            .domain([0, d3.max(series, d => d3.max(d, d => d[1]))])
            .range([margin2.left, width2 - margin2.right]);

        const y =  d3.scaleBand()
            .domain(plotOrder)
            .range([margin2.top, height2 - margin2.bottom])
            .padding(padding2);

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
                .attr("x", IS_MOBILE() ? 0 : 10)
                .attr("y", d => IS_MOBILE() ? y(d) - 4: y(d) + y.bandwidth()/2 + 12)
                .text(d => language === 'spanish' ? d : vizLabels[d])

        g.selectAll("rect")
            .data(D => D.map(d => (d.key = D.key, d)))
            .join("rect")
                .attr("x", d => x(d[0]))
                .attr("y", d => y(d.data[0]))
                .attr("height", y.bandwidth())
                .attr("width", d => x(d[1]) - x(d[0]))
                .attr("fill", d => color(d.key))

        g.selectAll(".text-label")
            .data(D => D.map(d => (d.key = D.key, d)))
            .join("text")
                .attr("class", "text-label")
                .style("text-anchor", "end")
                .attr("x", d => x(d[1]) - 10)
                .attr("y", d => y(d.data[0]) + y.bandwidth()/2 + 12)
                .text(d => d[1] - d[0] > 10 ? `${d[1] - d[0]}%` : "")


    }

    updatePlot2(data2, state, svg2, "anios2")
    addDropdown("artist2", artistas2, "artista2", updatePlot2, svg2, data2);
    addDropdown("anio2", numberCols2, "anios2", updatePlot2, svg2, data2);

    /* VIZ 3 */

    const width3 = IS_MOBILE() ? windowWidth : 500;
    const height3 = 500;
    const margin3 = {
        top: 10, bottom: 10, left: 10, right: 10
    };

    const svg3 = d3.select("#brecha-paises")
        .append("svg")
        .attr("width", width3)
        .attr("height", height3)
        .attr("viewBox", `0 0 ${width3} ${height3}`);


    const updatePlot3 = (data, state, svg, label) => {
        const plotOrder = Array.from(new Set(data.map(d => d.pais)));
        const bands = ["Solista mujer", "Bandas de mujeres", "Bandas mixtas",
            "Bandas de hombres", "Solista hombre", "Solista no binarie"];

        const bandColors = {
            "Bandas de mujeres": ["#C883E5", "#9568F4"],
            "Solista mujer": ["#C883E5", "#C883E5"],
            "Bandas mixtas": ["#EA9F67", "#9568F4"],
            "Bandas de hombres": ["#F9D94E", "#EA9F67"],
            "Solista hombre": ["#F9D94E", "#F9D94E"],
            "Solista no binarie": ["#E2F44F", "#E2F44F"]
        }

        const updateLabels = (g) => {
            d3.select("#brecha-paises-legend")
                .selectAll('.legend')
                .data(bands)
                .join("div")
                    .attr("class", "legend")
                    .style("background-image", 
                        d => `url("images/viz1/${d} - background${IS_MOBILE() ? ' mobile' : ''}.png")`
                    )
                    .html(d => {
                        const datum = data3.find(
                            dat => (dat["tipo banda"] === d && dat.pais === state.hovered3)
                        );
                        return `${datum[state.anios3]}% ${language === 'spanish' ? d : vizLabels[d]}`
                    })

            g.selectAll(".country-label")
                .data(plotOrder)
                .join("text")
                    .attr("class", d => 
                        `country-label ${state.hovered3 === d ? 'hovered-country' : ''}`
                    )
                    .attr("x", x(0))
                    .attr("y", d => y(d) - 8)
                    .text(d => d)
        }

        const series = d3.stack()
            .keys(d3.union(data.map(d => d["tipo banda"]))) // distinct series keys, in input order
            .value(([, D], key) => D.get(key)[state[label]]) // get value for each series key and stack
                (d3.index(data, d => d["pais"], d => d["tipo banda"]));

        const x = d3.scaleLinear()
            .domain([0, d3.max(series, d => d3.max(d, d => d[1]))])
            .range([margin3.left, width3 - margin3.right]);

        const y =  d3.scaleBand()
            .domain(plotOrder)
            .range([margin3.top, height3 - margin3.bottom])
            .padding(0.4);

        const defs = svg.selectAll("defs")
            .data([bands])
            .join("defs");

        const patterns = defs.selectAll("pattern")
            .data(d => d)
            .join("pattern")
                .attr("id", d => d.replaceAll(" ", "").toLowerCase())
                .attr("width", "5")
                .attr("height", "5")
                .attr("patternUnits", "userSpaceOnUse");

        patterns.selectAll("rect")
            .data(d => [d])
            .join("rect")
                .attr("width", "100%")
                .attr("height", "100%")
                .attr("stroke", "none")
                .attr("fill", d => bandColors[d][0])

        patterns.selectAll("path")
            .data(d => [d])
            .join("path")
                .attr("fill", "none")
                .attr("stroke", d => bandColors[d][1])
                .attr("stroke-width", "3")
                .attr("d", "M0 2.5h5z")
            
        const g = svg.selectAll("g")
            .data(series)
            .join("g")

        // g.selectAll('.text-legend')
        //     .data(plotOrder)
        //     .join("text")
        //         .attr("class", "text-legend")
        //         .attr("x", 10)
        //         .attr("y", d => y(d) + y.bandwidth()/2 + 12)
        //         .text(d => d)

        

        g.selectAll(".big-rect")
            .data(D => D.map(d => (d.key = D.key, d)))
            .join("rect")   
                .attr("class", "big-rect")
                .attr("x", d => x(d[0]))
                .attr("y", d => y(d.data[0]))
                .attr("height", y.bandwidth())
                .attr("width", d => x(d[1]) - x(d[0]))
                .attr("fill", d => `url(#${d.key.replaceAll(" ", "").toLowerCase()})`)
                .attr("stroke", "none")
                .on("mousemove", (evt, d) => {
                    state.hovered3 = d.data[0];
                    updateLabels(g);
                })

        g.selectAll(".small-rect")
            .data(plotOrder.flatMap(key => {
                return d3.range(0, 100).map(num => {
                    return {
                        key: key,
                        value: num
                    }
                })
            })) 
            .join("rect")   
                .attr("class", "small-rect")
                .attr("x", d => x(d.value))
                .attr("y", d => y(d.key))
                .attr("height", y.bandwidth())
                .attr("width", d => x(d.value + 1) - x(d.value))
                .attr("fill", "none")
                .attr("stroke", "black")
                .attr("stroke-width", "0.1px")
                

        updateLabels(g);
        // g.selectAll(".text-label")
        //     .data(D => D.map(d => (d.key = D.key, d)))
        //     .join("text")
        //         .attr("class", "text-label")
        //         .style("text-anchor", "end")
        //         .attr("x", d => x(d[1]) - 10)
        //         .attr("y", d => y(d.data[0]) + y.bandwidth()/2 + 12)
        //         .text(d => d[1] - d[0] > 2 ? `${d[1] - d[0]}%` : "")


    }

    updatePlot3(data3, state, svg3, "anios3")
    addDropdown("anio3", numberCols3, "anios3", updatePlot3, svg3, data3);


    /* VIZ 4 */

    const width4 = IS_MOBILE() ? windowWidth : 800;
    const height4 = IS_MOBILE() ? 500 : 390;
    const margin4 = {
        top: 50, bottom: 10, left: IS_MOBILE() ? 0 : 330, right: 10
    };
    const padding4 = IS_MOBILE() ? 0.4 : 0.08;

    const svg4 = d3.select("#detras-del-escenario")
        .append("svg")
        .attr("width", width4)
        .attr("height", height4)
        .attr("viewBox", `0 0 ${width4} ${height4}`);

    const updatePlot4 = (data, svg) => {
        const colOrder = ["Mujer", "Hombre"];
        const plotOrder = data.filter(d => d.Sexo === 'Mujer')
            .sort((a,b) => b.Valor - a.Valor)
            .map(d => d.Categoria)

        const series = d3.stack()
            .keys(d3.union(data.map(d => d["Sexo"]))) // distinct series keys, in input order
                .value(([, D], key) => D.get(key).Valor) // get value for each series key and stack
                (d3.index(data, d => d["Categoria"], d => d["Sexo"]));

        const x = d3.scaleLinear()
            .domain([0, d3.max(series, d => d3.max(d, d => d[1]))])
            .range([margin4.left, width4 - margin4.right]);

        const y =  d3.scaleBand()
            .domain(plotOrder)
            .range([margin4.top, height4 - margin4.bottom])
            .padding(padding4);

        const color = d3.scaleOrdinal()
            .domain(colOrder)
            .range(["#C883E5", "#F9D94E"])
            .unknown("#ccc");


        const g = svg.selectAll("g")
            .data(series)
            .join("g")

        g.selectAll('.text-legend')
            .data(plotOrder)
            .join("text")
                .attr("class", "text-legend")
                .attr("x", IS_MOBILE() ? 0 : 10)
                .attr("y", d => IS_MOBILE() ? y(d) - 4 : y(d) + y.bandwidth()/2 + 12)
                .text(d => language === 'spanish' ? d : (vizLabels[d] || d))

        g.selectAll("rect")
            .data(D => D.map(d => (d.key = D.key, d)))
            .join("rect")
                .attr("x", d => x(d[0]))
                .attr("y", d => y(d.data[0]))
                .attr("height", y.bandwidth())
                .attr("width", d => x(d[1]) - x(d[0]))
                .attr("fill", d => color(d.key))

        g.selectAll(".text-label")
            .data(D => D.map(d => (d.key = D.key, d)))
            .join("text")
                .attr("class", "text-label")
                .style("text-anchor", d => d[1] - d[0] > 15 ? "end" : "begin")
                .attr("x", d => d[1] - d[0] > 15 ? x(d[1]) - 10 : x(d[0]))
                .attr("y", d => y(d.data[0]) + y.bandwidth()/2 + 12)
                .text(d => d[1] - d[0] > 2 ? `${d[1] - d[0]}%` : "")

        d3.select("#detras-del-escenario-legend")
            .selectAll(".sex-label")
            .data(series.map(D => 
                D.filter(d => d.data[0] === plotOrder[0])
                    .map(d => (d.key = D.key, d))
            ))
            .join("div")
                .attr("class", d => `sex-label ${d[0].key}`)
                // .style("text-anchor", "end")
                .style("left", d => `${x(d[0][1]) - 80}px`)
                .style("top", d => "12px")
                .html(d => d[0].key === 'Mujer'
                    ? (language === 'spanish' ? 'mujeres' : 'female') 
                    : (language === 'spanish' ? 'hombres' : 'male'))
    }

    updatePlot4(data4, svg4);

    /* VIZ 5 */

    const width5 = IS_MOBILE() ? windowWidth : 800;
    const height5 = IS_MOBILE() ? 500 : 390;
    const margin5 = {
        top: IS_MOBILE() ? 0 : 50, bottom: 10, left: IS_MOBILE() ? 0: 440, right: IS_MOBILE() ? 100 : 60
    };
    const padding5 =  IS_MOBILE() ? 0.5 : 0.4;

    const svg5 = d3.select("#toma-de-decisiones")
        .append("svg")
        .attr("width", width5)
        .attr("height", height5)
        .attr("viewBox", `0 0 ${width5} ${height5}`);

    const updatePlot5 = (data, svg) => {

        const sortedData = data.sort((a,b) => b.Mujer - a.Mujer);
        const cargos = sortedData.map(d => d['Cargos sistematizado']);
        const maxValue = d3.max(sortedData, d => d.Mujer);

        const x = d3.scaleLinear()
            .domain([0, maxValue])
            .range([margin5.left, width4 - margin5.right]);

        const y =  d3.scaleBand()
            .domain(cargos)
            .range([margin5.top, height4 - margin5.bottom])
            .padding(padding5);

        const g = svg.selectAll("g")
            .data(sortedData)
            .join("g")

        g.selectAll('.toma-legend')
            .data(cargos)
            .join("text")
                .attr("class", "toma-legend")
                .style("text-anchor", IS_MOBILE() ? "begin" : "end")
                .attr("x", IS_MOBILE() ? x(0) : x(0) - 10)
                .attr("y", d => IS_MOBILE() ? y(d) - 4 : y(d) + y.bandwidth()/2 + 12)
                .text(d => language === 'spanish' ? d : (vizLabels[d] || d))

        d3.select("#toma-de-decisiones")
            .selectAll(".toma-rect")
            .data(sortedData)
            .join("div")
                .attr("class", "toma-rect")
                .style("left", `${x(0)}px`)
                .style("top", d => `${y(d['Cargos sistematizado'])}px`)
                .style("height", `${y.bandwidth()}px`)
                .style("width", d => `${x(d.Mujer) - x(0)}px`)
                .style("background-color", "#C883E5")

        d3.select("#toma-de-decisiones")
            .selectAll(".toma-label")
            .data(sortedData)
            .join("div")
                .attr("class", "toma-label")
                .style("left", d => `${x(d.Mujer) + 14}px`)
                .style("top", d => `${y(d['Cargos sistematizado']) - y.bandwidth()/2 + 12}px`)
                .html(d => `${d.Mujer}%`)
    }

    updatePlot5(data5, svg5);

    const updateText = (language) => {
        const keys = Object.keys(text[language]);
        keys.forEach(key => {
            d3.select(`.${key}`)
                .html(text[language][key])
        });
        d3.select(".section2")
            .style("width", `${language === 'spanish' ? 808 : 472}px`);
    }

    const updateViz = () => {
        updatePlot1(data1, state, svg);
        addDropdown("artist", artistas1, "artista", updatePlot1, svg, data1);
        addDropdown("anio", numberCols1, "anios", updatePlot1, svg, data1);
        updatePlot2(data2, state, svg2, "anios2");
        addDropdown("artist2", artistas2, "artista2", updatePlot2, svg2, data2);
        addDropdown("anio2", numberCols2, "anios2", updatePlot2, svg2, data2);
        updatePlot3(data3, state, svg3, "anios3");
        addDropdown("anio3", numberCols3, "anios3", updatePlot3, svg3, data3);
        updatePlot4(data4, svg4);
        updatePlot5(data5, svg5);
    }
    
    const updateLanguageButtons = () => {
        d3.select(".translation").selectAll("span")
        .data(['english', 'spanish'])
        .join('span')
        .attr("class", d => d === language ? 'selected' : '')
        .html(d => d === 'spanish' ? 'Versión en español' : 'English version')
        .on('click', (_, d) => {
            language = d;
            updateText(language);
            updateLanguageButtons();
            updateViz();
        });
    }
    
    updateLanguageButtons();
    updateText(language);

    const addBackgroundImage = (imageObj) => {
        d3.select(".wrapper")
            .append("img")
            .attr("class", "background-image")
            .attr("src", `images/background/${imageObj.imageName}.png`)
            .style("top", `${imageObj.reference}px`)
            .style(imageObj.position, "0");
    }
    
    const addBackgroundImages = () => {
        const backgroundImages = [
            {
                'imageName': 'keyboard',
                'reference': 2001,
                'position': 'right'
            },
            {
                'imageName': 'drums',
                'reference': 2335,
                'position': 'left'
            },
            {
                'imageName': 'mouth',
                'reference': 4044,
                'position': 'left'
            },
            {
                'imageName': 'megafono',
                'reference': 4830,
                'position': 'right'
            },
            {
                'imageName': 'speakers',
                'reference': 5124,
                'position': 'left'
            },
            {
                'imageName': 'stick',
                'reference': 5761,
                'position': 'right'
            },
            {
                'imageName': 'scream',
                'reference': 6761,
                'position': 'left'
            },
            {
                'imageName': 'vinyl',
                'reference': 6965,
                'position': 'right'
            },
            {
                'imageName': 'fists',
                'reference': 7606,
                'position': 'left'
            },
            {
                'imageName': 'eye-draw',
                'reference': 8703,
                'position': 'left'
            },
            {
                'imageName': 'mouth-draw',
                'reference': 8852,
                'position': 'right'
            }
        ]
    
        backgroundImages.forEach(d => {
            addBackgroundImage(d);
        })        
    }
    
    if (!IS_MOBILE()) {
        addBackgroundImages();
    }

    updateHeight();
})

function updateHeight() {
    const h = d3.select(".wrapper").node().getBoundingClientRect().height;
  
    d3.select("body").style("height", h + "px");
  
    pymChild.sendHeight();
}

window.addEventListener("resize", (event) => {
    updateHeight();
})

window.onclick = function (event) {
    if (!event.target.matches("#dropbtn-artist")) {
      var dropdown = document.getElementById("content-artist");
      if (dropdown.classList.contains("show")) {
        dropdown.classList.remove("show");
      }
    }
    if (!event.target.matches("#dropbtn-anio")) {
        var dropdown = document.getElementById("content-anio");
        if (dropdown.classList.contains("show")) {
            dropdown.classList.remove("show");
        }
    }
    if (!event.target.matches("#dropbtn-artist2")) {
        var dropdown = document.getElementById("content-artist2");
        if (dropdown.classList.contains("show")) {
          dropdown.classList.remove("show");
        }
    }
    if (!event.target.matches("#dropbtn-anio2")) {
        var dropdown = document.getElementById("content-anio2");
        if (dropdown.classList.contains("show")) {
            dropdown.classList.remove("show");
        }
    }
    if (!event.target.matches("#dropbtn-anio3")) {
        var dropdown = document.getElementById("content-anio3");
        if (dropdown.classList.contains("show")) {
            dropdown.classList.remove("show");
        }
    }
    
  };
