using System.Collections.Concurrent;

using App.Services.Contracts;

namespace App.Services.Implementations;

public class FilePathStore : IFilePathStore
{
    public ConcurrentDictionary<string, string> PathByFileName { get; } = [];
}
