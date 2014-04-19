# this will save so much time
# transforms 
#		token ^
# into
# 		token(role='JRC-command', annotations='WHOIS')
# and 
#		command ^
# into
# 		command(annotations='WHOIS')
# and
# 		token WHOIS
# into
# 		token(role='node-jrc-constant') WHOIS

# now I just have to come up with an automatic linking strategy for the constants.

my %constants = (
	'!' => "SHUTDOWN",
	'#' => "NOIGNORE",
	'$' => "IP",
	'%' => "PWD",
	'&' => "TIME",
	'-' => "UNDO",
	'?' => "NOEVENT",
	'@' => "SERVERAUTH",
	A => "NAME",
	B => "PASSWORD",
	C => "LEAVE",
	D => "JOIN",
	E => "MESSAGE",
	F => "PRIVATEMESSAGE",
	G => "NUMERICINFO",
	H => "GENERALINFO",
	I => "INFO",
	J => "IGNORE",
	K => "KICK",
	L => "BAN",
	M => "GAG",
	N => "KEEPOUT",
	P => "PERMROOM",
	R => "SETVALUE",
	S => "OP",
	T => "MAIL",
	U => "LOG",
	V => "WAITLIST",
	W => "SETINFO",
	Z => "REFRESH",
	'^' => "WHOIS",
	a => "USERINFO",
	b => "ROOMINFO",
	c => "ROOMUSERLIST",
	g => "SERVERINFO",
	h => "SPECIFICINFO",
	w => "SERVERMESSAGE",
	x => "REQUESTFAILED",
	y => "NOTFOUND",
	z => "ACCESSDENIED",
	'~', "SERVERCHALLENGE"
);
sub add_annotation {
	my $element = shift(@_);
	my $char = shift(@_);
	if(substr($element, -1) eq ')') {
		return substr($element, 0, -1) . ", annotations='". $constants{$char} . "') " . $char;
	}
	return $element . "(annotations='". $constants{$char} . "') " . $char;
}

while(<STDIN>) {
	$_ =~ s/(token) ([A-NPR-WZabcghwxyz!#$%&-?@~^])$/add_command_role($1,$2)/e;
	$_ =~ s/(token) ([A-Z]+)$/add_constant_role($1,$2)/e;
	$_ =~ s/(command|token\(role='JRC-command'\)) ([A-NPR-WZabcghwxyz!#$%&-?@~^])/add_annotation($1, $2)/e;
	print $_;
}