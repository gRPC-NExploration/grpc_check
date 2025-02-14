using System.Collections.Concurrent;

using App.Models;

namespace App.Services.Contracts;

public interface IFileStore
{
    public ConcurrentDictionary<string, FileWrapper> FilesByName { get; }
}
