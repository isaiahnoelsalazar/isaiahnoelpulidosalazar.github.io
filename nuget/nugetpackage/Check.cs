using System.Collections;
using System.Text.RegularExpressions;

namespace nugetpackage;

public class Check
{
    public static class Email
    {
        static ArrayList validDomainNames = new ArrayList();
        static ArrayList validDomainExtensions = new ArrayList();
        static ArrayList validDomains = new ArrayList();
        static bool shouldUseFullDomain = false;
        public static void AddValidDomainName(string str)
        {
            validDomainNames.Add(str);
        }
        public static void AddValidDomainExtension(string str)
        {
            validDomainExtensions.Add(str);
        }
        public static void AddValidDomain(string str)
        {
            validDomains.Add(str);
        }
        public static void ShouldUseFullDomain()
        {
            shouldUseFullDomain = true;
        }
        public static void ShouldUseFullDomain(bool boolean)
        {
            shouldUseFullDomain = boolean;
        }
        public static bool IsValid(string str)
        {
            if (shouldUseFullDomain)
            {
                try
                {
                    string[] domain = str.Split('@');
                    return validDomains.Contains(domain[1]);
                }
                catch
                {
                    return false;
                }
            } else
            {
                try
                {
                    string[] domain = str.Split('@');
                    string domainName = domain[1].Split('.')[0];
                    string domainExtension = domain[1].Split('.')[1];
                    return validDomainNames.Contains(domainName) && validDomainExtensions.Contains(domainExtension);
                }
                catch
                {
                    return false;
                }
            }
        }
    }
    public static bool IsAValidPhilippineMobileNumber(string str)
    {
        string pattern = @"^(?:09|\+639|639)\d{9}$";
        return Regex.IsMatch(Regex.Replace(str, @"[\s\-\(\)]", ""), pattern);
    }
    public static bool IsAllNumbers(string str)
    {
        bool value = true;
        string numbers = "0123456789";
        foreach (char a in str)
        {
            if (!numbers.Contains(a))
            {
                value = false;
            }
        }
        return value;
    }
    public static bool HasNumbers(string str)
    {
        string numbers = "0123456789";
        foreach (char a in str)
        {
            foreach (char b in numbers)
            {
                if (a == b)
                {
                    return true;
                }
            }
        }
        return false;
    }
    public static bool HasSymbols(string str)
    {
        string symbols = "~`!@#$%^&*()_+-=[]{}\\|'\";:,.<>/?";
        foreach (char a in str)
        {
            foreach (char b in symbols)
            {
                if (a == b)
                {
                    return true;
                }
            }
        }
        return false;
    }
    public static bool HasSpaces(string str)
    {
        foreach (char a in str)
        {
            if (a == ' ')
            {
                return true;
            }
        }
        return false;
    }
}
