import { GetStaticPaths, GetStaticProps } from "next";
import { dehydrate, QueryClient } from "react-query";

import {
  PageList,
  getEvents,
  getEventsPath,
} from "../../../components/event/PageList";
import { PagedCollection } from "../../../types/collection";
import { Event } from "../../../types/Event";
import { fetch, getCollectionPaths } from "../../../utils/dataAccess";

export const getStaticProps: GetStaticProps = async ({
  params: { page } = {},
}) => {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery(getEventsPath(page), getEvents(page));

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
    revalidate: 1,
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const response = await fetch<PagedCollection<Event>>("/events");
  const paths = await getCollectionPaths(
    response,
    "events",
    "/events/page/[page]"
  );

  return {
    paths,
    fallback: true,
  };
};

export default PageList;
