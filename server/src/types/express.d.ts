import type {
  ProductivityProfile,
  Session,
  User,
  UserSettings,
} from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      auth?: {
        user: User;
        session: Session;
        profile: ProductivityProfile;
        settings: UserSettings;
      };
    }
  }
}

export {};
