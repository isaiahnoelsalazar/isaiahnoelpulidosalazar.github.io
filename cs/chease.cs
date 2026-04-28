using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;

// current version - 1.3.0

// changes:
// - added set options for both arrays and dictionaries
// - added file operations (create, read, update, delete)

enum TokenType
{
    Var, Say, Get, Out, Job, If, Else, Repeat, Increment, Decrement, Array, Dictionary,
    BooleanType, NumberType, DecimalType, StringType, True, False,
    Identifier, StringValue, NumberValue, DecimalValue,
    Plus, Minus, Multiply, Divide, Modulo,
    Greater, Less, GreaterEqual, LessEqual, Equal, NotEqual,
    LBracket, RBracket, Comma, Colon,
    EOF,
    Set, File, Create, Read, Update, Delete
}

class Token
{
    public TokenType Type { get; }
    public string Text { get; }
    public Token(TokenType type, string text) { Type = type; Text = text; }
}

class Lexer
{
    private readonly string _code;
    private int _pos;

    public Lexer(string code) { _code = code; }

    public List<Token> Tokenize()
    {
        var tokens = new List<Token>();
        while (_pos < _code.Length)
        {
            char c = _code[_pos];

            if (char.IsWhiteSpace(c)) { _pos++; continue; }

            if (c == '"')
            {
                _pos++;
                string str = "";
                while (_pos < _code.Length && _code[_pos] != '"') { str += _code[_pos++]; }
                if (_pos < _code.Length) _pos++;
                tokens.Add(new Token(TokenType.StringValue, str));
                continue;
            }

            if (char.IsDigit(c))
            {
                string num = "";
                bool isDecimal = false;
                while (_pos < _code.Length && (char.IsDigit(_code[_pos]) || _code[_pos] == '.')) {
                    if (_code[_pos] == '.') isDecimal = true;
                    num += _code[_pos++]; 
                }
                tokens.Add(new Token(isDecimal ? TokenType.DecimalValue : TokenType.NumberValue, num));
                continue;
            }

            if (char.IsLetter(c))
            {
                string id = "";
                while (_pos < _code.Length && char.IsLetterOrDigit(_code[_pos])) { id += _code[_pos++]; }

                if (id == "note")
                {
                    int peek = _pos;
                    while (peek < _code.Length && char.IsWhiteSpace(_code[peek])) peek++;

                    if (peek < _code.Length && _code[peek] == '[')
                    {
                        _pos = peek + 1;
                        while (_pos < _code.Length && _code[_pos] != ']') _pos++;
                        if (_pos < _code.Length) _pos++;
                    }
                    else
                    {
                        while (_pos < _code.Length && _code[_pos] != '\n' && _code[_pos] != '\r') _pos++;
                    }
                    continue;
                }

                tokens.Add(id switch
                {
                    "var" => new Token(TokenType.Var, id),
                    "say" => new Token(TokenType.Say, id),
                    "get" => new Token(TokenType.Get, id),
                    "out" => new Token(TokenType.Out, id),
                    "job" => new Token(TokenType.Job, id),
                    "if" => new Token(TokenType.If, id),
                    "else" => new Token(TokenType.Else, id),
                    "repeat" => new Token(TokenType.Repeat, id),
                    "increment" => new Token(TokenType.Increment, id),
                    "decrement" => new Token(TokenType.Decrement, id),
                    "array" => new Token(TokenType.Array, id),
                    "dictionary" => new Token(TokenType.Dictionary, id),
                    "boolean" => new Token(TokenType.BooleanType, id),
                    "number" => new Token(TokenType.NumberType, id),
                    "decimal" => new Token(TokenType.DecimalType, id),
                    "string" => new Token(TokenType.StringType, id),
                    "true" => new Token(TokenType.True, id),
                    "false" => new Token(TokenType.False, id),
                    "set" => new Token(TokenType.Set, id),
                    "file" => new Token(TokenType.File, id),
                    "create" => new Token(TokenType.Create, id),
                    "read" => new Token(TokenType.Read, id),
                    "update" => new Token(TokenType.Update, id),
                    "delete" => new Token(TokenType.Delete, id),
                    _ => new Token(TokenType.Identifier, id)
                });
                continue;
            }

            if (c == '>') {
                if (_pos + 1 < _code.Length && _code[_pos + 1] == '=') { _pos += 2; tokens.Add(new Token(TokenType.GreaterEqual, ">=")); continue; }
                _pos++; tokens.Add(new Token(TokenType.Greater, ">")); continue;
            }
            if (c == '<') {
                if (_pos + 1 < _code.Length && _code[_pos + 1] == '=') { _pos += 2; tokens.Add(new Token(TokenType.LessEqual, "<=")); continue; }
                _pos++; tokens.Add(new Token(TokenType.Less, "<")); continue;
            }
            if (c == '=') {
                if (_pos + 1 < _code.Length && _code[_pos + 1] == '=') { _pos += 2; tokens.Add(new Token(TokenType.Equal, "==")); continue; }
                throw new Exception("Syntax Error: Unknown character '='");
            }
            if (c == '!') {
                if (_pos + 1 < _code.Length && _code[_pos + 1] == '=') { _pos += 2; tokens.Add(new Token(TokenType.NotEqual, "!=")); continue; }
                throw new Exception("Syntax Error: Unknown character '!'");
            }
            if (c == ':') { _pos++; tokens.Add(new Token(TokenType.Colon, ":")); continue; }

            tokens.Add(c switch
            {
                '+' => new Token(TokenType.Plus, c.ToString()),
                '-' => new Token(TokenType.Minus, c.ToString()),
                '*' => new Token(TokenType.Multiply, c.ToString()),
                '/' => new Token(TokenType.Divide, c.ToString()),
                '%' => new Token(TokenType.Modulo, c.ToString()),
                '[' => new Token(TokenType.LBracket, c.ToString()),
                ']' => new Token(TokenType.RBracket, c.ToString()),
                ',' => new Token(TokenType.Comma, c.ToString()),
                _ => throw new Exception($"Syntax Error: Unknown character '{c}'")
            });
            _pos++;
        }
        tokens.Add(new Token(TokenType.EOF, ""));
        return tokens;
    }
}

abstract class Node { }
abstract class Stmt : Node { }
abstract class Expr : Node { }

class ProgramNode : Node { public List<Stmt> Statements = new List<Stmt>(); }
class VarStmt : Stmt { public TokenType? Type; public string Name; public Expr Value; }
class SayStmt : Stmt { public Expr Value; }
class OutStmt : Stmt { public Expr Value; }
class JobStmt : Stmt { public string Name; public List<string> Params; public List<Stmt> Body; }
class ExprStmt : Stmt { public Expr Expression; }
class IncDecStmt : Stmt { public bool IsIncrement; public string Name; public Expr Amount; }
class RepeatStmt : Stmt { public bool IsForever; public Expr Count; public List<Stmt> Body; }
class IfStmt : Stmt { public Expr Condition; public List<Stmt> TrueBody; public List<Stmt> FalseBody; }
class ArrayDeclStmt : Stmt { public TokenType Type; public string Name; public List<Expr> Elements; }
class DictDeclStmt : Stmt { public string Name; public List<(string, Expr)> Pairs; }
class ArraySetStmt : Stmt { public string ArrayName; public Expr Index; public Expr Value; }
class DictSetStmt : Stmt { public string DictName; public bool IsKey; public Expr KeyOrIndex; public Expr Value; }

class FileCreateStmt : Stmt { public Expr FileName; public Expr Content; }
class FileUpdateStmt : Stmt { public Expr FileName; public Expr Content; }
class FileDeleteStmt : Stmt { public Expr FileName; }
class FileReadExpr : Expr { public Expr FileName; }

class BinaryExpr : Expr { public Expr Left; public TokenType Op; public Expr Right; }
class LiteralExpr : Expr { public object Value; }
class VarExpr : Expr { public string Name; }
class GetExpr : Expr { }
class CallExpr : Expr { public string Name; public List<Expr> Args; }
class ArrayGetExpr : Expr { public string ArrayName; public Expr Index; }
class ArrayLengthExpr : Expr { public string ArrayName; }
class DictGetExpr : Expr { public string DictName; public Expr KeyOrIndex; public bool IsKey; }
class DictLengthExpr : Expr { public string DictName; }

class Parser
{
    private readonly List<Token> _tokens;
    private int _pos;

    public Parser(List<Token> tokens) { _tokens = tokens; }

    private Token Peek() => _tokens[_pos];
    private Token PeekNext() => _pos + 1 < _tokens.Count ? _tokens[_pos + 1] : _tokens[_tokens.Count - 1];
    
    private Token Consume(TokenType type)
    {
        if (Peek().Type == type) return _tokens[_pos++];
        throw new Exception($"Parse Error: Expected {type} but got {Peek().Type} at '{Peek().Text}'");
    }

    private Token ConsumeType()
    {
        if (Peek().Type == TokenType.BooleanType || Peek().Type == TokenType.NumberType || 
            Peek().Type == TokenType.DecimalType || Peek().Type == TokenType.StringType)
        {
            return Consume(Peek().Type);
        }
        throw new Exception($"Parse Error: Expected type but got {Peek().Type} at '{Peek().Text}'");
    }

    public ProgramNode Parse()
    {
        var program = new ProgramNode();
        while (Peek().Type != TokenType.EOF) program.Statements.Add(ParseStmt());
        return program;
    }

    private Stmt ParseStmt()
    {
        if (Peek().Type == TokenType.Var)
        {
            Consume(TokenType.Var);
            TokenType? type = null;
            if (Peek().Type == TokenType.BooleanType || Peek().Type == TokenType.NumberType || 
                Peek().Type == TokenType.DecimalType || Peek().Type == TokenType.StringType) {
                type = ConsumeType().Type;
            }
            string name = Consume(TokenType.Identifier).Text;
            return new VarStmt { Type = type, Name = name, Value = ParseExpr() };
        }
        if (Peek().Type == TokenType.Say)
        {
            Consume(TokenType.Say);
            return new SayStmt { Value = ParseExpr() };
        }
        if (Peek().Type == TokenType.Out)
        {
            Consume(TokenType.Out);
            Expr val = null;
            if (Peek().Type != TokenType.EOF && Peek().Type != TokenType.RBracket && Peek().Type != TokenType.Else && IsExprStart(Peek().Type)) {
                val = ParseExpr();
            }
            return new OutStmt { Value = val };
        }
        if (Peek().Type == TokenType.Increment || Peek().Type == TokenType.Decrement)
        {
            bool isInc = Consume(Peek().Type).Type == TokenType.Increment;
            string name = Consume(TokenType.Identifier).Text;
            return new IncDecStmt { IsIncrement = isInc, Name = name, Amount = ParseExpr() };
        }
        if (Peek().Type == TokenType.If)
        {
            Consume(TokenType.If);
            Expr cond = ParseExpr();
            Consume(TokenType.LBracket);
            var trueBody = new List<Stmt>();
            while (Peek().Type != TokenType.RBracket && Peek().Type != TokenType.EOF) trueBody.Add(ParseStmt());
            Consume(TokenType.RBracket);

            var falseBody = new List<Stmt>();
            if (Peek().Type == TokenType.Else)
            {
                Consume(TokenType.Else);
                Consume(TokenType.LBracket);
                while (Peek().Type != TokenType.RBracket && Peek().Type != TokenType.EOF) falseBody.Add(ParseStmt());
                Consume(TokenType.RBracket);
            }
            return new IfStmt { Condition = cond, TrueBody = trueBody, FalseBody = falseBody };
        }
        if (Peek().Type == TokenType.Repeat)
        {
            Consume(TokenType.Repeat);
            bool isForever = false;
            Expr count = null;
            if (Peek().Type == TokenType.Identifier && Peek().Text == "forever") {
                Consume(TokenType.Identifier);
                isForever = true;
            } else {
                count = ParseExpr();
            }
            Consume(TokenType.LBracket);
            var body = new List<Stmt>();
            while (Peek().Type != TokenType.RBracket && Peek().Type != TokenType.EOF) body.Add(ParseStmt());
            Consume(TokenType.RBracket);
            return new RepeatStmt { IsForever = isForever, Count = count, Body = body };
        }
        if (Peek().Type == TokenType.Array)
        {
            var nextType = PeekNext().Type;
            if (nextType == TokenType.Set)
            {
                Consume(TokenType.Array);
                Consume(TokenType.Set);
                string arrName = Consume(TokenType.Identifier).Text;
                if (Peek().Type == TokenType.Comma) Consume(TokenType.Comma);
                Expr index = ParseExpr();
                if (Peek().Type == TokenType.Comma) Consume(TokenType.Comma);
                Expr value = ParseExpr();
                return new ArraySetStmt { ArrayName = arrName, Index = index, Value = value };
            }
            if (nextType == TokenType.BooleanType || nextType == TokenType.NumberType || 
                nextType == TokenType.DecimalType || nextType == TokenType.StringType)
            {
                Consume(TokenType.Array);
                Token typeTok = ConsumeType();
                string name = Consume(TokenType.Identifier).Text;
                List<Expr> elements = new List<Expr>();
                if (Peek().Type != TokenType.EOF && IsExprStart(Peek().Type)) {
                    elements.Add(ParseExpr());
                    while (Peek().Type == TokenType.Comma) {
                        Consume(TokenType.Comma);
                        elements.Add(ParseExpr());
                    }
                }
                return new ArrayDeclStmt { Type = typeTok.Type, Name = name, Elements = elements };
            }
        }
        if (Peek().Type == TokenType.Dictionary)
        {
            var nextType = PeekNext().Type;
            if (nextType == TokenType.Set)
            {
                Consume(TokenType.Dictionary);
                Consume(TokenType.Set);
                bool isKey = false;
                if (Peek().Type == TokenType.Identifier && Peek().Text == "key") { Consume(TokenType.Identifier); isKey = true; }
                else if (Peek().Type == TokenType.Identifier && Peek().Text == "index") { Consume(TokenType.Identifier); isKey = false; }
                else throw new Exception("Expected 'key' or 'index' after 'dictionary set'.");
                
                string dictName = Consume(TokenType.Identifier).Text;
                if (Peek().Type == TokenType.Comma) Consume(TokenType.Comma);
                Expr keyOrIndex = ParseExpr();
                if (Peek().Type == TokenType.Comma) Consume(TokenType.Comma);
                Expr value = ParseExpr();
                return new DictSetStmt { DictName = dictName, KeyOrIndex = keyOrIndex, IsKey = isKey, Value = value };
            }
            if (nextType == TokenType.Identifier)
            {
                Consume(TokenType.Dictionary);
                string name = Consume(TokenType.Identifier).Text;
                var pairs = new List<(string, Expr)>();
                if (Peek().Type == TokenType.Identifier || Peek().Type == TokenType.StringValue) {
                    string key = Peek().Type == TokenType.StringValue ? Consume(TokenType.StringValue).Text : Consume(TokenType.Identifier).Text;
                    Consume(TokenType.Colon);
                    Expr val = ParseExpr();
                    pairs.Add((key, val));
                    while (Peek().Type == TokenType.Comma) {
                        Consume(TokenType.Comma);
                        string k = Peek().Type == TokenType.StringValue ? Consume(TokenType.StringValue).Text : Consume(TokenType.Identifier).Text;
                        Consume(TokenType.Colon);
                        Expr v = ParseExpr();
                        pairs.Add((k, v));
                    }
                }
                return new DictDeclStmt { Name = name, Pairs = pairs };
            }
        }
        if (Peek().Type == TokenType.File)
        {
            var nextType = PeekNext().Type;
            if (nextType == TokenType.Create || nextType == TokenType.Update || nextType == TokenType.Delete)
            {
                Consume(TokenType.File);
                if (Peek().Type == TokenType.Create)
                {
                    Consume(TokenType.Create);
                    Expr fileName = ParseExpr();
                    Consume(TokenType.LBracket);
                    Expr content = ParseExpr();
                    Consume(TokenType.RBracket);
                    return new FileCreateStmt { FileName = fileName, Content = content };
                }
                if (Peek().Type == TokenType.Update)
                {
                    Consume(TokenType.Update);
                    Expr fileName = ParseExpr();
                    Consume(TokenType.LBracket);
                    Expr content = ParseExpr();
                    Consume(TokenType.RBracket);
                    return new FileUpdateStmt { FileName = fileName, Content = content };
                }
                if (Peek().Type == TokenType.Delete)
                {
                    Consume(TokenType.Delete);
                    Expr fileName = ParseExpr();
                    return new FileDeleteStmt { FileName = fileName };
                }
            }
        }
        if (Peek().Type == TokenType.Job)
        {
            Consume(TokenType.Job);
            string name = Consume(TokenType.Identifier).Text;
            var parameters = new List<string>();
            while (Peek().Type == TokenType.Identifier) parameters.Add(Consume(TokenType.Identifier).Text);

            Consume(TokenType.LBracket);
            var body = new List<Stmt>();
            while (Peek().Type != TokenType.RBracket && Peek().Type != TokenType.EOF) body.Add(ParseStmt());
            Consume(TokenType.RBracket);

            return new JobStmt { Name = name, Params = parameters, Body = body };
        }
        return new ExprStmt { Expression = ParseExpr() };
    }

    private Expr ParseExpr() => ParseComparison();

    private Expr ParseComparison()
    {
        Expr left = ParseAddition();
        while (Peek().Type == TokenType.Greater || Peek().Type == TokenType.Less ||
               Peek().Type == TokenType.GreaterEqual || Peek().Type == TokenType.LessEqual ||
               Peek().Type == TokenType.Equal || Peek().Type == TokenType.NotEqual)
        {
            Token op = Consume(Peek().Type);
            left = new BinaryExpr { Left = left, Op = op.Type, Right = ParseAddition() };
        }
        return left;
    }

    private Expr ParseAddition()
    {
        Expr left = ParseMultiplication();
        while (Peek().Type == TokenType.Plus || Peek().Type == TokenType.Minus)
        {
            Token op = Consume(Peek().Type);
            left = new BinaryExpr { Left = left, Op = op.Type, Right = ParseMultiplication() };
        }
        return left;
    }

    private Expr ParseMultiplication()
    {
        Expr left = ParsePrimary();
        while (Peek().Type == TokenType.Multiply || Peek().Type == TokenType.Divide || Peek().Type == TokenType.Modulo)
        {
            Token op = Consume(Peek().Type);
            left = new BinaryExpr { Left = left, Op = op.Type, Right = ParsePrimary() };
        }
        return left;
    }

    private bool IsExprStart(TokenType type)
    {
        return type == TokenType.Identifier || type == TokenType.NumberValue ||
               type == TokenType.DecimalValue || type == TokenType.StringValue ||
               type == TokenType.Get || type == TokenType.True || type == TokenType.False ||
               type == TokenType.Array || type == TokenType.Dictionary || type == TokenType.File;
    }

    private Expr ParsePrimary()
    {
        if (Peek().Type == TokenType.NumberValue)
            return new LiteralExpr { Value = long.Parse(Consume(TokenType.NumberValue).Text, CultureInfo.InvariantCulture) };
        if (Peek().Type == TokenType.DecimalValue)
            return new LiteralExpr { Value = double.Parse(Consume(TokenType.DecimalValue).Text, CultureInfo.InvariantCulture) };
        if (Peek().Type == TokenType.StringValue)
            return new LiteralExpr { Value = Consume(TokenType.StringValue).Text };
        if (Peek().Type == TokenType.True)
        {
            Consume(TokenType.True);
            return new LiteralExpr { Value = true };
        }
        if (Peek().Type == TokenType.False)
        {
            Consume(TokenType.False);
            return new LiteralExpr { Value = false };
        }
        if (Peek().Type == TokenType.Get)
        {
            Consume(TokenType.Get);
            return new GetExpr();
        }
        if (Peek().Type == TokenType.File)
        {
            Consume(TokenType.File);
            Consume(TokenType.Read);
            Expr fileName = ParseExpr();
            return new FileReadExpr { FileName = fileName };
        }
        if (Peek().Type == TokenType.Array)
        {
            Consume(TokenType.Array);
            if (Peek().Type == TokenType.Get) {
                Consume(TokenType.Get);
                string arrName = Consume(TokenType.Identifier).Text;
                if (Peek().Type == TokenType.Comma) Consume(TokenType.Comma);
                Expr index = ParseExpr();
                return new ArrayGetExpr { ArrayName = arrName, Index = index };
            }
            if (Peek().Type == TokenType.Identifier && Peek().Text == "length") {
                Consume(TokenType.Identifier);
                string arrName = Consume(TokenType.Identifier).Text;
                return new ArrayLengthExpr { ArrayName = arrName };
            }
            throw new Exception("Invalid array expression.");
        }
        if (Peek().Type == TokenType.Dictionary)
        {
            Consume(TokenType.Dictionary);
            if (Peek().Type == TokenType.Get) {
                Consume(TokenType.Get);
                bool isKey = false;
                if (Peek().Type == TokenType.Identifier && Peek().Text == "key") { Consume(TokenType.Identifier); isKey = true; }
                else if (Peek().Type == TokenType.Identifier && Peek().Text == "index") { Consume(TokenType.Identifier); isKey = false; }
                else throw new Exception("Expected 'key' or 'index' after 'dictionary get'.");
                
                string dictName = Consume(TokenType.Identifier).Text;
                if (Peek().Type == TokenType.Comma) Consume(TokenType.Comma);
                Expr keyOrIndex = ParseExpr();
                return new DictGetExpr { DictName = dictName, KeyOrIndex = keyOrIndex, IsKey = isKey };
            }
            if (Peek().Type == TokenType.Identifier && Peek().Text == "length") {
                Consume(TokenType.Identifier);
                string dictName = Consume(TokenType.Identifier).Text;
                return new DictLengthExpr { DictName = dictName };
            }
            throw new Exception("Invalid dictionary expression.");
        }

        if (Peek().Type == TokenType.Identifier)
        {
            string name = Consume(TokenType.Identifier).Text;

            if (IsExprStart(Peek().Type))
            {
                List<Expr> args = new List<Expr>();
                args.Add(ParseExpr());
                while (Peek().Type == TokenType.Comma)
                {
                    Consume(TokenType.Comma);
                    args.Add(ParseExpr());
                }
                return new CallExpr { Name = name, Args = args };
            }

            return new VarExpr { Name = name };
        }
        throw new Exception($"Parse Error: Unexpected token {Peek().Type} at '{Peek().Text}'");
    }
}

class ReturnException : Exception { public object Value { get; } public ReturnException(object val) { Value = val; } }
class BreakException : Exception { }

class Environment
{
    private readonly Dictionary<string, object> _vars = new Dictionary<string, object>();
    private readonly Environment _parent;

    public Environment(Environment parent = null) { _parent = parent; }

    public void Define(string name, object value) { _vars[name] = value; }

    public void Set(string name, object value) {
        Environment target = FindEnvironment(name);
        if (target != null) {
            target._vars[name] = value;
        } else {
            _vars[name] = value;
        }
    }

    private Environment FindEnvironment(string name) {
        if (_vars.ContainsKey(name)) return this;
        if (_parent != null) return _parent.FindEnvironment(name);
        return null;
    }

    public object Get(string name)
    {
        Environment target = FindEnvironment(name);
        if (target != null) return target._vars[name];
        throw new Exception($"Runtime Error: Variable '{name}' not found.");
    }
}

class Evaluator
{
    public Environment GlobalEnv = new Environment();

    public void Execute(ProgramNode program)
    {
        try { foreach (var stmt in program.Statements) ExecuteStmt(stmt, GlobalEnv); }
        catch (ReturnException) { }
        catch (BreakException) { }
    }

    private object CastToType(object val, TokenType targetType)
    {
        if (targetType == TokenType.NumberType) return Convert.ToInt64(val);
        if (targetType == TokenType.DecimalType) return Convert.ToDouble(val);
        if (targetType == TokenType.BooleanType) return Convert.ToBoolean(val);
        if (targetType == TokenType.StringType) return Convert.ToString(val);
        return val;
    }

    private void ExecuteStmt(Stmt stmt, Environment env)
    {
        if (stmt is VarStmt varStmt) {
            object val = EvaluateExpr(varStmt.Value, env);
            if (varStmt.Type.HasValue) val = CastToType(val, varStmt.Type.Value);
            env.Define(varStmt.Name, val);
        }
        else if (stmt is SayStmt sayStmt) Console.WriteLine(EvaluateExpr(sayStmt.Value, env));
        else if (stmt is OutStmt outStmt) {
            if (outStmt.Value != null) throw new ReturnException(EvaluateExpr(outStmt.Value, env));
            else throw new BreakException();
        }
        else if (stmt is IncDecStmt incDec) {
            object current = env.Get(incDec.Name);
            object amt = EvaluateExpr(incDec.Amount, env);
            double c = Convert.ToDouble(current);
            double a = Convert.ToDouble(amt);
            double result = incDec.IsIncrement ? c + a : c - a;
            
            if (current is long) env.Set(incDec.Name, (long)result);
            else env.Set(incDec.Name, result);
        }
        else if (stmt is IfStmt ifStmt) {
            bool cond = Convert.ToBoolean(EvaluateExpr(ifStmt.Condition, env));
            if (cond) {
                foreach (var s in ifStmt.TrueBody) ExecuteStmt(s, env);
            } else {
                foreach (var s in ifStmt.FalseBody) ExecuteStmt(s, env);
            }
        }
        else if (stmt is RepeatStmt repStmt) {
            if (repStmt.IsForever) {
                while (true) {
                    try {
                        foreach (var s in repStmt.Body) ExecuteStmt(s, env);
                    }
                    catch (BreakException) { break; }
                }
            } else {
                long count = Convert.ToInt64(EvaluateExpr(repStmt.Count, env));
                for (long i = 0; i < count; i++) {
                    try {
                        foreach (var s in repStmt.Body) ExecuteStmt(s, env);
                    }
                    catch (BreakException) { break; }
                }
            }
        }
        else if (stmt is ArrayDeclStmt arrStmt) {
            var list = new List<object>();
            foreach (var el in arrStmt.Elements) {
                list.Add(CastToType(EvaluateExpr(el, env), arrStmt.Type));
            }
            env.Define(arrStmt.Name, list);
        }
        else if (stmt is ArraySetStmt arrSet) {
            object arrObj = env.Get(arrSet.ArrayName);
            if (arrObj is List<object> list) {
                int index = Convert.ToInt32(EvaluateExpr(arrSet.Index, env));
                object val = EvaluateExpr(arrSet.Value, env);
                if (index >= 0 && index < list.Count) {
                    list[index] = val;
                } else {
                    throw new Exception($"Runtime Error: Index {index} out of bounds for array '{arrSet.ArrayName}'.");
                }
            } else {
                throw new Exception($"Runtime Error: '{arrSet.ArrayName}' is not an array.");
            }
        }
        else if (stmt is DictDeclStmt dictStmt) {
            var dict = new List<KeyValuePair<string, object>>();
            foreach (var pair in dictStmt.Pairs) {
                dict.Add(new KeyValuePair<string, object>(pair.Item1, EvaluateExpr(pair.Item2, env)));
            }
            env.Define(dictStmt.Name, dict);
        }
        else if (stmt is DictSetStmt dictSet) {
            object dictObj = env.Get(dictSet.DictName);
            if (dictObj is List<KeyValuePair<string, object>> dict) {
                object val = EvaluateExpr(dictSet.Value, env);
                if (dictSet.IsKey) {
                    string key = Convert.ToString(EvaluateExpr(dictSet.KeyOrIndex, env));
                    int foundIndex = -1;
                    for (int i = 0; i < dict.Count; i++) {
                        if (dict[i].Key == key) { foundIndex = i; break; }
                    }
                    if (foundIndex != -1) {
                        dict[foundIndex] = new KeyValuePair<string, object>(key, val);
                    } else {
                        dict.Add(new KeyValuePair<string, object>(key, val));
                    }
                } else {
                    int index = Convert.ToInt32(EvaluateExpr(dictSet.KeyOrIndex, env));
                    if (index >= 0 && index < dict.Count) {
                        string key = dict[index].Key;
                        dict[index] = new KeyValuePair<string, object>(key, val);
                    } else {
                        throw new Exception($"Runtime Error: Index {index} out of bounds for dictionary '{dictSet.DictName}'.");
                    }
                }
            } else {
                throw new Exception($"Runtime Error: '{dictSet.DictName}' is not a dictionary.");
            }
        }
        else if (stmt is FileCreateStmt fileCreate) {
            string fileName = Convert.ToString(EvaluateExpr(fileCreate.FileName, env));
            string content = Convert.ToString(EvaluateExpr(fileCreate.Content, env));
            File.WriteAllText(fileName, content);
        }
        else if (stmt is FileUpdateStmt fileUpdate) {
            string fileName = Convert.ToString(EvaluateExpr(fileUpdate.FileName, env));
            string content = Convert.ToString(EvaluateExpr(fileUpdate.Content, env));
            File.AppendAllText(fileName, content);
        }
        else if (stmt is FileDeleteStmt fileDelete) {
            string fileName = Convert.ToString(EvaluateExpr(fileDelete.FileName, env));
            if (File.Exists(fileName)) {
                File.Delete(fileName);
            } else {
                throw new Exception($"Runtime Error: File '{fileName}' not found to delete.");
            }
        }
        else if (stmt is JobStmt jobStmt) env.Define(jobStmt.Name, jobStmt);
        else if (stmt is ExprStmt exprStmt) EvaluateExpr(exprStmt.Expression, env);
    }

    private object EvaluateExpr(Expr expr, Environment env)
    {
        if (expr is LiteralExpr lit) return lit.Value;
        if (expr is VarExpr varExpr)
        {
            object val = env.Get(varExpr.Name);
            if (val is JobStmt job)
            {
                Environment localEnv = new Environment(env);
                try { foreach (var stmt in job.Body) ExecuteStmt(stmt, localEnv); }
                catch (ReturnException ret) { return ret.Value; }
                catch (BreakException) { return null; }
                return null;
            }
            return val;
        }
        if (expr is GetExpr)
        {
            string input = Console.ReadLine() ?? "";
            if (long.TryParse(input, out long l)) return l;
            if (double.TryParse(input, NumberStyles.Any, CultureInfo.InvariantCulture, out double d)) return d;
            if (bool.TryParse(input, out bool b)) return b;
            return input;
        }
        if (expr is FileReadExpr fileRead) 
        {
            string fileName = Convert.ToString(EvaluateExpr(fileRead.FileName, env));
            if (File.Exists(fileName)) {
                return File.ReadAllText(fileName);
            } else {
                throw new Exception($"Runtime Error: File '{fileName}' not found to read.");
            }
        }
        if (expr is ArrayGetExpr arrGet) {
            object arrObj = env.Get(arrGet.ArrayName);
            if (arrObj is List<object> list) {
                int index = Convert.ToInt32(EvaluateExpr(arrGet.Index, env));
                return list[index];
            }
            throw new Exception($"Runtime Error: '{arrGet.ArrayName}' is not an array.");
        }
        if (expr is ArrayLengthExpr arrLen) {
            object arrObj = env.Get(arrLen.ArrayName);
            if (arrObj is List<object> list) return (long)list.Count;
            throw new Exception($"Runtime Error: '{arrLen.ArrayName}' is not an array.");
        }
        if (expr is DictGetExpr dictGet) {
            object dictObj = env.Get(dictGet.DictName);
            if (dictObj is List<KeyValuePair<string, object>> dict) {
                if (dictGet.IsKey) {
                    string key = Convert.ToString(EvaluateExpr(dictGet.KeyOrIndex, env));
                    foreach (var kvp in dict) {
                        if (kvp.Key == key) return kvp.Value;
                    }
                    throw new Exception($"Runtime Error: Key '{key}' not found in dictionary '{dictGet.DictName}'.");
                } else {
                    int index = Convert.ToInt32(EvaluateExpr(dictGet.KeyOrIndex, env));
                    return dict[index].Value;
                }
            }
            throw new Exception($"Runtime Error: '{dictGet.DictName}' is not a dictionary.");
        }
        if (expr is DictLengthExpr dictLen) {
            object dictObj = env.Get(dictLen.DictName);
            if (dictObj is List<KeyValuePair<string, object>> dict) return (long)dict.Count;
            throw new Exception($"Runtime Error: '{dictLen.DictName}' is not a dictionary.");
        }
        if (expr is BinaryExpr bin)
        {
            object left = EvaluateExpr(bin.Left, env);
            object right = EvaluateExpr(bin.Right, env);

            if (bin.Op == TokenType.Equal) return Equals(left, right);
            if (bin.Op == TokenType.NotEqual) return !Equals(left, right);

            if (left is bool || right is bool) {
                if (bin.Op == TokenType.Plus && (left is string || right is string)) return left.ToString() + right.ToString();
                throw new Exception("Runtime Error: Invalid binary operation with booleans.");
            }

            if (left is IConvertible && right is IConvertible) {
                try {
                    double l = Convert.ToDouble(left, CultureInfo.InvariantCulture);
                    double r = Convert.ToDouble(right, CultureInfo.InvariantCulture);
                    return bin.Op switch {
                        TokenType.Plus => left is long && right is long ? (object)((long)left + (long)right) : l + r,
                        TokenType.Minus => left is long && right is long ? (object)((long)left - (long)right) : l - r,
                        TokenType.Multiply => left is long && right is long ? (object)((long)left * (long)right) : l * r,
                        TokenType.Divide => l / r,
                        TokenType.Modulo => left is long && right is long ? (object)((long)left % (long)right) : l % r,
                        TokenType.Greater => l > r,
                        TokenType.Less => l < r,
                        TokenType.GreaterEqual => l >= r,
                        TokenType.LessEqual => l <= r,
                        _ => throw new Exception($"Unknown operator {bin.Op}")
                    };
                } catch { }
            }
            if (bin.Op == TokenType.Plus) return left.ToString() + right.ToString();
            throw new Exception("Runtime Error: Invalid binary operation on mixed types.");
        }
        if (expr is CallExpr call)
        {
            object func = env.Get(call.Name);
            if (func is JobStmt job)
            {
                Environment localEnv = new Environment(env);
                for (int i = 0; i < job.Params.Count; i++)
                {
                    object argVal = i < call.Args.Count ? EvaluateExpr(call.Args[i], env) : null;
                    localEnv.Define(job.Params[i], argVal);
                }
                try { foreach (var stmt in job.Body) ExecuteStmt(stmt, localEnv); }
                catch (ReturnException ret) { return ret.Value; }
                catch (BreakException) { return null; }
                return null;
            }
            throw new Exception($"Runtime Error: '{call.Name}' is not a function.");
        }
        throw new Exception("Runtime Error: Unknown expression.");
    }
}

internal class Program
{
    private static void Main(string[] args)
    {
        if (args.Length != 1)
        {
            Console.WriteLine("Usage: chease-v1.3.0.exe filename.chease");
            return;
        }

        try
        {
            string code = File.ReadAllText(args[0]);
            var tokens = new Lexer(code).Tokenize();
            var ast = new Parser(tokens).Parse();
            new Evaluator().Execute(ast);
        }
        catch (Exception ex)
        {
            Console.WriteLine(ex.Message);
        }
    }
}