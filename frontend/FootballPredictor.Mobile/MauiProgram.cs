using FootballPredictor.Mobile.Services;
using FootballPredictor.Mobile.ViewModels;
using FootballPredictor.Mobile.Views.User;
using Microsoft.Extensions.Logging;

namespace FootballPredictor.Mobile;

public static class MauiProgram
{
    public static MauiApp CreateMauiApp()
    {
        var builder = MauiApp.CreateBuilder();
        builder
            .UseMauiApp<App>();

        builder.Services.AddHttpClient<IBackendHealthClient, BackendHealthClient>(client =>
        {
            client.BaseAddress = new Uri("http://10.0.2.2:8080");
        });
        builder.Services.AddTransient<HomeViewModel>();
        builder.Services.AddTransient<HomePage>();
        builder.Services.AddTransient<MatchDetailPage>();

#if DEBUG
        builder.Logging.AddDebug();
#endif

        return builder.Build();
    }
}
