import { FunctionComponent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Head from "next/head";

import ReferenceLinks from "../common/ReferenceLinks";
import { fetch, getItemPath } from "../../utils/dataAccess";
import { Event } from "../../types/Event";

interface Props {
  event: Event;
  text: string;
}

export const Show: FunctionComponent<Props> = ({ event, text }) => {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleDelete = async () => {
    if (!event["@id"]) return;
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      await fetch(event["@id"], { method: "DELETE" });
      router.push("/events");
    } catch (error) {
      setError("Error when deleting the resource.");
      console.error(error);
    }
  };

  return (
    <div className="p-4">
      <Head>
        <title>{`Show Event ${event["@id"]}`}</title>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: text }}
        />
      </Head>
      <Link
        href="/events"
        className="text-sm text-cyan-500 font-bold hover:text-cyan-700"
      >
        {"< Back to list"}
      </Link>
      <h1 className="text-3xl mb-2">{`Show Event ${event["@id"]}`}</h1>
      <table
        cellPadding={10}
        className="shadow-md table border-collapse min-w-full leading-normal table-auto text-left my-3"
      >
        <thead className="w-full text-xs uppercase font-light text-gray-700 bg-gray-200 py-2 px-4">
          <tr>
            <th>Field</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody className="text-sm divide-y divide-gray-200">
          <tr>
            <th scope="row">calendar</th>
            <td>
              <ReferenceLinks
                items={{
                  href: getItemPath(event["calendar"], "/calendars/[id]"),
                  name: event["calendar"],
                }}
              />
            </td>
          </tr>
          <tr>
            <th scope="row">startsAt</th>
            <td>{event["startsAt"]?.toLocaleString()}</td>
          </tr>
          <tr>
            <th scope="row">endsAt</th>
            <td>{event["endsAt"]?.toLocaleString()}</td>
          </tr>
          <tr>
            <th scope="row">title</th>
            <td>{event["title"]}</td>
          </tr>
          <tr>
            <th scope="row">timezone</th>
            <td>{event["timezone"]}</td>
          </tr>
          <tr>
            <th scope="row">allDay</th>
            <td>{event["allDay"]}</td>
          </tr>
          <tr>
            <th scope="row">duration</th>
            <td>{event["duration"]}</td>
          </tr>
          <tr>
            <th scope="row">rrule</th>
            <td>{event["rrule"]}</td>
          </tr>
          <tr>
            <th scope="row">exRule</th>
            <td>{event["exRule"]}</td>
          </tr>
          <tr>
            <th scope="row">exDates</th>
            <td>{event["exDates"]}</td>
          </tr>
          <tr>
            <th scope="row">organizer</th>
            <td>
              <ReferenceLinks
                items={{
                  href: getItemPath(event["organizer"], "/users/[id]"),
                  name: event["organizer"],
                }}
              />
            </td>
          </tr>
          <tr>
            <th scope="row">attendees</th>
            <td>
              <ReferenceLinks
                items={event["attendees"].map((ref: any) => ({
                  href: getItemPath(ref, "/users/[id]"),
                  name: ref,
                }))}
              />
            </td>
          </tr>
          <tr>
            <th scope="row">description</th>
            <td>{event["description"]}</td>
          </tr>
          <tr>
            <th scope="row">location</th>
            <td>{event["location"]}</td>
          </tr>
          <tr>
            <th scope="row">latLng</th>
            <td>{event["latLng"]}</td>
          </tr>
          <tr>
            <th scope="row">conferenceUrl</th>
            <td>{event["conferenceUrl"]}</td>
          </tr>
          <tr>
            <th scope="row">status</th>
            <td>{event["status"]}</td>
          </tr>
          <tr>
            <th scope="row">private</th>
            <td>{event["private"]}</td>
          </tr>
          <tr>
            <th scope="row">createdAt</th>
            <td>{event["createdAt"]?.toLocaleString()}</td>
          </tr>
          <tr>
            <th scope="row">updatedAt</th>
            <td>{event["updatedAt"]?.toLocaleString()}</td>
          </tr>
        </tbody>
      </table>
      {error && (
        <div
          className="border px-4 py-3 my-4 rounded text-red-700 border-red-400 bg-red-100"
          role="alert"
        >
          {error}
        </div>
      )}
      <div className="flex space-x-2 mt-4 items-center justify-end">
        <Link
          href={getItemPath(event["@id"], "/events/[id]/edit")}
          className="inline-block mt-2 border-2 border-cyan-500 bg-cyan-500 hover:border-cyan-700 hover:bg-cyan-700 text-xs text-white font-bold py-2 px-4 rounded"
        >
          Edit
        </Link>
        <button
          className="inline-block mt-2 border-2 border-red-400 hover:border-red-700 hover:text-red-700 text-xs text-red-400 font-bold py-2 px-4 rounded"
          onClick={handleDelete}
        >
          Delete
        </button>
      </div>
    </div>
  );
};
