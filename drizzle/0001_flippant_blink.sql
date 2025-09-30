CREATE TYPE "public"."kas_jenis" AS ENUM('masuk', 'keluar');--> statement-breakpoint
CREATE TYPE "public"."metode" AS ENUM('cash', 'transfer', 'lain');--> statement-breakpoint
CREATE TYPE "public"."periode" AS ENUM('bulanan', 'tahunan');--> statement-breakpoint
CREATE TYPE "public"."tagihan_status" AS ENUM('belum_lunas', 'lunas', 'sebagian');--> statement-breakpoint
CREATE TABLE "kas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tanggal" date NOT NULL,
	"keterangan" text,
	"jenis" "kas_jenis" NOT NULL,
	"jumlah" numeric(15, 2) NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "pelanggan" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"email" varchar(150),
	"password" varchar(255),
	"alamat" text,
	"telepon" varchar(20),
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "pelanggan_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "pembayaran_tagihan" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tagihan_id" uuid NOT NULL,
	"pelanggan_id" uuid NOT NULL,
	"tanggal" date NOT NULL,
	"jumlah" numeric(15, 2) NOT NULL,
	"metode" "metode" DEFAULT 'cash',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tagihan" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"no_tagihan" varchar(50) NOT NULL,
	"tanggal" date NOT NULL,
	"jatuh_tempo" date NOT NULL,
	"deskripsi" text,
	"status" "tagihan_status" DEFAULT 'belum_lunas',
	"total" numeric(15, 2) NOT NULL,
	"pelanggan_id" uuid NOT NULL,
	"template_id" uuid,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "tagihan_no_tagihan_unique" UNIQUE("no_tagihan")
);
--> statement-breakpoint
CREATE TABLE "template_tagihan" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pelanggan_id" uuid NOT NULL,
	"nama" varchar(100) NOT NULL,
	"deskripsi" text,
	"jumlah" numeric(15, 2) NOT NULL,
	"periode" "periode" DEFAULT 'bulanan',
	"tanggal_mulai" date NOT NULL,
	"aktif" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "pembayaran_tagihan" ADD CONSTRAINT "pembayaran_tagihan_tagihan_id_tagihan_id_fk" FOREIGN KEY ("tagihan_id") REFERENCES "public"."tagihan"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pembayaran_tagihan" ADD CONSTRAINT "pembayaran_tagihan_pelanggan_id_pelanggan_id_fk" FOREIGN KEY ("pelanggan_id") REFERENCES "public"."pelanggan"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tagihan" ADD CONSTRAINT "tagihan_pelanggan_id_pelanggan_id_fk" FOREIGN KEY ("pelanggan_id") REFERENCES "public"."pelanggan"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tagihan" ADD CONSTRAINT "tagihan_template_id_template_tagihan_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."template_tagihan"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "template_tagihan" ADD CONSTRAINT "template_tagihan_pelanggan_id_pelanggan_id_fk" FOREIGN KEY ("pelanggan_id") REFERENCES "public"."pelanggan"("id") ON DELETE cascade ON UPDATE no action;