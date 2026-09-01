/** What the agent brought back in cash across the payments given. */
export function sumCollectedPayments(payments: { amount: number }[]): number {
  return payments.reduce((total, payment) => total + payment.amount, 0);
}
