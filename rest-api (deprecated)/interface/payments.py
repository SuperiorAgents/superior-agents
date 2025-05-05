from decimal  import Decimal
from typing   import Optional
from datetime import datetime
from pydantic import BaseModel, Field


# Payment Parameters Model
# This model defines the structure for payment transactions in the system
# Fields:
#   - user_id:        Identifier of the user making the payment
#   - agent_id:       Identifier of the agent being paid for
#   - amount:         Payment amount in decimal format (e.g., 10.00)
#   - transaction_id: Unique identifier for the payment transaction
#   - created_at:     Timestamp when payment was created
#   - deleted_at:     Timestamp when payment was deleted (if applicable)
#
# Example Usage:
#   payment = PaymentParams(
#       user_id  = "user123",
#       agent_id = "agent456",
#       amount   = Decimal("10.00")
#   )
class PaymentParams(BaseModel):
    user_id: Optional[str] = Field(None)
    agent_id: Optional[str] = Field(None)
    amount: Optional[Decimal] = Field(None)
    transaction_id: Optional[str] = Field(None)
    created_at: Optional[datetime] = None
    deleted_at: Optional[datetime] = None
