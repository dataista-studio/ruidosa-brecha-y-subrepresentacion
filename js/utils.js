function addOptions(id, values, attrs) {
    var element = d3.select("#"+id);
    element.selectAll("a")
        .data(values)
        .join("a")
        .attr("value", d => d)
        .html((d, i) => attrs[i]);

    return element;
  }