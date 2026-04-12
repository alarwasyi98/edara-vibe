---
name: reconciliation-log
description: Reconciliation Log for EDARA
status: draft
modified: 2026-04-12
version: 0.0.3
---

# EDARA Project Reconciliation Log

Dokumen ini melacak "Current State" dan histori perubahan selama proses rekonsiliasi proyek dari state legacy/mock menuju Phase 1 MVP.

> [!IMPORTANT]
> **Project**: EDARA
> **Status**: Draft
> **Version**: 0.0.3
> **Last Updated**: 2026-04-12
> **Next Target**: Step 4 (Definisi Skema Inti & Tenant)

## 🏁 Current Sprint Summary
- **Project**: EDARA
- **Phase**: Section 1 (Stabilisasi & Infrastruktur Dasar)
- **Status Progress**: 3/34 Steps Completed (8%)
- **Last Updated**: 2026-04-12
- **Next Target**: Step 4 (Definisi Skema Inti & Tenant)
- **Plan Reference**: [Reconciliation Plan](src/docs/reconciliation-plan.md)

---

## 📅 Session: 2026-04-12 (Initial Stabilization)

### 📝 Status Saat Ini
Infrastruktur dasar backend (ORM, RPC, Testing) sudah terpasang dan terkonfigurasi. Modul yang tidak relevan (PPDB & Alumni) sudah dibersihkan secara total.

### 🛠️ File yang Diubah/Dibuat
- **Deleted**: `src/features/ppdb/`, `src/features/alumni/` (seluruh folder)
- **Deleted**: `src/routes/_authenticated/ppdb/`, `allumni/`
- **Modified**: `src/components/layout/data/sidebar-data.ts` (Hapus navigasi)
- **Modified**: `src/lib/constants.ts` (Hapus dead code)
- **Created**: `vitest.config.ts`, `drizzle.config.ts`
- **Created**: `src/lib/decimal-setup.ts`, `src/server/db/index.ts`, `src/server/db/schema/index.ts`
- **Modified**: `package.json`, `tsconfig.node.json`, `.env.example`

### ⚖️ Keputusan Teknis (Log Keputusan)
| Keputusan | Justifikasi |
|---|---|
| **Decimal.js Global Setup** | ADR-07 mewajibkan presisi finansial. Setup global menggunakan `ROUND_HALF_UP` dan presisi 20 digit untuk IDR. |
| **oRPC Scoped Packages** | Mengeksekusi instalasi `@orpc/server`, `@orpc/client`, dan `@orpc/tanstack-query` sebagai standar komunikasi type-safe terbaru (2026). |
| **Skip Raw PG Driver** | Menggunakan `@neondatabase/serverless` saja karena arsitektur menggunakan Neon. Lebih efisien untuk lingkungan serverless. |
| **RouteTree Regeneration** | Membiarkan `routeTree.gen.ts` teregenerasi otomatis via Vite plugin untuk menghindari inkonsistensi rute. |

### 🚧 Hambatan & Mitigasi
- **Issue**: Terminal `pwsh` sempat hang saat instalasi pnpm gara-gara loading profile.
- **Mitigasi**: Eksekusi command terminal wajib menggunakan `-NoProfile` untuk stabilitas di lingkungan agent.

### 📌 Catatan untuk Sesi Selanjutnya
- **Unit Kerja**: Section 2 (Implementasi Skema Database)
- **Kesiapan**: Pastikan `DATABASE_URL` di `.env` sudah mengarah ke instance Neon yang valid.
- **Goal**: Menjalankan `pnpm db:push` pertama kali setelah tabel `schools` dan `units` selesai didefinisikan di Step 4.

---

## 📈 Milestone Tracker
- [x] Step 1: Cleanup Out-of-Scope Modules
- [x] Step 2: Backend & Testing Dependencies
- [x] Step 3: Drizzle & Neon Configuration
- [ ] Step 4: Core Tenant Schema (Next)
- [ ] Step 5: Operational Schema
- [ ] Step 6: Financial Schema
- [ ] ... (Steps 7-34)
