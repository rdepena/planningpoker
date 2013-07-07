//TODO: Figure out a way to dependency inject the events object.
//TODO: Better naming.
var roomCache = function () {
  var my = {};

  rooms = {};
  

  //add room to our cache
  my.addRoom = function (roomName) {
    //initialize room:
    var room = rooms[roomName] = {};
    room.participants = {};
    room.displayVotes = false;
    return room;
  }

  //adds or updates the user within a room.
  my.addUpdateUser = function (roomName, user) {
    // the user object with the same name will be replaced, TODO: in the future add some checking os that wach user has a hash to identify each unique one.
    return my.roomByName(roomName).participants[user.name] = user;
  }

  my.roomByName = function (roomName) {
    var room = rooms[roomName];
    if(!room) {
      return my.addRoom(roomName);
    }
    return room;

  }


  return my;
};
module.exports = roomCache();