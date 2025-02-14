using System.Runtime.CompilerServices;

using Domain.ValueObjects;

namespace Domain.Entities;

public class File
{
    private const int ChunkSize = 1024 * 32;

    private bool _hasContent = false;
    private int? _currentChunk;
    private FileStream? _fileStream;

    public FileMetadata Metadata { get; }

    public bool Intact => _hasContent && _currentChunk is null;

    private File(FileMetadata metadata)
    {
        Metadata = metadata;
    }

    public async Task SaveChunk(byte[] data, bool isFinal = true, CancellationToken cancellationToken = default)
    {
        if (_currentChunk is null && isFinal)
        {
            await Save(data, cancellationToken);
            return;
        }

        _currentChunk ??= 1;
        _fileStream ??= new System.IO.FileStream(Metadata.FilePath, FileMode.Create, FileAccess.Write, FileShare.None, ChunkSize, true);

        await _fileStream.WriteAsync(data, cancellationToken);
        _currentChunk++;

        if (isFinal)
        {
            await _fileStream.DisposeAsync();
            _fileStream = null;
            _currentChunk = null;
        }
    }

    public async Task Save(byte[] data, CancellationToken cancellationToken)
    {
        await System.IO.File.WriteAllBytesAsync(Metadata.FilePath, data, cancellationToken);
        _hasContent = true;
    }

    public async IAsyncEnumerable<byte[]> ReadChunked([EnumeratorCancellation] CancellationToken cancellationToken)
    {
        if (!Intact)
        {
            throw new InvalidOperationException("File was malformed.");
        }

        var buffer = new byte[ChunkSize];

        await using var fileStream = System.IO.File.OpenRead(Metadata.FilePath);
        _currentChunk ??= 1;

        while(true)
        {
            var numBytesRead = await fileStream.ReadAsync(buffer, cancellationToken);

            if (numBytesRead == 0)
            {
                throw new IOException($"File {Metadata} was empty.");
            }

            yield return buffer;
        }
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
}
