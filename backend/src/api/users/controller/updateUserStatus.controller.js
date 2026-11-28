
import { updateUserStatusService } from "../service/updateUserStatus.service.js";

export const updateUserStatusController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const user = await updateUserStatusService(
      id,
      status,
      req.user.id
    );

    return res.status(200).json({
      success: true,
      message: "User status updated successfully",
      user,
    });
  } catch (error) {
    next(error);
  }
};
