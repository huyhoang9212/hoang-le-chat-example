
function toggleNameForm() {
    $("#login-screen").toggle();
}

function toggleChatWindow() {
    $("#main-chat-screen").toggle();
}

$(document).ready(function () {
    //setup "global" variables first
    //var app = express();
    //var port = process.env.PORT || 7777;
    //var ip = process.env.IP || "192.168.3.73";
    //var socket = io.connect(ip + ":" + port);
    var socket = io.connect();
    var myRoomID = null;
    
    $("form").submit(function (event) {
        event.preventDefault();
    });
    
    $("#conversation").bind("DOMSubtreeModified", function () {
        $("#conversation").animate({
            scrollTop: $("#conversation")[0].scrollHeight
        });
    });
    
    $("#main-chat-screen").hide();
    $("#errors").hide();
    $("#name").focus();
    $("#join").attr('disabled', 'disabled');
    
    if ($("#name").val() === "") {
        $("#join").attr('disabled', 'disabled');
    }
    
    //enter screen
    $("#nameForm").submit(function () {
        var name = $("#name").val();
        var device = "desktop";
        if (name === "" || name.length < 2) {
            $("#errors").empty();
            $("#errors").append("Please enter a name");
            $("#errors").show();
        } else {
            socket.emit("joinserver", name, device);
            toggleNameForm();
            toggleChatWindow();
            $("#msg").focus();
        }
    });
    
    $("#name").keypress(function (e) {
        var name = $("#name").val();
        if (name.length < 2) {
            $("#join").attr('disabled', 'disabled');
        } else {
            $("#errors").empty();
            $("#errors").hide();
            $("#join").removeAttr('disabled');
        }
    });
    
    //main chat screen
    $("#chatForm").submit(function () {
        var msg = $("#msg").val();
        if (msg !== "") {
            socket.emit("send", msg);
            $("#msg").val("");
        }
    });
    
    
    
    
    // Room functions
    $("#showCreateRoom").click(function () {
        $("#createRoomForm").toggle();
    });
    
    $("#createRoomBtn").click(function () {
        var roomExists = false;
        var roomName = $("#createRoomName").val();
        socket.emit("check", roomName, function (data) {
            roomExists = data.result;
            if (roomExists) {
                $("#errors").empty();
                $("#errors").show();
                $("#errors").append("Room <i>" + roomName + "</i> already exists");
            } else {
                if (roomName.length > 0) { //also check for roomname
                    socket.emit("createRoom", roomName);
                    $("#errors").empty();
                    $("#errors").hide();
                }
            }
        });
    });
    
    $("#rooms").on('click', '.joinRoomBtn', function () {
        var roomName = $(this).siblings("span").text(); // tim ho hang anh em
        var roomID = $(this).attr("id");
        socket.emit("joinRoom", roomID);
    });
    
    $("#rooms").on('click', '.removeRoomBtn', function () {
        var roomName = $(this).siblings("span").text();
        var roomID = $(this).attr("id");
        socket.emit("removeRoom", roomID);
        $("#createRoom").show();
    });
    
    $("#leave").click(function () {
        var roomID = myRoomID;
        socket.emit("leaveRoom", roomID);
        $("#createRoom").show();
    });
    
    $("#people").on('click', '.whisper', function () {
        var name = $(this).siblings("span").text();
        $("#msg").val("w:" + name + ":");
        $("#msg").focus();
    });
    
    //socket
    socket.on("exists", function (data) {
        $("#errors").empty();
        $("#errors").show();
        $("#errors").append(data.msg + " Try <strong>" + data.proposedName + "</strong>");
        toggleNameForm();
        toggleChatWindow();
    });
               
    
    socket.on("update", function (msg) {
        $("#msgs").append("<li><span class='small text-muted'>" + msg + "</span></li>");
    });
    
    socket.on("update-people", function (data) {
        //var peopleOnline = [];
        $("#people").empty();
        $('#people').append("<li class=\"list-group-item active\">People online <span class=\"badge\">" + data.count + "</span></li>");
        $.each(data.people, function (a, obj) {
            html = "";          
            $('#people').append("<li class=\"list-group-item\"><span>" + obj.name + "</span>" + html + " <a href=\"#\" class=\"whisper btn btn-xs\">whisper</a></li>");     
        });
   
    });
    
    socket.on("chat", function (person, msg) {
        $("#msgs").append("<li><strong><span class='text-success'>" + person.name + "</span></strong>: " + msg + "</li>");
        //clear typing field
        $("#" + person.name + "").remove();
        clearTimeout(timeout);
        timeout = setTimeout(timeoutFunction, 0);
    });
    
    socket.on("whisper", function (person, msg) {
        if (person.name === "You") {
            s = "whisper"
        } else {
            s = "whispers"
        }
        $("#msgs").append("<li><strong><span class='text-warning'>" + person.name + "</span></strong><em><span class='small'> " + s + "</span></em> : " + msg + "</li>");
    });
    
    socket.on("roomList", function (data) {
        $("#rooms").text("");
        $("#rooms").append("<li class=\"list-group-item active\">List of rooms <span class=\"badge\">" + data.count + "</span></li>");
        if (!jQuery.isEmptyObject(data.rooms)) {
            $.each(data.rooms, function (id, room) {
                var html = "<button id=" + id + " class='joinRoomBtn btn btn-default btn-xs' >Join</button>" + " " + "<button id=" + id + " class='removeRoomBtn btn btn-default btn-xs'>Remove</button>";
                $('#rooms').append("<li id=" + id + " class=\"list-group-item\"><span>" + room.name + "</span> " + html + "</li>");
            });
        } else {
            $("#rooms").append("<li class=\"list-group-item\">There are no rooms yet.</li>");
        }
    });
    
    socket.on("sendRoomID", function (data) {
        myRoomID = data.id;
    });
    
    socket.on("disconnect", function () {
        $("#msgs").append("<li><strong><span class='text-warning'>The server is not available</span></strong></li>");
        $("#msg").attr("disabled", "disabled");
        $("#send").attr("disabled", "disabled");
    });

});
