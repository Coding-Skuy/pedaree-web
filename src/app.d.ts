import type { Sesi } from "$lib/sesi";

declare global {
  namespace App {
    interface Locals {
      sesi: Sesi | null;
    }
  }
}
export {};
