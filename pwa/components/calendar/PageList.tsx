import { NextComponentType, NextPageContext } from "next";
import { useRouter } from "next/router";
import Head from "next/head";
import { useQuery } from "react-query";

import Pagination from "../common/Pagination";
import { List } from "./List";
import { PagedCollection } from "../../types/collection";
import { Calendar } from "../../types/Calendar";
import { fetch, FetchResponse, parsePage } from "../../utils/dataAccess";
import { useMercure } from "../../utils/mercure";

export const getCalendarsPath = (page?: string | string[] | undefined) =>
  `/calendars${typeof page === "string" ? `?page=${page}` : ""}`;
export const getCalendars =
  (page?: string | string[] | undefined) => async () =>
    await fetch<PagedCollection<Calendar>>(getCalendarsPath(page));
const getPagePath = (path: string) =>
  `/calendars/page/${parsePage("calendars", path)}`;

export const PageList: NextComponentType<NextPageContext> = () => {
  const {
    query: { page },
  } = useRouter();
  const { data: { data: calendars, hubURL } = { hubURL: null } } = useQuery<
    FetchResponse<PagedCollection<Calendar>> | undefined
  >(getCalendarsPath(page), getCalendars(page));
  const collection = useMercure(calendars, hubURL);

  if (!collection || !collection["hydra:member"]) return null;

  return (
    <div>
      <div>
        <Head>
          <title>Calendar List</title>
        </Head>
      </div>
      <List calendars={collection["hydra:member"]} />
      <Pagination collection={collection} getPagePath={getPagePath} />
    </div>
  );
};
