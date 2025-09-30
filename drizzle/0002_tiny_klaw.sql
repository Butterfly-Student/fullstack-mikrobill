ALTER TYPE "public"."tagihan_status" ADD VALUE 'jatuh_tempo' BEFORE 'sebagian';--> statement-breakpoint
ALTER TABLE "kas" ALTER COLUMN "tanggal" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "kas" ALTER COLUMN "tanggal" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "kas" ALTER COLUMN "tanggal" DROP NOT NULL;