import { Resend } from "resend";
import { getTimeFromMinutes } from "../../utils.ts";
import type { Booking } from "../bookings/bookings.dba.ts";

const resend = new Resend(process.env.RESEND_API_KEY);

const from = process.env.EMAIL_FROM || "onboarding@resend.dev";

export async function sendEmail(booking: Booking) {
    const { data, error } = await resend.emails.send({
        from: from,
        to: [booking.guest_email],
        subject: "Table booking at Empanadas Blitz",
        html: `
            <p>Hi ${booking.guest_first_name},</p>
            <p>Thank you for booking with us!</p>
            <p>Please review your reservation details and click on the button link to confirm or cancel your reservation:</p>
            <ul>
                <li>Date: ${booking.booking_date}</li>
                <li>Time: ${getTimeFromMinutes(booking.booking_start_time).toString()}</li>
                <li>Attendees: ${booking.pax}</li>
            </ul>
            <p>
                <a
                    href="${process.env.FRONTEND_URL}/confirm/${booking.booking_secret}"
                    style="display: inline-block; padding: 10px 20px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 4px;"
                >
                    Manage your reservation
                </a>
            </p>
        `,
    });
}
