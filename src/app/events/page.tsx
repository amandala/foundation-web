// File: /app/events/page.tsx

import React from "react";
import { client } from "@/sanity/client";
import { urlFor } from "@/sanity/image";
import Link from "next/link";
import Image from "next/image";
import { Event } from "../types";
import { PageHeader } from "../components/PageHeader/PageHeader";
import type { Metadata } from "next";
import { createShareMetadata } from "../share-metadata";

export const metadata: Metadata = createShareMetadata({
  title: "Events",
  description: "Explore upcoming and past Foundation Collective events in Calgary.",
  path: "/events",
});

const EVENTS_QUERY = `*[_type == "event"] {
  _id,
  name,
  slug,
  coverImage,
  startDate,
  endDate,
}`;

export default async function EventsPage() {
  const events = await client.fetch(EVENTS_QUERY, {}, { cache: "no-store" });

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
      <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {eventList.map((event: Event) => {
          const coverUrl = event.coverImage
            ? urlFor(event.coverImage)?.width(400)?.auto("format")?.url()
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
                    width={400}
                    height={600}
                    className="w-full h-auto"
                    placeholder="blur"
                    blurDataURL={
                      urlFor(event.coverImage)
                        ?.width(20)
                        ?.height(30)
                        ?.blur(10)
                        ?.url() || undefined
                    }
                    priority={false}
                  />
                )}

                <div className="px-3 pt-2 pb-1">
                  <h2 className="text-base font-semibold mb-1">{event.name}</h2>
                  <p className="text-gray-600 text-sm leading-tight !mb-0">
                    {new Date(event.startDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                    {" — "}
                    {new Date(event.endDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
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
      <PageHeader title="Events" imageSrc="/events.png" />

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
