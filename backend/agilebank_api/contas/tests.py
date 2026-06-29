from decimal import Decimal
from django.test import TestCase
from django.core.exceptions import ValidationError
from .models import Account
from .services import AccountService
from .dtos import WithdrawDTO, TransferDTO

class AccountServiceTest(TestCase):
    def setUp(self):
        # cria as contas de teste no banco de dados isolado de testes
        self.conta_corrente = Account.objects.create(
            account_number="111-CC",
            account_type="CC",
            balance=Decimal('100.00')
        )
        self.conta_poupanca = Account.objects.create(
            account_number="222-CP",
            account_type="CP",
            balance=Decimal('100.00')
        )

    def test_saque_conta_corrente_cobra_taxa(self):
        dto = WithdrawDTO(account_number="111-CC", amount=Decimal('50.00'))
        conta_atualizada = AccountService.withdraw(dto)
        
        # 100 - 50 (saque) - 1 (taxa) = 49.00
        self.assertEqual(conta_atualizada.balance, Decimal('49.00'))

    def test_saque_conta_poupanca_nao_cobra_taxa(self):
        dto = WithdrawDTO(account_number="222-CP", amount=Decimal('50.00'))
        conta_atualizada = AccountService.withdraw(dto)
        
        # 100 - 50 (saque) = 50.00
        self.assertEqual(conta_atualizada.balance, Decimal('50.00'))

    def test_saque_conta_corrente_limite_cheque_especial(self):
        # tenta sacar 600.00. 100 - 600 - 1 = -501.00 (ultrapassa o limite de -500.00)
        dto = WithdrawDTO(account_number="111-CC", amount=Decimal('600.00'))
        with self.assertRaisesMessage(ValidationError, "Insuficient balance"):
            AccountService.withdraw(dto)

    def test_saque_conta_poupanca_limite_zero(self):
        # tenta sacar 101.00. 100 - 101 = -1.00 (poupança não aceita saldo negativo)
        dto = WithdrawDTO(account_number="222-CP", amount=Decimal('101.00'))
        with self.assertRaisesMessage(ValidationError, "Insuficient balance"):
            AccountService.withdraw(dto)

    def test_transferencia_sucesso(self):
        dto = TransferDTO(
            source_account_number="111-CC",
            destination_account_number="222-CP",
            amount=Decimal('50.00')
        )
        resultado = AccountService.transfer(dto)
        
        # CC: 100 - 50 - 1 (taxa) = 49.00
        self.assertEqual(resultado['source_balance'], Decimal('49.00'))
        # CP: 100 + 50 = 150.00
        self.assertEqual(resultado['destination_balance'], Decimal('150.00'))
