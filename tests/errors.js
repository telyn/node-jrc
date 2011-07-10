var errors = require("../lib/errors.js");

// this will work to convince me that the errors work. No need to check every single one since they're made programmatically.
// If a bug develops then I will eat these words, and probably add more tests.
module.exports = {
    RoomNotFound: function(test) {
        var err = errors.RoomNotFoundError("Blargle blee",{room: "Some Room"});
        test.equal("RoomNotFoundError",err.name);
        test.equal("Blargle blee", err.message);
        test.equal("Some Room", err.room);
        test.done();
    },
    UserNotFound: function(test) {
        var err = errors.UserNotFoundError("Blargle bleen",{user: "Some Guy"});
        test.equal("UserNotFoundError",err.name);
        test.equal("Blargle bleen", err.message);
        test.equal("Some Guy", err.user);
        test.done();
    },
    NullRoom: function(test) {
        var err = errors.NullRoomError("Blargle bleens");
        test.equal("NullRoomError",err.name);
        test.equal("Blargle bleens", err.message);
        test.done();
    }
};
