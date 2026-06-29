from django.urls import path
from .views import WithdrawView, TransferView, AccountListView

urlpatterns = [
    path('list/', AccountListView.as_view(), name='list'),
    path('withdraw/', WithdrawView.as_view(), name='withdraw'),
    path('transfer/', TransferView.as_view(), name='transfer')
]