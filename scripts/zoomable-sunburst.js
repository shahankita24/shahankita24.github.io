// charts/zoomable-sunburst.js

function createScene6(data) {
   
    function createHierarchicalData(data) {
        const languageMap = {
            'en': 'English',
            'ar': 'Arabic',
            'de': 'German',
            'sv': 'Swedish'
        };

        // const cleanedData = data.filter(book => {
        //     return (
        //       book.language &&
        //       book.categories &&
        //       book.authors &&
        //       book.publishedDate
        //     ); // Add more conditions as needed
        //   });

        const processedData = data.map(d => ({
            title: d.title,
            authors: d.authors.replace('[', '').replace(']', '').replace(/'/g, '').split(',').map(a => a.trim()),
            language: languageMap[d.language] || d.language, // Convert language code to name
            categories: d.categories.replace('[', '').replace(']', '').replace(/'/g, '').split(',').map(c => c.trim()),
            averageRating: d.averageRating,
            maturityRating: d.maturityRating,
            publisher: d.publisher || 'NA',
            publishedDate: d.publishedDate,
            pageCount: d.pageCount
        }));

        const groupedData = d3.rollup(
            processedData,
            v => v.length,
            d => d.language,
            d => d.categories[0], // Assuming one category per book
            d => d.authors[0],
            d => d.publisher,
            d => d.publishedDate
        );

        const root = {
            name: "All Books",
            children: []
        };

        // function buildHierarchy(currentNode, data) {
        //     for (const [key, value] of data) {
        //         const child = {
        //             name: key,
        //             children: [],
        //             parent: currentNode
        //         };
        //         currentNode.children.push(child);
        //         if (value instanceof Map) {
        //             buildHierarchy(child, value);
        //         } else {
        //             child.value = value;
        //         }
        //     }
        // }

        function buildHierarchy(currentNode, data) {
            for (const [key, value] of data) {
              if (key === null || key === undefined || value === null || value === undefined) {
                continue; // Skip null or empty values
              }
        
              const child = {
                name: key,
                children: [],
                parent: currentNode
              };
              currentNode.children.push(child);
              if (value instanceof Map) {
                buildHierarchy(child, value);
              } else {
                child.value = value;
              }
            }
          }

        buildHierarchy(root, groupedData);

        return root;
    }

    const hierarchicalData = createHierarchicalData(data);
    console.log(hierarchicalData);

    const width = 900;
    const height = 700;
    const radius = width / 8;

    // Create the color scale.
    const color = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, hierarchicalData.children.length + 1));

    // Compute the layout.
    const hierarchy = d3.hierarchy(hierarchicalData)
        .sum(d => d.value)
        .sort((a, b) => b.value - a.value);
    const root = d3.partition()
        .size([2 * Math.PI, hierarchy.height + 1])
        (hierarchy);
    root.each(d => d.current = d);

    // Create the arc generator.
    const arc = d3.arc()
        .startAngle(d => d.x0)
        .endAngle(d => d.x1)
        .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))
        .padRadius(radius * 1.5)
        .innerRadius(d => d.y0 * radius)
        .outerRadius(d => Math.max(d.y0 * radius, d.y1 * radius - 1));

    const svg = d3.select("#chart6").append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width / 2}, ${height / 2})`)
        // .attr("viewBox", [-width / 2, -height / 2, width, width])
        .style("font", "10px sans-serif")
        .style("fill", "white");

    // Append the arcs.
    const path = svg.append("g")
        .selectAll("path")
        .data(root.descendants().slice(1))
        .join("path")
        .attr("fill", d => { while (d.depth > 1) d = d.parent; return color(d.data.name); })
        .attr("fill-opacity", d => arcVisible(d.current) ? (d.children ? 0.6 : 0.4) : 0)
        .attr("pointer-events", d => arcVisible(d.current) ? "auto" : "none")
        .attr("d", d => arc(d.current));

    // Make them clickable if they have children.
    path.filter(d => d.children)
        .style("cursor", "pointer")
        .on("click", clicked);

    const format = d3.format(",d");
    // path.append("title")
    //     .text(d => `Path: ${d.ancestors().map(d => d.data.name).reverse().join("/")}\n# of Books: ${format(d.value)}`);

    // Append tooltip div
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);
    
    path.on("mouseover", function (event, d) {
        tooltip.transition().duration(200).style("opacity", 0.9);
        tooltip.html(
            `<strong>Path:</strong> ${d.ancestors().map(d => d.data.name).reverse().join("/")}<br>` + 
            `<strong># of Books:</strong> ${format(d.value)}`
        )
            .style("left", (event.pageX - 100) + "px")
            .style("top", (event.pageY - 50) + "px");
    })
    .on("mouseout", function () {
        tooltip.transition().duration(500).style("opacity", 0);
    });

    const label = svg.append("g")
        .attr("pointer-events", "none")
        .attr("text-anchor", "middle")
        .style("user-select", "none")
        .selectAll("text")
        .data(root.descendants().slice(1))
        .join("text")
        .attr("dy", "0.35em")
        .attr("fill-opacity", d => +labelVisible(d.current))
        .attr("transform", d => labelTransform(d.current))
        .text(d => d.data.name);

    const parent = svg.append("circle")
        .datum(root)
        .attr("r", radius)
        .attr("fill", "none")
        .attr("pointer-events", "all")
        .on("click", clicked);

    // Handle zoom on click.
    function clicked(event, p) {
        parent.datum(p.parent || root);

        root.each(d => d.target = {
            x0: Math.max(0, Math.min(1, (d.x0 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
            x1: Math.max(0, Math.min(1, (d.x1 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
            y0: Math.max(0, d.y0 - p.depth),
            y1: Math.max(0, d.y1 - p.depth)
        });

        const t = svg.transition().duration(750);

        // Transition the data on all arcs, even the ones that aren’t visible,
        // so that if this transition is interrupted, entering arcs will start
        // the next transition from the desired position.
        path.transition(t)
            .tween("data", d => {
                const i = d3.interpolate(d.current, d.target);
                return t => d.current = i(t);
            })
            .filter(function (d) {
                return +this.getAttribute("fill-opacity") || arcVisible(d.target);
            })
            .attr("fill-opacity", d => arcVisible(d.target) ? (d.children ? 0.6 : 0.4) : 0)
            .attr("pointer-events", d => arcVisible(d.target) ? "auto" : "none")

            .attrTween("d", d => () => arc(d.current));

        label.filter(function (d) {
            return +this.getAttribute("fill-opacity") || labelVisible(d.target);
        }).transition(t)
            .attr("fill-opacity", d => +labelVisible(d.target))
            .attrTween("transform", d => () => labelTransform(d.current));
    }

    function arcVisible(d) {
        return d.y1 <= 3 && d.y0 >= 1 && d.x1 > d.x0;
    }

    function labelVisible(d) {
        return d.y1 <= 3 && d.y0 >= 1 && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.03;
    }

    function labelTransform(d) {
        const x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
        const y = (d.y0 + d.y1) / 2 * radius;
        return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
    }

   
    const annotations = [
        {
            note: {
                // title: "Explore the Sunburst!",
                label: "Click segments to zoom in and uncover details.",
                wrap: 350
            },
            x: 0,
            y: -radius - 10,
            dy: -50,
            dx: -100,
            connector: {
                end: "arrow",
                type: d3.annotationCalloutElbow,
                strokeDasharray: "5,5" // Dashed line
            }
        },
        {
            note: {
                // title: "Reset View",
                label: "Click center to zoom out and view the whole chart.",
                wrap: 350
            },
            x: 0,
            y: radius - 20,
            dy: 50,
            dx: -100,
            connector: {
                end: "arrow",
                type: d3.annotationCalloutElbow,
                strokeDasharray: "5,5" // Dashed line
            }
        }
    ];

    const makeAnnotations = d3.annotation()
        .annotations(annotations);

    svg.append("g")
        .attr("class", "annotation-group")
        .call(makeAnnotations);
      
}
