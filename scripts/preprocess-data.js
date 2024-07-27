
async function preprocessData() {
    try {
        const response = await fetch('data/google_books_dataset.csv');
        const rawData = await response.text();
        const data = d3.csvParse(rawData);

        const processedData = data.map(d => ({
            title: d.title,
            authors: d.authors,
            language: d.language,
            categories: d.categories,
            averageRating: +d.averageRating,
            maturityRating: d.maturityRating,
            publisher: d.publisher,
            publishedDate: d.publishedDate,
            pageCount: +d.pageCount,
            voters: +d.voters,
            ISBN: d.ISBN,
            description: d.description,
            price: +d.price,
            currency: d.currency
        }));

        return processedData;
    } catch (error) {
        console.error('Error loading or parsing data:', error);
        throw error;
    }
}

preprocessData().then(data => {
    // console.log("In preprocessData:", data); // Check if data is loaded and processed correctly
    // // Call your scene functions here, passing the `data` as needed
    // createScatterPlot(data);
    // createBarChart(data);
    // // createScatterPlot(data);
    // // createWordCloud(data);
    // // createSunburst(data);


    createScene2(data);
    createScene3(data);
    createScene4(data);
    createScene5(data);
    createScene6(data);
    
});
