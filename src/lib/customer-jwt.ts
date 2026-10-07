import jwt from 'jsonwebtoken';

const SECRET = process.env.CUSTOMER_JWT_SECRET!;

export function signCustomerToken(customerId: string) {
  return jwt.sign({ customerId }, SECRET, { expiresIn: '90d' });
}

export function verifyCustomerToken(token: string): { customerId: string } | null {
  try {
    return jwt.verify(token, SECRET) as { customerId: string };
  } catch {
    return null;
  }
}