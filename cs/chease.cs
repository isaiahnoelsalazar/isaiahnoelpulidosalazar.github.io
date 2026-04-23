using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;

// current version - 1.0.0

// changes:
// - no changes, rework release system

enum TokenType
{
    Var, Say, Get, Out, Job,
    Identifier, String, Number,
    Plus, Minus, Multiply, Divide, Modulo,
    LBracket, RBracket, Comma,
    EOF
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
                _pos++;
                tokens.Add(new Token(TokenType.String, str));
                continue;
            }

            if (char.IsDigit(c))
            {
                string num = "";
                while (_pos < _code.Length && (char.IsDigit(_code[_pos]) || _code[_pos] == '.')) { num += _code[_pos++]; }
                tokens.Add(new Token(TokenType.Number, num));
                continue;
            }

            if (char.IsLetter(c))
            {
                string id = "";
                while (_pos < _code.Length && char.IsLetterOrDigit(_code[_pos])) { id += _code[_pos++]; }

                tokens.Add(id switch
                {
                    "var" => new Token(TokenType.Var, id),
                    "say" => new Token(TokenType.Say, id),
                    "get" => new Token(TokenType.Get, id),
                    "out" => new Token(TokenType.Out, id),
                    "job" => new Token(TokenType.Job, id),
                    _ => new Token(TokenType.Identifier, id)
                });
                continue;
            }

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
class VarStmt : Stmt { public string Name; public Expr Value; }
class SayStmt : Stmt { public Expr Value; }
class OutStmt : Stmt { public Expr Value; }
class JobStmt : Stmt { public string Name; public List<string> Params; public List<Stmt> Body; }
class ExprStmt : Stmt { public Expr Expression; }

class BinaryExpr : Expr { public Expr Left; public TokenType Op; public Expr Right; }
class LiteralExpr : Expr { public object Value; }
class VarExpr : Expr { public string Name; }
class GetExpr : Expr { }
class CallExpr : Expr { public string Name; public List<Expr> Args; }

class Parser
{
    private readonly List<Token> _tokens;
    private int _pos;

    public Parser(List<Token> tokens) { _tokens = tokens; }

    private Token Peek() => _tokens[_pos];
    private Token Consume(TokenType type)
    {
        if (Peek().Type == type) return _tokens[_pos++];
        throw new Exception($"Parse Error: Expected {type} but got {Peek().Type} at '{Peek().Text}'");
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
            string name = Consume(TokenType.Identifier).Text;
            return new VarStmt { Name = name, Value = ParseExpr() };
        }
        if (Peek().Type == TokenType.Say)
        {
            Consume(TokenType.Say);
            return new SayStmt { Value = ParseExpr() };
        }
        if (Peek().Type == TokenType.Out)
        {
            Consume(TokenType.Out);
            return new OutStmt { Value = ParseExpr() };
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

    private Expr ParseExpr() => ParseAddition();

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
        return type == TokenType.Identifier || type == TokenType.Number ||
               type == TokenType.String || type == TokenType.Get;
    }

    private Expr ParsePrimary()
    {
        if (Peek().Type == TokenType.Number)
            return new LiteralExpr { Value = double.Parse(Consume(TokenType.Number).Text, CultureInfo.InvariantCulture) };
        if (Peek().Type == TokenType.String)
            return new LiteralExpr { Value = Consume(TokenType.String).Text };
        if (Peek().Type == TokenType.Get)
        {
            Consume(TokenType.Get);
            return new GetExpr();
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

class Environment
{
    private readonly Dictionary<string, object> _vars = new Dictionary<string, object>();
    private readonly Environment _parent;

    public Environment(Environment parent = null) { _parent = parent; }

    public void Set(string name, object value) { _vars[name] = value; }
    public object Get(string name)
    {
        if (_vars.ContainsKey(name)) return _vars[name];
        if (_parent != null) return _parent.Get(name);
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
    }

    private void ExecuteStmt(Stmt stmt, Environment env)
    {
        if (stmt is VarStmt varStmt) env.Set(varStmt.Name, EvaluateExpr(varStmt.Value, env));
        else if (stmt is SayStmt sayStmt) Console.WriteLine(EvaluateExpr(sayStmt.Value, env));
        else if (stmt is OutStmt outStmt) throw new ReturnException(EvaluateExpr(outStmt.Value, env));
        else if (stmt is JobStmt jobStmt) env.Set(jobStmt.Name, jobStmt);
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
                return null;
            }
            return val;
        }
        if (expr is GetExpr)
        {
            string input = Console.ReadLine() ?? "";
            if (double.TryParse(input, NumberStyles.Any, CultureInfo.InvariantCulture, out double d)) return d;
            return input;
        }
        if (expr is BinaryExpr bin)
        {
            object left = EvaluateExpr(bin.Left, env);
            object right = EvaluateExpr(bin.Right, env);

            if (left is double l && right is double r)
            {
                return bin.Op switch
                {
                    TokenType.Plus => l + r,
                    TokenType.Minus => l - r,
                    TokenType.Multiply => l * r,
                    TokenType.Divide => l / r,
                    TokenType.Modulo => l % r,
                    _ => throw new Exception("Invalid math operation")
                };
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
                    localEnv.Set(job.Params[i], argVal);
                }
                try { foreach (var stmt in job.Body) ExecuteStmt(stmt, localEnv); }
                catch (ReturnException ret) { return ret.Value; }
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
            Console.WriteLine("Usage: chease.exe filename.chease");
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
