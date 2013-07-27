//This module's responsibility is to keep the rooms in memory.
module.exports = function () {
  
  "use strict";

  var my = {};

  var rooms = {};
  //add room to our cache
  var addRoom = function (roomName) {
    //initialize room:
    var room = rooms[roomName] = {};
    room.users = {};
    room.displayVotes = false;
    return room;
  };

  //adds or updates the user within a room.
  my.addUpdateUser = function (roomName, user) {
    // the user object with the same name will be replaced, TODO: in the future add some checking os that wach user has a hash to identify each unique one.
    return my.getRoomByName(roomName).users[user.name] = user;
  };

  //returns the room by the given name
  my.getRoomByName = function (roomName) {
    var room = rooms[roomName];
    if(!room) {
      return addRoom(roomName);
    }
    return room;
  };

  //set all votes to null.
  my.resetVotes = function (roomName) {
    var room = my.getRoomByName (roomName);
    for(var p in room.users) {
      if(room.users.hasOwnProperty(p)) {
        room.users[p].vote = null;
      }
    }
  };

  //set the room vote visibility.
  my.updateVoteVisibility = function (roomName, voteVisible) {
    my.getRoomByName(roomName).displayVotes = voteVisible;
  }

  return my;
  
}();