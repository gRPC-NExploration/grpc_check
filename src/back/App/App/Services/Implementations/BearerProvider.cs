using App.Defaults;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

using App.Services.Contracts;

using Microsoft.IdentityModel.Tokens;

namespace App.Services.Implementations;

public class BearerProvider : IBearerProvider
{
    public string Provide(string name)
    {
        if (string.IsNullOrEmpty(name))
            throw new InvalidOperationException("Name is not specified.");

        var claims = new[] { new Claim(ClaimTypes.Name, name) };
        var credentials = new SigningCredentials(JwtShared.SecurityKey, SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken("ExampleServer", "ExampleClients", claims, expires: DateTime.Now.AddSeconds(360), signingCredentials: credentials);
        return JwtShared.JwtTokenHandler.WriteToken(token);
    }
}
