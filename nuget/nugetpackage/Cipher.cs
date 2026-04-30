namespace nugetpackage;

public class Cipher
{
    static string alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    public static string TranspositionCipher(string text)
    {
        text = text.Replace(" ", "");
        string temp = "";
        string temp1 = "";
        int counter = 0;
        while (counter < text.Length)
        {
            if (counter % 2 == 0)
                temp += text.ToUpper()[counter].ToString();
            else
                temp1 += text.ToUpper()[counter].ToString();
            counter++;
        }
        return temp + temp1;
    }
    public static string GiovanniCipher(string text, string keyword, string keyLetter)
    {
        string temp = "";
        string temp1 = "";
        string temp2 = "";
        string cipher = "";
        foreach (char c in keyword.ToUpper())
        {
            if (!temp.Contains(c.ToString()))
                temp += c;
        }
        temp1 = temp;
        foreach (char c in alphabet)
        {
            if (!temp1.Contains(c.ToString()))
                temp1 += c;
        }
        int keyIndex = alphabet.IndexOf(keyLetter.ToUpper());
        for (int a = temp1.Length - keyIndex; a < temp1.Length; a++)
            temp2 += temp1[a];
        for (int a = 0; a < temp1.Length - keyIndex; a++)
            temp2 += temp1[a];
        foreach (char c in text.ToUpper())
        {
            if (c == ' ')
                cipher += " ";
            else if (!alphabet.Contains(c.ToString()))
                cipher += c;
            else
            {
                int b = alphabet.IndexOf(c);
                cipher += temp2[b];
            }
        }
        return cipher;
    }
    public static string KeywordCipher(string text, string keyword)
    {
        string temp = "";
        string temp1 = "";
        string cipher = "";
        foreach (char c in keyword.ToUpper())
        {
            if (!temp.Contains(c.ToString()))
                temp += c;
        }
        temp1 = temp;
        foreach (char c in alphabet)
        {
            if (!temp1.Contains(c.ToString()))
                temp1 += c;
        }
        foreach (char c in text.ToUpper())
        {
            if (c == ' ')
                cipher += " ";
            else if (!alphabet.Contains(c.ToString()))
                cipher += c;
            else
            {
                int b = alphabet.IndexOf(c);
                cipher += temp1[b];
            }
        }
        return cipher;
    }
    public static string CaesarCipher(string text, int shift)
    {
        string temp = "";
        string cipher = "";
        for (int a = shift; a < alphabet.Length; a++)
            temp += alphabet[a];
        for (int a = 0; a < shift; a++)
            temp += alphabet[a];
        foreach (char c in text.ToUpper())
        {
            if (c == ' ')
                cipher += " ";
            else if (!alphabet.Contains(c.ToString()))
                cipher += c;
            else
            {
                int b = alphabet.IndexOf(c);
                cipher += temp[b];
            }
        }
        return cipher;
    }
}