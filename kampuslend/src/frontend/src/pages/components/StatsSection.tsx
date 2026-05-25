import { Card, CardContent } from "@/components/ui/card";
import studentIconSvg from "@/assets/student.svg";
import moneyIconSvg from "@/assets/money.svg";
import returnIconSvg from "@/assets/return.svg";
import universityIconSvg from "@/assets/univ.svg";

const stats = [
  { label: "Total Pengguna", value: "2.400+", icon: studentIconSvg },
  { label: "Dana Tersalur", value: "Rp 4,8M", icon: moneyIconSvg },
  { label: "Tingkat Pengembalian", value: "98.2%", icon: returnIconSvg },
  { label: "Universitas Mitra", value: "32", icon: universityIconSvg },
];

export default function StatsSection() {
  return (
    <section className="stats-section">
      <div className="stats-grid">
        {stats.map((stat) => (
          <Card key={stat.label} className="stat-card">
            <CardContent className="stat-content">
              <div className="stat-icon flex items-center justify-center">
                <img
                  src={stat.icon}
                  alt={stat.label}
                  style={{ width: "42px", height: "42px" }}
                />
              </div>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
