
import {
  getDashboardStatsService,
} from '../service/getDashboardStats.service.js';

export const getDashboardStatsController = async (
  req,
  res,
  next
) => {
  try {
    const stats = await getDashboardStatsService(
      req.user.id
    );

    res.status(200).json({
      success: true,
      stats,
    });
  } catch (error) {
    next(error);
  }
};
