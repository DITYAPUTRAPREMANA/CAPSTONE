import { Card, CardContent } from "@/components/ui/card";

const stats = [
  { label: "Total Pengguna", value: "2.400+", icon: "👨‍🎓" },
  { label: "Dana Tersalur", value: "Rp 4,8M", icon: "💰" },
  { label: "Tingkat Pengembalian", value: "98.2%", icon: "📈" },
  { label: "Universitas Mitra", value: "32", icon: "🏫" },
];

export default function StatsSection() {
  return (
    <section className="stats-section">
      <div className="stats-grid">
        {stats.map((stat) => (
          <Card key={stat.label} className="stat-card">
            <CardContent className="stat-content">
              <div className="stat-icon">{stat.icon}</div>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}