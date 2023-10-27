// Mendefinisikan dimensi SVG, jarak antara peta dan elemen judul/subjudul, dan dimensi legenda
const SVG_DIM = { W: 960, H: 690 };
const PADDING = { TOP: 90 }; // Jarak antara peta dan elemen judul/subjudul
const LEGEND_DIM = { W: 24, H: 220, LEFT: 900, TOP: 400 };

(async () => {
  try {
    // Mengambil data pendidikan dan topologi wilayah dari sumber eksternal
    const education = await d3.json(
      "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json"
    );
    const topology = await d3.json(
      "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json"
    );

    // Membuat elemen div dengan ID "wrapper" sebagai kontainer utama
    const wrapper = d3.select("body").append("div").attr("id", "wrapper");

    // Membuat elemen SVG di dalam "wrapper" untuk menggambar peta dan elemen judul/subjudul
    const svg = wrapper
      .append("svg")
      .attr("width", SVG_DIM.W)
      .attr("height", SVG_DIM.H);

    // Membuat judul peta di tengah dengan font besar dan tebal
    svg
      .append("text")
      .text("United States Educational Attainment")
      .attr("x", SVG_DIM.W / 2)
      .attr("y", 60) // Koordinat vertikal
      .attr("text-anchor", "middle")
      .attr("font-size", "36px")
      .attr("font-weight", "500")
      .attr("id", "title"); // ID untuk manipulasi lebih lanjut

    // Membuat subjudul dengan deskripsi di bawah judul
    svg
      .append("text")
      .text(
        "Percentage of adults age 25 and older with a bachelor's degree or higher (2010-2014)"
      )
      .attr("x", SVG_DIM.W / 2)
      .attr("y", 90) // Koordinat vertikal
      .attr("text-anchor", "middle")
      .attr("font-size", "18px")
      .attr("id", "description") // ID untuk manipulasi lebih lanjut
      .style("fill", "gray") // Warna teks abu-abu
      .attr("font-weight", "300"); // Ketebalan teks

    // Membuat elemen tooltip untuk menampilkan informasi tambahan
    const tooltip = wrapper
      .append("div")
      .attr("id", "tooltip")
      .style("position", "absolute")
      .style("background-color", "black")
      .style("padding", "8px")
      .style("opacity", 0);

    // Membuat legenda dengan rentang warna berdasarkan data pendidikan
    const extent = d3.extent(education.map((a) => a.bachelorsOrHigher));
    const color = d3
      .scaleThreshold()
      .domain(d3.range(...extent, (extent[1] - extent[0]) / 8))
      .range(d3.schemeBlues[9]);

    // Membuat skala untuk legenda dan mengatur labelnya
    const legendScale = d3
      .scaleLinear()
      .domain(extent.reverse())
      .range([0, LEGEND_DIM.H]);

    const legend = svg.append("g").attr("id", "legend"); // Membuat elemen legenda

    const legendAxis = d3
      .axisRight(legendScale)
      .tickFormat((d) => Math.round(d) + "%")
      .tickValues(color.domain())
      .tickSizeOuter(0);

    legend
      .append("g")
      .attr("transform", `translate(${LEGEND_DIM.LEFT}, ${LEGEND_DIM.TOP})`)
      .call(legendAxis);

    // Menambahkan warna ke dalam legenda sebagai kotak
    legend
      .selectAll("rect")
      .data(d3.range(...extent, (extent[1] - extent[0]) / 8))
      .enter()
      .append("rect")
      .attr("class", "legend-rect")
      .attr("width", LEGEND_DIM.W)
      .attr("height", LEGEND_DIM.H / 8)
      .attr("fill", (d) => color(d - 0.1))
      .attr("y", (d) => legendScale(d) + LEGEND_DIM.TOP)
      .attr("x", LEGEND_DIM.LEFT - LEGEND_DIM.W);

    // Menggambar data peta menggunakan informasi wilayah dan pendidikan
    const topo = topojson.feature(topology, topology.objects.counties);

    const counties = svg
      .append("g")
      .attr("class", "counties")
      .attr("transform", `translate(0, ${PADDING.TOP})`); // Pindahkan peta ke bawah sesuai jarak

    counties
      .selectAll("path")
      .data(topo.features)
      .enter()
      .append("path")
      .attr("class", "county")
      .attr("data-fips", (d) => d.id)
      .attr("data-education", (d) => {
        let state = education.find((a) => a.fips === d.id);
        return state ? state.bachelorsOrHigher : "";
      })
      .attr("d", d3.geoPath())
      .attr("fill", (d) => {
        let state = education.find((a) => a.fips === d.id);
        return state ? color(state.bachelorsOrHigher) : "";
      })
      .on("mouseover", (e, d) => {
        let state = education.find((a) => a.fips === d.id);
        tooltip
          .attr("data-education", () => (state ? state.bachelorsOrHigher : ""))
          .html(`${state.area_name}, ${state.state}: ${state.bachelorsOrHigher}%`)
          .style("top", `${e.pageY - 32}px`)
          .style("left", `${e.pageX}px`)
          .style("opacity", 0.7);
      })
      .on("mouseout", () => {
        tooltip.style("opacity", 0).html("");
      });

    // Menambahkan sumber data
    wrapper
      .append("p")
      .html(
        'Source: <a href="https://www.ers.usda.gov/data-products/county-level-data-sets/download-data.aspx" target="_blank">USDA Economic Research Service</a>'
      );
  } catch (error) {
    console.error("An error occurred:", error);
  }
})();