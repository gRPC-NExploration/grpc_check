using System.Collections.Concurrent;
using App.Models;
using App.Services.Contracts;

namespace App.Services.Implementations;

public class FileStore : IFileStore
{
    private readonly ConcurrentDictionary<string, FileWrapper> _filesByName = [];

    public IReadOnlyDictionary<string, FileWrapper> FilesByName => _filesByName;

    public void AddFile(string name, FileWrapper file)
    {
        _filesByName[name] = file;

        _ = ScheduleDeletion(name, file);
    }

    public void ClearFiles()
    {
        foreach (var file in _filesByName.Values.Select(x => x.File))
        {
            file.Delete();
        }

        _filesByName.Clear();
    }

    private async Task ScheduleDeletion(string name, FileWrapper file)
    {
        await Task.Delay(TimeSpan.FromMinutes(10));

        if (_filesByName.TryGetValue(name, out var current) 
            && current == file && !file.File.Intact)
        {
            _filesByName.TryRemove(name, out _);
            file.File.Delete();
        }
    }
}
