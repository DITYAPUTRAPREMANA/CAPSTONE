/**
 * Timeline cicilan bulanan - horizontal dots
 */
import type { Payment } from "../backend";
import { formatDate } from "../utils/format";

interface RepaymentTimelineProps {
  payments: Payment[];
  tenor: number;
}

export default function RepaymentTimeline({
  payments,
  tenor,
}: RepaymentTimelineProps) {
  const months = Array.from({ length: tenor }, (_, i) => i + 1);

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex items-start gap-0 min-w-max">
        {months.map((month) => {
          const payment = payments[month - 1];
          const isLunas = payment?.status === "Lunas";
          const isCurrent = month === payments.length + 1;

          return (
            <div
              key={month}
              className="flex flex-col items-center"
              style={{ minWidth: 72 }}
            >
              {/* Tanggal di atas dot */}
              <div className="text-center mb-2">
                {payment ? (
                  <p className="text-xs text-muted-foreground">
                    {formatDate(payment.paymentDate)}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">-</p>
                )}
              </div>

              {/* Dot dan garis penghubung */}
              <div className="flex items-center">
                {month > 1 && (
                  <div
                    className={`h-0.5 w-8 -mr-1 ${isLunas ? "bg-green-500" : "bg-gray-200"}`}
                  />
                )}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                    isLunas
                      ? "bg-green-500 border-green-500 text-white"
                      : isCurrent
                        ? "bg-amber-500 border-amber-500 text-white"
                        : "bg-white border-gray-300 text-gray-400"
                  }`}
                >
                  {isLunas ? "✓" : month}
                </div>
                {month < tenor && (
                  <div
                    className={`h-0.5 w-8 -ml-1 ${isLunas ? "bg-green-500" : "bg-gray-200"}`}
                  />
                )}
              </div>

              {/* Label bulan */}
              <p className="text-xs mt-2 text-muted-foreground text-center">
                Bln {month}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
