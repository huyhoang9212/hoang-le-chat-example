// phuong thuc khoi tao class room
// owner = socket.id
function Room(name, id, owner) {
    this.name = name;
    this.id = id;
    this.owner = owner;
    this.people = [];
    this.peopleLimit = 4;
    this.status = "available";
    this.private = false;
};

// Mẫu prototype cho phép bạn định nghĩa thêm phương thức khởi tạo 
//của 1 class sau khi phương thức khởi tạo đã được định nghĩa.

// public method
// add person to room

// personId = socket.id
Room.prototype.addPerson = function (person) {
    if (this.status === "available") {
        this.people.push(person);
    }
};

Room.prototype.removePerson = function (person) {
    var personIndex = -1;
    for (var i = 0; i, this.people.length; i++) {
        if (this.people[i].id == person.id) {
            personIndex = i;
            break;
        }
    }

    this.people.remove(personIndex);
};

Room.prototype.getPerson = function (personID) {
    var person = null;
    for (var i = 0; i < this.people.length; i++) {
        if (this.people[i].id == personID) {
            person = this.people[i];
            break;
        }
    }

    return person;
};

Room.prototype.isPrivate = function () {
    if (this.private) {
        return true;
    } else {
        return false;
    }
};


// exports Room become one module
// that ex use: Room = require('./room.js');
module.exports = Room;