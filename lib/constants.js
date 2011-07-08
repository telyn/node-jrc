module.exports = {
    MESSAGE_SHUTDOWN        : String.fromCharCode(33), //!
    MESSAGE_NOIGNORE        : String.fromCharCode(35), //#
    MESSAGE_IP              : String.fromCharCode(36), //$
    MESSAGE_PWD             : String.fromCharCode(37), //%
    MESSAGE_TIME            : String.fromCharCode(38), //&
    MESSAGE_UNDO            : String.fromCharCode(45), //-
    MESSAGE_NOEVENT         : String.fromCharCode(63), //?
    MESSAGE_SERVERAUTH      : String.fromCharCode(64), //@
    MESSAGE_NAME            : String.fromCharCode(65), //A
    MESSAGE_PASSWORD        : String.fromCharCode(66), //B
    MESSAGE_LEAVE           : String.fromCharCode(67), //C
    MESSAGE_JOIN            : String.fromCharCode(68), //D
    MESSAGE_MESSAGE         : String.fromCharCode(69), //E
    MESSAGE_PRIVATEMESSAGE  : String.fromCharCode(70), //F
    MESSAGE_GENERALINFO     : String.fromCharCode(71), //G
    MESSAGE_NUMERICINFO     : String.fromCharCode(72), //H
    MESSAGE_INFO            : String.fromCharCode(73), //I
    MESSAGE_IGNORE          : String.fromCharCode(74), //J
    MESSAGE_KICK            : String.fromCharCode(75), //K
    MESSAGE_BAN             : String.fromCharCode(76), //L
    MESSAGE_GAG             : String.fromCharCode(77), //M
    MESSAGE_KEEPOUT         : String.fromCharCode(78), //N
    MESSAGE_PERMROOM        : String.fromCharCode(80), //P
    MESSAGE_SETVALUE        : String.fromCharCode(82), //R
    MESSAGE_OP              : String.fromCharCode(83), //S
    MESSAGE_MAIL            : String.fromCharCode(84), //T
    MESSAGE_LOG             : String.fromCharCode(85 ), //U
    MESSAGE_WAITLIST        : String.fromCharCode(86), //V
    MESSAGE_SETINFO         : String.fromCharCode(87), //W
    MESSAGE_REFRESH         : String.fromCharCode(90), //Z
    MESSAGE_WHOIS           : String.fromCharCode(94), //^ - also the "why"
    MESSAGE_USERINFO        : String.fromCharCode(97), //a
    MESSAGE_ROOMINFO        : String.fromCharCode(98), //b
    MESSAGE_ROOMUSERLIST    : String.fromCharCode(99), //c
    MESSAGE_SERVERINFO      : String.fromCharCode(103), //g
    MESSAGE_SPECIFICINFO    : String.fromCharCode(104), //h
    MESSAGE_SERVERMESSAGE   : String.fromCharCode(119), //w
    MESSAGE_REQUESTFAILED   : String.fromCharCode(120), //x
    MESSAGE_NOTFOUND        : String.fromCharCode(121), //y
    MESSAGE_ACCESSDENIED    : String.fromCharCode(122), //z
    MESSAGE_SERVERCHALLENGE : String.fromCharCode(126), //~

    MESSAGE_LEVEL_USER : 'Us',
    MESSAGE_LEVEL_TEMPOP : 'Te',
    MESSAGE_LEVEL_OP : 'Op',
    MESSAGE_LEVEL_MASTER : 'Ma'
}
