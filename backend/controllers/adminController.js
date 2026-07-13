const prisma = require('../lib/prisma');

// @desc    Get Financial Work Rate / Summary
// @route   GET /api/admin/stats
const getDashboardStats = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date(new Date().setDate(new Date().getDate() - 30));

    const transactions = await prisma.transaction.findMany({
      where: { date: { gte: thirtyDaysAgo } }
    });

    const totalIncome = transactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const totalExpenses = transactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const netProfit = totalIncome - totalExpenses;
    const dailyRevenueRate = totalIncome / 30;
    const dailyBurnRate = totalExpenses / 30;

    const totalUsers = await prisma.user.count();
    const activeUsers = await prisma.user.count({ where: { isActive: true } });

    const recentLogs = await prisma.dailyLog.findMany({
      take: 7,
      orderBy: { date: 'desc' },
      include: { staff: { select: { name: true } } }
    });

    const totalProduction = recentLogs.reduce((sum, log) => sum + log.production, 0);
    const totalDispatch = recentLogs.reduce((sum, log) => sum + log.dispatch, 0);

    const notifications = await prisma.notification.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' }
    });

    const unreadNotifications = await prisma.notification.count({
      where: { isRead: false }
    });

    // Chart data: daily income vs expenses for last 30 days
    const allTransactions = await prisma.transaction.findMany({
      where: { date: { gte: thirtyDaysAgo } },
      orderBy: { date: 'asc' }
    });

    const chartData = {};
    allTransactions.forEach(t => {
      const dateKey = t.date.toISOString().split('T')[0];
      if (!chartData[dateKey]) {
        chartData[dateKey] = { date: dateKey, income: 0, expenses: 0 };
      }
      if (t.type === 'INCOME') {
        chartData[dateKey].income += parseFloat(t.amount);
      } else {
        chartData[dateKey].expenses += parseFloat(t.amount);
      }
    });

    // Production chart data
    const productionChartData = recentLogs.map(log => ({
      date: log.date.toISOString().split('T')[0],
      production: log.production,
      dispatch: log.dispatch,
      stock: log.remainingStock
    })).reverse();

    res.json({
      summary: {
        totalIncome: parseFloat(totalIncome.toFixed(2)),
        totalExpenses: parseFloat(totalExpenses.toFixed(2)),
        netProfit: parseFloat(netProfit.toFixed(2)),
        totalUsers,
        activeUsers,
        totalProduction,
        totalDispatch
      },
      rates: {
        dailyRevenueRate: parseFloat(dailyRevenueRate.toFixed(2)),
        dailyBurnRate: parseFloat(dailyBurnRate.toFixed(2))
      },
      recentLogs,
      notifications,
      unreadNotifications,
      chartData: Object.values(chartData),
      productionChartData
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get AI-powered insights and recommendations
// @route   GET /api/admin/ai-insights
const getAIInsights = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date(new Date().setDate(new Date().getDate() - 30));
    const sixtyDaysAgo = new Date(new Date().setDate(new Date().getDate() - 60));

    const currentTransactions = await prisma.transaction.findMany({
      where: { date: { gte: thirtyDaysAgo } }
    });

    const previousTransactions = await prisma.transaction.findMany({
      where: { date: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } }
    });

    const currentIncome = currentTransactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const currentExpenses = currentTransactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const previousIncome = previousTransactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const previousExpenses = previousTransactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const recentLogs = await prisma.dailyLog.findMany({
      where: { date: { gte: thirtyDaysAgo } },
      orderBy: { date: 'desc' }
    });

    const insights = [];

    // Revenue trend analysis
    const revenueChange = previousIncome > 0
      ? ((currentIncome - previousIncome) / previousIncome * 100).toFixed(1)
      : 0;

    if (revenueChange > 10) {
      insights.push({
        type: 'positive',
        title: 'Revenue Growth Detected',
        message: `Revenue has increased by ${revenueChange}% compared to the previous 30-day period. Consider scaling production to meet growing demand.`,
        priority: 'high'
      });
    } else if (revenueChange < -10) {
      insights.push({
        type: 'warning',
        title: 'Revenue Decline Alert',
        message: `Revenue has decreased by ${Math.abs(revenueChange)}% compared to the previous period. Review pricing strategy and distribution channels.`,
        priority: 'high'
      });
    } else {
      insights.push({
        type: 'info',
        title: 'Stable Revenue',
        message: `Revenue is stable with a ${revenueChange}% change. Market position is holding steady.`,
        priority: 'medium'
      });
    }

    // Expense analysis
    const expenseRatio = currentIncome > 0 ? (currentExpenses / currentIncome * 100).toFixed(1) : 0;
    if (expenseRatio > 80) {
      insights.push({
        type: 'critical',
        title: 'High Expense Ratio',
        message: `Expenses are ${expenseRatio}% of income. Profit margins are critically thin. Immediately review operational costs and identify areas to cut spending.`,
        priority: 'critical'
      });
    } else if (expenseRatio > 60) {
      insights.push({
        type: 'warning',
        title: 'Moderate Expense Ratio',
        message: `Expenses are ${expenseRatio}% of income. While manageable, look for optimization opportunities in supply chain and operations.`,
        priority: 'medium'
      });
    } else {
      insights.push({
        type: 'positive',
        title: 'Healthy Expense Ratio',
        message: `Expenses are ${expenseRatio}% of income. Profit margins are healthy. Consider reinvesting in growth.`,
        priority: 'low'
      });
    }

    // Production efficiency
    if (recentLogs.length > 0) {
      const avgProduction = recentLogs.reduce((sum, l) => sum + l.production, 0) / recentLogs.length;
      const avgDispatch = recentLogs.reduce((sum, l) => sum + l.dispatch, 0) / recentLogs.length;
      const dispatchRate = avgProduction > 0 ? (avgDispatch / avgProduction * 100).toFixed(1) : 0;
      const avgStock = recentLogs.reduce((sum, l) => sum + l.remainingStock, 0) / recentLogs.length;

      if (dispatchRate < 60) {
        insights.push({
          type: 'warning',
          title: 'Low Dispatch Rate',
          message: `Only ${dispatchRate}% of production is being dispatched. Stock is accumulating. Review distribution efficiency and expand sales channels.`,
          priority: 'high'
        });
      } else {
        insights.push({
          type: 'positive',
          title: 'Good Dispatch Rate',
          message: `${dispatchRate}% of production is being dispatched. Distribution is running efficiently.`,
          priority: 'low'
        });
      }

      if (avgStock > avgProduction * 3) {
        insights.push({
          type: 'warning',
          title: 'Stock Buildup',
          message: `Average remaining stock (${Math.round(avgStock)} units) is more than 3x daily production. Consider reducing production or boosting sales.`,
          priority: 'medium'
        });
      }

      // Forecast
      insights.push({
        type: 'info',
        title: 'Production Forecast',
        message: `At current rates, estimated weekly production: ${Math.round(avgProduction * 7)} units. Estimated weekly dispatch: ${Math.round(avgDispatch * 7)} units.`,
        priority: 'medium'
      });
    }

    // Cash flow projection
    const dailyNet = (currentIncome - currentExpenses) / 30;
    insights.push({
      type: dailyNet > 0 ? 'positive' : 'critical',
      title: 'Cash Flow Projection',
      message: dailyNet > 0
        ? `Projected 30-day surplus: GH₵${(dailyNet * 30).toFixed(2)}. Business is cash-flow positive.`
        : `Projected 30-day deficit: GH₵${Math.abs(dailyNet * 30).toFixed(2)}. Urgent action required to improve cash flow.`,
      priority: dailyNet > 0 ? 'low' : 'critical'
    });

    // Category breakdown
    const categorySpending = {};
    currentTransactions
      .filter(t => t.type === 'EXPENSE')
      .forEach(t => {
        categorySpending[t.category] = (categorySpending[t.category] || 0) + parseFloat(t.amount);
      });

    const topCategory = Object.entries(categorySpending).sort((a, b) => b[1] - a[1])[0];
    if (topCategory) {
      insights.push({
        type: 'info',
        title: 'Top Expense Category',
        message: `"${topCategory[0]}" is the largest expense category at GH₵${topCategory[1].toFixed(2)} (${(topCategory[1] / currentExpenses * 100).toFixed(1)}% of total expenses).`,
        priority: 'medium'
      });
    }

    res.json({
      insights,
      metrics: {
        currentIncome: parseFloat(currentIncome.toFixed(2)),
        currentExpenses: parseFloat(currentExpenses.toFixed(2)),
        previousIncome: parseFloat(previousIncome.toFixed(2)),
        previousExpenses: parseFloat(previousExpenses.toFixed(2)),
        revenueChange: parseFloat(revenueChange),
        expenseRatio: parseFloat(expenseRatio)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all transactions
// @route   GET /api/admin/transactions
const getTransactions = async (req, res) => {
  try {
    const { type, startDate, endDate } = req.query;
    const where = {};

    if (type) where.type = type;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: { admin: { select: { name: true, email: true } } },
      orderBy: { date: 'desc' }
    });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a transaction
// @route   POST /api/admin/transactions
const createTransaction = async (req, res) => {
  const { type, amount, category, description } = req.body;

  try {
    if (!type || !amount || !category) {
      return res.status(400).json({ message: 'Type, amount, and category are required' });
    }

    const transaction = await prisma.transaction.create({
      data: {
        type,
        amount: parseFloat(amount),
        category,
        description,
        adminId: req.user.id
      }
    });

    const { notifyAdmin } = require('../services/notificationService');
    await notifyAdmin(
      `New ${type} Transaction`,
      `${req.user.name || req.user.email} recorded a ${type} of GH₵${amount} in category "${category}".`,
      'TRANSACTION_CREATED',
      req.user.id
    );

    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDashboardStats, getAIInsights, getTransactions, createTransaction };
