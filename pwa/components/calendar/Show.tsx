import { FunctionComponent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Head from "next/head";

import ReferenceLinks from "../common/ReferenceLinks";
import { fetch, getItemPath } from "../../utils/dataAccess";
import { Calendar } from "../../types/Calendar";

interface Props {
  calendar: Calendar;
  text: string;
}

export const Show: FunctionComponent<Props> = ({ calendar, text }) => {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleDelete = async () => {
    if (!calendar["@id"]) return;
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      await fetch(calendar["@id"], { method: "DELETE" });
      router.push("/calendars");
    } catch (error) {
      setError("Error when deleting the resource.");
      console.error(error);
    }
  };

  return (
    <div className="p-4">
      <Head>
        <title>{`Show Calendar ${calendar["@id"]}`}</title>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: text }}
        />
      </Head>
      <Link
        href="/calendars"
        className="text-sm text-cyan-500 font-bold hover:text-cyan-700"
      >
        {"< Back to list"}
      </Link>
      <h1 className="text-3xl mb-2">{`Show Calendar ${calendar["@id"]}`}</h1>
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
            <th scope="row">title</th>
            <td>{calendar["title"]}</td>
          </tr>
          <tr>
            <th scope="row">color</th>
            <td>{calendar["color"]}</td>
          </tr>
          <tr>
            <th scope="row">timezone</th>
            <td>{calendar["timezone"]}</td>
          </tr>
          <tr>
            <th scope="row">description</th>
            <td>{calendar["description"]}</td>
          </tr>
          <tr>
            <th scope="row">members</th>
            <td>
              <ReferenceLinks
                items={calendar["members"].map((ref: any) => ({
                  href: getItemPath(ref, "/users/[id]"),
                  name: ref,
                }))}
              />
            </td>
          </tr>
          <tr>
            <th scope="row">slug</th>
            <td>{calendar["slug"]}</td>
          </tr>
          <tr>
            <th scope="row">owner</th>
            <td>
              <ReferenceLinks
                items={{
                  href: getItemPath(calendar["owner"], "/users/[id]"),
                  name: calendar["owner"],
                }}
              />
            </td>
          </tr>
          <tr>
            <th scope="row">events</th>
            <td>
              <ReferenceLinks
                items={calendar["events"].map((ref: any) => ({
                  href: getItemPath(ref, "/events/[id]"),
                  name: ref,
                }))}
              />
            </td>
          </tr>
          <tr>
            <th scope="row">createdAt</th>
            <td>{calendar["createdAt"]?.toLocaleString()}</td>
          </tr>
          <tr>
            <th scope="row">updatedAt</th>
            <td>{calendar["updatedAt"]?.toLocaleString()}</td>
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
          href={getItemPath(calendar["@id"], "/calendars/[id]/edit")}
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
