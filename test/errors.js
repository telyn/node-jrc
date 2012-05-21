var errors = require('../lib/errors.js');
var should = require('should');

describe('Errors', function() {
    it('should all exist', function() {
        var error_names = [
            "NullRoomError",
            "RoomNotFoundError",
            "UserNotFoundError",
            "UsersNotFoundError",
            "NameTakenError",
            "PasswordRequiredError",
            "WrongPasswordError",
            "AccessDeniedToBanError"
        ];
        var error_list = [
            errors.NullRoomError,
            errors.RoomNotFoundError,
            errors.UserNotFoundError,
            errors.UsersNotFoundError,
            errors.NameTakenError,
            errors.PasswordRequiredError,
            errors.WrongPasswordError,
            errors.AccessDeniedToBanError
        ];

        var messages = ["Test One!", "Test Two!"];
        var objects = [{TestProperty: "Yeah!"}, {TestPropertyOne: "Aloha!", TestPropertyTwo: "Hallo!"}, {Room:"Empty Room."}];
        var i = 0;
        for(i=0;i<error_list.length;i++) {
            var m = messages[i%messages.length];
            var o = objects[i%objects.length];

            var e = error_list[i](m,o);
            e.should.have.property('name');
            e.name.should.equal(error_names[i%error_names.length]);
            e.should.have.property('message');
            e.message.should.equal(messages[i%messages.length]);
            for(var k in objects[i%objects.length]) {
                e.should.have.property(k);
                e[k].should.equal(objects[i%objects.length][k]);
            }
        }


    });
});
