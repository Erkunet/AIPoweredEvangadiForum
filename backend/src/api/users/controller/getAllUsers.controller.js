
import { getAllUsersService } from "../service/getAllUsers.service.js";

export const getAllUsersController = async (req, res, next) => {
  try {
    const { role, status, search } = req.query;

    const users = await getAllUsersService({
      role,
      status,
      search,
    });

    return res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      count: users.length,
      users,
    });
  } catch (error) {
    next(error);
  }
};
