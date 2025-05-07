using Domain.ValueObjects;
using System.Runtime.CompilerServices;

namespace Domain.Entities;

public class File
{
    private bool _hasContent = false;
    private int? _currentChunk;
    private FileStream? _fileStream;

    public FileMetadata Metadata { get; }

    public bool Intact => _hasContent && _currentChunk is null;

    public long Size => new System.IO.FileInfo(Metadata.FilePath).Length;

    private File(FileMetadata metadata)
    {
        Metadata = metadata;
    }

    public async Task SaveChunk(byte[] data, bool isFinal, CancellationToken cancellationToken)
    {
        if (Intact)
        {
            throw new InvalidOperationException("File already exists.");
        }

        if (_currentChunk is null && isFinal)
        {
            await Save(data, cancellationToken);
            return;
        }

        if (data.Length is not 0)
        {
            _hasContent = true;
            _currentChunk ??= 1;
            _fileStream ??= new System.IO.FileStream(Metadata.FilePath, FileMode.Create, FileAccess.Write, FileShare.None, data.Length, true);

            await _fileStream.WriteAsync(data, cancellationToken);
            _currentChunk++;
        }

        if (isFinal)
        {
            await _fileStream!.DisposeAsync();
            _fileStream = null;
            _currentChunk = null;
        }
    }

    public async Task Save(byte[] data, CancellationToken cancellationToken)
    {
        await System.IO.File.WriteAllBytesAsync(Metadata.FilePath, data, cancellationToken);
        _hasContent = true;
    }

    public IAsyncEnumerable<byte[]> ReadChunked(int chunkSize, CancellationToken cancellationToken)
    {
        if (chunkSize < 1024)
        {
            throw new ArgumentException("Chunk size was too small. Minimal size is 1024 bytes", nameof(chunkSize));
        }

        return ReadChunkedEnumerator(chunkSize, cancellationToken);
    }

    public void Delete()
    {
        System.IO.File.Delete(Metadata.FilePath);
        _hasContent = false;
    }

    public static File Create(FileMetadata metadata)
    {
        return new File(metadata);
    }

    private async IAsyncEnumerable<byte[]> ReadChunkedEnumerator(int chunkSize, [EnumeratorCancellation] CancellationToken cancellationToken)
    {
        if (!Intact)
        {
            throw new InvalidOperationException("File was malformed.");
        }

        var buffer = new byte[chunkSize];

        await using var fileStream = System.IO.File.OpenRead(Metadata.FilePath);

        while (true)
        {
            var numBytesRead = await fileStream.ReadAsync(buffer, cancellationToken);

            if (numBytesRead == 0)
            {
                break;
            }

            yield return buffer;
        }
    }
}
