// File: /app/events/page.tsx

import React from "react";
import { client } from "@/sanity/client";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import Link from "next/link";
import Image from "next/image";
import { Event } from "../types";
import { PageHeader } from "../components/PageHeader/PageHeader";

const EVENTS_QUERY = `*[_type == "event"] {
  _id,
  name,
  slug,
  coverImage,
  startDate,
  endDate,
}`;

const { projectId, dataset } = client.config();
const urlFor = (source: SanityImageSource) =>
  projectId && dataset
    ? imageUrlBuilder({ projectId, dataset }).image(source)
    : null;

export default async function EventsPage() {
  const events = await client.fetch(EVENTS_QUERY);

  // Get today's date (no time)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Separate upcoming and past events based on endDate
  const upcomingEvents = events
    .filter((event: Event) => new Date(event.endDate) >= today)
    .sort(
      (a: Event, b: Event) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );

  const pastEvents = events
    .filter((event: Event) => new Date(event.endDate) < today)
    .sort(
      (a: Event, b: Event) =>
        new Date(b.endDate).getTime() - new Date(a.endDate).getTime()
    ); // Most recent past events first

  function renderEventList(eventList: Event[]) {
    if (eventList.length === 0) {
      return <p className="text-gray-600">No events found.</p>;
    }

    return (
      <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {eventList.map((event: Event) => {
          const coverUrl = event.coverImage
            ? urlFor(event.coverImage)?.width(600)?.height(400)?.url()
            : null;

          return (
            <li
              key={event._id}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden"
            >
              <Link
                href={`/events/${event.slug.current}`}
                className="block focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {coverUrl && (
                  <Image
                    src={coverUrl}
                    alt={event.name}
                    width={600}
                    height={400}
                    className="w-full object-cover"
                    placeholder="blur"
                    blurDataURL={
                      urlFor(event.coverImage)
                        ?.width(20)
                        ?.height(14)
                        ?.blur(10)
                        ?.url() || undefined
                    }
                    priority={false}
                    style={{ objectFit: "cover" }}
                  />
                )}

                <div className="p-4">
                  <h2 className="text-xl font-semibold mb-2">{event.name}</h2>
                  <p className="text-gray-600 mb-1">
                    Start: {new Date(event.startDate).toLocaleDateString()}
                  </p>
                  <p className="text-gray-600">
                    End: {new Date(event.endDate).toLocaleDateString()}
                  </p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <main className="container mx-auto min-h-screen max-w-5xl p-8">
      <PageHeader title="Events" />

      <section className="mb-12">
        <h2 className="text-3xl font-semibold mb-6">Upcoming Events</h2>
        {renderEventList(upcomingEvents)}
      </section>

      <section>
        <h2 className="text-3xl font-semibold mb-6">Past Events</h2>
        {renderEventList(pastEvents)}
      </section>
    </main>
  );
}
