using System.IO;
using System.Reflection;
using System.Runtime.CompilerServices;

namespace nugetpackage;
public class SimpleFileHandler
{
    public static void Write(string FilePath, string Content)
    {
        File.WriteAllText(FilePath, Content);
    }
    public static string Read(string FilePath)
    {
        return File.ReadAllText(FilePath);
    }
    public static void Append(string FilePath, string Content)
    {
        File.AppendAllText(FilePath, Content);
    }
    [MethodImpl(MethodImplOptions.NoInlining)]
    public static void ProjectToLocation(Assembly ExecutingAssembly, string FileName)
    {
        try
        {
            if (!Path.GetDirectoryName(FileName).Equals(string.Empty) && !Directory.Exists(Path.GetDirectoryName(FileName)))
            {
                Directory.CreateDirectory(Path.GetDirectoryName(FileName));
            }
            FileStream ProjectFileStream = File.Create(FileName);
            ExecutingAssembly.GetManifestResourceStream(ExecutingAssembly.EntryPoint.DeclaringType.Namespace + "." + Path.GetFileName(FileName)).CopyTo(ProjectFileStream);
            ProjectFileStream.Close();
        }
        catch
        {
            Console.WriteLine("Cannot copy project file. Please make sure the file's build action is set to 'Embedded Resource'.");
        }
    }
    [MethodImpl(MethodImplOptions.NoInlining)]
    public static void ProjectToLocation(Assembly ExecutingAssembly, string FileName, string FilePath)
    {
        try
        {
            if (!Directory.Exists(FilePath))
            {
                Directory.CreateDirectory(FilePath);
            }
            FileStream ProjectFileStream = File.Create(Path.Combine(FilePath, Path.GetFileName(FileName)));
            ExecutingAssembly.GetManifestResourceStream(ExecutingAssembly.EntryPoint.DeclaringType.Namespace + "." + Path.GetFileName(FileName)).CopyTo(ProjectFileStream);
            ProjectFileStream.Close();
        }
        catch
        {
            Console.WriteLine("Cannot copy project file. Please make sure the file's build action is set to 'Embedded Resource'.");
        }
    }
}
