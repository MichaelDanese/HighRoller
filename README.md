# High Roller

High Roller is a tool for tabletop fans to help with their sessions. It is a Google Chrome extension and emulates a console based enviorment.<br>

## Installation
To install, go to Chrome://extensions and click on 'Load Unpacked'. Load in the folder and it should appear in your toolbar.<br>

## How To Use
The use of High Roller is simple enough. Enter any amount of text you wish and when you want to use a macro, enclose it in brackets.<br>
Example: The hero slashes at the bandit. He rolls a {roll 1d20}.<br>
In this scenarion, all the text is normal except for the macro, however you can have multiple macros in one line.<br>

## Technical Notes
High Roller parses all commands in that are entered and must follow a language for it to be accepted. The CFG is: <br>
START -> MACRO <br>
MACRO -> { command INPUT }<br>
INPUT -> PARAM PARAMS | EPSILON<br>
PARAM ->  quote STRING quote | VALUE<br>
PARAMS -> coma PARAM PARAMS | EPSILON<br>
STRING -> TOKEN STRING | EPSILON<br>
VALUE -> ( VALUE ) OPERATION | num OPERATION<br>
OPERATION -> word VALUE | operand VALUE | EPSILON<br>


## Features Right Now
As of this moment, High Roller supports:<br>
-Rolling Macro<br>
-Help Macro<br>
-Buttons for quick macros<br>
-Console interface<br>

## Ideas For The Future
-P2P sessions that allow other users to see  your rolls<br>
-Theming options<br>
-Saved macros for later use<br>