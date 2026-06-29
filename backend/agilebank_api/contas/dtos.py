from dataclasses import dataclass
from decimal import Decimal

@dataclass
class WithdrawDTO:
    account_number: str
    amount: Decimal

@dataclass
class TransferDTO:
    source_account_number: str
    destination_account_number: str
    amount: Decimal