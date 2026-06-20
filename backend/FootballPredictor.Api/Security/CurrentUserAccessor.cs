using System.Security.Claims;

namespace FootballPredictor.Api.Security;

internal interface ICurrentUserAccessor
{
    CurrentUser GetCurrentUser();
}

internal sealed class CurrentUserAccessor(IHttpContextAccessor httpContextAccessor) : ICurrentUserAccessor
{
    public CurrentUser GetCurrentUser()
    {
        var user = httpContextAccessor.HttpContext?.User;
        if (user?.Identity?.IsAuthenticated != true)
        {
            return CurrentUser.Anonymous;
        }

        var subject = user.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? user.FindFirstValue("sub")
            ?? "unknown";
        var role = user.FindFirstValue(ClaimTypes.Role)
            ?? user.FindFirstValue("role")
            ?? "user";

        return new CurrentUser(subject, role, IsAuthenticated: true);
    }
}

internal sealed record CurrentUser(string Subject, string Role, bool IsAuthenticated)
{
    public static CurrentUser Anonymous { get; } = new("anonymous", "anonymous", IsAuthenticated: false);
}
