// Initialize Firebase
var config = {
    apiKey: "AIzaSyBm6pRi90hU-NU0aiDJzpYI1FRvtUDgoKs",
    authDomain: "test-682b3.firebaseapp.com",
    databaseURL: "https://test-682b3.firebaseio.com",
    projectId: "test-682b3",
    storageBucket: "test-682b3.appspot.com",
    messagingSenderId: "804469624379"
};
firebase.initializeApp(config);

var database = firebase.database();

//function to determine next train
function nextTrainCalc(trainStart, trainRate) {
    var momentVar = moment()
    var momentClone = momentVar.clone()
    var startMoment = moment(trainStart, "HH:mm")
    var timeSinceStart = moment().diff(startMoment, "minutes")
    if (timeSinceStart > 0) {
        var timeSinceLast = (timeSinceStart % trainRate)
        var timeUntilNext = (trainRate - timeSinceLast)
        var momentModified = momentClone.add(timeUntilNext, "minutes").format("HH:mm")
        var displayNextTrain = Math.abs(timeUntilNext) + " minutes"
        return displayNextTrain
    } else {
        var trainNotRunning = "See Start Time"
        return trainNotRunning
    }
}

$("#inputSubmit").on("click", function () {
    event.preventDefault()

    var nameInput = $("#nameInput").val().trim()
    var destinationInput = $("#destinationInput").val().trim()
    var startInput = $("#startInput").val().trim()
    var rateInput = $("#rateInput").val().trim()
    database.ref().push({
        name: nameInput,
        destination: destinationInput,
        start: startInput,
        rate: rateInput,
        dateAdded: firebase.database.ServerValue.TIMESTAMP
    })

})


database.ref().on("child_added", function (childSnapshot) {
    var cSValname = childSnapshot.val().name
    var cSValdestination = childSnapshot.val().destination
    var cSValstart = childSnapshot.val().start
    var cSValrate = childSnapshot.val().rate

    rowGenerator(cSValname, cSValdestination, cSValstart, cSValrate, nextTrainCalc(cSValstart, cSValrate))

})

function rowGenerator(name, destination, start, rate, nextTrain) {
    var newRow = $("<tr>")
    var dataArray = [name, destination, start, rate, nextTrain]
    var thData = $("<th>")
    thData.attr("scope", "row")
    thData.text("X")


    dataArray.forEach(function (element) {
        var newData = $("<td>")
        newData.text(element)
        newRow.append(newData)
    })
    newRow.prepend(thData)
    $("#tableBody").append(newRow)
}


//
var currentTime = new Date(),
    hours = currentTime.getHours(),
    minutes = currentTime.getMinutes();

if (minutes < 10) {
    minutes = "0" + minutes;
}
$("#currentTime").text(hours + ":" + minutes)