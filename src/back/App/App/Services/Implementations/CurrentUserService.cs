using System.Security.Claims;

using App.Services.Contracts;

namespace App.Services.Implementations;

public class CurrentUserService(IHttpContextAccessor httpContextAccessor)
    : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor = httpContextAccessor;

    public string GetCurrentUserName()
    {
        var userName = _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.Name)?.Value;

        if (string.IsNullOrWhiteSpace(userName))
        {
            throw new InvalidOperationException("User name is invalid.");
        }

        return userName;
    }
}
