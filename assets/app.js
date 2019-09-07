$(document).ready(function () {

    function onErrorFunc(error) {

        $("div.errorModalBody").html(error + "<br>Please reload the page");
        $("#errorModal").modal('show');
    }

    const trainNameInput = $("#trainNameInput");
    const destinationInput = $("#destinationInput");
    const frequencyInput = $("#frequencyInput");
    const arrivalTimeInput = $("#arrivalTimeInput");

    // Initialize Firebase
    var config = {
        apiKey: "AIzaSyA7A7mcKTE231yWPJYJNtD4Xm_q3OdCpJQ",
        authDomain: "aly-s-project.firebaseapp.com",
        databaseURL: "https://aly-s-project.firebaseio.com",
        projectId: "aly-s-project",
        storageBucket: "",
        messagingSenderId: "284825767700",
        appId: "1:284825767700:web:c59720bbe004d8e2"
    };

    let database = null;

    try {
        firebase.initializeApp(firebaseConfig);
        database = firebase.database();
    } catch (error) {
        onErrorFunc(error);
    }


    function buildTableDOM(data) {
        let trainObject = data.val();
        let $tr = $("<tr>").attr("id", data.key);
        let $name = $("<td>");
        let $destination = $("<td>");
        let $frequency = $("<td>");
        let $nextArrival = $("<td>").addClass("nextArrival");
        let $minutesAway = $("<td>").addClass("minutesAway");

        $name.text(trainObject.trainName);
        $destination.text(trainObject.destination);
        $frequency.text(trainObject.frequency);
        $nextArrival.text(calcNextArrival(trainObject.frequency, trainObject.arrivalTime).trainArrival);
        $minutesAway.text(calcNextArrival(trainObject.frequency, trainObject.arrivalTime).trainMinutes);


        $tr.append($name, $destination, $frequency, $nextArrival, $minutesAway);
        $("tbody").append($tr);
    }

    function calcNextArrival(frequency, firstArrival) {

        //next arrival = (currentTime + (frequency - ((currentTime - firstArrival) % frequency)))

        let firstArrivalConverted = moment(firstArrival, "HH:mm").subtract(1, "years");

        let currentTime = moment();
        // console.log(`Current Time: ${moment(currentTime).format("hh:mm")}`)

        let timeDiff = moment().diff(moment(firstArrivalConverted), "minutes");
        // console.log(`Difference in time: ${timeDiff}`)

        let tRemainder = timeDiff % frequency;
        // console.log(`tRemainder: ${tRemainder}`)

        let tMinutesTillTrain = frequency - tRemainder;
        // console.log(`Minutes till train: ${tMinutesTillTrain}`)

        let nextTrainTime = moment().add(tMinutesTillTrain, "minutes");
        // console.log(`Arrival Time: ${moment(nextTrainTime).format("hh:mm")}`)

        // console.log(moment(nextTrainTime).format("HH:mm"));

        return {
            trainArrival: moment(nextTrainTime).format("hh:mm a"),
            trainMinutes: tMinutesTillTrain
        }
    }

    database.ref("trains").on("value", function (data) {
        if (data.val() === null) {
            $("tr.defaultText").show();
        } else {
            $("tr.defaultText").hide();
        }
    }, function (error) {
        onErrorFunc(error);
    })

    database.ref("trains").on("child_added", (data) => {
        buildTableDOM(data)
    }, onErrorFunc);

    setInterval(() => {
        database.ref("trains").on("value", (data) => {
            updateTime(data)
        }, onErrorFunc);
    }, 1000)

    function updateTime(data) {
        // $("tbody").empty();

        let trains = data.val();

        try {
            let trainKeys = Object.keys(trains);


            trainKeys.forEach(key => {
                $(`#${key} td.nextArrival`).text(calcNextArrival(trains[key].frequency, trains[key].arrivalTime).trainArrival);
                $(`#${key} td.minutesAway`).text(calcNextArrival(trains[key].frequency, trains[key].arrivalTime).trainMinutes);
                let minutesToArrival = calcNextArrival(trains[key].frequency, trains[key].arrivalTime).trainMinutes;
                if (minutesToArrival < 16 && minutesToArrival > 10) {
                    $(`#${key} td.minutesAway`).css({
                        "color": "#FF0000",
                        "font-weight": "600",
                    });
                } else if (calcNextArrival(trains[key].frequency, trains[key].arrivalTime).trainMinutes < 11) {
                    $(`#${key} td.minutesAway`).css({
                        "color": "#ffffff",
                    });
                    $(`#${key}`).css({
                        "color": "#ffffff",
                        "transition": "all 2.0s ease",
                        "background": "#800020",
                        "font-weight": "600",
                    })
                } else {
                    $(`#${key}`).css({
                        "color": "inherit",
                        "transition": "all 0.5s ease",
                        "background": "inherit",
                        "font-weight": "400",
                    });
                    $(`#${key} td.minutesAway`).css({
                        "color": "inherit",
                        "font-weight": "inherit"
                    });
                }
            })
        } catch (error) {
            console.log(error);
        }
    }

    $("#trainForm").on("submit", function (event) {
        if (trainNameInput.val() && destinationInput.val() && frequencyInput.val() && arrivalTimeInput.val()) {
            database.ref("trains").push({
                trainName: trainNameInput.val().trim(),
                destination: destinationInput.val().trim(),
                frequency: frequencyInput.val().trim(),
                arrivalTime: arrivalTimeInput.val().trim()
            }, function (error) {
                console.log(error);
            })
            // updateTime();
            $("#trainForm")[0].reset();
            event.preventDefault();
        }
    })

    $(window).keydown(function (event) {
        if (event.keyCode == 13) {
            event.preventDefault();
            return false;
        }
    })
})