import { Badge } from "@/components/ui/badge"
import {
  MessageCircle,
  PackageCheck,
  TrendingUp,
  AlertTriangle,
  Users,
  Phone,
  CalendarCheck,
  DollarSign,
  Briefcase,
  ShieldCheck,
  Globe2,
  FileSpreadsheet,
  TreePine,
  Leaf,
} from "lucide-react"

const Bar = ({ width, intent = "primary" }: { width: string; intent?: "primary" | "muted" | "destructive" }) => (
  <div className="h-2 rounded-full bg-muted">
    <div
      className={`h-2 rounded-full ${
        intent === "primary"
          ? "bg-primary"
          : intent === "destructive"
          ? "bg-destructive"
          : "bg-muted-foreground/40"
      }`}
      style={{ width }}
    />
  </div>
)

export function SalesMockup() {
  const orders = [
    { src: "WhatsApp", customer: "Lê Văn Nam", units: 240, status: "pending" },
    { src: "WhatsApp", customer: "Aroma Coconut Co.", units: 1200, status: "confirmed" },
    { src: "Email", customer: "Phạm Thị Hà", units: 80, status: "pending" },
    { src: "WhatsApp", customer: "Mekong Nursery", units: 600, status: "fulfilled" },
  ]
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="md:col-span-2 space-y-2">
        <div className="text-sm font-semibold flex items-center gap-2">
          <MessageCircle className="h-4 w-4 text-primary" /> Order Intake Feed
        </div>
        <div className="border rounded-md divide-y">
          {orders.map((o) => (
            <div key={o.customer} className="p-3 flex items-center justify-between">
              <div>
                <div className="font-medium text-sm">{o.customer}</div>
                <div className="text-xs text-muted-foreground">
                  {o.src} · {o.units} seedlings
                </div>
              </div>
              <Badge
                variant="outline"
                className={
                  o.status === "fulfilled"
                    ? "bg-primary/10 text-primary border-primary/20"
                    : o.status === "confirmed"
                    ? "bg-blue-100 text-blue-800 border-blue-200"
                    : "bg-yellow-100 text-yellow-800 border-yellow-200"
                }
              >
                {o.status}
              </Badge>
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-3">
        <div className="text-sm font-semibold">Pipeline this week</div>
        <div className="border rounded-md p-3 space-y-3">
          <div>
            <div className="flex justify-between text-xs">
              <span>Confirmed</span>
              <span className="font-medium">1,800 seedlings</span>
            </div>
            <Bar width="72%" />
          </div>
          <div>
            <div className="flex justify-between text-xs">
              <span>Pending</span>
              <span className="font-medium">320 seedlings</span>
            </div>
            <Bar width="32%" intent="muted" />
          </div>
          <div>
            <div className="flex justify-between text-xs">
              <span>Capacity</span>
              <span className="font-medium">2,500 seedlings</span>
            </div>
            <Bar width="100%" intent="primary" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function InventoryMockup() {
  const rows = [
    { variety: "Multipuno Makapuno", hcmc: 2300, hanoi: 0, danang: 410, status: "low_hanoi" },
    { variety: "Aromatic Kopyor", hcmc: 1100, hanoi: 280, danang: 0, status: "low_danang" },
    { variety: "Tall Local", hcmc: 1850, hanoi: 540, danang: 720, status: "ok" },
  ]
  return (
    <div className="space-y-3">
      <div className="text-sm font-semibold flex items-center gap-2">
        <PackageCheck className="h-4 w-4 text-primary" /> Stock by variety × location
      </div>
      <div className="border rounded-md overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="text-left p-3">Variety</th>
              <th className="text-right p-3">HCMC Lab</th>
              <th className="text-right p-3">Hanoi</th>
              <th className="text-right p-3">Da Nang</th>
              <th className="text-left p-3">Flag</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((r) => (
              <tr key={r.variety}>
                <td className="p-3 font-medium">{r.variety}</td>
                <td className="p-3 text-right tabular-nums">{r.hcmc.toLocaleString()}</td>
                <td className={`p-3 text-right tabular-nums ${r.status === "low_hanoi" ? "text-destructive" : ""}`}>
                  {r.hanoi.toLocaleString()}
                </td>
                <td className={`p-3 text-right tabular-nums ${r.status === "low_danang" ? "text-destructive" : ""}`}>
                  {r.danang.toLocaleString()}
                </td>
                <td className="p-3">
                  {r.status === "ok" ? (
                    <Badge className="bg-primary hover:bg-primary">healthy</Badge>
                  ) : (
                    <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
                      <AlertTriangle className="h-3 w-3 mr-1" /> low stock
                    </Badge>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function FarmersMockup() {
  const farmers = [
    { name: "Nguyễn Thị Hương", region: "Bến Tre", lastContact: "2 days ago", spark: [3, 4, 5, 4, 6, 7, 8] },
    { name: "Trần Văn Bảo", region: "Tiền Giang", lastContact: "5 days ago", spark: [2, 3, 3, 5, 6, 5, 7] },
    { name: "Phạm Quốc Anh", region: "Cà Mau", lastContact: "1 week ago", spark: [4, 4, 5, 6, 6, 7, 6] },
  ]
  return (
    <div className="space-y-3">
      <div className="text-sm font-semibold flex items-center gap-2">
        <Users className="h-4 w-4 text-primary" /> Farmer relationships
      </div>
      <div className="space-y-2">
        {farmers.map((f) => (
          <div key={f.name} className="border rounded-md p-3 grid grid-cols-12 gap-3 items-center">
            <div className="col-span-5">
              <div className="font-medium">{f.name}</div>
              <div className="text-xs text-muted-foreground">{f.region}</div>
            </div>
            <div className="col-span-3 text-xs text-muted-foreground flex items-center gap-1">
              <Phone className="h-3 w-3" /> {f.lastContact}
            </div>
            <div className="col-span-4">
              <div className="flex items-end gap-1 h-8">
                {f.spark.map((v, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-sm bg-primary/70"
                    style={{ height: `${v * 10}%` }}
                  />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function HrMockup() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="md:col-span-2 space-y-3">
        <div className="text-sm font-semibold flex items-center gap-2">
          <Briefcase className="h-4 w-4 text-primary" /> Employee directory
        </div>
        <div className="border rounded-md divide-y">
          {[
            { name: "Dr. Nguyễn Mai", role: "Lead Scientist", onb: "complete" },
            { name: "Lê Quốc Hưng", role: "Lab Technician", onb: "in_progress" },
            { name: "Vũ Hoài Nam", role: "Operations", onb: "complete" },
            { name: "Trịnh Thu Hằng", role: "Lab Technician", onb: "in_progress" },
          ].map((p) => (
            <div key={p.name} className="p-3 flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">{p.name}</div>
                <div className="text-xs text-muted-foreground">{p.role}</div>
              </div>
              <Badge variant="outline" className={p.onb === "complete" ? "bg-primary/10 text-primary border-primary/20" : ""}>
                {p.onb === "complete" ? "Onboarded" : "In progress"}
              </Badge>
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-3">
        <div className="text-sm font-semibold flex items-center gap-2">
          <CalendarCheck className="h-4 w-4 text-primary" /> Rotation calendar
        </div>
        <div className="border rounded-md p-3 grid grid-cols-7 gap-1 text-xs">
          {Array.from({ length: 28 }).map((_, i) => (
            <div
              key={i}
              className={`aspect-square rounded ${
                i % 7 === 0 || i % 5 === 0 ? "bg-primary/30" : "bg-muted"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export function FinanceMockup() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Cash on hand", value: "$1.42M", trend: "↑ 8%" },
          { label: "Monthly burn", value: "$94K", trend: "↓ 4%" },
          { label: "Runway", value: "15 months", trend: "↑ 1 mo" },
        ].map((kpi) => (
          <div key={kpi.label} className="border rounded-md p-3">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">{kpi.label}</div>
            <div className="text-2xl font-bold mt-1">{kpi.value}</div>
            <div className="text-xs text-primary mt-1">{kpi.trend}</div>
          </div>
        ))}
      </div>
      <div className="border rounded-md p-3">
        <div className="text-sm font-semibold flex items-center gap-2 mb-3">
          <DollarSign className="h-4 w-4 text-primary" /> Runway projection (next 18 months)
        </div>
        <div className="flex items-end gap-1 h-24">
          {Array.from({ length: 18 }).map((_, i) => (
            <div
              key={i}
              className="flex-1 rounded-t bg-gradient-to-t from-primary to-primary/40"
              style={{ height: `${100 - i * 4}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export function InvestorMockup() {
  return (
    <div className="space-y-3">
      <div className="text-sm font-semibold flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-primary" /> Quarterly investor briefing
      </div>
      <div className="border rounded-md p-4 space-y-4">
        <div className="grid gap-3 md:grid-cols-4">
          {[
            { l: "Active batches", v: "47" },
            { l: "Seedlings shipped", v: "12.4K" },
            { l: "ARR", v: "$680K" },
            { l: "Farmers onboarded", v: "118" },
          ].map((kpi) => (
            <div key={kpi.l}>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">{kpi.l}</div>
              <div className="text-xl font-bold">{kpi.v}</div>
            </div>
          ))}
        </div>
        <div className="border-t pt-3 text-sm space-y-2">
          <div className="font-semibold">Narrative report</div>
          <div className="text-muted-foreground text-xs leading-relaxed">
            Q2 saw 18% growth in seedling output, driven by Multipuno demand from Mekong Delta
            cooperatives. Yield ratios improved 3.2 points after the M3 media reformulation. Read-only
            access auto-refreshes every Monday at 09:00 ICT.
          </div>
        </div>
      </div>
    </div>
  )
}

export function ComplianceMockup() {
  const items = [
    { label: "CITES re-certification", status: "ready", due: "2027-03-12" },
    { label: "Phytosanitary certificate (EU)", status: "pending", due: "2026-08-30" },
    { label: "Vietnam plant variety registration", status: "ready", due: "2028-01-15" },
    { label: "Customs export license (PH)", status: "blocked", due: "2026-07-10" },
  ]
  return (
    <div className="space-y-3">
      <div className="text-sm font-semibold flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-primary" /> Export readiness checklist
      </div>
      <div className="border rounded-md divide-y">
        {items.map((it) => (
          <div key={it.label} className="p-3 flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">{it.label}</div>
              <div className="text-xs text-muted-foreground">Due {it.due}</div>
            </div>
            <Badge
              variant="outline"
              className={
                it.status === "ready"
                  ? "bg-primary/10 text-primary border-primary/20"
                  : it.status === "blocked"
                  ? "bg-destructive/10 text-destructive border-destructive/20"
                  : "bg-yellow-100 text-yellow-800 border-yellow-200"
              }
            >
              {it.status}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  )
}

export function TraceabilityMockup() {
  const chain = [
    { node: "Mother tree", detail: "Bến Tre · 2017 selection · MT-04", status: "ok" },
    { node: "Germination G1", detail: "B-2024-001 · 100 jars · 95% survival", status: "ok" },
    { node: "Multiplication M3", detail: "B-2024-001 · 1,890 derived jars", status: "ok" },
    { node: "Rooting R3", detail: "B-2024-001 · 1,420 rooted plantlets", status: "ok" },
    { node: "Transfer", detail: "B-2024-001 · 1,180 transferred · QC pass", status: "ok" },
    { node: "Customer delivery", detail: "Aroma Coconut Co. · 1,200 units", status: "pending" },
  ]
  return (
    <div className="space-y-3">
      <div className="text-sm font-semibold flex items-center gap-2">
        <TreePine className="h-4 w-4 text-primary" /> Chain of custody
      </div>
      <div className="border rounded-md p-3 space-y-3">
        {chain.map((c, i) => (
          <div key={c.node} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className={`h-3 w-3 rounded-full ${c.status === "ok" ? "bg-primary" : "bg-muted-foreground/50"}`} />
              {i < chain.length - 1 && <div className="w-px h-8 bg-border my-1" />}
            </div>
            <div>
              <div className="text-sm font-medium">{c.node}</div>
              <div className="text-xs text-muted-foreground">{c.detail}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function EsgMockup() {
  return (
    <div className="space-y-3">
      <div className="text-sm font-semibold flex items-center gap-2">
        <Globe2 className="h-4 w-4 text-primary" /> Impact metrics
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="border rounded-md p-3">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
            <DollarSign className="h-3 w-3" /> Farmer income uplift
          </div>
          <div className="text-2xl font-bold mt-1">+38%</div>
          <Bar width="68%" />
          <div className="text-xs text-muted-foreground mt-1">vs. local market baseline</div>
        </div>
        <div className="border rounded-md p-3">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
            <Leaf className="h-3 w-3" /> Carbon sequestered
          </div>
          <div className="text-2xl font-bold mt-1">2,140 t</div>
          <Bar width="42%" />
          <div className="text-xs text-muted-foreground mt-1">CO₂e since 2024</div>
        </div>
        <div className="border rounded-md p-3">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
            <FileSpreadsheet className="h-3 w-3" /> Smallholders onboarded
          </div>
          <div className="text-2xl font-bold mt-1">118</div>
          <Bar width="55%" />
          <div className="text-xs text-muted-foreground mt-1">Bến Tre + Tiền Giang</div>
        </div>
      </div>
    </div>
  )
}
