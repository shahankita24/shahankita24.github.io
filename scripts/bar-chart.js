// charts/bar-chart.js

function createScene3(data) {
    console.log("In createScene3", "scene3.js");

    // Function to clean up and split names, filter out 'Unknown' values
    function cleanAndSplit(column) {
        return data.flatMap(d => {
            if (d[column] && d[column] !== 'Unknown') {
                return d[column]
                    .replace(/[\[\]']+/g, '')  // Remove [ ] ' characters
                    .split(',').map(s => s.trim())  // Split by comma and trim spaces
                    .filter(s => s !== '');  // Remove empty strings
            }
            return [];
        });
    }

    // Function to extract top 10 items
    function extractTop10(cleanedData) {
        return Array.from(d3.rollup(cleanedData, v => v.length, d => d))
            .sort((a, b) => d3.descending(a[1], b[1]))
            .slice(0, 10)
            .map(([key, value]) => ({ key, value }));
    }

    // Clean and extract data
    const cleanedGenres = cleanAndSplit('categories');
    const cleanedAuthors = cleanAndSplit('authors');

    const genreCount = extractTop10(cleanedGenres);
    const authorCount = extractTop10(cleanedAuthors);

    // Define margins and dimensions
    const margin = { top: 120, right: 50, bottom: 60, left: 160 },
        width = document.getElementById('chart3').clientWidth - margin.left - margin.right,
        height = window.innerHeight * 0.8 - margin.top - margin.bottom;

    // Set up scales
    const x = d3.scaleLinear().range([0, width]);
    const y = d3.scaleBand().range([height, 0]).padding(0.1);

    // Color scale for bars
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    // Append SVG element
    const svg = d3.select("#chart3").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Append tooltip div
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // Append dropdown directly into SVG
    const dropdown = d3.select("#chart3")
        .append("select")
        .attr("class", "svg-dropdown")
        .style("position", "absolute")
        .style("top", `${margin.top}px`)
        .style("left", `${width + (margin.left / 2) }px`)
        .on("change", updateChart);

    dropdown.append("option").attr("value", "genre").text("Genre");
    dropdown.append("option").attr("value", "author").text("Author");

    let selectedCategory;
    let sortOrder;

    // Function to update chart with data
    function updateChart() {
        selectedCategory = dropdown.property("value");
        sortOrder = d3.selectAll('input[name="sort"]:checked').property("value");

        data = selectedCategory === 'genre' ? genreCount : authorCount;
        sortOrder === 'asc' ? data.sort((a, b) => d3.ascending(a.value, b.value)) : data.sort((a, b) => d3.descending(a.value, b.value));
        console.log("In updateChart->Dropdown: ", selectedCategory);
        console.log("In updateChart->RadioBtn: ", sortOrder);
        console.log("In updateChart->Data: ", data);

        x.domain([0, d3.max(data, d => d.value)]);
        y.domain(data.map(d => d.key));

        svg.selectAll(".bar").remove();
        svg.selectAll(".x.axis").remove();
        svg.selectAll(".y.axis").remove();
        svg.selectAll(".annotation").remove();

        // Append X axis
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x).ticks(5))
            .selectAll("text")
            .style("font-size", "13px");

        svg.select(".x.axis").append("text")
            .attr("y", 30)
            .attr("x", width)
            .attr("dy", "1em")
            .style("text-anchor", "end")
            .style("fill", "#fff")
            .style("font-size", "15px")
            .style("font-weight", "bold")
            // .text(selectedCategory === 'genre' ? "Number of Books Published by Genre" : "Number of Books Published by Author")
            .text("Number of Books");

        // Append Y axis
        svg.append("g")
            .attr("class", "y axis")
            .call(d3.axisLeft(y))
            .selectAll("text")
            .attr("transform", "rotate(-30)") // Rotate labels
            .style("text-anchor", "end")
            .style("font-size", "13px");

        svg.select(".y.axis").append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", -70)
            .attr("x", -0)
            .attr("dy", "1em")
            .style("text-anchor", "end")
            .style("fill", "#fff")
            .style("font-size", "15px")
            .style("font-weight", "bold")
            .text(selectedCategory === 'genre' ? "Genre" : "Author");

        // Append bars with different colors
        svg.selectAll(".bar")
            .data(data)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", 0)
            .attr("y", d => y(d.key))
            .attr("width", d => x(d.value))
            .attr("height", y.bandwidth())
            .style("fill", (d, i) => colorScale(i))  // Use color scale for different colors
            .on("mouseover", function (event, d) {
                d3.select(this).style("fill", "#b8860b");
                tooltip.transition().duration(200).style("opacity", 0.9);
                var selectedKey = dropdown.property('value');
                selectedKey = selectedKey.charAt(0).toUpperCase() + selectedKey.slice(1);
                tooltip.html(
                    `<strong>${selectedKey}:</strong> ${d.key}<br>` +
                    `<strong># of Books:</strong> ${d.value}`
                    )
                    .style("left", (event.pageX + 5) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", () => {
                d3.selectAll(".bar").style("fill", (d, i) => colorScale(i)); // Restore original color
                tooltip.transition().duration(500).style("opacity", 0);
            });

        // Add trend annotations
        let trendAnnotations;
        if (selectedCategory === 'genre') {
            var topGenre = sortOrder === 'asc' ? genreCount.slice(-1)[0] : genreCount[0];
            trendAnnotations = [
                {
                    note: {
                        // title: `Trending ${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}`,
                        label: `Notice the surge in popularity of ${topGenre.key} genre!`,
                        wrap: 500,
                    },
                    x: x(topGenre.value) - 30,
                    y: y(topGenre.key),
                    dy: -80,
                    dx: -180,
                    connector: {
                        end: "arrow",
                        type: d3.annotationCalloutElbow,
                        strokeDasharray: "5,5" // Dashed line
                    }
                }
            ];
        } else {
            var topAuthor = sortOrder === 'asc' ? authorCount.slice(-1)[0] : authorCount[0];
            trendAnnotations = [
                {
                    note: {
                        // title: `Spotlight on ${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}`,
                        // label: `🌟 The Undisputed Champion is ${topAuthor.key} with an impressive count of ${topAuthor.value}.`,
                        label: `${topAuthor.key} is the most prolific author loved by many readers.`,
                        wrap: 700,
                    },
                    x: x(topAuthor.value) - 20,
                    y: y(topAuthor.key),
                    dy: -80,
                    dx: -250,
                    connector: {
                        end: "arrow",
                        type: d3.annotationCalloutElbow,
                        strokeDasharray: "5,5" // Dashed line
                    }
                }
            ];
        }

        const makeAnnotations = d3.annotation()
            .type(d3.annotationLabel)
            .annotations(trendAnnotations);

        svg.append("g")
            .attr("class", "annotation-group")
            .call(makeAnnotations);
    }

    // Initial update for genres
    updateChart();

    // Sorting on radio buttons click
    d3.selectAll('input[name="sort"]').on('change', function () {
        console.log("In RadioBtn: ", "OnChange Func");
        updateChart();
    });

}
