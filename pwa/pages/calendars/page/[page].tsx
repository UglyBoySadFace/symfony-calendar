import { GetStaticPaths, GetStaticProps } from "next";
import { dehydrate, QueryClient } from "react-query";

import {
  PageList,
  getCalendars,
  getCalendarsPath,
} from "../../../components/calendar/PageList";
import { PagedCollection } from "../../../types/collection";
import { Calendar } from "../../../types/Calendar";
import { fetch, getCollectionPaths } from "../../../utils/dataAccess";

export const getStaticProps: GetStaticProps = async ({
  params: { page } = {},
}) => {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery(getCalendarsPath(page), getCalendars(page));

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
    revalidate: 1,
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const response = await fetch<PagedCollection<Calendar>>("/calendars");
  const paths = await getCollectionPaths(
    response,
    "calendars",
    "/calendars/page/[page]"
  );

  return {
    paths,
    fallback: true,
  };
};

export default PageList;
