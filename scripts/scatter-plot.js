// charts/scatter-plot.js

function createScene2(data) {
    console.log("In createScene2", "scatter-plot.js");
    // Define margins and dimensions
    const margin = { top: 150, right: 10, bottom: 60, left: 90 },
        width = document.getElementById('chart2').clientWidth - margin.left - margin.right,
        height = window.innerHeight * 0.8 - margin.top - margin.bottom;


    // Set up scales
    const x = d3.scaleTime().range([0, width]);
    const y = d3.scaleLinear().range([height, 0]);
    const color = d3.scaleOrdinal().range(["#ff6347", "#d21e51", "#1ed287", "#8a2be2"]);

    // Define axes
    const xAxis = d3.axisBottom(x).ticks(9).tickFormat(d3.timeFormat("%Y"));
    // const yAxis = d3.axisLeft(y).ticks(9).tickFormat(d => d % 1000 === 0 ? d / 1000 + 'k' : d / 1000 + 'k');
    const yAxis = d3.axisLeft(y);

    // Append SVG element
    const svg = d3.select("#chart2").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Append tooltip div
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // Parse and prepare data
    data.forEach(d => {
        d.publishedDate = +d.publishedDate.split('-')[0];
        d.pageCount = +d.pageCount;
        d.averageRating = +d.averageRating;
        d.categories = d.categories || "Unknown"
        d.language = d.language || "Unknown";
        d.authors = d.authors || "Unknown";
        d.title = d.title || "Unknown";
    });

    // Create a map to access original data
    const dataMap = new Map();
    data.forEach(d => {
        const key = `${d.publishedDate}-${d.language}`;
        dataMap.set(key, d);
    });
    // console.log("Process Data -> dataMap: ", dataMap);

    // Nested data
    var nestedData = d3.groups(data, d => d.language)
        .map(([key, values]) => ({
            language: getLanguageName(key) || key,
            values: Array.from(d3.rollup(values, v => v.length, d => d.publishedDate))
        }));
    // console.log("Process Data -> nestedData: ", nestedData);

    color.domain(nestedData.map(d => d.language));

    x.domain([new Date(1800, 0, 1), new Date(d3.max(data, d => d.publishedDate), 0, 1)]);
    y.domain([0, d3.max(nestedData, d => d3.max(d.values, v => v[1]))]);

    // Append X axis
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", `translate(0,${height})`)
        .call(xAxis)
        .selectAll("text")
        .style("font-size", "13px");

    svg.select(".x.axis").append("text")
        .attr("y", 30)
        .attr("x", width / 2)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .style("fill", "#fff")
        .style("font-size", "15px")
        .style("font-weight", "bold")
        .text("Year");

    // Append Y axis
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .selectAll("text")
        .style("font-size", "13px");

    svg.select(".y.axis").append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -60)
        .attr("x", -height / 2)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .style("fill", "#fff")
        .style("font-size", "15px")
        .style("font-weight", "bold")
        .text("Number of Books");

    const minYear = 1800;
    const maxYear = d3.max(data, d => d.publishedDate);


    /* // Append circles
    svg.selectAll(".language-group")
        .data(nestedData)
        .enter().append("g")
        .attr("class", "language-group")
        .selectAll("circle")
        .data(d => d.values.map(v => ({
            language: d.language,
            year: v[0],
            count: v[1],
            key: `${v[0]}-${getLanguageCode(d.language)}`
        })))
        .enter().append("circle")
        .attr("r", 8)
        .attr("cx", d => x(new Date(d.year, 0, 1)))
        .attr("cy", d => y(d.count))
        .style("fill", d => color(d.language))
        .style("opacity", 0.8)
        .on("mouseover", function (event, d) {
            var datum = dataMap.get(d.key)
            // console.log("In mouseover: ", d);
            console.log("In mouseover->Datum: ", datum);
            if (datum) {
                tooltip.transition().duration(200).style("opacity", 0.9);
                tooltip.html(
                    `Title: ${datum.title}<br>` +
                    `Author(s): ${datum.authors}<br>` +
                    `Genre: ${datum.categories}<br>` +
                    `Language: ${getLanguageName(datum.language)}<br>` +
                    `Average Rating: ${datum.averageRating}<br>` +
                    `Publication Year: ${d.year}<br>` +
                    `# of Pages: ${datum.pageCount}<br>` +
                    `# of Books: ${d.count}`
                )
                    .style("left", (event.pageX + 5) + "px")
                    .style("top", (event.pageY - 28) + "px");
            }
        })
        .on("mouseout", () => {
            tooltip.transition().duration(500).style("opacity", 0);
        });  */

    // Append legend
    const legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(0, -50)`);

    const legendItems = legend.selectAll(".legend-item")
        .data(nestedData.map(d => d.language))
        .enter().append("g")
        .attr("class", "legend-item")
        .attr("transform", (d, i) => `translate(${i * 100}, 0)`);

    legendItems.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 20)
        .attr("height", 20)
        .style("fill", d => color(d));

    legendItems.append("text")
        .attr("x", 30)
        .attr("y", 15)
        .text(d => d)
        .style("fill", "#fff")
        .style("font-size", "14px")
        .style("font-weight", "bold");

    legendItems.on("mouseover", (event, d) => {
        svg.selectAll("circle")
            .style("opacity", data => data.language === d ? 1 : 0.3);
    })
        .on("mouseout", () => {
            svg.selectAll("circle")
                .style("opacity", 0.8);
        });

    function getLanguageName(code) {
        const names = {
            en: "English",
            ar: "Arabic",
            de: "German",
            sv: "Swedish",
            "Unknown": "Unknown"
        };
        return names[code] || "Unknown";
    }

    function getLanguageCode(name) {
        const codes = {
            English: "en",
            Arabic: "ar",
            German: "de",
            Swedish: "sv",
            "Unknown": "Unknown"
        };
        return codes[name] || "Unknown";
    }

    // Function to update scatterplot based on year range
    function updateScatterPlot(startYear, endYear) {
        console.log("In updateScatterPlot: ", startYear + "," + endYear);
        const filteredData = nestedData.map(group => ({
            language: group.language,
            values: group.values.filter(d => d[0] >= startYear && d[0] <= endYear)
        }));

        // y.domain([0, d3.max(filteredData, d => d3.max(d.values, v => v[1]))]);

        // svg.select(".y.axis")
        //     .transition()
        //     .duration(750)
        //     .call(yAxis);

        const circles = svg.selectAll("circle")
            .data(filteredData.flatMap(d => d.values.map(v => ({
                language: d.language,
                year: v[0],
                count: v[1],
                key: `${v[0]}-${getLanguageCode(d.language)}`
            }))));

        circles.enter().append("circle")
            .attr("r", 8)
            .merge(circles)
            .on("mouseover", function (event, d) {
                var datum = dataMap.get(d.key)
                // console.log("In mouseover: ", d);
                console.log("In mouseover->Datum: ", datum);
                if (datum) {
                    tooltip.transition().duration(200).style("opacity", 0.9);
                    tooltip.html(
                        `<strong>Title:</strong> ${datum.title}<br>` +
                        `<strong>Author(s):</strong> ${datum.authors}<br>` +
                        `<strong>Genre(s):</strong> ${datum.categories}<br>` +
                        `<strong>Language:</strong> ${getLanguageName(datum.language)}<br>` +
                        `<strong>Publication Year:</strong> ${d.year}<br>` +
                        `<strong>Average Rating:</strong> ${datum.averageRating}<br>` +
                        `<strong># of Pages:</strong> ${datum.pageCount}<br>` +
                        `<strong># of Books:</strong> ${d.count}`
                    )
                        .style("left", (event.pageX + 5) + "px")
                        .style("top", (event.pageY - 28) + "px");
                }
            })
            .on("mouseout", () => {
                tooltip.transition().duration(500).style("opacity", 0);
            })
            .transition()
            .duration(750)
            .attr("cx", d => x(new Date(d.year, 0, 1)))
            .attr("cy", d => y(d.count))
            .style("fill", d => color(d.language))
            .style("opacity", 0.8);

        circles.exit().remove();

        showHideAnnotation(startYear == 1800 && endYear >= 2019 ? true : false);
    }

    // // Custom slider code for year
    // const sliderMargin = { top: 20, right: 50, bottom: 20, left: 50 };
    // const sliderWidth = width;
    // const sliderHeight = 50;

    // const sliderX = d3.scaleLinear()
    //     .domain([minYear, maxYear])
    //     .range([0, sliderWidth])
    //     .clamp(true);

    // const sliderSvg = d3.select("#chart2").append("svg")
    //     .attr("width", width + margin.left + margin.right)
    //     .attr("height", sliderHeight + sliderMargin.top + sliderMargin.bottom)
    //     .append("g")
    //     .attr("transform", `translate(${margin.left},${margin.top - sliderHeight - sliderMargin.top})`);

    // sliderSvg.append("line")
    //     .attr("class", "track")
    //     .attr("x1", sliderX.range()[0])
    //     .attr("x2", sliderX.range()[1]);

    // sliderSvg.append("line")
    //     .attr("class", "track-inset")
    //     .attr("x1", sliderX.range()[0])
    //     .attr("x2", sliderX.range()[1]);

    // sliderSvg.append("line")
    //     .attr("class", "track-overlay")
    //     .attr("x1", sliderX.range()[0])
    //     .attr("x2", sliderX.range()[1])
    //     .call(d3.drag()
    //         .on("start.interrupt", function () { sliderSvg.interrupt(); })
    //         .on("start drag", function (event) {
    //             const year = Math.round(sliderX.invert(event.x));
    //             handle.attr("cx", sliderX(year));
    //             handleText.text("Selected Year: " + minYear + "-" + year);
    //             updateScatterPlot(minYear, year);
    //         }));

    // sliderSvg.append("g")
    //     .attr("class", "ticks")
    //     .attr("transform", `translate(0,${sliderHeight - 20})`)
    //     .selectAll("text")
    //     .data(sliderX.ticks(10))
    //     .enter().append("text")
    //     .attr("x", sliderX)
    //     .attr("text-anchor", "middle")
    //     .text(d => d)
    //     .style("fill", "#fff");

    // const handle = sliderSvg.append("circle")
    //     .attr("class", "handle")
    //     .attr("r", 9)
    //     .attr("cx", sliderX(maxYear))
    //     .attr("cy", sliderHeight / 2 - 25);

    // const handleText = sliderSvg.append("text")
    //     .attr("class", "slider-text")
    //     .attr("text-anchor", "middle")
    //     .attr("x", sliderMargin.right)
    //     .attr("y", sliderHeight - sliderMargin.right - sliderMargin.top)
    //     .text("Selected Year: " + minYear + "-" + maxYear)
    //     .style("fill", "#fff");
    // // updateScatterPlot(minYear, maxYear);

    // // const resetText = sliderSvg.append("text")
    // //     .attr("class", "reset-text")
    // //     .attr("text-anchor", "middle")
    // //     .attr("x", sliderWidth - sliderMargin.top)
    // //     .attr("y", sliderHeight - sliderMargin.right - sliderMargin.top)
    // //     .text("Reset")
    // //     .style("fill", "#1e90ff")
    // //     .on("click", () => {
    // //         handle.attr("cx", sliderX(maxYear));
    // //         handleText.text("Selected Year: " + minYear + "-" + maxYear);
    // //         updateScatterPlot(minYear, maxYear);
    // //     })


    const slider = d3.sliderBottom()
        .min(1800)
        .max(2019) // Ensure 2000 is included in the range
        .step(20)
        .width(width - 10) // Adjust width as needed
        .tickValues(d3.range(1800, 2020, 20)) // Include 2000 in the tick values
        .default([1800, 2019])
        .tickFormat(d => d.toString().replace(',', ''));


    svg.append("g")
        .attr("transform", `translate(-0, -130)`)
        .call(slider);

    slider.on('onchange', val => {
        updateScatterPlot(val[0], val[1])
    })



    /* Code for custom annotation */
    // // Add annotation for most published books in English language
    // const englishData = nestedData.find(d => d.language === "English").values;
    // const maxEnglishYear = d3.max(englishData, d => d[1]);
    // const maxEnglishData = englishData.find(d => d[1] === maxEnglishYear);
    // console.log("Annote Data: ", maxEnglishData);

    // if (maxEnglishData) {
    //     const annotationGroup = svg.append("g")
    //         .attr("class", "annotation-group");

    //     annotationGroup.append("line")
    //         .attr("class", "annotation-line")
    //         .attr("x1", x(new Date(maxEnglishData[0], 0, 1)))
    //         .attr("y1", y(maxEnglishData[1]))
    //         .attr("x2", x(new Date(maxEnglishData[0], 0, 1)) - 250)
    //         .attr("y2", y(maxEnglishData[1]) + 40);

    //     annotationGroup.append("text")
    //         .attr("x", x(new Date(maxEnglishData[0], 0, 1)) - 400)
    //         .attr("y", y(maxEnglishData[1]) + 60)
    //         .attr("class", "annotation-text")
    //         .text("Most published books are in English language");
    // }

    /* Code for annotation using external library*/
    // Define annotation
    const annotations = [
        {
            note: {
                title: "Most published books are in English language",
                label: "",
                wrap: 300
            },
            type: d3.annotationCalloutCircle,
            x: width - 80,
            y: height - 120,
            dy: -200,
            dx: -50,
            subject: {
                radius: 40,         // circle radius
                radiusPadding: 0   // white space around circle befor connector
            },
            connector: {
                end: "arrow",
                type: d3.annotationCalloutElbow,
                strokeDasharray: "5,5" // Dashed line
            }
        }
    ];

    // Append annotations
    const makeAnnotations = d3.annotation()
        .annotations(annotations);

    const annotate = svg.append("g")
        .attr("class", "annotation-group")
        .call(makeAnnotations);

    function showHideAnnotation(value) {
        annotate.style("opacity", value ? 1 : 0);
    }

    updateScatterPlot(minYear, maxYear);

}
