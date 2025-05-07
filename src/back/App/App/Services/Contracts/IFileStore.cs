using App.Models;

namespace App.Services.Contracts;

public interface IFileStore
{
    IReadOnlyDictionary<string, FileWrapper> FilesByName { get; }

    void AddFile(string name, FileWrapper file);

    void ClearFiles();
}
