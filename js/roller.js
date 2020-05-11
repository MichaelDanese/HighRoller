$(function(){
    
    function getCommand(){
        var command = $('#in').val();
        if(command != '')
        {
            $('#in').val('');
            var desiredOutput = parseCommand(command);
            $('#output').append("<div class='out'>" + desiredOutput + "</div>");
        }
    }

    $('#submit').click(function(){
        getCommand();
    });

    $('#quickFour').click(function(){
        var desiredOutput = parseCommand("{roll 1d4}");
        $('#output').append("<div class='out'>" + desiredOutput + "</div>");
    });
    $('#quickSix').click(function(){
        var desiredOutput = parseCommand("{roll 1d6}");
        $('#output').append("<div class='out'>" + desiredOutput + "</div>");
    });
    $('#quickEight').click(function(){
        var desiredOutput = parseCommand("{roll 1d8}");
        $('#output').append("<div class='out'>" + desiredOutput + "</div>");
    });
    $('#quickTen').click(function(){
        var desiredOutput = parseCommand("{roll 1d10}");
        $('#output').append("<div class='out'>" + desiredOutput + "</div>");
    });
    $('#quickTwelve').click(function(){
        var desiredOutput = parseCommand("{roll 1d12}");
        $('#output').append("<div class='out'>" + desiredOutput + "</div>");
    });
    $('#quickTwenty').click(function(){
        var desiredOutput = parseCommand("{roll 1d20}");
        $('#output').append("<div class='out'>" + desiredOutput + "</div>");
    });
    $('#quickOneHundred').click(function(){
        var desiredOutput = parseCommand("{roll 1d100}");
        $('#output').append("<div class='out'>" + desiredOutput + "</div>");
    });

    $('#in').keypress(function(event){
        var keycode = (event.keyCode ? event.keyCode : event.which);
        if(keycode == '13'){
            getCommand();
        }
    });
});