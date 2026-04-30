import type { Plan } from '@prisma/client';
import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: DefaultSession['user'] & {
      id: string;
      plan: Plan;
      freeUsageCount: number;
    };
  }

  interface User {
    plan: Plan;
    freeUsageCount: number;
  }
}

