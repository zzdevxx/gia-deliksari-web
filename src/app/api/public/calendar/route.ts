import { NextResponse } from 'next/server';
import {
  buildScheduleCalendar,
  buildServiceCalendar,
  calendarFilename,
} from '@/lib/ics';
import { serviceById, WEEKLY_SERVICES } from '@/lib/serviceSchedule';

/**
 * Calendar downloads for the weekly schedule.
 *
 * `/api/public/calendar` gives every service in one file. `?service=hana` gives
 * just that one, and `?service=hana,komsel-ekklesia` gives a pair: the HANA card
 * on `/info` describes two alternating services, so its time control has to be
 * able to hand over both or the download would silently drop half the card.
 *
 * Nothing here is private: it is the same schedule already printed on `/info`.
 */
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const param = new URL(request.url).searchParams.get('service');

  const requested = param
    ? [...new Set(param.split(',').map((s) => s.trim()).filter(Boolean))]
    : [];

  if (requested.length > 0) {
    const unknown = requested.filter((id) => !serviceById(id));
    if (unknown.length > 0) {
      return NextResponse.json(
        { error: 'Jadwal tidak ditemukan', unknown, available: WEEKLY_SERVICES.map((s) => s.id) },
        { status: 404 },
      );
    }
  }

  const now = new Date();
  const services = requested.length > 0
    ? requested.map((id) => serviceById(id)!)
    : WEEKLY_SERVICES;

  const body = services.length === 1
    ? buildServiceCalendar(services[0], { now })
    : buildScheduleCalendar(services, { now });

  const slug = requested.length > 0 ? requested.join('-') : 'jadwal-ibadah';

  return new NextResponse(body, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="${calendarFilename(slug)}"`,
      // Short cache only: the file embeds a start date computed at request time,
      // so a long TTL would eventually hand someone a calendar starting last month.
      'Cache-Control': 'public, max-age=300',
    },
  });
}
