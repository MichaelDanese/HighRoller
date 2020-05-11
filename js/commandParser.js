//Tools
function isLetter(str) {
    return str.length === 1 && str.match(/[a-z]/i);
}
//Parser Tools
class Token {//An object that holds info for the parser
    constructor(tokenType, val){
        this.type = tokenType;//Describes the type of token this is for the lexer and parser.
        this.value = val;//The actual value of the token. For example, the value would be 21 while the type would be num
    }
    
}
class Command{
    constructor(commandLabel, count, parameterSet){
        this.displayCommand = commandLabel;
        this.paramSet = parameterSet;
        this.paramCount = count;
        this.mainLineOutput = "";//InnerHTML to be inserted into the output first alongside the return values of other macros in line
        this.valueOutput = "";//InnerHTML to be inserted into the output div in the html after the main line
    }
    actOnCommand(){
        this.valueOutput += "<div class='valueOutput'>";
        if(this.displayCommand === "roll"){
            this.reduce();
            this.paramSet.forEach((element) => {
                element.value.forEach((index) => {
                    this.mainLineOutput += "<b>" + index.value + "</b>";
                });
            });
        }
        if(this.displayCommand === "help"){
            this.valueOutput += "Welcome to High Roller. This is an extension to aid GMs and tabletop players when playing some of their favorite games.<br>";
            this.valueOutput += "To begin, try rolling your first dice. The format should always match this: {command parameterOne, paramterTwo, ...}.<br>";
            this.valueOutput += "Example: to roll 3 d10, simply input {roll 3d10}. This can be enclosed in other text and multiple commands can be used in one line.<br>";
        }
        this.valueOutput += "</div>";
    }
    reduce(){
        this.paramSet.forEach((element) =>{
            if(element.type === "value"){
                this.reduceParam(element);
            }
        });
        
    }

    reduceParam(element){
        var parameter = element;
        var parameterTokenSet = element.value;
        var reducing = "true";
        var currentTokenValue;
        var size = 0;
        parameterTokenSet.forEach((paramIndex) => {
            this.valueOutput += paramIndex.value;
        });
        while(reducing === "true"){
            reducing = "false";
            for(var i = 0; i < parameterTokenSet.length;i++){
                size = parameterTokenSet.length - i;
                currentTokenValue = parameterTokenSet[i].type;
                if(size >= 3){
                    if(currentTokenValue === "(" && parameterTokenSet[i + 1].type === "num" && parameterTokenSet[i + 2].type === ")"){
                        parameterTokenSet.splice(i,3,parameterTokenSet[i + 1]);
                        reducing = "true";
                        break;
                    }
                    else if(currentTokenValue === "num" && parameterTokenSet[i + 1].type === "word" && parameterTokenSet[i + 2].type === "num"){
                        parameterTokenSet.splice(i,3,new Token("num",this.rollDie(parameterTokenSet[i + 2].value, parameterTokenSet[i].value)));
                        reducing = "true";
                        break;
                    }
                    else if(currentTokenValue === "num" && parameterTokenSet[i + 1].type === "operand" && parameterTokenSet[i + 2].type === "num"){
                        parameterTokenSet.splice(i,3,new Token("num",this.compute(parameterTokenSet[i].value,parameterTokenSet[i + 1].value,parameterTokenSet[i + 2].value)));
                        reducing = "true";
                        break;
                    }
                }
            }
        }
    }
    rollDie(ceiling, amount){
        var dieSize = parseInt(ceiling);
        var dieNum = parseInt(amount);
        var value = 0;
        var temp = 0;
        this.valueOutput += "<div class='diceRoll'>";
        this.valueOutput += "<p>Rolling " + amount + "d" + ceiling + "</p>";
        for(var i = 0; i < dieNum;i++){
            temp = Math.floor(Math.random() * dieSize) + 1;
            value += temp;
            this.valueOutput += "(" + temp + "/" + ceiling + ") ";
        }
        this.valueOutput += "</div>";
        return value;
    }
    compute(valOne, operand, valTwo){
        var value = 0;
        var valueOne = parseInt(valOne);
        var valueTwo = parseInt(valTwo);
        if(operand === "*"){value = valueOne * valueTwo;}
        else if(operand === "/"){value = valueOne / valueTwo;}
        else if(operand === "+"){value = valueOne + valueTwo;}
        else if(operand === "-"){value = valueOne - valueTwo;}
        return value;
    }
}
class Parameter{
    constructor(paramType, paramValue){
        this.type = paramType;//A string describing if this parameter is of type string or value
        this.value = paramValue;//A set of tokens
    }
}
//Parser
class CommandParser{
    constructor(toParse){
        this.status;
        this.tokenList;
        this.command
    }
    run(toParse){
        this.status = "In Progress";
        this.lexer(toParse);
        this.checkGrammar();
        if(this.status === "Accepted"){
            this.buildCommand();
        }
        return this.status;
    }
    lexer(toParse){
        var tokens = [];
        var currentToken;
        var builder = "";
        var space = 0;
        if(typeof toParse === "string"){
            for (var i = 0; i < toParse.length; i++) {//Will run through the string looking for tokens
                space = toParse.length - i;
                currentToken = toParse.charAt(i);
                if(
                    currentToken === "*" ||
                    currentToken === "/" ||
                    currentToken === "+" ||
                    currentToken === "-" 
                ){
                    tokens.push(new Token("operand",currentToken));
                }
                else if(currentToken === "}"){tokens.push(new Token("}",currentToken));}
                else if(currentToken === "{"){tokens.push(new Token("{",currentToken));}
                else if(currentToken === ")"){tokens.push(new Token(")",currentToken));}
                else if(currentToken === "("){tokens.push(new Token("(",currentToken));}
                else if(currentToken === ","){tokens.push(new Token(",",currentToken));}
                else if(currentToken === "\""){tokens.push(new Token("quote","\""));}
                else if(isLetter(currentToken)){//Will string together the continious stream of letters into a word token
                    builder = "";
                    while( space > 0 && isLetter(currentToken)){
                        builder += toParse.charAt(i);
                        i++;
                        space = toParse.length - i;
                        currentToken = toParse.charAt(i);
                    }
                    i--;
                    if(builder.toLowerCase() === "roll" || builder.toLowerCase() === "help"){
                        tokens.push(new Token("command", builder.toLowerCase()));
                    }
                    else{
                        tokens.push(new Token("word", builder));
                    }
                }
                else if(!isNaN(parseInt(currentToken))){//String together the next stream of numbers
                    builder = "";
                    while( space > 0 && !isNaN(parseInt(currentToken))){
                        builder += toParse.charAt(i);
                        i++;
                        space = toParse.length - i;
                        currentToken = toParse.charAt(i);
                    }
                    i--;
                    tokens.push(new Token("num",builder));
                }
                else if(currentToken === " "){//Ignores spaces
                }
                else{//Pushes whatever symbol onto the token array
                    tokens.push(new Token("other",currentToken));
                }
            }
            this.tokenList = tokens;//Should return an array of Tokens
        }
        
    }
    checkGrammar(){
        var tokens = this.tokenList, toDo = [], done = [];
        tokens.push(new Token("$","$")), toDo.push(new Token("state","start"));
        var tokenIndex = 0;
        var currentToken = tokens[0].type;
        var complete = "false";
        var state;
        while(complete === "false"){
                if(toDo.length > 0 && toDo[toDo.length - 1].type === "state"){
                    state = toDo.pop().value;
                }
                else if(toDo.length > 0 && toDo[toDo.length - 1].type === currentToken){
                    state = "token";
                    done.push(toDo.pop());
                    tokenIndex++;
                    if(tokens.length - tokenIndex > 0){
                        currentToken = tokens[tokenIndex].type;
                    }
                    else{
                        currentToken = "none";
                    }
                }
                else if(done.length > 0 && done[done.length - 1].type === "$"){
                    complete = "true";
                    state = "true";
                }
                else{
                    this.status =  "Incorrect Grammar";
                    complete = "true";
                }
                switch (state) {
                    case 'token':
                        break;
                    case 'start':
                        if (['{'].indexOf(currentToken) >= 0) {//First Set
                            toDo.push(new Token("$","$"));
                            toDo.push(new Token("state","macro"));
                            
                        }
                        else{
                            this.status =  "Incorrect Grammar";
                            complete = "true";
                        }
                        break;
                    case 'macro':
                        if (['{'].indexOf(currentToken) >= 0) {//First Set
                            toDo.push(new Token("}",""));
                            toDo.push(new Token("state","input"));
                            toDo.push(new Token("command",""));
                            toDo.push(new Token("{",""));
                        }
                        else{
                            this.status =  "Incorrect Grammar";
                            complete = "true";
                        }
                        break;
                    case 'input':
                        if (['quote', '(', 'num'].indexOf(currentToken) >= 0) {//First Set
                            toDo.push(new Token("state","params"));
                            toDo.push(new Token("state","param"));
                        }
                        else if(['}'].indexOf(currentToken) >= 0){/*Follow Set*/}
                        else{
                            this.status =  "Incorrect Grammar";
                            complete = "true";
                        }
                        break;
                    case 'params':
                        if ([','].indexOf(currentToken) >= 0) {//First Set
                            toDo.push(new Token("state","params"));
                            toDo.push(new Token("state","param"));
                            toDo.push(new Token(",","value"));
                        }
                        else if(['}'].indexOf(currentToken) >= 0){/*Follow Set*/}
                        else{
                            this.status =  "Incorrect Grammar";
                            complete = "true";
                        }
                        break;
                    case 'param':
                        if (['quote', '(', 'num'].indexOf(currentToken) >= 0) {//First Set
                            if(currentToken === "num" || currentToken === "("){
                                toDo.push(new Token("state","value"));
                            }
                            else if(currentToken === "quote"){
                                toDo.push(new Token("quote",""));
                                toDo.push(new Token("state","string"));
                                toDo.push(new Token("quote",""));
                            }
                        }
                        else{
                            this.status =  "Incorrect Grammar";
                            complete = "true";
                        }
                        break;
                    case 'string':
                        if (['word', "{" ,"}" ,"(" ,")" ,"," ,"num" , "other", "operand", "command"].indexOf(currentToken) >= 0) {//First Set
                                toDo.push(new Token("state","string"));
                                toDo.push(new Token("state","stringToken"));
                        }
                        else if(['quote'].indexOf(currentToken) >= 0){/*Follow Set*/}
                        else{
                            this.status =  "Incorrect Grammar";
                            complete = "true";
                        }
                        break;
                    case 'value':
                        if (['(', 'num'].indexOf(currentToken) >= 0) {//First Set
                            if(currentToken === "("){
                                toDo.push(new Token("state","operation"));
                                toDo.push(new Token(")",""));
                                toDo.push(new Token("state","value"));
                                toDo.push(new Token("(",""));
                            }
                            else if(currentToken === "num"){
                                toDo.push(new Token("state","operation"));
                                toDo.push(new Token("num",""));
                            }
                        }
                        else{
                            this.status =  "Incorrect Grammar";
                            complete = "true";
                        }
                        break;
                    case 'operation':
                        if (['operand', 'word'].indexOf(currentToken) >= 0) {//First Set
                            if(currentToken === "word"){
                                toDo.push(new Token("state","value"));
                                toDo.push(new Token("word",""));
                            }
                            else if(currentToken === "operand"){
                                toDo.push(new Token("state","value"));
                                toDo.push(new Token("operand",""));
                            }
                        }
                        else if([')', ',', '}'].indexOf(currentToken) >= 0){/*Follow Set*/}
                        else{
                            this.status =  "Incorrect Grammar";
                            complete = "true";
                        }
                        break;
                    case 'stringToken':
                        if(currentToken === "{"){ toDo.push(new Token("{",""));}
                        else if(currentToken === "}"){ toDo.push(new Token("}",""));}
                        else if(currentToken === "("){ toDo.push(new Token("(",""));}
                        else if(currentToken === ")"){ toDo.push(new Token(")",""));}
                        else if(currentToken === "operand"){ toDo.push(new Token("operand",""));}
                        else if(currentToken === "other"){ toDo.push(new Token("other",""));}
                        else if(currentToken === "word"){ toDo.push(new Token("word",""));}
                        else if(currentToken === "num"){ toDo.push(new Token("num",""));}
                        else if(currentToken === ","){ toDo.push(new Token(",",""));}
                        else if(currentToken === "command"){ toDo.push(new Token("command",""));}
                        else{
                            this.status =  "Incorrect Grammar";
                            complete = "true";
                        }
                        break;
                                
                }
        }
        tokens.pop();
        if(this.status === "In Progress"){
            this.status =  "Accepted";
        }
    }
    buildCommand(){
        var command = this.tokenList[1].value;
        var currentToken, currentTokenType;
        var paramCount = 0, paramType, paramValue = [], params = [];
        var paramNotFound = "true";
        for(var i = 2; i < this.tokenList.length;i++){
            currentToken = this.tokenList[i];
            currentTokenType = currentToken.type;
            if(paramNotFound === "true"){
                if(currentTokenType === "num" || currentTokenType === "("){paramType = "value";}
                else if(currentTokenType === "quote"){paramType = "string";}
                paramNotFound = "false";
                paramValue.push(currentToken);
            }
            else{
                
                if(currentTokenType === "," || currentTokenType === "}"){
                    params.push(new Parameter(paramType, paramValue));
                    paramCount++;
                    paramNotFound = "true";
                    paramValue = [];
                }
                else{paramValue.push(currentToken);}
            }
            
        }
        this.command = new Command(command, paramCount, params);
        
    }
}

function parseCommand(toParse){
    var input = toParse, builder = "", valueBuilder = "",currentCommand = "", currentChar = "";//Strings
    var bracketCount = 0, j = 0;//Ints
    var parser = new CommandParser();//Parser Object
    for(var i = 0; i < input.length; i++){
        if(input.charAt(i) === "{"){
            bracketCount++;
            currentCommand += "{";
            j = i + 1;
            while(input.length - j > 0 && bracketCount > 0){
                currentChar = input.charAt(j);
                currentCommand += currentChar;
                j++;
                if(currentChar === "{"){
                    bracketCount++;
                }
                else if(currentChar === "}"){
                    bracketCount--;
                }
            }
            if(bracketCount === 0){//A command was found
                i = j - 1; 
                parser.run(currentCommand);
                
                if(parser.status === "Accepted"){
                    parser.command.actOnCommand();
                    builder += parser.command.mainLineOutput;
                    valueBuilder += parser.command.valueOutput;
                    
                }
                currentCommand = "";
            }
            else{//There was a bracket issue or it was a false flag for a command
                bracketCount = 0;
                builder += currentCommand;
                i = j - 1;
                currentCommand = "";
            }
            
        }
        else{
            builder += input.charAt(i);
        }

    }
    return builder + valueBuilder;
}