$(document).ready(function () {
    main()
});

async function main() {
    // Get data via. API
    resp = await axios.get("https://absence-api.vercel.app/")
    createTableBody(resp.data.data);

    // Initialize data table (must come after data has been inserted into table)
    $('#absenceTable').DataTable({order: [[2, "desc"]]});
    $('.dataTables_length').addClass('bs-select');

    beautifyTable();
}

// Create the table body using HandlebarJs template
function createTableBody(data) {
    // Retrieve the template data from the HTML (jQuery is used here).
    var template = $('#absenceTableBody').html();
    // Compile the template data into a function
    var templateScript = Handlebars.compile(template);

    var context = {data: parseData(data)}

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
            "name": teacher.name,
            "position": teacher.position,
            "total": all + partial,
            "all": all,
            "partial": partial
        }
        formattedData.push(obj)
    })

    return formattedData;
}

function beautifyTable() {
    $("#absenceTable_filter label input").addClass("form-control form-control-sm")
}