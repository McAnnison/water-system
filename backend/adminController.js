const prisma = require('../lib/prisma');

// @desc    Get Financial Work Rate / Summary
// @route   GET /api/admin/dashboard-stats
const getDashboardStats = async (req, res) => {
  try {
    const transactions = await prisma.transaction.findMany({
      where: {
        date: {
          gte: new Date(new Date().setDate(new Date().getDate() - 30)) // Last 30 days
        }
      }
    });

    const totalIncome = transactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const totalExpenses = transactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const netProfit = totalIncome - totalExpenses;
    
    // Work Rate Calculation (Daily Average)
    const dailyRevenueRate = totalIncome / 30;
    const dailyBurnRate = totalExpenses / 30;

    res.json({
      summary: {
        totalIncome,
        totalExpenses,
        netProfit,
      },
      rates: {
        dailyRevenueRate: dailyRevenueRate.toFixed(2),
        dailyBurnRate: dailyBurnRate.toFixed(2),
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDashboardStats };