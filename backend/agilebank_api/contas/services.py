from decimal import Decimal
from django.core.exceptions import ValidationError
from django.db import transaction
from .models import Account
from .dtos import WithdrawDTO, TransferDTO

class AccountService:
    # saque
    @staticmethod
    def withdraw(dto: WithdrawDTO) -> Account:
        amount = dto.amount
        account_number = dto.account_number
        
        # 1a etapa da validação: saque deve ser maior que 0
        if amount <= 0:
            raise ValidationError("Withdraw amount must be greater than zero")
        
        # 2a etapa da validação: conta deve existir
        try:
            account = Account.objects.get(account_number=account_number)
        except Account.DoesNotExist:
            raise ValidationError("Account not found.")

        # daqui pra frente depende da conta
        total_deduction = AccountService._calculate_deduction(account, dto.amount)
        
        # se passou das validação, debita e salva
        account.balance -= total_deduction
        account.save()

        return account

    # transferência
    @staticmethod
    @transaction.atomic # protege o banco: ou salva as duas contas ou desfaz
    def transfer(dto: TransferDTO) -> dict:
        if dto.amount <= 0:
            raise ValidationError("Amount must be greather than zero")

        if dto.source_account_number == dto.destination_account_number:
            raise ValidationError("Source and destination accounts must be different")

        # tenta encontrar a conta origem
        try:
            source_account = Account.objects.get(account_number=dto.source_account_number)
        except Account.DoesNotExist:
            raise ValidationError("Source account not found")

        # tenta encontrar a conta destino
        try:
            destination_account = Account.objects.get(account_number=dto.destination_account_number)
        except Account.DoesNotExist:
            raise ValidationError("Destination account not found")

        # calcula quanto sai
        total_deduction = AccountService._calculate_deduction(source_account, dto.amount)

        # efetiva a transação
        source_account.balance -= total_deduction
        destination_account.balance += dto.amount

        source_account.save()
        destination_account.save()

        return {
            "source_balance": source_account.balance,
            "destination_balance": destination_account.balance
        }

    # método privado auxiliar
    def _calculate_deduction(account: Account, amount: Decimal):
        if account.account_type == 'CC':
            fee = Decimal('1.00')
            total_deduction = amount + fee

            # se a subtração do total com a dedução der menos que -500.00, rejeita
            if account.balance - total_deduction  < Decimal('-500.00'):
                raise ValidationError("Insuficient balance (overdraft limit exceeded)")
        elif account.account_type == 'CP':
            total_deduction = amount

            # poupança não pode ficar negativa
            if account.balance - total_deduction < Decimal('0.00'):
                raise ValidationError("Insuficient balance")
        return total_deduction