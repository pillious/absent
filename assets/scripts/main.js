var ctx;
var chart;

$(document).ready(function () {
    main()
});

async function main() {
    // Get data via. API
    resp = await axios.get("https://absence-api.vercel.app/")
    allData = parseData(resp.data.data)
    createTableBody(allData);

    // only faculty whos position includes 'teacher'
    teacherData = allData.filter(teacher => teacher.position.includes('TEACHER'))

    // Initialize data table (must come after data has been inserted into table)
    $('#absenceTable').DataTable({
        "scrollX": true,
        order: [
            [2, "desc"]
        ]
    });
    $('.dataTables_length').addClass('bs-select');

    // Initialize canvas
    ctx = document.getElementById('chart').getContext('2d');
    createChart(teacherData);

    beautifyTable();
}

// Create the table body using HandlebarJs template
function createTableBody(data) {
    // Retrieve the template data from the HTML (jQuery is used here).
    var template = $('#absenceTableBody').html();
    // Compile the template data into a function
    var templateScript = Handlebars.compile(template);

    var context = {
        "data": data
    }

    var html = templateScript(context);
    // Insert the HTML code into the page
    $("#absenceTable").append(html);
}

// format data to be compatible with absence table
function parseData(data) {
    formattedData = [];
    data.forEach(teacher => {
        // partial day or all day absence
        var partial = 0;
        var all = 0;

        // convert the teacher's absences to a number
        absencesArr = teacher.absence;
        for (let i = 0; i < absencesArr.length; i++) {
            absencesArr[i].isPartial ? partial++ : all++;
        }

        var obj = {
            "name": toTitleCase(teacher.name),
            "position": teacher.position,
            "total": all + partial,
            "all": all,
            "partial": partial
        }
        formattedData.push(obj)
    })

    return formattedData;
}

function toTitleCase(str) {
    return str.replace(
        /\w\S*/g,
        function (txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        }
    );
}

function beautifyTable() {
    $("#absenceTable_filter label input").addClass("form-control form-control-sm")
    $("#absenceTable_length label select").addClass("form-control form-control-sm")
}

function createChart(data) {
    // sort array by total absences (descending order)
    data = data.sort((a, b) => parseFloat(b.total) - parseFloat(a.total));
    // get the top 10
    data = data.slice(0, 10);
    console.log(data);

    var chartLabels = []
    var chartData = []
    var backgroundColors = ['#EEC4C6', '#E2C7D6', '#CACDE2', '#A9D5E8', '#83DDE2', '#64E2CE', '#60E5AF', '#7AE588', '#A2E05E', '#CFD635'];

    data.forEach(teacher => {
        chartLabels.push(teacher.name.split(' ')[0][0] + '. ' + teacher.name.split(' ').pop());
        chartData.push(teacher.total)
    });

    chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: chartLabels,
            datasets: [{
                label: 'Absences',
                backgroundColor: backgroundColors,
                borderColor: backgroundColors,
                data: chartData
            }]
        },
        options: {
            legend: {
                display: false
            },
            maintainAspectRatio: false,
            scales: {
                xAxes: [{
                    ticks: {
                        fontSize: setFontSize(),
                    }
                }],
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: 'Absences'
                    },
                    ticks: {
                        beginAtZero: true,
                    }
                }],
            }
        }
    });
}

function setFontSize() {
    var fontSize
    var width = $("body").width();

    if (width/55 < 15) {
        fontSize = width/55 > 11 ? width/55 : 11;
    }
    else {
        fontSize = 15
    }

    return fontSize;
}

$(window).resize(function() {
    // set size of xAxes labels
    let size = setFontSize();
    chart.options.scales.xAxes[0].ticks.minor.fontSize = size;
    chart.options.scales.xAxes[0].ticks.fontSize = size;
    chart.update();

    // force chart size to update (min-height  is specified in css)
    $('.chart-wrapper').height(1);
})