module.exports = {
    SHUTDOWN        : String.fromCharCode(33), //!
    NOIGNORE        : String.fromCharCode(35), //#
    IP              : String.fromCharCode(36), //$
    PWD             : String.fromCharCode(37), //%
    TIME            : String.fromCharCode(38), //&
    UNDO            : String.fromCharCode(45), //-
    NOEVENT         : String.fromCharCode(63), //?
    SERVERAUTH      : String.fromCharCode(64), //@
    NAME            : String.fromCharCode(65), //A
    PASSWORD        : String.fromCharCode(66), //B
    LEAVE           : String.fromCharCode(67), //C
    JOIN            : String.fromCharCode(68), //D
    MESSAGE         : String.fromCharCode(69), //E
    PRIVATEMESSAGE  : String.fromCharCode(70), //F
    GENERALINFO     : String.fromCharCode(71), //G
    NUMERICINFO     : String.fromCharCode(72), //H
    INFO            : String.fromCharCode(73), //I
    IGNORE          : String.fromCharCode(74), //J
    KICK            : String.fromCharCode(75), //K
    BAN             : String.fromCharCode(76), //L
    GAG             : String.fromCharCode(77), //M
    KEEPOUT         : String.fromCharCode(78), //N
    PERMROOM        : String.fromCharCode(80), //P
    SETVALUE        : String.fromCharCode(82), //R
    OP              : String.fromCharCode(83), //S
    MAIL            : String.fromCharCode(84), //T
    LOG             : String.fromCharCode(85 ), //U
    WAITLIST        : String.fromCharCode(86), //V
    SETINFO         : String.fromCharCode(87), //W
    REFRESH         : String.fromCharCode(90), //Z
    WHOIS           : String.fromCharCode(94), //^ - also the "why"
    USERINFO        : String.fromCharCode(97), //a
    ROOMINFO        : String.fromCharCode(98), //b
    ROOMUSERLIST    : String.fromCharCode(99), //c
    SERVERINFO      : String.fromCharCode(103), //g
    SPECIFICINFO    : String.fromCharCode(104), //h
    SERVERMESSAGE   : String.fromCharCode(119), //w
    REQUESTFAILED   : String.fromCharCode(120), //x
    NOTFOUND        : String.fromCharCode(121), //y
    ACCESSDENIED    : String.fromCharCode(122), //z
    SERVERCHALLENGE : String.fromCharCode(126), //~

    LEVEL_USER : 'Us',
    LEVEL_TEMPOP : 'Te',
    LEVEL_OP : 'Op',
    LEVEL_MASTER : 'Ma'
}
