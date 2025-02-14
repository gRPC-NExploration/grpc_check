namespace Domain.ValueObjects;

public record FileMetadata
{
    public string FileName { get; }

    public string FilePath { get; }

    private FileMetadata(string fileName, string filePath)
    {
        FileName = fileName;
        FilePath = filePath;
    }

    public static FileMetadata Create(string fileName)
    {
        if (string.IsNullOrWhiteSpace(fileName))
            throw new ArgumentException("File name was empty.");

        var path = Path.Combine(Path.GetTempPath(), fileName);

        return new FileMetadata(fileName, path);
    }

    public static FileMetadata Create(string fileName, string filePath)
    {
        if (string.IsNullOrWhiteSpace(fileName))
            throw new ArgumentException("File name was empty.");

        if (string.IsNullOrWhiteSpace(filePath))
            throw new ArgumentException("File path was empty.");

        return new FileMetadata(fileName, filePath);
    }
}
