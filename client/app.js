// YOUR CODE HERE:
$(document).ready(function(){
  var getURLParameter = function(name){
    return decodeURI((RegExp(name + '=' + '(.+?)(&|$)').exec(location.search) || [null])[1]);
  };
  var username = getURLParameter("username");

  var mArray;
  var roomObj = {};

  var getMsg = function(){
    $.ajax({
    // always use this url
      url: 'http://127.0.0.1:3000',
      type: 'GET',
      data: {
        order: '-createdAt',
        limit: 500
      },
      //'order=-createdAt'
      contentType: 'application/json',

      success: function (data) {
        mArray = data.results;
        showMsgs();
        populateRoomList();
      },
      error: function (data) {
        // see: https://developer.mozilla.org/en-US/docs/Web/API/console.error
        console.error('chatterbox: fail');
      }
    });
  };

  var populateRoomList = function() {
    _.each(roomObj, function(value, room) {
      var $oneRoom = $("<option value=" + room + " class = " + room + ">" + room + "</option>");
      var $roomList = $("#roomList").append($oneRoom);
    });
  };

  var showMsgs = function() {
    _.each(mArray, function(msg){
      roomObj[msg.roomname] = true;
      var currentMessage = '[' + msg.roomname +'] ' + msg.username + " : " + msg.text;
      var $room = $("<div class=" + msg.roomname + "></div>");
      var $message = $('<ul class=' + msg.username + '></ul>').text(currentMessage);
      $room.append($message);
      $('.chatbox').append($room);
    });
  };

  var postMsg = function(Message){
    $.ajax({
    // always use this url
      url: 'http://127.0.0.1:3000',
      type: 'POST',
      data: JSON.stringify(Message),
      contentType: 'application/json',
      success: function (data) {
        console.log('chatterbox: Message sent');
      },
      error: function (data) {
        console.error('chatterbox: Failed to send message');
      }
    });
  };

  $('#clickbutton').on('click', function(){
    var Message = {};
    Message.text = $('#userInput').val();
    if(Message.text.length > 0){
      Message.username = username;
      Message.roomname = ($currentRoom || '4chan');
      postMsg(Message);
    }
    $('#userInput').val("");
  });

   $('#refresh').on('click', function(){
     location.reload(true);
   });

   $('#userInput').keyup(function(event){
     if(event.keyCode == 13){
       $('#clickbutton').click();
     }
   });

   //select roomList, on change, retrieve the value and call .show() on that room

   $('#roomList').change(function(){
      var $selectedRoom = $(this).val();
      filterByRoom($selectedRoom);

   });
   var $currentRoom = '4chan';

  var filterByRoom = function(roomname){
    $('.chatbox').children().hide();
    $('.'+roomname).each(function(){
      $(this).show();
      $currentRoom=roomname;
    });
  };

   $("#showAll").on("click", function() {
    $(".chatbox").children().show();
   });

   $("#makeRoom").keyup(function(event){
    if(event.keyCode == 13) {
      $currentRoom = $("#makeRoom").val();
      console.log($currentRoom);
    }
   });

   getMsg();
})
