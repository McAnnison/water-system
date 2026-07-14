const prisma = require('../lib/prisma');
const { notifyAdmin } = require('../services/notificationService');

const isInvalidQuantity = (value) =>
  value !== undefined && (!Number.isInteger(value) || value < 0);

// @desc    Get all daily logs
// @route   GET /api/logs
const getDailyLogs = async (req, res) => {
  try {
    const logs = await prisma.dailyLog.findMany({
      include: {
        staff: { select: { name: true, email: true, role: true } }
      },
      orderBy: { date: 'desc' }
    });
    res.json(logs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// @desc    Create a daily log
// @route   POST /api/logs
const createDailyLog = async (req, res) => {
  const { openingStock, production, dispatch } = req.body;

  if ([openingStock, production, dispatch].some(isInvalidQuantity)) {
    return res.status(400).json({ message: 'Stock values must be non-negative integers' });
  }

  try {
    const totalInStock = (openingStock || 0) + (production || 0);
    const remainingStock = totalInStock - (dispatch || 0);

    const log = await prisma.dailyLog.create({
      data: {
        openingStock: openingStock || 0,
        production: production || 0,
        totalInStock,
        dispatch: dispatch || 0,
        remainingStock,
        staffId: req.user.id
      },
      include: {
        staff: { select: { name: true, email: true } }
      }
    });

    await notifyAdmin(
      'New Daily Log Entry',
      `${req.user.name || req.user.email} submitted a daily log: Production: ${production}, Dispatch: ${dispatch}, Remaining: ${remainingStock}.`,
      'LOG_CREATED',
      req.user.id
    );

    res.status(201).json(log);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'A log entry for today already exists' });
    }
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// @desc    Update a daily log
// @route   PUT /api/logs/:id
const updateDailyLog = async (req, res) => {
  const { id } = req.params;
  const { openingStock, production, dispatch } = req.body;

  if ([openingStock, production, dispatch].some(isInvalidQuantity)) {
    return res.status(400).json({ message: 'Stock values must be non-negative integers' });
  }

  try {
    const existing = await prisma.dailyLog.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: 'Log not found' });
    if (existing.isLocked) return res.status(403).json({ message: 'Log is locked and cannot be modified' });

    const totalInStock = (openingStock ?? existing.openingStock) + (production ?? existing.production);
    const remainingStock = totalInStock - (dispatch ?? existing.dispatch);

    const log = await prisma.dailyLog.update({
      where: { id },
      data: {
        openingStock: openingStock ?? existing.openingStock,
        production: production ?? existing.production,
        totalInStock,
        dispatch: dispatch ?? existing.dispatch,
        remainingStock
      }
    });

    await notifyAdmin(
      'Daily Log Updated',
      `${req.user.name || req.user.email} updated daily log for ${existing.date.toISOString().split('T')[0]}.`,
      'LOG_UPDATED',
      req.user.id
    );

    res.json(log);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// @desc    Lock/Unlock a daily log
// @route   PATCH /api/logs/:id/lock
const toggleLockLog = async (req, res) => {
  const { id } = req.params;

  try {
    const existing = await prisma.dailyLog.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: 'Log not found' });

    const log = await prisma.dailyLog.update({
      where: { id },
      data: {
        isLocked: !existing.isLocked,
        lockedAt: !existing.isLocked ? new Date() : null,
        unlockedBy: existing.isLocked ? req.user.id : null
      }
    });

    const action = log.isLocked ? 'locked' : 'unlocked';
    await notifyAdmin(
      `Daily Log ${action.charAt(0).toUpperCase() + action.slice(1)}`,
      `${req.user.name || req.user.email} ${action} the daily log for ${existing.date.toISOString().split('T')[0]}.`,
      'LOG_LOCK_TOGGLED',
      req.user.id
    );

    res.json(log);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// @desc    Get production stats for factory supervisor
// @route   GET /api/logs/production-stats
const getProductionStats = async (req, res) => {
  try {
    const sevenDaysAgo = new Date(new Date().setDate(new Date().getDate() - 7));
    const thirtyDaysAgo = new Date(new Date().setDate(new Date().getDate() - 30));

    const weeklyLogs = await prisma.dailyLog.findMany({
      where: { date: { gte: sevenDaysAgo } },
      orderBy: { date: 'asc' }
    });

    const monthlyLogs = await prisma.dailyLog.findMany({
      where: { date: { gte: thirtyDaysAgo } },
      orderBy: { date: 'asc' }
    });

    const weeklyProduction = weeklyLogs.reduce((sum, l) => sum + l.production, 0);
    const weeklyDispatch = weeklyLogs.reduce((sum, l) => sum + l.dispatch, 0);
    const monthlyProduction = monthlyLogs.reduce((sum, l) => sum + l.production, 0);
    const monthlyDispatch = monthlyLogs.reduce((sum, l) => sum + l.dispatch, 0);

    const latestLog = weeklyLogs[weeklyLogs.length - 1];
    const currentStock = latestLog ? latestLog.remainingStock : 0;

    const productionChart = monthlyLogs.map(log => ({
      date: log.date.toISOString().split('T')[0],
      production: log.production,
      dispatch: log.dispatch,
      stock: log.remainingStock
    }));

    const efficiencyRate = weeklyProduction > 0
      ? parseFloat((weeklyDispatch / weeklyProduction * 100).toFixed(1))
      : 0;

    res.json({
      weekly: { production: weeklyProduction, dispatch: weeklyDispatch },
      monthly: { production: monthlyProduction, dispatch: monthlyDispatch },
      currentStock,
      efficiencyRate,
      productionChart,
      recentLogs: weeklyLogs.reverse()
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { getDailyLogs, createDailyLog, updateDailyLog, toggleLockLog, getProductionStats };
