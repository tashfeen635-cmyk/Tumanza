import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Order } from '@/models';
import { requireAdmin } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const isAdmin = await requireAdmin(request);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    await connectDB();
    const allOrders = await Order.find().sort({ date: -1 }).lean();

    const dailySales: Record<string, number> = {};
    const weeklySales: Record<string, number> = {};
    const monthlySales: Record<string, number> = {};
    const topProducts: Record<string, { name: string; qty: number; revenue: number }> = {};
    let totalRevenue = 0;
    const statusCounts: Record<string, number> = { Pending: 0, Shipped: 0, Delivered: 0 };

    for (let i = 0; i < allOrders.length; i++) {
      const o = allOrders[i];
      let orderTotal = 0;
      for (let j = 0; j < (o.items || []).length; j++) {
        const lineTotal = o.items[j].qty * o.items[j].price;
        orderTotal += lineTotal;

        const pName = o.items[j].name;
        if (!topProducts[pName]) topProducts[pName] = { name: pName, qty: 0, revenue: 0 };
        topProducts[pName].qty += o.items[j].qty;
        topProducts[pName].revenue += lineTotal;
      }
      totalRevenue += orderTotal;
      statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;

      // Daily
      dailySales[o.date] = (dailySales[o.date] || 0) + orderTotal;

      // Weekly
      const d = new Date(o.date + 'T00:00:00');
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay());
      const weekKey = weekStart.toISOString().slice(0, 10);
      weeklySales[weekKey] = (weeklySales[weekKey] || 0) + orderTotal;

      // Monthly
      const monthKey = o.date.slice(0, 7);
      monthlySales[monthKey] = (monthlySales[monthKey] || 0) + orderTotal;
    }

    const topList = Object.values(topProducts)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    const dailyArr = Object.keys(dailySales)
      .sort()
      .slice(-30)
      .map((k) => ({ date: k, revenue: dailySales[k] }));

    const weeklyArr = Object.keys(weeklySales)
      .sort()
      .slice(-12)
      .map((k) => ({ week: k, revenue: weeklySales[k] }));

    const monthlyArr = Object.keys(monthlySales)
      .sort()
      .slice(-12)
      .map((k) => ({ month: k, revenue: monthlySales[k] }));

    return NextResponse.json({
      totalRevenue,
      totalOrders: allOrders.length,
      statusCounts,
      dailySales: dailyArr,
      weeklySales: weeklyArr,
      monthlySales: monthlyArr,
      topProducts: topList,
    });
  } catch (err: any) {
    console.error('Analytics error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
