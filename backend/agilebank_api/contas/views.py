from django.shortcuts import render
from decimal import Decimal, InvalidOperation
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.core.exceptions import ValidationError
from .services import AccountService
from .dtos import WithdrawDTO, TransferDTO

# view (controller) do saque
class WithdrawView(APIView):
    def post(self, request):
        # 1. pega os dados vindos do frontend
        try:
            dto = WithdrawDTO(
                account_number=request.data.get('account_number'),
                amount=Decimal(str(request.data.get('amount', 0)))
            )
            # 2. deve ter o número da conta
            if not dto.account_number:
                return Response({"error": "'account_number' is required."}, status=status.HTTP_400_BAD_REQUEST)

            # 3. chama o service
            account = AccountService.withdraw(dto)

            return Response({
                "message": "Withdrawal successful",
                "new_balance": str(account.balance)
            }, status=status.HTTP_200_OK)

        # caso não dê pra converter o amount
        except InvalidOperation:
            return Response({"error": "Invalid amount format."}, status=status.HTTP_400_BAD_REQUEST)
        # erro dentro do service
        except ValidationError as e:
            return Response({"error": e.messages[0]}, status=status.HTTP_400_BAD_REQUEST)

# view (controller) da transferência
class TransferView(APIView):
    def post(self, request):
        try:
            dto = TransferDTO(
                source_account_number=request.data.get('source_account_number'),
                destination_account_number=request.data.get('destination_account_number'),
                amount=Decimal(str(request.data.get('amount', 0)))
            )

            # tanto a origem quanto o destino devem ser informados
            if not dto.source_account_number or not dto.destination_account_number:
                return Response({"error": "Both source and destination accounts are required"}, status=status.HTTP_400_BAD_REQUEST)

            result = AccountService.transfer(dto)

            return Response({
                "message": "Transfer successful",
                "source_balance": str(result["source_balance"]),
                "destination_balance": str(result["destination_balance"])
            }, status=status.HTTP_200_OK)

        except InvalidOperation:
            return Response({"error": "Invalid amount format."}, status=status.HTTP_400_BAD_REQUEST)
        except ValidationError as e:
            return Response({"error": e.messages[0]}, status=status.HTTP_400_BAD_REQUEST)