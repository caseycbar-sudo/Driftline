import { getEvent } from "../db/schedule";
import type { SessionRequest } from "../db/requests";

/** What the customer may see of a request: the visit's time and chef's first name only once a chef has accepted. */
export async function customerView(request: SessionRequest) {
  let visit = null;
  if (request.scheduleEventId && ["scheduled", "change_requested"].includes(request.status)) {
    const event = await getEvent(request.scheduleEventId);
    if (event && event.status !== "cancelled") {
      visit = {
        id: event.id,
        serviceDate: event.serviceDate,
        startTime: event.startTime,
        endTime: event.endTime,
        chefFirstName: event.chef.split(/\s+/)[0] || "",
        status: event.status,
      };
    }
  }
  const { customerEmail: _e, scheduleEventId: _s, remindedAt: _r, ...safe } = request;
  return { ...safe, visit };
}
