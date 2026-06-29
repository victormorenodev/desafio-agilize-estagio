from django.db import models

class Account(models.Model):
    ACCOUNT_TYPE_CHOICES = [
        ('CC', 'Conta Corrente'),
        ('CP', 'Conta Poupança'),
    ]

    # identificador da conta (ex.: "12345-6")
    account_number = models.CharField(max_length=20, unique=True)

    # tipo da conta
    account_type = models.CharField(max_length=2, choices=ACCOUNT_TYPE_CHOICES)
    
    # saldo da conta
    balance = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    # humaniza a conta
    def __str__(self):
        return f"{self.account_number} - {self.get_account_type_display()} (R$ {self.balance})"