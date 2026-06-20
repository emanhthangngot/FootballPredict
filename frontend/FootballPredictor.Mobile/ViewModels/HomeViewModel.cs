using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using FootballPredictor.Mobile.Services;

namespace FootballPredictor.Mobile.ViewModels;

public partial class HomeViewModel(IBackendHealthClient healthClient) : ObservableObject
{
    [ObservableProperty]
    private string backendStatus = "checking";

    [ObservableProperty]
    private string featuredMatch = "Home FC vs Away FC";

    [ObservableProperty]
    private string primaryPrediction = "Home win probability 46%";

    [RelayCommand]
    private async Task RefreshAsync(CancellationToken cancellationToken)
    {
        var status = await healthClient.GetHealthAsync(cancellationToken);
        BackendStatus = status.Status;
    }
}
