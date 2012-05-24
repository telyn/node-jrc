var util = require('util');

// to make an error:
// new PasswordRequiredError(message, extra);

var errors = [
    "NullRoomError",
    "RoomNotFoundError", // {room: "some room name"}
    "UserNotFoundError", // {user: "some user name"} (TODO might be username)
    "UsersNotFoundError", // {users: ["Username","username2"]}
    "NameTakenError", // {newname: "some name"}
    "PasswordRequiredError", // {username: "some user name"}
    "WrongPasswordError", // {username: "some username" }
    "AccessDeniedToBanError", // {username: "some username", }
    "NotInRoomError", // {username: "Who", room: "Which room"}
    "InvalidLevelError" // {level: "Some invalid level"}
];
module.exports = {};

for(i=0; i<errors.length; i++) {
    var f = new Function("return function " + errors[i] + "(message, extra) {"+
        "this.name = '"+errors[i]+"';"+
        "this.message = message; "+
        "if(extra !== null && extra !== undefined) {"+
            "for(var k in extra) {"+
                "if(k != \"name\" && k != \"message\") {"+
                    "this[k] = extra[k];"+
                "}"+
            "}"+
        "}"+
    "}")();
    util.inherits(f, Error);
    module.exports[errors[i]] = f;
}