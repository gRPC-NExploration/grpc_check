namespace App.Models;

public class FileWrapper
{
    public Domain.Entities.File File { get; init; } = null!;

    public override bool Equals(object? obj)
    {
        if (obj == null)
            return false;

        if (obj is FileWrapper parameter)
            return File.Metadata.Equals(parameter.File.Metadata);

        return false;
    }

    public override int GetHashCode()
    {
        return File.Metadata.GetHashCode();
    }
}
