
import { updateUserRoleService } from "../service/updateUserRole.service.js";

export const updateUserRoleController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const user = await updateUserRoleService(
      id,
      role,
      req.user.id
    );

    return res.status(200).json({
      success: true,
      message: "User role updated successfully",
      user,
    });
  } catch (error) {
    next(error);
  }
};
