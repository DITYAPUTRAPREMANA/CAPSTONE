import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
/**
 * Modal akad pinjaman digital - konfirmasi sebelum investor mendanai
 */
import { useState } from "react";
import type { Loan } from "../backend";
import { formatRupiah } from "../utils/format";

interface AkadModalProps {
  isOpen: boolean;
  loan: Loan;
  onConfirm: () => void;
  onClose: () => void;
  isLoading?: boolean;
}

export default function AkadModal({
  isOpen,
  loan,
  onConfirm,
  onClose,
  isLoading,
}: AkadModalProps) {
  const [agreed, setAgreed] = useState(false);
  const totalBayar = loan.monthlyInstallment * Number(loan.tenor);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="rounded-2xl max-w-md" data-ocid="akad.dialog">
        <DialogHeader>
          <DialogTitle className="text-navy font-bold text-lg">
            Akad Pinjaman Digital
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-muted rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Peminjam</span>
              <span className="font-semibold">{loan.borrowerName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Jurusan</span>
              <span className="font-medium">{loan.major}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Nominal Pinjaman</span>
              <span className="font-semibold">{formatRupiah(loan.amount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tenor</span>
              <span className="font-semibold">{Number(loan.tenor)} bulan</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Cicilan / bulan</span>
              <span className="font-semibold text-brand-green">
                {formatRupiah(loan.monthlyInstallment)}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Total Diterima Kembali
              </span>
              <span className="font-bold text-brand-blue">
                {formatRupiah(totalBayar)}
              </span>
            </div>
          </div>

          {/* Checkbox persetujuan */}
          <div className="flex items-start gap-3">
            <Checkbox
              id="akad-agree"
              checked={agreed}
              onCheckedChange={(v) => setAgreed(v === true)}
              data-ocid="akad.checkbox"
            />
            <Label
              htmlFor="akad-agree"
              className="text-sm leading-relaxed cursor-pointer"
            >
              Saya menyetujui akad pinjaman digital ini dan bersedia mendanai
              pinjaman sesuai dengan ketentuan yang telah disepakati.
            </Label>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="rounded-full"
            data-ocid="akad.cancel_button"
          >
            Batal
          </Button>
          <Button
            disabled={!agreed || isLoading}
            onClick={onConfirm}
            className="rounded-full bg-brand-green hover:bg-brand-green/90 text-white"
            data-ocid="akad.confirm_button"
          >
            {isLoading ? "Memproses..." : "Konfirmasi Danai"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
