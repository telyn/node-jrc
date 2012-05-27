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
    "InvalidLevelError", // {level: "Some invalid level"}
    "NoMailError"
];
module.exports = {};

for(i=0; i<errors.length; i++) {
    var f = function() {
        var CustomError;
        var build = function (message, obj) {
            var self = this;
            Error.apply(self, arguments);
            Error.captureStackTrace(self, CustomError);
            self.message = message;
            self.arguments = undefined;
            self.type = undefined;
            for(var k in obj) {
                if(k == "arguments" || k == "message" || k == "name" || k == "type") {
                    continue;
                }
                self[k] = obj[k];
            }
            return self;
        };

        eval('CustomError = '+errors[i]+ ' = function() { return build.apply(this, arguments); }');
        CustomError.prototype = Object.create(Error.prototype);
        CustomError.prototype.constructor = CustomError;
        Object.defineProperty(CustomError.prototype, 'name', { value: errors[i] });
        return CustomError;
    }();
    
    module.exports[errors[i]] = f;
}