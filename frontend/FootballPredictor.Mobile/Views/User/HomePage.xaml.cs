using FootballPredictor.Mobile.ViewModels;

namespace FootballPredictor.Mobile.Views.User;

public partial class HomePage : ContentPage
{
    public HomePage(HomeViewModel viewModel)
    {
        InitializeComponent();
        BindingContext = viewModel;
    }
}
