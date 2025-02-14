using System.Collections.Concurrent;

using App.Models;
using App.Services.Contracts;

namespace App.Services.Implementations;

public class FileStore : IFileStore
{
    public ConcurrentDictionary<string, FileWrapper> FilesByName { get; } = [];
}
