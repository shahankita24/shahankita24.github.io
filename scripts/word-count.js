// charts/word-count.js

// function createScene5(data) {
//     console.log("In createScene5", "word-count.js");

//     // Function to clean and process data
//     function cleanData() {
//         return data
//             .filter(d => d.categories && !d.categories.includes("Unknown")) // Filter out entries with "Unknown" category
//             .flatMap(d => d.categories
//                 .replace(/[\[\]']+/g, '')  // Remove [ ] ' characters
//                 .split(',').map(s => s.trim())  // Split by comma and trim spaces
//                 .filter(s => s !== '')  // Remove empty strings
//                 .map(category => ({
//                     name: category,
//                     value: 1 // Each book contributes 1 to the count
//                 }))
//             );
//     }

//     // Clean and process the data
//     const processedData = cleanData();

//     // Aggregate data by category
//     const categoryCount = d3.rollup(processedData, v => d3.sum(v, d => d.value), d => d.name);

//     // Convert to hierarchical data format
//     const root = d3.hierarchy({
//         name: "root",
//         children: Array.from(categoryCount, ([name, value]) => ({ name, value }))
//     })
//         .sum(d => d.value)
//         .sort((a, b) => b.value - a.value);

//     // Define dimensions and margins
//     const margin = { top: 20, right: 60, bottom: 20, left: 0 },
//         width = document.getElementById('chart5').clientWidth - margin.left - margin.right,
//         height = window.innerHeight * 0.8 - margin.top - margin.bottom;

//     // Set up SVG
//     const svg = d3.select("#chart5").append("svg")
//         .attr("width", width + margin.left + margin.right)
//         .attr("height", height + margin.top + margin.bottom)
//         .append("g")
//         .attr("transform", `translate(${margin.left},${margin.top})`);

//     // Set up color scale
//     const color = d3.scaleOrdinal(d3.schemeCategory10);

//     // Set up the treemap layout
//     const treemap = d3.treemap()
//         .size([width, height])
//         .padding(1);

//     // Generate the treemap layout
//     treemap(root);

//     // Create rectangles for the tree map
//     svg.selectAll(".node")
//         .data(root.leaves())
//         .enter().append("rect")
//         .attr("class", "node")
//         .attr("x", d => d.x0)
//         .attr("y", d => d.y0)
//         .attr("width", d => d.x1 - d.x0)
//         .attr("height", d => d.y1 - d.y0)
//         .style("fill", d => color(d.data.name))
//         .style("stroke", "#fff")
//         .on("mouseover", function (event, d) {
//             d3.select(this).style("stroke", "#000").style("stroke-width", "2px");
//             tooltip.transition().duration(200).style("opacity", 0.9);
//             tooltip.html(
//                 `<strong>Category:</strong> ${d.data.name}<br>` +
//                 `<strong>Count:</strong> ${d.data.value}`
//             )
//                 .style("left", (event.pageX + 5) + "px")
//                 .style("top", (event.pageY - 28) + "px");
//         })
//         .on("mouseout", function () {
//             d3.select(this).style("stroke", "#fff").style("stroke-width", "1px");
//             tooltip.transition().duration(500).style("opacity", 0);
//         });

//     // Add labels
//     svg.selectAll(".label")
//         .data(root.leaves())
//         .enter().append("text")
//         .attr("class", "label")
//         .attr("x", d => d.x0 + 5)
//         .attr("y", d => d.y0 + 20)
//         .text(d => d.data.name)
//         .style("fill", "#fff")
//         .style("font-size", "10px");

//     // Append tooltip div
//     const tooltip = d3.select("body").append("div")
//         .attr("class", "tooltip")
//         .style("opacity", 0);

//     // Add annotations
//     const annotations = [
//         {
//             note: {
//                 title: "Book Categories Distribution",
//                 label: "The tree map shows the distribution of books across various categories. Larger rectangles represent categories with more books, while smaller rectangles represent less common categories. Observe how the dataset is distributed among different categories and identify any major trends.",
//                 wrap: 200
//             },
//             x: width / 2,
//             y: height / 2,
//             dy: -60,
//             dx: -100,
//             connector: {
//                 end: "arrow",
//                 type: d3.annotationCalloutElbow,
//                 strokeDasharray: "5,5"
//             }
//         }
//     ];

//     const makeAnnotations = d3.annotation()
//         .type(d3.annotationLabel)
//         .annotations(annotations);

//     svg.append("g")
//         .attr("class", "annotation-group")
//         .call(makeAnnotations);
// }



function createScene5(data) {
    console.log("In createScene5", "word-count.js");

    // Function to clean and process data
    function cleanData() {
        return data
            .filter(d => d.title)  // Ensure there's a title
            .flatMap(d => d.title
                .split(' ').map(word => word.trim())
                .filter(word => word !== '')  // Remove empty strings
                .map(word => ({
                    name: word,
                    value: 1 // Each word contributes 1 to the count
                }))
            );
    }

    // Clean and process the data
    const processedData = cleanData();

    // Aggregate data by word
    const wordCount = d3.rollup(processedData, v => d3.sum(v, d => d.value), d => d.name);

    // Convert to hierarchical data format
    const root = d3.hierarchy({
        name: "root",
        children: Array.from(wordCount, ([name, value]) => ({ name, value }))
    })
        .sum(d => d.value)
        .sort((a, b) => b.value - a.value);

    // Define dimensions and margins
    const margin = { top: 50, right: 60, bottom: 50, left: 0 },
        width = document.getElementById('chart5').clientWidth - margin.left - margin.right,
        height = window.innerHeight * 0.8 - margin.top - margin.bottom;

    // Set up SVG
    const svg = d3.select("#chart5").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Set up color scale using d3.schemeSet3
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    // Set up the treemap layout
    const treemap = d3.treemap()
        .size([width, height])
        .padding(1);

    // Generate the treemap layout
    treemap(root);

    // Create rectangles for the tree map
    svg.selectAll(".node")
        .data(root.leaves())
        .enter().append("rect")
        .attr("class", "node")
        .attr("x", d => d.x0)
        .attr("y", d => d.y0)
        .attr("width", d => d.x1 - d.x0)
        .attr("height", d => d.y1 - d.y0)
        .style("fill", d => color(d.data.name))  // Use categorical color scale
        .style("stroke", "#fff")
        .on("mouseover", function (event, d) {
            d3.select(this).style("stroke", "#000").style("stroke-width", "2px");
            tooltip.transition().duration(200).style("opacity", 0.9);
            tooltip.html(
                `<strong>Word:</strong> ${d.data.name}<br>` +
                `<strong>Frequency:</strong> ${d.data.value}`
            )
                .style("left", (event.pageX - 100) + "px")
                .style("top", (event.pageY - 50) + "px");
        })
        .on("mouseout", function () {
            d3.select(this).style("stroke", "#fff").style("stroke-width", "1px");
            tooltip.transition().duration(500).style("opacity", 0);
        });

    // // Add labels
    // svg.selectAll(".label")
    //     .data(root.leaves())
    //     .enter().append("text")
    //     .attr("class", "label")
    //     .attr("x", d => d.x0 + 5)
    //     .attr("y", d => d.y0 + 20)
    //     .text(d => d.data.name)
    //     .style("fill", "#fff")
    //     .style("font-size", "10px");

    // Append tooltip div
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // Add annotations
    const annotations = [
        {
            note: {
                // title: "Title Buzzwords",
                label: "Biggest blocks = top words in titles. Check out which words pop up the most in the book world!",
                wrap: 700
            },
            x: 130,
            y: 0,
            dy: -30,
            dx: 300,
            connector: {
                end: "arrow",
                type: d3.annotationCalloutElbow,
                strokeDasharray: "5,5"
            }
        }
    ];

    const makeAnnotations = d3.annotation()
        .type(d3.annotationLabel)
        .annotations(annotations);

    svg.append("g")
        .attr("class", "annotation-group")
        .call(makeAnnotations);
}
