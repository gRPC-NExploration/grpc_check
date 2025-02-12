using System.Collections.Concurrent;

namespace App.Services.Contracts;

public interface IFilePathStore
{
    public ConcurrentDictionary<string, string> PathByFileName { get; }
}
