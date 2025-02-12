namespace App.Services.Contracts;

public interface IBearerProvider
{
    public string Provide(string name);
}
