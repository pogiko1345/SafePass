const express = require("express");
const {
  getAppointmentOptions,
  updateAppointmentOptions,
} = require("../services/appointmentOptionsService");

module.exports = ({ authMiddleware, requireRoles, createSystemActivity }) => {
  const router = express.Router();

  router.get("/appointments/options", authMiddleware, async (_req, res) => {
    try {
      const options = await getAppointmentOptions({ activeOnly: true });
      res.json({
        success: true,
        options,
      });
    } catch (error) {
      console.error("Get appointment options error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to load appointment options.",
      });
    }
  });

  router.get(
    "/admin/appointments/options",
    authMiddleware,
    requireRoles("admin"),
    async (_req, res) => {
      try {
        const options = await getAppointmentOptions();
        res.json({
          success: true,
          options,
        });
      } catch (error) {
        console.error("Get admin appointment options error:", error);
        res.status(500).json({
          success: false,
          message: "Failed to load appointment management options.",
        });
      }
    },
  );

  router.put(
    "/admin/appointments/options",
    authMiddleware,
    requireRoles("admin"),
    async (req, res) => {
      try {
        const options = await updateAppointmentOptions(req.body?.options || req.body || {});

        await createSystemActivity?.({
          actorUser: req.user,
          activityType: "admin_updated_appointment_options",
          status: "granted",
          location: "Appointment Management",
          notes: "Appointment request form options updated.",
          metadata: {
            officeCount: options.offices.length,
            purposeCount: options.purposes.length,
            timeSlotCount: options.timeSlots.length,
          },
        });

        res.json({
          success: true,
          message: "Appointment options updated successfully.",
          options,
        });
      } catch (error) {
        console.error("Update appointment options error:", error);
        res.status(500).json({
          success: false,
          message: "Failed to update appointment management options.",
        });
      }
    },
  );

  return router;
};
