// charts/bubble-chart.js

function createScene4(data) {
    console.log("In createScene4", "bubble-chart.js");

    // Filter out unknown maturity ratings and clean data
    data = data.filter(d => d.maturityRating && d.maturityRating !== 'UNKNOWN');
    data.forEach(d => {
        d.maturityRating = d.maturityRating === 'MATURE' ? 'Mature' : 'Not Mature';
        d.voters = (d.pageCount || 0) * 0.1;  // Simple heuristic for demonstration
    });

    // Define margins and dimensions
    const margin = { top: 60, right: 20, bottom: 60, left: 80 },
        width = document.getElementById('chart4').clientWidth - margin.left - margin.right,
        height = window.innerHeight * 0.8 - margin.top - margin.bottom;

    // Set up scales
    const x = d3.scaleLinear().range([0, width]);
    const y = d3.scaleLinear().range([height, 0]);
    const color = d3.scaleOrdinal().range(["#9b59b6", "#2ecc71"]); // Amethyst purple and Emerald green
    const size = d3.scaleSqrt().range([10, 30]); // Adjusted to 3 sizes

    // Function to format page count
    function formatPageCount(d) {
        if (d >= 1000) {
            return (d / 1000) + "k";
        }
        return d;
    }

    // Calculate max values for scales
    const maxPageCount = d3.max(data, d => d.pageCount);
    const maxVoters = d3.max(data, d => d.voters);
    const maxRating = 5; // Rating is capped at 5

    // Set domain for scales
    x.domain([0, maxPageCount + 500]); // Added buffer for better fit
    y.domain([0, maxRating + 0.5]); // Added buffer for better fit
    size.domain([0, maxVoters]);

    // Append SVG element
    const svg = d3.select("#chart4").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Append x-axis
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x)
            .tickValues(d3.range(0, maxPageCount + 500, 500))
            .tickFormat(formatPageCount))
        .selectAll("text")
        .style("font-size", "13px");

    svg.select(".x.axis")
        .append("text")
        .attr("x", width / 2)
        .attr("y", 50)
        .style("text-anchor", "middle")
        .style("fill", "#fff")
        .style("font-size", "15px")
        .style("font-weight", "bold")
        .text("Number of Pages");

    // Append y-axis
    svg.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(y)
            .ticks(11)
            .tickFormat(d => d))
        .selectAll("text")
        .style("font-size", "13px");

    svg.select(".y.axis")
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -60)
        .attr("x", -height / 2)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .style("fill", "#fff")
        .style("font-size", "15px")
        .style("font-weight", "bold")
        .text("Average Rating");

    // Tooltip setup
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // Append color legend
    const colorLegend = svg.append("g")
        .attr("class", "color-legend")
        .attr("transform", `translate(${width - 80}, 20)`); // Adjusted position

    const colorLegendData = ['Mature', 'Not Mature'];
    const colorLegendItems = colorLegend.selectAll(".color-legend-item")
        .data(colorLegendData)
        .enter().append("g")
        .attr("class", "color-legend-item")
        .attr("transform", (d, i) => `translate(0, ${i * 30})`);

    colorLegendItems.append("rect")
        .attr("width", 20)
        .attr("height", 20)
        .style("fill", d => color(d))
        .style("stroke", "none");

    colorLegendItems.append("text")
        .attr("x", 30)
        .attr("y", 15)
        .style("fill", "#fff")
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .text(d => d);

    colorLegendItems.on("mouseover", (event, item) => {
        svg.selectAll(".bubble")
            .style("opacity", d => d.maturityRating === item ? 1 : 0.3);
    })
        .on("mouseout", () => {
            svg.selectAll(".bubble")
                .style("opacity", 0.8);
        });

    // Append size legend
    const sizeLegend = svg.append("g")
        .attr("class", "size-legend")
        .attr("transform", `translate(${width - 80}, ${colorLegendData.length * 30 + 40})`);

    const sizeLegendData = [10, 20, 30]; // Adjusted to 3 sizes
    sizeLegend.selectAll(".size-legend-item")
        .data(sizeLegendData)
        .enter().append("g")
        .attr("class", "size-legend-item")
        .attr("transform", (d, i) => `translate(0, ${i * 30})`);

    sizeLegend.selectAll(".size-legend-item")
        .append("circle")
        .attr("r", d => size(d))
        .attr("cx", 10)
        .attr("cy", 15)
        .style("fill", "none")
        .style("stroke", "#fff")
        .style("stroke-width", 2);

    sizeLegend.selectAll(".size-legend-item")
        .append("text")
        .attr("x", 30)
        .attr("y", 20)
        .style("fill", "#fff")
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .text(d => d);

    // Add bubbles
    const bubbles = svg.selectAll(".bubble")
        .data(data)
        .enter().append("circle")
        .attr("class", "bubble")
        .attr("cx", d => x(d.pageCount))
        .attr("cy", d => y(d.averageRating))
        .attr("r", d => size(d.voters))
        .style("fill", d => color(d.maturityRating))
        .style("stroke", "none")
        .style("opacity", 0.8)
        .on("mouseover", function (event, d) {
            d3.select(this).style("stroke", "#000").style("stroke-width", "2");
            tooltip.transition().duration(200).style("opacity", .9);
            tooltip.html(`
                <strong>Title:</strong> ${d.title}<br>
                <strong>Author(s):</strong> ${d.authors}<br>
                <strong>Maturity Rating:</strong> ${d.maturityRating}<br>
                <strong>Publication Year:</strong> ${d.publishedDate}<br>
                <strong>Average Rating:</strong> ${d.averageRating}<br>
                <strong># of Pages:</strong> ${d.pageCount}
                
            `)
                .style("left", `${event.pageX + 5}px`)
                .style("top", `${event.pageY - 28}px`);
        })
        /*.on("mousemove", function (event) {
            tooltip.style("left", `${event.pageX + 5}px`)
                .style("top", `${event.pageY - 28}px`);
        }) */
        .on("mouseout", function () {
            d3.select(this).style("stroke", "none");
            tooltip.transition().duration(500).style("opacity", 0);
        });

    // Filter relevant data points
    const highPageCountHighRating = data.filter(d => d.pageCount > 1500 && d.averageRating > 4.5);
    const lowPageCountHighRating = data.filter(d => d.pageCount < 500 && d.averageRating > 4.5);

    // Append annotations
    const annotations = [
        {
            note: {
                // title: "Epic Page-Turners",
                label: "Highly-rated books with extensive content and immersive stories.",
                wrap: 400
            },
            type: d3.annotationCalloutCircle,
            x: x(highPageCountHighRating[0].pageCount),  // Example value, adjust as necessary
            y: y(highPageCountHighRating[0].averageRating),     // Example value, adjust as necessary
            dy: 200,
            dx: 50,
            subject: {
                radius: 40,
                radiusPadding: 0
            },
            connector: {
                end: "arrow",
                type: d3.annotationCalloutElbow,
                strokeDasharray: "5,5"
            }
        },
        {
            note: {
                // title: "Concise Classics",
                label: "Highly-rated books that deliver powerful stories in fewer pages.",
                wrap: 400
            },
            type: d3.annotationCalloutCircle,
            x: x(lowPageCountHighRating[0].pageCount),  // Example value, adjust as necessary
            y: y(lowPageCountHighRating[0].averageRating),  // Example value, adjust as necessary
            dy: 50,
            dx: 50,
            subject: {
                radius: 30,
                radiusPadding: 0
            },
            connector: {
                end: "arrow",
                type: d3.annotationCalloutElbow,
                strokeDasharray: "5,5"
            }
        }
    ];

    const makeAnnotations = d3.annotation()
        .annotations(annotations);

    svg.append("g")
        .attr("class", "annotation-group")
        .call(makeAnnotations);
}
