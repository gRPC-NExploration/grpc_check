using Domain.Entities;

namespace App.Services.Contracts;

public interface IChatProvider
{
    public Chat Provide(string chatName, string currentUserName);
}
