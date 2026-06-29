from django.urls import path
from .views import WithdrawView, TransferView 

urlpatterns = [
    path('withdraw/', WithdrawView.as_view(), name='withdraw'),
    path('transfer/', TransferView.as_view(), name='transfer')
]