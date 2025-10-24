import { NextComponentType, NextPageContext } from "next";
import { useRouter } from "next/router";
import Head from "next/head";
import { useQuery } from "react-query";

import Pagination from "../common/Pagination";
import { List } from "./List";
import { PagedCollection } from "../../types/collection";
import { Event } from "../../types/Event";
import { fetch, FetchResponse, parsePage } from "../../utils/dataAccess";
import { useMercure } from "../../utils/mercure";

export const getEventsPath = (page?: string | string[] | undefined) =>
  `/events${typeof page === "string" ? `?page=${page}` : ""}`;
export const getEvents = (page?: string | string[] | undefined) => async () =>
  await fetch<PagedCollection<Event>>(getEventsPath(page));
const getPagePath = (path: string) =>
  `/events/page/${parsePage("events", path)}`;

export const PageList: NextComponentType<NextPageContext> = () => {
  const {
    query: { page },
  } = useRouter();
  const { data: { data: events, hubURL } = { hubURL: null } } = useQuery<
    FetchResponse<PagedCollection<Event>> | undefined
  >(getEventsPath(page), getEvents(page));
  const collection = useMercure(events, hubURL);

  if (!collection || !collection["hydra:member"]) return null;

  return (
    <div>
      <div>
        <Head>
          <title>Event List</title>
        </Head>
      </div>
      <List events={collection["hydra:member"]} />
      <Pagination collection={collection} getPagePath={getPagePath} />
    </div>
  );
};
