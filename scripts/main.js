// main.js


// document.addEventListener('DOMContentLoaded', () => {
//     new fullpage('#fullpage', {
//         sectionsColor: ['#000', '#222', '#000', '#222', '#000'],
//         navigation: true,
//         navigationPosition: 'right',
//         navigationTooltips: ['Intro', 'Books Published Over Time', 'Bar Chart by Language/Genre/Publisher', 'Scatter Plot', 'Word Cloud', 'Sunburst'],
//         scrollOverflow: true,
//     });
// });


$(document).ready(function () {
    $('#pagewrapper').fullpage({
        sectionsColor: ['#000000', '#000000', '#000000', '#000000', '#000000', '#000000'],
        navigation: true,
        navigationPosition: 'right',
        navigationTooltips: ['Introduction', 'Books Published Over Time', 'Genre/Author Popularity', 'Book Popularity Bubble Chart', 'Word Cloud in Titles', 'Zoomable Sunburst Chart'],
        autoScrolling: true,
        scrollHorizontally: true,
        scrollOverflow: true,
        anchors: ['intro', 'scatter-plot', 'bar-chart', 'bubble-chart', 'word-count', 'sunburst'],
        easingcss3: 'cubic-bezier(0.175, 0.885, 0.320, 1.275)'
    });
});