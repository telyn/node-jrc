var makeError = function(name,message,extra) {
    var error = {};
    error.name = name;
    error.message = message;

    if(extra !== null && extra !== undefined) {
        for(var k in extra) {
            if(k != "name" && k != "message") {
                error[k] = extra[k];
            }
        }
    }
    return error;
};

var errors = [
    "NullRoomError",
    "RoomNotFoundError",
    "UserNotFoundError",
    "UsersNotFoundError",
    "NameTakenError",
    "PasswordRequiredError",
    "WrongPasswordError"
];
module.exports = {};

for(i=0; i<errors.length; i++) {
    module.exports[errors[i]] = function(errname) {
        return function(message,extra) {
            return makeError(errname, message ,extra);
        };
    }(errors[i]);
}
