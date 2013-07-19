//TODO: Figure out a way to dependency inject the events object.
//TODO: Better naming.
module.exports = function () {
  var rooms = {};
  //add room to our cache
  var addRoom = function (roomName) {
    //initialize room:
    var room = rooms[roomName] = {};
    room.participants = {};
    room.displayVotes = false;
    return room;
  };

  //adds or updates the user within a room.
  var addUpdateUser = function (roomName, user) {
    // the user object with the same name will be replaced, TODO: in the future add some checking os that wach user has a hash to identify each unique one.
    return getRoomByName(roomName).participants[user.name] = user;
  };

  //returns the room by the given name
  var getRoomByName = function (roomName) {
    var room = rooms[roomName];
    if(!room) {
      return addRoom(roomName);
    }
    return room;
  };

  var resetVotes = function (roomName) {
    var room = getRoomByName (roomName);
    for(var p in room.participants) {
      if(room.participants.hasOwnProperty(p)) {
        room.participants[p].vote = null;
      }
    }
  };

  var updateVoteVisibility = function (roomName, voteVisible) {
    getRoomByName(roomName).displayVotes = voteVisible;
  }

  return {
    addUpdateUser : addUpdateUser,
    getRoomByName : getRoomByName,
    resetVotes : resetVotes,
    updateVoteVisibility : updateVoteVisibility
  };

}();