// Add type definitions for express-session
import 'express-session';

declare module 'express-session' {
  interface SessionData {
    userId?: number;
  }
}