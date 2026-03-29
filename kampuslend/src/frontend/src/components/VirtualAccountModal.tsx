import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
/**
 * Modal Virtual Account - tampil nomor VA dan instruksi pembayaran
 */
import { useState } from "react";
import { toast } from "sonner";
import { formatRupiah } from "../utils/format";

interface VirtualAccountModalProps {
  isOpen: boolean;
  vaNumber: string;
  amount: number;
  onClose: () => void;
}

const BANKS = [
  { name: "BCA", color: "#003087" },
  { name: "Mandiri", color: "#003087" },
  { name: "BRI", color: "#00529B" },
  { name: "BNI", color: "#F26821" },
  { name: "BSI", color: "#00A650" },
];

export default function VirtualAccountModal({
  isOpen,
  vaNumber,
  amount,
  onClose,
}: VirtualAccountModalProps) {
  const [copiedVA, setCopiedVA] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(vaNumber).then(() => {
      setCopiedVA(true);
      toast.success("Nomor VA berhasil disalin!");
      setTimeout(() => setCopiedVA(false), 2000);
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="rounded-2xl max-w-md" data-ocid="va.dialog">
        <DialogHeader>
          <DialogTitle className="text-navy font-bold">
            Virtual Account Pembayaran
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Nomor VA */}
          <div className="bg-muted rounded-xl p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">
              Nomor Virtual Account
            </p>
            <p className="text-2xl font-bold tracking-widest text-navy">
              {vaNumber}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="mt-2 rounded-full text-xs"
              data-ocid="va.copy_button"
            >
              {copiedVA ? "✓ Tersalin" : "Salin Nomor VA"}
            </Button>
          </div>

          {/* Jumlah transfer */}
          <div className="flex justify-between items-center bg-green-50 rounded-xl p-3">
            <span className="text-sm text-muted-foreground">
              Jumlah Transfer
            </span>
            <span className="font-bold text-green-700 text-lg">
              {formatRupiah(amount)}
            </span>
          </div>

          {/* Bank yang tersedia */}
          <div>
            <p className="text-xs text-muted-foreground mb-2 font-medium">
              Tersedia di bank:
            </p>
            <div className="flex gap-2 flex-wrap">
              {BANKS.map((bank) => (
                <span
                  key={bank.name}
                  className="px-3 py-1 rounded-full text-white text-xs font-semibold"
                  style={{ backgroundColor: bank.color }}
                >
                  {bank.name}
                </span>
              ))}
            </div>
          </div>

          <Separator />

          {/* Langkah-langkah */}
          <div>
            <p className="text-sm font-semibold mb-2">Cara Transfer:</p>
            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
              <li>Buka aplikasi mobile banking atau ATM bank Anda</li>
              <li>Pilih menu Transfer / Virtual Account</li>
              <li>Masukkan nomor VA di atas</li>
              <li>Masukkan nominal transfer sesuai jumlah</li>
              <li>Konfirmasi dan selesaikan pembayaran</li>
            </ol>
          </div>
        </div>

        <Button
          onClick={onClose}
          className="w-full rounded-full bg-navy text-white hover:bg-navy/90"
          data-ocid="va.close_button"
        >
          Tutup
        </Button>
      </DialogContent>
    </Dialog>
  );
}
