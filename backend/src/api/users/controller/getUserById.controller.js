
import { getUserByIdService } from "../service/getUserById.service.js";

export const getUserByIdController = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await getUserByIdService(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User retrieved successfully",
      user,
    });
  } catch (error) {
    next(error);
  }
};
